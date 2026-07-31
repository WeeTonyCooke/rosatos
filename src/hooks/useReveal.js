import { useEffect } from 'react'

export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')
    if (!nodes.length) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.classList.add('is-revealed'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      // threshold is a fraction of the OBSERVED ELEMENT, not of the viewport —
      // which is a trap when the observed elements are whole page sections.
      // At 0.12 the menu section (5,200px on a phone) needed 624px of itself
      // visible before it faded in, so you scrolled a screen and a half of
      // blank cream past the heading before anything appeared. The taller the
      // section, the longer the blank.
      //
      // 0 fires the moment any part enters, and the positive bottom margin
      // extends the root downward so it fires just *before* entry — the
      // section is already fading up as it arrives.
      { threshold: 0, rootMargin: '0px 0px 12% 0px' },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}
