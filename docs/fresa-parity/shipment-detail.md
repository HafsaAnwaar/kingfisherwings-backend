# Shipment detail (backend 1A)

## Header fields

`shipment_number`, `shipment_date`, branch, customer, department, status, address, freight terms, BL status, POR/POL/POD/POF, MBL/HBL, cross-trade, service type, ETD/ETA, nested quotation, enquiry link.

## Shared tabs (same shape as job)

Except job-only `history`, `booking_form`, and `shipments`, shipment detail tabs match job:

| Tab | Behavior |
|-----|----------|
| `organization` | Same org types / party snapshot shape as job |
| `dimensions` | Line grid + totals (same DTO as job) |
| `planned_container` / `actual_container` | Same actions shell as job container tabs |
| `costing` | Paired sale/cost lines + toolbar flags |
| `department` | Branch / company / department / salesperson |
| `ex_rate` | Currency rates (+ optional apply to charges) |
| `routing` | Routing legs |
| `customs` / `shipping_bill_boe` | SB / BOE refs |

**Proxy rule:** when `shipment.job_id` is set, reads/writes go to the linked job services (one source of truth). Otherwise shipment-local tables (`shipment_organizations`, `shipment_dimension_lines`, charge sale_/cost_ columns, etc.) use the same response shapes.

### Mutating routes (mirror job)

- `POST /shipments/:id/organizations`
- `POST /shipments/:id/dimensions`
- `POST /shipments/:id/charges/composite`
- `PATCH /shipments/:id/department`
- `POST /shipments/:id/exchange-rates`
- `POST /shipments/:id/routing-legs`, `PATCH .../routing-legs/:legId`
- `POST /shipments/:id/customs-refs`

## Child tables (tab-owned)

- `shipment_organizations` / `shipment_dimension_lines`
- `shipment_routing_legs`
- `shipment_container_plans` / `shipment_container_actuals`
- `shipment_exchange_rates`
- `shipment_customs_refs` (customs + SB/BOE tab)
- `shipment_charges` (legacy + paired `sale_*` / `cost_*`)
- `shipment_split_links` (split/merge graph)

## Generate job sync

`POST /shipments/:id/generate-job` copies shared tab rows onto the new job (orgs, dimensions, containers with type, FX, routing, customs, charges including sale/cost pair fields), then links `job_id` so subsequent tab access proxies to the job.

## Toolbar actions

Copy, generate job (`DIRECT` default / `HOUSE`), change status, change BL status, department, split, merge, switch BL, EDI (`bayan-generate`, `bayan-submit`, `ccn-fwb`, `ccn-submit`, `eqo-dubai-generate`), create submaster, KPI, BL list, AWB (air + job), track-trace, booking form (`GET/PUT /shipments/:id/booking-form`).

## Job No link

After generate-job, detail header/links include `job_number` and `path_hint: /jobs/:id/detail` for FE navigation.
