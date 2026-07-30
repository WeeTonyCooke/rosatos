export function GiftCard({ venue }) {
  const { giftCards } = venue
  if (!giftCards?.url) return null

  return (
    <section id="gift-cards" className="section section--tight gift-card" aria-label={giftCards.eyebrow || 'Gift cards'} data-reveal>
      <div className="gift-card__inner">
        <div className="gift-card__copy">
          {giftCards.eyebrow ? <p className="eyebrow">{giftCards.eyebrow}</p> : null}
          {giftCards.title ? <h2 className="gift-card__title">{giftCards.title}</h2> : null}
          {/* Accepts a string or an array, so the copy can break into
              paragraphs without the component caring which it was given. */}
          {[].concat(giftCards.body || []).map((para) => (
            <p className="gift-card__body" key={para}>
              {para}
            </p>
          ))}
          <a className="btn btn--primary gift-card__cta" href={giftCards.url} target="_blank" rel="noreferrer">
            {giftCards.label || 'Buy a gift card'}
          </a>
        </div>

        {giftCards.qrImage ? (
          <a
            className="gift-card__qr"
            href={giftCards.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${giftCards.label || 'Buy a gift card'} — opens rosatos.ie in a new tab`}
          >
            <img src={giftCards.qrImage} alt="" width="132" height="132" loading="lazy" />
            <span className="gift-card__qr-caption">Scan or tap</span>
          </a>
        ) : null}
      </div>
    </section>
  )
}
