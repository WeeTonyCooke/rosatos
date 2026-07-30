// Generates responsive WebP + compressed-fallback variants for the large
// image assets (pint.jpg, room.jpg, hero.png). Run manually with:
//   node scripts/optimize-images.mjs
// then update the JSX <img> tags to <picture> with the generated srcsets
// (already done for Pint.jsx / Room.jsx / Hero.jsx).
//
// HERO: an earlier version of this script skipped hero.png on the assumption
// that flat vector-style artwork wouldn't benefit from WebP. That assumption
// was wrong and worth recording, because it left the single largest asset on
// the page unoptimised while the two photos got the full treatment. Measured:
//   hero.png original          815KB
//   hero-736.webp  (q90)        51KB   ← the size it actually renders at
//   hero-1463.webp (q90)       121KB
// A 94% cut on the LCP element. Flat artwork compresses *better* than
// photography in WebP, not worse — large areas of uniform colour are exactly
// what it handles well. Don't re-derive this: measure before excluding.
//
// hero.png keeps an alpha channel, so its fallback is a palette PNG rather
// than JPEG, and it is NOT colour-graded (see below) — the grade is a
// photographic correction and would visibly shift the brand artwork.
//
// logo.png (38KB) is genuinely not worth a pipeline at its size.
//
// COLOR GRADE: the two source photos (pint.jpg, room.jpg) are un-graded
// phone snapshots — different white balance/mood from the site's own
// palette (cream #f3eee6, forest #0f3a31, brass #b68a42). A gentle warm
// channel shift + slight desaturation nudges them toward that palette
// without looking processed. This is deliberately subtle — the goal is
// "feels like it belongs on this page," not a heavy filter.

import { statSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Sources live OUTSIDE public/ so they aren't deployed. They used to sit in
// public/images alongside the generated variants, which meant every deploy
// shipped ~3.8MB of originals (pint.jpg alone is 2.7MB) that no page ever
// requests — the components reference only the variants.
const sourceDir = path.join(__dirname, '..', 'assets', 'source')
const imagesDir = path.join(__dirname, '..', 'public', 'images')

// [filename, output basename, widths to generate]
// kind: 'photo' → colour-graded, JPEG fallback
//       'art'   → ungraded, palette-PNG fallback (preserves transparency)
const TARGETS = [
  { file: 'pint.jpg', base: 'pint', widths: [480, 900, 1200], kind: 'photo' },
  { file: 'room.jpg', base: 'room', widths: [480, 900, 1400], kind: 'photo' },
  { file: 'hero.png', base: 'hero', widths: [736, 1104, 1463], kind: 'art' },
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

async function processImage({ file, base, widths, kind }) {
  const inputPath = path.join(sourceDir, file)
  const originalSize = statSync(inputPath).size
  console.log(`\n${file} (original: ${humanKB(originalSize)}, ${kind})`)

  const isArt = kind === 'art'

  for (const width of widths) {
    const webpPath = path.join(imagesDir, `${base}-${width}.webp`)
    const fallbackExt = isArt ? 'png' : 'jpg'
    const fallbackPath = path.join(imagesDir, `${base}-${width}.${fallbackExt}`)

    // Brand artwork is passed through ungraded; the grade is a photographic
    // white-balance correction and would visibly shift the illustration.
    const prep = () => {
      const resized = sharp(inputPath).resize({ width })
      return isArt ? resized : grade(resized)
    }

    await prep()
      .webp(isArt ? { quality: 90 } : { quality: 78 })
      .toFile(webpPath)

    if (isArt) {
      // Palette PNG keeps the alpha channel the artwork depends on.
      await prep().png({ compressionLevel: 9, palette: true }).toFile(fallbackPath)
    } else {
      await prep().jpeg({ quality: 78, mozjpeg: true }).toFile(fallbackPath)
    }

    const webpSize = statSync(webpPath).size
    const fallbackSize = statSync(fallbackPath).size
    console.log(
      `  ${width}w  webp: ${humanKB(webpSize)}   ${fallbackExt}: ${humanKB(fallbackSize)}`,
    )
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

