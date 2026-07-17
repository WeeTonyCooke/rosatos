export function Footer({ venue }) {
  const year = new Date().getFullYear()
  const gift = venue.giftCards

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>{venue.name}</strong>
          <p>{venue.footerLine || venue.tagline}</p>
        </div>

        <div className="site-footer__meta">
          <p>
            {venue.address.street}, {venue.address.locality}
          </p>
          <p>
            <a href={`tel:${venue.phone.replace(/\s/g, '')}`}>{venue.phone}</a>
          </p>
          <p className="site-footer__hours">{venue.hoursSummary}</p>
        </div>

        <div className="site-footer__social">
          <a href={venue.social.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href={venue.social.facebook} target="_blank" rel="noreferrer">
            Facebook
          </a>
          {gift?.url ? (
            <a href={gift.url} target="_blank" rel="noreferrer">
              {gift.label || 'Gift cards'}
            </a>
          ) : null}
        </div>
      </div>

      <div className="site-footer__credit">
        <span>
          © {year} {venue.name}
        </span>
        {venue.credit ? (
          <a href={venue.credit.url} target="_blank" rel="noreferrer">
            {venue.credit.label}
          </a>
        ) : null}
      </div>
    </footer>
  )
}
