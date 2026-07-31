# Rosato's — QA report

**Date:** 30 July 2026
**Tested:** live site (https://rosatos-moville.netlify.app) + local repo at `main` (8162d70)
**Scope:** functional flows, content accuracy, mobile layout, accessibility, performance, SEO/schema

**Context:** this is a demo/showcase site — the venue does not currently take online orders. Issues
are ranked by what hurts the demo (how it looks to a viewer, how it previews and ranks), not by
transactional risk. The pizza flow is a showpiece, so bugs *visible while demoing it* still count;
bugs that would only bite a real paying customer are parked at the bottom.

---

## Status — fixed in `207f6c5`

Everything below is addressed. #12 was initially deferred and has since been fixed — see its entry.

| # | Issue | Status |
|---|---|---|
| 1 | `localhost` in prerendered schema | fixed — reads canonical link |
| 2 | Duplicate JSON-LD | fixed — rendered once as static markup |
| 3 | React #418 hydration mismatch | fixed — ticker renders after mount |
| 4 | 815KB hero PNG | fixed — 51KB WebP at render size |
| 5 | Hours vs What's On contradiction | fixed — relabelled kitchen hours, dropped bad schema |
| 6 | "Leave off Peppers" on pepperoni | fixed — whole-word matching |
| 7 | Repo behind origin | fixed — pulled, now current |
| 8 | Identity widget on every page | fixed — loads only for invite/recovery tokens |
| 9 | Modals not actually modal | fixed — new `useDialog` hook |
| 10 | 3.8MB unused originals deployed | fixed — moved to `assets/source/` |
| 11 | Price `aria-label` single replace | fixed — `replaceAll` |
| 12 | Collection slots use visitor timezone | fixed — all hours logic runs in `Europe/Dublin` |

**Not yet pushed.** The commit is local; the sandbox has no GitHub credentials. Netlify builds from
git on push to `main` (last deploy `6a61f272` came from commit `71036a0`), so:

```bash
git push origin main
```

...is all that's needed — Netlify runs the build, including the Chrome install the prerender depends
on, and publishes. A failed build leaves the current deploy untouched, so this can't break the live
site.

Verified before commit: `oxlint` clean, `vite build` succeeds, bundle contains no `localhost`, no
`openingHoursSpecification`, and exactly one eager `<script>` tag. The prerender step could not be
run locally (no Chrome in the sandbox) — worth re-checking the live JSON-LD after deploy.

---

## P1 — Hurts the demo

### 1. Prerendered schema.org data points at `localhost`

The HTML served to crawlers contains:

```json
"url":   "http://localhost:43663",
"image": "http://localhost:43663/images/room.jpg",
"menu":  "http://localhost:43663/#menu"
```

`buildLocalBusinessSchema()` reads `window.location.origin`, and `scripts/prerender.mjs` renders the
page against `vite preview` on localhost. The whole point of the prerender is to feed crawlers and
link-preview bots that don't run JS — and that's exactly the audience getting localhost URLs.
Reproducible locally too (`dist/index.html` has `localhost:47409`).

For a showcase site this is the worst one: it undermines the exact capability the prerender pipeline
exists to demonstrate, and anyone who checks the markup will spot it.

**Fix:** use the canonical origin instead of `window.location.origin` — read it from the
`<link rel="canonical">` already in `index.html`, or pass it in as a build-time constant.

*Files:* `src/App.jsx:60`, `scripts/prerender.mjs`

---

### 2. Two competing JSON-LD blocks on every page

The prerender bakes one `LocalBusiness` record into the HTML; React's `useEffect` then appends a
second on hydration. The live page has **two** `application/ld+json` scripts describing the same
business with different `url`/`image` values (see #1).

**Fix:** stop injecting from `useEffect` and emit the schema once as static markup, or have the
effect replace the prerendered block rather than appending alongside it.

*File:* `src/App.jsx:100`

---

### 3. React hydration mismatch on every page load

Console shows `Minified React error #418` (text content mismatch) on every visit. The events ticker
is prerendered with whatever weekday the *build* ran on, then hydrates against today's weekday.
React discards the mismatched subtree and re-renders client-side — so the prerender costs build time
and delivers a console error instead of a benefit. A red error in the console during a demo is a bad
look.

**Fix:** render the ticker's initial pass to a day-agnostic placeholder and set the real cue in an
effect after mount, so server and client markup agree.

*Files:* `src/components/Header.jsx`, `src/lib/programme.js`

---

### 4. The hero image is an 815KB unoptimised PNG

`hero.png` is 815KB, has **no WebP variant and no `srcset`**, carries `fetchPriority="high"`, and is
the LCP element on every visit. It's a 1463×1280 source rendered at 736×644.

`pint.jpg` and `room.jpg` both went through `scripts/optimize-images.mjs` — the hero was missed.
Running it over the hero should take this to roughly 50–60KB. On a template whose pitch includes
performance, the single largest asset being the unoptimised one is worth fixing.

---

## P2 — Visible while demoing

### 5. Opening hours contradict the What's On listings

"Summer Opening Hours" says the venue closes at **21:00 every night**. The programme on the same page
lists:

- Wednesday — Texas Hold'em, 21:30
- Friday — QuizKings, 22:00
- Saturday — Seán Óg, 22:00
- Sunday — Seán Furey, 22:00
- Monday — Amy Bonnar, 21:00 *(live only)*

Four of five events start at or after the advertised closing time, both visible on one screen. Those
21:00 closes are also published to Google via `openingHoursSpecification`.

Most likely the `hours` block is really *kitchen* hours (the footer and order note both say
"Kitchen from…" / "Kitchen until 21:00") while being labelled and marked up as opening hours.

**Fix:** split the two — publish real bar closing times in `openingHoursSpecification`, and label the
16:00–21:00 window as kitchen/food service in the UI.

*Files:* `content/venue.json`, `src/App.jsx`

---

### 6. "Leave off Peppers" offered on pizzas that have no peppers

`REMOVAL_ALIASES.peppers` includes `'pepper'`, which is a substring of **pepperoni**. Verified live on
*Hot 'n' Spicy Pepperoni* — the customise sheet offers "Leave off: Peppers". Same false match on
Pepperoni and Meat Feast.

Three of ten pizzas, and it shows up in the customise sheet — the most likely thing to be clicked
during a walkthrough.

**Fix:** match on word boundaries rather than `includes()`, e.g.
`new RegExp('\\b' + alias + '\\b')`, or match against a structured ingredients array instead of
parsing prose.

*File:* `src/components/OrderPizza.jsx:18-30`

---

### 7. This local checkout is 3 commits behind `origin/main`

**Resolved on investigation — nothing is actually broken.** `git fetch` shows local `main` at
`8162d70`, `origin/main` at `71036a0`: **3 behind, 0 ahead, clean fast-forward.**

The missing commits are Decap CMS edits from 23 July, and they explain every content difference
between this checkout and the live site:

```
71036a0  Menu · Seafood Chowder €9.50→€10.50 · Battered Haddock €17.95→€18.95
         · Margherita €13.50→€14.00 · Guinness €5.50→€5.80
f382eb1  Programme · Monday: Amy Bonnar · 21:00
48768fa  Menu · Steak Burger €16.95→€17.50
```

So git-gateway **is** working correctly and `/admin` edits **are** landing on `main` — this clone
simply hasn't pulled. Live site ↔ remote are in sync; only this working copy is stale.

Still worth doing before any other change: because the deploy flow is a manual
`netlify deploy --prod --dir=dist` from local, building from this checkout as-is would revert four
menu prices and drop the Monday listing.

**Fix:** `git pull`. Clean fast-forward, no conflicts, nothing local at risk (working tree holds only
untracked `DESIGN-PRINCIPLES.md` and this report).

---

## P3 — Polish

### 8. Every visitor downloads the Netlify Identity widget

`index.html` loads `identity.netlify.com/v1/netlify-identity-widget.js` unconditionally, and it
injects **two iframes** into the page. It exists solely to redirect logged-in admins to `/admin/`.

**Fix:** move the script and its init block into `public/admin/index.html`.

### 9. Modals declare `aria-modal` but don't behave like modals

Cart drawer, booking sheet and customise sheet all set `role="dialog" aria-modal="true"`. Tested on
the cart drawer:

| Behaviour | Result |
|---|---|
| Escape closes the dialog | ✗ no handler |
| Focus moves into the dialog on open | ✗ `activeElement` stays on `<body>` |
| Focus trapped inside | ✗ tab order runs into the page behind |
| Focus restored to trigger on close | ✗ |
| Background inert / `aria-hidden` | ✗ |
| Body scroll locked | ✓ |

**Fix:** one shared dialog wrapper handling Escape, initial focus, focus trap, focus restore and
`inert` on the page container — or the native `<dialog>` element with `showModal()`.

### 10. Unused originals still deployed

`pint.jpg` (2.7MB) and `room.jpg` (275KB) ship in `dist/` but are never requested — the components
reference only the generated variants. 3MB of deploy weight, no runtime cost.

### 11. Price `aria-label` only converts the first euro sign

`price.replace('€', 'euro ')` replaces one occurrence, so Cheesy Pizza Garlic Bread announces as
`"euro 8.50 / €13.50"`. Use `replaceAll`.

*File:* `src/components/Menu.jsx:63`

---

## P4 — Deferred, then fixed

### 12. Collection slots use the visitor's timezone, not the venue's

`buildSlots()` and `getTodaysWindow()` call bare `new Date()`, so all open/closed logic runs in the
visitor's device timezone.

**Reproduced:** browser set to `Asia/Dubai`. Real time in Moville was 14:25 on a Thursday — venue
shut, opens 16:00. The site offered collection slots 18:00–21:00 with no "closed" warning.

Harmless on a demo, and it can even flatter it (slots always look available). But it must be fixed
before this template takes a real order anywhere, and the same flaw drives the "TONIGHT" ticker and
the kitchen-closed message — so it has a small cosmetic footprint today.

**Deferred in `207f6c5`, fixed since.** It was deferred because it alters behaviour rather than
correcting something plainly wrong, and it touches every hours comparison in the app — worth its own
change with its own verification rather than being bundled into a pass of unrelated fixes.

**The fix.** A new `src/lib/venue-time.js` reads the day and time *at the venue* via
`Intl.DateTimeFormat(…, { timeZone: 'Europe/Dublin' })`, and everything downstream works in minutes
since midnight rather than in `Date` objects — which removes the local-vs-UTC confusion entirely and
leaves DST to `Intl`. `hours.js` returns `{ now, openWindow }` in those units; `programme.js` takes
its weekday from the same source, so the "TONIGHT" ticker and the What's On highlight follow.

Two further problems surfaced while fixing it, neither of them timezone bugs:

- The slot list was computed in a `useMemo` keyed on `[venue, ordering]`, both module constants. It
  ran once at page load and never again, so a page left open for an hour still offered a slot that
  had already passed. It also meant the prerender baked *build-time* slots into the HTML — the same
  class of hydration mismatch as #3. Now computed after mount and refreshed every minute.
- The footer copyright read `new Date().getFullYear()` — the visitor's year, and frozen at build time
  by the prerender. Now `venueYear()`.

**Verification:** the same five instants evaluated with the device clock set to `Europe/Dublin`,
`Asia/Dubai`, `America/Los_Angeles`, `Pacific/Auckland` and `UTC` — including one instant that falls
on a different calendar day in Moville than in UTC — produce byte-identical slot lists, closed
reasons and Tonight cues in all five.

*Files:* `src/lib/venue-time.js` (new), `src/lib/hours.js`, `src/lib/programme.js`,
`src/components/CartDrawer.jsx`, `src/components/Footer.jsx`

---

## Passed

- No horizontal overflow at 386px; layout holds on mobile
- Single `<h1>`, sensible heading order, skip link present, `lang` set, every `<img>` has `alt`
- Menu price formatting correctly handles ranges (`8.50 / 13.50`), prefixes (`from 3.00`) and blanks
- Cart line-signature dedup and the "refine an existing line" flow both behave correctly
- `robots.txt`, `sitemap.xml`, canonical, OG and Twitter card tags all correct and consistent
- `/admin` loads and presents the Netlify Identity login
- Booking sheet renders the ResDiary widget and is clearly labelled as third-party
- Cart drawer locks background scroll while open

## Not tested

The collection order form was not submitted. Netlify Forms wiring looks correct
(`public/__forms.html` declares every field the drawer posts), but end-to-end submission is
unverified — moot while ordering is a demo.
