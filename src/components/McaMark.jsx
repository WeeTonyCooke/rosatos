/**
 * The MCA studio mark, inlined rather than served as a file.
 *
 * Two files (one dark, one light) is the usual way, and it's what
 * movillefestival.com does — it has a light footer, so it only ever needs the
 * dark one. Rosato's footer is forest green, so it would need the opposite
 * file, and a template reused for another venue would need whichever suits
 * that venue's footer.
 *
 * `fill="currentColor"` sidesteps that: inlined, it takes the colour of the
 * text beside it, so the mark and the words it belongs to can never drift
 * apart, and it works on any ground without a second asset. Same reasoning as
 * the focus ring — inherit the contrast that's already been solved rather than
 * pick a value that only holds in one place.
 *
 * aria-hidden because the anchor around it carries the accessible name.
 */
export function McaMark({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1065 381"
      fill="currentColor"
      shapeRendering="geometricPrecision"
      width="34"
      height="12"
      aria-hidden="true"
      focusable="false"
    >
      <g fillRule="evenodd">
        <path d="M327 197L297 252L228 105L102 381L0 381L181 9L275 9L279 13L345 151Z" />
        <path d="M366 381L267 381L267 376C300 300 340 150 420 70C460 30 510 0 562 0C630 0 690 30 726 58L726 62L672 120C650 102 610 80 562 81C530 82 500 110 483 137C460 175 420 280 366 381Z" />
        <path d="M625 310L641 303L669 272L789 13L793 9L884 9L1065 381L966 381L932 309L771 309L805 237L900 237L840 105L834 109L738 323L698 366L672 381L489 381L460 366L420 329L420 322L462 231L492 278L532 309L562 318L602 318Z" />
      </g>
    </svg>
  )
}
