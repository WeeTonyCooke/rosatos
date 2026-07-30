import { useCallback, useRef } from 'react'
import { useBooking } from '../booking/BookingContext.jsx'
import { useDialog } from '../hooks/useDialog.js'

export function BookingSheet({ venue }) {
  const { open, setOpen } = useBooking()
  const { bookingWidgetUrl, bookingNote } = venue
  const panelRef = useRef(null)

  const close = useCallback(() => setOpen(false), [setOpen])
  useDialog(panelRef, { open: open && Boolean(bookingWidgetUrl), onClose: close })

  if (!open || !bookingWidgetUrl) return null

  return (
    <div
      className="customize-sheet is-open"
      role="dialog"
      aria-modal="true"
      aria-label="Book a table"
      data-dialog-root
    >
      <div className="customize-sheet__backdrop" onClick={close} />
      <div className="customize-sheet__panel booking-sheet__panel" ref={panelRef} tabIndex={-1}>
        <div className="booking-sheet__header">
          <div>
            <p className="booking-sheet__eyebrow">Book a table</p>
            {bookingNote ? <p className="booking-sheet__note">{bookingNote}</p> : null}
          </div>
          <button
            type="button"
            className="booking-sheet__close"
            onClick={close}
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
