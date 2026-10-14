# Job module route map (FE-oriented)

## Job detail (stable)

| Screen | Routes |
|--------|--------|
| Header / tabs | `GET /jobs/:id/detail`, `GET /jobs/:id/detail/:tab` |
| Status | `GET /jobs/status-options`, `POST /jobs/:id/change-status`, `POST /jobs/:id/reopen`, `POST /jobs/:id/close`, `POST /jobs/:id/cancel`, `POST /jobs/:id/stop` |
| Organization + PO | tab `organization`; `GET/POST /jobs/:id/organizations`; `PUT/DELETE .../:orgType`; `POST .../copy-from`; `POST .../refresh-snapshots`; `PATCH .../organization/client-reference` — see [job-organization.md](./job-organization.md) |
| Dimensions | tab `dimensions`; line CRUD/bulk/upload/export; `POST .../dimensions/sync-to-cargo`; tenant divisor `GET/PATCH /organization/settings/dimensions` — see [job-dimensions.md](./job-dimensions.md) |
| Planned / Actual container | tabs `planned_container` / `actual_container`; full container CRUD/bulk/upload — see [job-containers.md](./job-containers.md) |
| Costing | tab `costing`; `GET /jobs/:id/charges`; composite `POST .../charges/composite`; sale/cost PATCH; get-charges / get-job-charges; profit-share; vouchers (`auto_post`); sale/purchase invoices; custom-duty P&L — see [costing.md](./costing.md) |
| Department | tab `department`; `PATCH /jobs/:id/department` |
| Exchange rates | tab `ex_rate`; `POST /jobs/:id/exchange-rates`; `DELETE .../exchange-rates/:rateId` |
| Routing | tab `routing`; `POST/PATCH/DELETE /jobs/:id/routing-legs` |
| Customs / SB-BOE | tabs `customs` / `shipping_bill_boe`; `POST/PATCH/DELETE /jobs/:id/customs-refs` |
| Booking form | tab `booking_form` (summary + completeness); mode forms under `/jobs/:id/{mode}/booking-form` |
| GPUM | `GET/PUT /jobs/:id/gpum` (not profit share) |
| Storage charges | `POST .../containers/storage-charges/calculate`, `confirm-to-costing` |
| History | tab `history` |
| Portal / vendor costing | `GET /portal/jobs/:id/costing`, `GET /vendor/jobs/:id/costing` |
| FE shell checklist | [job-fe-shell.md](./job-fe-shell.md) |

## Documentation module

| Screen | Routes |
|--------|--------|
| All Jobs list | `GET /documentation/jobs` |
| Create wizard | `POST /documentation/jobs/create-wizard`, `POST /documentation/jobs/create` |

## Operations module

| Screen | Routes |
|--------|--------|
| Import Cargo Delivery | `GET/PATCH /operations/import-cargo-delivery` |
| Ops dashboard | `GET /operations/dashboard` |
| Closed job report | `GET /operations/closed-job-report`, download wrapper |

## Mode-specific (job type)

Air workflow, FCL/LCL import/export, land, courier, customs clearance, NVOCC — additional routes on `JobsController` / `AirWorkflowController` / `CustomsClearanceController`. Close gates may differ by mode (milestones vs generic close).
