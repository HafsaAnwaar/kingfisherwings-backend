# Shipment API matrix (Fresa)

| Fresa action | Method | Path | Status |
|---|---|---|---|
| Create shipment | POST | `/shipments` | Match |
| List / detail / edit | GET/PATCH | `/shipments`, `/shipments/:id` | Match |
| Change status | POST | `/shipments/:id/change-status` | Match |
| Generate job (house\|direct) | POST | `/shipments/:id/generate-job` | Match |
| Copy shipment | POST | `/shipments/:id/copy` | Match |
| Sale/cost charges | POST/GET | `/shipments/:id/charges` | Match |
| Get charges (quote/party) | POST | `/shipments/:id/get-charges` | Match |
| Copy charges | POST | `/shipments/:id/copy-charges` | Match |
| Booking confirmation / HBL | POST | `/shipments/:id/documents/*` | Match |
| Attach to master job | POST | `/jobs/:id/shipments/attach` | Match |
| Detail header + tabs | GET | `/shipments/:id/detail`, `/shipments/:id/detail/:tab` | Match |
| Change BL status | POST | `/shipments/:id/change-bl-status` | Match |
| Change department | PATCH | `/shipments/:id/department` | Match |
| Split / merge | POST | `/shipments/:id/split`, `/shipments/:id/merge` | Match |
| Switch BL (job proxy) | POST | `/shipments/:id/switch-bl` | Match |
| EDI facade | POST | `/shipments/:id/edi/:action` | Match |
| Submaster / sub-job | POST | `/shipments/:id/create-submaster` | Match |
| KPI / BL / AWB / track | GET | `/shipments/:id/kpi`, `…/bills-of-lading`, `…/awb`, `…/tracking` | Match |

Tab keys: `show_all`, `info`, `organization`, `dimensions`, `planned_container`, `actual_container`, `ex_rate`, `costing`, `department`, `shipping_bill_boe`, `routing`, `customs`. When `job_id` is set, container/routing tabs dual-read from job data if shipment child rows are empty.
