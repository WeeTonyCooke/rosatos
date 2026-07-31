import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The MCA studio credit, ported from the mca-footer-credit package.
 *
 * The package ships a framework-agnostic snippet with an inline <script>, and
 * its README asks that React sites port the listener into a component rather
 * than inlining the tag — this is that port. The CSS class it toggles
 * (`is-tracing`) is the contract; the vanilla wrapper isn't.
 *
 * THE MARK IS INLINED, NOT AN <img>.
 *
 * The package's install step 1 says to use mca-logo.svg — the fill="currentColor"
 * variant — on dark backgrounds "so the surrounding text color carries
 * through". That doesn't work through an <img> tag, and Rosato's footer is
 * forest green so it's exactly the case that would have failed. An SVG loaded
 * via <img> is an isolated document: currentColor resolves against the SVG's
 * own color property, which defaults to black, not against the host page. The
 * file would render near-black on dark green.
 *
 * Inlining it is what makes currentColor mean what the package intends. Worth
 * fixing in the package too, or the next dark-footer site hits the same wall.
 */
const TRACE_MS = 700

export function McaCredit({ label, email, subject, ariaLabel, className }) {
  const [run, setRun] = useState(0)
  const [tracing, setTracing] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const trigger = useCallback(() => {
    // Bumping a key remounts the animated svg, which restarts the animation
    // from zero. The vanilla snippet does this by reading offsetWidth to force
    // a reflow; React has no equivalent, and toggling a class in one tick
    // won't restart an in-flight animation.
    setRun((n) => n + 1)
    setTracing(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setTracing(false), TRACE_MS)
  }, [])

  if (!label) return null

  const href = email
    ? `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
    : null

  const inner = (
    <>
      <span className="mca-credit__mark" aria-hidden="true">
        <svg
          className="mca-credit__logo"
          viewBox="0 0 1065 381"
          fill="currentColor"
          shapeRendering="geometricPrecision"
          focusable="false"
        >
          <g fillRule="evenodd">
            <path d="M327 197L297 252L228 105L102 381L0 381L181 9L275 9L279 13L345 151Z" />
            <path d="M366 381L267 381L267 376C300 300 340 150 420 70C460 30 510 0 562 0C630 0 690 30 726 58L726 62L672 120C650 102 610 80 562 81C530 82 500 110 483 137C460 175 420 280 366 381Z" />
            <path d="M625 310L641 303L669 272L789 13L793 9L884 9L1065 381L966 381L932 309L771 309L805 237L900 237L840 105L834 109L738 323L698 366L672 381L489 381L460 366L420 329L420 322L462 231L492 278L532 309L562 318L602 318Z" />
          </g>
        </svg>

        {/* The trace: the same letterforms drawn as strokes, so the gradient
            runs along the path as if the mark were being signed. */}
        <svg
          key={run}
          className="mca-credit__trace"
          viewBox="0 0 1065 381"
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
        >
          <defs>
            <linearGradient id="mca-trace-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1065" y2="0">
              <stop offset="0%" stopColor="#E4B65A" />
              <stop offset="45%" stopColor="#6FBF9B" />
              <stop offset="75%" stopColor="#4E8FBF" />
              <stop offset="100%" stopColor="#B08AC9" />
            </linearGradient>
          </defs>
          <g className="mca-credit__strokes">
            <path pathLength="100" d="M327 197L297 252L228 105L102 381L0 381L181 9L275 9L279 13L345 151Z" />
            <path pathLength="100" d="M366 381L267 381L267 376C300 300 340 150 420 70C460 30 510 0 562 0C630 0 690 30 726 58L726 62L672 120C650 102 610 80 562 81C530 82 500 110 483 137C460 175 420 280 366 381Z" />
            <path pathLength="100" d="M625 310L641 303L669 272L789 13L793 9L884 9L1065 381L966 381L932 309L771 309L805 237L900 237L840 105L834 109L738 323L698 366L672 381L489 381L460 366L420 329L420 322L462 231L492 278L532 309L562 318L602 318Z" />
          </g>
          <path
            className="mca-credit__sparkle"
            d="M955,230 L972.5,282.5 L1025,300 L972.5,317.5 L955,370 L937.5,317.5 L885,300 L937.5,282.5 Z"
          />
        </svg>
      </span>
      <span className="mca-credit__caption">{label}</span>
    </>
  )

  const props = {
    className: `mca-credit${tracing ? ' is-tracing' : ''}${className ? ` ${className}` : ''}`,
    onMouseEnter: trigger,
    onFocus: trigger,
  }

  return href ? (
    <a {...props} href={href} aria-label={ariaLabel || `Email ${label}`}>
      {inner}
    </a>
  ) : (
    <span {...props}>{inner}</span>
  )
}
