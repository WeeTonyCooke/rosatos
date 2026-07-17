/**
 * Shared Tonight / programme helpers (Hybrid + Light).
 * day: 0 = Sunday … 6 = Saturday
 */

export function getTonight(programme, now = new Date()) {
  const day = now.getDay()
  const lineup = Array.isArray(programme?.lineup) ? programme.lineup : []
  const todays = lineup.filter((row) => Number(row.day) === day)
  const label = day === 0 ? 'Sunday' : 'Tonight'

  if (programme?.tonightOverride?.trim()) {
    return {
      day,
      label,
      short: programme.tonightOverride.trim(),
      detail: programme.tonightOverride.trim(),
      href: '#whats-on',
    }
  }

  if (todays.length) {
    const short = todays
      .map((row) => row.cue || [row.name, row.time].filter(Boolean).join(' · '))
      .join(' · ')
    const detail = todays
      .map((row) => row.detail || row.cue || [row.dayLabel, row.name, row.time].filter(Boolean).join(' · '))
      .join(' · ')
    const href = todays.find((row) => row.href)?.href || '#whats-on'
    return {
      day,
      label,
      short,
      detail,
      href,
      items: todays,
    }
  }

  return {
    day,
    label: 'This week',
    short: programme?.note || 'See what’s on below',
    detail: programme?.note || 'See what’s on below',
    href: '#whats-on',
    items: [],
  }
}

/**
 * Day-aware ribbon items: Tonight leads when there's an event;
 * otherwise a quiet-house cue, then the week from today forward.
 * Format: WEDNESDAY | Texas Hold’em • 21:30
 */
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function getTickerItems(programme, now = new Date()) {
  const day = now.getDay()
  const lineup = Array.isArray(programme?.lineup) ? programme.lineup : []
  const override = programme?.tonightOverride?.trim()

  const upcoming = [...lineup].sort((a, b) => {
    const da = (Number(a.day) - day + 7) % 7
    const db = (Number(b.day) - day + 7) % 7
    return da - db
  })

  const items = upcoming.map((row) => {
    const isToday = Number(row.day) === day
    const dayPart = (DAY_FULL[Number(row.day)] || row.dayLabel || 'On').toUpperCase()
    const namePart = (row.name || row.cue || 'On').trim()
    const timePart = row.time || ''
    return {
      kind: row.kind || 'other',
      day: dayPart,
      name: namePart,
      time: timePart,
      highlight: isToday,
    }
  })

  if (override) {
    items.unshift({
      kind: 'open',
      day: day === 0 ? 'SUNDAY' : 'TONIGHT',
      name: null,
      time: null,
      text: override,
      highlight: true,
    })
  } else if (!lineup.some((row) => Number(row.day) === day)) {
    items.unshift({
      kind: 'open',
      day: day === 0 ? 'SUNDAY' : 'TONIGHT',
      name: null,
      time: null,
      text: 'Open fires · great food · stone-baked pizza',
      highlight: true,
    })
  }

  return items
}

export function mergeVenue(venue, programme, menu) {
  return {
    ...venue,
    programme,
    menu,
  }
}
