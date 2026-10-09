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
