// Generates responsive WebP + compressed-fallback variants for the site's
// image assets. Run manually with:
//   node scripts/optimize-images.mjs
// Components read widths from the generated manifest via Photo.jsx — they
// never hardcode a srcset.
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
// COLOR GRADE: `graded: true` applies a gentle warm channel shift for raw,
// un-graded phone snapshots. Nothing currently uses it — every venue photo is
// either a camera original the venue already processed, or brand artwork. Left
// in because the next batch of raw files will want it; see the `graded` note
// on TARGETS for why it must stay off for processed sources.

import { statSync, mkdirSync, writeFileSync } from 'node:fs'
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
const manifestPath = path.join(__dirname, '..', 'src', 'lib', 'image-manifest.json')

// [filename, output basename, widths to generate]
// kind: 'photo' → JPEG fallback
//       'art'   → palette-PNG fallback (preserves transparency)
// graded: apply the warm channel shift. Only for raw, un-graded camera files.
//         The venue's own Instagram exports are already processed — running the
//         grade over them a second time overcooks the reds badly.
//
// STRAIGHTENING: pizzas.jpg was shot with a ~2.5 degree roll. Corrected in the
// source file (1086x1448 -> 1025x1367), not here, because rotation needs an
// inset crop to remove the black corner wedges and that costs pixels — doing it
// once at the source keeps the loss to a single pass.
//
// Measure roll from VERTICAL features, not horizontal ones. The first attempt
// read the back wall's plank edges, got the sign backwards, and shipped an
// image tilted further than the original. That wall recedes in perspective, so
// its "horizontals" aren't horizontal. The corner posts are genuinely plumb in
// the world, so their lean is the roll. Then verify by sweeping the rotation
// and re-measuring residual at each step rather than trusting one number.
//
// VENUE PHOTOS: a mix of camera originals and Instagram exports, being
// upgraded to originals over time. Ask for the full width ladder regardless —
// processImage drops any width the source can't actually supply, and the run
// log lists everything still coming from a sub-1000px source. Drop a better
// original in under the same filename and re-run; the manifest and the markup
// follow automatically.
const TARGETS = [
  { file: 'hero.png', base: 'hero', widths: [736, 1104, 1463], kind: 'art', graded: false },

  ...[
    'haddock',
    'pizzas',
    'guinness',
    'prawns',
    'exterior-dusk',
    'exterior-day',
    'salmon-mash',
    'pizza-club',
    'fire',
    'cocktail',
    'music-snug',
    'music-mono',
    'hake-noodles',
    'fish-noodles',
  ].map((name) => ({
    file: `photos/${name}.jpg`,
    base: name,
    widths: [480, 900, 1400],
    kind: 'photo',
    graded: false,
  })),

  // What's On pairs two live-music shots side by side, so they need a shared
  // landscape aspect — mixing 4:5 and 4:3 in one row looks like an accident.
  //
  // `position` is set per image rather than left to sharp's attention
  // strategy. On music-snug, attention locked onto the lit Heineken sign and
  // the wall lamp and cropped the singer down to a sliver at the bottom edge;
  // anchoring to the bottom keeps her and the stonework. On music-mono the
  // subject is isolated against black, which is exactly the case attention
  // handles well.
  {
    file: 'photos/music-snug.jpg',
    base: 'music-snug-wide',
    widths: [480, 900, 1320],
    kind: 'photo',
    graded: false,
    crop: { aspect: 4 / 3, position: 'bottom' },
  },
  {
    file: 'photos/music-mono.jpg',
    base: 'music-mono-wide',
    widths: [480, 900, 1320],
    kind: 'photo',
    graded: false,
    crop: { aspect: 4 / 3, position: 'attention' },
  },

  // NOT rendered by any section — this is the og:image, and it must keep
  // being generated.
  //
  // It began as the menu's full-bleed band and was cut from the page: once the
  // page went two-tone, the green sections did the chapter-break job the band
  // had been doing, and a second full-bleed element on top of them was one
  // interruption too many. The 2:1 crop survives because link previews render
  // at roughly 1.91:1, so it is the right shape for exactly that job and
  // nothing else. Deleting it silently breaks every shared link.
  {
    file: 'photos/exterior-dusk.jpg',
    base: 'exterior-dusk-band',
    widths: [640, 1100, 1400],
    kind: 'photo',
    graded: false,
    crop: { aspect: 2, position: 'centre' },
  },
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

async function processImage({ file, base, widths, kind, graded, crop }) {
  const inputPath = path.join(sourceDir, file)
  const originalSize = statSync(inputPath).size
  const meta = await sharp(inputPath).metadata()

  // Only generate widths the source can actually supply.
  //
  // The alternative — asking for 1200w from a 600px source with
  // withoutEnlargement — writes a file *named* `-1200` that is really 600px
  // wide. srcset takes those names as a promise about pixel width, so the
  // browser picks the "1200w" file for a 1200px slot, gets 600px of image,
  // and has no way to know it was lied to. Filtering here keeps the filename
  // and the actual width in agreement.
  const usable = widths.filter((w) => w <= meta.width)
  if (!usable.length) usable.push(meta.width)
  const skipped = widths.filter((w) => w > meta.width)

  console.log(
    `\n${file} → ${base} (${meta.width}x${meta.height}, ${humanKB(originalSize)}, ${kind}${graded ? ', graded' : ''}${crop ? ', cropped' : ''})`,
  )
  if (skipped.length) {
    console.log(`  ! source too small for ${skipped.join('w, ')}w — skipped, no upscaling`)
  }

  const isArt = kind === 'art'
  const produced = []

  for (const width of usable) {
    const webpPath = path.join(imagesDir, `${base}-${width}.webp`)
    const fallbackExt = isArt ? 'png' : 'jpg'
    const fallbackPath = path.join(imagesDir, `${base}-${width}.${fallbackExt}`)

    const prep = () => {
      let pipeline = sharp(inputPath)
      if (crop) {
        pipeline = pipeline.resize({
          width,
          height: Math.round(width / crop.aspect),
          fit: 'cover',
          position: crop.position === 'attention' ? sharp.strategy.attention : crop.position,
        })
      } else {
        pipeline = pipeline.resize({ width })
      }
      return graded ? grade(pipeline) : pipeline
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
    produced.push(width)
  }

  return {
    base,
    ext: isArt ? 'png' : 'jpg',
    widths: produced,
    sourceWidth: meta.width,
    // Flagged so the site can be audited for images still coming from
    // low-resolution sources without anyone having to remember which is which.
    lowRes: meta.width < 1000,
  }
}

async function main() {
  mkdirSync(imagesDir, { recursive: true })

  const manifest = {}
  for (const target of TARGETS) {
    const entry = await processImage(target)
    manifest[entry.base] = entry
  }

  // The manifest is what the components build srcset from, rather than widths
  // hand-copied into content JSON. Swapping a low-res source for a camera
  // original then upgrades the markup by re-running this script — no hunting
  // through JSX and JSON for stale numbers, and no way for the two to drift.
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  const lowRes = Object.values(manifest).filter((entry) => entry.lowRes)
  console.log(`\nWrote ${path.relative(path.join(__dirname, '..'), manifestPath)}`)
  if (lowRes.length) {
    console.log(`\n${lowRes.length} image(s) still from sources under 1000px — replace when originals are available:`)
    for (const entry of lowRes) {
      console.log(`  ${entry.base.padEnd(20)} ${entry.sourceWidth}px`)
    }
  }
}

main().catch((err) => {
  console.error('[optimize-images] failed:', err)
  process.exitCode = 1
})

