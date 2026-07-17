/**
 * Turn venue.json's human "hours" rows (e.g. "Monday – Friday" / "16:00 – 21:00")
 * into a lookup so we can tell whether the kitchen is actually open right now —
 * not just whether it's before the closing time. day: 0 = Sunday … 6 = Saturday,
 * matching lib/programme.js.
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

/** { open: 'HH:MM', close: 'HH:MM' } for the given weekday, or null if unlisted. */
export function getHoursForDay(hours, weekday) {
  const rows = Array.isArray(hours) ? hours : []
  for (const row of rows) {
    if (!row?.days || !row?.time) continue
    if (!expandDayRange(row.days).includes(weekday)) continue
    const [open, close] = row.time.split(/[–—-]/).map((part) => part.trim())
    if (open && close) return { open, close }
  }
  return null
}

function atTime(date, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const next = new Date(date)
  next.setHours(h, m, 0, 0)
  return next
}

/**
 * Open/close Date objects for "today" (relative to `now`), or null if the
 * venue isn't listed as open that day at all.
 */
export function getTodaysWindow(hours, now = new Date()) {
  const todays = getHoursForDay(hours, now.getDay())
  if (!todays) return null
  return { open: atTime(now, todays.open), close: atTime(now, todays.close) }
}
