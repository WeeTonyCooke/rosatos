import { Photo } from './Photo.jsx'
import { McaMark } from './McaMark.jsx'

/**
 * Three-column footer: navigation left, wordmark centred, contact right.
 *
 * Deliberately quieter than the old stacked layout — links are small tracked
 * uppercase, the wordmark carries the only display type, and a single hairline
 * separates the studio credit beneath. The page has done its talking by this
 * point; the footer's job is orientation, not another pitch.
 */
export function Footer({ venue }) {
  const year = new Date().getFullYear()
  const gift = venue.giftCards
  const links = Array.isArray(venue.footerLinks) ? venue.footerLinks : []
  const credit = venue.credit

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__nav" aria-label="Footer">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-footer__brandblock">
          {venue.hero?.base ? (
            <Photo
              base={venue.hero.base}
              alt=""
              sizes="88px"
              className="site-footer__mark"
            />
          ) : null}
          <p className="site-footer__wordmark">{venue.name}</p>
          {venue.subtitle ? (
            <p className="site-footer__subtitle">{venue.subtitle}</p>
          ) : null}
        </div>

        <div className="site-footer__meta">
          <p>
            <a href={`mailto:${venue.email}`}>{venue.email}</a>
          </p>
          <p>
            <a href={`tel:${venue.phone.replace(/\s/g, '')}`}>{venue.phone}</a>
          </p>
          <p>
            {venue.address.street}, {venue.address.locality}, {venue.address.region}
          </p>
          <p className="site-footer__social">
            <a href={venue.social.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            {' · '}
            <a href={venue.social.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
            {gift?.url ? (
              <>
                {' · '}
                <a href={gift.url} target="_blank" rel="noreferrer">
                  {gift.label || 'Gift cards'}
                </a>
              </>
            ) : null}
          </p>
          <p className="site-footer__copyright">
            © {year} {venue.name}
          </p>
        </div>
      </div>

      <div className="site-footer__credit">
        {/* Mark plus wordmark, linking to a prefilled email rather than a
            website — the studio would rather hear from someone than be
            browsed. The anchor carries the accessible name; the mark itself
            is aria-hidden, so it isn't announced twice. */}
        {credit?.label ? (
          credit.email ? (
            <a
              className="site-footer__studio"
              href={`mailto:${credit.email}${credit.subject ? `?subject=${encodeURIComponent(credit.subject)}` : ''}`}
              aria-label={credit.ariaLabel || `Email ${credit.label}`}
            >
              <McaMark className="site-footer__studio-mark" />
              <span>{credit.label}</span>
            </a>
          ) : (
            <span>{credit.label}</span>
          )
        ) : null}
      </div>
    </footer>
  )
}
