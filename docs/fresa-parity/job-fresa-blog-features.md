# Fresa blog job features → API map

| Blog topic | API |
|------------|-----|
| GPUM | `GET/PUT /jobs/:id/gpum` |
| Salesperson on create | `POST /documentation/jobs/create` + wizard `POST /documentation/jobs/create-wizard` |
| PO Number (client) | `PATCH /jobs/:id/organization/client-reference` |
| Change operational status | `POST /jobs/:id/change-status` + `GET /jobs/status-options` |
| Reopen | `POST /jobs/:id/reopen` |
| Commodity description | `PATCH /jobs/:id/dimensions` |
| Auto quantity (costing) | `POST /jobs/:id/charges` (auto qty from container type / charge unit) |
| Detention / storage → costing | `POST /jobs/:id/containers/storage-charges/calculate`, `.../confirm-to-costing` |
| Costing attachment count | `GET /jobs/:id/detail/costing` (`attachment_count` per line), `GET/POST .../charges/:chargeId/attachments` |
| Import Cargo Delivery | `GET /operations/import-cargo-delivery`, `PATCH /operations/import-cargo-delivery/:jobId` |
| Operation Dashboard / Closed Job Report | `GET /operations/dashboard`, `GET /operations/closed-job-report`, `POST /operations/closed-job-report/download` |
| Job date configuration | `GET/PATCH /organization/settings/job-date`; field `Job.job_date` on create/generate |
| Documentation All Jobs | `GET /documentation/jobs` |
