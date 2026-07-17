# Menu upgrade path — light → full services

v1 sells a **light** menu: a few sections (Classics, Specials, pizza, bar) in `content/menu.json`.

When a client needs Dubliner-scale brunch / lunch / dinner / drinks / roast:

## Extend without a redesign

1. Keep the same page shell and design tokens.
2. Expand `menu.json` either by:
   - **More sections** in the flat `sections` array (`id: "brunch"`, `id: "dinner"`, …), or
   - **Services** (preferred for tabs):

```json
{
  "eyebrow": "Menus",
  "title": "…",
  "intro": "…",
  "services": [
    {
      "id": "brunch",
      "label": "Brunch",
      "meta": "10am–2pm · Weekends",
      "sections": [
        {
          "id": "brunch-plates",
          "name": "Plates",
          "items": [{ "name": "…", "description": "…", "price": "16" }]
        }
      ]
    }
  ]
}
```

3. Teach the Menu component (or Dubliner panels) to prefer `services` when present, else fall back to `sections`.
4. Extend the Decap **Menu** collection with a nested `services` list — still no page builder.

Quiet Objects still owns photography, IA, and whether tabs vs one long scroll fit the room.
