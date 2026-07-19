# Rosato's — Design System

This formalizes the tokens already in `src/styles.css` into a single
reference, with the rationale and accessibility numbers behind each
decision. If a value here and a value in the CSS ever disagree, the CSS
is correct — update this doc to match, not the other way round.

## Color

### The palette

Six named colors, chosen deliberately as a complete set rather than
derived one at a time — the earlier `--forest`/`--rosato-red`/`--brass`/
`--putty` values in this project were each individually reverse-engineered
(from a logo screenshot, matched against Farrow & Ball, computed from
color theory) and it showed: pieces that were individually reasonable
didn't necessarily relate to each other well as a set. **Forest, Stone,
Cream, Bronze, Tomato, Charcoal** were provided together as one
considered palette, which is why the tonal relationships (see Stone vs.
Cream below) hold together better than the incremental version did.

| Token | Hex | Role | Contrast vs. `--cream` |
|---|---|---|---|
| `--forest` | `#234d43` | Primary brand color — headers, primary buttons, dark sections | 8.42:1 (AAA) |
| `--cream` | `#f5f1ea` | Base background | — |
| `--charcoal` | `#303336` | Body text (`--ink`) | 11.29:1 (AAA) |
| `--tomato` | `#9e3b36` | Accent — today-highlight, small accents, error text | 5.95:1 — **passes AA at all text sizes**, including small body text |
| `--bronze` | `#a98545` | Accent — borders, dividers, icons only | 3.04:1 vs cream, 2.77:1 vs forest — **never use as text on either background** |
| `--stone` | `#c8bcab` | Mid-value warm neutral — same hue family as `--cream`/`--bronze` (H35-38°), fills the value gap between them. Used for elevated surfaces — sheet/modal panels, Menu section, cart-drawer empty state | 6.80:1 (charcoal text), 5.08:1 (forest text) — both AA/AAA |

Tomato clearing AA at every text size (5.95:1) is a genuine improvement
over the previous red (`#e03145`, 3.87:1, which failed below large-text
size and needed a separate darkened `--signal-text` workaround token just
for small error text). That workaround is gone — tomato itself is now
safe everywhere, so `.cart-drawer__error` uses it directly.

**Rule of thumb:** `--bronze` is an accent color, not a text color, at any
size or background in this palette — keep it to borders, dividers, and
icons. `--tomato` is now safe as text throughout, unlike its predecessor.

### Why Stone-on-Cream works where the previous mid-tone didn't

Stone (`L73%`) and Cream (`L94%`) are 21 lightness-points apart — on paper,
a similar-looking gap to the one that failed in the previous iteration
(Cream `L93%` vs. the old Putty `L72%`, which read as a "cliff" no
gradient-fade could smooth over: Cream was so pale its warmth barely
registered, so a visibly tan/beige mid-tone below it felt like two
unrelated materials meeting, not one surface deepening). The difference
this time is hue and saturation *tracking together* far more closely
(Stone H35°/S21% vs. Cream H38°/S35% — both close in hue, and Stone's
saturation drop is gentler relative to its lightness drop than the old
Putty's was), which is what actually determines whether two tones read as
"the same warm family at different depths" versus "two different colors."
A gradient-fade was tried between sections (`.pint::after`, `.menu::before`)
to ease the forest→cream→stone transition, and it did work in isolation —
but it was removed. Every other section boundary on the page is a clean
flat cut; having exactly one soft transition made that one boundary look
like an unfinished accident rather than a deliberate choice. Consistency
of *treatment* across section boundaries matters more than optimizing any
one boundary in isolation — a clean hard edge between well-related colors
(which Stone/Cream now are, see above) doesn't need a fade to not look
amateurish; that critique applied to the *old*, poorly-related color pairs
early in this project, not to a properly designed palette.

### Derived tokens

Everything else is computed *from* the six primaries via `color-mix()`,
deliberately — a hardcoded derived color silently goes stale the next
time the base color changes, because `rgba()` can't reference a CSS
variable's channels directly. This bit twice in this project: once with
`--accent-soft` (still pointing at a pre-rebrand green after `--forest`
changed), and more seriously during this palette finalization, when a
full audit of the stylesheet found **eleven separate hardcoded `rgba()`
values** still referencing the *original* pre-project colors — some
dating back further than any color change made during this whole
engagement, silently un-updated the entire time (shadows, overlays, hover
states, the sticky header's ticker background, all quietly wrong).
`color-mix()` fixes this permanently — derived tokens now track their
source automatically, so the next color change can't silently miss
anything the way these did.

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
