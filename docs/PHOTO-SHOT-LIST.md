# Photo shot list — Rosato's

The site has **4 images**, two of which are an illustration and a QR code.
`@rosatosmoville` has hundreds, and they're good: the room, the fire, the pints,
the plates, the facade, the music, the staff. The gap isn't a lack of material —
it's that none of it is on the website.

Nothing below needs a new shoot. Every shot named here already exists on the
Instagram grid.

## Priority order

| # | Slot | Shot | Why this one |
|---|---|---|---|
| 01 | Menu → To start | Snug interior, fire lit, brass lamps | Sets the room before any food. Currently the site never shows the inside of the pub. |
| 02 | Menu → Mains | Battered haddock, mushy peas, tartare | Best food photo on the account. Sells the most profitable section. |
| 03 | Menu → full-bleed band | Red facade at dusk, awning lit / outdoor benches in sun | Breaks the two-column rhythm. This is the move 55 Malin Road makes that Rosato's doesn't. |
| 04 | Menu → Pizza | Two stone-baked pizzas on the outdoor bench | Product + setting in one frame; it's what the Order flow points at. |
| 05 | Menu → From the bar | Row of settled Guinness on the bar top | Strongest images on the account, full stop. |
| 06 | What's on | Live music — the duo with guitars, crowd in frame | Proves the programme is real. Currently it's a text list asking to be believed. |
| 07 | Visit | Street view, Rosato's sign, footpath | Orientation. Helps someone actually find the door. |
| 08 | Hero | Replace or pair the illustration with the real facade | See below. |

## The hero question

The illustrated facade is charming and it's doing brand work. But it's the first
thing every visitor sees and it's the one element on the page that isn't
evidence — against "a used place, not a tourist attraction," an illustration is
the more brochure-like choice. 55 Malin Road opens on a photograph of the actual
house and is stronger for it.

Instagram has the real thing from several angles, including a good dusk shot with
the awning lit.

Three options, in order of preference:

1. **Photograph as hero, illustration retained elsewhere** — as a section mark,
   the favicon, or the footer. Keeps the brand asset, leads with evidence.
2. **Split hero** — illustration left, photograph right, in the 55 Malin Road
   manner. Has the advantage of showing both the drawn identity and the real
   building.
3. **Leave it.** Defensible if the illustration is deliberately the brand's
   primary mark. But then the rest of the page has to carry the evidence, which
   currently it doesn't.

## What's missing from the account

Two things worth shooting, since everything else is covered:

- **A plated main other than the haddock** — the hot pot or the sirloin. The
  mains section is five items and one photo.
- **Staff behind the bar, mid-service, unposed.** There's one good shot of a
  barman pulling a pint. 55 Malin Road names its hosts and quotes a guest;
  Rosato's has no human presence on the site at all.

## Practical note

`scripts/optimize-images.mjs` handles the pipeline — drop originals into
`assets/source/`, add them to `TARGETS`, run it, and reference the generated
variants. Instagram exports are typically 1080px wide, so cap the widths
accordingly rather than upscaling; the `photo` kind applies the existing warm
colour grade that keeps images consistent with the palette.
