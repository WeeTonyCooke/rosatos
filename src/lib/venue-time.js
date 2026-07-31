/**
 * "What time is it at the pub?" — not on the visitor's device.
 *
 * Everything that decides whether the kitchen is open, which collection slots
 * to offer, or which night is "tonight" used a bare `new Date()`. That reads
 * the *visitor's* clock. Tested with a browser on Asia/Dubai: the real time in
 * Moville was 14:25 on a Thursday, the venue was shut until 16:00, and the site
 * cheerfully offered collection slots from 18:00 to 21:00.
 *
 * It matters for more than travellers. Anyone whose phone is on the wrong
 * timezone, and every visitor abroad looking up an Irish pub, gets answers
 * computed against the wrong day and the wrong hour.
 *
 * Everything here works in minutes-since-midnight *in the venue's timezone*,
 * which sidesteps Date arithmetic entirely — no local-vs-UTC confusion, and
 * DST is handled by Intl rather than by us.
 */
export const VENUE_TIMEZONE = 'Europe/Dublin'

const DAY_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: VENUE_TIMEZONE,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/**
 * The current day and time at the venue.
 * @returns {{ day: number, minutes: number }} day 0 = Sunday, minutes since midnight
 */
export function venueNow(at = new Date()) {
  const parts = Object.fromEntries(
    formatter.formatToParts(at).map((part) => [part.type, part.value]),
  )
  const hour = Number(parts.hour) % 24
  return {
    day: DAY_INDEX[parts.weekday] ?? at.getDay(),
    minutes: hour * 60 + Number(parts.minute),
  }
}

/** The calendar year at the venue — for the footer copyright line. */
export function venueYear(at = new Date()) {
  return Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: VENUE_TIMEZONE, year: 'numeric' }).format(at),
  )
}

/** "16:00" -> 960. Returns null for anything unparseable. */
export function toMinutes(hhmm) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm).trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

/** 960 -> "16:00". Formatted by hand so it can't pick up a device locale. */
export function toClock(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
