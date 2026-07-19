import { useBooking } from '../booking/BookingContext.jsx'

export function Visit({ venue }) {
  const {
    visit,
    address,
    hours,
    phone,
    email,
    bookingNote,
    bookingWidgetUrl,
    bookingEnquiry,
    mapEmbedUrl,
    directionsUrl,
  } = venue
  const { setOpen: setBookingOpen } = useBooking()

  const phoneHref = `tel:${phone.replace(/\s/g, '')}`

  return (
    <section id="visit" className="section visit" data-reveal>
      <div className="section__intro">
        <p className="eyebrow">{visit.eyebrow}</p>
        <h2 className="section__title">{visit.title}</h2>
        <p className="section__body">{address.landmark}</p>
      </div>

      <div className="visit__grid">
        <div className="visit__details">
          <div className="visit__block">
            <h3>Hours</h3>
            <ul className="hours-list">
              {hours.map((row) => (
                <li key={row.days}>
                  <span>{row.days}</span>
                  <span>{row.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="visit__block">
            <h3>Contact</h3>
            <p>
              <a href={phoneHref}>{phone}</a>
              <br />
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p className="visit__tip">{visit.parkingTip}</p>
            {venue.giftCards?.url ? (
              <p className="visit__tip">
                <a href={venue.giftCards.url} target="_blank" rel="noreferrer">
                  {venue.giftCards.label || 'Gift cards'}
                </a>
              </p>
            ) : null}
          </div>
        </div>

        <div className="visit__book">
          <h3>Book a table</h3>
          <p className="visit__address">
            {address.street}
            <br />
            {address.locality}, {address.region} {address.postalCode}
          </p>
          <a className="text-link visit__directions" href={directionsUrl} target="_blank" rel="noreferrer">
            Get directions
          </a>
          <p className="visit__note">{bookingNote}</p>

          {bookingWidgetUrl ? (
            <button type="button" className="btn btn--primary" onClick={() => setBookingOpen(true)}>
              Check availability
            </button>
          ) : null}

          {bookingEnquiry ? (
            <p className="visit__enquiry">
              {bookingEnquiry}{' '}
              <a href={phoneHref}>{phone}</a>
              {' · '}
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          ) : null}
        </div>
      </div>

      <div className="visit__map">
        <iframe
          title={`Map showing ${venue.name}`}
          src={mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  )
}
