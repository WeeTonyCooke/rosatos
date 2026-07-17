# Content model — Hybrid + Light

Bar staff edit **programme** and **menu** only. Quiet Objects owns venue chrome (brand, hero, booking URLs, gift-card link target).

## Files

| File | Who edits | Purpose |
|---|---|---|
| [`content/programme.json`](../content/programme.json) | Bar (via `/admin`) | Weekly music / Tonight / board |
| [`content/menu.json`](../content/menu.json) | Bar (via `/admin`) | Light menu sections + prices |
| [`content/venue.json`](../content/venue.json) | Quiet Objects | Name, place, hours, booking, gift cards, ordering |

Dubliner Option B mirrors the same shapes under [`demos/thedubliner-hearth/content/`](../demos/thedubliner-hearth/content/).

## `programme.json`

```json
{
  "eyebrow": "What’s on",
  "title": "…",
  "note": "Line-ups can shift…",
  "tonightOverride": "",
  "lineup": [
    {
      "day": 0,
      "dayLabel": "Sun",
      "name": "Artist or event",
      "time": "15:00",
      "kind": "music",
      "cue": "Short header line",
      "detail": "Longer board line",
      "href": "#whats-on"
    }
  ],
  "board": [
    {
      "id": "music",
      "days": "0,3,4,5,6",
      "label": "Live Music",
      "title": "Wed–Sunday",
      "detail": "…",
      "href": "#music"
    }
  ]
}
```

- `day`: `0` Sunday … `6` Saturday (JS `Date#getDay`)
- `tonightOverride`: if set, replaces the auto Tonight cue short line
- `kind`: `music` | `quiz` | `other`
- `board[].days`: comma-separated day numbers (string) so the CMS form stays simple

## `menu.json` (light)

```json
{
  "eyebrow": "Eat & drink",
  "title": "…",
  "intro": "…",
  "feeNote": "Optional fee line",
  "sections": [
    {
      "id": "classics",
      "name": "Classics",
      "items": [
        { "name": "…", "description": "…", "price": "16" }
      ]
    }
  ]
}
```

v1 = light sections only. Upgrade path: see [`MENU-UPGRADE.md`](./MENU-UPGRADE.md).

## `venue.json` (QO)

Includes `giftCards: { "label": "Gift cards", "url": "https://…" }` as an outbound link only — no checkout on Quiet Objects.
