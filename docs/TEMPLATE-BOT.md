# TemplateBot — later

Logged from `~/Downloads/template_bot_specification.pdf` (July 2026 draft, v1.0). **Not in current build scope** — product thinking only until templates + CMS settle.

## Idea

Day-to-day template updates via chat (Telegram first, WhatsApp later), not only a web admin. Owner talks casually; bot translates into structured backend updates (menus, prices, hours, promos, photos).

Fits Quiet Objects templates: content already lives in JSON (`programme` / `menu` / `venue`). Bot should write the same content model Decap admin does — agent as another editor, not a parallel system.

## Why it matters

- Busy owners won’t open a CMS for “pasta is €18 now”
- PDF/image menus are how places already work
- Confirmation steps keep honesty (no silent wrong prices)

## Phase 1 (spec MVP)

- Telegram bot
- Menu & pricing updates + PDF extraction
- Validation + confirm before write
- Basic preview
- Wire into existing template backend / content files

## Architecture (spec)

Message → LLM parse → structured action → validate → DB/content update → render → reply  
Stack sketched: Telegram · LLM agent · FastAPI/Nest · Postgres JSONB · S3 · PDF/OCR

## Open questions (for later)

- Bot vs Decap: who is source of truth for Hearth/Dubliner pilots?
- Does Phase 1 write git/JSON (Netlify CMS path) or a live DB?
- WhatsApp Business API timing vs Telegram-only MVP
- How confirmation + audit trail show on the live site

## Status

**Backlog only.** Do not start until content model + Oran pilot path are stable.
