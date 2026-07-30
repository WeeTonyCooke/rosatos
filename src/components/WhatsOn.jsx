import { useMemo } from 'react'
import { getTonight } from '../lib/programme.js'
import { Photo } from './Photo.jsx'

export function WhatsOn({ venue }) {
  const { programme, social } = venue
  const tonight = useMemo(() => getTonight(programme), [programme])
  const lineup = Array.isArray(programme.lineup) ? programme.lineup : []
  const photos = Array.isArray(programme.photos) ? programme.photos : []

  return (
    <section id="whats-on" className="section section--loose whats-on" data-reveal>
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
          const isToday = Number(event.day) === tonight.day
          return (
            <li
              className={`programme__item${isToday ? ' is-today' : ''}`}
              key={`${event.day}-${event.name}-${event.time}`}
            >
              <div>
                <h3 className="programme__name">
                  <span className="programme__day">{event.dayLabel}</span>{event.name}
                </h3>
                <p className="programme__when">{event.time}</p>
              </div>
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
