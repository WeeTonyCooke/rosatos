# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **Vite + React 19** static SPA (the "Hearth" venue-site template reskinned for Rosato's Bar). There is **no application backend, no database, and no automated test suite**. Dynamic behaviour (order capture, `/admin` CMS auth) is provided by Netlify platform services that only exist on a deployed Netlify site.

Standard commands live in `package.json` `scripts`; use those rather than duplicating them:
- Dev server: `npm run dev` (Vite, http://localhost:5173).
- Lint: `npm run lint` (oxlint). Build: `npm run build` (outputs `dist/`). Preview built site: `npm run preview`.
- Optional Decap CMS local backend: `npm run cms` (runs `npx decap-server`), then open `/admin/`.

Non-obvious caveats:
- `npm run lint` also scans `node_modules` (no ignore config), so it prints many `no-unused-expressions` warnings from `react-dom`. It still exits `0` — those warnings are not from project source.
- **Pizza ordering is time-gated by the VM's local clock.** `CartDrawer.jsx` builds collection slots from the venue's opening hours in `content/venue.json` (Mon–Fri 16:00, Sat 15:00, Sun 12:30, kitchen closes 21:00), evaluated against the VM's local time (VM is `Etc/UTC`). Outside those hours the cart shows "closed" with no selectable slots, so an end-to-end order can only be placed during kitchen hours.
- Order submission POSTs to `/__forms.html` (Netlify Forms), which only works on a deployed site. Locally the POST fails but the UX still confirms the order on purpose (see the `import.meta.env.PROD` guard in `CartDrawer.jsx`) — a local success message does not mean a real order was captured.
- No test runner exists; "testing" means manual verification in the browser (or building the site).
