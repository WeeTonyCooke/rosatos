import { Photo } from './Photo.jsx'

export function Room({ venue }) {
  const { room } = venue
  const hasPhoto = Boolean(room.base)

  return (
    <section id="room" className="section room" data-reveal>
      <div className={`section__grid room__grid${hasPhoto ? '' : ' room__grid--solo'}`}>
        <div className="room__copy">
          <p className="eyebrow">{room.eyebrow}</p>
          <h2 className="section__title">{room.title}</h2>
          <p className="section__body">{room.body}</p>
        </div>
        {hasPhoto ? (
          <figure className="room__figure">
            {/* Widths come from the generated manifest rather than a hardcoded
                srcset — see Photo.jsx. The old markup pinned room-480/900/1400
                by hand, which is the pattern that goes stale the moment a
                better original lands under a different name. */}
            <Photo
              base={room.base}
              alt={room.imageAlt || ''}
              sizes="(min-width: 900px) 50vw, 90vw"
            />
          </figure>
        ) : (
          <div className="room__swatch" aria-hidden="true">
            <span>{room.title || 'The room'}</span>
          </div>
        )}
      </div>
    </section>
  )
}
