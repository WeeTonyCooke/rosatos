import { useBooking } from '../booking/BookingContext.jsx'

export function Hero({ venue }) {
  const hasPhoto = Boolean(venue.hero?.image)
  const { setOpen: setBookingOpen } = useBooking()

  return (
    <section
      id="top"
      className={`hero${hasPhoto ? ' hero--photo' : ' hero--paint'}`}
      aria-label="Welcome"
    >
      <div className="hero__content">
        <h1 className="hero__name hero__reveal">{venue.name}</h1>
        {venue.place ? (
          <p className="hero__place hero__reveal">{venue.place}</p>
        ) : null}
        <div className="hero__actions hero__reveal">
          <button type="button" className="btn btn--on-hero" onClick={() => setBookingOpen(true)}>
            Book a table
          </button>
        </div>
      </div>

      {hasPhoto ? (
        <div className="hero__media">
          <div className="hero__stage">
            <div className="hero__facade" aria-hidden="true">
              <img
                src={venue.hero.image}
                alt=""
                width="1463"
                height="1280"
                fetchPriority="high"
              />
            </div>
            <p className="hero__tagline hero__tagline--under hero__reveal">{venue.tagline}</p>
          </div>
          <div className="hero__veil" aria-hidden="true" />
        </div>
      ) : (
        <p className="hero__tagline hero__reveal">{venue.tagline}</p>
      )}
    </section>
  )
}
