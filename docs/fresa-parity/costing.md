# Costing matrix (Fresa)

| Fresa action | Method | Path | Status |
|---|---|---|---|
| Shipment sale/cost | CRUD | `/shipments/:id/charges` | Match |
| Job sale/cost | CRUD | `/jobs/:id/charges` | Match |
| Get charges from quote/party | POST | `/shipments/:id/get-charges`, `/jobs/:id/get-charges` | Match |
| Copy charges from other | POST | `/shipments/:id/copy-charges`, `/jobs/:id/copy-charges` | Match |

## Notes

- **Get charges** pulls revenue lines from the linked quotation (`quotation_id` / `created_from_quote_id`) and optionally party standard charges (`from_party_standard`).
- **Copy charges** accepts one of `from_shipment_id` | `from_job_id` | `from_quotation_id`, with `copy_sale` (default true) and `copy_cost` (default false).
- Job charge lines require a `charge_code_id`; rows without a code are skipped when copying onto a job.
