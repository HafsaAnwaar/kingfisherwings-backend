# FE handoff — seven ops product changes

Backend-only delivery in FreightSaas. Use this checklist in the staff SPA / public track UI.

## 1. Idle logout (20 minutes of no activity)

- Default idle is **20 minutes** (`SESSION_IDLE_TIMEOUT_MINUTES`, exposed on `GET /auth/me` as `idle_timeout_minutes`).
- While the tab has user activity (keydown / mousemove / click), call **`POST /auth/session/touch`** on a timer (e.g. every 5 minutes). Refresh alone does **not** reset idle.
- On **401** with body `code: "IDLE_TIMEOUT"`: flush job-create draft (#3), then soft-redirect to login. Do **not** treat wall-clock time since login as logout.
- Do **not** hard-reload the SPA on background refresh-token blips; use soft re-auth. Distinguish `IDLE_TIMEOUT` from other auth failures so in-progress forms are not wiped before draft save.

## 2. Custom party types

- Load types from **`GET /parties/types`** (system + tenant custom).
- “Add type” → **`POST /parties/types`** `{ code, label }` (admin/staff with parties write). Soft-deactivate via DELETE on types.
- Create/update party with `party_type` **or** `party_type_code` (known system or custom code).

## 3. Job create wizard draft

- Debounce-save to **`PUT /jobs/create-drafts/current`** (+ `localStorage` backup keyed by user).
- On `/jobs/create` mount: restore **`GET /jobs/create-drafts/current`**.
- Also: `GET /jobs/create-drafts`, `GET|PUT|DELETE /jobs/create-drafts/:id`.
- After successful **`POST /jobs`**, delete the draft and clear localStorage.
- On idle logout: flush draft before redirect.

## 4. Tracking (public `/track` + staff `GET /jobs/:id/tracking`)

- Same enriched payload for both. Render:
  - **Header / route:** `route.bl_number`, `origin_port`, `dest_port`, `first_leg`, `second_leg`, `port_of_call[]` (role, port_name, eta/ata, etd/atd, vessel_name), `terminal_cutoff_at`
  - **Timeline:** `timeline` / `history` — milestones + container/ops only (no STATUS spam)
  - **Section 1 Cargo Info:** `cargo_info.arrival_report_status`, `customs_status`, `detailed_data`
  - **Section 2 Pre-manifest:** `pre_manifest.manifest_status`
  - **Section 3 QTY/G.W./VOL:** `qty_gw_vol` (`quantity`, `gross_weight`, `net_weight`, `volume`, `chargeable_weight`, units, `lines`)
  - `containers`
- Staff enter/edit: **`GET|PUT /jobs/:id/tracking/profile`** (seeds from job on first open; response includes `field_schemas`).
- Arrival report row fields: status, sending_time, receipt_time, container_no, sub_container_no, vessel_name, voyage_no, imo
- Customs row fields: carrier_operator, customs_released, sub_customs_no, quantity, weight, volume, customs_declaration_no, customs_inspection_status, customs_inspection_time
- Manifest row fields: sub_customs_no, status, sending_time, receipt_receiving_time, container_no, vessel_name, voyage_no, imo

## 5. Invoices — generate from quotation vs from job

- Two buttons:
  - **From quotation:** `GET /jobs/:id/invoices/sale/form?source=quotation` → save `POST /jobs/:id/invoices/sale`
  - **From job (costing sale amounts):** `GET /jobs/:id/invoices/sale/form?source=job` → if `needs_costing: true`, show the returned `costing_entry` schema / link to costing, then generate with `POST …/sale` and `source: "job"` (no silent quotation fallback).
- Default `source=auto` keeps legacy job-then-quotation behaviour.

## 6. Costing page — generate sale / purchase

- **Sales button** → sale amounts only (`…/invoices/sale` or form `?source=job`). Never fall back to quotation when the user chose job costing.
- **Purchase button** → cost amounts only (`…/invoices/purchase` / bulk). Requires `cost_party_id` (vendor) on cost lines; surface clear validation errors.
- After create, linked charges are marked invoiced (existing BE behaviour).
