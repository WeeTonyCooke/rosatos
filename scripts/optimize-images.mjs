// Generates responsive WebP + compressed-fallback variants for the large
// photographic assets (pint.jpg, room.jpg). Run manually with:
//   node scripts/optimize-images.mjs
// then update the JSX <img> tags to <picture> with the generated srcsets
// (already done for Pint.jsx / Room.jsx in this pass).
//
// hero.png and logo.png are left alone: they're flat vector-style brand
// artwork with transparency, not photography — WebP/multi-size variants
// don't meaningfully shrink them and aren't the weight problem on this page.
//
// COLOR GRADE: the two source photos (pint.jpg, room.jpg) are un-graded
// phone snapshots — different white balance/mood from the site's own
// palette (cream #f3eee6, forest #0f3a31, brass #b68a42). A gentle warm
// channel shift + slight desaturation nudges them toward that palette
// without looking processed. This is deliberately subtle — the goal is
// "feels like it belongs on this page," not a heavy filter.

import { readdirSync, statSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.join(__dirname, '..', 'public', 'images')

// [filename, output basename, widths to generate]
const TARGETS = [
  { file: 'pint.jpg', base: 'pint', widths: [480, 900, 1200] },
  { file: 'room.jpg', base: 'room', widths: [480, 900, 1400] },
]

function humanKB(bytes) {
  return `${(bytes / 1024).toFixed(0)}KB`
}

function grade(image) {
  return image
    // Slight desaturation calms the oversaturated look typical of phone
    // camera JPEGs, and a small brightness lift keeps them from reading
    // dark next to the site's light cream background.
    .modulate({ saturation: 0.93, brightness: 1.03 })
    // Gentle per-channel push: warm the reds/yellows up a touch, cool the
    // blues down a touch — nudges toward brass/cream rather than a
    // neutral or cool white balance.
    .linear([1.04, 1.0, 0.95], [2, 0, -2])
}

async function processImage({ file, base, widths }) {
  const inputPath = path.join(imagesDir, file)
  const originalSize = statSync(inputPath).size
  console.log(`\n${file} (original: ${humanKB(originalSize)})`)

  for (const width of widths) {
    const webpPath = path.join(imagesDir, `${base}-${width}.webp`)
    const jpgPath = path.join(imagesDir, `${base}-${width}.jpg`)

    await grade(sharp(inputPath).resize({ width })).webp({ quality: 78 }).toFile(webpPath)
    await grade(sharp(inputPath).resize({ width })).jpeg({ quality: 78, mozjpeg: true }).toFile(jpgPath)

    const webpSize = statSync(webpPath).size
    const jpgSize = statSync(jpgPath).size
    console.log(`  ${width}w  webp: ${humanKB(webpSize)}   jpg: ${humanKB(jpgSize)}`)
  }
}

async function main() {
  mkdirSync(imagesDir, { recursive: true })
  for (const target of TARGETS) {
    await processImage(target)
  }
  console.log('\nDone. Update <img> markup to <picture> with srcset — see Pint.jsx / Room.jsx.')
}

main().catch((err) => {
  console.error('[optimize-images] failed:', err)
  process.exitCode = 1
})

