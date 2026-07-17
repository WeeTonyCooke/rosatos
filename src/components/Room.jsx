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
            <img
              src={room.image}
              alt={room.imageAlt}
              width="1400"
              height="933"
              loading="lazy"
            />
          </figure>
        ) : (
          <div className="room__swatch" aria-hidden="true">
            <span>Card Room Green</span>
          </div>
        )}
      </div>
    </section>
  )
}
