# Rosato's pilot — field set

Demo build of Hybrid + Light for Rosato's. Admin should be obvious without
training theatre, same bar this template was designed to clear.

## Pitch line

*You keep the week honest. We keep the place looking like itself.*

## Fields to confirm with the Rosato's team (normal month)

Ask them to mark each: **use weekly** / **use sometimes** / **never**.

### This week's music

| Field | Likely | Notes |
|---|---|---|
| Artist / event name | weekly | |
| Day + time | weekly | |
| Header cue | sometimes | Auto from name · time is enough for most weeks |
| Tonight override | rare | Only when the auto line is wrong |
| Board cards | sometimes | Or leave to Quiet Objects |
| Instagram note | rare | |

### Menu (light)

| Field | Likely | Notes |
|---|---|---|
| Item name | weekly | |
| Price | weekly | |
| Description | sometimes | |
| Add / remove specials | weekly | |
| Pizza list (Order Pizza section) | monthly | |
| Fee note | rare | |

### Out of admin (Quiet Objects)

- Colours, fonts, hero, new pages
- ResDiary booking widget URL/config — set up once, not editable day-to-day
- Gift-card link (rosatos.ie product page) — outbound only, we don't run their store
- Full brunch/lunch/dinner/drinks CMS restructuring

## After the pilot

1. Remove any field they never touch from `public/admin/config.yml`.
2. Rename labels to their words if needed ("Update Saturday band", not "Manage content modules").
3. Keep gift cards as a Visit / footer link unless they say it's a core channel.

## Booking (locked for v1)

Booking runs through a ResDiary widget, opened from a "Book a table" trigger
rather than embedded permanently in the page (see the booking overlay work —
the widget's own styling doesn't match the site, so it only appears when
someone actually wants it, framed as a distinct external tool).

## Gift cards (locked for v1)

Link: https://rosatos.ie/product/gift-card/
People pay on Rosato's own site. We only link out.
