import { useMemo } from 'react'
import { getTonight } from '../lib/programme.js'

export function WhatsOn({ venue }) {
  const { programme, social } = venue
  const tonight = useMemo(() => getTonight(programme), [programme])
  const lineup = Array.isArray(programme.lineup) ? programme.lineup : []

  return (
    <section id="whats-on" className="section whats-on" data-reveal>
      <div className="section__intro">
        <p className="eyebrow">{programme.eyebrow}</p>
        <h2 className="section__title">{programme.title}</h2>
      </div>

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
