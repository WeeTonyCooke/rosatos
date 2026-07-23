# AGENTS.md

## Cursor Cloud specific instructions

Rosato's is a single-page **Vite + React 19** static marketing/ordering site for a
bar & restaurant. There is no backend service — content is baked in from
`content/*.json` at build time. Standard scripts live in `package.json` (`dev`,
`build`, `lint`, `preview`, `cms`).

Non-obvious notes for running/developing here:

- **Dev server:** `npm run dev` serves on `http://localhost:5173` with HMR. This is
  the normal development entry point — do not use `npm run build`/`preview` for
  iterating on UI.
- **Build has a Puppeteer prerender step.** `npm run build` runs `vite build` then
  `scripts/prerender.mjs` (via the `postbuild` hook), which launches headless
  Chrome against a temporary `vite preview` and snapshots `dist/index.html`. This
  requires a Chrome download that is NOT part of `npm install`: run
  `npx puppeteer browsers install chrome` once (the cloud update script does this).
  The prerender hard-fails if the captured HTML doesn't contain the venue name from
  `content/venue.json`, so a broken content file will fail the build.
- **Ordering works locally without any backend.** The pizza checkout POSTs to
  `/__forms.html` (Netlify Forms). Locally that endpoint 404s, but `CartDrawer.jsx`
  only treats a failed POST as an error in `PROD`, so in dev the success
  confirmation still shows. This is expected — no server needed to demo ordering.
- **Collection-time slots are time-of-day dependent.** `buildSlots` in
  `CartDrawer.jsx` derives collection times from the venue's opening hours in
  `content/venue.json`. Outside opening hours the dropdown shows "No slots
  available" and the order can't be placed — this is correct behaviour, not a bug.
- **Lint:** `npm run lint` uses `oxlint`. It currently reports one pre-existing
  unused-import warning in `scripts/optimize-images.mjs`; that is not a failure.
- **Local CMS (optional):** `npm run cms` runs the Decap local proxy for `/admin`.
  The live `/admin` needs Netlify Identity + Git Gateway, which are not available
  locally; not required to run or test the site.
- **Image variants** under `public/images/*` are generated once via
  `node scripts/optimize-images.mjs` (needs `sharp`) and committed. Only re-run if
  `pint.jpg`/`room.jpg` change; the normal build does not regenerate them.
