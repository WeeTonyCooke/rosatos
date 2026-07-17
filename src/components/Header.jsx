import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getTickerItems } from '../lib/programme.js'

function CueName({ name }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const [shift, setShift] = useState(0)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return undefined

    const measure = () => {
      const delta = outer.clientWidth - inner.scrollWidth
      setShift(delta < -1 ? delta : 0)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    return () => observer.disconnect()
  }, [name])

  return (
    <span
      className={`events-cue__name${shift < 0 ? ' is-scroll' : ''}`}
      ref={outerRef}
    >
      <span
        className="events-cue__name-inner"
        ref={innerRef}
        style={shift < 0 ? { '--cue-shift': `${shift}px` } : undefined}
      >
        {name}
      </span>
    </span>
  )
}

export function Header({ venue }) {
  const [scrolled, setScrolled] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [index, setIndex] = useState(0)
  const canOrder = Boolean(venue.ordering?.enabled)

  const events = useMemo(() => getTickerItems(venue.programme, now), [venue.programme, now])
  const current = events[index] || null

  useEffect(() => {
    setIndex(0)
  }, [events])

  useEffect(() => {
    if (events.length < 2) return undefined
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % events.length)
    }, 5200)
    return () => window.clearInterval(id)
  }, [events.length])

  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return undefined

    // Hysteresis: showing the header bar grows the sticky header, which
    // reflows the hero we're observing. With a single threshold that shift
    // bounces the state on/off (jitter on mobile). Separate on/off ratios
    // give a dead zone wider than that shift so it can't oscillate.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio
        setScrolled((prev) => {
          if (prev) return ratio > 0.55 ? false : true
          return ratio < 0.25 ? true : false
        })
      },
      { threshold: [0, 0.25, 0.55, 1] },
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const tick = () => {
      const next = new Date()
      setNow((prev) => (prev.getDay() === next.getDay() ? prev : next))
    }
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      <header
        className={`site-header${scrolled ? ' is-scrolled' : ''}${canOrder ? ' has-order-fab' : ''}`}
      >
        {current ? (
          <a className="events-cue" href="#whats-on" aria-label="What’s on this week">
            <span className="events-cue__viewport">
              <span
                className={`events-cue__line${current.highlight ? ' is-today' : ''}`}
                key={`${current.day}-${current.name || current.text}-${current.time || ''}-${index}`}
              >
                {current.name && current.time ? (
                  <>
                    <span className="events-cue__day">{current.day}</span>
                    <span className="events-cue__pipe" aria-hidden="true">
                      |
                    </span>
                    <CueName name={current.name} />
                    <span className="events-cue__dot" aria-hidden="true">
                      •
                    </span>
                    <span className="events-cue__time">{current.time}</span>
                  </>
                ) : (
                  <>
                    <span className="events-cue__day">{current.day}</span>
                    <span className="events-cue__pipe" aria-hidden="true">
                      |
                    </span>
                    <span className="events-cue__text">{current.text}</span>
                  </>
                )}
              </span>
            </span>
          </a>
        ) : null}

        {/* Scrolled: brand (+ desktop section links). No hamburger — short page, all on the landing. */}
        <div className="site-header__bar">
          <div className="site-header__inner">
            <a className="site-header__brand" href="#top">
              {venue.name}
            </a>

            <nav className="site-nav" aria-label="Site">
              <div className="site-nav__links">
                <a href="#menu">Menu</a>
                <a href="#whats-on">What’s on</a>
                <a href="#visit">Visit</a>
              </div>

              <div className="site-nav__actions">
                <a className="site-nav__primary" href={venue.bookingUrl}>
                  Book a table
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {canOrder ? (
        <a className="order-fab" href="#order" aria-label="Order pizza for collection">
          <span className="order-fab__text">
            Order
            <br />
            pizza
          </span>
        </a>
      ) : null}
    </>
  )
}
