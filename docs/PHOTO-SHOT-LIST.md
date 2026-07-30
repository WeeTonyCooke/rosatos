# Photo shot list — Rosato's

The site has **4 images**, two of which are an illustration and a QR code.
`@rosatosmoville` has hundreds, and they're good: the room, the fire, the pints,
the plates, the facade, the music, the staff. The gap isn't a lack of material —
it's that none of it is on the website.

Nothing below needs a new shoot. Every shot named here already exists on the
Instagram grid.

## Now in place

Nine photos are live in the build, sourced from the Instagram grid.

| Slot | Image | Component |
|---|---|---|
| Menu → To start | `prawns` | `Menu.jsx` |
| Menu → Mains | `haddock` | `Menu.jsx` |
| Menu → atmosphere strip | `exterior-dusk`, `fire`, `cocktail` | `Menu.jsx` |
| Menu → Pizza | `pizzas` | `Menu.jsx` |
| Menu → From the bar | `guinness` | `Menu.jsx` |
| What's on | `music-snug-wide`, `music-mono-wide` | `WhatsOn.jsx` |

Generated but unused, available if a slot appears: `hake-noodles`,
`fish-noodles`.

### Resolution caveat

All of these are Instagram exports at roughly 600px wide. A half-column figure
renders near 500px, so a 2x display wants 1000px — **they will look soft.**
`withoutEnlargement` in the pipeline stops them being upscaled into mush, but
the fix is camera originals off the phone, which will be 3000px+. Drop them
into `assets/source/photos/` under the same filenames, re-run the script, and
raise the widths in `TARGETS`.

## Still worth adding

| # | Slot | Shot | Why |
|---|---|---|---|
| 01 | Visit | Street view, Rosato's sign, footpath | Orientation. Helps someone find the door. |
| 02 | Menu → Mains | A plated main other than the haddock — hot pot or sirloin | Five items, one photo. |
| 03 | Anywhere | Staff behind the bar, mid-service, unposed | The site still has no named human presence. 55 Malin Road names its hosts and quotes a guest. |
| 04 | Hero | The real facade | See below — deferred, illustration retained for now. |

## The hero question — deferred

**Decision: keeping the illustration for now.** The reasoning below is retained
because the question will come back.


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

## Practical notes

`scripts/optimize-images.mjs` handles the pipeline — drop sources into
`assets/source/photos/`, add them to `TARGETS`, run it, reference the generated
variants from `content/*.json`.

Two things that will bite otherwise:

- **Leave `graded: false` on venue photos.** The warm channel shift exists to
  correct raw, un-graded phone snapshots (`pint.jpg`, `room.jpg`). Instagram
  exports are already processed, and running the grade over them a second time
  overcooks the reds — on a building that colour, badly.

- **Any new content key must be declared in `public/admin/config.yml`.** Decap
  serialises only the fields named in its config and drops everything else
  without warning or error. An undeclared photo reference survives right up
  until someone saves that file through `/admin`, then vanishes.

Photo slots are set per-image where cropping is involved, not left to sharp's
`attention` strategy — it optimises for contrast, and in a dim pub that means it
finds the illuminated beer signage rather than the person playing guitar.
