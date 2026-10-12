# Job module route map (FE-oriented)

## Job detail (stable)

| Screen | Routes |
|--------|--------|
| Header / tabs | `GET /jobs/:id/detail`, `GET /jobs/:id/detail/:tab` |
| Status | `GET /jobs/status-options`, `POST /jobs/:id/change-status`, `POST /jobs/:id/reopen`, `POST /jobs/:id/close`, `POST /jobs/:id/cancel`, `POST /jobs/:id/stop` |
| Organization + PO | tab `organization`; `GET/POST /jobs/:id/organizations`; `PUT/DELETE .../:orgType`; `POST .../copy-from`; `POST .../refresh-snapshots`; `PATCH .../organization/client-reference` — see [job-organization.md](./job-organization.md) |
| Dimensions | tab `dimensions`; line CRUD/bulk/upload/export; `POST .../dimensions/sync-to-cargo`; tenant divisor `GET/PATCH /organization/settings/dimensions` — see [job-dimensions.md](./job-dimensions.md) |
| Planned / Actual container | tabs `planned_container` / `actual_container`; full container CRUD/bulk/upload — see [job-containers.md](./job-containers.md) |
| Costing | tab `costing`; charges CRUD under `/jobs/:id/charges`; attachments on charge |
| GPUM | `GET/PUT /jobs/:id/gpum` |
| Storage charges | `POST .../containers/storage-charges/calculate`, `confirm-to-costing` |
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
