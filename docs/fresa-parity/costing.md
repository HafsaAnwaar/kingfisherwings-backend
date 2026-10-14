# Costing matrix (Fresa) — Job Costing tab

Staff costing is paired **charge + sale + cost** on `JobCharge`, with toolbar actions matching Fresa.

| Fresa action | Method | Path | Status |
|---|---|---|---|
| Costing tab grid | GET | `/jobs/:id/detail/costing` | Match |
| List charges | GET | `/jobs/:id/charges` | Match |
| Legacy single-side add | POST | `/jobs/:id/charges` | Match |
| Composite add (charge/sale/cost) | POST | `/jobs/:id/charges/composite` | Match |
| Patch sale / cost | PATCH | `/jobs/:id/charges/:id/sale`, `.../cost` | Match |
| Soft-delete line | DELETE | `/jobs/:id/charges/:id` | Match |
| Attachments (`?side=SALE\|COST\|CHARGE`) | GET/POST | `/jobs/:id/charges/:id/attachments` | Match |
| Costing history | GET | `/jobs/:id/charges/history`, `.../charges/:id/history` | Match |
| Get charges (quote / party standard) | POST | `/jobs/:id/get-charges` | Match |
| Get job charges (from shipment) | POST | `/jobs/:id/get-job-charges` | Match |
| Copy charges | POST | `/jobs/:id/copy-charges` | Match |
| Profit share preview / add | POST | `/jobs/:id/profit-share/preview`, `.../add` | Match |
| GPUM (staff GP %) | GET/PUT | `/jobs/:id/gpum` | Match (separate from profit share) |
| Prorate | POST | `/jobs/:id/prorate-to-shipments`, `prorate-cost`, `cancel-prorate` | Match |
| Vouchers list | GET | `/jobs/:id/vouchers` | Match |
| Generate voucher | POST | `/jobs/:id/vouchers/generate` | Match (draft; `auto_post` posts when balanced via AR/AP) |
| Portal / vendor costing | GET | `/portal/jobs/:id/costing`, `/vendor/jobs/:id/costing` | Match |
| Sale invoice (selected lines) | POST | `/jobs/:id/invoices/sale` or `/invoices/from-job/:jobId` | Match |
| Purchase invoice (cost lines) | POST | `/jobs/:id/invoices/purchase` or `/purchase-invoices/from-job/:jobId` | Match |
| Job profit sheet | GET | `/jobs/:id/pnl` + `POST .../documents/job-pnl` | Match |
| Custom-duty profit sheet | GET | `/jobs/:id/pnl/custom-duty` + `POST .../documents/job-pnl-custom-duty` | Match |
| Shipment sale/cost | CRUD | `/shipments/:id/charges` | Match |

## Payload shape (`GET .../detail/costing`)

- `lines[]`: `charge`, `sale`, `cost`, `gp`, `freight`, `prorated_status`, `history_count`, voucher nos, attachment counts
- `vouchers[]`: job-scoped snippet
- `actions` + `path_hints`: toolbar capability map for FE

## Visibility

- **Staff**: full sale + cost.
- **Customer audience**: strip `cost` / `cost_voucher_no` via `stripCostingTabForAudience(..., "CUSTOMER")`.
- **Vendor audience**: strip `sale` / `sale_voucher_no`.
- Portal/vendor job costing reads use `stripCostingTabForAudience` (`CUSTOMER` / `VENDOR`).

## Notes

- Legacy `is_cost` / `amount` / `unit_price` remain compatibility mirrors of the active side.
- Migration `20261014120000_job_costing_parity` backfills `sale_*` / `cost_*` from legacy rows.
- Profit share creates a new paired line (`is_profit_share`); agent must be Carrier/Agent/Supplier party types.
