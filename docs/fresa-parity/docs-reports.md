# Docs & reports matrix (Fresa)

| Fresa action | Method | Path | Status |
|---|---|---|---|
| Booking confirmation | POST | `/shipments/:id/documents/booking-confirmation`, `/jobs/:id/documents/booking-confirmation` | Match |
| HBL draft (shipment-scoped) | POST | `/shipments/:id/documents/hbl` | Match |
| HBL / HAWB / MBL | POST | `/jobs/:id/documents/hbl`, `/hawb`, `/mbl` | Match |
| Delivery Order | POST | `/jobs/:id/documents/delivery-order` | Match |
| Cargo Arrival Notice | POST | `/jobs/:id/documents/can` | Match |
| Job Card | POST | `/jobs/:id/documents/job-card` | Match |
| DO / CAN / Job Card catalog | GET | `/documentation/reports` | Match |
| DSR | POST | `/reports/generate` (`DAILY_STATUS_REPORT_FORMAT_1_DSR_LIST_REPORT_FORMAT`) | Match |
| Shipwise DSR / ops job summary | POST | `/reports/generate` (`OPS_LIST_*`, see registry) | Match |
| Typed multipart upload (HAWB/MAWB/HBL/…/OTHER) | POST | `/jobs/:id/documents/:documentType/upload` | Match |
| Authenticated download | GET | `/jobs/:id/documents/:documentId/download` | Match |
| Visibility flags | PATCH | `/jobs/:id/documents/:documentId/visibility` | Match |
| List + `?uploader_side=` filter | GET | `/jobs/:id/documents` | Match |
| Invoice supporting attachments | GET/POST | `/invoices/:id/attachments` (+ `…/:id/download`) | Match |
| Voucher supporting attachments | GET/POST | `/gl/vouchers/:id/attachments` (+ `…/:id/download`) | Match |

## Typed uploads + party visibility (v1)

- **Store**: `JobDocument` (`source=GENERATED|UPLOADED`, `uploader_side`, `uploaded_by_party_id`, `visible_to_customer` / `visible_to_vendor`, optional `booking_form_kind`). Legal invoice PDF stays on `Invoice.pdf_*`; supporting files use `InvoiceAttachment` / `VoucherAttachment`.
- **Staff** always sees all job docs and finance attachments. Filter customer/vendor uploads with `?uploader_side=CUSTOMER|VENDOR`.
- **Portal**: `POST /portal/jobs/:id/documents/:documentType/upload` + list/download (ownership + `visible_to_customer`; internal types blocked). Booking-form attaches (mode + air/nvocc compliance) mirror into `JobDocument` with `uploader_side=CUSTOMER`.
- **Vendor**: `GET/POST /vendor/jobs/:id/documents…` when linked via vendor quote or cost_party; list = `visible_to_vendor` OR self-upload. Invoice/voucher attachments under `/vendor/invoices|vouchers/:id/attachments` when `party_id` matches.
- Continuum `OpsEntityAttachment` remains for untyped chatter (see [ops-continuum.md](./ops-continuum.md)).
- Migration: `…_typed_document_uploads`. Smoke: `src/test/typed-document-uploads.e2e-spec.ts`.

## Notes

- Shipment document endpoints require a linked Job (`job_id`); they reuse `DocumentGenerationService.enqueueJobDocument`.
- Catalog: `GET /documentation/reports` lists document + report registry stubs with template codes.
- Report templates: `GET /reports/templates`, generate via `POST /reports/generate`.
- Generate-PDF endpoints stay; multipart upload is an additional path into the same `JobDocument` rows.
