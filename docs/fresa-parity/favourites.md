# Favourites (unified)

Personal bookmarks for the **Favourites** section. Not a Masters catalog.

Add to favourite sits next to Edit / Delete / Generate on report formats, docs, jobs, shipments, etc. All stars land in one list: `GET /favourites`.

Continuum **Likes** (`POST /ops/.../likes/toggle`) stay separate.

## Canonical API (only)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/favourites` | All current-user favourites at once (`data[]` + `grouped` by kind). Filter `kind`, `search`. Default limit 500. |
| `GET` | `/favourites/check?kind=&target_key=` | Star UI state |
| `POST` | `/favourites` | Add |
| `POST` | `/favourites/toggle` | Add/remove → `{ favourited }` |
| `DELETE` | `/favourites/:id` | Remove |

There is **no** `/masters/favorites` route. Do not bookmark from Masters as a module.

## Toolbar contract (reports / docs / entities)

Each catalog/detail row exposes:

```json
{
  "actions": { "can_edit": true, "can_delete": false, "can_favourite": true },
  "favourite": { "kind": "report_template", "target_key": "report_template:JOB_CARD_REPORT_FORMAT", "label": "Job Card", "href": "/reports/templates/JOB_CARD_REPORT_FORMAT" },
  "path_hints": {
    "favourite_toggle": "/favourites/toggle",
    "favourite_check": "/favourites/check?kind=report_template&target_key=...",
    "favourites_list": "/favourites"
  }
}
```

Wired on:

- `GET /reports/templates` / `:idOrCode`
- `GET /documentation/reports`
- `GET /masters/custom-reports` (report *formats* catalog — favourite still goes to `/favourites`)
- `GET /gl/saved-reports`
- Job / shipment / quotation / enquiry detail (`can_favourite` + `path_hints.favourite_toggle`)

## Kinds

`enquiry` | `quotation` | `shipment` | `job` | `report_template` | `report` | `document` | `custom_report` | `saved_report` | `menu` | `party` | `other`

## `target_key` conventions

| Kind | Example |
|------|---------|
| Entity | `job:{uuid}`, `quotation:{uuid}`, `enquiry:{uuid}`, `shipment:{uuid}` |
| Report format | `report_template:{code}` |
| Documentation report | `document:{code}` e.g. `document:eta-followup` |
| Custom report master | `custom_report:{uuid}` |
| Saved GL report | `saved_report:{uuid}` |
| Menu | `menu:{route_key}` |
| Party | `party:{uuid}` |

`GET /favourites` items include `href` so the Favourites page can open any starred item.

## Likes vs Favourites

| | Likes | Favourites |
|--|-------|------------|
| Scope | Continuum entity social toggle | Personal bookmark anywhere |
| Path | `/ops/:type/:id/likes/toggle` | `/favourites/toggle` |
| Shared | Visible count on entity | Private per user; one list |
