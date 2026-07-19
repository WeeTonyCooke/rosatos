# Rosato's — Design System

This formalizes the tokens already in `src/styles.css` into a single
reference, with the rationale and accessibility numbers behind each
decision. If a value here and a value in the CSS ever disagree, the CSS
is correct — update this doc to match, not the other way round.

## Color

### Forest green

`--forest` is a deliberately designed color, not a sampled or matched one.
Early passes in this project tried to reverse-engineer "the real Rosato's
green" from a logo screenshot, and separately checked whether Farrow & Ball
had a paint that matched it. Neither turned out to be the right question:
a compressed screenshot of a small logo isn't a reliable source of truth
for a full-viewport UI color, and F&B's actual green range (Studio Green
`#363c3c`, Carriage Green `#434d48`, and several others checked directly
against real paint swatches) sit at 5–12% saturation — deliberately muted,
olive-or-gray-toned darks, a different design language entirely from
anything sampled from Rosato's branding.

The working insight: a color that reads well as a small logo mark (very
saturated) doesn't necessarily read well as a large flat background field
(same saturation across an entire viewport can feel loud rather than
premium — a well-established UI principle, not specific to this brand).
So rather than continuing to chase "the one true green" from a source
image, `--forest` (`#1f473d`) was designed directly: same hue family as
Rosato's branding (a blue-leaning forest green, not a generic yellow-green
"pub olive"), tuned to a saturation and lightness that hold up across
large sections, headers, and buttons alike. It clears WCAG AAA against
`--cream` at 8.97:1.

If this is ever needed as a physical paint match for the building, that's
a separate exercise — this token was designed for screens, not walls.
Farrow & Ball still isn't the obvious source for it regardless (see above);
a brand with more saturated greens (Little Greene, Coat, or a bespoke tint)
would be the better starting point.

### Full palette

| Token | Hex | Role | Contrast vs. `--cream` |
|---|---|---|---|
| `--forest` | `#1f473d` | Primary brand color — headers, primary buttons, dark sections | 8.97:1 (AAA) |
| `--cream` | `#f3eee6` | Base background | — |
| `--charcoal` | `#2d3133` | Body text (`--ink`) | 11.37:1 (AAA) |
| `--rosato-red` | `#e03145` | Accent — sampled from the façade brick. Sparing use only (today-highlight, small accents) | 3.87:1 — **fails AA below large-text size** |
| `--brass` | `#b68a42` | Accent — borders, dividers, icons only | 2.71:1 vs cream, 3.31:1 vs forest — **never use as text on either background** |
| `--signal-text` | `#8e1523` | Same hue as `--rosato-red`, darkened for small-text use (error messages, etc.) | 7.97:1 (AAA) |
| `--putty` | `#ccbda4` | Mid-value warm neutral — same hue family as `--cream`/`--brass` (H37-40°), fills the value gap between them (cream L93%, brass L49%, nothing in between before this). Used for elevated surfaces — sheet/modal panels — so they read as a distinct layer above the page rather than flat cream-on-cream | 7.12:1 (charcoal text), 5.62:1 (forest text) — both pass AA |

The prompt for this addition was looking at Farrow & Ball's own color-scheme
pages (wall + trim + accent, presented together) and noting the site's
existing five-color system jumped almost straight from very-dark-green to
very-light-cream with nothing in between — thin rather than rich. The fix
adopts F&B's *methodology* (a considered tonal ladder, not just two
extremes) without adopting their actual hues, which stay in an unrelated
muted-olive family (see the forest green rationale above).

**Rule of thumb:** `--rosato-red` and `--brass` are accent colors, not text
colors, except at large/bold sizes (≥1.17rem bold, or ≥1.5rem regular) where
`--rosato-red` clears the 3:1 large-text threshold. Any small text that
needs to read as "red" (errors, warnings) uses `--signal-text` instead —
this was a real bug (`.cart-drawer__error` was using the brand red at
`0.9rem`, failing AA) fixed as part of this pass.

### Derived tokens

Everything else is computed *from* the five primaries via `color-mix()`,
deliberately — a hardcoded derived color (like the old `--accent-soft`
and `--rosato-green-mid`) silently goes stale the next time the base color
changes. That already happened once this session: `--accent-soft` was
still pointing at the pre-rebrand green hex after `--forest` was updated,
because `rgba()` can't reference a CSS variable's channels directly.
`color-mix()` fixes this permanently — derived tokens now track their
source automatically.

## Typography

- **Display** (`--font-display`): Fraunces — serif, used for all headings.
  Scales via `clamp()` per section rather than fixed breakpoints, so
  headline size responds smoothly to viewport width instead of jumping.
- **Body** (`--font-body`): Source Sans 3.
- Base body size is `1.125rem` (18px) — chosen so nothing on the page
  reads as "default browser text," and so most body copy sits above the
  large-text accessibility threshold on its own.

## Spacing

A six-step scale (`--space-1` through `--space-6`, 0.5rem to 7rem) used
everywhere instead of arbitrary pixel/rem values. The one exception found
and fixed this session was the `.is-today` highlight, which used
hand-picked `-0.65rem` values that didn't correspond to any step in this
scale or to the section's own responsive padding — it visibly drifted
out of alignment at different viewport widths. Anything bleeding into a
container's own padding should reference that container's actual padding
token, not a new hand-picked number.

## Motion

One easing curve (`--ease: cubic-bezier(0.22, 1, 0.36, 1)`) used for every
transition and animation on the site — sheet slide-ups, hover states,
scroll reveals. `prefers-reduced-motion` is respected globally (see the
`@media (prefers-reduced-motion: reduce)` block near the top of
`styles.css`), collapsing all animation/transition durations to near-zero
rather than disabling them individually per component.

## Components

### Buttons

Two weights, deliberately: `.btn--primary`/`.btn--ghost` for hero-level
actions ("Book a table," "Order pizza for collection"), and `.btn--small`
for repeated in-list actions (the pizza "Add" button). Before this pass,
every button on the site shared one size regardless of how often it
repeated or how important the action was — a once-per-page CTA and a
five-times-per-list micro-action read with identical visual weight.

### Overlays (bottom sheet / modal)

`.customize-sheet` is the shared pattern for anything that needs to
interrupt the page temporarily without reshuffling the content around it:
the pizza customizer and the booking widget both use it. Bottom sheet on
mobile (slides up, backdrop, scroll-locked via `body:has(.customize-sheet.is-open)`),
centered modal from 900px up. Third-party embeds (the ResDiary booking
iframe) go inside this pattern specifically so their un-matched styling
reads as "an external tool just opened," not "part of the page broke" —
framed with its own small label and close control rather than restyled
(which isn't possible for cross-origin iframe content anyway).

### List rows

Rows with a divider (`border-bottom: 1px solid var(--line)`), never a
filled/outlined card, even for emphasis — see the `.is-today` fix, which
replaced a bolted-on filled box with a quiet left-border accent that
respects the existing row rhythm and divider language instead of
introducing a second visual system for one row.

## Known constraints, not yet resolved

- Hero illustration (`hero.png`) is flat vector art — a different visual
  register from the site's photography and typography. Cannot be
  restyled without redrawing it (it's Rosato's actual brand mark); Adobe
  grain/texture pass on it was attempted but never completed (stuck
  pending on Adobe's side).
- The two real photos (pint, fireplace) are color-graded toward this
  palette (`scripts/optimize-images.mjs`) but are still snapshots, not
  commissioned photography — there's a ceiling on how far grading alone
  can take them.
