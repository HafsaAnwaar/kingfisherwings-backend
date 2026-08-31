# Kingfisher Logistics ERP — Complete API Flow & Testing Guide

> **Base URL:** `http://localhost:3000`  
> **Swagger:** `http://localhost:3000/docs`  
> **Auth:** `Authorization: Bearer <access_token>` on every non-`@Public` route  
> **Password policy:** min 8 chars, 1 upper, 1 lower, 1 digit, 1 special (`Welcome@123`)

This document explains **how the system works**, **why each API exists**, and gives **dummy payloads** in a **step-by-step test order**.

---

## 1. How the platform works (big picture)

```
Super Admin creates Tenant
        ↓
Tenant Admin logs in (or staff user)
        ↓
Configure org + number formats + masters
        ↓
Create Parties (customers, shippers, airlines…)
        ↓
Create Quotation → approve → send → win → convert to Job
   OR create Job directly
        ↓
Job ops: milestones, charges, AWB stock, documents, pre-alert
        ↓
Invoice from job charges → post → email PDF
        ↓
Credit notes / purchase invoices / payment requests
```

### Three login types

| Principal | Endpoint | Purpose |
|-----------|----------|---------|
| **Super Admin** | `POST /auth/super-admin/login` | Platform owner — create/manage tenants only |
| **Tenant Admin** | `POST /auth/tenant-login` | Tenant owner password (auto TENANT_ADMIN user) |
| **Staff User** | `POST /auth/login` | Day-to-day ops with RBAC permissions |

### Request pipeline

1. `ValidationPipe` — whitelist + transform DTOs  
2. `JwtAuthGuard` — JWT unless `@Public()`  
3. `TenantContextInterceptor` — store `tenantId`  
4. Optional `RolesGuard` / `PermissionsGuard`  
5. Service → `prisma.runWithTenant(tenantId, …)` (PostgreSQL RLS)

### Variables to keep while testing

| Variable | Source |
|----------|--------|
| `{{SA_TOKEN}}` | Super-admin login |
| `{{TOKEN}}` | Tenant/staff login |
| `{{TENANT_ID}}` | Create tenant / login |
| `{{COMPANY_ID}}` | Tenant create / GET companies |
| `{{CUSTOMER_ID}}` | Create party CUSTOMER |
| `{{SHIPPER_ID}}` | Create party (or same as customer) |
| `{{AIRLINE_ID}}` | Create airline master |
| `{{CHARGE_CODE_ID}}` | Create charge code |
| `{{QUOTATION_ID}}` | Create quotation |
| `{{JOB_ID}}` | Create job / convert-to-job |
| `{{BATCH_ID}}` | AWB stock batch |
| `{{INVOICE_ID}}` | Create invoice |

---

## 2. Prerequisites before testing

1. PostgreSQL running + `.env` `DATABASE_URL` set  
2. Migrations applied: `npx prisma migrate deploy`  
3. Redis running (for PDF queue): `REDIS_HOST=localhost`, `REDIS_PORT=6379`  
4. Optional SMTP for real email (otherwise emails are logged only)  
5. App: `npm run start:dev`  
6. Use Postman / Insomnia / Swagger — set header:

```http
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

---

# PART A — End-to-end happy path (do this first)

Follow these steps **in order**. Each step depends on IDs from earlier steps.

---

### Step 0 — Health check

**Why:** Confirm API + DB are up.  
**Note:** Active health controller requires JWT in some setups; if 401, skip until after login or use Swagger.

```http
GET /health
```

---

### Step 1 — Register Super Admin (once)

**Why:** Only Super Admin can create tenants.

```http
POST /auth/super-admin/signup
```

```json
{
  "email": "superadmin@kingfisher.com",
  "password": "Welcome@123",
  "first_name": "Platform",
  "last_name": "Owner"
}
```

Then login:

```http
POST /auth/super-admin/login
```

```json
{
  "email": "superadmin@kingfisher.com",
  "password": "Welcome@123"
}
```

Save `access_token` → `{{SA_TOKEN}}`.

---

### Step 2 — Create a Tenant

**Why:** Every business entity (users, jobs, invoices) is tenant-scoped. Creating a tenant also seeds roles, permissions, default company, and a TENANT_ADMIN owner.

```http
POST /tenants
Authorization: Bearer {{SA_TOKEN}}
```

```json
{
  "code": "KFW",
  "name": "Kingfisher Wings LLC",
  "slug": "kingfisher",
  "password": "Welcome@123",
  "email": "admin@kingfisherwings.com",
  "admin_first_name": "Ahmed",
  "admin_last_name": "Khan",
  "base_currency": "AED",
  "country_code": "AE",
  "timezone": "Asia/Dubai",
  "company_code": "KFW",
  "company_name": "Kingfisher Wings LLC",
  "subscription_plan": "TRIAL",
  "status": "ACTIVE"
}
```

Save `id` → `{{TENANT_ID}}`.

---

### Step 3 — Tenant Admin login

**Why:** Get a tenant-scoped JWT with full TENANT_ADMIN permissions.

```http
POST /auth/tenant-login
```

```json
{
  "tenant_slug": "kingfisher",
  "password": "Welcome@123"
}
```

Save `access_token` → `{{TOKEN}}`.  
Use this token for **all remaining steps**.

Optional:

```http
GET /auth/me
Authorization: Bearer {{TOKEN}}
```

---

### Step 4 — Configure document number formats

**Why:** Quotation / Job / Invoice numbers are generated from these formats. Without them, create APIs throw “No active number format”.

```http
POST /organization/number-formats
Authorization: Bearer {{TOKEN}}
```

Create **four** formats (repeat with different `document_type`):

```json
{
  "document_type": "QUOTATION",
  "prefix": "KFW",
  "include_year": true,
  "include_month": true,
  "year_digits": 2,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "YEARLY",
  "is_active": true
}
```

Also create for: `JOB_NUMBER`, `INVOICE`, `CREDIT_NOTE`, `PURCHASE_INVOICE`, `VOUCHER`.

Preview:

```http
GET /organization/number-formats/QUOTATION/preview
```

---

### Step 5 — List company (auto-created)

```http
GET /companies
```

Save default company `id` → `{{COMPANY_ID}}`.

---

### Step 6 — Masters (reference data)

**Why:** Jobs/quotations need ports, airlines, charge codes, currencies, tax rates.

#### 6a. Currency

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

#### 6b. Country

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

#### 6c. Ports

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

Save IDs → `{{ORIGIN_PORT_ID}}`, `{{DEST_PORT_ID}}`.

#### 6d. Airline

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

Save → `{{AIRLINE_ID}}`.

#### 6e. Charge code

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

Save → `{{CHARGE_CODE_ID}}`.

#### 6f. Tax rate (UAE VAT 5%)

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

Save → `{{TAX_RATE_ID}}`.

#### 6g. Branch (optional)

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

Save → `{{BRANCH_ID}}`.

---

### Step 7 — Parties

**Why:** Customers, shippers, consignees are Parties. Quotations need a customer; jobs need a shipper.

#### Customer

```http
POST /parties
```

```json
{
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "short_name": "Al Noor",
  "email": "ops@alnoor.ae",
  "phone": "+971501234567",
  "country_code": "AE",
  "city": "Dubai",
  "currency_code": "AED",
  "credit_limit": 100000,
  "credit_days": 30,
  "company_id": "{{COMPANY_ID}}",
  "is_active": true
}
```

Save → `{{CUSTOMER_ID}}` (also use as `{{SHIPPER_ID}}` for simplicity).

#### Consignee (optional)

```http
POST /parties
```

```json
{
  "party_type": "CUSTOMER",
  "code": "CONS-001",
  "name": "UK Importers Ltd",
  "email": "receiving@ukimporters.co.uk",
  "country_code": "GB",
  "city": "London",
  "is_active": true
}
```

Save → `{{CONSIGNEE_ID}}`.

Add contact:

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

### Step 8 — Quotation lifecycle

**Why:** Sales quotes cargo, calculates GP, gets approval, sends to customer, then converts to a job when won.

#### 8a. Create DRAFT

```http
POST /quotations
```

```json
{
  "job_type": "AIR_EXPORT",
  "customer_id": "{{CUSTOMER_ID}}",
  "company_id": "{{COMPANY_ID}}",
  "branch_id": "{{BRANCH_ID}}",
  "origin_port_id": "{{ORIGIN_PORT_ID}}",
  "dest_port_id": "{{DEST_PORT_ID}}",
  "incoterm": "FOB",
  "commodity": "Electronics",
  "gross_weight": 250,
  "chargeable_weight": 300,
  "pieces": 10,
  "currency_code": "AED",
  "exchange_rate": 1,
  "valid_until": "2026-12-31",
  "remarks": "Urgent shipment"
}
```

Save → `{{QUOTATION_ID}}`.

#### 8b. Add revenue line

```http
POST /quotations/{{QUOTATION_ID}}/lines
```

```json
{
  "charge_code_id": "{{CHARGE_CODE_ID}}",
  "description": "Air Freight DXB-LHR",
  "quantity": 300,
  "unit_price": 12.5,
  "currency_code": "AED",
  "is_cost": false
}
```

#### 8c. Add cost line (for GP)

```http
POST /quotations/{{QUOTATION_ID}}/lines
```

```json
{
  "charge_code_id": "{{CHARGE_CODE_ID}}",
  "description": "Airline buy rate",
  "quantity": 300,
  "unit_price": 9.0,
  "currency_code": "AED",
  "is_cost": true
}
```

GP recalculates automatically on the quotation.

#### 8d. Workflow

```http
POST /quotations/{{QUOTATION_ID}}/submit
```

```http
POST /quotations/{{QUOTATION_ID}}/approve
```

```json
{
  "comments": "GP acceptable"
}
```

```http
POST /quotations/{{QUOTATION_ID}}/send
```

```http
POST /quotations/{{QUOTATION_ID}}/mark-won
```

#### 8e. PDF + email (needs Redis for async queue)

```http
POST /quotations/{{QUOTATION_ID}}/pdf
```

```json
{
  "mode": "CUSTOMER"
}
```

```http
GET /quotations/{{QUOTATION_ID}}/pdf/status
```

```http
POST /quotations/{{QUOTATION_ID}}/send-email
```

```json
{
  "to_email": "ops@alnoor.ae",
  "pdf_mode": "CUSTOMER",
  "message": "Please find your quotation attached."
}
```

#### 8f. Convert to Job

```http
POST /quotations/{{QUOTATION_ID}}/convert-to-job
```

Save returned job `id` → `{{JOB_ID}}`.

---

### Step 9 — Job operations (Air Export)

**Why:** Operations manage booking, milestones, charges, AWB, documents, pre-alert.

#### 9a. Or create job directly (if you skipped convert)

```http
POST /jobs
```

```json
{
  "job_type": "AIR_EXPORT",
  "shipper_id": "{{SHIPPER_ID}}",
  "consignee_id": "{{CONSIGNEE_ID}}",
  "company_id": "{{COMPANY_ID}}",
  "branch_id": "{{BRANCH_ID}}",
  "origin_port_id": "{{ORIGIN_PORT_ID}}",
  "dest_port_id": "{{DEST_PORT_ID}}",
  "commodity": "Electronics",
  "gross_weight": 250,
  "chargeable_weight": 300,
  "pieces": 10
}
```

#### 9b. Update air details

```http
PATCH /jobs/{{JOB_ID}}/air-details
```

```json
{
  "airline_id": "{{AIRLINE_ID}}",
  "flight_number": "EK001",
  "flight_date": "2026-08-15",
  "awb_type": "Direct",
  "freight_type": "Prepaid"
}
```

#### 9c. AWB stock — register range + allocate

```http
POST /awb-stock/batches
```

```json
{
  "airline_id": "{{AIRLINE_ID}}",
  "branch_id": "{{BRANCH_ID}}",
  "prefix": "176",
  "range_from": 12345670,
  "range_to": 12345699,
  "low_stock_threshold": 5,
  "notes": "EK stock Jul 2026"
}
```

Save → `{{BATCH_ID}}`.

```http
POST /awb-stock/batches/{{BATCH_ID}}/allocate
```

```json
{
  "job_id": "{{JOB_ID}}"
}
```

Returns AWB number like `176-12345670` and stamps it on air details.

#### 9d. Add billable charge (for invoicing later)

```http
POST /jobs/{{JOB_ID}}/charges
```

```json
{
  "charge_code_id": "{{CHARGE_CODE_ID}}",
  "description": "Air Freight",
  "quantity": 300,
  "unit_price": 12.5,
  "currency_code": "AED",
  "is_cost": false,
  "is_billable": true
}
```

#### 9e. Milestones

```http
GET /jobs/{{JOB_ID}}/milestones
```

Pick a milestone id, mark complete:

```http
PATCH /jobs/{{JOB_ID}}/milestones/{{MILESTONE_ID}}
```

```json
{
  "actual_date": "2026-07-10",
  "notes": "Booking confirmed with airline"
}
```

#### 9f. Documents (async PDF — Redis required)

```http
POST /jobs/{{JOB_ID}}/documents/hawb
```

```json
{
  "is_original": false,
  "layout_variant": "standard"
}
```

```http
GET /jobs/{{JOB_ID}}/documents/generation-status
```

#### 9g. Pre-alert email

```http
POST /jobs/{{JOB_ID}}/pre-alert/send
```

```json
{
  "to_email": "receiving@ukimporters.co.uk",
  "message": "Shipment departing on EK001. HAWB attached details in body."
}
```

#### 9h. P&L

```http
GET /jobs/{{JOB_ID}}/pnl
```

---

### Step 10 — Invoicing

**Why:** Bill the customer for job charges (UAE VAT aware). Finance posts and emails the tax invoice.

#### 10a. Create invoice from job (preferred)

```http
POST /invoices/from-job/{{JOB_ID}}
```

Save → `{{INVOICE_ID}}`.

#### 10b. Or create manually

```http
POST /invoices
```

```json
{
  "party_id": "{{CUSTOMER_ID}}",
  "job_id": "{{JOB_ID}}",
  "company_id": "{{COMPANY_ID}}",
  "currency_code": "AED",
  "vat_rate": 5,
  "invoice_date": "2026-07-10",
  "due_date": "2026-08-09",
  "lpo_number": "LPO-7788",
  "remarks": "Freight charges for AE job",
  "lines": [
    {
      "description": "Air Freight DXB-LHR",
      "quantity": 300,
      "unit_price": 12.5,
      "charge_code_id": "{{CHARGE_CODE_ID}}",
      "is_taxable": true,
      "sort_order": 1
    }
  ]
}
```

#### 10c. Post → PDF → send

```http
POST /invoices/{{INVOICE_ID}}/post
```

```http
POST /invoices/{{INVOICE_ID}}/pdf
```

```http
POST /invoices/{{INVOICE_ID}}/send
```

```json
{
  "to_email": "accounts@alnoor.ae",
  "message": "Please find tax invoice attached."
}
```

#### 10d. Credit note (if adjustment needed)

```http
POST /credit-notes
```

```json
{
  "credited_invoice_id": "{{INVOICE_ID}}",
  "remarks": "Rate correction",
  "lines": [
    {
      "description": "Freight rate adjustment",
      "quantity": 1,
      "unit_price": 100,
      "is_taxable": true
    }
  ]
}
```

```http
POST /credit-notes/{{CREDIT_NOTE_ID}}/post
```

#### 10e. Payment request

```http
POST /payment-requests
```

```json
{
  "party_id": "{{CUSTOMER_ID}}",
  "invoice_id": "{{INVOICE_ID}}",
  "job_id": "{{JOB_ID}}",
  "amount": 3937.5,
  "currency_code": "AED",
  "due_date": "2026-08-09",
  "remarks": "Collection for INV"
}
```

```http
POST /payment-requests/{{PR_ID}}/approve
```

```http
POST /payment-requests/{{PR_ID}}/mark-paid
```

---

### Step 11 — Global search

```http
GET /search?q=Al%20Noor&types=jobs,quotations,parties&limit=20
```

---

### Step 12 — Logout

```http
POST /auth/logout
```

```http
POST /auth/refresh
```

```json
{
  "refresh_token": "{{REFRESH_TOKEN}}"
}
```

---

# PART B — Module-by-module: why each API exists

## B1. Auth (`/auth`)

| API | Why it exists | What it does |
|-----|---------------|--------------|
| `POST /auth/super-admin/signup` | Bootstrap platform owner | Creates SuperAdmin row |
| `POST /auth/super-admin/login` | Platform access | JWT without tenantId |
| `POST /auth/tenant-login` | Tenant owner entry | Verifies tenant password, returns TENANT_ADMIN JWT |
| `POST /auth/login` | Staff daily login | Email+password inside a tenant |
| `POST /auth/refresh` | Keep sessions alive | New access+refresh pair |
| `POST /auth/logout` | Security | Revokes current session |
| `GET /auth/sessions` | Device management | Lists active sessions |
| `POST /auth/sessions/:id/revoke` | Kill one device | Revokes that session |
| `POST /auth/logout-all` | Lost laptop / breach | Revokes all sessions |
| `GET /auth/me` | UI bootstrap | Current user + permissions |
| `POST /auth/change-password` | User password change | Updates user hash + history |
| `POST /auth/tenant/change-password` | Change tenant login pwd | Updates Tenant.password_hash |

**Dummy — staff login (after creating a user):**

```json
{
  "tenant_slug": "kingfisher",
  "email": "ops@kingfisherwings.com",
  "password": "Welcome@123"
}
```

---

## B2. Tenants (`/tenants`) — Super Admin only

| API | Why | What |
|-----|-----|------|
| `POST /tenants` | Onboard customer company | Creates tenant + company + roles + permissions + admin |
| `GET /tenants` | Admin console list | Paginated tenants |
| `GET /tenants/statistics` | Dashboard counts | Active/trial/suspended stats |
| `GET /tenants/:id` | Detail view | One tenant |
| `PATCH /tenants/:id` | Edit profile/limits | Updates fields |
| `DELETE /tenants/:id` | Offboard | Soft-delete |
| `PATCH /tenants/:id/restore` | Undo delete | Clears deleted_at |
| `PATCH /tenants/:id/activate` | Resume service | status ACTIVE |
| `PATCH /tenants/:id/deactivate` | Suspend | status SUSPENDED |
| `POST /tenants/sync-permissions` | After code deploys new perms | Seeds missing Permission rows for all tenants |
| `POST /tenants/:id/sync-permissions` | Same for one tenant | |

---

## B3. Users (`/users`)

| API | Why | What |
|-----|-----|------|
| `GET /users` | Staff directory | Paginated list |
| `POST /users` | Hire / invite staff | Creates user + temp password |
| `GET /users/:id` | Profile | One user |
| `PATCH /users/:id` | Edit profile/role flags | Updates |
| `PATCH /users/:id/status` | Suspend/activate | Status change |
| `POST /users/bulk` | Mass actions | Bulk status |
| `DELETE /users/:id` | Offboard | Soft-delete |
| `POST /users/:id/restore` | Rehire | Restore |
| `POST /users/me/change-password` | Self-service | Own password |
| `POST /users/:id/admin-reset-password` | Helpdesk | New temp password |
| `POST /users/:id/force-logout` | Security | Kill all sessions |

**Dummy create user:**

```json
{
  "email": "ops@kingfisherwings.com",
  "first_name": "Fatima",
  "last_name": "Ali",
  "role": "OPERATIONS_MANAGER",
  "branch_id": "{{BRANCH_ID}}",
  "company_id": "{{COMPANY_ID}}"
}
```

---

## B4. Companies (`/companies`) — TENANT_ADMIN

Multi-entity groups (holding + subsidiaries). Most tenants have one default company.

| API | Why | What |
|-----|-----|------|
| CRUD `/companies` | Multi-company books | Create/list/update/soft-delete |

```json
{
  "code": "KFW-JED",
  "name": "Kingfisher Jeddah Branch Co",
  "vat_number": "300000000000003",
  "country_code": "SA",
  "is_active": true
}
```

---

## B5. Organization

| API | Why | What |
|-----|-----|------|
| `GET/PATCH /organization/profile` | Tenant self-service profile | Name, VAT, IATA agent code, etc. |
| Number formats CRUD | Document numbering rules | Prefix/year/seq for JOB, QUOTE, INV… |
| Bank accounts CRUD | Show on invoices / finance | Tenant bank details |

**Bank account dummy:**

```json
{
  "bank_name": "Emirates NBD",
  "account_name": "Kingfisher Wings LLC",
  "account_number": "1012003456789",
  "iban": "AE070331234567890123456",
  "swift_code": "EBILAEAD",
  "currency_code": "AED",
  "is_default": true
}
```

---

## B6. Masters (`/masters/*`)

**Why:** Shared reference data used by ops and finance. Pattern is always:

| Method | Path | Permission |
|--------|------|------------|
| GET | `/masters/{entity}` | `masters.view` |
| GET | `/masters/{entity}/:id` | `masters.view` |
| POST | `/masters/{entity}` | `masters.create` |
| PATCH | `/masters/{entity}/:id` | `masters.update` |
| DELETE | `/masters/{entity}/:id` | `masters.delete` |

**Entities:** airports, airlines, banks, branches, charge-codes, container-types, countries, currencies, departments, designations, holidays, hs-codes, ports, shipping-lines, tax-rates, truckers, units-of-measure, vessels, warehouses.

**Exchange rates (special):**

```http
POST /masters/exchange-rates
```

```json
{
  "currency_id": "{{USD_CURRENCY_ID}}",
  "rate_date": "2026-07-10",
  "rate": 3.6725
}
```

```http
GET /masters/exchange-rates/latest/{{USD_CURRENCY_ID}}
```

---

## B7. Parties (`/parties`)

| API | Why | What |
|-----|-----|------|
| CRUD parties | CRM master for customers/agents/suppliers | Soft-delete aware |
| `POST /parties/import` | Bulk onboard | CSV upload |
| `PATCH .../credit-status` | Credit control | ACTIVE / ON_HOLD / BLACKLISTED |
| Contacts / addresses nested CRUD | Multiple contacts per party | |

**Credit hold:**

```http
PATCH /parties/{{CUSTOMER_ID}}/credit-status
```

```json
{
  "credit_status": "ON_HOLD",
  "notes": "Overdue AR > 60 days"
}
```

---

## B8. Quotations (`/quotations`)

### Core lifecycle (status machine)

```
DRAFT → SUBMITTED → APPROVED → SENT → WON → CONVERTED
                 ↘ REJECTED ↗        ↘ LOST
                                      ↘ EXPIRED
```

| API | Why | What |
|-----|-----|------|
| `POST /quotations` | Start sales quote | Creates DRAFT + number |
| Lines CRUD | Build sell/buy charges | Recalculates GP |
| `apply-tariff` | Auto-rate from tariff master | Adds matching line |
| `submit/approve/reject/send` | Approval workflow | Status transitions |
| `mark-won/mark-lost` | Close sales cycle | Won/Lost + reason |
| `convert-to-job` | Hand off to ops | Creates Job + copies charges |
| `duplicate` | New revision | version+1 DRAFT |
| `archive/expire/expire-due` | Housekeeping | Soft-delete / EXPIRED |
| Analytics reports | Sales KPIs | Conversion, lost reasons, response time |
| `online-quote` (public) | Website widget | Auto-calc from tariff |
| PDF + send-email | Customer delivery | Puppeteer + SMTP/EmailLog |

**Online quote (no auth):**

```http
POST /quotations/online-quote
```

```json
{
  "tenant_slug": "kingfisher",
  "job_type": "AIR_EXPORT",
  "currency_code": "AED",
  "contact_name": "Walk-in Customer",
  "contact_email": "walkin@example.com",
  "gross_weight": 100,
  "chargeable_weight": 120,
  "pieces": 4,
  "origin_port_id": "{{ORIGIN_PORT_ID}}",
  "dest_port_id": "{{DEST_PORT_ID}}"
}
```

**Tariffs / zip-distances:** rate cards and land distance tables under `/quotations/tariffs` and `/quotations/zip-distances` (standard CRUD).

---

## B9. Jobs (`/jobs`)

| API | Why | What |
|-----|-----|------|
| `POST /jobs` | Booking / shipment file | Creates job + air milestones for AIR_EXPORT |
| `parent_job_id` | House under master consol | Hierarchy |
| Air / Sea FCL details | Mode-specific fields | HAWB/MAWB, BL, cutoffs |
| Charges + prorate | Job P&L | Live GP; master→house cost split |
| Milestones | Ops checklist | 15 air export checkpoints |
| Notes / documents | Collaboration + file registry | Metadata + finalize ORIGINAL |
| Async doc gen | HAWB/MAWB/manifest PDFs | BullMQ + Puppeteer |
| Pre-alert send | Notify consignee | Email + milestone |
| Containers | Sea FCL | Container list |
| close / cancel / delete | Lifecycle | COMPLETED / CANCELLED / soft-delete |
| `GET .../pnl` | Finance visibility | Revenue vs cost |

**Sea FCL container dummy:**

```http
POST /jobs/{{SEA_JOB_ID}}/containers
```

```json
{
  "container_number": "MSCU1234567",
  "container_type_id": "{{CONTAINER_TYPE_ID}}",
  "seal_number": "SL998877",
  "gross_weight": 18000,
  "packages": 200
}
```

---

## B10. AWB Stock (`/awb-stock`)

| API | Why | What |
|-----|-----|------|
| Batches CRUD | Airline AWB number inventory | Range from–to |
| `allocate` | Issue next AWB to job | Creates allocation + updates air details |
| `void` | Spoiled/wrong AWB | Status VOIDED |
| `mark-used` | Flown/printed | Status USED |
| `transfer-branch` | Stock ownership | Moves branch_id |
| Low-stock report | Ops alert | Remaining ≤ threshold |

---

## B11. Search (`/search`)

| API | Why | What |
|-----|-----|------|
| `GET /search?q=` | Global navbar search | Jobs + quotations + parties |

```http
GET /search?q=KFW&types=jobs&limit=10
```

---

## B12. Files (`/files`)

| API | Why | What |
|-----|-----|------|
| `GET /files/:tenantId/:filename` | Serve generated PDFs | Local disk download; tenant must match JWT |

---

## B13. Invoices (Ch.18)

### Customer invoices `/invoices`

| API | Why | What |
|-----|-----|------|
| List / get / CRUD draft | AR billing | Lines + VAT totals |
| `from-job/:jobId` | One-click bill | Pulls uninvoiced billable charges |
| `post` | Lock for accounting | DRAFT→POSTED |
| `pdf` / `send` | Tax invoice delivery | PDF + email |
| `cancel` | Void process | CANCELLED |
| `reports/overdue` | Collections | Past due with balance |

### Credit notes `/credit-notes`

Linked to original invoice via `credited_invoice_id`.

### Purchase invoices `/purchase-invoices`

Vendor bills (AP side) — same draft→post pattern.

### Payment requests `/payment-requests`

| API | Why | What |
|-----|-----|------|
| Create/approve/reject/mark-paid | Collection / payment workflow | Status machine PENDING→APPROVED→PAID |

**Reject dummy:**

```json
{
  "rejected_reason": "Amount does not match invoice balance"
}
```

---

## B14. Scheduler (no HTTP)

Daily **01:00** cron calls `quotations.expireDue()` for every ACTIVE/TRIAL tenant.  
Manual equivalent: `POST /quotations/expire-due`.

---

# PART C — Recommended Postman collection order

1. Super-admin signup → login  
2. Create tenant  
3. Tenant-login → save TOKEN  
4. Number formats (QUOTATION, JOB_NUMBER, INVOICE, CREDIT_NOTE, PURCHASE_INVOICE, VOUCHER)  
5. Masters: currency, country, ports, airline, charge-code, tax-rate, branch  
6. Party customer (+ contact)  
7. Quotation → lines → submit → approve → send → mark-won → convert-to-job  
8. Air details → AWB batch → allocate  
9. Job charge → HAWB PDF → pre-alert  
10. Invoice from-job → post → pdf → send  
11. Payment request → approve → mark-paid  
12. Search `q=Al Noor`  
13. Logout  

---

# PART D — Common errors & fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Missing/expired token | Login / refresh |
| `403 Missing permission` | Role lacks permission | Use TENANT_ADMIN or sync permissions |
| `No active number format` | Formats not configured | Step 4 |
| Queue / Redis connection error | Redis down | Start Redis |
| Email “logged only” | SMTP not set | Configure SMTP_* or ignore for tests |
| `P2002` unique conflict | Duplicate code/number | Change code |
| Validation 400 | Wrong enum / missing field | Check Swagger schemas |

**Sync permissions after deploying new modules:**

```http
POST /tenants/{{TENANT_ID}}/sync-permissions
Authorization: Bearer {{SA_TOKEN}}
```

---

# PART E — Status cheat sheets

**Quotation:** `DRAFT → SUBMITTED → APPROVED → SENT → WON → CONVERTED`  
**Invoice:** `DRAFT → POSTED → SENT → PARTIALLY_PAID → PAID` (or `CANCELLED`)  
**Payment request:** `PENDING → APPROVED → PAID` (or `REJECTED` / `CANCELLED`)  
**AWB allocation:** `ALLOCATED → USED` or `VOIDED`  
**Job:** `ENQUIRY → … → COMPLETED` / `CANCELLED`

---

# PART F — Documentation & Public API (Weeks 21–28)

## Documentation smoke

```bash
BASE_URL=http://localhost:3000 node scripts/week21-documentation-api-test.cjs
BASE_URL=http://localhost:3000 node scripts/week22-documentation-api-test.cjs
```

Key routes: `/documentation/boe/*`, `/documentation/edi/*`, `/documentation/uploads/*`, `/documentation/delivery-orders/*`.

## Public API (tenant API key)

```http
POST /admin/api-keys
Authorization: Bearer {{TENANT_ADMIN_TOKEN}}
{ "name": "integration", "scopes": ["jobs.read", "track.read"] }

GET /api/v1/jobs
X-API-Key: kf_...

GET /api/v1/health
X-API-Key: kf_...
```

Scopes enforced: `jobs.read` required for job list/detail; `track.read` for `/api/v1/track/:token`.

## Live suite (production)

```bash
CRON_SECRET=your_secret BASE_URL=https://kingfisherwings.onrender.com node scripts/live-api-test-suite.cjs
```

Pass `CRON_SECRET` as header `X-Throttle-Bypass` to avoid 429 during bulk runs.

## Financial accuracy audit

```bash
BASE_URL=http://localhost:3000 node scripts/financial-accuracy-audit.cjs
```

Compares job revenue charge totals vs invoice line totals (tolerance 0.01).

---

*Generated for FreightSaas (Kingfisher Wings ERP). For interactive schemas, use Swagger at `/docs`.*
