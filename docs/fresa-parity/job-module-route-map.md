# Job module route map (FE-oriented)

## Job detail (stable)

| Screen | Routes |
|--------|--------|
| Header / tabs | `GET /jobs/:id/detail`, `GET /jobs/:id/detail/:tab` |
| Status | `GET /jobs/status-options`, `POST /jobs/:id/change-status`, `POST /jobs/:id/reopen`, `POST /jobs/:id/close`, `POST /jobs/:id/cancel`, `POST /jobs/:id/stop` |
| Organization + PO | tab `organization`; `PATCH /jobs/:id/organization/client-reference` |
| Dimensions | tab `dimensions`; `PATCH /jobs/:id/dimensions` |
| Costing | tab `costing`; charges CRUD under `/jobs/:id/charges`; attachments on charge |
| GPUM | `GET/PUT /jobs/:id/gpum` |
| Storage charges (FCL) | `POST .../containers/storage-charges/calculate`, `confirm-to-costing` |
| History | tab `history` |

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
