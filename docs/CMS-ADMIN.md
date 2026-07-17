# Bar admin (Decap + Netlify Identity)

Calm admin for **Hybrid + Light**: two collections only — **This week’s music** and **Menu (light)**.

Sveltia CMS does not support Git Gateway / Netlify Identity invites, so this product uses **Decap CMS** so bar staff can edit without a GitHub account.

## URLs

| Site | Admin |
|---|---|
| The Hearth template | `/admin/` |
| Dubliner Option B demo | `/admin/` on that demo deploy |

## Enable on Netlify (once per site)

1. **Project configuration → Identity** — enable Identity.
2. Set registration to **Invite only**.
3. **Identity → Services → Git Gateway** — enable (uses the site’s GitHub connection).
4. Invite Oran / manager by email.
5. They open `/admin/`, accept the invite, set a password, edit Programme or Menu, publish. Netlify rebuilds.

## Local editing

```bash
npx decap-server
# other terminal
npm run dev
```

Open `http://localhost:5173/admin/` (Decap `local_backend: true` talks to the proxy on port 8081).

## What staff can change

- Weekly lineup rows (day, name, time, optional cue)
- Tonight override (only when auto isn’t enough)
- Light menu sections / items / prices

## What they cannot change

- Colours, fonts, hero layout, new pages
- OpenTable / booking URL
- Gift-card vendor URL (`venue.json` → Quiet Objects)
- Full multi-service menu tabs (upgrade — see `MENU-UPGRADE.md`)
