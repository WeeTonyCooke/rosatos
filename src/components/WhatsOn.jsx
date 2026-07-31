import { useEffect, useMemo, useState } from 'react'
import { getTonight } from '../lib/programme.js'
import { Photo } from './Photo.jsx'

export function WhatsOn({ venue }) {
  const { programme, social } = venue
  // Null until mounted, for the same reason the header ticker is: getTonight
  // reads new Date(), so during the prerender it bakes the BUILD day's
  // "is-today" into the HTML and the client then renders a different one.
  // That's a hydration mismatch — the exact bug that was throwing React #418
  // on every page load before the ticker was fixed. This one was still latent.
  const [today, setToday] = useState(null)
  useEffect(() => {
    setToday(getTonight(programme).day)
  }, [programme])

  // Monday first. The data is stored 0 = Sunday because that's what
  // Date#getDay returns and what the CMS field documents, but a week that
  // opens on Sunday reads as last week's leftovers under a heading that says
  // "This week". Sorting here rather than in the content keeps the CMS
  // numbering — and its hint text — unchanged.
  const lineup = useMemo(() => {
    const rows = Array.isArray(programme.lineup) ? programme.lineup : []
    const mondayFirst = (day) => (Number(day) + 6) % 7
    return [...rows].sort((a, b) => mondayFirst(a.day) - mondayFirst(b.day))
  }, [programme])
  const photos = Array.isArray(programme.photos) ? programme.photos : []

  return (
    <section id="whats-on" className="section section--loose section--dark whats-on" data-reveal>
      <div className="section__intro">
        {programme.eyebrow ? <p className="eyebrow">{programme.eyebrow}</p> : null}
        <h2 className="section__title">{programme.title}</h2>
        {programme.body ? <p className="section__body">{programme.body}</p> : null}
      </div>

      {/* Two shots of the room mid-session, above the list rather than beside
          it. The lineup is capped at 36rem so a side-by-side pairing (as the
          menu courses use) would have left the photos awkwardly narrow — and
          the section's job is to make the programme believable before the
          reader gets to the names, not alongside them. */}
      {photos.length ? (
        <div className="whats-on__photos">
          {photos.map((photo) => (
            <Photo
              key={photo.base}
              base={photo.base}
              alt={photo.alt || ''}
              sizes="(min-width: 860px) 46vw, 92vw"
            />
          ))}
        </div>
      ) : null}

      <ul className="programme">
        {lineup.map((event) => {
          const isToday = today !== null && Number(event.day) === today
          return (
            // Day, act and time are siblings rather than a nested block, so
            // they can be laid out as columns of a board on wide screens and
            // stack on narrow ones. Previously all three were bundled inside
            // one div, which forced the whole row into a single measure.
            <li
              className={`programme__item${isToday ? ' is-today' : ''}`}
              key={`${event.day}-${event.name}-${event.time}`}
            >
              {/* The word, not just a tint. Saying "Tonight" is the least
                  decorative way to make today's row obvious, it matches the
                  header ticker's language, and it survives any ground colour
                  — unlike a coloured rule, which is what quietly stopped
                  working when this section went forest. */}
              <span className="programme__day">{isToday ? 'Tonight' : event.dayLabel}</span>
              <h3 className="programme__name">{event.name}</h3>
              <p className="programme__when">{event.time}</p>
              {/* Optional. Carries the one-off context a listing sometimes
                  needs — "The Beatles Fest · Live music" — without pushing it
                  into the act's name, where it would fight the columns: the
                  columns already ARE the separators, so pipes inside a cell
                  read as a second, competing system. Most rows leave it
                  empty and lose nothing. */}
              {event.context ? <p className="programme__context">{event.context}</p> : null}
            </li>
          )
        })}
      </ul>

      <p className="programme__note">
        {programme.note}{' '}
        <a href={social.instagram} target="_blank" rel="noreferrer">
          Instagram
        </a>
      </p>
    </section>
  )
}
