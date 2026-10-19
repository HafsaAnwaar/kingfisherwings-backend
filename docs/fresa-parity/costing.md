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
| Sale invoice **form** (open dialog) | GET | `/jobs/:id/invoices/sale/form` | Match (form-first; never 400 for empty lines) |
| Sale invoice save / legacy generate | POST | `/jobs/:id/invoices/sale` (body = form header+lines → `DRAFT` / `display_status: CREATE`) | Match |
| Purchase / vendor invoice **form** | GET | `/jobs/:id/invoices/purchase/form` | Match (prefill: vendor offer → costing → empty) |
| Purchase / vendor invoice save | POST | `/jobs/:id/invoices/purchase` (JSON or multipart `data`+`file`) | Match |
| Bulk PI preview (vouchers + pending by vendor) | GET | `/jobs/:id/invoices/purchase/bulk` | Match |
| Bulk PI generate (one DRAFT per vendor+currency) | POST | `/jobs/:id/invoices/purchase/bulk` | Match |
| Job profit sheet | GET | `/jobs/:id/pnl` + `POST .../documents/job-pnl` | Match |
| Custom-duty profit sheet | GET | `/jobs/:id/pnl/custom-duty` + `POST .../documents/job-pnl-custom-duty` | Match |
| Shipment sale/cost | CRUD | `/shipments/:id/charges` | Match |

## Payload shape (`GET .../detail/costing`)

- `lines[]`: `charge`, `sale`, `cost`, `gp`, `freight`, `prorated_status`, `history_count`, voucher nos, attachment counts
- `vouchers[]`: job-scoped snippet
- `actions` + `path_hints`: toolbar capability map for FE (`sale_invoice_form`, `purchase_invoice_form`, `generate_bulk_purchase_invoice`, `bulk_purchase_invoice`)
- Bulk PI pending lines = cost side present and not already on any non-cancelled invoice line (`InvoiceLine.job_charge_id` is unique, so a prior sale invoice on the same charge also excludes it until dual-side linking exists)

## Invoice form (form-first)

1. FE opens **GET** `…/invoices/purchase/form` or `…/invoices/sale/form` (optional `?charge_ids=`).
2. Response: `header` (branch, voucher_type, v_date, gl_date, ex_rate, bill_amount, remarks, books, organization, address, currency, narration, ref_no), `pricing_lines[]` (shipment_no, charge, unit, qty, currency, ex_rate, DR/CR, amount, FCY, tax_group, PP/CC), `lookups`, `source` (`VENDOR_OFFER` | `JOB_COSTING` | `QUOTATION` | `EMPTY`).
3. FE edits and **POST**s the same path without `/form`. Saved invoice status is `DRAFT` with `display_status: "CREATE"`.
4. Missing vendor / no revenue lines no longer hard-fail the toolbar open — use the form. Save validates `organization_id` / `party_id`, `currency_code`, and `lines`.

## Negotiation → costing sync

Every customer/admin quotation counter or revise, and every vendor/admin job-offer counter or revise, syncs amounts into `job_charges` so the costing grid stays current across **all** negotiation rounds (not only the first).

## Visibility

- **Staff**: full sale + cost.
- **Customer audience**: strip `cost` / `cost_voucher_no` via `stripCostingTabForAudience(..., "CUSTOMER")`.
- **Vendor audience**: strip `sale` / `sale_voucher_no`.
- Portal/vendor job costing reads use `stripCostingTabForAudience` (`CUSTOMER` / `VENDOR`).

## Notes

- Legacy `is_cost` / `amount` / `unit_price` remain compatibility mirrors of the active side.
- Migration `20261014120000_job_costing_parity` backfills `sale_*` / `cost_*` from legacy rows.
- Profit share creates a new paired line (`is_profit_share`); agent must be Carrier/Agent/Supplier party types.
