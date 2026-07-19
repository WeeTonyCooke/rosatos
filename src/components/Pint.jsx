export function Pint({ venue }) {
  const { pint } = venue
  if (!pint?.image) return null

  return (
    <section id="pint" className="pint" aria-label={pint.title || 'Great pints'} data-reveal>
      <div className="pint__inner">
        <div className="pint__copy">
          <h2 className="pint__title">{pint.title}</h2>
          {pint.body ? <p className="pint__body">{pint.body}</p> : null}
        </div>
        <figure className="pint__figure">
          <picture>
            <source
              type="image/webp"
              srcSet="/images/pint-480.webp 480w, /images/pint-900.webp 900w, /images/pint-1200.webp 1200w"
              sizes="(min-width: 900px) 40vw, 90vw"
            />
            <img
              src="/images/pint-900.jpg"
              srcSet="/images/pint-480.jpg 480w, /images/pint-900.jpg 900w, /images/pint-1200.jpg 1200w"
              sizes="(min-width: 900px) 40vw, 90vw"
              alt={pint.imageAlt || ''}
              width="1200"
              height="1600"
              loading="lazy"
            />
          </picture>
        </figure>
      </div>
    </section>
  )
}
