# Swagger complete testing guide (Admin · Staff · Customer · Vendor)

**Live Swagger:** https://kingfisherwings-backend.onrender.com/docs  
**OpenAPI JSON:** https://kingfisherwings-backend.onrender.com/docs-json  
**Password for all dummy users:** `Welcome@123`  
**Today’s date context:** 2026-09-14

This guide is a **runbook in order**. You create IDs once, paste them into later calls, and use **Authorize** in Swagger with `Bearer <token>`.

---

## Companion files (complete dummy data for every API)

| File | What it is |
|------|------------|
| [`docs/generated/swagger-live-catalog.md`](generated/swagger-live-catalog.md) | **Every live API** (441) — **every param + every body field** with realistic dummy values |
| [`docs/generated/all-mutating-api-payloads.md`](generated/all-mutating-api-payloads.md) | **Every POST/PUT/PATCH** only — copy-paste bodies |
| [`docs/generated/number-formats-all-payloads.md`](generated/number-formats-all-payloads.md) | All 6 number-format document types (full JSON each) |
| [`docs/generated/masters-create-payloads.md`](generated/masters-create-payloads.md) | Every Masters `POST` create body |
| [`docs/generated/core-create-payloads.md`](generated/core-create-payloads.md) | Auth, tenants, users, parties, quotations, jobs, invoices |
| [`docs/generated/api-permission-map.md`](generated/api-permission-map.md) | Route → required permissions |

Regenerate after deploy:

```bash
curl -o openapi-live.json https://kingfisherwings-backend.onrender.com/docs-json
node scripts/generate-swagger-catalog.cjs
node scripts/generate-payload-packs.cjs
node scripts/generate-api-permission-map.cjs
```

**Rule:** Never use shorthand like “also create X”. If an API needs a body, paste the **full JSON** from this guide or from the generated files above.

### Live Swagger gap (important)

The **currently deployed** `/docs` tags cover Auth, Tenants, Users, Masters, Parties, Quotations, Jobs, Invoices, GL, etc.  
**Customer Portal** (`/portal/*`), **Vendor Portal** (`/vendor/*`), and some **Reports catalog** routes may be missing from live Swagger until that build is redeployed.  
Those routes still exist in source — use the permission map + payloads in **Part E / F** below (or hit them via “Try it out” once they appear, or Postman).

---

## 0. How to test in Swagger

1. Open `/docs`.
2. Expand an operation → **Try it out**.
3. Fill body/params → **Execute**.
4. Copy IDs from the response into a notepad (use the variable table below).
5. Click **Authorize** (top) → value = `Bearer eyJhbGci...` (or just the token if the UI already prefixes Bearer — match whatever works; usually paste **token only** if the dialog says `bearer`).
6. For **multipart** (payment proofs / files): use Swagger file picker; do not send raw JSON.

### Variable sheet (fill as you go)

| Variable | Where it comes from |
|----------|---------------------|
| `{{SA_TOKEN}}` | `POST /auth/super-admin/login` → `access_token` |
| `{{TENANT_ID}}` | `POST /tenants` → `id` |
| `{{TENANT_SLUG}}` | e.g. `kfw-demo` |
| `{{ADMIN_TOKEN}}` | `POST /auth/tenant-login` → `access_token` |
| `{{COMPANY_ID}}` | `GET /companies` first row |
| `{{BRANCH_ID}}` | `POST /masters/branches` |
| `{{PERM_parties.view}}` … | Permission UUID for code `parties.view` (see Part B) |
| `{{USER_ID_*}}` | Each single-perm staff user |
| `{{STAFF_TOKEN_*}}` | Each staff login |
| `{{CUSTOMER_ID}}` | Party `CUSTOMER` |
| `{{SUPPLIER_ID}}` | Party `SUPPLIER` (vendor) |
| `{{PORTAL_USER_EMAIL}}` | Portal user email |
| `{{PORTAL_TOKEN}}` | `POST /portal/auth/login` |
| `{{VENDOR_TOKEN}}` | `POST /vendor/auth/login` |
| `{{QUOTATION_ID}}` / `{{JOB_ID}}` / `{{INVOICE_ID}}` | Create flows |

---

## Part A — Platform bootstrap (Super Admin → Tenant Admin)

Do this **once** per environment (or use an existing tenant).

### A1. Health

```http
GET /health
```

### A2. Super Admin signup (only if none exists)

```http
POST /auth/super-admin/signup
```

```json
{
  "email": "superadmin@kingfisherwings.com",
  "password": "Welcome@123",
  "first_name": "Platform",
  "last_name": "Owner"
}
```

### A3. Super Admin login → `{{SA_TOKEN}}`

```http
POST /auth/super-admin/login
```

```json
{
  "email": "superadmin@kingfisherwings.com",
  "password": "Welcome@123"
}
```

Authorize with this token for Tenants APIs.

### A4. Create tenant (full body — fill every field)

```http
POST /tenants
Authorization: Bearer {{SA_TOKEN}}
```

```json
{
  "slug": "kfw-demo",
  "code": "KFWD",
  "name": "Kingfisher Demo Freight LLC",
  "display_name": "Kingfisher Demo",
  "password": "Welcome@123",
  "admin_first_name": "Tenant",
  "admin_last_name": "Admin",
  "domain": "demo.kingfisherwings.com",
  "website": "https://kingfisherwings.com",
  "logo_url": "https://kingfisherwings.com/logo.png",
  "primary_color": "#0B3D5C",
  "language": "en",
  "base_currency": "AED",
  "timezone": "Asia/Dubai",
  "country_code": "AE",
  "financial_year_start": 1,
  "vat_number": "100000000000003",
  "cr_number": "CR-1234567",
  "address": "Office 1201, Business Bay",
  "city": "Dubai",
  "phone": "+97144123456",
  "email": "admin@kfw-demo.com",
  "company_code": "KFWD",
  "company_name": "Kingfisher Demo Freight LLC",
  "company_legal_name": "Kingfisher Demo Freight Limited Liability Company",
  "company_registration_number": "REG-998877",
  "subscription_plan": "TRIAL",
  "status": "ACTIVE",
  "trial_ends": "2026-12-31T23:59:59.000Z",
  "subscription_ends": "2027-12-31T23:59:59.000Z",
  "max_users": 50,
  "max_branches": 10,
  "max_storage_gb": 20,
  "is_active": true
}
```

Save `id` → `{{TENANT_ID}}`, slug → `{{TENANT_SLUG}}` = `kfw-demo`.

### A5. Sync permissions (required before single-perm users)

```http
POST /tenants/{{TENANT_ID}}/sync-permissions
Authorization: Bearer {{SA_TOKEN}}
```

(Or `POST /tenants/sync-permissions` for all tenants.)

### A6. Tenant Admin login → `{{ADMIN_TOKEN}}`

```http
POST /auth/tenant-login
```

```json
{
  "tenant_slug": "kfw-demo",
  "password": "Welcome@123",
  "remember_me": true,
  "device_name": "Swagger-Chrome"
}
```

Authorize with this for **all Admin / ERP** steps below.

### A7. Confirm identity + permissions

```http
GET /auth/me
```

You should see tenant admin with a large `permissions` list.

### A8. Company + number formats (complete body for each document type)

```http
GET /companies
```

Save first company `id` → `{{COMPANY_ID}}`.

Call **six times** — one full body per document type:

```http
POST /organization/number-formats
Authorization: Bearer {{ADMIN_TOKEN}}
```

**1 QUOTATION**

```json
{
  "document_type": "QUOTATION",
  "prefix": "KFWD",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": true,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "YEARLY",
  "is_active": true
}
```

**2 JOB_NUMBER**

```json
{
  "document_type": "JOB_NUMBER",
  "prefix": "KFWD",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": true,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "YEARLY",
  "is_active": true
}
```

**3) INVOICE**

```json
{
  "document_type": "INVOICE",
  "prefix": "KFWD",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": true,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "YEARLY",
  "is_active": true
}
```

**4) CREDIT_NOTE**

```json
{
  "document_type": "CREDIT_NOTE",
  "prefix": "KFWD",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": true,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "YEARLY",
  "is_active": true
}
```

**5) PURCHASE_INVOICE**

```json
{
  "document_type": "PURCHASE_INVOICE",
  "prefix": "KFWD",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": true,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "YEARLY",
  "is_active": true
}
```

**6) VOUCHER**

```json
{
  "document_type": "VOUCHER",
  "prefix": "KFWD",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": true,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "YEARLY",
  "is_active": true
}
```

Preview examples:

```http
GET /organization/number-formats/QUOTATION/preview
GET /organization/number-formats/JOB_NUMBER/preview
GET /organization/number-formats/INVOICE/preview
```

---

## Part B — Read / Write permission lab (create-user + matrix APIs)

Goal: create staff with **None / Read / Read & Write (`write`)** per department/function, and prove APIs enforce those choices after re-login.

### B1. How it works now

1. **Role card** (`User.role`, e.g. `WAREHOUSE_STAFF`) = preset template + catalog Role assignment.
2. **`permission_grants`** (on `POST/PATCH /users`) or **`PUT /users/:id/permission-matrix`** = per `module` + `submodule` access:
   - `none` — no access
   - `read` — view only
   - `write` — Read & Write (full actions)
3. Matrix grants are **bridged** into classic codes (`wms.view`, `quotations.create`, …) so `PermissionsGuard` enforces them.
4. When a user has any matrix grants, bridged classic codes from **role packs are overridden** by the matrix (Read cannot be upgraded by a fat role pack).
5. **Re-login required** after matrix changes (JWT embeds permissions).

```http
GET /users/permission-matrix
GET /users/role-presets
POST /tenants/{{TENANT_ID}}/sync-permissions
```

Sync after deploy so new tree nodes (`support.*`, `logistics.driver`, …) exist.

### B2. Load wizard defaults

```http
GET /users/role-presets
Authorization: Bearer {{ADMIN_TOKEN}}
```

Returns each role card with `default_grants: [{ module, submodule, access }]`.  
Frontend: Step 1 pick role → Step 3 show radios None / Read / Read & Write from this payload.

```http
GET /users/permission-matrix
```

Returns the full module tree + `access_levels: ["none","read","write"]`.

### B3. Create Warehouse Staff — **read only**

```http
POST /users
Authorization: Bearer {{ADMIN_TOKEN}}
```

```json
{
  "email": "wh.read@kfw-demo.com",
  "first_name": "Warehouse",
  "last_name": "Reader",
  "phone": "+971501111001",
  "preferred_country_code": "AE",
  "company_id": "{{COMPANY_ID}}",
  "branch_id": "{{BRANCH_ID}}",
  "role": "WAREHOUSE_STAFF",
  "status": "ACTIVE",
  "permission_grants_mode": "replace",
  "permission_grants": [
    { "module": "wms", "submodule": "module", "access": "read" },
    { "module": "masters", "submodule": "other", "access": "read" },
    { "module": "operations", "submodule": "warehouse", "access": "read" }
  ]
}
```

Save temp password → login via `POST /auth/login` → Authorize.

Expect:
- `GET` WMS list endpoints → **200**
- `POST` WMS manage endpoints → **403**
- `GET /auth/me` → `permission_matrix` shows `wms.module.access = "read"`

### B4. Create Warehouse Staff — **Read & Write**

Same as B3 but `"access": "write"` on `wms` / `operations.warehouse`. Expect manage routes **200**.

### B5. Create Sales Executive with mixed grants

```json
{
  "email": "sales.mixed@kfw-demo.com",
  "first_name": "Sales",
  "last_name": "Mixed",
  "role": "SALES_EXECUTIVE",
  "status": "ACTIVE",
  "company_id": "{{COMPANY_ID}}",
  "permission_grants_mode": "merge_with_preset",
  "permission_grants": [
    { "module": "sales", "submodule": "quotations", "access": "write" },
    { "module": "sales", "submodule": "crm", "access": "read" },
    { "module": "finance", "submodule": "invoices", "access": "none" }
  ]
}
```

`merge_with_preset` keeps role defaults for unspecified nodes; listed nodes override.

### B6. Permissions API only (after user exists)

```http
PUT /users/{{USER_ID}}/permission-matrix
```

```json
{
  "grants": [
    { "module": "wms", "submodule": "module", "access": "read" },
    { "module": "finance", "submodule": "invoices", "access": "write" },
    {
      "module": "operations",
      "submodule": "air_export",
      "access": "write"
    }
  ]
}
```

Legacy booleans still work (`see`/`read`/`write`); if `access` is set it wins.

```http
GET /users/{{USER_ID}}/permission-matrix
GET /users/{{USER_ID}}
GET /auth/me
```

Each returns computed `access` per submodule.

### B7. Operations job-type matrix

```json
{
  "grants": [
    { "module": "operations", "submodule": "air_export", "access": "write" },
    { "module": "operations", "submodule": "air_import", "access": "read" },
    { "module": "operations", "submodule": "sea_fcl_export", "access": "none" }
  ]
}
```

After re-login: create AIR_EXPORT job **200**; list may hide SEA_FCL_EXPORT; create AIR_IMPORT **403** (read ≠ write).

### B8. Recommended test matrix

| User | Grants | Expect 200 | Expect 403 |
|------|--------|------------|------------|
| `wh.read@…` | wms read | GET WMS | POST WMS manage |
| `wh.write@…` | wms write | GET+POST WMS | — |
| `sales.q@…` | sales.quotations write, finance none | POST /quotations | POST /invoices |
| `ops.air@…` | operations.air_export write only | POST job AIR_EXPORT | POST job SEA_FCL_EXPORT |
| `fin.read@…` | finance.* read | GET invoices/GL | POST invoice / post voucher |

### B9. Frontend wizard contract

1. `GET /users/role-presets` → fill Step 3 defaults from selected role.
2. Radios: **None** / **Read** / **Read & Write** → `access: none|read|write`.
3. `POST /users` with `role` + `permission_grants` (+ optional `permission_grants_mode`).
4. User logs in; menus/APIs follow JWT; show `permission_matrix` from `/auth/me`.

---

## Part B-legacy — Classic single `permission_ids` (optional)

Still supported for fine-grained UUID grants:

```http
POST /users
```

```json
{
  "email": "perm.parties.view@kfw-demo.com",
  "first_name": "Perm",
  "last_name": "PartiesView",
  "role": "READ_ONLY",
  "status": "ACTIVE",
  "company_id": "{{COMPANY_ID}}",
  "permission_grants_mode": "replace",
  "permission_grants": [
    { "module": "sales", "submodule": "parties", "access": "read" }
  ]
}
```

Prefer matrix `access` over raw `permission_ids` unless you are debugging a single classic code.

**Create user** returns a **temporary password** — copy it, or:

```http
POST /users/{{USER_ID}}/admin-reset-password
```

---

## Part C — Masters + Parties (Admin token) — full dummy fields

Create these **before** quotations/jobs. Full field catalogs for every master CRUD are under **Masters — *** in `swagger-live-catalog.md`. Below are ready-to-paste realistic bodies.

### C1. Branch

```http
POST /masters/branches
```

```json
{
  "code": "DXB",
  "name": "Dubai Head Office",
  "company_id": "{{COMPANY_ID}}",
  "is_active": true
}
```

→ `{{BRANCH_ID}}`

### C2. Currency / Country / Ports / Airline / Charge / Tax

```http
POST /masters/currencies
```

```json
{
  "code": "AED",
  "name": "UAE Dirham",
  "symbol": "د.إ",
  "decimal_places": 2,
  "is_active": true
}
```

```http
POST /masters/countries
```

```json
{
  "iso_code": "AE",
  "iso3_code": "ARE",
  "name": "United Arab Emirates",
  "dial_code": "+971",
  "region": "Middle East",
  "is_active": true
}
```

```http
POST /masters/ports
```

```json
{
  "un_locode": "AEDXB",
  "name": "Dubai",
  "city": "Dubai",
  "country_code": "AE",
  "mode": "AIR",
  "is_active": true
}
```

```json
{
  "un_locode": "GBLHR",
  "name": "London Heathrow",
  "city": "London",
  "country_code": "GB",
  "mode": "AIR",
  "is_active": true
}
```

→ `{{ORIGIN_PORT_ID}}`, `{{DEST_PORT_ID}}`

```http
POST /masters/airlines
```

```json
{
  "iata_code": "EK",
  "icao_code": "UAE",
  "prefix_code": "176",
  "name": "Emirates",
  "country_code": "AE",
  "is_active": true
}
```

```http
POST /masters/charge-codes
```

```json
{
  "code": "AFR",
  "description": "Air Freight",
  "charge_group": "FREIGHT",
  "applicable_modes": ["AIR"],
  "tax_applicable": true,
  "is_active": true
}
```

```http
POST /masters/tax-rates
```

```json
{
  "name": "UAE VAT 5%",
  "code": "VAT5",
  "tax_type": "VAT",
  "rate": 5,
  "country_code": "AE",
  "effective_from": "2024-01-01",
  "is_default": true,
  "is_active": true
}
```

Same payloads (and every other Masters POST) are also in [`docs/generated/masters-create-payloads.md`](generated/masters-create-payloads.md).

#### Remaining masters — complete bodies (execute each)

```http
POST /masters/airports
```

```json
{
  "iata_code": "DXB",
  "icao_code": "OMDB",
  "name": "Dubai International Airport",
  "city": "Dubai",
  "country_code": "AE",
  "latitude": 25.2532,
  "longitude": 55.3657,
  "timezone": "Asia/Dubai",
  "is_active": true
}
```

```http
POST /masters/banks
```

```json
{
  "name": "Emirates NBD",
  "short_name": "ENBD",
  "swift_code": "EBILAEAD",
  "iban_prefix": "AE07",
  "country_code": "AE",
  "is_active": true
}
```

```http
POST /masters/shipping-lines
```

```json
{
  "name": "Maersk Line",
  "scac_code": "MAEU",
  "country_code": "DK",
  "is_active": true
}
```

```http
POST /masters/vessels
```

```json
{
  "name": "MSC GULSUN",
  "imo_number": "9839430",
  "flag_country": "LR",
  "is_active": true
}
```

```http
POST /masters/warehouses
```

```json
{
  "code": "DXB-WH1",
  "name": "Dubai Freezone Warehouse",
  "city": "Dubai",
  "country_code": "AE",
  "is_active": true
}
```

```http
POST /masters/container-types
```

```json
{
  "code": "40HC",
  "name": "40ft High Cube",
  "teu": 2,
  "is_active": true
}
```

```http
POST /masters/departments
```

```json
{
  "code": "OPS",
  "name": "Operations",
  "is_active": true
}
```

```http
POST /masters/designations
```

```json
{
  "code": "EXE",
  "name": "Executive",
  "is_active": true
}
```

```http
POST /masters/units-of-measure
```

```json
{
  "code": "KGS",
  "name": "Kilogram",
  "is_active": true
}
```

### C2b. Remaining Masters tiles (Wave 1–3)

Classic CRUD uses `masters.view|create|update|delete`. Soft-delete via `DELETE`. After create, empty-list Redis cache is invalidated for registered prefixes.

**Wave 1 — reference CRUD**

| Route | Sample POST body |
|-------|------------------|
| `POST /masters/regions` | `{"code":"GCC","name":"Gulf","country_code":"AE","is_active":true}` |
| `POST /masters/cities` | `{"code":"DXB","name":"Dubai","country_code":"AE","region_id":"{{REGION_ID}}","is_active":true}` |
| `POST /masters/zones` | `{"code":"JAFZA","name":"Jebel Ali FZ","city_id":"{{CITY_ID}}","is_active":true}` |
| `POST /masters/divisions` | `{"code":"SEA","name":"Sea Freight","company_id":"{{COMPANY_ID}}","is_active":true}` |
| `POST /masters/categories` | `{"code":"SHIPPER","name":"Shipper","category_type":"PARTY","is_active":true}` |
| `POST /masters/commodities` | `{"code":"ELEC","name":"Electronics","hs_code":"8517.12","is_active":true}` |
| `POST /masters/packs` | `{"code":"CTN","name":"Carton","length_cm":40,"width_cm":30,"height_cm":25,"is_active":true}` |
| `POST /masters/clauses` | `{"code":"DEM-DET","title":"Demurrage","body":"Free time per carrier tariff.","clause_type":"BL","is_active":true}` |
| `POST /masters/port-clause-maps` | `{"port_id":"{{PORT_ID}}","clause_id":"{{CLAUSE_ID}}","is_active":true}` |
| `POST /masters/rate-bases` | `{"code":"PER_KG","name":"Per Kilogram","is_active":true}` |
| `POST /masters/voyages` | `{"voyage_code":"VSL-2026-001","etd":"2026-04-01T00:00:00.000Z","eta":"2026-04-15T00:00:00.000Z","is_active":true}` |
| `POST /masters/storage-slabs` | `{"code":"SLAB-1-7","name":"Days 1-7","from_days":1,"to_days":7,"rate":25.5,"currency_code":"AED","is_active":true}` |
| `POST /masters/activities` | `{"code":"FOLLOW_UP","name":"Follow Up","module":"CRM","is_active":true}` |
| `POST /masters/sales-call-activities` | `{"code":"COLD_CALL","name":"Cold Call","is_active":true}` |

Smoke: create → `GET` list for each route (confirm new row appears).

**Wave 2 — search / inventory / history**

| Route | Notes |
|-------|--------|
| `GET /masters/address-search?q=dubai` | Party addresses |
| `GET /masters/contacts-search?q=ahmed` | Party contacts |
| `GET /masters/attachments-search?q=.pdf` | Job document metadata |
| `GET /masters/container-inventory` | Job containers + free days (`status`, `container_type_id`, `q`) |
| `GET/POST/DELETE /masters/favorites` | Own favorites; **auth only** (no `masters.create`) |
| `GET /masters/tracking-users` | Active staff with ops/CS/sales flags |
| `GET/POST /masters/whatsapp-sms-history` | Message log; POST append for providers |

Favorites example:

```http
POST /masters/favorites
```

```json
{
  "entity_type": "party",
  "entity_id": "{{PARTY_ID}}",
  "label": "Acme Logistics"
}
```

WhatsApp/SMS append:

```http
POST /masters/whatsapp-sms-history
```

```json
{
  "channel": "WHATSAPP",
  "to_address": "+971501234567",
  "body_snippet": "Shipment AE123 departed",
  "status": "SENT"
}
```

**Wave 3 — aliases / light CRUD**

| Route | Behavior |
|-------|----------|
| `GET /masters/organization` | Proxy to organization profile (writes stay on `/organization`) |
| `GET/POST/PATCH/DELETE /masters/organization-groups` | CRUD + optional `company_ids[]` |
| `GET /masters/notifications` | Proxy list for current user (same payload shape as `/notifications`) |
| `GET/POST/PATCH/DELETE /masters/custom-reports` | Links `report_template_code` without Jasper coupling |

```http
POST /masters/organization-groups
```

```json
{
  "code": "GULF",
  "name": "Gulf Companies",
  "company_ids": ["{{COMPANY_ID}}"],
  "is_active": true
}
```

```http
POST /masters/custom-reports
```

```json
{
  "code": "AR_AGING_CUST",
  "name": "Customer AR Aging",
  "report_template_code": "ar_aging",
  "is_active": true
}
```

For any other Masters route (GET/PATCH/DELETE), copy the exact params/body from [`swagger-live-catalog.md`](generated/swagger-live-catalog.md) under the matching **Masters — *** tag. Until redeploy, use the local supplement [`remaining-masters-catalog.md`](generated/remaining-masters-catalog.md), then regenerate live catalogs from `/docs-json`.

### C3. Customer party (full fields)

```http
POST /parties
```

```json
{
  "company_id": "{{COMPANY_ID}}",
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "short_name": "Al Noor",
  "vat_number": "100123456700003",
  "cr_number": "CN-445566",
  "country_code": "AE",
  "city": "Dubai",
  "address": "Al Quoz Industrial Area 3",
  "phone": "+971501234567",
  "email": "ops@alnoor.ae",
  "credit_limit": 50000,
  "credit_days": 30,
  "currency_code": "AED",
  "portal_access": true,
  "marketing_subscription": true,
  "tags": ["vip", "air"],
  "notes": "Prefer Friday cut-off 14:00 GST",
  "is_active": true
}
```

→ `{{CUSTOMER_ID}}`

### C4. Supplier party (for Vendor portal)

```http
POST /parties
```

```json
{
  "company_id": "{{COMPANY_ID}}",
  "party_type": "SUPPLIER",
  "code": "SUP-001",
  "name": "Gulf Air Cargo Agents LLC",
  "short_name": "GACA",
  "country_code": "AE",
  "city": "Dubai",
  "address": "Cargo Village DXB",
  "phone": "+971502222333",
  "email": "billing@gaca.ae",
  "currency_code": "AED",
  "is_active": true
}
```

→ `{{SUPPLIER_ID}}`

### C5. Party contact

```http
POST /parties/{{CUSTOMER_ID}}/contacts
```

```json
{
  "name": "Sara Ahmed",
  "email": "sara@alnoor.ae",
  "phone": "+971509998877",
  "is_primary": true
}
```

---

## Part D — ERP core sequence (Admin / staff) — full bodies

Use `{{ADMIN_TOKEN}}`. Replace every `{{…}}` UUID with IDs from Part C.

### D1. Create quotation (every field)

```http
POST /quotations
```

```json
{
  "company_id": "{{COMPANY_ID}}",
  "job_type": "AIR_EXPORT",
  "customer_id": "{{CUSTOMER_ID}}",
  "salesperson_id": "{{USER_ID_SALES}}",
  "branch_id": "{{BRANCH_ID}}",
  "department_id": "{{DEPARTMENT_ID}}",
  "carrier_id": "{{AIRLINE_ID}}",
  "origin_port_id": "{{ORIGIN_PORT_ID}}",
  "dest_port_id": "{{DEST_PORT_ID}}",
  "incoterm": "FOB",
  "commodity": "General cargo electronics",
  "hs_code": "8517.12",
  "gross_weight": 250.5,
  "chargeable_weight": 280,
  "volume_cbm": 1.8,
  "pieces": 12,
  "container_type_id": null,
  "container_count": null,
  "is_dg": false,
  "dg_class": null,
  "special_requirements": "Keep upright",
  "carrier_preference": "Emirates",
  "transit_time_days": 3,
  "routing_notes": "DXB-LHR direct",
  "remarks": "Customer wants Friday cut-off",
  "internal_notes": "Priority account",
  "valid_until": "2026-10-31",
  "currency_code": "AED",
  "exchange_rate": 1,
  "discount_percent": 0,
  "discount_amount": 0
}
```

Save → `{{QUOTATION_ID}}`. Then walk every Quotations lifecycle route in [`swagger-live-catalog.md`](generated/swagger-live-catalog.md) (charges, submit, approve, send, convert-to-job) with full bodies from that file.

### D2. Create job (every field)

```http
POST /jobs
```

```json
{
  "job_type": "AIR_EXPORT",
  "company_id": "{{COMPANY_ID}}",
  "branch_id": "{{BRANCH_ID}}",
  "department_id": "{{DEPARTMENT_ID}}",
  "parent_job_id": null,
  "shipper_id": "{{CUSTOMER_ID}}",
  "consignee_id": "{{CONSIGNEE_ID}}",
  "agent_id": null,
  "salesperson_id": "{{USER_ID_SALES}}",
  "ops_user_id": "{{USER_ID_OPS}}",
  "origin_port_id": "{{ORIGIN_PORT_ID}}",
  "dest_port_id": "{{DEST_PORT_ID}}",
  "commodity": "General cargo electronics",
  "hs_code": "8517.12",
  "gross_weight": 250.5,
  "chargeable_weight": 280,
  "volume_cbm": 1.8,
  "pieces": 12,
  "container_type_id": null,
  "container_count": null,
  "incoterms": "FOB",
  "is_dg": false,
  "dg_class": null,
  "notes": "Ops note — handle with care",
  "customer_remarks": "Deliver before noon",
  "tags": ["air", "priority"],
  "etd": "2026-09-20",
  "eta": "2026-09-21"
}
```

Save → `{{JOB_ID}}`. For every nested Jobs route (100+), use full params/bodies from the catalog tag **Jobs**.

### D3. Create invoice (every field)

```http
POST /invoices
```

```json
{
  "party_id": "{{CUSTOMER_ID}}",
  "company_id": "{{COMPANY_ID}}",
  "job_id": "{{JOB_ID}}",
  "branch_id": "{{BRANCH_ID}}",
  "department_id": "{{DEPARTMENT_ID}}",
  "currency_code": "AED",
  "exchange_rate": 1,
  "vat_rate": 5,
  "invoice_date": "2026-09-14",
  "due_date": "2026-10-14",
  "lpo_number": "LPO-7788",
  "remarks": "Net 30",
  "internal_notes": "Auto-created from job charges",
  "lines": [
    {
      "description": "Air Freight",
      "quantity": 280,
      "unit_price": 12.5,
      "charge_code_id": "{{CHARGE_CODE_ID}}",
      "tax_rate_id": "{{TAX_RATE_ID}}",
      "is_taxable": true,
      "sort_order": 0
    }
  ]
}
```

Save → `{{INVOICE_ID}}`. Continue with post / send / PDF using catalog bodies under tag **Invoices**.

### D4. GL (finance)

Use full bodies from catalog sections `GL — *` in [`swagger-live-catalog.md`](generated/swagger-live-catalog.md) or [`all-mutating-api-payloads.md`](generated/all-mutating-api-payloads.md) — every voucher/payment/cheque field is listed there (no shorthand).

---

## Part E — Customer Portal perspective

Admin sets up portal users on the **customer party**; customer logs into `/portal/*`.

### E1. Portal document permissions (Admin)

```http
GET /parties/{{CUSTOMER_ID}}/portal-permissions
PUT /parties/{{CUSTOMER_ID}}/portal-permissions
```

Example PUT (adjust to your DTO / Swagger schema when available):

```json
{
  "document_types": [
    "HAWB",
    "MAWB",
    "INVOICE",
    "CREDIT_NOTE",
    "STATEMENT",
    "PRE_ALERT",
    "OTHER"
  ]
}
```

### E2. Create portal user (Admin)

```http
POST /parties/{{CUSTOMER_ID}}/portal-users
```

```json
{
  "email": "customer.user@alnoor.ae",
  "full_name": "Sara Ahmed",
  "phone": "+971509998877",
  "password": "Welcome@123",
  "send_email": false,
  "invite_mode": false
}
```

If `invite_mode: true`, use:

```http
POST /portal/auth/accept-invite
```

```json
{
  "token": "{{INVITE_TOKEN_FROM_EMAIL_OR_RESPONSE}}",
  "password": "Welcome@123",
  "first_name": "Sara",
  "last_name": "Ahmed"
}
```

### E3. Portal login → `{{PORTAL_TOKEN}}`

```http
POST /portal/auth/login
```

```json
{
  "email": "customer.user@alnoor.ae",
  "password": "Welcome@123",
  "tenant_slug": "kfw-demo"
}
```

(If live schema differs, match Swagger fields exactly.)

Authorize with portal token for:

| Sequence | Method | Path |
|----------|--------|------|
| 1 | GET | `/portal/auth/me` |
| 2 | GET | `/portal/dashboard` |
| 3 | GET | `/portal/shipments` → detail → milestones → documents |
| 4 | GET | `/portal/quotations` → estimate / request / accept / reject / counter-offer |
| 5 | GET | `/portal/invoices` → open-items → pdf |
| 6 | POST | `/portal/invoices/{id}/payment-proofs` (multipart file) |
| 7 | GET | `/portal/credit/summary` · aging · statement |
| 8 | GET/POST | `/portal/messages` · `/portal/disputes` · credit limit requests |
| 9 | GET/PUT | `/portal/preferences` |
| 10 | GET | `/portal/notifications` |

Staff-side CCP (needs `portal.*` staff perms): `/portal-admin/messages`, `/portal-admin/disputes`, `/portal-admin/credit-limit-requests`.

---

## Part F — Vendor Portal perspective

### F1. Vendor permissions + user (Admin)

```http
GET /parties/{{SUPPLIER_ID}}/vendor-permissions
PUT /parties/{{SUPPLIER_ID}}/vendor-permissions
POST /parties/{{SUPPLIER_ID}}/vendor-users
```

```json
{
  "email": "vendor.user@gaca.ae",
  "full_name": "Omar Vendor",
  "phone": "+971504444555",
  "password": "Welcome@123",
  "send_email": false,
  "invite_mode": false
}
```

### F2. Vendor login → `{{VENDOR_TOKEN}}`

```http
POST /vendor/auth/login
```

```json
{
  "email": "vendor.user@gaca.ae",
  "password": "Welcome@123",
  "tenant_slug": "kfw-demo"
}
```

### F3. Vendor API sequence

| Sequence | Method | Path |
|----------|--------|------|
| 1 | GET | `/vendor/auth/me` |
| 2 | GET | `/vendor/dashboard` · `/vendor/tasks` |
| 3 | GET | `/vendor/quotes` (or `/vendor/job-offers`) → accept / reject / counter / price |
| 4 | GET | `/vendor/invoices` · open-items · submit · payment-proofs |
| 5 | GET | `/vendor/payments` · remittance.pdf · credit/aging · statement |
| 6 | POST/GET | `/vendor/disputes` |
| 7 | GET | `/vendor/lookups/ports` · airports |

Staff vendor-admin: `/vendor-admin/disputes`.

---

## Part Fb — WMS GRN / GDO (GDN) PDF download

Requires JWT with `wms.view` (warehouse staff or admin). **GDN = same outbound document as GDO** (`/wms/gdos`).

Statuses: **DRAFT**, **POSTED**, and **CANCELLED** are all downloadable. CANCELLED PDFs include a **CANCELLED** watermark.

```http
GET /wms/grns/{{GRN_ID}}/pdf
Authorization: Bearer {{TOKEN}}
```

Response: `application/pdf` attachment `GRN-{grn_number}.pdf`

```http
GET /wms/gdos/{{GDO_ID}}/pdf
Authorization: Bearer {{TOKEN}}
```

Response: `application/pdf` attachment `GDO-{gdo_number}.pdf`

PDF includes: title, number, status, warehouse, party/job/(ASN for GRN), dates, remarks, line table (item code/name/qty/UOM/batch), company header, footer with generated time + document id.

Expect **404** for wrong id/tenant; **403** without `wms.view`.

---

## Part G — Sweep every remaining API (complete dummy data)

Do **not** invent shorthand. For each remaining operation:

1. Open [`docs/generated/swagger-live-catalog.md`](generated/swagger-live-catalog.md) (all **441** APIs)  
   **or** [`docs/generated/all-mutating-api-payloads.md`](generated/all-mutating-api-payloads.md) (all **243** POST/PUT/PATCH).
2. Find the exact `METHOD /path`.
3. Copy **Params (every field)** and **Body (every field)** into Swagger.
4. Replace UUID placeholders with your `{{…}}` variables.
5. Execute; record status code.

### Suggested tag order

1. Auth  
2. Tenants (Super Admin)  
3. Users  
4. Organization Profile / Number Formats / Bank Accounts  
5. Companies  
6. Masters — * (all)  
7. Parties  
8. Quotations (+ Online Tariff / Zip Distance)  
9. Jobs  
10. AWB Stock  
11. Invoices / Credit Notes / Debit Notes / Purchase Invoices / Payment Requests  
12. GL — *  
13. Search / Locale / Files / Vessels — Schedules  

---

## Part H — Quick troubleshooting

| Symptom | Fix |
|---------|-----|
| 401 | Re-login; Authorize again; token expired |
| 403 Missing permission | Wrong user; sync permissions; add `.view` + action |
| 400 No active number format | Part A8 |
| 404 on `/portal/*` in Swagger | Deploy lag — call URL directly or redeploy |
| Validation failed on `"string"` | Replace with real codes/emails/phones |
| SMTP / email invite fails | On Render free tier use `gmail_api` / `resend` (see `docs/EMAIL_SETUP_GMAIL.md`) or set `invite_mode: false` + password |
| File download 404 after redeploy | Ephemeral disk — configure R2 (`docs/STORAGE_SETUP.md`) |

---

## Part G2 — NVOCC Sea Export workflow smoke

Canonical department handoff for **NVOCC_EXPORT** only (not Sea FCL Export). Stage owners: CS → Sales → Ops → Docs → Accounts → MGMT. Wrong department gets **403** unless Tenant Admin uses `admin_override` + `stage_override_reason`.

### G2.0 Seed specs (once per tenant)

```http
POST /masters/container-types/seed-defaults
GET  /masters/container-types
```

### G2.1 Quote → CS triage → Sales send → Customer accept

1. Portal: `POST /portal/quotations/request` → CS notified  
2. Staff CS: `POST /nvocc/bookings/{{NVOCC_BOOKING_ID}}/cs-triage` (grants `Party.portal_access`)  
3. Sales/Admin: send quote via existing quotations APIs, then `POST /nvocc/bookings/{{NVOCC_BOOKING_ID}}/mark-quote-sent`  
4. Portal: `POST /portal/bookings/{{NVOCC_BOOKING_ID}}/accept` → `CUSTOMER_ACCEPTED`  

### G2.2 Customer compliance booking form (8-step site parity)

```http
GET  /portal/bookings/{{NVOCC_BOOKING_ID}}/compliance-form
PUT  /portal/bookings/{{NVOCC_BOOKING_ID}}/compliance-form
POST /portal/bookings/{{NVOCC_BOOKING_ID}}/compliance-form/documents/commercial_invoice
POST /portal/bookings/{{NVOCC_BOOKING_ID}}/compliance-form/submit
```

```json
{
  "date_of_request": "2026-09-16",
  "client_booking_no": "KF-REQ-01",
  "voyage_ref": "KF-V01",
  "gross_weight_kg": 18500,
  "net_weight_kg": 17000,
  "pol": "Jebel Ali",
  "pod": "Karachi",
  "shipper_owned_container": false,
  "is_dg": false,
  "teu_count": 2,
  "commodity": "General cargo",
  "hs_code": "8471",
  "final_use": "Retail",
  "activity_sector": "CIVILIAN",
  "booking_agent_line": "KINGFISHER",
  "agent_requester_name": "Portal User",
  "consent_accepted": true,
  "parties": [
    {
      "party_kind": "SHIPPER",
      "full_name": "Al Noor Trading LLC",
      "address": "Dubai",
      "city": "Dubai",
      "country": "AE",
      "entity_kind": "COMPANY"
    },
    {
      "party_kind": "CONSIGNEE",
      "full_name": "Karachi Importers",
      "address": "Karachi",
      "city": "Karachi",
      "country": "PK",
      "entity_kind": "COMPANY"
    },
    {
      "party_kind": "NOTIFY",
      "full_name": "Karachi Importers",
      "address": "Karachi",
      "city": "Karachi",
      "country": "PK",
      "entity_kind": "COMPANY"
    }
  ]
}
```

→ stage `BOOKING_FORM_COMPLETE`. Staff may `GET/PUT /nvocc/bookings/:id/booking-form` to review/correct (Admin override required to force-complete).

### G2.3 Sales/Admin invoice

Create/send invoice via **Invoices** (Sales Manager now has `invoices.create` + `invoices.send`; Admin unchanged), then:

```http
POST /nvocc/bookings/{{NVOCC_BOOKING_ID}}/send-invoice
```

```json
{ "invoice_id": "{{INVOICE_ID}}" }
```

### G2.4 CRO + auto container numbers

```http
POST /nvocc/jobs/{{NVOCC_JOB_ID}}/container-requests
POST /nvocc/jobs/{{NVOCC_JOB_ID}}/container-requests/{{CRO_ID}}/issue
POST /nvocc/jobs/{{NVOCC_JOB_ID}}/container-requests/{{CRO_ID}}/allocate
```

Ops allocate auto-generates container numbers (tenant sequence). Customer sees:

```http
GET /portal/shipments/{{JOB_ID}}/container-requests
```

### G2.5 Portal pick → Ops loading → port token → draft BL request

```http
POST /portal/shipments/{{JOB_ID}}/containers/{{LINE_ID}}/confirm-pick
POST /nvocc/jobs/{{NVOCC_JOB_ID}}/stage/loading
POST /portal/shipments/{{JOB_ID}}/port-token/confirm
POST /portal/shipments/{{JOB_ID}}/request-draft-bl
```

### G2.6 Docs + Accounts payment gate

```http
POST /nvocc/jobs/{{NVOCC_JOB_ID}}/documents/hbl-draft-gated
POST /nvocc/jobs/{{NVOCC_JOB_ID}}/accounts/confirm-payment
POST /nvocc/jobs/{{NVOCC_JOB_ID}}/documents/hbl-original-gated
```

Original HBL **fails with 400** if `payment_confirmed_at` is null.

### G2.7 MGMT close report

```http
POST /nvocc/jobs/{{NVOCC_JOB_ID}}/close-report
```

Returns closure pack (job, HBL, payment, CRO lines, booking form).

### G2.8 Air booking form (no pallet / ULD)

```http
PUT  /jobs/{{AIR_JOB_ID}}/air-booking-form
GET  /jobs/{{AIR_JOB_ID}}/air-booking-form
```

```json
{
  "pieces": 2,
  "gross_weight_kg": 420,
  "chargeable_weight_kg": 450,
  "commodity": "Garments",
  "origin_airport_code": "DXB",
  "dest_airport_code": "KHI",
  "flight_number": "EK601",
  "parties": [
    { "party_kind": "SHIPPER", "full_name": "Shipper Co", "address": "Dubai" },
    { "party_kind": "CONSIGNEE", "full_name": "Consignee Co", "address": "Karachi" }
  ]
}
```

### G2.9 Negative check

Call `POST /nvocc/jobs/{{NVOCC_JOB_ID}}/stage/loading` as a Sales user → expect **403**.

---

## Part G3 — Air Freight department workflow smoke

**Export (`AIR_EXPORT`)** and **import (`AIR_IMPORT`)** share CS → Sales → Ops → Docs → Accounts → Management stage guards on `AirJobDetail`.

### G3.1 Commercial prefix + customer compliance form

```http
POST /jobs/{{AIR_JOB_ID}}/air/cs-triage
POST /jobs/{{AIR_JOB_ID}}/air/mark-quote-sent
POST /portal/shipments/{{AIR_JOB_ID}}/accept
PUT  /portal/shipments/{{AIR_JOB_ID}}/compliance-form
POST /portal/shipments/{{AIR_JOB_ID}}/compliance-form/submit
POST /jobs/{{AIR_JOB_ID}}/air/send-invoice
```

Compliance form body/fields identical to G2.2 (NVOCC). Ops flight form (`PUT /jobs/:id/air-booking-form`) is separate and does **not** advance `BOOKING_FORM_COMPLETE`.

### G3.2 Air export — build-up through House Air Waybill

```http
POST /jobs/{{AIR_JOB_ID}}/air/stage/build-up
POST /portal/shipments/{{AIR_JOB_ID}}/request-draft-hawb
POST /jobs/{{AIR_JOB_ID}}/documents/hawb-draft-gated
POST /jobs/{{AIR_JOB_ID}}/air/accounts/confirm-payment
POST /jobs/{{AIR_JOB_ID}}/documents/hawb-final-gated
POST /jobs/{{AIR_JOB_ID}}/air/stage/mawb-issued
POST /jobs/{{AIR_JOB_ID}}/air/close-report
```

Final House Air Waybill **400** without `payment_confirmed_at`.

### G3.3 Air import — Cargo Arrival Notice through Delivery Order

```http
POST /jobs/{{AIR_IMPORT_JOB_ID}}/air/stage/mawb-received
POST /jobs/{{AIR_IMPORT_JOB_ID}}/documents/pre-can-gated
POST /jobs/{{AIR_IMPORT_JOB_ID}}/documents/can-gated
POST /jobs/{{AIR_IMPORT_JOB_ID}}/air/accounts/confirm-payment
POST /jobs/{{AIR_IMPORT_JOB_ID}}/documents/delivery-order-gated
POST /portal/shipments/{{AIR_IMPORT_JOB_ID}}/request-delivery-order
POST /jobs/{{AIR_IMPORT_JOB_ID}}/air/stage/pod
POST /jobs/{{AIR_IMPORT_JOB_ID}}/air/close-report
```

Delivery Order **400** before payment confirm.

### G3.4 Negative check

`POST /jobs/{{AIR_JOB_ID}}/air/stage/build-up` as Sales → **403**.

---

## Part G4 — Fresa unit converter smoke

Staff JWT + `tools.use` (sync permissions on existing tenants if missing). Portal/vendor: respective JWT only.

```http
POST /tools/converter/cbm
{ "length": 100, "width": 50, "height": 40, "quantity": 2, "unit": "C" }
→ cubic_meter 0.4, volume_weight 66.667

POST /tools/converter/length
{ "meter": 1 }
→ mm 1000, mile 0.001, nautical_mile 0.001

POST /tools/converter/weight
{ "kilogram": 1 }

POST /tools/converter/liquid
{ "litre": 1 }

POST /tools/converter/volume
{ "input_unit": "MT", "value": 1, "output_unit": "CM" }
→ result 1000000, display "1,000,000.000"

POST /portal/tools/converter/cbm
POST /vendor/tools/converter/cbm
(same body as staff CBM — expect identical numbers)
```

Empty length body → **400** `Require value to calculate Length`.

---

## Part G5 — FRESA report catalog / Format-1 smoke

Staff JWT + `reports.read` / `reports.generate` / `reports.manage`.

### G5.1 Preserve default invoice PDF

```http
POST /invoices/{{INVOICE_ID}}/pdf
→ still returns default UAE-VAT style PDF (unchanged)
```

### G5.2 Format-1 catalog pack

```http
GET  /reports/templates/renderers
→ includes commercial.invoice_tax_india_1

POST /reports/templates/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA/bind-renderer
{ "renderer_key": "commercial.invoice_tax_india_1", "activate": true }

POST /reports/generate
{
  "code": "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
  "format": "PDF",
  "parameters": { "invoice_id": "{{INVOICE_ID}}" }
}
→ 201 job; poll GET /reports/jobs/{{JOB_ID}}; download PDF

GET /invoices/{{INVOICE_ID}}/format-payload?format=INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA
→ { success, data } InvoiceFormatPayload
```

### G5.3 Negative checks

```http
POST /reports/templates/SOME_UNBOUND_CODE/activate
(no body, still pending.*) → 400

POST /reports/generate with inactive template → 404
```

### G5.4 Regression list packs

```http
POST /reports/generate
{ "code": "JOBS_LIST", "format": "PDF", "parameters": { "date_from": "2026-01-01", "date_to": "2026-12-31" } }
```

---

## Hierarchy reminder (who uses which login)

```
SuperAdmin          → /auth/super-admin/*   (tenants only)
  └─ Tenant Admin   → /auth/tenant-login    (full tenant)
       └─ Staff     → /auth/login           (RBAC permission_ids / roles)
Customer portal     → /portal/auth/*        (party portal user)
Vendor portal       → /vendor/auth/*        (party vendor user)
```

Do **not** use SuperAdmin JWT for ERP modules. Do **not** expect portal tokens to call `/jobs` or `/users`.

---

*Catalogs generated from live OpenAPI + local controllers. Re-run the scripts after each backend deploy so field examples stay current.*
