# Next steps — Hybrid + Light

Status as of the Dubliner Option B polish pass.

## Done

- Shared content model (`programme.json` / `menu.json` / `venue.json`)
- Hearth + Dubliner Option B driven from that content
- Decap admin configs (Programme + Menu only)
- Gift cards as outbound link only
- Oran pilot field checklist + menu upgrade path docs
- Option B live: https://thedubliner-boston-demo.netlify.app

## Do next

1. **Open a PR** — merge `cursor/hearth-content-model` → `main` so the product work lives on the default branch (not only on the feature branch / Netlify deploy).

2. **Turn on admin for real** — on the client Netlify site (Hearth or Dubliner when handed over):
   - Project configuration → **Identity** → enable
   - Registration → **Invite only**
   - Identity → Services → **Git Gateway** → enable
   - Invite Oran / manager by email  
   Details: [`CMS-ADMIN.md`](./CMS-ADMIN.md)

3. **Pilot with Oran** — walk [`ORAN-PILOT.md`](./ORAN-PILOT.md); mark weekly / sometimes / never; trim `public/admin/config.yml` to what he actually uses. Labels should sound like the bar (“Update Saturday band”), not CMS jargon.

4. **Hold the show** until you’re happy with the demo. Gift cards stay as the Web Gift Card Sales link unless Oran says they’re a core channel.

## Pitch (locked)

*You keep the week honest. We keep the place looking like itself.*

## Deploy reminder

Always pass the demo site explicitly so The Hearth isn’t overwritten:

```bash
npx netlify deploy --prod --dir=demos/thedubliner-hearth --site=cc412ff3-5540-4957-8e5b-e25082a4bae2
```

## Later (logged, not started)

- **TemplateBot** — update template backends via chat agent (Telegram → WhatsApp). Menu/price PDF uploads, confirm-then-write into the same content model as `/admin`. Spec notes: [`TEMPLATE-BOT.md`](./TEMPLATE-BOT.md). Source PDF still in Downloads (`template_bot_specification.pdf`) until we decide to version it in-repo.
