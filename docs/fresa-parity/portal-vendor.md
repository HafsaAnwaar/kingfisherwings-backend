# Portal / vendor rewire matrix (2C)

| Flow | Behaviour | Status |
|---|---|---|
| Portal accept quote | Creates Shipment (booking), not Job-only | Match |
| Portal convert-to-job | Requires booking form on shipment/job; generates Job | Match |
| Portal shipments list | Returns Shipment entities (legacy Job dual-read) | Match |
| Booking forms | Path id accepts Job or Shipment (`shipment.job_id`) | Match |
| Vendor pass-to-vendor | Requires Job (after generate) | Match |
| Vendor costing | Default: cost lines on **Job** (`/jobs/:id/charges`) | Match |

## API paths

| Action | Method | Path |
|---|---|---|
| Accept quote → Shipment | POST | `/portal/quotations/:id/accept` |
| Convert / Generate Job | POST | `/portal/quotations/:id/convert-to-job` |
| List portal shipments | GET | `/portal/shipments` |
| Staff pass-to-vendor | POST | `/jobs/:id/pass-to-vendor` (aliases: job-offers, send-to-vendor) |
| Quote pass-to-vendor (legacy) | POST | `/quotations/:id/pass-to-vendor` → uses `ensureProvisionalJob` for backward compat |

## Notes

- **Accept** keeps quotation `APPROVED` and sets `converted_shipment_id`; does **not** call `ensureProvisionalJob` on the portal accept path.
- **Booking forms** remain job-keyed in storage; dual-read resolves `shipment_id` → `job_id` when linked. Air portal compliance may lazily ensure a provisional Job so forms can be filled before convert.
- **Vendor costing** defaults to the Job console after Generate Job. Prefer `/jobs/:id/get-charges` and `/jobs/:id/copy-charges` (or shipment charges pre-generate via `/shipments/:id/charges`). Pass-to-vendor / vendor quotes stay on Job.
- `ensureProvisionalJob` remains for vendor pass-to-vendor and legacy convert gates — prefer Job after Generate Job / convert-to-job.
