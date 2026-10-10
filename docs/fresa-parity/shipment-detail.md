# Shipment detail (backend 1A)

## Header fields

`shipment_number`, `shipment_date`, branch, customer, department, status, address, freight terms, BL status, POR/POL/POD/POF, MBL/HBL, cross-trade, service type, ETD/ETA, nested quotation, enquiry link.

## Child tables (tab-owned)

- `shipment_routing_legs`
- `shipment_container_plans` / `shipment_container_actuals`
- `shipment_exchange_rates`
- `shipment_customs_refs` (customs + SB/BOE tab)
- `shipment_split_links` (split/merge graph)

## Job dual-read

When `job_id` is set and shipment tab rows are empty, `planned_container`, `actual_container` fall back to FCL job containers; job-linked actions proxy to existing job/documentation APIs.

## Toolbar actions

Copy, generate job (`DIRECT` default / `HOUSE`), change status, change BL status, department, split, merge, switch BL, EDI (`bayan-generate`, `bayan-submit`, `ccn-fwb`, `ccn-submit`, `eqo-dubai-generate`), create submaster, KPI, BL list, AWB (air + job), track-trace, booking form (`GET/PUT /shipments/:id/booking-form`).

## Job No link

After generate-job, detail header/links include `job_number` and `path_hint: /jobs/:id/detail` for FE navigation.
