# Favourites (unified)

Personal bookmarks for the Favourites section. Distinct from continuum **Likes** (`POST /ops/.../likes/toggle`).

## Canonical API

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/favourites` | List (filter `kind`, `search`) |
| `GET` | `/favourites/check?kind=&target_key=` | Star UI state |
| `POST` | `/favourites` | Add |
| `POST` | `/favourites/toggle` | Idempotent add/remove → `{ favourited }` |
| `DELETE` | `/favourites/:id` | Remove |

## Kinds

`enquiry` | `quotation` | `shipment` | `job` | `report_template` | `report` | `menu` | `party` | `other`

## `target_key` conventions

| Kind | Example |
|------|---------|
| Entity | `job:{uuid}`, `quotation:{uuid}`, `enquiry:{uuid}`, `shipment:{uuid}` |
| Report template | `report_template:AR_JOB_NOT_INVOICE_REPORT_FORMAT` |
| Menu | `menu:crm.enquiries` (FE-defined route key) |
| Party | `party:{uuid}` |

## Compat

`GET/POST/DELETE /masters/favorites` proxies to `UserFavourite` and returns `deprecated: true` / `prefer: "/favourites"`. Prefer `/favourites` for new work.

## Likes vs Favourites

| | Likes | Favourites |
|--|-------|------------|
| Scope | Continuum entity social toggle | Personal bookmark anywhere |
| Path | `/ops/:type/:id/likes/toggle` | `/favourites/toggle` |
| Shared | Visible count on entity | Private per user |
