import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCart } from '../cart/CartContext.jsx'
import { useDialog } from '../hooks/useDialog.js'
import { getTodaysWindow } from '../lib/hours.js'
import { toClock, toMinutes } from '../lib/venue-time.js'

const SLOT_STEP = 15

/**
 * Builds today's collection slots against the venue's real opening hours, not
 * just `kitchenCloses`, and in the VENUE's timezone rather than the visitor's.
 *
 * Two bugs lived here. The first: it only checked the closing time, so ordering
 * outside hours still produced slots — including, overnight, a nonsensical run
 * rolled into the next calendar day.
 *
 * The second was worse and survived the first fix. Every comparison used
 * `new Date()`, which is the visitor's clock. Tested from Asia/Dubai: it was
 * 14:25 in Moville, the venue was shut until 16:00, and the site offered slots
 * from 18:00 to 21:00. Everything below now works in minutes since midnight at
 * the venue, so a phone on the wrong timezone — or a customer abroad — gets the
 * same answer as someone standing outside the door.
 */
function buildSlots(venue, leadMinutes, kitchenCloses, at) {
  const { now, openWindow } = getTodaysWindow(venue.hours, at)

  if (!openWindow) {
    return { slots: [], closed: true, reason: 'Closed today — check our hours below.' }
  }

  // Online ordering can't run past the venue's own closing time either.
  const kitchenClose = toMinutes(kitchenCloses)
  const close = Math.min(kitchenClose ?? openWindow.close, openWindow.close)

  if (now.minutes >= close) {
    return {
      slots: [],
      closed: true,
      reason: `Kitchen’s closed for online orders now. Back at ${toClock(openWindow.open)} — give us a call for anything else.`,
    }
  }

  // Round the lead time up to the next quarter hour.
  const earliestByLead = Math.ceil((now.minutes + leadMinutes) / SLOT_STEP) * SLOT_STEP
  const earliest = Math.max(earliestByLead, openWindow.open)

  if (earliest > close) {
    return {
      slots: [],
      closed: true,
      reason: 'No more collection slots today — kitchen’s about to close.',
    }
  }

  const slots = []
  for (let m = earliest; m <= close && slots.length < 40; m += SLOT_STEP) {
    slots.push(toClock(m))
  }
  return { slots, closed: false, reason: '' }
}

function encode(data) {
  return new URLSearchParams(data).toString()
}

export function CartDrawer({ venue }) {
  const {
    enabled,
    ordering,
    items,
    count,
    total,
    totalLabel,
    open,
    setOpen,
    setQty,
    clear,
    formatEuro,
    formatLineMods,
  } = useCart()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [collectionTime, setCollectionTime] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const panelRef = useRef(null)

  const close = useCallback(() => setOpen(false), [setOpen])
  useDialog(panelRef, { open: open && enabled && Boolean(ordering), onClose: close })

  // Recomputed after mount and every minute thereafter — never during render.
  //
  // Two reasons. The prerender would otherwise bake the BUILD time's slots into
  // the HTML and the client would render a different list, which is a hydration
  // mismatch of exactly the kind that was throwing React #418 elsewhere. And
  // the old useMemo depended on [venue, ordering], both module constants, so
  // the slots were computed once at page load and never again — leave the page
  // open for an hour and it would still offer a slot that had already passed.
  const [tick, setTick] = useState(null)
  useEffect(() => {
    setTick(Date.now())
    const id = window.setInterval(() => setTick(Date.now()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const { slots, closed, reason } = useMemo(
    () =>
      ordering && tick !== null
        ? buildSlots(venue, ordering.leadMinutes, ordering.kitchenCloses, new Date(tick))
        : { slots: [], closed: false, reason: '' },
    [venue, ordering, tick],
  )

  if (!enabled || !ordering) return null

  async function onSubmit(event) {
    event.preventDefault()
    setError('')

    if (closed) {
      setError(reason || 'Online ordering is closed right now.')
      return
    }
    if (!items.length) {
      setError('Add a pizza to continue.')
      return
    }
    if (!collectionTime) {
      setError('Choose a collection time.')
      return
    }

    const orderLines = items
      .map((row) => {
        const mods = formatLineMods(row)
        const label = mods ? `${row.name} (${mods})` : row.name
        return `${row.qty}× ${label} (${formatEuro(row.unitPrice * row.qty)})`
      })
      .join('\n')

    const payload = {
      'form-name': 'pizza-collection',
      name,
      phone,
      collectionTime,
      notes,
      order: orderLines,
      total: totalLabel,
      mode: 'collection',
    }

    setStatus('sending')

    try {
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(payload),
      })

      // Locally Netlify Forms isn't available — still confirm the order UX
      if (!response.ok && import.meta.env.PROD) {
        throw new Error('Could not send order. Please call the bar.')
      }

      setStatus('sent')
      clear()
      window.setTimeout(() => {
        setStatus('idle')
        setName('')
        setPhone('')
        setCollectionTime('')
        setNotes('')
        setOpen(false)
      }, 4200)
    } catch (err) {
      setStatus('idle')
      setError(err.message || 'Something went wrong.')
    }
  }

  return (
    <>
      {count > 0 && !open ? (
        <button type="button" className="cart-fab" onClick={() => setOpen(true)}>
          Cart · {count} · {totalLabel}
        </button>
      ) : null}

      <div
        className={`cart-drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Pizza collection cart"
        hidden={!open}
        data-dialog-root
      >
        <div className="cart-drawer__backdrop" onClick={close} />
        <div className="cart-drawer__panel" ref={panelRef} tabIndex={-1}>
          <header className="cart-drawer__header">
            <div>
              <p className="eyebrow">Collection only</p>
              <h2>Your order</h2>
            </div>
            <button type="button" className="cart-drawer__close" onClick={close}>
              Close
            </button>
          </header>

          {status === 'sent' ? (
            <div className="cart-drawer__success" role="status">
              <p>{ordering.successMessage}</p>
              <p className="cart-drawer__success-meta">
                Collect from {venue.address.street}, {venue.address.locality}.
              </p>
            </div>
          ) : (
            <>
              {items.length === 0 ? (
                <p className="cart-drawer__empty">Your cart is empty. Add a pizza to get started.</p>
              ) : (
                <ul className="cart-drawer__items">
                  {items.map((row) => {
                    const mods = formatLineMods(row)
                    return (
                      <li key={row.id}>
                        <div>
                          <strong>{row.name}</strong>
                          {mods ? <p className="cart-drawer__mods">{mods}</p> : null}
                          <span>{formatEuro(row.unitPrice)}</span>
                        </div>
                        <div className="cart-drawer__qty">
                          <button
                            type="button"
                            onClick={() => setQty(row.id, row.qty - 1)}
                            aria-label={`Fewer ${row.name}`}
                          >
                            −
                          </button>
                          <span>{row.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(row.id, row.qty + 1)}
                            aria-label={`More ${row.name}`}
                          >
                            +
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              <form className="cart-drawer__form" onSubmit={onSubmit}>
                <input type="hidden" name="form-name" value="pizza-collection" />
                <p className="cart-drawer__total">
                  <span>Total</span>
                  <strong>{totalLabel}</strong>
                </p>
                <p className="cart-drawer__pay">{ordering.payNote}</p>

                {closed ? <p className="cart-drawer__closed">{reason}</p> : null}

                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <label>
                  Collection time
                  <select
                    name="collectionTime"
                    required
                    disabled={closed}
                    value={collectionTime}
                    onChange={(e) => setCollectionTime(e.target.value)}
                  >
                    <option value="">{closed ? 'No slots available' : 'Select a time'}</option>
                    {slots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Notes <span className="optional">(optional)</span>
                  <textarea
                    name="notes"
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Allergies, collection details…"
                  />
                </label>

                {error ? <p className="cart-drawer__error">{error}</p> : null}

                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={status === 'sending' || total <= 0 || closed}
                >
                  {status === 'sending' ? 'Sending…' : 'Place collection order'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
