# Fresa Gold — 28-Week Plan Summary

Extracted from `Fresa_Gold_Complete_28Week_Plan.pdf` (36 pages). Plan spans **Week 0–28** (174 working days, 2 developers). Saturday = review/sync; Weeks 27–28 are QA/deploy only.

---

## Full 28-Week Table

| Week | Title | Chapter(s) | Main modules / features | API endpoints mentioned |
|------|-------|------------|-------------------------|-------------------------|
| **0** | Infrastructure · Master Data Schema · RLS · Seed Data | Ch.1, Ch.4, Ch.28 | NestJS/PostgreSQL+RLS/Redis/Docker/CI; Prisma migrations; 15 master data types seeded; xe.com rates; job_type architecture (8 modes); shared child tables | *(schema/seed only — no REST APIs yet)* |
| **1** | Authentication + RBAC + Login Security | Ch.3 | JWT auth; users/roles/permissions; financial visibility flags; password policy; 2FA; IP/MAC/hours restrictions; audit trail; menu access control | `/auth/login`, `/auth/refresh`, `/auth/logout` |
| **2** | User Admin · Party Master · Master Data UI | Ch.3, Ch.4, Ch.27 | User CRUD; invitations; organizations/branches; Party Master (8 types); all remaining masters; tariff templates; CSV import/export; number format config | `/users` (GET/POST/PATCH/DELETE), `/auth/invite`, `/auth/accept-invite`, `/organizations`, `/parties`, `/masters/*` |
| **3** | Quotation Module — Full Lifecycle | Ch.7 | Quote lifecycle; charge lines + GP; 3-level approvals; 8 PDF formats; online quote; tariff management (6 types); analytics | `/quotes`, `/quotes/:id/pdf`, `/tariffs`, `/api/online-quote` |
| **4** | Air Export — Booking, House/Master Job, Milestones | Ch.8 | Jobs core; air_job_details; house/master jobs; milestones (15); charges + prorate; AWB stock; global search (24 params) | `/jobs`, `/awb-stock` |
| **5** | Air Export — Document Generation | Ch.8, Ch.16 | Puppeteer + BullMQ PDF queue; HAWB/MAWB/E-AWB; manifests; labels; job card/P&L/costing; draft→original workflow | `/jobs/:id/documents/hawb`, `/mawb`, `/e-awb`, `/jobs/:id/documents/*` (manifest, labels, etc.) |
| **6** | Air Export — Pre-Alert, Status Emails, Search | Ch.8, Ch.5 | Pre-alert with merge fields; 7 status email triggers; auto-send on milestone; WhatsApp; global search; party transaction history | `/jobs/:id/pre-alert/send`, `/api/search?q=`, `/parties/:id/history` |
| **7** | Sea FCL Export — Core Job, Containers, Milestones | Ch.10 | sea_fcl_job_details; containers; BL data model; 16 milestones; VGM/SI/CY cutoffs; stuffing records | `/jobs` (FCL), `/jobs/:id/containers`, `/vessels/:id/schedules` |
| **8** | Sea FCL Export — Document Generation | Ch.10, Ch.16 | HBL (standard/express), MBL, FIATA BL, Switch/Proxy/Back-to-Back BL; surrender notice; SI; stuffing/sailing/transhipment docs | `/jobs/:id/documents/hbl`, `/hbl-express-release`, `/mbl`, `/fiata-bl`, `/rider-bl`, `/switch-bl`, `/proxy-bl`, `/back-to-back-bl`, `/surrender-notice`, `/si`, `/stuffing-report`, `/sailing-confirmation`, `/transhipment-confirmation` |
| **9** | Sea FCL Import — CAN, Demurrage, Customs | Ch.11 | Import fields; free days; demurrage/detention auto-calc; customs deposit; 14 milestones; 11 import documents; part delivery; transhipment link | `/documents/pre-can`, `/can`, `/exchange-letter`, `/undertake-letter`, DO/POD/transport request docs |
| **10** | Invoicing — 25+ Formats, UAE VAT, Credit Notes | Ch.18 | Invoices; UAE VAT 5%; 25+ PDF formats; credit/debit notes; purchase invoices; LPO; payment requests; overdue cron | `/invoices`, `/invoices/:id/pdf`, `/credit-notes`, `/purchase-invoices`, `/payment-requests` |
| **11** | AR, AP, GL, Vouchers, Banking | Ch.17, Ch.19 | Chart of accounts; 9 voucher types; GL auto-posting; AR/AP aging; payments; bank recon; cheques; PDC; CCP/VPP APIs | `/gl`, `/vouchers`, `/payments`, `/bank-accounts`, `/pdcs` |
| **12** | Financial Reports · MIS Dashboard · My Reports | Ch.17, Ch.20, Ch.23 | Trial Balance, B/S, P&L, Cash Flow; UAE VAT return; 17-widget dashboard; 16 profitability + 15 operational reports; My Reports builder | Report endpoints (Swagger); **PHASE 1 complete** |
| **13** | Customer Portal · Track & Trace · Notifications | Ch.24 | Portal auth; shipment/invoice views; Track & Trace widget; in-app notifications (7 triggers); portal document rights | Portal APIs, `GET /track?ref=`, `/notifications` (GET, mark-read) |
| **14** | Vendor Portal · CRM / Sales | Ch.24, Ch.6 | VPP; leads/call logs/enquiries/follow-ups; email marketing; budgets; 14 sales dashboard reports | Vendor portal APIs, `/crm/*`, sales dashboard endpoints |
| **15** | Air Import — All Features & Documents | Ch.9 | Import air job fields; 16 milestones; customs deposit; CAN/DO/POD; storage invoicing; transhipment; damage report | `/documents/pre-can`, `/can`, `/freight-manifest`, `/freight-certificate` (air import) |
| **16** | HR Module | Ch.21 | Employee master; doc expiry alerts; 6 leave types; WPS payroll; gratuity; loans; timesheets; KPI evals; 10 HR letters | HR CRUD + `/leave-calendar`, payroll/payslip endpoints |
| **17** | Warehouse Management System | Ch.22 | GRN/GDO; FIFO/LIFO; stock ledger; storage invoicing; 12 WMS reports; ASN; low-stock alerts | `/warehouses`, `/grn`, `/gdo`, `/stock/*` |
| **18** | Sea LCL Export + Import | Ch.12, Ch.13 | House/master consolidation; prorate cost; 14 LCL export + 11 LCL import docs; CFS storage per consignment | `/jobs/:id/documents/*` (14 LCL doc types) |
| **19** | Land/Trucking + Courier | Ch.14, Ch.15 | Land jobs; transport requests; cross-border docs; courier booking; barcode labels; delivery tracking; **all 8 operation modes complete** | `/jobs` (land/courier), `/transport-requests` |
| **20** | NVOCC — Voyages, Enquiries, Bookings, Load List | NVOCC | nvocc_voyages; enquiries; bookings; load list; NVOCC tariffs; convert booking→job | `/nvocc/voyages`, `/nvocc/enquiries`, `/nvocc/enquiries/:id/send-rate`, `/nvocc/bookings`, `/nvocc/bookings/:id/send-cutoff-reminder`, `/nvocc/tariffs`, `/nvocc/voyages/:id/load-list` |
| **20B** | NVOCC — Documents, Voyage P&L, Reporting | NVOCC | NVOCC HBL (carrier role); CAN/DO/pre-alert; voyage P&L; space utilization; trade lane profitability | `/nvocc/jobs/:id/documents/hbl-draft`, `/hbl-original`, `/surrender-notice`, `/can`, `/do`, `/pre-alert/send`, `/nvocc/voyages/:id/pnl`, `/nvocc/voyages/utilization` |
| **21** | System Admin · Settings · EDI · Public API | Ch.2, Ch.25, Ch.27 | EDI; public REST API + webhooks; Stripe billing; Ch.2 settings (theme, number/doc formats, email, approvals); data import/export; monitoring | Public API (`/api/v1/*`), webhooks, API keys, EDI config; **PHASE 2 complete** |
| **22** | Performance Optimisation | Non-functional | DB indexes; Redis cache; BullMQ for PDF/email/CSV; rate limiting; Sentry; Helmet; load test (100 users) | `/jobs/:id/status` (async poll), BullMQ monitoring |
| **23** | Security Hardening — OWASP | Security | OWASP Top 10; pen test; secrets rotation; IP/MAC/hours enforcement; 2FA QA; audit trail | *(hardening — no new business APIs)* |
| **24** | Integration Testing (part 1) | Integration QA | Full API regression; cross-module quote→GL flow; RLS multi-tenant test; document quality review | — |
| **25** | Integration Testing (part 2) | Integration QA | Financial accuracy audit; portal security; continued bug fixes | — |
| **26** | UAT | UAT & Deploy | User acceptance testing with stakeholders | — |
| **27** | Production Infrastructure | UAT & Deploy | AWS infra; CI/CD; backups; monitoring | — |
| **28** | Deployment & Go-Live | UAT & Deploy | Production deploy; smoke tests; handover | — |

> **Note:** PDF labels Weeks 24–25 and 26–29 as combined ranges; table above splits them into individual weeks 24–28 for clarity. Week 20B is an extra NVOCC week in the PDF (not counted in the "28" title but present in the plan).

---

## Weeks 1–10: Done vs Next (after Jobs / Ch.8)

Backend repo state assessed against implemented modules (`src/app.module.ts`, controllers).

| Week | Ch. | Status | Evidence / gaps |
|------|-----|--------|-----------------|
| **0** | 1, 4, 28 | **Done** | Prisma schema, masters module (15 types), RLS/tenant_id, exchange rates, job architecture |
| **1** | 3 | **Mostly done** | `auth`, `users`, RBAC guards, sessions, password policy. Gaps: `/auth/invite` + `/auth/accept-invite` controllers, IP/MAC/hours restriction enforcement, 2FA TOTP |
| **2** | 3, 4, 27 | **Mostly done** | `users`, `parties`, `organization`, all masters, `number-formats`. Gaps: user invitation API endpoints, `/parties/:id/history`, CSV bulk import for parties |
| **3** | 7 | **Done** | Full `quotations` + `tariffs`; GP, approvals, PDF, analytics, `online-quote`, convert-to-job |
| **4** | 8 | **Mostly done** | `jobs` CRUD, air details, charges, milestones, notes, house-jobs, prorate, `awb-stock`, P&L. Gaps: sub-jobs, provisional cost/sales, payment request from job |
| **5** | 8, 16 | **In progress** | PDF/queue/storage/email infra added (uncommitted); `hawb`, `mawb`, `cargo-manifest` endpoints. Gaps: `e-awb`, freight manifest, shipping instruction, barcode/consignee labels, job card/P&L/costing/proforma/shipping advice PDFs |
| **6** | 8, 5 | **In progress** | `pre-alert/send`, `search` module, email service. Gaps: 7 status email triggers + templates, auto-send on milestone, WhatsApp, `/parties/:id/history`, pre-alert schedule send, full 24-param search |
| **7** | 10 | **Partial** | `sea-fcl-details`, `containers` CRUD in jobs. Gaps: bills_of_lading table, 16 FCL milestones, VGM/SI/CY tracking, stuffing records, `/vessels/:id/schedules` |
| **8** | 10, 16 | **Not started** | No HBL/MBL/FIATA/switch/proxy BL document endpoints |
| **9** | 11 | **Not started** | No FCL import fields, demurrage/detention, customs deposit, import documents |
| **10** | 18 | **Not started** | No `invoices` module in app |

### What's next after Jobs (Ch.8)

Per the plan sequence, immediate priorities are:

1. **Finish Week 5–6 (Air Export completion)** — remaining document types (`e-awb`, freight manifest, labels, job card, costing sheet, etc.); status email triggers; party history API; WhatsApp config.
2. **Week 7–9 (Sea FCL Ex/Im)** — core FCL job + containers (partially started), then all BL document generation, then FCL import (CAN, demurrage, customs).
3. **Week 10 (Invoicing)** — first finance module; unblocks Weeks 11–12 (GL, AR/AP, MIS).

**Phase 1 MVP target (per PDF):** Air Export + Sea FCL Export/Import + Full Finance + MIS Dashboard (through Week 12).

---

## Phase overview

| Phase | Weeks | Focus |
|-------|-------|-------|
| 0 Foundation | 0–2 | Master data, auth, parties |
| 1 Core Operations | 3–12 | Quotations, Air Export, Sea FCL, Finance, MIS |
| 2 Full Platform | 13–21 | Portals, CRM, Air Import, HR, WMS, LCL, Land, Courier, NVOCC, EDI |
| 3 QA & Launch | 22–28 | Performance, security, integration test, UAT, deploy |

---

## Chapter → week quick map

| Ch. | Topic | Week(s) |
|-----|-------|---------|
| 1 | Platform overview | 0 |
| 2 | General settings | 20–21 |
| 3 | Access control | 1–2 |
| 4 | Master data | 0–2 |
| 5 | Search & navigation | 6 |
| 6 | Sales & CRM | 14 |
| 7 | Quotations | 3 |
| 8 | Air export | 4–6 |
| 9 | Air import | 15 |
| 10 | Sea FCL export | 7–8 |
| 11 | Sea FCL import | 9 |
| 12–13 | Sea LCL ex/im | 18 |
| 14–15 | Land / Courier | 19 |
| 16 | Document generation | 5–9, 18–19 |
| 17–20 | Accounting | 10–12 |
| 21 | HR | 16 |
| 22 | WMS | 17 |
| 23 | MIS reports | 12 |
| 24 | Portals | 13–14 |
| 25 | EDI & API | 21 |
| 26 | Mobile app | Deferred |
| 27 | System admin | 2, 21 |
| 28 | SaaS guide | 0, 21 |
