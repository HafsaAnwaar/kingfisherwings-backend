# Swagger complete testing guide (Admin · Staff · Customer · Vendor)

**Live Swagger:** https://kingfisherwings-backend.onrender.com/docs  
**OpenAPI JSON:** https://kingfisherwings-backend.onrender.com/docs-json  
**Password for all dummy users:** `Welcome@123`  
**Today’s date context:** 2026-09-14

This guide is a **runbook in order**. You create IDs once, paste them into later calls, and use **Authorize** in Swagger with `Bearer <token>`.

---

## Companion files (every field of every API)

| File | What it is |
|------|------------|
| [`docs/generated/swagger-live-catalog.md`](generated/swagger-live-catalog.md) | **441** live OpenAPI operations with **every query/path param + full JSON body** derived from schemas |
| [`docs/generated/swagger-live-catalog.json`](generated/swagger-live-catalog.json) | Same data (machine-readable) |
| [`docs/generated/api-permission-map.md`](generated/api-permission-map.md) | Source-of-truth **method → path → required permission codes** (~997 routes, includes Portal/Vendor/Reports not always on live Swagger) |
| [`docs/api-complete-testing-guide.md`](api-complete-testing-guide.md) | Longer ERP happy-path narrative (quotations → jobs → invoices → GL) |

Regenerate catalogs after deploy:

```bash
curl -o openapi-live.json https://kingfisherwings-backend.onrender.com/docs-json
node scripts/generate-swagger-catalog.cjs
node scripts/generate-api-permission-map.cjs
```

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

### A8. Company + number formats

```http
GET /companies
```

Save first company `id` → `{{COMPANY_ID}}`.

Create number formats (repeat body, change `document_type`):

```http
POST /organization/number-formats
```

```json
{
  "document_type": "QUOTATION",
  "prefix": "KFWD",
  "include_year": true,
  "include_month": true,
  "year_digits": 2,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "YEARLY",
  "is_active": true
}
```

Also create: `JOB_NUMBER`, `INVOICE`, `CREDIT_NOTE`, `PURCHASE_INVOICE`, `VOUCHER`.

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

Repeat for other masters (`airports`, `banks`, `shipping-lines`, `vessels`, `warehouses`, …) using catalog bodies — replace `"string"` with real codes unique per tenant.

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

## Part D — ERP core sequence (Admin / staff)

Use `{{ADMIN_TOKEN}}` first. For permission tests, switch to Part B users.

Detailed charge lines, milestones, AWB stock, credit notes, GL vouchers: see **`api-complete-testing-guide.md`** + full bodies in **`swagger-live-catalog.md`** (tags Quotations, Jobs, Invoices, GL — *).

### D1. Create quotation (body skeleton — expand from catalog)

```http
POST /quotations
```

```json
{
  "company_id": "{{COMPANY_ID}}",
  "job_type": "AIR_EXPORT",
  "customer_id": "{{CUSTOMER_ID}}",
  "branch_id": "{{BRANCH_ID}}",
  "origin_port_id": "{{ORIGIN_PORT_ID}}",
  "dest_port_id": "{{DEST_PORT_ID}}",
  "incoterm": "FOB",
  "currency_code": "AED"
}
```

Then typical lifecycle (exact paths in catalog):

1. Add charges / packages  
2. Submit → Approve → Send  
3. Win / convert-to-job → `{{JOB_ID}}`

### D2. Create job (or convert)

```http
POST /jobs
```

Fill **all** fields from catalog `POST /jobs` — replace every UUID with real IDs from Part C. Jobs has **100+** nested routes (milestones, documents, charges, pre-alert, …): walk tag **Jobs** in the catalog top-to-bottom after you have `{{JOB_ID}}`.

### D3. Invoice

```http
POST /invoices
```

```json
{
  "party_id": "{{CUSTOMER_ID}}",
  "company_id": "{{COMPANY_ID}}",
  "job_id": "{{JOB_ID}}",
  "branch_id": "{{BRANCH_ID}}",
  "currency_code": "AED"
}
```

Then post / send / PDF endpoints under tag **Invoices**.

### D4. GL (finance user)

With `gl.*` permissions: Chart of Accounts → Vouchers → Payments → Aging → Bank reconciliation.  
Use catalog sections `GL — *` for full bodies.

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

## Part G — Sweep every remaining live API

After Parts A–F work:

1. Open [`swagger-live-catalog.md`](generated/swagger-live-catalog.md).
2. Go tag by tag (Auth → … → Users). There are **52 tags / 441 ops**.
3. For each operation:
   - Paste **Params** + **Body** from the catalog.
   - Replace UUIDs/`string` placeholders with your variables.
   - Use the correct token (SA / Admin / Staff / Portal / Vendor).
4. Skip destructive deletes on shared demo data until the end.

### Suggested tag order (live)

1. Auth  
2. Tenants (Super Admin)  
3. Users  
4. Organization Profile / Number Formats / Bank Accounts  
5. Companies  
6. Masters — * (all)  
7. Parties  
8. Quotations (+ Online Tariff / Zip Distance)  
9. Jobs (large — do after one job exists)  
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
