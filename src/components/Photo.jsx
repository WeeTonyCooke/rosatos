import manifest from '../lib/image-manifest.json'

/**
 * Renders a <picture> from the manifest that scripts/optimize-images.mjs
 * writes, rather than from widths typed into content JSON or JSX.
 *
 * The widths used to be written by hand in two places. That was fine while
 * every photo came from the same 600px source, and became a trap the moment
 * camera originals started replacing them: the markup kept advertising the old
 * sizes, so the browser never requested the larger files that now existed, and
 * nothing anywhere reported a problem. Reading the manifest means re-running
 * the image script is the whole update.
 *
 * An unknown `base` renders nothing rather than a broken image — a photo
 * removed from the pipeline shouldn't leave a torn placeholder on the page.
 */
export function Photo({ base, alt = '', sizes, className, loading = 'lazy', fetchPriority }) {
  const entry = manifest[base]
  if (!entry || !entry.widths.length) {
    if (import.meta.env.DEV) {
      console.warn(`[Photo] no manifest entry for "${base}" — run scripts/optimize-images.mjs`)
    }
    return null
  }

  const { widths, ext } = entry
  const largest = widths[widths.length - 1]
  const srcSet = (extension) =>
    widths.map((width) => `/images/${base}-${width}.${extension} ${width}w`).join(', ')

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        className={className}
        src={`/images/${base}-${largest}.${ext}`}
        srcSet={srcSet(ext)}
        sizes={sizes}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
      />
    </picture>
  )
}
