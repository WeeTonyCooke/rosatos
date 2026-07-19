export function Room({ venue }) {
  const { room } = venue
  const hasPhoto = Boolean(room.image)

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
            <picture>
              <source
                type="image/webp"
                srcSet="/images/room-480.webp 480w, /images/room-900.webp 900w, /images/room-1400.webp 1400w"
                sizes="(min-width: 900px) 50vw, 90vw"
              />
              <img
                src="/images/room-900.jpg"
                srcSet="/images/room-480.jpg 480w, /images/room-900.jpg 900w, /images/room-1400.jpg 1400w"
                sizes="(min-width: 900px) 50vw, 90vw"
                alt={room.imageAlt}
                width="1400"
                height="933"
                loading="lazy"
              />
            </picture>
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
