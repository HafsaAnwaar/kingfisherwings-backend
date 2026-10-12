# Job Container tab

## List / edit fields

Line No., HS Code, no of pcs, gross/net/volume weight, volume (cbm), type, container no, actual seal, attach shipment, storage charges, chargeable units. Planned vs actual via `container_kind`.

## Actions

| Action | Route |
|--------|--------|
| View / list | `GET /jobs/:id/containers`, `GET .../:containerId`, tabs `planned_container` / `actual_container` |
| Add | `POST /jobs/:id/containers` |
| Update | `PATCH /jobs/:id/containers/:containerId` |
| Multiple update | `PUT /jobs/:id/containers/bulk` |
| Upload sample | `GET /jobs/:id/containers/upload-sample` |
| Upload | `POST /jobs/:id/containers/upload`, paste, confirm |
| Export | `GET /jobs/:id/containers/export` |
| Update job details | `PATCH /jobs/:id/containers/job-details` |
| Storage charges | `POST .../storage-charges/calculate`, `confirm-to-costing` |
| Sync from sub-jobs | `POST /jobs/:id/containers/sync-from-sub-jobs` |

Containers are **job-scoped** (all modes). Sea FCL still sets `sea_fcl_detail_id` when present. Duplicate container numbers return a warning (tenant-wide).
