# Enquiry API matrix (Fresa)

## 5-step create wizard

FE steps map to one `POST /crm/enquiries` body (or progressive `PATCH` drafts):

| Step | Content | Fields |
|---|---|---|
| 1 | Create enquiry | `service_type`, `currency_code`, optional `lead_id` |
| 2 | Port details | `branch_id`, `department_id`, `enquiry_date`, `party_id` (customer), `shipper_id`/`consignee_id`, addresses, `origin_port_id`/`dest_port_id`/`por_port_id`, `incoterms`, `etd`/`eta`, `payable_at`, `dispatch_at` |
| 3 | Planned container / consignee | customer, dept, `sales_coordinator_id`, `salesperson_id`, `price_coordinator_id`, `carrier_id`, `voyage_number`, `vessel_name`, pieces, `unit_price`, weights, `weight_unit`, `volume_cbm`, `cbm_unit`, `hs_code`, `commodity`, containers |
| 4 | Charge details | `charges[]` — `party_id`, `department_id`, `description`, `amount` (+ optional qty/unit_price/code) |
| 5 | Summary | FE review → submit create |

## Endpoints

| Fresa action | Method | Path | Status |
|---|---|---|---|
| Create enquiry sheet | POST | `/crm/enquiries` | Match |
| Update / edit | PATCH | `/crm/enquiries/:id` | Match |
| Detail + sections | GET | `/crm/enquiries/:id/detail` | Match |
| Detail (raw) | GET | `/crm/enquiries/:id` | Match |
| Cancel | POST | `/crm/enquiries/:id/cancel` | Match |
| Copy enquiry | POST | `/crm/enquiries/:id/copy` | Match |
| Report / PDF pack | GET | `/crm/enquiries/:id/report`, `/pdf` | Match |
| Generate quotation | POST | `/crm/enquiries/:id/generate-quotation` | Match |
| Generate shipment | POST | `/crm/enquiries/:id/generate-shipment` | Match |
| Generate job | POST | `/crm/enquiries/:id/generate-job` | Match |
| Open enquiry report | GET | `/crm/enquiries/reports/open` | Match |

## Detail sections (`GET …/detail`)

`sections.organization` · `port_details` · `dimensions` · `planned_consignee` · `costing` · `department` + `actions` flags (edit/report/copy/generate-*).

## Continuum (same on quote / shipment / job)

See [ops-continuum.md](./ops-continuum.md) — `/ops/ENQUIRY/:id/...`

## Status transitions

| Action | Status |
|---|---|
| Generate quotation | `QUOTED` (+ `quotation_id`) |
| Generate shipment / job | `BOOKED` (+ `shipment_id` / `job_id`) |
| Cancel | `CANCELLED` |

Customer portal quotation send/accept path unchanged (still available).
