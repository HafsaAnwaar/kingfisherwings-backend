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

## Notes

- Shipment document endpoints require a linked Job (`job_id`); they reuse `DocumentGenerationService.enqueueJobDocument`.
- Catalog: `GET /documentation/reports` lists document + report registry stubs with template codes.
- Report templates: `GET /reports/templates`, generate via `POST /reports/generate`.
