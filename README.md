# Rosato’s — Quiet Objects

Hearth (neighbourhood bar) template reskinned for Rosato’s Bar & Restaurant, Moville.

Live: https://rosatos-moville.netlify.app

```bash
npm install
npm run build
npx netlify deploy --prod --dir=dist --site=rosatos-moville
```

Menu & details from [rosatos.ie](https://rosatos.ie/). Quiet Objects venue site.

## Build pipeline notes

- **Prerendering:** `npm run build` now runs `scripts/prerender.mjs` afterward (via
  the `postbuild` hook). It serves the built `dist/` with `vite preview`, opens it
  in headless Chrome, waits for the JSON-LD schema to be injected, and writes the
  fully-rendered HTML back over `dist/index.html`. This is what lets crawlers that
  don't execute JS (link-preview bots, some SEO tools) see real content and the
  schema.org data instead of an empty `<div id="root">`. Real visitors still get
  the normal React bundle, which hydrates over the prerendered markup.

- **Image variants:** `pint.jpg` and `room.jpg` have generated WebP + resized JPEG
  variants (`pint-480.webp`, `room-900.jpg`, etc.) served via `<picture>`/`srcset`
  in `Pint.jsx` / `Room.jsx`, cutting the pint photo from ~2.7MB down to ~140KB at
  full size. **These are static files, not wired to the CMS** — this is a demo site,
  not a production one Oran/a client edits day-to-day, so that trade-off is fine
  here. If either photo is ever swapped, re-run:
  ```bash
  node scripts/optimize-images.mjs
  ```
  and redeploy. If this ever becomes a real client site with photos changed
  through `/admin`, that step should move into the build itself instead.
