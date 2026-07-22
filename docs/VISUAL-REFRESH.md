# Visual Refresh — Design System

Response to the brand/product design brief: refine the existing site to
match the hero's standard, rather than reinvent it. This document is the
13 deliverables requested; the accompanying code changes implement items
2, 6, 7, 8, and 11 directly (colour, radius/shadow, buttons, cards,
whitespace). Items 9/10/12 (homepage layout, section-by-section rework,
clutter reduction) are scoped here but need live visual iteration against
the real rendered site to finish properly — that's the honest limit of
doing this from source code alone without a browser preview.

## 1. Revised design system — summary

Four colours, one accent used sparingly, one button system with three
tiers, one radius value, minimal shadows reserved for genuinely floating
elements (modals, floating action buttons) rather than page-level cards.
The hero's restraint is now the whole site's baseline, not an exception.

## 2. Colour palette

| Role | Token | Hex |
|---|---|---|
| Hero Green | `--forest` | `#234d43` |
| Warm Paper | `--cream` | `#f5f1ea` |
| Dark Ink | `--charcoal` | `#303336` |
| Muted Terracotta (accent) | `--terracotta` | `#814b37` |

Retired: Bronze (`#a98545`, gold-adjacent, explicitly against the brief)
and Stone (`#c8bcab`, a second background colour). Both were part of an
earlier six-colour system built up incrementally over this project's
sessions — reasonable in isolation, but exactly the "too many colours,
too many greens and creams" problem this brief calls out. Terracotta now
carries what both Tomato (the old bright red) and Bronze used to do:
today-highlight, small accents, error text — one quiet accent, not two
competing ones. Contrast-checked at 6.23:1 against Warm Paper (AAA).

No more colour-tinted borders or section backgrounds — `--line-strong` is
now neutral (a darker tint of Dark Ink), and every section uses Warm
Paper. Sections that previously had a distinct background (Menu, Gift
Cards, the pizza-customizer sheet) now rely on whitespace, not a colour
change, to read as separate.

## 3. Typography

No change to the type stack (Fraunces display / Source Sans 3 body) —
the brief explicitly says retain existing typographic character. Hierarchy
continues to come from scale, weight, and spacing rather than colour,
which was already true; the main typography-adjacent change is more
`margin-bottom` around headings via the spacing scale below, giving
headings more room to breathe before body copy starts.

## 4. Spacing scale

| Token | Old | New |
|---|---|---|
| `--space-1` | 0.5rem | 0.5rem |
| `--space-2` | 1rem | 1rem |
| `--space-3` | 1.5rem | 1.5rem |
| `--space-4` | 2.5rem | 2.5rem |
| `--space-5` | 4rem | 4.5rem |
| `--space-6` | 7rem | 9rem |

`--space-6` drives every section's vertical padding — this single change
gives every section on the page roughly 30% more breathing room above
and below without touching per-section CSS individually. `--space-5`
(heading-to-content gap) got a smaller bump for the same reason.

## 5. Border radius

Unchanged — `--radius: 2px` was already minimal and consistent
site-wide (one value, not several), which matches the brief's intent.
No action needed here; flagging it as reviewed, not skipped.

## 6. Shadow system

Ten `box-shadow` declarations audited. Kept where the shadow is doing
real work — floating action buttons (cart, order pizza) and modals need
some elevation cue to read as tappable/floating, that's not decoration,
it's affordance. Softened the one that was heaviest for what it does (the
desktop customize-sheet modal, `20px/50px/22%` → `16px/40px/16%`). No
shadow on a plain in-page section or card — there weren't any to begin
with once Stone-background "cards" were flattened to plain Warm Paper.

## 7. Button system

Three tiers, matching the brief exactly:

- **Primary** (`.btn--primary`) — solid Hero Green fill, Warm Paper text.
  Reserved for the one true CTA per section (Book a table, checkout, save).
- **Secondary** (`.btn--ghost`) — outlined, transparent, Dark Ink text.
  Redefined this pass: it was previously styled only for dark
  backgrounds (light border/text, meant for the hero) and had drifted
  into use on light backgrounds too, where it would have been nearly
  invisible. Now it's a proper light-background secondary style.
- **Text link** (`.text-link`) — no button chrome, coloured text,
  underline on hover. Two near-duplicate implementations of this
  (`.text-link` and `.menu__order-link a`) existed before this pass;
  merged into one.

One necessary exception: `.btn--on-hero` — a light-fill variant that
exists only because the Hero section's background *is* Hero Green, so
Primary's own fill would be invisible there. This isn't a fourth
competing style; it's Primary adapted for the one place it needs to
invert. `.btn--small` is a size utility (for dense list contexts like the
pizza Add button), not a fourth visual treatment — it pairs with
Secondary now, not Primary, since a button repeated five times in a list
shouldn't carry the same visual weight as the page's one true CTA. That
was a real, meaningful fix: the pizza "Add" buttons were previously
styled as Primary, diluting exactly the "primary stands out because it's
rare" principle this brief asks for.

## 8. Card system

Reduced, not eliminated. Real remaining "cards": the pizza-customizer
sheet, the booking-widget overlay, the gift-card QR code. All three are
genuine overlays/modals (interrupting the page temporarily), not
in-page decorative containers — the brief's card guidance is really
about page-level containers, and there weren't many of those to begin
with once Stone-background sections were flattened. Where a card-like
container remains, it now sits on Warm Paper with a neutral border, not
a second background colour.

## 9. Homepage layout recommendations

Not changed in this pass — the current section order (Hero → Room →
Great pints → Menu → Order Pizza → What's On → Gift Cards → Visit) is
reasonable and matches the brief's instruction not to touch information
architecture unless it clearly improves usability. The one candidate
worth considering later: whether Gift Cards needs to be a full dedicated
section at all, or whether it could fold into Visit as a quieter mention
— the brief's whitespace/restraint philosophy would say fewer sections
is better if the content doesn't need its own full-width block. Flagging
as a question, not a decision made unilaterally here.

## 10. Section-by-section visual improvements

This is the item most in need of an actual visual pass with real
screenshots, not just source-reading — increasing whitespace and
flattening background colours (done) address the "generic template"
complaint structurally, but whether each section's specific layout
(photo placement, text alignment, image sizing) now feels like an
editorial block rather than a card needs to be judged against the
rendered page, the same way every other visual call this project has
made needed a live look rather than code-only guessing.

## 11. Whitespace recommendations

Implemented via the `--space-5`/`--space-6` increases above. Further
candidate if the current bump isn't enough once seen live: increasing
the gap between a section's photo and its copy specifically (currently
`--space-4`, 2.5rem) — the brief calls this out by name ("more generous
spacing between photographs and copy") and it wasn't touched yet,
since it's a smaller, more surgical change worth doing after seeing
whether the bigger section-level change already solves most of it.

## 12. Reducing visual clutter

Directly addressed: one fewer background colour family (Stone/Bronze
retired), one fewer competing button style (Add button demoted from
Primary to Secondary), two near-duplicate link styles merged into one,
softened the heaviest shadow. What's left to audit visually: whether any
section still has more than one visual "event" competing for attention
at once (a coloured background *and* a border *and* a shadow, stacked) —
worth a proper screenshot-by-screenshot pass once this deploys.

## 13. Brand identity recommendations

The brief's own framing is the right one and doesn't need much added to
it: the hero already nails "a neighbourhood restaurant with excellent
design," and the fix for the rest of the site was never going to be new
decoration — it was removing the things that made other sections feel
like a different, more generic site than the hero promised. That's what
this pass did: fewer colours, fewer competing button weights, more room
to breathe. The next real test is whether it holds up rendered, live,
against the hero it's meant to match.
