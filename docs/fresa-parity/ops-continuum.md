# Ops continuum (Enquiry → Quotation → Shipment → Job)

Shared side-panel APIs. `entityType` = `ENQUIRY` | `QUOTATION` | `SHIPMENT` | `JOB`.

| Feature | Method | Path |
|---|---|---|
| Comments (shared staff) | GET/POST/PATCH/DELETE | `/ops/:entityType/:entityId/comments` (+ `/:commentId`) |
| Follow-ups | GET/POST | `/ops/:entityType/:entityId/follow-ups` |
| Attachments list | GET | `/ops/:entityType/:entityId/attachments` |
| Attachments metadata | POST | `/ops/:entityType/:entityId/attachments` |
| **Upload (R2)** | POST multipart | `/ops/:entityType/:entityId/attachments/upload` |
| **Download binary** | GET | `/ops/:entityType/:entityId/attachments/:id/download` |
| **Presigned URL** | GET | `/ops/:entityType/:entityId/attachments/:id/download-url` |
| References | GET/POST | `/ops/:entityType/:entityId/references` |
| Tags | GET/POST/DELETE | `/ops/:entityType/:entityId/tags` (+ `/:tagId`) |
| Links | GET/POST | `/ops/:entityType/:entityId/links` |
| Likes | GET + POST toggle | `/ops/:entityType/:entityId/likes`, `…/likes/toggle` |
| Complaints | GET/POST/PATCH | `/ops/:entityType/:entityId/complaints` |
| History | GET | `/ops/:entityType/:entityId/history` |

## Bidirectional attachments (Cloudflare R2)

| Actor | Upload | Sees |
|---|---|---|
| Staff | `/ops/.../attachments/upload` (`visible_to_customer` / `visible_to_vendor`, default true) | All |
| Customer | `/portal/ops/.../attachments/upload` | Staff uploads with `visible_to_customer` + own |
| Vendor | `/vendor/ops/.../attachments/upload` (JOB/SHIPMENT when linked via vendor quote) | Staff uploads with `visible_to_vendor` + own |

- Files go through `StorageService.saveBuffer` → R2 when `STORAGE_PROVIDER=r2`.
- Download: binary stream or presigned GET URL.
- Metadata: `uploader_side` (`STAFF`\|`CUSTOMER`\|`VENDOR`), `uploaded_by_party_id`, visibility flags.

### Portal / vendor paths

Same attachment verbs under:

- `/portal/ops/:entityType/:entityId/attachments…`
- `/vendor/ops/:entityType/:entityId/attachments…`

Ownership: customer must be party on enquiry/quote/shipment/job; vendor must have a `vendor_quotes` row on the job (shipment resolves via `job_id`).

## History

`GET …/history` returns a **unified timeline** (`data.events[]`):

| Field | Meaning |
|-------|---------|
| `at` | ISO date/time |
| `action` / `summary` | Machine + human-readable what happened |
| `actor.id` / `actor.name` | Staff who did it |
| `source` | `AUDIT` \| `COSTING` \| `STATUS` \| `ENTITY` |
| `old_values` / `new_values` | Before/after when available |

Job timeline also merges costing revisions; quotation merges `quotation_status_history`. Same shape as `GET /jobs/:id/detail/history` and `GET /shipments/:id/detail/history`.

## FE path_hints

Detail payloads expose `actions.path_hints.ops_continuum` (and `can_*` flags) via `opsContinuumPathHints` for enquiry / quotation / shipment / job. Favourites use `/favourites/toggle` (see [favourites.md](./favourites.md)); continuum **likes** remain separate.

## Notes

- Existing `GET/POST /crm/follow-ups` still works for CRM calendar; continuum path is preferred on the entity screen.
- Migration: `20261009180000_ops_attachment_visibility`, `20261016120000_ops_entity_comments`.
- Job notes (`/jobs/:id/notes`) are legacy and separate from continuum comments.
