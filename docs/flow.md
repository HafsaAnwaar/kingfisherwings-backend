# KingFisher Wings / Fresa Gold — System Flows

> **Living document.** Entry points, request pipeline, and domain execution paths as of **Weeks 0–14**.  
> Product *why* lives in [decision.md](./decision.md). This file answers *how a request runs*.

---

## 1. Runtime entry points

### 1.1 Process bootstrap

```
node / nest start
  → src/main.ts bootstrap()
      → NestFactory.create(AppModule)
      → ValidationPipe (whitelist, transform, forbidNonWhitelisted)
      → CORS
      → Swagger at GET /docs  (+ /docs-json)
      → listen(PORT, 0.0.0.0)
```

`AppModule` loads Config (`.env`, redis, smtp, storage), Throttler (120/min), Locale, Prisma, and all domain modules. Global providers:

| Provider | Role |
|----------|------|
| `TenantContextInterceptor` | Copies `request.user.tenantId` into `AsyncLocalStorage` |
| `ThrottlerGuard` | Rate limit |
| `JwtAuthGuard` (from `AuthModule` `APP_GUARD`) | JWT unless `@Public()` |

### 1.2 HTTP surface (who calls what)

| Client | Base paths | Auth |
|--------|------------|------|
| SuperAdmin console | `/auth/super-admin/*`, `/tenants` | `principal: 'super_admin'` |
| ERP staff / Tenant Admin | `/auth/*`, `/users`, `/masters/*`, `/parties`, `/organization/*`, `/quotations`, `/jobs`, `/invoices`, `/gl/*`, `/crm/*`, `/notifications`, `/search`, `/portal-admin`, `/vendor-admin`, party portal/vendor user admin | `principal: 'user'` |
| Customer portal | `/portal/auth/*`, `/portal/*` | `principal: 'portal'` + `PortalAuthGuard` |
| Vendor portal | `/vendor/auth/*`, `/vendor/*` | `principal: 'vendor'` + `VendorAuthGuard` |
| Public website / widget | `/track`, `POST /quotations/online-quote`, login/invite/refresh | `@Public()` (+ extra throttle) |
| Cron / ops | Scheduler `@Cron` inside the API process; some jobs also accept `X-Cron-Secret` | Process-local or header |

### 1.3 Non-HTTP entry points

| Entry | Trigger | Handler |
|-------|---------|---------|
| Nest scheduler | `@Cron` in `SchedulerService`, `CrmCronService` | Same Node process as HTTP |
| Bull queue worker | Redis job `DOCUMENT_GENERATION_QUEUE` | `DocumentGenerationProcessor` |
| Prisma migrate | `npm run prisma:migrate:deploy` | SQL in `prisma/migrations/` |
| Seed | `npm run prisma:seed` | SuperAdmin seed |

There is no separate worker dyno required for crons (they run in the API). Document PDF generation **does** need Redis + a process that loads `QueueModule`.

### 1.4 Module → route map (current)

| Module | Prefixes |
|--------|----------|
| Health | `/health` |
| Auth | `/auth` |
| Tenants | `/tenants` |
| Users | `/users` |
| Companies | `/companies` |
| Masters | `/masters/*`, `/vessels/:id/schedules` |
| Parties | `/parties`, `/portal-users`, `/vendor-users` |
| Organization | `/organization/profile`, `/organization/bank-accounts`, `/organization/number-formats` |
| Quotations | `/quotations`, `/quotations/tariffs`, `/quotations/zip-distances` |
| Jobs | `/jobs` |
| AWB stock | `/awb-stock` |
| Search | `/search` |
| Files | `/files` (stored PDF/upload download) |
| Invoices | `/invoices`, `/credit-notes`, `/debit-notes`, `/purchase-invoices`, `/payment-requests` |
| GL | `/gl`, `/gl/accounts`, `/gl/vouchers`, `/gl/payments`, `/gl/cheques`, `/gl/reports`, `/gl/mis`, `/gl/saved-reports` |
| Portal | `/portal/*`, `/portal-admin` |
| Vendor | `/vendor/*`, `/vendor-admin/disputes` |
| CRM | `/crm/*` |
| Track | `/track` |
| Notifications | `/notifications` (staff) · `/portal/notifications` |

---

## 2. Request execution pipeline

```
HTTP request
  │
  ├─ Helmet / compression (if wired in bootstrap extras)
  ├─ ThrottlerGuard
  ├─ ValidationPipe (DTO)
  │
  ▼
JwtAuthGuard
  ├─ @Public()? → skip JWT (portal/vendor then use their own guard)
  └─ else Passport JWT strategy
        ├─ reject type !== 'access'
        ├─ reject principal === 'portal' | 'vendor'   ← staff APIs only
        ├─ super_admin → SuperAdminSession + SuperAdmin
        └─ user → Session + User + tenant ACTIVE|TRIAL
  │
  ▼
TenantContextInterceptor  (tenantId → ALS)
  │
  ▼
Controller @UseGuards(RolesGuard, PermissionsGuard)   [staff]
       or PortalAuthGuard / VendorAuthGuard          [portals]
       or SuperAdminGuard                            [platform]
  │
  ▼
Service
  └─ prisma.runWithTenant(tenantId, tx => …)
        ├─ set_tenant_context(tenant_id)
        └─ queries (RLS + where tenant_id)
```

**Fail closed:** missing user → 401; missing permission → 403; missing row → 404 (also used to hide other parties’ records).

### 2.1 `@Public()` + specialized guards

Portal and vendor controllers are `@Public()` so the **staff** JWT strategy does not run, then `PortalAuthGuard` / `VendorAuthGuard` verify a **different** secret and `principal`.

| Token | Staff route | `/portal/*` | `/vendor/*` |
|-------|-------------|-------------|-------------|
| Staff `user` | OK if RBAC | Rejected by portal guard | Rejected by vendor guard |
| Portal | Rejected by `jwt.strategy` | OK if session + `portal_access` | Rejected |
| Vendor | Rejected by `jwt.strategy` | Rejected | OK if session + `vendor_portal_access` |

Secrets: staff `JWT_ACCESS_SECRET`; portal `PORTAL_JWT_ACCESS_SECRET` (fallback staff secret); vendor `VENDOR_JWT_ACCESS_SECRET` (fallback staff secret). Fallback is documented — prefer distinct secrets in production.

---

## 3. Identity & login flows

### 3.1 SuperAdmin

```
POST /auth/super-admin/signup   (platform bootstrap)
POST /auth/super-admin/login
  → SuperAdminSession + JWT principal super_admin
  → /tenants CRUD, sync-permissions, company/tenant lifecycle
```

No `tenantId` on the principal. SuperAdmin bypasses Roles/Permissions guards. When SuperAdmin acts *inside* a tenant (e.g. create user), the service takes `tenant_id` from the body and still uses `runWithTenant`.

### 3.2 Tenant owner

```
POST /auth/tenant-login { tenant_slug, password }
  → verify Tenant password
  → find or provision TENANT_ADMIN User
  → same Session + user JWT as staff
```

### 3.3 Staff

```
POST /auth/login { tenant_slug, email, password, totp_code? }
  → Tenant by slug (ACTIVE/TRIAL)
  → User by email
  → Argon2id verify
  → lockout / IP / MAC / office hours
  → 2FA if enabled
  → resolveRbac() → permissions[]
  → Session row (jti)
  → access + refresh JWT
```

Refresh: `POST /auth/refresh` rotates tokens and session. Logout revokes `jti`.

Invite: staff `POST /auth/invite` → email → `POST /auth/accept-invite`.

### 3.4 Customer portal

```
Staff: POST /parties/:partyId/portal-users   (enables portal_access)
  → email PORTAL_INVITE or PORTAL_CREDENTIALS
Customer: POST /portal/auth/accept-invite | POST /portal/auth/login
  → PortalSession, principal portal
  → GET /portal/auth/me
```

All subsequent `/portal/*` reads filter by `user.partyId`.

### 3.5 Vendor portal

```
Staff: POST /parties/:partyId/vendor-users
  → party type must be vendor-eligible
  → vendor_portal_access = true
  → seed VendorPermission defaults
  → email VENDOR_INVITE / VENDOR_CREDENTIALS
Vendor: POST /vendor/auth/accept-invite | POST /vendor/auth/login
  → VendorSession, principal vendor
```

### 3.6 Permission sync (existing tenants)

```
POST /tenants/sync-permissions          (all tenants)
POST /tenants/:id/sync-permissions
  → insert missing Permission rows from PERMISSION_CATALOG
  → create missing Role rows from ROLE_CATALOG
  → grant missing RolePermission links
```

Required after Weeks 13–14 (`portal.*`, `vendor.*`, `crm.*`, `SALES_EXECUTIVE`).

---

## 4. Tenant provisioning flow

```
SuperAdmin POST /tenants
  → Tenant row + tenant password
  → seed PERMISSION_CATALOG
  → seed ROLE_CATALOG + RolePermission
  → optional first company / number formats (as implemented)
```

Staff users are invited later. Portal/vendor users are invited from Parties.

---

## 5. Domain flows (Weeks 0–14)

### 5.1 Masters & parties

```
GET/POST /masters/{entity}     BaseMasterService + RLS
POST /parties                  PartiesService.create
POST /parties/import           CSV → validate row → create or error[]
GET  /parties/:id/history      jobs, quotes, invoices (staff)
```

Credit status / limit: `parties.manage_credit` (finance). Portal credit-limit **request** is a separate CCP flow (staff approves).

### 5.2 Quotation → job

```
POST /quotations
  → DRAFT, charge lines, GP
  → submit / approve / send
POST /quotations/:id/convert   (or equivalent convert-to-job)
  → Job with created_from_quote_id
  → CRM must NOT do this; CRM stops at quotation
```

Public: `POST /quotations/online-quote` (throttled) creates a prospect quote for staff follow-up.

Portal: `GET /portal/quotations`, accept/reject when status allows (`markWon` / `markLost` on existing service).

### 5.3 Job operations (Air Export / Sea FCL)

```
POST /jobs                     job_type + parties + ports
POST /jobs/:id/sub-jobs        house under master
PATCH milestones               markMilestoneIfPresent → optional notify
POST /jobs/:id/charges         live P&L (revenue_total / cost / GP)
POST /jobs/:id/documents/*     enqueue Bull PDF job
POST /jobs/:id/pre-alert/send | schedule
GET  /awb-stock                allocate AWB
```

Sea FCL adds containers, stuffing, BL data, VGM/SI cutoffs. FCL import adds free days, demurrage cron, CAN/DO/POD docs, deposits.

**Ownership for portal:** job visible if `shipper_id | consignee_id | billing_party_id` = portal `partyId`.

### 5.4 Search

```
GET /search?q=
  → jobs, parties, invoices, quotations (staff permissions)
```

Public track is **not** search — see §5.8.

### 5.5 Invoicing & AP/AR

```
Staff create
  POST /invoices | /credit-notes | /debit-notes | /purchase-invoices
  POST /invoices/:id/post          → status POSTED + GlAutoPostService
  POST /purchase-invoices/:id/post
  POST /invoices/:id/send          → EmailLog INVOICE_SENT + PDF
  POST /payment-requests

Vendor submit
  POST /vendor/invoices/submit     → createPurchaseInvoice DRAFT
                                   → remarks include "vendor portal"
                                   → optional PDF on invoice.pdf_url
                                   → notifyFinanceStaff VENDOR_INVOICE_SUBMITTED
```

Customer portal lists **customer** invoices for `party_id`. Vendor portal lists **PURCHASE_INVOICE** for `party_id`.

Credit-limit exceeded: on invoice post, if AR exceeds limit → `CREDIT_LIMIT_EXCEEDED` to portal users + finance.

### 5.6 Payments & GL

```
POST /gl/payments                  DRAFT RECEIPT or PAYMENT
POST /gl/payments/:id/post
  → voucher + allocations
  → if RECEIPT → notifyPartyPortalUsers PAYMENT_RECEIVED
  → if PAYMENT → notifyPartyVendorUsers VENDOR_PAYMENT_POSTED

GET /gl (aging, statements)        staff
GET /portal/credit/*               AR wrap
GET /vendor/credit/*               AP wrap (no bank accounts, no vouchers)
GET /vendor/payments/:id/remittance.pdf
```

Cheques/PDC: maturity cron notifies finance. Bank recon is staff-only.

### 5.7 Financial reports / MIS

```
GET /gl/reports/*     TB, BS, P&L, cash flow, VAT return
GET /gl/mis/*         profitability / operational KPIs
CRUD /gl/saved-reports
```

CRM sales dashboard is **separate** (`/crm/dashboard`, `/crm/reports/:type`) and uses job revenue + wrapped quotation analytics — it does not replace GL reports.

### 5.8 Public track & trace

```
GET /track?ref=JOB|BL|AWB
  @Public() + tight throttle
  → resolve job
  → return sanitized milestones + public docs
  → strip internal notes / cost / GP / staff
```

### 5.9 Customer portal (CCP) daily path

```
login → GET /portal/dashboard
     → GET /portal/shipments[+ export.csv]
     → GET /portal/documents (matrix)
     → GET /portal/invoices | payments | credit/aging | statement
     → POST /portal/messages | /portal/disputes | credit/limit-requests
     → GET /portal/notifications
     → GET /portal/preferences  (milestone / document opt-in)
```

Staff: `/portal-admin/messages|disputes|credit-limit-requests`.

### 5.10 Vendor portal daily path

```
login → GET /vendor/invoices[+ summary|export.csv|:id/pdf]
     → GET /vendor/payments | advances | schedule | payment-requests
     → GET /vendor/credit/aging | statement[.pdf]
     → GET /vendor/documents/tds          → stub
     → POST /vendor/invoices/submit
     → POST/GET /vendor/disputes
```

Staff: `/vendor-admin/disputes`, `/parties/:id/vendor-users`, `/parties/:id/vendor-permissions`.

### 5.11 CRM (staff) daily path

```
Sales Executive (own records) / Sales Manager | Tenant Admin (team)

Leads
  GET/POST /crm/leads
  GET /crm/leads/pipeline
  POST /crm/leads/import
  POST /crm/leads/:id/convert     → Party CUSTOMER + converted_party_id + status WON
                                  → LeadActivity + optional LEAD_ASSIGNED notify

Calls
  POST /crm/call-logs             lead_id XOR party_id
                                  if next_followup_date → FollowUp
  GET /crm/call-logs/daily

Follow-ups
  GET /crm/follow-ups?team=true   managers only for full team
  GET /crm/follow-ups/calendar
  PATCH /crm/follow-ups/:id       complete / reschedule
  Cron 07:00                      FOLLOW_UP_DUE if due and reminder_sent_at null

Enquiries
  POST /crm/enquiries
  POST /crm/enquiries/:id/convert-to-quote
      → require party_id or lead.converted_party_id
      → QuotationsService.create
      → enquiry.status = QUOTED, quotation_id set

Dashboard
  GET /crm/dashboard
  GET /crm/reports/:type          14 types (see below)
  POST /crm/budgets

Email
  POST /crm/subscribers[/import]
  POST /crm/subscribers/:id/unsubscribe
  POST /crm/campaigns + /send | /schedule
  Cron every 5 min                SCHEDULED campaigns due → EmailService CRM_CAMPAIGN
                                  sent_count / failed_count from EmailLog.status
```

**Report types:** `weekly_sales`, `monthly_sales`, `salesman_revenue`, `customer_revenue`, `top_customers`, `top_salesmen`, `trade_lane`, `service_type`, `win_loss` (quotes wrap + leads), `call_log_summary`, `lead_pipeline`, `budget_vs_actual`, `enquiry_conversion`, `follow_up_overdue`.

---

## 6. Async, cron, email, notifications

### 6.1 Scheduler (`SchedulerService`)

| When | Job |
|------|-----|
| 01:00 | Quotation expiry |
| 02:00 | FCL import demurrage/detention |
| 03:00 | Overdue customer invoices → portal + finance |
| 04:00 | PDC maturity approaching |
| every 5 min | Scheduled pre-alerts |

### 6.2 CRM crons (`CrmCronService`)

| When | Job |
|------|-----|
| 07:00 | Due follow-ups → `FOLLOW_UP_DUE` |
| every 5 min | Due `EmailCampaign` status `SCHEDULED` |

### 6.3 Document queue

```
Controller → DocumentGenerationService.enqueue
  → Bull Redis
  → Processor: PdfService + StorageService
  → job_document.file_url
  → notifyPortalDocumentReadyForJob (if portal-visible + opt-in)
```

### 6.4 Email

```
EmailService.send({ eventType, to, subject, body, … })
  → EmailLog PENDING
  → nodemailer (or log-only if no SMTP)
  → SENT | FAILED
```

Event types include quotation, invoice, portal/vendor invite, `CRM_CAMPAIGN`, `FOLLOW_UP_REMINDER`.

### 6.5 Notification fan-out

```
Domain service → NotificationEmitterService
  notifyStaffUser / notifyStaffByRoles / notifyFinanceStaff / notifyOpsStaff
  notifyPortalUser / notifyPartyPortalUsers [+ milestone/document opt-in]
  notifyVendorUser / notifyPartyVendorUsers
```

Staff read: `GET /notifications`. Portal: `GET /portal/notifications`. Vendor inbox API is not in Week 14 (in-app rows still stored on `vendor_user_id`).

---

## 7. Money path (end-to-end)

```
Quote (DRAFT→SENT→WON)
  → Job (charges, P&L)
  → Customer Invoice (DRAFT→POSTED) → GL voucher
  → Receipt payment POSTED → allocate → AR aging / portal statement
                                      → PAYMENT_RECEIVED

Vendor DRAFT PI (portal submit or staff)
  → staff POST /purchase-invoices/:id/post → GL
  → PAYMENT posted → allocate → AP aging / vendor statement / remittance PDF
                              → VENDOR_PAYMENT_POSTED
```

Portals never call voucher or bank-recon endpoints.

---

## 8. Week 15 — Air Import (Ch.9) — implemented

```
POST /jobs job_type=AIR_IMPORT
  → air_job_details row + 16 milestones (BOOKING_CREATED auto)
PATCH /jobs/:id/air-details          (AIR_EXPORT | AIR_IMPORT)
Shared import ops (FCL + Air): deposits, part-delivery, POD, damage, customs-status
GET/POST /jobs/:id/customs-examinations   (AIR_IMPORT only)
GET /jobs/:id/storage-calculation
POST /jobs/:id/storage-invoice       → DRAFT CUSTOMER_INVOICE (no auto-post)
POST /jobs/:id/air-transhipment-link → AIR_EXPORT | SEA_FCL_EXPORT
POST /jobs/:id/import-notices/can/send | /do/send  (+ scheduled_at via EmailLog cron)
Document allowlist per job_type; CAN/DO queue marks CAN_SENT / DO_ISSUED milestones
Daily cron: customs deposit expiry bands 90/60/30 (CUSTOMS_DEPOSIT_EXPIRING)
```

---

## 9. Future week flows (planned, not built)

Use these as the intended execution shape when those weeks start. Details still **OPEN** are in [decision.md](./decision.md) §4.

### Week 15 — Air Import

*(Moved to §8 — shipped.)*

### Week 16 — HR

```
/hr/employees, leave, payroll, letters
  → Tenant Admin / HR Manager
  → optional link employee → User
  → expiry cron (reuse document-expiry notification pattern)
```

### Week 17 — WMS

```
/warehouses /grn /gdo /stock
  → ledger + storage invoice DRAFT
  → staff only
```

### Week 18 — LCL

```
Job LCL + house/master consolidation
  → prorate costs
  → LCL document set via existing PDF queue
```

### Week 19 — Land + Courier

```
Job LAND | COURIER
  → transport requests / barcode labels
  → tracking fields (public /track may extend)
```

### Week 20 — NVOCC

```
/nvocc/voyages → enquiries → send-rate → bookings → load-list
  → convert booking → Job
  → NVOCC HBL / CAN / DO / voyage P&L
```

CRM `/crm/enquiries` stays sales-side. Do not merge the two enquiry tables.

### Week 21 — Public API / EDI / Stripe

```
/api/v1/* + API key
  → still runWithTenant
Webhooks outbound
EDI adapters (per government system)
Stripe: platform subscription (SuperAdmin/tenant), not freight checkout
```

### Weeks 22–28

Performance (cache, queue scale) → OWASP → integration tests (quote→GL, RLS, portal/vendor isolation) → UAT → infra → go-live.

---

## 9. Guard / permission cheat sheet

| Area | Permissions (examples) | Roles (typical) |
|------|------------------------|-----------------|
| Users / org | `users.*` | Tenant Admin, Branch Manager |
| Masters | `masters.*` | Most staff view |
| Parties | `parties.*`, `parties.manage_credit` | Sales create; Finance credit |
| Quotes / jobs | `quotations.*`, `jobs.*`, `jobs.view_gp` | Sales vs Ops; GP hidden from many |
| Invoices / GL | `invoices.*`, `gl.*`, `gl.view_reports` | Finance, Tenant Admin |
| Portal admin | `portal.manage_users`, `portal.manage_disputes`, … | Tenant Admin, CS, Branch, Sales (subset) |
| Vendor admin | `vendor.manage_users`, `vendor.manage_permissions`, `vendor.manage_disputes` | Tenant Admin, Finance Manager |
| CRM | `crm.view/create/update/delete` | Tenant Admin, Sales Manager, Sales Executive |
| Notifications | `notifications.view` | Most staff |

Executives: CRM services call `salespersonScope()` — if role is `SALES_EXECUTIVE`, force `assigned_salesperson_id` / `owner_id` = current user.

---

## 10. Key files (follow a request)

| Concern | File |
|---------|------|
| Bootstrap | `src/main.ts`, `src/app.module.ts` |
| JWT staff | `src/modules/auth/strategies/jwt.strategy.ts` |
| Portal JWT | `src/modules/portal/guards/portal-auth.guard.ts` |
| Vendor JWT | `src/modules/vendor/guards/vendor-auth.guard.ts` |
| RLS | `src/prisma/prisma.service.ts` |
| Catalogs | `src/common/constants/permission-catalog.ts`, `role-catalog.ts` |
| Notify | `src/modules/notifications/notification-emitter.service.ts` |
| PDF / queue | `src/shared/pdf/pdf.service.ts`, `src/shared/queue/` |
| Crons | `src/modules/scheduler/scheduler.service.ts`, `src/modules/crm/crm-cron.service.ts` |

---

## Related

- [decision.md](./decision.md)
- [authentication-flow.md](./authentication-flow.md) (staff-era detail; portal/vendor added here)
- [authorization-flow.md](./authorization-flow.md)
- [WEEK13_CUSTOMER_PORTAL_PLAN.md](./WEEK13_CUSTOMER_PORTAL_PLAN.md)
- [plan-summary.md](../plan-summary.md)
