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
| `history` | AuditLog rows for entity JOB |
| `booking_form` | Form completeness + path hints to mode/air routes |
| `shipments` | Shipments attached to this job |

## Toolbar actions

| Action | API |
|--------|-----|
| Change operational status | `POST /jobs/:id/change-status` |
| Stop / hold | `POST /jobs/:id/stop` → `ON_HOLD` |
| Close | `POST /jobs/:id/close` |
| Cancel | `POST /jobs/:id/cancel` |
| Copy | `POST /jobs/:id/copy` |
| Docs | `/ops/JOB/:id/attachments` (bidirectional visibility) |

Detail `actions` also exposes path hints for switch-BL, BL entry, AWB, tracking, EDI.

## Generate Job from shipment

Popup contract (FE):

- Modes: `DIRECT` (default, “Generate direct master job”), `HOUSE` (“Generate job with house”)
- `POST /shipments/:id/generate-job` — `mode` optional, defaults to `DIRECT`
- After success, shipment detail `links.job` / `job_number` navigates to `GET /jobs/:id/detail`
