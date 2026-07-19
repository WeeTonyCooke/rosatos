import { useBooking } from '../booking/BookingContext.jsx'

export function BookingSheet({ venue }) {
  const { open, setOpen } = useBooking()
  const { bookingWidgetUrl, bookingNote } = venue

  if (!open || !bookingWidgetUrl) return null

  return (
    <div className="customize-sheet is-open" role="dialog" aria-modal="true" aria-label="Book a table">
      <div className="customize-sheet__backdrop" onClick={() => setOpen(false)} />
      <div className="customize-sheet__panel booking-sheet__panel">
        <div className="booking-sheet__header">
          <div>
            <p className="booking-sheet__eyebrow">Book a table</p>
            {bookingNote ? <p className="booking-sheet__note">{bookingNote}</p> : null}
          </div>
          <button
            type="button"
            className="booking-sheet__close"
            onClick={() => setOpen(false)}
            aria-label="Close booking"
          >
            ✕
          </button>
        </div>

        {/* The booking widget below is a third-party tool (ResDiary) — its
            calendar/colour styling is theirs, not ours, and intentionally
            isn't restyled to match the site. Framing it with its own label
            and close control keeps that switch legible rather than letting
            it read as part of the page's own design. */}
        <p className="booking-sheet__powered-by">via ResDiary</p>
        <div className="book-widget book-widget--sheet">
          <iframe
            title={`Book a table at ${venue.name}`}
            src={bookingWidgetUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  )
}
