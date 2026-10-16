# Masters / CRM / search matrix (Fresa)

| Fresa action | Method | Path | Status |
|---|---|---|---|
| Global search (+ enquiry/shipment) | GET | `/search` | Match |
| Favourites | GET/POST/DELETE | `/favourites` | Match (not under Masters) |
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

Uses `user_favourites` (`kind` + `target_key`). Favourites are **not** a Masters module. Report/doc rows expose `actions.can_favourite` + `POST /favourites/toggle`. See [favourites.md](./favourites.md).
