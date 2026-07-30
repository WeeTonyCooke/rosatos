# Design Principles — Quiet Objects

Rams / Braun–inspired principles for **all Quiet Objects work**: the company site, client venues, demos, and products. Steer from here and **Built for Mars** when evaluating UI, copy, and features.

Source lineage: adapted from NicePints `DESIGN-PRINCIPLES.md` (same discipline; Quiet Objects framing). Related: [MANIFESTO.md](../MANIFESTO.md).

---

## North star

> The visitor should never feel that the experience is being performed for them. They have arrived in the middle of something that was already happening.

Every decision should answer:

> Does this make the experience quieter or louder?

If it makes the experience louder, do not do it.

For client sites, the parallel is: **a used place, not a tourist attraction.** Results, fixtures, bookings, and real activity beat brochure language.

---

## The ten principles

### 1. Clarity first

If a user has to think about what something does, the design has failed.

- Labels say what they mean: “Book a tee time”, not “Begin your journey”.
- One primary action per screen / first viewport.
- No mystery icons without context.

### 2. Restraint creates confidence

Don’t add features because you can. Add them because they make the product better.

- Say no to scope that doesn’t serve the real job (pint, tee time, fare, quote).
- Ship fewer screens, done well.
- Defer social / gamification until the core job works.

### 3. Calm interfaces win

The interface should feel quiet and deliberate, not like it’s shouting for attention.

- Restrained palette — project tokens, not default AI purple or cream-terracotta clichés.
- No autoplay spam, no flash, no notification theatre.
- Motion only when it aids understanding or presence.

### 4. Function determines form

Every visual element should have a purpose.

- A result line exists to prove the club is alive.
- A photo is evidence of the place, not decoration.
- Empty chrome does not encode meaning.

### 5. Build systems, not pages

Create reusable patterns and components rather than designing each screen independently.

- Shared header, forms, load/error states, section rhythm.
- Config-driven content where the template is the product (e.g. venue.json).
- Tokens / CSS variables, not one-off styles per section.

### 6. Let content provide the colour

Photos, scores, menus, and real activity should be the stars. The UI mostly gets out of the way.

- Imagery shows the product, place, or atmosphere.
- Accents are seasoning — never competing gradients or glow on every card.
- One calm primary CTA in the first viewport; progressive disclosure after.

### 7. Honest design

Don’t exaggerate. Don’t manipulate. Don’t pretend something is more important than it is.

- “Latest result” only if there is a real (or clearly demo) result.
- “Available” slots should feel like a working board, not fake urgency.
- No fake social proof, no invented scarcity.

### 8. Context is primary

Design for how people actually arrive — phone in a car park, thumb on a bar stool, laptop in an office.

- Mobile-first for venue and utility sites.
- Large tap targets; practical info (phone, fees, hours) easy to find.
- Desktop should not invent a second product.

### 9. Typography is communication

Text isn’t decoration. Hierarchy should make the page understandable without effort.

- Expressive display for brand / place names; clear sans for UI and practicals.
- Section labels can be tracked uppercase; body copy stays human.
- Place language (“Request this tee time”) over SaaS language (“Submit enquiry”).

### 10. Remove until it feels inevitable

Keep removing things until what’s left feels like it couldn’t be any other way.

- Cut dashboard tiles, pill clusters, and noticeboard clutter.
- If a screen needs a tutorial, simplify the screen.
- Every element should earn its place.

---

## 11. The real work is the product

**Not the website. Not the template. Not the animation. Not the Quiet Objects credit.**

The product is whatever the person came to do:

| Domain | The product |
|--------|-------------|
| Bar / pub | The room, the pint, the pizza, the night |
| Golf club | The round, the tee time, the card, the result |
| Cab | The fare home, the phone call, the trust |
| Trades | The quote, the work, the proof |
| NicePints | The pint |

Every screen should answer a real question for that domain (where / when / how much / is it open / who won / can I book). If a feature doesn’t help, defer it.

---

## Feature filter

### Fits the philosophy

| Pattern | Why |
|---------|-----|
| One primary CTA early | Clarity + calm |
| Latest results / fixtures early | Used place, not brochure |
| Green fees / prices as first-class | Honest decision info |
| Tee slots / booking path | Core job |
| Hole photos / menu / proof | Content provides colour |
| Phone + hours easy to find | Utility |
| Progressive disclosure | Restraint |

### Doesn’t fit the philosophy

| Pattern | Why |
|---------|-----|
| Hero full of stats, chips, promos | Noise; first viewport overload |
| Numbered quick-link tile dashboards | Melba visual debt — steal function, not chrome |
| Gamification, streaks, coins | Distraction |
| Fake urgency / fake reviews | Dishonest |
| Tourist itinerary as the homepage story | Attraction, not club |
| Autoplay video + popups | Loud |

When in doubt: **would Dieter Rams stay, or would he leave?**

---

## Built for Mars alignment

- One calm primary in the first viewport.
- Progressive disclosure; no dashboard tile clutter.
- Contextual next steps after the core job.
- Utility over social graph.
- Honest attribution and copy — no performative UI.

---

## Review checklist (before shipping)

1. Does it answer a real job for this place / product?
2. Can we remove anything and still ship it?
3. Does the UI stay quieter than the content?
4. Are we honest about what we claim?
5. Does the first viewport feel like a used place, not a brochure?
6. Is the primary action obvious on a phone?

---

## Product-specific tokens

Colour systems, type stacks, and component libraries live **in each project** (e.g. NicePints warm-black tokens, The Hearth Card Room Green, Mossy Glen sand/sea). This document is the shared discipline — not a single palette for every site.

---

## Decisions log

| Date | Decision | Principle |
|------|----------|-----------|
| 2025–26 | NicePints adopts Rams 10 + “pint is the product” | Source discipline |
| 2026-07 | Quiet Objects adopts the same guide for all studio projects | Studio-wide |
| 2026-07 | Client sites: used place over tourist attraction; results/activity early | North star + #11 |
| 2026-07 | Steal Melba/Athy function (slots, fees, results), not tile chrome | Restraint + BFM |
