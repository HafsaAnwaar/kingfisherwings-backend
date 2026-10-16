# Job detail (backend 1A)

## Header

`job_number`, status, job_type, branch/department/company, parties, ports, ETD/ETA, MBL/HBL (from sea FCL details when present), `created_from_quote_id`, `parent_job_id`, tracking token.

## Links

- `enquiry` — via shipment or quotation `source_enquiry_id`
- `quotation` — `created_from_quote_id`
- `shipment` — first shipment with `job_id` = this job

## Tabs

Same as shipment where applicable: `show_all`, `info`, `organization`, `dimensions`, `planned_container`, `actual_container`, `ex_rate`, `costing`, `department`, `shipping_bill_boe`, `routing`, `customs`, plus:

| Tab | Content |
|-----|---------|
| `department` | Branch/company/department/salesperson; `PATCH /jobs/:id/department` |
| `ex_rate` | Persisted `job_exchange_rates` (+ charge-derived); upsert/delete APIs |
| `routing` | Multi-leg `job_routing_legs` CRUD |
| `customs` / `shipping_bill_boe` | `job_customs_refs` CRUD (SB/BOE/house/status) |
| `history` | Unified timeline: create, status, costing revisions, continuum actions — with staff name, date/time |
| `booking_form` | Live form summary + `is_complete` + path hints to mode/air routes |
| `shipments` | Shipments attached to this job |

See also [job-fe-shell.md](./job-fe-shell.md) for FE wiring checklist.

## Toolbar actions

| Action | API |
|--------|-----|
| Status options (catalog) | `GET /jobs/status-options?job_id=` |
| Change status (anytime) | `POST /jobs/:id/change-status` |
| Reopen closed/cancelled | `POST /jobs/:id/reopen` |
| Stop / hold | `POST /jobs/:id/stop` → `ON_HOLD` |
| Close (checklist) | `POST /jobs/:id/close` |
| GPUM | `GET/PUT /jobs/:id/gpum` |
| Client PO reference | `PATCH /jobs/:id/organization/client-reference` |
| Dimension / commodity | `PATCH /jobs/:id/dimensions` |
| Cancel | `POST /jobs/:id/cancel` |
| Copy | `POST /jobs/:id/copy` |
| Docs (typed freight) | `GET/POST /jobs/:id/documents…` multipart upload + download + visibility; filter `?uploader_side=` |
| Docs (untyped continuum) | `/ops/JOB/:id/attachments` (bidirectional visibility) |

Detail `actions` also exposes path hints for switch-BL, BL entry, AWB, tracking, EDI.

## Generate EDI (job)

EDI = Electronic Data Interchange (customs/carrier file), not purchase invoice.

| Action | Method | Path |
|---|---|---|
| Eligible types | GET | `/jobs/:id/edi/types` |
| Generate | POST | `/jobs/:id/edi/generate` body `{ edi_type }` |
| List submissions | GET | `/jobs/:id/edi/submissions` |
| Download | GET | `/jobs/:id/edi/submissions/:submissionId/download` |

Detail `actions.can_edi` is true when any type is eligible; `actions.edi_types` lists them. Path hints: `edi_types`, `edi_generate`, `edi_submissions`. Delegates to documentation EDI stub payloads.

Public track path hint is `/track?ref={tracking_token}` (path form `/track/{token}` also works). Staff job/search list matches container numbers via `JobContainer` (`containers_job`) as well as BL/AWB/shipment refs.

## Generate Job from shipment

Popup contract (FE):

- Modes: `DIRECT` (default, “Generate direct master job”), `HOUSE` (“Generate job with house”)
- `POST /shipments/:id/generate-job` — `mode` optional, defaults to `DIRECT`
- After success, shipment detail `links.job` / `job_number` navigates to `GET /jobs/:id/detail`
