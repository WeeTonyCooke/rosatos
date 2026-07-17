import { useMemo, useState } from 'react'
import { useCart } from '../cart/CartContext.jsx'
import { getTodaysWindow } from '../lib/hours.js'

function formatClock(date) {
  return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/**
 * Builds today's collection slots against the venue's real opening hours,
 * not just `kitchenCloses`. Previously this only checked the closing time,
 * so ordering outside hours (before opening, or any time after close) still
 * produced a list of slots — including, overnight, a nonsensical run of
 * "slots" rolled into the next calendar day with no indication anything
 * was wrong. Now it returns a `closed` reason instead of bad slots whenever
 * there's no valid collection window left today.
 */
function buildSlots(venue, leadMinutes, kitchenCloses) {
  const now = new Date()
  const window = getTodaysWindow(venue.hours, now)

  if (!window) {
    return { slots: [], closed: true, reason: 'Closed today — check our hours below.' }
  }

  const [closeH, closeM] = kitchenCloses.split(':').map(Number)
  const kitchenClose = new Date(now)
  kitchenClose.setHours(closeH, closeM, 0, 0)
  // Online ordering can't run past the venue's own closing time either.
  const close = kitchenClose < window.close ? kitchenClose : window.close

  if (now >= close) {
    return {
      slots: [],
      closed: true,
      reason: `Kitchen’s closed for online orders now. Back at ${window.open.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false })} — give us a call for anything else.`,
    }
  }

  const earliestByLead = new Date(now.getTime() + leadMinutes * 60 * 1000)
  earliestByLead.setSeconds(0, 0)
  earliestByLead.setMinutes(Math.ceil(earliestByLead.getMinutes() / 15) * 15)

  const earliest = earliestByLead < window.open ? window.open : earliestByLead

  if (earliest > close) {
    return {
      slots: [],
      closed: true,
      reason: 'No more collection slots today — kitchen’s about to close.',
    }
  }

  const slots = []
  const cursor = new Date(earliest)
  while (cursor <= close && slots.length < 40) {
    slots.push(formatClock(cursor))
    cursor.setMinutes(cursor.getMinutes() + 15)
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

  const { slots, closed, reason } = useMemo(
    () =>
      ordering
        ? buildSlots(venue, ordering.leadMinutes, ordering.kitchenCloses)
        : { slots: [], closed: false, reason: '' },
    [venue, ordering],
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
      >
        <div className="cart-drawer__backdrop" onClick={() => setOpen(false)} />
        <div className="cart-drawer__panel">
          <header className="cart-drawer__header">
            <div>
              <p className="eyebrow">Collection only</p>
              <h2>Your order</h2>
            </div>
            <button type="button" className="cart-drawer__close" onClick={() => setOpen(false)}>
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
