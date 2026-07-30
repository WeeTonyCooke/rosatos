import { useEffect, useRef } from 'react'

/**
 * The behaviour `role="dialog" aria-modal="true"` promises.
 *
 * All three overlays on this site (cart drawer, booking sheet, pizza
 * customise sheet) declared aria-modal but implemented none of what it means:
 * Escape did nothing, focus never entered the dialog, Tab walked straight out
 * into the page behind, and the background was never hidden from assistive
 * tech. A screen reader user could tab into content the ARIA contract said
 * was inaccessible; a keyboard user had no way to close any of them.
 *
 * Pass a ref to the dialog's panel and a close callback.
 *
 * Note on `inert`: it's applied to the *siblings* of the dialog rather than a
 * single wrapper, because these overlays are rendered as direct children of
 * <body>'s React root alongside the content they need to cover. Marking an
 * ancestor would also mark the dialog itself.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableWithin(root) {
  if (!root) return []
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
  )
}

export function useDialog(panelRef, { open, onClose }) {
  // Held in a ref so the cleanup closes over the element that was focused when
  // the dialog opened, not whatever is focused when it closes.
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const panel = panelRef.current
    previouslyFocused.current = document.activeElement

    // Move focus in. Prefer the first control; fall back to the panel itself
    // (which needs tabIndex={-1}) so focus never stays stranded on <body>.
    const initial = focusableWithin(panel)[0] || panel
    initial?.focus?.()

    // Hide everything else from assistive tech and the tab order.
    const marked = []
    if (panel) {
      const dialogRoot = panel.closest('[data-dialog-root]') || panel.parentElement
      for (const node of Array.from(document.body.children)) {
        if (node === dialogRoot || node.contains(dialogRoot) || node.tagName === 'SCRIPT') continue
        if (node.hasAttribute('inert')) continue
        node.setAttribute('inert', '')
        marked.push(node)
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusableWithin(panelRef.current)
      if (!items.length) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      // Wrap at both ends, and pull focus back in if it has escaped somehow.
      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panelRef.current?.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      for (const node of marked) node.removeAttribute('inert')
      // Return focus to whatever opened the dialog, so keyboard users don't
      // get dumped back at the top of the document.
      const target = previouslyFocused.current
      if (target && typeof target.focus === 'function' && document.contains(target)) {
        target.focus()
      }
    }
  }, [open, onClose, panelRef])
}
