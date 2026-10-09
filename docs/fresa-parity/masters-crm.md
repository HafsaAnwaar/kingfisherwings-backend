# Masters / CRM / search matrix (Fresa)

| Fresa action | Method | Path | Status |
|---|---|---|---|
| Global search (+ enquiry/shipment) | GET | `/search` | Match |
| Favourites | GET/POST/DELETE | `/favourites` | Match |
| Masters entity favorites (legacy) | CRUD | `/masters/favorites` | Match |
| Call sheet / follow-up | CRM | `/crm/*` | Partial |
| Party standard charges | existing | `/parties/:id/standard-charges` | Match |

## Global search

`GET /search?q=…&types=jobs,quotations,parties,invoices,enquiries,shipments`

Default `types` includes all six entity groups. Enquiry matches commodity/cargo/id; shipment matches shipment number, HBL, commodity, vessel/flight, containers.

## Favourites (`UserFavourite`)

| Method | Path | Notes |
|---|---|---|
| GET | `/favourites` | Current user; filter `kind`, `search` |
| POST | `/favourites` | Body: `kind`, `target_key`, optional `label` |
| DELETE | `/favourites/:id` | Own favourite only |

Uses `user_favourites` (`kind` + `target_key`). Distinct from `/masters/favorites` (`user_favorites` entity bookmarks).
