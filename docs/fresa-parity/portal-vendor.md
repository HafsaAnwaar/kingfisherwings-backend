# Portal / vendor rewire matrix (2C)

| Flow | Behaviour | Status |
|---|---|---|
| Portal accept quote | Creates Shipment (booking), not Job-only | Match |
| Portal convert-to-job | Requires booking form on shipment/job; generates Job | Match |
| Portal shipments list | Returns Shipment entities (legacy Job dual-read) | Match |
| Booking forms | Path id accepts Job or Shipment (`shipment.job_id`) | Match |
| Portal booking form (all modes) | GET/PUT/complete on shipment + quotation | Match |
| Vendor pass-to-vendor | Requires Job (after generate) | Match |
| Vendor / portal costing | `GET /portal/jobs/:id/costing` (sale only); `GET /vendor/jobs/:id/costing` (cost only, via vendor quote or cost_party) | Match |
| Typed job documents | Portal/vendor multipart upload + list/download with ACL (`visible_to_*` / self-upload); staff sees all | Match |
| Track & Trace lookup | Portal `lookup?ref=` accepts container # / shipment / BL / AWB / job; milestones return unified `history` | Match |
| Invoice / voucher attachments | Portal invoice + voucher attachments; vendor purchase-invoice + linked voucher attachments | Match |

## API paths

| Action | Method | Path |
|---|---|---|
| Accept quote → Shipment | POST | `/portal/quotations/:id/accept` |
| Convert / Generate Job | POST | `/portal/quotations/:id/convert-to-job` |
| List portal shipments | GET | `/portal/shipments` |
| Portal booking form (shipment) | GET/PUT/POST | `/portal/shipments/:id/booking-form` (+ `/complete`) |
| Portal booking form (quotation) | GET/PUT/POST | `/portal/quotations/:id/booking-form` (+ `/complete`) |
| Staff booking form (shipment) | GET/PUT/POST | `/shipments/:id/booking-form` (+ `/complete`) |
| Staff booking form (quotation) | GET/PUT/POST | `/quotations/:id/booking-form` (+ `/complete`) |
| Staff pass-to-vendor | POST | `/jobs/:id/pass-to-vendor` (aliases: job-offers, send-to-vendor) |
| Quote pass-to-vendor (legacy) | POST | `/quotations/:id/pass-to-vendor` → uses `ensureProvisionalJob` for backward compat |
| Portal job doc upload / list / download | POST/GET | `/portal/jobs/:id/documents…` |
| Vendor job doc upload / list / download | POST/GET | `/vendor/jobs/:id/documents…` |
| Portal invoice attachments | GET/POST | `/portal/invoices/:id/attachments` (+ download) |
| Portal voucher attachments | GET/POST | `/portal/vouchers/:id/attachments` (+ download) |
| Vendor invoice attachments | GET/POST | `/vendor/invoices/:id/attachments` (+ download) |
| Vendor voucher attachments | GET/POST | `/vendor/vouchers/:id/attachments` (+ download) |

## Notes

- **Accept** keeps quotation `APPROVED` and sets `converted_shipment_id`; does **not** call `ensureProvisionalJob` on the portal accept path.
- **Booking forms** remain job-keyed in storage; quote/shipment facades resolve or **auto-create provisional Job** for all modes (generalized from air-only lazy ensure).
- **Vendor costing** defaults to the Job console after Generate Job. Prefer `/jobs/:id/get-charges` and `/jobs/:id/copy-charges` (or shipment charges pre-generate via `/shipments/:id/charges`). Pass-to-vendor / vendor quotes stay on Job.
- `ensureProvisionalJob` remains for vendor pass-to-vendor and legacy convert gates — prefer Job after Generate Job / convert-to-job.
