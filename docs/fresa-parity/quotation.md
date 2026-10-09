# Quotation API matrix (Fresa)

| Fresa action | Method | Path | Status |
|---|---|---|---|
| Verify quote | POST | `/quotations/:id/verify` | Match |
| Staff approve (after verify) | POST | `/quotations/:id/approve` / status | Partial |
| Generate shipment | POST | `/quotations/:id/generate-shipment` | Match |
| Generate job | POST | `/quotations/:id/generate-job` | Match |
| T&Cs / valid_from | fields on create/update | — | Match |
| Action flags | `can_verify`, `can_generate_shipment`, `can_generate_job` | — | Match |
| Soft-deprecate provisional-job-on-accept | Accept → Shipment; `ensureProvisionalJob` kept for vendor/legacy | — | Match |
