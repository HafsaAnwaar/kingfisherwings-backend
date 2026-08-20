# KingFisher Wings / Fresa Gold — Decision Log

> **Living document.** Record *why* we chose a library, pattern, or product rule — not just *what* shipped.  
> Update this file whenever a decision is locked, reversed, or deferred. Do **not** duplicate API catalogs here; see [flow.md](./flow.md) for execution paths.  
> **Current implementation horizon:** Weeks 0–14 complete (backend). Weeks 15–28 are planned.

**Product:** KingFisher Wings ERP (package `fresa-gold-backend`)  
**Spec sources:** Fresa Gold Complete Feature Specification · 28-Week Plan · Ch.1–28  
**Stack today:** NestJS 10 · TypeScript 5 · PostgreSQL (Neon) · Prisma 7 · Passport JWT · class-validator · Swagger

---

## How to use this file

| Section | Contains |
|---------|----------|
| [Locked product rules](#locked-product-rules) | Hierarchy and identity rules that later weeks must not break |
| [Platform & library decisions](#1-platform--library-decisions) | Why each major dependency exists |
| [Cross-cutting architecture](#2-cross-cutting-architecture) | Tenancy, auth, RBAC, API shape, PDF, email |
| [Weeks 0–14 (decided & shipped)](#3-weeks-014--decided--shipped) | Week-by-week product/tech choices |
| [Weeks 15–28 (future)](#4-weeks-1528--future-decisions) | Locked vs still-open decisions |

**Status tags**

| Tag | Meaning |
|-----|---------|
| **LOCKED** | Must not be reversed without an explicit product decision |
| **SHIPPED** | Implemented in this repo |
| **DEFERRED** | Intentionally later (week noted) |
| **OPEN** | Not decided yet; decide in the listed week |
| **REVERSED** | We changed our mind (record both old and new) |

---

## Locked product rules

These apply to every week. New modules inherit them.

### Hierarchy (never conflate)

```
SuperAdmin
  → Company
    → Tenant
      → Tenant Admin
        → Users (Employees)
           ├── Sales User
           ├── Customer Service User
           ├── Operations User
           ├── Finance User
           ├── Branch Manager
           └── Other Staff
```

| Actor | Where they log in | What they manage |
|-------|-------------------|------------------|
| SuperAdmin | Platform console (`/auth/super-admin/*`, `/tenants`) | Companies and tenants |
| Tenant Admin | ERP tenant login (`/auth/tenant-login` or staff login with `TENANT_ADMIN`) | Users **in their tenant only** |
| Staff | Staff/User login (`/auth/login`) | Ops modules; **not** the Users admin panel unless they are Tenant Admin |
| Customer portal user | `/portal/auth/*` | Own party’s shipments, AR, quotes, CCP |
| Vendor portal user | `/vendor/auth/*` | Own party’s AP, remittance, disputes |

**LOCKED:** SuperAdmin ≠ Tenant Admin ≠ staff ≠ portal user ≠ vendor user.

### JWT principals (three, mutually rejected)

| Principal | Tables | Guard | Staff APIs |
|-----------|--------|-------|------------|
| `user` | `User` + `Session` | Global `JwtAuthGuard` | Allowed |
| `super_admin` | `SuperAdmin` + `SuperAdminSession` | Same JWT strategy, no `tenantId` | Platform only |
| `portal` | `PortalUser` + `PortalSession` | `PortalAuthGuard` | **Rejected** in `jwt.strategy.ts` |
| `vendor` | `VendorUser` + `VendorSession` | `VendorAuthGuard` | **Rejected** in `jwt.strategy.ts` |

**LOCKED:** Do **not** reuse `PortalUser` / portal JWT for vendors. Do **not** turn sales staff into portal or vendor users. CRM is staff ERP only (`principal: 'user'`).

### Domain reuse

**LOCKED:** Portals and CRM wrap existing domain services (`InvoicesService`, `PaymentsService`, `ArApService`, `QuotationsService`, `NotificationEmitterService`). They do not invent a second invoice, payment, or quote pipeline.

**LOCKED:** CRM never creates Jobs. Enquiry convert → quotation only. Vendor invoice submit → **DRAFT** `PURCHASE_INVOICE`; staff posts via `POST /purchase-invoices/:id/post`.

**LOCKED (this phase):** Backend-only. No UI. No customer payment gateway. No WhatsApp CRM. No real TDS certificates (India Phase 3). Week 15 Air Import backend shipped (Ch.9).

---

## 1. Platform & library decisions

### 1.1 NestJS 10 (not Express-only, not Fastify)

| | |
|--|--|
| **Status** | LOCKED · SHIPPED |
| **Why** | SOW and Fresa Gold stack specify NestJS. Modules, DI, guards, interceptors, and Swagger match a multi-module ERP. Controllers stay thin; services own rules. |
| **Rejected** | Raw Express (no structure), Fastify adapter (no benefit vs Nest/Express ecosystem we already use). |

### 1.2 TypeScript 5 + class-validator + class-transformer

| | |
|--|--|
| **Status** | LOCKED · SHIPPED |
| **Why** | DTOs are the contract. Global `ValidationPipe` with `whitelist`, `transform`, `forbidNonWhitelisted` rejects unknown fields and coerces query strings. Swagger reads the same decorators. |
| **Note** | `zod` is in `package.json` but is **not** the request-validation path. Do not introduce a second validation style on HTTP DTOs. |

### 1.3 Prisma over TypeORM / Sequelize

| | |
|--|--|
| **Status** | LOCKED · SHIPPED (Prisma **7** + `@prisma/adapter-pg`) |
| **Why** | Schema-first, generated client, explicit migrations. The enterprise brief mentioned TypeORM; the **actual** codebase is Prisma. There are no TypeORM entities. |
| **Why Prisma 7 + pg adapter** | Prisma 7 requires a driver adapter. We use `PrismaPg` + `pg.Pool` so RLS `set_config` in the same transaction as queries is reliable. |
| **Rejected** | TypeORM (not in repo), Sequelize (SOW alternate, unused), Prisma middleware that silently injects `tenant_id` (too easy to miss; we use explicit `runWithTenant`). |

### 1.4 PostgreSQL + Row-Level Security (Neon)

| | |
|--|--|
| **Status** | LOCKED · SHIPPED |
| **Why** | Multi-tenant SaaS needs defense in depth. Application `where: { tenant_id }` is necessary but not sufficient. RLS policies (`tenant_id = current_tenant_id()`) stop a missed filter from leaking another tenant. |
| **Why Neon** | Serverless Postgres for current deploy; migrations still standard SQL. |
| **How** | `enable_rls_for_table()` in migrations. `PrismaService.runWithTenant()` runs `set_tenant_context(uuid)` inside a transaction. |

### 1.5 Passport JWT (`@nestjs/jwt` + `passport-jwt`)

| | |
|--|--|
| **Status** | LOCKED · SHIPPED |
| **Why** | Stateless access tokens + **server-side session rows** (`jti`) so logout, password change, and force-logout take effect immediately. |
| **Rejected** | Session cookies only (harder for portal/vendor/staff clients). Sharing one JWT principal for staff + customers + vendors (privilege mix-up). |

### 1.6 Argon2id for passwords (`argon2`)

| | |
|--|--|
| **Status** | LOCKED · SHIPPED (`PasswordUtil`) |
| **Why** | Memory-hard; recommended over bcrypt for new hashes. |
| **Note** | `bcrypt` / `bcryptjs` remain in dependencies from earlier experiments. **Do not** hash new passwords with bcrypt. Verify path is Argon2 only. |

### 1.7 Speakeasy for TOTP 2FA

| | |
|--|--|
| **Status** | SHIPPED (Week 1) |
| **Why** | Standard TOTP + backup codes without a hosted IdP. Enough for staff login hardening. |
| **Deferred** | WebAuthn / hardware keys (Week 23 hardening if required). |

### 1.8 Helmet + Throttler + compression

| | |
|--|--|
| **Status** | SHIPPED (baseline); deeper hardening Week 23 |
| **Why** | Default HTTP hardening and a global 120 req/min throttle. Public `/track` and login routes use tighter `@Throttle`. |
| **Future** | Week 22–23: Sentry, load test, secrets rotation, OWASP pass. |

### 1.9 Swagger (`@nestjs/swagger`) at `/docs`

| | |
|--|--|
| **Status** | LOCKED · SHIPPED |
| **Why** | Backend-only delivery; Swagger is the contract for frontend and QA. Bearer + `X-Cron-Secret` documented. |
| **Rejected** | Separate OpenAPI YAML as source of truth (would drift from Nest decorators). |

### 1.10 Puppeteer + Handlebars for PDF

| | |
|--|--|
| **Status** | LOCKED · SHIPPED (Week 5+) |
| **Why** | HTML templates (Handlebars) + headless Chromium produce quotation, HAWB/MAWB, BL, invoice, remittance, and statement PDFs. One renderer for all docs. |
| **Ops** | `PUPPETEER_EXECUTABLE_PATH` / skip Chromium download on Windows and Render. See [PDF_SETUP_GUIDE.md](./PDF_SETUP_GUIDE.md). |
| **Rejected** | PDFKit/pdf-lib for every format (too many layouts). Server-side Word. |

### 1.11 Bull + Redis for document generation queue

| | |
|--|--|
| **Status** | SHIPPED (Week 5) |
| **Why** | PDF generation is slow. HTTP enqueues; worker writes storage + `file_url`. Avoids request timeouts. |
| **Note** | Redis is required for the queue. If Redis is down, document jobs fail — they do not silently fall back to sync except where a service generates inline (e.g. vendor remittance). |

### 1.12 Nodemailer + `EmailLog` (not SendGrid-specific)

| | |
|--|--|
| **Status** | SHIPPED |
| **Why** | SOW listed SendGrid/Twilio. We use generic SMTP so tenants can point at any provider. Every send writes `EmailLog` (`PENDING` / `SENT` / `FAILED`). If SMTP is unset, we still log and mark sent-with-warning (dev-safe). |
| **Deferred** | Opened/delivered webhooks unless the provider supports them (CRM campaigns count sent/failed only). Stripe/tenant billing email (Week 21). |

### 1.13 Multer for uploads

| | |
|--|--|
| **Status** | SHIPPED |
| **Why** | Nest `FileInterceptor` for portal/vendor attachments, invoice PDFs, CSV imports. MIME + size limits in the interceptor, not later. |
| **Storage** | `StorageService`: local disk by default, optional S3 (`STORAGE_USE_S3`). Same read path for portal/vendor downloads. |

### 1.14 csv-parse / csv-stringify

| | |
|--|--|
| **Status** | SHIPPED |
| **Why** | Party import (Week 2), lead/subscriber import (Week 14), portal/vendor invoice CSV export. Same style everywhere. |

### 1.15 libphonenumber-js + country locale catalog

| | |
|--|--|
| **Status** | SHIPPED |
| **Why** | Phone/tax/currency defaults follow tenant or record country. Country is **optional** (Week 9/locale decision) — never block create because country is missing. |

### 1.16 dayjs

| | |
|--|--|
| **Status** | SHIPPED (used where dates need formatting) |
| **Why** | Small date helper vs Moment. Domain dates still stored as `timestamptz` / `date` in Postgres. |

### 1.17 axios

| | |
|--|--|
| **Status** | Present; used sparingly |
| **Why** | Outbound HTTP for future EDI / xe.com-style rates. Not the inbound API stack. |
| **OPEN (Week 21)** | Which EDI gateways and which HTTP client wrapper. |

### 1.18 WhatsApp

| | |
|--|--|
| **Status** | STUB only (`WHATSAPP_ENABLED`) |
| **Why** | Spec wants WhatsApp Business API. We log outbound intent; we do not ship a live Business API integration. |
| **DEFERRED** | Real WhatsApp + WhatsApp CRM (not Week 14). |

### 1.19 lodash

| | |
|--|--|
| **Status** | Present |
| **Why** | Occasional deep merge/pick. Prefer native JS for new code. Do not add lodash as a required style. |

### 1.20 Deploy: Render + `0.0.0.0`

| | |
|--|--|
| **Status** | SHIPPED |
| **Why** | `main.ts` binds `0.0.0.0` because Render requires it. `PUBLIC_API_URL` feeds Swagger servers. |
| **Future** | Week 27 AWS/CI/CD as in the 28-week plan — not started. |

---

## 2. Cross-cutting architecture

### 2.1 Explicit `runWithTenant`, not silent tenant injection

**LOCKED · SHIPPED**

Every tenant query goes through `PrismaService.runWithTenant(tenantId, cb)`. The interceptor stores `tenantId` in `AsyncLocalStorage` for locale helpers; it does **not** replace `runWithTenant`. SuperAdmin routes do not set a tenant unless they are acting *on* a tenant.

**Why:** A global Prisma extension that auto-adds `tenant_id` hides bugs and breaks SuperAdmin / cross-tenant admin jobs.

### 2.2 Soft delete everywhere

**LOCKED · SHIPPED**

`deleted_at` on tenant business tables. Reads filter `deleted_at: null`. Deletes are `204` or `{ success, message }` depending on module era — prefer soft delete, never hard-delete money or jobs.

### 2.3 UUID primary keys

**LOCKED · SHIPPED**

`uuid_generate_v4()` in Postgres. Natural keys (`code`, `invoice_number`) are unique **per tenant**, not globally.

### 2.4 Permission catalog + role catalog + sync

**LOCKED · SHIPPED**

| Piece | Role |
|-------|------|
| `permission-catalog.ts` | Every `module.action` that exists in code |
| `role-catalog.ts` | Default grants per `UserRole` |
| `POST /tenants` | Seeds permissions + roles for a new tenant |
| `POST /tenants/sync-permissions` (and `/:id/sync-permissions`) | Adds missing permissions, missing catalog roles, and missing role grants |

**Why:** Permissions are tenant-scoped rows (`@@unique([tenant_id, module, action])`). Shipping a new module without sync leaves existing tenants unable to authorize.

**Week 14 addition:** sync now **creates** roles that appear in `ROLE_CATALOG` but not in the tenant (e.g. `SALES_EXECUTIVE`), instead of only reporting them missing.

### 2.5 Permissions preferred over roles on endpoints

**LOCKED**

New endpoints use `@RequirePermissions('module.action')`. `@Roles()` is for rare whole-controller locks (e.g. SuperAdmin, Tenant Admin password). SuperAdmin structurally bypasses role/permission guards (no `tenantId` on the principal).

### 2.6 API response shape (evolving, Week 13–14 prefer envelope)

**SHIPPED (mixed) · NEW MODULES LOCKED**

Early modules (masters, parties, jobs) often return raw Prisma or `{ data, meta }`. Auth, portal, vendor, CRM, and notifications use `{ success, data, meta? }`.

**Decision for new work (Week 13+):** `{ success, data, meta }` + Swagger + `forbidNonWhitelisted` DTOs. Do not add a global interceptor that rewrites old modules.

### 2.7 No custom exception filter

**LOCKED**

Use Nest `HttpException` subclasses. Prisma `P2002` → `ConflictException`. Do not invent a parallel error envelope.

### 2.8 Number formats

**SHIPPED (Week 2)**

`NumberGeneratorService` + tenant number-format rows produce quotation, job, invoice, voucher, payment numbers. Do not concatenate strings in services.

### 2.9 Notifications stay Prisma-only

**LOCKED · SHIPPED (Week 13–14)**

`NotificationsModule` / `NotificationEmitterService` must not import Portal, Vendor, Jobs, or Invoices modules (avoids Nest circular graphs). Domain modules call the emitter. New types are added to `NotificationType` enum.

### 2.10 Repository pattern only where the aggregate is huge

**LOCKED**

Users module uses Service + Repository. Masters use `BaseMasterService`. Domain modules (jobs, invoices, GL, portal, vendor, CRM) use Pattern C: custom service + Prisma. Do not add a repository “for cleanliness” on a single-service module.

### 2.11 Wrap domain services behind portal/vendor guards

**LOCKED · SHIPPED (Weeks 13–14)**

Portal finance and vendor finance call `InvoicesService` / `PaymentsService` / `ArApService` then **strip** internal notes, GL accounts, other parties, cost/GP. Ownership filter is always `party_id` (vendor) or shipper/consignee/`billing_party_id` (customer portal).

### 2.12 Document rights matrices

**SHIPPED**

| Matrix | Party flag | Types |
|--------|------------|-------|
| `PortalPermission` | `portal_access` | HAWB, invoices, POD, etc. |
| `VendorPermission` | `vendor_portal_access` | PI, remittance, credit note, statement, TDS |

**LOCKED:** Do **not** overload `portal_access` for vendors.

---

## 3. Weeks 0–14 — decided & shipped

### Week 0 — Foundation

| Decision | Why |
|----------|-----|
| Schema + RLS + seed before REST | Cannot safely expose APIs without tenant isolation. |
| Job type as first-class enum (8 modes) | Air/Sea/Land/Courier share `Job` + typed detail tables later. |
| Seed SuperAdmin separately from tenants | Platform owner is not a tenant user. |
| Masters as reference data, not hard-coded | Ports, currencies, charge codes differ per tenant. |

### Week 1 — Auth + RBAC + login security

| Decision | Why |
|----------|-----|
| Three staff-side logins: `/auth/login`, `/auth/tenant-login`, `/auth/super-admin/login` | Tenant owner may have a tenant password without a personal staff record; SuperAdmin is a different table. |
| Embed permissions in access JWT | Avoid a DB hit for every permission check; session row still validated every request. |
| Session `jti` in JWT | Immediate revoke on logout / password change. |
| IP / MAC / office-hours / lockout / password history | Ch.3 security without an external IdP. |
| TOTP optional per user | Freight ops need 2FA; not forced on every tenant on day one. |
| Invite + accept-invite | Staff are provisioned; they do not self-signup into a tenant. |

### Week 2 — Users, parties, masters, organization

| Decision | Why |
|----------|-----|
| Single `Party` model + `PartyType` | Customers, suppliers, airlines, truckers share contacts/addresses/credit. |
| `portal_access` flag only (no portal users yet) | Week 13 owns identity; Week 2 only marks eligibility. |
| Party CSV import with row-level errors | Ops need bulk load; one bad row must not abort the file. |
| Number formats under `/organization` | Document numbers are tenant policy, not hardcoded prefixes. |
| Companies / branches / departments as org tree | Multi-entity UAE groups. |

### Week 3 — Quotations

| Decision | Why |
|----------|-----|
| One quotation aggregate + charge lines + GP | Ch.7 lifecycle; convert-to-job later, do not fork “estimate” vs “quote”. |
| Online quote is `@Public()` + throttle | Website “Get a Quote” without a staff token. |
| Tariffs + zip distances as quotation sub-resources | Pricing helpers live next to quotes, not in masters. |
| Analytics endpoints on `/quotations/reports/*` | Week 14 CRM **wraps** these; does not copy the SQL. |

### Weeks 4–6 — Air Export + docs + pre-alert + search

| Decision | Why |
|----------|-----|
| One `Job` table + `air_job_details` | House/master/sub-job share P&L, milestones, documents. |
| `billing_party_id` as third ownership key | Portal visibility is not only shipper/consignee (fixed in Week 13 audit). |
| AWB stock as its own module | IATA stock is not a job field. |
| BullMQ + Puppeteer for HAWB/MAWB/E-AWB | Sync PDF in HTTP would time out. |
| Pre-alert send + scheduled cron | Ops schedule night sends; cron every 5 minutes. |
| Global `/search` | Ch.5; one box across jobs/parties/invoices. |
| WhatsApp stub | Do not block Air Export on Business API approval. |

### Weeks 7–9 — Sea FCL Export / Import

| Decision | Why |
|----------|-----|
| Same `Job` + `sea_fcl_job_details` + containers | Do not create a second job service per mode. |
| BL as data + PDF finalize lock | Draft editable; original locked. |
| Multiple BL variants (HBL/MBL/FIATA/switch/proxy) as document types | Spec requires them; same job, different PDF. |
| Demurrage/detention cron (daily) | Import free days must accrue without a user opening the job. |
| Country optional on parties/locale | UAE-first but not every party has ISO country on create. |

### Week 10 — Invoicing (Ch.18)

| Decision | Why |
|----------|-----|
| Invoice types on one `Invoice` table | Customer invoice, credit note, debit note, purchase invoice share lines, VAT, PDF, allocations. |
| UAE VAT default 5%, overridable | Tenant/country locale can change rate. |
| Payment requests ≠ payments | Request is ops/finance intent; GL payment is posted cash. |
| Overdue cron (Week 13 hooked notifications) | Finance desk + portal users. |

### Week 11 — GL, AR/AP, banking

| Decision | Why |
|----------|-----|
| Chart of accounts + vouchers + `GlAutoPostService` | Invoice/payment post writes GL; vendors/portals never post GL. |
| Payments: `RECEIPT` vs `PAYMENT` | AR vs AP on one table; allocations to invoices. |
| Cheques / PDC + maturity cron | Regional banking (UAE/India-ready) without a separate product. |
| Bank recon on GL cash/bank accounts | Staff only; never exposed to portal/vendor. |
| CCP/VPP **not** built in Week 11 | Plan listed them; we deferred identity to Weeks 13–14 so JWT isolation was designed first. |

### Week 12 — Financial reports + MIS

| Decision | Why |
|----------|-----|
| Trial balance, B/S, P&L, cash flow, UAE VAT return in `GlModule` | Phase 1 finance path complete. |
| MIS + saved “My Reports” | Ch.23 management views without a BI tool. |
| **Phase 1 MVP closed** after Week 12 | Air Export + Sea FCL Ex/Im + finance + MIS. Portals start Phase 2. |

### Week 13 — Customer portal, track, notifications

| Decision | Why |
|----------|-----|
| New `PortalUser` / `PortalSession` | Customers must not hold staff JWTs. |
| Invite-only portal | Tenant staff issue credentials after “Get a Quote” / KYC. |
| Party-scoped ownership | Shipper **or** consignee **or** `billing_party_id`. |
| `PortalPermission` matrix | Per-customer document view/download. |
| Public `/track` sanitized DTO | No internal notes, cost, GP, staff names. Rate-limited. |
| In-app notifications + optional SSE | Poll is v1; SSE for staff/portal bells. No WebSocket yet. |
| CCP: messages, disputes, credit-limit requests | Ch.19.5 / Ch.24.1. Staff inbox under `/portal-admin`. |
| Shortlist A extras | Party-shared inbox, quote accept/reject, CSV exports, `PortalUserPreference`, `DOCUMENT_READY`. |
| Audit-gap fixes | `CREDIT_LIMIT_EXCEEDED`, billing_party writable, track notes stripped, invoice list SQL meta, dashboard. |

### Week 14 — Vendor Payment Portal + CRM

| Decision | Why |
|----------|-----|
| VPP **before** CRM | Vendor AP is finance-critical; email marketing must not block it. |
| Separate `VendorUser` / `VendorSession` / `vendor_portal_access` | Same risk class as portal; sharing `PortalUser` would mix AR and AP and JWT audience. |
| Eligible party types listed (supplier, airline, line, trucker, broker, CFS, warehouse, overseas agent, agent) | Not every party is a payee. |
| Vendor submit = DRAFT PI + remarks contain `vendor portal` | Finance reviews; vendor cannot post GL. |
| `VendorDispute` (not `portal_user_id`) | Threads must not point at customer portal users. |
| TDS endpoint stub `{ available: false, phase: 'india_phase_3' }` | India Phase 3; do not fake certificates. |
| Remittance PDF generated thin from payment + allocations | No remittance document existed; do not invent a GL report. |
| CRM Pattern C staff module | Sales users stay ERP users. Executives see own records; managers/Tenant Admin see team (`team=true` on follow-ups). |
| Lead convert → `Party` `CUSTOMER` | Reuse Party; do not create a second customer table. |
| Enquiry convert → `QuotationsService.create` | One quote pipeline. |
| 14 sales reports wrap jobs + existing quote analytics | Do not duplicate quotation SQL. |
| Email marketing last (P7) | Subscribers + campaigns + cron; not a full ESP. Filters by party type / country / tags. |
| New notification types | `VENDOR_*`, `FOLLOW_UP_DUE`, `LEAD_ASSIGNED`, `CAMPAIGN_SENT`. |
| `SALES_EXECUTIVE` in role catalog | Spec role existed on `UserRole`; catalog now seeds it on sync. |

---

## 4. Weeks 15–28 — future decisions

These are **not implemented**. Items marked **LOCKED** come from the 28-week plan plus rules already set. Items marked **OPEN** must be decided in that week before coding.

### Week 15 — Air Import (Ch.9)

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| Same `Job` + air import detail fields | **SHIPPED** | `AirJobDetail` extended; no `AirImportJob` table. |
| Documents: pre-CAN, CAN, DO, POD, freight manifest/certificate | **SHIPPED** | Document allowlist + air-shaped PDF payload via existing queue. |
| Customs deposit / storage invoicing | **SHIPPED** | Shared deposits table; DRAFT storage invoice via `InvoicesService.createStorageDraftFromJobCharge`. |
| Transhipment / damage report | **SHIPPED** | Air transhipment to `AIR_EXPORT` \| `SEA_FCL_EXPORT`; damage notify emails. |
| 16 milestones auto vs manual | **SHIPPED** | All 16 seeded at create; auto-complete subset per plan (BOOKING_CREATED, MAWB_RECEIVED, CAN/DO, customs trio, POD). |

### Week 16 — HR (Ch.21)

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| Employees are **not** `User` rows by default | **LOCKED** (proposed) | HR employee master can link to a `User` optionally. Payroll must not require a login. |
| WPS / gratuity / leave | **OPEN** | UAE WPS file format and gratuity formula source of truth. |
| HR letters via Puppeteer | **LOCKED** (proposed) | Same PDF stack. |
| SuperAdmin vs Tenant Admin | **LOCKED** | SuperAdmin does not run payroll. Tenant Admin / HR Manager only. |

### Week 17 — WMS (Ch.22)

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| Warehouse master already exists | **LOCKED** | Extend; do not replace `masters/warehouses`. |
| GRN/GDO + stock ledger | **OPEN** | FIFO vs LIFO default per tenant. |
| Storage invoicing | **LOCKED** (proposed) | Create DRAFT invoices via `InvoicesService`; staff post. |
| WMS is staff ERP | **LOCKED** | Not a portal. |

### Week 18 — Sea LCL Export + Import (Ch.12–13)

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| Same `Job` + LCL detail + house/master consolidation | **LOCKED** | Follow FCL house/master, do not fork job service. |
| Cost prorate across houses | **LOCKED** (proposed) | Same prorate helper as air/FCL charges. |
| CFS storage per consignment | **OPEN** | Link to WMS Week 17 or job-level storage charges only. |

### Week 19 — Land / Trucking + Courier (Ch.14–15)

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| Still `Job` + mode-specific details | **LOCKED** | Completes “all 8 operation modes” on one job spine. |
| Transport requests | **OPEN** | New aggregate vs job milestone + document. |
| Courier barcodes | **LOCKED** (proposed) | Reuse Week 5 label/QR pipeline. |

### Week 20 / 20B — NVOCC

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| NVOCC enquiries are **not** CRM enquiries | **LOCKED** | Week 14 CRM enquiry is sales→quote. NVOCC enquiry is voyage/space (Week 20). |
| Convert NVOCC booking → Job | **LOCKED** (plan) | Same as quote→job; one operational file. |
| Carrier-role HBL | **OPEN** | Document templates vs existing FIATA/HBL. |

### Week 21 — Admin, EDI, public API, Stripe (Phase 2 close)

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| Public API `/api/v1/*` + API keys + webhooks | **OPEN** | Auth model (key vs OAuth). Must not bypass RLS. |
| Stripe for SaaS billing | **OPEN** | Platform billing (SuperAdmin/tenant subscription), **not** customer freight payment gateway (still deferred). |
| EDI (Bayan, eDO, CCN, IAL, MPCI, …) | **OPEN** | Which gateway first; adapter per country. |
| Ch.2 settings (theme, approvals matrix) | **OPEN** | How much is API vs frontend-only. |

### Weeks 22–23 — Performance & OWASP

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| Redis cache in front of hot GETs | **OPEN** | What to cache (masters vs financials). Financials likely no-cache. |
| Sentry | **OPEN** | DSN + PII policy. |
| Pen test / secrets rotation | **LOCKED** (plan) | Process week, not a feature week. |

### Weeks 24–26 — Integration test + UAT

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| Cross-module quote → job → invoice → GL | **LOCKED** | Regression must cover this path and RLS isolation. |
| Portal + vendor security tests | **LOCKED** | Party isolation, JWT principal rejection. |
| UAT is process | **LOCKED** | Not a code milestone. |

### Weeks 27–28 — Prod infra & go-live

| Topic | Status | Decision / question |
|-------|--------|---------------------|
| AWS vs stay on Render/Neon | **OPEN** | Plan says AWS; current prod-like host is Render. Decide before Week 27. |
| CI/CD, backups, monitoring | **LOCKED** (plan) | Required for go-live. |
| Mobile app (Ch.26) | **DEFERRED** | Not in the 28-week backend path. |

### Explicitly out of scope until a later decision

| Item | Why deferred |
|------|----------------|
| UI / Next.js | Backend-only delivery through Week 14; frontend is a separate program. |
| Customer online payment gateway | Not Week 13/14; needs PSP + reconciliation design. |
| Real TDS certificates | India Phase 3. |
| WhatsApp as CRM channel | Stub exists; Business API + consent not done. |
| Sharing one login across staff / portal / vendor | Hierarchy + JWT isolation. |

---

## 5. Decision index (quick)

| Area | Choice | See |
|------|--------|-----|
| ORM | Prisma 7, not TypeORM | §1.3 |
| Passwords | Argon2id | §1.6 |
| Isolation | RLS + `runWithTenant` | §1.4, §2.1 |
| Staff vs customer vs vendor | Three JWT principals | Locked rules |
| Quotes | One pipeline | Week 3, 14 |
| Jobs | One `Job` + mode details | Weeks 4–9, 15, 18–19 |
| Money | Invoice post + GL auto-post; portals never post | Weeks 10–14 |
| PDF | Puppeteer + queue | §1.10–1.11 |
| Email | Nodemailer + EmailLog | §1.12 |
| CRM | Staff only | Week 14 |
| VPP | Own identity tables | Week 14 |

---

## Related docs

- [flow.md](./flow.md) — entry points and execution
- [backend-overview.md](./backend-overview.md) — older overview (modules list may lag)
- [authentication-flow.md](./authentication-flow.md) · [authorization-flow.md](./authorization-flow.md)
- [backend-patterns.md](./backend-patterns.md) · [module-template.md](./module-template.md)
- [api-response-standard.md](./api-response-standard.md)
- [WEEK13_CUSTOMER_PORTAL_PLAN.md](./WEEK13_CUSTOMER_PORTAL_PLAN.md)
- Repo root [plan-summary.md](../plan-summary.md) — 28-week table
