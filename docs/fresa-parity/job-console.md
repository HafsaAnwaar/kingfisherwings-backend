# Job console / close matrix (Fresa)

| Fresa action | Method | Path | Status |
|---|---|---|---|
| List job shipments | GET | `/jobs/:id/shipments` | Match |
| Attach shipment | POST | `/jobs/:id/shipments/attach` | Match |
| Add shipment on job | POST | `/jobs/:id/shipments` | Match |
| Copy job | POST | `/jobs/:id/copy` | Match |
| Close checklist | GET | `/jobs/:id/close-checklist` | Match |
| Close (enforced) | POST | `/jobs/:id/close` | Match |
| Prorate to shipments | POST | `/jobs/:id/prorate-to-shipments` | Match |
| Cancel prorate | POST | `/jobs/:id/cancel-prorate` | Match |
| Tabbed detail | GET | `/jobs/:id/detail`, `/jobs/:id/detail/:tab` | Match |
| Change operational status | POST | `/jobs/:id/change-status` | Match |
| Stop / hold | POST | `/jobs/:id/stop` | Match |
| Booking form (job) | GET/PUT | `/jobs/:id/:mode/booking-form` | Match |

See also [job-detail.md](./job-detail.md).

## Notes

- `POST /jobs/:id/shipments` body: `{ shipment_ids?: string[], create?: CreateShipmentDto }`.
- `POST /jobs/:id/copy` flags: `copy_parties` / `copy_route` default true; `copy_containers`, `copy_sale`, `copy_cost`, `copy_dimensions`, `copy_department`, `copy_vessel` default false.
- Close checklist blockers: uninvoiced billable sale charges, draft vouchers, attached shipments not COMPLETED/CANCELLED. `force: true` skips enforcement.
- `prorate-cost/:chargeCodeId` still prorates to house jobs; if none, falls through to attached shipments. Dedicated `prorate-to-shipments` writes `ShipmentCharge.prorated_from_job_charge_id`.
- Job ↔ Shipment link is `Shipment.job_id` (no `created_from_shipment_id` on Job).
