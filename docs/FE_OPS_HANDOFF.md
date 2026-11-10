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
  - **Live vessel / flight card:** `live_tracking` (see §4b). Opt out with `?live=0`.
- Staff enter/edit: **`GET|PUT /jobs/:id/tracking/profile`** (seeds from job on first open; response includes `field_schemas`).
- Arrival report row fields: status, sending_time, receipt_time, container_no, sub_container_no, vessel_name, voyage_no, imo
- Customs row fields: carrier_operator, customs_released, sub_customs_no, quantity, weight, volume, customs_declaration_no, customs_inspection_status, customs_inspection_time
- Manifest row fields: sub_customs_no, status, sending_time, receipt_receiving_time, container_no, vessel_name, voyage_no, imo

### 4b. Live vessel / flight tracking (Google-style)

- **Free search (any vessel or flight number):**
  - `GET /track/live/flight?q=EK512`
  - `GET /track/live/vessel?q=MSC+OSCAR` (name or IMO)
- **On a job:** `GET /jobs/:id/tracking` and `GET /jobs/:id/tracking/live` — BE uses air `flight_number` or sea `vessel_name` / linked vessel **IMO**.
- **Public track page:** `GET /track?ref=…` and `GET /track/:ref` include `live_tracking` by default (`?live=0` to skip).
- Response shape (`live_tracking.data` or live lookup root):
  - `status`: `OK` | `NOT_FOUND` | `CONFIG_REQUIRED` | `ERROR`
  - `data.latitude` / `data.longitude` → map pin when present
  - `data` also may include status, origin/dest, ETA, speed, course, IMO/MMSI, flight callsign
  - `external_links[]` (`label`, `url`) — always show Google / FlightAware / MarineTraffic / VesselFinder fallbacks
- FE: search box → call live endpoints; Tracking tab / public page → render `live_tracking`; if `CONFIG_REQUIRED` or no coords, show links card instead of empty map.
- Env (ops/backend): `AVIATIONSTACK_API_KEY` (flights; OpenSky works without a key best-effort), `VESSELFINDER_API_KEY` (live AIS). Without keys, stub + external links still return.

## 5. Invoices — generate from quotation vs from job

- Two buttons:
  - **From quotation:** `GET /jobs/:id/invoices/sale/form?source=quotation` → save `POST /jobs/:id/invoices/sale`
  - **From job (costing sale amounts):** `GET /jobs/:id/invoices/sale/form?source=job` → if `needs_costing: true`, show the returned `costing_entry` schema / link to costing, then generate with `POST …/sale` and `source: "job"` (no silent quotation fallback).
- Default `source=auto` keeps legacy job-then-quotation behaviour.

## 6. Costing page — generate sale / purchase

- **Sales button** → sale amounts only (`…/invoices/sale` or form `?source=job`). Never fall back to quotation when the user chose job costing.
- **Purchase button** → cost amounts only (`…/invoices/purchase` / bulk). Requires `cost_party_id` (vendor) on cost lines; surface clear validation errors.
- After create, linked charges are marked invoiced (existing BE behaviour).
- Uninvoiced sale charges appear on that party’s AR statement as `pending_job_charges` (with `needs_invoice: true`) until a posted invoice exists.

## 7. AR / mark paid / party payments

- Statement (`GET /gl/ar/statement/:partyId` and AP twin): invoices + `pending_job_charges` from job costing.
  - Customer sale lines (`side: SALE`, amount = stored `sale_amount`) when party is `sale_party_id` / job bill-to.
  - Vendor cost lines (`side: COST`, amount = stored `cost_amount`) when party is `cost_party_id`.
- Totals are plain sums only: `invoice_balance` (sum of `balance_due`), `pending_costing` (sum of charge amounts), `paid`, `opening_balance`, `open_balance` = those open items added together — no extra FX/GP math.
- Invoice `payment_status`: `UNPAID` | `PROOF_UPLOADED` | `PAID`.
- Mark costing line paid: **`POST /jobs/:jobId/charges/:chargeId/mark-paid`** (multipart **required `file`**; optional `side=SALE|COST`) — creates/posts invoice then receipt.
- Staff invoice mark paid: **`POST /invoices/:id/mark-paid`** with proof file.
- Portal: **`POST /portal/invoices/:id/payments`** requires proof file.
- Party Payments tab: **`GET /parties/:id/payments`**.

## 8. Air MAWB + show_all + air tracking

- **MAWB tab:** `GET|PUT /jobs/:id/detail/mawb` — `editable` / `clearable`; clear a field with `null` or `""`.
- **Show all (same edits):** `GET|PATCH /jobs/:id/detail/show_all` exposes the same MAWB fields:
  - Nested `mawb` block (canonical for the FE form) + flat aliases: `flight_no` / `flight_number`, `flight_status`, `flight_date`, `shipment_date`, `mawb_no` / `mawb_number`, `hawb_no` / `hawb_number`, `arrival_flight_number`, `airline_id`, `airline_name`, `pallet_count`, `air_pallet`, `dimensions` / `volume_cbm`, `weight` / `gross_weight`.
  - GET sources match the MAWB tab (**booking form ≻ air_details**). `airline_name` is returned for round-trip PATCH.
  - PATCH may send flat fields or nested `mawb`; both hit the same write path as PUT mawb. `can_edit_mawb: true` on air jobs.
- Air track: `route` / `references` expose MAWB, HAWB, flight (not vessel/voyage). Live flight card via §4b.

## 9. Costing attachments + JOB_COSTING docs

- `JOB_COSTING` document type is allowed on sea FCL/LCL, land, road, NVOCC, CC, warehouse, service, courier, air import/export (allowlist fixed).
- Costing line attachments: `POST /jobs/:id/charges/:chargeId/attachments` (multipart preferred).
  - `side`: `SALE` (customer) | `COST` (vendor) | `CHARGE`
  - `purpose` dropdown: `GENERAL` | `PAYMENT_PROOF`
  - Visibility: `visible_to_customer`, `visible_to_vendor`, `downloadable_by_customer`, `downloadable_by_vendor` (defaults: SALE→customer, COST→vendor)
  - When `purpose=PAYMENT_PROOF` and tenant `costing_payment_proof_auto_mark_paid` is true (default), BE auto-marks that party’s charge amount paid (invoice + receipt) using the uploaded file. Response includes `marked_paid` / `mark_paid_warning`.
- Config: `GET|PATCH /organization/settings/costing` `{ costing_payment_proof_auto_mark_paid: boolean }` (tenant admin).
