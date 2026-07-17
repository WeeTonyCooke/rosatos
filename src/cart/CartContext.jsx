import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

function parsePrice(value) {
  const n = Number.parseFloat(String(value).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function formatEuro(amount) {
  return `€${amount.toFixed(2)}`
}

export function formatLineMods(row) {
  const bits = []
  if (row.removals?.length) {
    bits.push(`No ${row.removals.map((item) => item.label).join(', ')}`)
  }
  if (row.extras?.length) {
    bits.push(`Extra ${row.extras.map((item) => item.label).join(', ')}`)
  }
  if (row.note?.trim()) {
    bits.push(row.note.trim())
  }
  return bits.join(' · ')
}

function lineSignature({ name, extras = [], removals = [], note = '' }) {
  return JSON.stringify({
    name,
    extras: extras.map((item) => item.id).sort(),
    removals: removals.map((item) => item.id).sort(),
    note: note.trim().toLowerCase(),
  })
}

function unitPriceFor(pizza, extras, extraPrice) {
  return parsePrice(pizza.price) + extras.length * extraPrice
}

export function CartProvider({ children, venue }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)

  const pizzas = useMemo(() => {
    const section = venue.menu.sections.find((s) => s.id === venue.ordering?.menuSectionId)
    return section?.items ?? []
  }, [venue])

  const customizations = venue.ordering?.customizations || null
  const extraPrice = Number(customizations?.extraPrice) || 0

  function addItem(pizza, options = {}) {
    const extras = Array.isArray(options.extras) ? options.extras : []
    const removals = Array.isArray(options.removals) ? options.removals : []
    const note = typeof options.note === 'string' ? options.note.trim() : ''
    const openCart = options.openCart !== false
    const signature = lineSignature({ name: pizza.name, extras, removals, note })
    const unitPrice = unitPriceFor(pizza, extras, extraPrice)

    setItems((current) => {
      const existing = current.find((row) => row.id === signature)
      if (existing) {
        return current.map((row) => (row.id === signature ? { ...row, qty: row.qty + 1 } : row))
      }
      return [
        ...current,
        {
          id: signature,
          name: pizza.name,
          description: pizza.description,
          basePrice: parsePrice(pizza.price),
          extras,
          removals,
          note,
          unitPrice,
          qty: 1,
        },
      ]
    })
    if (openCart) setOpen(true)
    return signature
  }

  /** Peel one unit off `fromId` and re-add it with new toppings / note. */
  function refineItem(fromId, pizza, options = {}) {
    const extras = Array.isArray(options.extras) ? options.extras : []
    const removals = Array.isArray(options.removals) ? options.removals : []
    const note = typeof options.note === 'string' ? options.note.trim() : ''
    const openCart = options.openCart !== false
    const nextId = lineSignature({ name: pizza.name, extras, removals, note })
    const unitPrice = unitPriceFor(pizza, extras, extraPrice)

    if (nextId === fromId) {
      if (openCart) setOpen(true)
      return nextId
    }

    setItems((current) => {
      const from = current.find((row) => row.id === fromId)
      if (!from) {
        const existing = current.find((row) => row.id === nextId)
        if (existing) {
          return current.map((row) => (row.id === nextId ? { ...row, qty: row.qty + 1 } : row))
        }
        return [
          ...current,
          {
            id: nextId,
            name: pizza.name,
            description: pizza.description,
            basePrice: parsePrice(pizza.price),
            extras,
            removals,
            note,
            unitPrice,
            qty: 1,
          },
        ]
      }

      let next = current
        .map((row) => (row.id === fromId ? { ...row, qty: row.qty - 1 } : row))
        .filter((row) => row.qty > 0)

      const existing = next.find((row) => row.id === nextId)
      if (existing) {
        next = next.map((row) => (row.id === nextId ? { ...row, qty: row.qty + 1 } : row))
      } else {
        next = [
          ...next,
          {
            id: nextId,
            name: pizza.name,
            description: pizza.description,
            basePrice: parsePrice(pizza.price),
            extras,
            removals,
            note,
            unitPrice,
            qty: 1,
          },
        ]
      }
      return next
    })
    if (openCart) setOpen(true)
    return nextId
  }

  function setQty(id, qty) {
    setItems((current) => {
      if (qty <= 0) return current.filter((row) => row.id !== id)
      return current.map((row) => (row.id === id ? { ...row, qty } : row))
    })
  }

  function clear() {
    setItems([])
  }

  const count = items.reduce((sum, row) => sum + row.qty, 0)
  const total = items.reduce((sum, row) => sum + row.unitPrice * row.qty, 0)

  const value = {
    enabled: Boolean(venue.ordering?.enabled),
    ordering: venue.ordering,
    customizations,
    extraPrice,
    pizzas,
    items,
    count,
    total,
    totalLabel: formatEuro(total),
    open,
    setOpen,
    addItem,
    refineItem,
    setQty,
    clear,
    formatEuro,
    formatLineMods,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
