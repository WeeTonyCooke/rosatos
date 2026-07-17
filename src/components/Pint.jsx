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
          <img
            src={pint.image}
            alt={pint.imageAlt || ''}
            width="1200"
            height="1600"
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  )
}
