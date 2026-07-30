import { useCallback, useMemo, useRef, useState } from 'react'
import { useCart } from '../cart/CartContext.jsx'
import { Photo } from './Photo.jsx'
import { useDialog } from '../hooks/useDialog.js'

function emptyDraft() {
  return { extras: [], removals: [], note: '' }
}

function toggleOption(list, option) {
  const exists = list.some((row) => row.id === option.id)
  if (exists) return list.filter((row) => row.id !== option.id)
  return [...list, option]
}

/** Match leave-offs to what this pizza actually carries. */
const REMOVAL_ALIASES = {
  onion: ['onion', 'onions'],
  mushroom: ['mushroom', 'mushrooms'],
  peppers: ['pepper', 'peppers'],
  jalapenos: ['jalapeño', 'jalapeños', 'jalapeno', 'jalapenos'],
  rocket: ['rocket'],
  chilli: ['chilli', 'chili', 'chilli flakes'],
}

/**
 * Whole-word test, not a substring test.
 *
 * This used to be `haystack.includes(alias)`, which meant the 'pepper' alias
 * matched inside "pepperoni" — so Pepperoni, Hot 'n' Spicy Pepperoni and Meat
 * Feast all offered "Leave off: Peppers" for peppers they don't contain.
 *
 * \b won't do here: it's defined over ASCII word characters, so it fails on
 * the accented forms ("jalapeño"). Unicode letter classes give the same
 * boundary behaviour while handling them correctly.
 */
function containsWord(haystack, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'iu').test(haystack)
}

function removersForPizza(pizza, removals) {
  const haystack = `${pizza.name} ${pizza.description || ''}`
  return removals.filter((option) => {
    const aliases = REMOVAL_ALIASES[option.id] || [option.label]
    return aliases.some((alias) => containsWord(haystack, alias))
  })
}

export function OrderPizza() {
  const { enabled, ordering, customizations, extraPrice, pizzas, addItem, refineItem, setOpen, formatEuro } =
    useCart()
  const [activeName, setActiveName] = useState(null)
  const [pendingLineId, setPendingLineId] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)

  const extras = customizations?.extras || []
  const removals = customizations?.removals || []
  const canCustomize = Boolean(customizations)

  const activePizza = useMemo(
    () => pizzas.find((pizza) => pizza.name === activeName) || null,
    [pizzas, activeName],
  )

  const leaveOffs = useMemo(
    () => (activePizza ? removersForPizza(activePizza, removals) : []),
    [activePizza, removals],
  )

  const draftPrice = useMemo(() => {
    if (!activePizza) return 0
    return Number.parseFloat(activePizza.price) + draft.extras.length * extraPrice
  }, [activePizza, draft.extras.length, extraPrice])

  const panelRef = useRef(null)

  // Dismissing the sheet keeps the pizza exactly as it was added — the line is
  // already in the cart by this point — so Escape and the backdrop both mean
  // "keep as is", matching the button. Defined with useCallback because
  // useDialog re-runs its effect whenever the close handler identity changes.
  const keepAsIs = useCallback(() => {
    setActiveName(null)
    setPendingLineId(null)
    setDraft(emptyDraft())
    setOpen(true)
  }, [setOpen])

  useDialog(panelRef, {
    open: Boolean(enabled && ordering && canCustomize && activePizza),
    onClose: keepAsIs,
  })

  if (!enabled || !ordering) return null

  function closeCustomize({ openCart = false } = {}) {
    setActiveName(null)
    setPendingLineId(null)
    setDraft(emptyDraft())
    if (openCart) setOpen(true)
  }

  function handleAdd(pizza) {
    if (activeName) {
      // Previous add stays as-is; move on.
      closeCustomize()
    }
    const lineId = addItem(pizza, { openCart: false })
    if (!canCustomize) {
      setOpen(true)
      return
    }
    setPendingLineId(lineId)
    setActiveName(pizza.name)
    setDraft(emptyDraft())
  }

  function saveCustomizations() {
    if (!activePizza || !pendingLineId) return
    const hasChanges = draft.extras.length > 0 || draft.removals.length > 0 || draft.note.trim()
    if (hasChanges) {
      refineItem(pendingLineId, activePizza, draft)
    } else {
      setOpen(true)
    }
    closeCustomize()
  }

  return (
    <section id="order" className="section section--tight order" data-reveal>
      <div className="order__head">
        <div className="section__intro">
          {ordering.eyebrow ? <p className="eyebrow">{ordering.eyebrow}</p> : null}
          <h2 className="section__title">{ordering.title}</h2>
          <p className="section__body">{ordering.intro}</p>
        </div>

        {/* The only photo on the site with people in it. Worth having: the
            section is otherwise a price list, and the shirt happens to be
            Rosato's own Pizza Club merch, so it earns its place here rather
            than being decoration borrowed from somewhere else. */}
        {ordering.photo?.base ? (
          <figure className="order__figure">
            <Photo
              base={ordering.photo.base}
              alt={ordering.photo.alt || ''}
              sizes="(min-width: 860px) 42vw, 92vw"
            />
          </figure>
        ) : null}
      </div>

      <ul className="order__list">
        {pizzas.map((pizza) => {
          const isOpen = activeName === pizza.name
          return (
            <li className={`order__item${isOpen ? ' is-open' : ''}`} key={pizza.name}>
              <div className="order__item-copy">
                <h3 className="order__item-name">{pizza.name}</h3>
                {pizza.description ? <p className="order__item-desc">{pizza.description}</p> : null}
              </div>

              <div className="order__actions">
                <span className="order__item-price">{formatEuro(Number.parseFloat(pizza.price))}</span>
                <button
                  type="button"
                  className="btn btn--ghost btn--small order__add"
                  onClick={() => handleAdd(pizza)}
                >
                  Add
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {canCustomize && activePizza ? (
        <div
          className="customize-sheet is-open"
          role="dialog"
          aria-modal="true"
          aria-label="Customize pizza"
          data-dialog-root
        >
          <div className="customize-sheet__backdrop" onClick={keepAsIs} />
          <div className="customize-sheet__panel" ref={panelRef} tabIndex={-1}>
            <p className="order__customize-lead">Added {activePizza.name}. Want to customize?</p>

            {leaveOffs.length > 0 ? (
              <fieldset className="order__fieldset">
                <legend>Leave off</legend>
                <div className="order__options">
                  {leaveOffs.map((option) => {
                    const checked = draft.removals.some((row) => row.id === option.id)
                    return (
                      <label key={option.id} className="order__option">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setDraft((current) => ({
                              ...current,
                              removals: toggleOption(current.removals, option),
                            }))
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}

            <fieldset className="order__fieldset">
              <legend>Extra · +{formatEuro(extraPrice)} each</legend>
              <div className="order__options">
                {extras.map((option) => {
                  const checked = draft.extras.some((row) => row.id === option.id)
                  return (
                    <label key={option.id} className="order__option">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setDraft((current) => ({
                            ...current,
                            extras: toggleOption(current.extras, option),
                          }))
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <label className="order__line-note">
              Note <span className="optional">(optional)</span>
              <input
                type="text"
                value={draft.note}
                onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
                placeholder={customizations.notePlaceholder || 'Anything else for this pizza?'}
              />
            </label>

            <div className="order__customize-actions">
              <p className="order__customize-total">
                <span>This pizza</span>
                <strong>{formatEuro(draftPrice)}</strong>
              </p>
              <div className="order__customize-buttons">
                <button type="button" className="btn btn--ghost" onClick={keepAsIs}>
                  Keep as is
                </button>
                <button type="button" className="btn btn--primary" onClick={saveCustomizations}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}


      <p className="order__note">
        {ordering.leadNote || `Usually ready in around ${ordering.leadMinutes} minutes.`} · Kitchen
        until {ordering.kitchenCloses} · {ordering.payNote}
      </p>
    </section>
  )
}
