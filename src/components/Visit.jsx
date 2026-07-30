import { useBooking } from '../booking/BookingContext.jsx'
import { Photo } from './Photo.jsx'

export function Visit({ venue }) {
  const {
    visit,
    address,
    hours,
    hoursHeading,
    hoursNote,
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
    <section id="visit" className="section section--loose visit" data-reveal>
      <div className="section__intro">
        {visit.eyebrow ? <p className="eyebrow">{visit.eyebrow}</p> : null}
        <h2 className="section__title">{visit.title}</h2>
        <p className="section__body">{address.landmark}</p>
      </div>

      <div className="visit__grid">
        <div className="visit__details">
          {/* These are food-service hours, not bar closing times — the
              programme runs to 22:00. Labelling them "Opening Hours" put a
              21:00 close directly above a list of 22:00 events. */}
          <div className="visit__block">
            <h3>{hoursHeading || 'Kitchen hours'}</h3>
            <ul className="hours-list">
              {hours.map((row) => (
                <li key={row.days}>
                  <span>{row.days}</span>
                  <span>{row.time}</span>
                </li>
              ))}
            </ul>
            {hoursNote ? <p className="visit__tip">{hoursNote}</p> : null}
          </div>

          <div className="visit__block">
            <h3>Contact</h3>
            <p>
              <a href={phoneHref}>{phone}</a>
              <br />
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p className="visit__tip">{visit.parkingTip}</p>
          </div>
        </div>

        {/* Photo and booking panel share the right column.
            The photo used to be a third child of a two-column grid, which put
            it beside the details and wrapped the booking panel underneath into
            column one — the misalignment visible at desktop widths. */}
        <div className="visit__aside">
          {/* Daylight, not the dusk shot: this one is doing a practical job,
              showing someone what to look for on Malin Road, so legibility of
              the frontage beats atmosphere. */}
          {visit.photo?.base ? (
            <figure className="visit__photo">
              <Photo
                base={visit.photo.base}
                alt={visit.photo.alt || ''}
                sizes="(min-width: 900px) 45vw, 92vw"
              />
            </figure>
          ) : null}

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
