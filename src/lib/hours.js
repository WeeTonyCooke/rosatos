import { toMinutes, venueNow } from './venue-time.js'

/**
 * Turn venue.json's human "hours" rows (e.g. "Monday – Friday" / "16:00 – 21:00")
 * into a lookup so we can tell whether the kitchen is actually open right now —
 * not just whether it's before the closing time. day: 0 = Sunday … 6 = Saturday,
 * matching lib/programme.js.
 *
 * Works in minutes-since-midnight in the VENUE's timezone rather than in Date
 * objects on the visitor's clock. See lib/venue-time.js for why that matters.
 */
const DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

function expandDayRange(daysLabel) {
  const parts = daysLabel
    .split(/[–—-]/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 1) {
    const index = DAY_INDEX[parts[0]]
    return index === undefined ? [] : [index]
  }

  const start = DAY_INDEX[parts[0]]
  const end = DAY_INDEX[parts[parts.length - 1]]
  if (start === undefined || end === undefined) return []

  const days = []
  let cursor = start
  // eslint-disable-next-line no-constant-condition
  while (true) {
    days.push(cursor)
    if (cursor === end) break
    cursor = (cursor + 1) % 7
  }
  return days
}

/** { open, close } as minutes since midnight for the given weekday, or null. */
export function getHoursForDay(hours, weekday) {
  const rows = Array.isArray(hours) ? hours : []
  for (const row of rows) {
    if (!row?.days || !row?.time) continue
    if (!expandDayRange(row.days).includes(weekday)) continue
    const [open, close] = row.time.split(/[–—-]/).map((part) => toMinutes(part.trim()))
    if (open != null && close != null) return { open, close }
  }
  return null
}

/**
 * Today's window at the venue, in minutes since midnight, alongside the venue's
 * current time — so callers never touch a Date at all.
 * `openWindow` is null when the venue isn't listed as open today.
 */
export function getTodaysWindow(hours, at = new Date()) {
  const now = venueNow(at)
  return { now, openWindow: getHoursForDay(hours, now.day) }
}
