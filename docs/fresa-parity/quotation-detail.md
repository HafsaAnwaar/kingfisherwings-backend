# Quotation detail (backend 1A)

## Header fields

`quotation_number`, `quotation_date`, branch/department, status, customer + `customer_address`, POR/POL/POD/POF, valid_from/to, transit_time, frequency, carrier, incoterm, service_type (`job_type`), PP/CC (`freight_payment_type`), marks, notes, ETD/ETA, vessel/voyage.

## Links

- `enquiry` — from `source_enquiry_id` (set on generate-from-enquiry)
- `shipment` — `converted_shipment_id` or first shipment with this `quotation_id`
- `job` — `converted_job_id`

## Actions (`actions` object)

Extends `quotationActionFlags`: `can_copy`, `can_change_status`, `can_generate_shipment`, `can_generate_job`, `can_verify`, etc.

## Tabs

| Tab | Content |
|-----|---------|
| `info` | Header payload |
| `costing` | Lines + totals |
| `organization` | Company/branch/dept/parties |
| `routing` | Ports, ETD/ETA, vessel |
