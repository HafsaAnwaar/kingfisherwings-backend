# Job FE shell — OpenAPI contract checklist

Backend for job detail tabs is complete in this Nest repo. FE (separate app) should consume:

## Shell

| Concern | API |
|---------|-----|
| Detail header + action flags + tab list | `GET /jobs/:id/detail` |
| Per-tab payload | `GET /jobs/:id/detail/:tab` |

Tabs: `show_all`, `info`, `organization`, `dimensions`, `planned_container`, `actual_container`, `ex_rate`, `costing`, `department`, `shipping_bill_boe`, `routing`, `customs`, `history`, `booking_form`, `shipments`.

## Thin tabs (now write-capable)

| Tab | Write routes |
|-----|----------------|
| department | `PATCH /jobs/:id/department` |
| ex_rate | `POST /jobs/:id/exchange-rates`, `DELETE .../exchange-rates/:rateId` |
| routing | `POST/PATCH/DELETE /jobs/:id/routing-legs[/:legId]` |
| customs / shipping_bill_boe | `POST/PATCH/DELETE /jobs/:id/customs-refs[/:refId]` |
| booking_form | Tab returns `form` summary + `is_complete` + `path_hints.get` for mode form |

## Full tabs (existing)

Organization, dimensions, containers, costing — see [job-organization.md](./job-organization.md), [job-dimensions.md](./job-dimensions.md), [job-containers.md](./job-containers.md), [costing.md](./costing.md).

## Costing toolbar (FE forms)

Composite add, sale/cost PATCH, get-charges, get-job-charges, profit-share, vouchers (`auto_post` optional), sale/purchase invoices, custom-duty P&L — paths under `data.path_hints` on costing tab.

## Portal / vendor

| Audience | Path |
|----------|------|
| Customer | `GET /portal/jobs/:id/costing` (sale only) |
| Vendor | `GET /vendor/jobs/:id/costing` (cost only) |

## FE implementation status

Tracked as separate frontend repo work. Backend contracts above are the definition of done for this checklist.
