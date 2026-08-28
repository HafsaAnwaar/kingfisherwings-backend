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

## Weeks 1–10: Done vs Next

Backend repo state assessed against implemented modules (`src/app.module.ts`, controllers).

| Week | Ch. | Status | Evidence / gaps |
|------|-----|--------|-----------------|
| **0** | 1, 4, 28 | **Done** | Prisma schema, masters module (15 types), RLS/tenant_id, exchange rates, job architecture |
| **1** | 3 | **Done** | `auth`, `users`, RBAC, sessions, password policy; `/auth/invite` + `/auth/accept-invite`; login IP/MAC/office-hours enforcement; 2FA TOTP setup/enable/disable + login verify |
| **2** | 3, 4, 27 | **Done** | `users`, `parties`, `organization`, masters, `number-formats`; party CSV import/export; `/parties/:id/history` |
| **3** | 7 | **Done** | Full `quotations` + `tariffs`; GP, approvals, PDF, analytics, `online-quote`, convert-to-job |
| **4** | 8 | **Done** | Jobs CRUD, air details, charges, milestones, house/sub-jobs, provisional charges + P&L split, prorate, `awb-stock`, payment request from job |
| **5** | 8, 16 | **Done** | PDF/queue/storage; HAWB/MAWB/E-AWB, freight/cargo manifests, barcode/consignee labels, job card/P&L/costing, freight certificate |
| **6** | 8, 5 | **Done** | Pre-alert send + schedule (cron); milestone status emails; WhatsApp stub; enriched search filters; `/parties/:id/history` |
| **7** | 10 | **Done** | `sea-fcl-details`, containers, cargo, BL data model, stuffing records, 16 FCL milestones, VGM/SI submission, cutoffs, fill indicators, `/vessels/:id/schedules` |
| **8** | 10, 16 | **Done** | HBL/MBL/FIATA + Switch/Proxy/Back-to-Back/Rider BL PDFs; surrender notice, SI, stuffing/sailing/transhipment; job card/P&L/proforma/manifests; finalize locks BL |
| **9** | 11 | **Done** | FCL import fields on `sea_fcl_job_details`; free days + demurrage/detention; deposits; customs status; POD/part delivery/damage; transhipment link; CFS storage; 14 import milestones; 8 import document PDFs; daily demurrage cron |
| **10** | 18 | **Done** | `invoices`, credit notes, purchase invoices, payment requests |
| **11** | 17, 19 | **Done** | COA + vouchers; invoice→GL auto-post; AR/AP aging + statements; payments/allocations; cheques/PDC; bank recon + bank transfers |
| **12** | 17, 20, 23 | **Done** | Trial balance, Balance Sheet, P&L, Cash Flow, UAE VAT return; MIS dashboard / profitability / operational KPIs; My Reports. **Phase 1 MVP finance path complete.** |
| **13** | 24 | **Done** | Customer portal (auth, shipments, documents/rights, finance, CCP, notifications, preferences, track & trace) |
| **14** | 24, 6 | **Done** | Vendor portal (VPP) + CRM (leads, calls, enquiries, follow-ups, campaigns) |
| **15** | 9 | **Done** | Air Import backend (milestones, CAN/DO, customs, storage invoice, transhipment, damage) |
| **16** | 21 | **Done** | HR backend (employees, leave, payroll/WPS, loans, timesheets, evaluations, letters) |
| **17** | 22 | **Done** | WMS: items, ASN, GRN/GDO, FIFO/LIFO stock ledger, transfers, adjustments, storage DRAFT invoices, low-stock cron |
| **18** | 12–13 | **Done** | Sea LCL Export + Import: SeaLclJobDetail, house/master consolidation, milestones, documents, CFS storage, WMS link, prorate by CBM |
| **19** | 14–15 | **Done** | Land/Trucking + Courier: LandJobDetail, CourierJobDetail, transport requests, courier vendors, barcode checkpoints, public track |

### What's next

1. **Week 20** — NVOCC (voyages, enquiries, bookings, load list, tariffs).
2. **Week 21** — Admin, EDI, public API, Stripe.
3. Existing tenants: `POST /tenants/:id/sync-permissions` after each new module catalog.

**Phase 1 MVP target (per 28-week PDF):** Air Export + Sea FCL Export/Import + Full Finance + MIS Dashboard (through Week 12) — **backend complete**.  
**Phase 2 progress:** Weeks 13–19 **backend complete**; Weeks 20–21 remaining.

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

---

## Appendix A — Fresa Gold Sea Freight Manual gap analysis

**Source:** `Fresa-Gold-Seafreight.pdf` (FRESA GOLD USER MANUAL — SEA FREIGHT MODULE, Sept 2017, 288 pages).  
**Assessed against:** KingFisher / FreightSaas backend as of Aug 2026 (Weeks 0–16 shipped).  
**Purpose:** Fresa Sea was the operations inspo for KingFisher Wings. Goal = **do not miss Fresa sea features**, while KingFisher also adds multi-tenant SaaS, finance spine, portals, HR, etc.

**Status codes:** **D** = Done (backend) · **P** = Partial · **N** = Missing · **F** = Frontend / UI-only · **W** = Scheduled in future week

---

### A.1 Manual table of contents → our coverage

| Fresa manual chapter | Topic | KingFisher status | Plan week |
|----------------------|-------|-------------------|-----------|
| Ch.1 Getting Started | Login, menu bar, dashboard widgets, side panel | Auth **D**; dashboard/homepage widgets **N/F** | UI + Week 21 settings |
| Ch.2 Organization Master | Client/shipper/agent master + special tabs | Party master **D**; special tabs **P** | Gaps listed in A.2 |
| Ch.3 Sea Freight Module | Export LCL/FCL + Import LCL/FCL overview | FCL **D**; LCL **N** | Week 18 |
| Ch.4 LCL Export Console | Shipments, edit, close/P&L, barcode, KPI | **N** (enum stub only) | **Week 18** |
| Ch.5 FCL Export Console | Same console pattern for FCL export | **D** / **P** (see A.3) | Weeks 7–8 shipped |
| Ch.6 LCL Import Console | Shipments, MBL add/detach, sale/cost, CAN/DO, barcode | **N** | **Week 18** |
| Ch.7 FCL Import Console | Same for FCL import | **D** / **P** (see A.4) | Week 9 shipped |

---

### A.2 Organization Master (manual Ch.2) — feature map

Fresa “Organization” ≈ our **Party** (+ org profile for the tenant company).

| Fresa feature | Status | Notes |
|---------------|--------|-------|
| Login / password / forgot password | **D** / **P** | Staff auth Done; “remember me” is UI |
| Menu bar / side panel navigation | **F** | Backend APIs exist; UI separate |
| Dashboard: active shipments, recent invoices, todo | **P** / **N** | Job/invoice APIs exist; homepage widget pack **N** |
| Create Organization (Name / Address / Category / Confirm) | **D** | `POST /parties` + addresses/contacts/types |
| Types: Primary, Billing, Factory, Office, Secondary, Shipping, Warehouse | **P** | Party types + addresses; not identical Fresa type enum |
| Categories: Client, Agent, Airline, Bank, Broker, Buyer, Carrier, CFS, Clearing, Co-Loader… | **D** / **P** | Party type catalog covers most |
| Branch / Currency / Payment terms | **D** | |
| Auto Debtors/Creditors via COA name | **P** | COA + parties exist; auto-map on create **thin** |
| Excel download of organization list | **D** | Party CSV export |
| Change status (Active / Invalid / Block) | **D** / **P** | Soft-delete / status fields |
| **Special tab — Address** | **D** | |
| **Special tab — Contacts** (+ multi email update) | **D** / **P** | Contacts Done; bulk multi-email UX **N** |
| **Special tab — Accounts (COA mapping)** | **P** | GL exists; per-party AR/AP account link **thin** |
| **Special tab — Bank** (IFSC/IBAN/SWIFT…) | **D** / **P** | Party bank details; depth varies |
| **Special tab — Standard Charges** (pull into job costing) | **N** / **P** | Charge codes + tariffs exist; **party default charge templates** Missing |
| **Special tab — Employee / salesman map** | **P** | Salesperson on party/job; Fresa employee-tab UX **N** |
| **Special tab — Exchange Rate** (client-specific rates) | **N** / **P** | Tenant FX rates Done; **per-party rates** Missing |
| **Special tab — EDI Setup** (EDI type/code) | **N** | Week 21 EDI |
| Logo upload on organization | **P** | Org logo Partial |

**Gaps to add (org/party residual):** party standard charges; party-specific FX; party↔COA auto debtors/creditors; party EDI codes; richer block/invalid status UX.

---

### A.3 FCL Export Console (manual Ch.5) — feature map

| Fresa feature | Status | Evidence / gap |
|---------------|--------|----------------|
| All Shipments list + column filters | **D** / **P** | `GET /jobs` + search; Fresa column pack (P.Sale/P.Cost/P.GP/Submaster…) **P** |
| Date-range presets (This Week, Last 2 Months, Next Week…) | **P** | Date filters exist; named presets are mostly **F** |
| Create New Shipment (booking) | **D** | `POST /jobs` `SEA_FCL_EXPORT` |
| Edit shipment details (parties, ports, vessel/voyage, ETD/ETA, BL nos…) | **D** | `PATCH /jobs/:id/sea-fcl-details` |
| Containers / cargo / stuffing | **D** | Containers CRUD, cargo assign/split, stuffing records |
| VGM / SI submission + cutoffs | **D** | SI/VGM submit + cutoff traffic lights |
| House / master / sub-jobs | **D** | `parent_job_id`, house-jobs, sub-jobs, prorate |
| Document generation (HBL/MBL/FIATA/Switch/Proxy/B2B/Rider, SI, stuffing, sailing, transhipment, manifests, job card/P&L) | **D** | Week 8 document allowlist |
| Pre-alert / email docs | **D** | Pre-alert send/schedule |
| Sale / Cost booking on job | **D** | Job charges + provisional |
| Invoice from job | **D** | Invoices module |
| Payment request / purchase invoice | **D** | Weeks 10–11 |
| Job Profit Sheet / close job + P&L | **D** / **P** | `GET /jobs/:id/pnl`, JOB_PNL PDF, `POST /jobs/:id/close`; Fresa “close marks JOB_CLOSED milestone” **P** |
| Job Report icon (mail reports) | **P** | PDFs + email; Fresa report-wizard UX **F** |
| **Barcode scanning** (scan, view scanned, scanned report) | **N** | Only air `BARCODE_LABEL` PDF; **no sea scan console** |
| **KPI Data / Summary / Weekly Report** | **N** / **P** | Generic `gl/mis` KPIs; **no Fresa sea weekly KPI pack** |

---

### A.4 FCL Import Console (manual Ch.7) — feature map

| Fresa feature | Status | Evidence / gap |
|---------------|--------|----------------|
| All Shipments / Create / Edit | **D** | `SEA_FCL_IMPORT` |
| View/Edit Job Details (MBL) | **D** | Sea FCL details + BL model |
| **Add Shipment** under MBL | **P** | Create house with `parent_job_id`; **no Fresa-named add-shipment API** |
| **Detach Shipment** from MBL | **N** | No dedicated detach endpoint |
| Sale / Cost / Invoice / PR / Purchase Invoice / Profit Sheet | **D** | Shared finance on jobs |
| Cargo Arrival Notice (CAN) | **D** | Pre-CAN / CAN PDFs + send |
| Delivery Order (DO) | **D** | DO PDF + milestone |
| Free days / demurrage / detention | **D** | Free-days APIs + daily cron |
| Customs deposit / status | **D** | Deposits + customs status |
| POD / part delivery / damage | **D** | |
| Transhipment link / CFS storage | **D** | |
| Close job + P&L | **D** / **P** | Same as export |
| Barcode scan + reports | **N** | |
| Import document pack (Exchange/Undertake/Transport request/Shipping advice…) | **D** | Week 9 allowlist |

---

### A.5 LCL Export + LCL Import Consoles (manual Ch.4 + Ch.6) — feature map

| Fresa feature | Status | Plan |
|---------------|--------|------|
| Entire LCL Export console (list/create/edit/docs/close/P&L) | **N** | **Week 18** |
| Entire LCL Import console | **N** | **Week 18** |
| LCL house/master consolidation + cost prorate | **N** (FCL patterns reusable) | Week 18 LOCKED |
| LCL document set (~14 export + ~11 import) | **N** | Week 18 |
| CFS storage per LCL consignment | **N** / **OPEN** | Week 18 (link WMS Week 17 or job charges) |
| LCL barcode scan + KPI weekly | **N** | Week 18 + residual sea KPI gap |
| LCL Add/Detach shipment on import MBL | **N** | Week 18 (implement with FCL detach too) |

`JobType` already includes `SEA_LCL_EXPORT` / `SEA_LCL_IMPORT` and job-number prefixes `LE`/`LI` — **schema stub only**.

---

### A.6 Cross-cutting sea features (all four consoles)

| Feature | FCL Ex | FCL Im | LCL Ex | LCL Im |
|---------|--------|--------|--------|--------|
| Shipment CRUD + filters | **D** | **D** | **N** | **N** |
| Containers / stuffing / VGM-SI | **D** | **D** (import-focused ops) | **N** | **N** |
| BL / HBL-MBL documents | **D** | **D** (import docs) | **N** | **N** |
| Sale/Cost + invoice + PR + PI | **D** | **D** | **N** | **N** |
| Job P&L + close | **D/P** | **D/P** | **N** | **N** |
| CAN / DO | — | **D** | — | **N** |
| Add/Detach under MBL | **P** | **P/N** | **N** | **N** |
| Barcode scan console | **N** | **N** | **N** | **N** |
| KPI Data/Summary/Weekly | **N/P** | **N/P** | **N** | **N** |

---

### A.7 Full 28-week plan vs Fresa (complete product) — current status

| Week | Title | Status | Missing vs Fresa / plan |
|------|-------|--------|-------------------------|
| 0–12 | Foundation → Phase 1 finance/MIS | **Done** | Residual: 25+ invoice format catalog depth, some approval matrices, charge→GL map polish |
| 13 | Customer Portal | **Done** | Online payment gateway deferred |
| 14 | Vendor Portal + CRM | **Done** | WhatsApp CRM deferred |
| 15 | Air Import | **Done** | UI deferred |
| 16 | HR | **Done** | UI deferred |
| **17** | **WMS** | **Done** | GRN/GDO, FIFO/LIFO, stock, storage DRAFT invoice, ASN, low-stock cron |
| **18** | **Sea LCL Ex+Im** | **Done** | House/master consolidation, milestones, documents, CFS storage |
| **19** | Land + Courier | **Done** | LandJobDetail, CourierJobDetail, transport requests, courier vendors |
| **20 / 20B** | NVOCC | **Not started** | Voyages, space, NVOCC HBL, voyage P&L |
| **21** | Admin / EDI / Public API / Stripe | **Not started** | EDI gateways, `/api/v1`, webhooks, Stripe SaaS, Ch.2 settings depth |
| 22–23 | Performance / OWASP | **Not started** | Non-functional |
| 24–26 | Integration test / UAT | **Not started** | Process |
| 27–28 | Infra / go-live | **Not started** | Hosting decision OPEN |
| — | Mobile Sales App (Ch.26) | **Deferred** | Explicitly out of 28-week backend path |
| — | General Trading bridge | **Research only** | See `docs/GENERAL_TRADING_PLAN.md` — not Fresa sea |

---

### A.8 Must-not-miss backlog (append to execution plan)

Items below are **Fresa Sea Freight manual features still missing or thin**, ordered for KingFisher delivery. Items already scheduled keep their week; residuals are called out explicitly.

#### Priority 1 — Week 18 (Sea LCL) — **critical Fresa parity**

1. `SeaLclJobDetail` (or equivalent) + seed milestones for `SEA_LCL_EXPORT` / `SEA_LCL_IMPORT`.  
2. LCL Export console APIs: list/create/edit shipment, house/master consolidation, prorate costs.  
3. LCL Import console APIs: MBL job, houses, CFS/storage charges.  
4. LCL document allowlists (~14 export + ~11 import) via existing PDF queue.  
5. **Add/Detach shipment** APIs for import MBL (implement for **FCL + LCL** so Fresa Ch.6/7 parity is complete).  
6. Job close → ensure closed milestone / P&L freeze matches Fresa close-job behaviour.

#### Priority 2 — Sea residuals (schedule with Week 18 or a small residual sprint)

7. **Barcode Sea console:** ingest scan events, view scanned details, scanned report (Fresa 4.3 / 5.3 / 6.7 / 7.7). Extend barcode labels to sea allowlists where needed.  
8. **Sea KPI pack:** KPI Data, KPI Summary, KPI Weekly Report filtered by sea job type / branch / lane (beyond generic MIS).  
9. Dedicated **Arrival Notice** route if distinct from CAN (allowlist has `ARRIVAL_NOTICE`; controller coverage thin).  
10. Optional **VGM PDF** document endpoint (ops VGM submit exists; Fresa often prints VGM).

#### Priority 3 — Organization / Party depth (can split across Week 21 + polish)

11. Party **Standard Charges** tab → auto-pull into job costing.  
12. Party-specific **exchange rates**.  
13. Party **EDI codes** (feeds Week 21 EDI).  
14. Stronger party↔**COA debtors/creditors** auto-map on create.  

#### Priority 4 — Already on the 28-week plan (do not drop)

15. Week 17 WMS (needed if LCL CFS storage links to warehouse).  
16. Week 19 Land + Courier.  
17. Week 20/20B NVOCC.  
18. Week 21 EDI (MPCI, Dubai eDO, Bayan, CCN, IAL, …) + public API + Stripe.  
19. Weeks 22–28 performance, security, UAT, go-live.  

#### Priority 5 — Explicit non-goals / deferred (document so they are not “forgotten”)

20. Fresa **desktop UI** menu/dashboard widgets → frontend program, not Nest week.  
21. **Mobile Sales App** (Ch.26) → deferred.  
22. Customer **payment gateway** → deferred.  
23. Live WhatsApp Business CRM → stub only until consented.  
24. **General Trading** external invoices/quotes → optional later (`docs/GENERAL_TRADING_PLAN.md`).

---

### A.9 Headline verdict

| Band | Verdict |
|------|---------|
| **Fresa Sea FCL Export/Import** | **Mostly Done** in backend (~85–90%). Gaps: barcode scan console, sea-specific weekly KPI, MBL detach, a few doc/route edges. |
| **Fresa Sea LCL Export/Import** | **Missing** (~5% stub). This is the largest sea-parity hole → **Week 18**. |
| **Fresa Organization Master special tabs** | **Partial**. Core party Done; standard charges / party FX / EDI codes Missing. |
| **KingFisher extras beyond Fresa Sea manual** | Multi-tenant SaaS, full finance/GL/MIS, portals, CRM, Air Ex/Im, HR — **shipped or planned**; not in the Sea Freight PDF but part of the Complete Spec / 28-week plan. |
| **Overall vs “miss nothing from Fresa Sea”** | FCL path is strong; **LCL + barcode KPI + party standard charges** must be finished to claim sea-manual parity. |

---

### A.10 Related docs

- 28-week table (this file, top)  
- `docs/decision.md` §4 (Weeks 15–28 decisions)  
- `docs/flow.md` §9 (future week flows)  
- `docs/Fresa-Feature-Specification-Coverage-Report.md` (full 28-chapter spec — note: some chapter % there may lag Weeks 11–16 ships; prefer this appendix + code for sea)  
- `docs/GENERAL_TRADING_PLAN.md` (non-Fresa side requirement)

*End of Appendix A — Fresa Sea Freight gap analysis.*
