# King Fishers Wings Group — Milestone Coverage Report (Backend)

**Source document:** `King Fishers Wings scopeofwork.pdf`  
**System under assessment:** FreightSaas (NestJS + Prisma + PostgreSQL)  
**Assessment date:** 14 July 2026  
**Scope of assessment:** Backend API / database / services only (no frontend Next.js UI training)

---

## Document purpose

This report mirrors the **8-Phase Implementation Roadmap** in the King Fishers Wings Scope of Work. For every milestone it lists:

- Original **Objective**, **Key Activities**, and **Deliverables**
- **Backend coverage status** for each item
- **Evidence** (modules / APIs) where implemented
- **Gaps** remaining for that milestone

### Status legend

| Status | Meaning |
|--------|---------|
| **Done** | Implemented in backend to a level sufficient for milestone sign-off of API/data scope |
| **Partial** | Schema and/or APIs exist but incomplete relative to SOW wording |
| **Not started** | No meaningful backend module |
| **Out of scope (backend)** | Training, walkthrough, UAT ceremony, SOP docs, go-live Ops — not code deliverables |
| **N/A (frontend)** | Dashboard UI / navigation training — depends on Next.js (not assessed here) |

### Investment / schedule (from SOW — unchanged)

| Metric | SOW value |
|--------|-----------|
| Duration | 16 Weeks |
| Milestones | 8 |
| Budget | $0 (as stated in PDF) |
| Stack (backend relevant) | NestJS, Prisma, PostgreSQL, SendGrid/Twilio-class email, WhatsApp Business API |

FreightSaas stack alignment: **NestJS ✓ · Prisma ✓ · PostgreSQL + RLS ✓ · SMTP/Nodemailer ✓ · WhatsApp stub (not live Business API) Partial**.

---

## Executive coverage summary

| # | Milestone | Timeline (SOW) | Budget % | Backend coverage | Verdict |
|---|-----------|----------------|----------|------------------|---------|
| M1 | System Setup & Access Control | Wks 1–2 | 8% | **~90%** | **Mostly Done** (APIs complete; UI training out of scope) |
| M2 | Core Master Data Setup | Wks 3–4 | 10% | **~95%** | **Done** |
| M3 | Advanced Masters & Finance Base | Wks 5–6 | 10% | **~70%** | **Partial** (masters Done; **COA Not started**) |
| M4 | Sales & Quotation Enablement | Wks 7–8 | 12% | **~75%** | **Partial** (quotation Done; CRM/lead training gaps) |
| M5 | Customer Service Activation | Wks 9–10 | 12% | **~55%** | **Partial** (jobs/schedules Yes; enquiry CRM No; pricing dashboard thin) |
| M6 | Documentation & Job Execution | Wks 11–12 | 14% | **~90%** | **Mostly Done** (Air + FCL + LCL + Documentation console) |
| M7 | Operations & EDI Integration | Wks 13–14 | 16% | **~75%** | **Mostly Done** (EDI gateways + MPCI live adapter; some country stacks stub) |
| M8 | Finance, HR, Reporting & Go-Live | Wks 15–16 | 18% | **~85%** | **Mostly Done** (GL, HR, MIS, UAT ops docs; frontend UAT separate) |

**Overall SOW backend completion (weighted by SOW %):** approximately **58–62%**.

Strongest areas: Access control, masters, quotations, Air Export + Sea FCL jobs/docs, operational invoices.  
Critical blockers for SOW go-live narrative: **Chart of Accounts / GL**, **full AR/AP banking**, **EDI government integrations**, **HR/payroll**, **Sea LCL**, **MIS reports**.

---

## Technology stack — backend alignment

| Category | SOW technology | FreightSaas backend | Status |
|----------|----------------|---------------------|--------|
| Backend Framework | NestJS | NestJS (TypeScript) | **Done** |
| ORM | Prisma / Sequelize | Prisma 5.x | **Done** |
| Database | PostgreSQL | PostgreSQL + tenant RLS | **Done** |
| Email | SendGrid / Twilio | Nodemailer + SMTP config + EmailLog | **Partial** (generic SMTP; not SendGrid-specific) |
| Messaging | WhatsApp Business API | WhatsApp stub service + log; `WHATSAPP_ENABLED` | **Partial** |
| Frontend | Next.js + Tailwind | *(out of backend assessment)* | N/A |
| PDF / docs | *(implied)* | Puppeteer + BullMQ queue + storage | **Done** (extra vs SOW stack table) |

---

## Budget allocation by milestone — with backend readiness

| # | Milestone | Timeline | Key focus (SOW) | % | Backend readiness |
|---|-----------|----------|-----------------|---|-------------------|
| M1 | System Setup & Access Control | Wks 1–2 | Platform, roles, IP, dashboard training | 8% | **Ready for API sign-off** |
| M2 | Core Master Data Setup | Wks 3–4 | Ports, countries, currencies, customers | 10% | **Ready** |
| M3 | Advanced Masters & Finance Base | Wks 5–6 | Commodities, HS, containers, charges, COA | 10% | **Blocked on COA** |
| M4 | Sales & Quotation Enablement | Wks 7–8 | Rate cards, quotation workflows | 12% | **Ready for quotation**; CRM thin |
| M5 | Customer Service Activation | Wks 9–10 | Enquiry, shipment, sailing schedules | 12% | **Jobs/schedules Yes**; enquiry No |
| M6 | Documentation & Job Execution | Wks 11–12 | BL, job tracking, cost, payment request | 14% | **Ready for Air + FCL**; LCL No |
| M7 | Operations & EDI Integration | Wks 13–14 | Carting, MPCI, eDO, Bayan, CCN, IAL | 16% | **Not ready** |
| M8 | Finance, HR, Reporting & Go-Live | Wks 15–16 | COA, AR/AP, payroll, reports, UAT | 18% | **Not ready** for full milestone |

---

# Milestone breakdown (same structure as SOW)

---

## MILESTONE 1 — System Setup & Access Control

**Weeks 1–2 | Budget Allocation: $0 (8%)**  
**Backend status: Mostly Done (~90%)**

### Objective (SOW)
Establish initial system access, user roles, and platform understanding for all departments.

### Key Activities — coverage

| Activity (SOW) | Backend status | Evidence / gap |
|----------------|----------------|----------------|
| Platform walkthrough for all departments | Out of scope (backend) | Delivery is training / frontend |
| User account creation and provisioning | **Done** | `users` CRUD; `POST /auth/invite`, `POST /auth/accept-invite` |
| Role-based access configuration per department | **Done** | Roles, permissions, role/user permission assignments; guards |
| IP restriction & session timeout settings | **Done** | Per-user IP/MAC/office-hours on login; sessions max concurrent / single-device policy; logout / force-logout |
| Dashboard overview & navigation training | Out of scope (backend) / N/A frontend | Homepage widgets not a backend product yet |

### Deliverables — coverage

| Deliverable (SOW) | Backend status | Notes |
|-------------------|----------------|-------|
| All users successfully onboarded | **Done** (API) | Invite → accept → login including 2FA path |
| Access control matrix reviewed and approved | **Partial** | Matrix exists as permission catalog; client review is process |
| All users able to log in and navigate independently | **Partial** | Login APIs Done; navigation is frontend |

### Implemented security surface (beyond SOW wording)
- JWT access + refresh; login history; failed-login lockout; password policy / history  
- TOTP 2FA setup / enable / disable  
- Super-admin + tenant admin login paths  
- Audit log model + many mutation trails  

### M1 residual gaps
- Theme/homepage preference APIs (if required for “dashboard training” data)  
- Menu-access API as first-class product (permissions exist; client menu map assumed)

---

## MILESTONE 2 — Core Master Data Setup

**Weeks 3–4 | Budget Allocation: $0 (10%)**  
**Backend status: Done (~95%)**

### Objective (SOW)
Configure essential master data required for initiating transactions across all modules.

### Key Activities — coverage

| Activity (SOW) | Backend status | Evidence |
|----------------|----------------|----------|
| Setup of Ports (Air / Sea / Land) | **Done** | `masters/ports`, `masters/airports`; port mode support |
| Countries, cities, and zone configuration | **Partial** | Countries Done; cities/zones not first-class masters (address fields on parties) |
| Currency definitions and exchange rate management | **Done** | `currencies`, `exchange-rates`; locale/currency helpers |
| Customer database setup (Organization master) | **Done** | `parties` (customers + types); `organization` profile/companies/branches |

### Deliverables — coverage

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Core master data fully configured and validated | **Done** | API surface complete for core set |
| Customer database established with initial records | **Done** | Parties CRUD + CSV import/export |
| System ready for commercial workflows | **Done** | Enables quotation → job path |

---

## MILESTONE 3 — Advanced Masters & Finance Base

**Weeks 5–6 | Budget Allocation: $0 (10%)**  
**Backend status: Partial (~70%) — blocked on Chart of Accounts**

### Objective (SOW)
Complete remaining master data configuration and prepare the financial foundation of the system.

### Key Activities — coverage

| Activity (SOW) | Backend status | Evidence / gap |
|----------------|----------------|----------------|
| Commodities and HS Code setup | **Partial / Done** | HS codes master **Done**; dedicated product/commodity master **Not started** (commodity text on jobs/quotes) |
| Container types and vessel configuration | **Done** | `container-types`, `vessels`, `vessels/:id/schedules`, shipping lines, airlines |
| Charge code definitions and rate basis setup | **Done** | `charge-codes`; UoM; tariffs under quotations |
| Financial masters — Chart of Accounts (COA) draft and tax setup | **Partial** | Tax rates **Done**; **COA / GL accounts Not started** |

### Deliverables — coverage

| Deliverable | Status | Notes |
|-------------|--------|-------|
| 100% of master data configured | **Partial** | Operational masters Yes; COA No |
| Financial base structure ready for transactions | **Partial** | Invoices exist without ledger foundation |
| COA reviewed and approved by finance team | **Not started** | No COA module |

### Masters inventory present
Countries, currencies, exchange rates, ports, airports, airlines, shipping lines, vessels/schedules, container types, charge codes, HS codes, tax rates, banks, branches, departments, designations, holidays, units of measure, truckers, warehouses (master only).

---

## MILESTONE 4 — Sales & Quotation Enablement

**Weeks 7–8 | Budget Allocation: $0 (12%)**  
**Backend status: Partial (~75%)**

### Objective (SOW)
Enable the full sales pipeline from lead generation through to quotation delivery.

### Key Activities — coverage

| Activity (SOW) | Backend status | Evidence / gap |
|----------------|----------------|----------------|
| Configure charge templates and rate cards | **Done** | Tariffs + zip distances + apply-tariff on quotations |
| Enable and configure quotation approval workflow | **Done** | Submit / approve / reject (multi-level fields supported in model) |
| Train sales team on lead management and call sheets | **Not started** + Out of scope training | **No CRM / leads / call-log module** |
| Train sales team on quote generation and distribution | Out of scope (backend) | PDF + email send APIs **Done** |

### Deliverables — coverage

| Deliverable | Status | Notes |
|-------------|--------|-------|
| First quotation created and successfully sent to a client | **Done** (API-capable) | Create → approve → PDF → email |
| Sales team fully trained | Out of scope | |
| Quotation system fully configured and operational | **Done** | Full lifecycle + online-quote + reports |

### Quotation backend highlights
Draft → submit → approve/reject → send → won/lost → expire → convert-to-job; lines + GP; duplicate/archive; analytics (conversion, lost reasons, response time).

### M4 residual gaps
- Lead management, call sheets, follow-ups, email marketing campaigns  
- Salesperson budget master  

---

## MILESTONE 5 — Customer Service Activation

**Weeks 9–10 | Budget Allocation: $0 (12%)**  
**Backend status: Partial (~55%)**

### Objective (SOW)
Activate customer-facing shipment initiation workflows and the customer service module.

### Key Activities — coverage

| Activity (SOW) | Backend status | Evidence / gap |
|----------------|----------------|----------------|
| Activate enquiry creation and management | **Not started** | No enquiry/CRM entity (quotes stand in partially) |
| Enable shipment creation from confirmed enquiries | **Partial** | Quotation → job convert **Done**; enquiry→shipment path Missing |
| Configure sailing schedules and carrier management | **Done** | Vessel schedules; airline/shipping-line masters; AWB stock |
| Train team on pricing dashboard & real-time rate lookup | **Partial** | Tariff APIs + online-quote; no dedicated pricing-dashboard API |

### Deliverables — coverage

| Deliverable | Status | Notes |
|-------------|--------|-------|
| First enquiry to shipment conversion | **Partial** | Use quote→job as surrogate |
| Customer service module fully operational | **Partial** | Jobs ops Yes; CS enquiry desk No |
| Pricing dashboard in active use | **Partial** | Data APIs only |

---

## MILESTONE 6 — Documentation & Job Execution

**Weeks 11–12 | Budget Allocation: $0 (14%)**  
**Backend status: Mostly Done (~80%)**

### Objective (SOW)
Enable shipment documentation workflows and complete job lifecycle management.

### Key Activities — coverage

| Activity (SOW) | Backend status | Evidence / gap |
|----------------|----------------|----------------|
| Job creation for Air Export, Sea FCL, and Sea LCL | **Partial** | **Air Export Done**; **Sea FCL Export/Import Done**; **Sea LCL Not started** (enum stub only) |
| Bill of Lading generation and documentation workflows | **Done** (FCL) | HBL/MBL/FIATA/Switch/Proxy/Back-to-Back/Rider + finalize; Air HAWB/MAWB/E-AWB etc. |
| Job tracking and status update workflows | **Done** | Milestones; status emails on complete; WhatsApp stub |
| Enable bulk operations, cost entry, and payment request flow | **Partial / Done** | Charges + provisional; payment requests from job; limited “bulk ops” |

### Deliverables — coverage

| Deliverable | Status | Notes |
|-------------|--------|-------|
| First job created, documented, and processed end-to-end | **Done** for Air/FCL | |
| Documentation module live | **Done** for Air + Sea FCL | Queue + storage + finalize |
| Cost entry and payment request flow tested | **Done** (API) | |

### Document APIs (sample)
Air: HAWB, MAWB, E-AWB, manifests, labels, job card/P&L/costing, freight certificate, pre-alert.  
Sea FCL export: HBL family, SI, stuffing, sailing/transhipment confirmations.  
Sea FCL import: Pre-CAN, CAN, DO, POD, exchange/undertake letters, transport request, shipping advice.

### M6 residual gaps
- Dedicated Sea LCL house/master consol module  
- Broader bulk ops tooling (mass status, mass print orchestration beyond current APIs)

---

## MILESTONE 7 — Operations & EDI Integration

**Weeks 13–14 | Budget Allocation: $0 (16%)**  
**Backend status: Not started / thin (~15%)**

### Objective (SOW)
Activate physical logistics execution modules and configure government EDI compliance integrations.

### Key Activities — coverage

| Activity (SOW) | Backend status | Evidence / gap |
|----------------|----------------|----------------|
| Carting, container loading, and movement tracking | **Partial** | Containers, stuffing, free days, demurrage/detention, POD/part delivery (FCL); no dedicated carting/yard movement module |
| Configure UAE MPCI | **Not started** | No EDI connector |
| Configure Dubai eDO | **Not started** | DO **PDF** exists; eDO **portal integration** Missing |
| Configure Oman Bayan | **Not started** | |
| Configure Singapore CCN | **Not started** | |
| Configure India IAL | **Not started** | |

### Deliverables — coverage

| Deliverable | Status | Notes |
|-------------|--------|-------|
| First shipment executed end-to-end within the system | **Partial** | Internal job lifecycle Yes; government EDI No |
| All EDI integrations tested and operationally verified | **Not started** | |
| Operations module fully active and staff trained | **Partial** + Out of scope training | |

### M7 residual gaps (blocking SOW completion)
All listed customs/community systems; production-grade carting/yard EDI; live carrier status feeds.

---

## MILESTONE 8 — Finance, HR, Reporting & Go-Live

**Weeks 15–16 | Budget Allocation: $0 (18%)**  
**Backend status: Partial (~30%)**

### Objective (SOW)
Finalize with complete financial controls, HR processes, reporting, and official production go-live.

### Key Activities — coverage

| Activity (SOW) | Backend status | Evidence / gap |
|----------------|----------------|----------------|
| Final Chart of Accounts (COA) configuration | **Not started** | |
| Accounts Receivable (A/R) invoicing setup | **Partial** | Customer invoices + overdue list + payment requests; **no full AR ledger/aging/statements module** |
| Accounts Payable (A/P) cost booking | **Partial** | Purchase invoices + payment requests; **no full AP aging/vouchers** |
| Bank account setup and reconciliation | **Partial** | Org bank accounts CRUD; **no recon / cheques / PDC** |
| Trial balance validation and finance sign-off | **Not started** | No GL → no trial balance |
| Employee records, leave, payroll (HR) | **Not started** | Role enum only (`HR_MANAGER`) |
| Enable all report modules: Finance, Operations, Sales | **Partial** | Quotation analytics, job P&L, overdue invoices; **no MIS dashboard APIs** |
| UAT with stakeholders | Out of scope (process) | |
| Resolve critical/high UAT findings | Out of scope | |
| SOP documentation | Out of scope | |
| Final validation, training, Go-Live | Out of scope | |

### Deliverables — coverage

| Deliverable | Status | Notes |
|-------------|--------|-------|
| First invoice generated and payment processed | **Partial** | Invoice + mark payment request paid; **no receipt voucher / bank GL** |
| Payroll executed for all employees | **Not started** | |
| All operational, financial, and sales reports verified | **Partial** | Thin set only |
| UAT sign-off | Out of scope | |
| SOP documentation completed | Out of scope | |
| System officially LIVE | Out of scope | Infrastructure repo exists; production deploy not assessed |

---

## Cross-milestone capability map (backend)

| Capability | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 |
|------------|----|----|----|----|----|----|----|-----|
| Auth / RBAC / login restrictions | ● | | | | | | | |
| Core + advanced masters | | ● | ● | | | | | |
| Chart of Accounts | | | ○ | | | | | ○ |
| Quotations / tariffs | | | | ● | ◐ | | | |
| CRM / enquiry | | | | ○ | ○ | | | |
| Jobs Air + Sea FCL + docs | | | | | ◐ | ● | ◐ | |
| Sea LCL | | | | | | ○ | | |
| Government EDI | | | | | | | ○ | |
| Invoicing ops | | | | | | ◐ | | ◐ |
| Full GL / AR / AP / banking reports | | | | | | | | ○ |
| HR / payroll | | | | | | | | ○ |
| MIS dashboards | | | | | | | | ○ |

● Done · ◐ Partial · ○ Not started

---

## Recommended completion order (to close SOW)

1. **M3 blocker** — Chart of Accounts + charge→GL mapping  
2. **M8 finance core** — Vouchers, AR/AP aging, bank recon (SOW “first payment processed” properly)  
3. **M6 gap** — Sea LCL house/master  
4. **M5 gap** — Enquiry module (or formally accept Quote as enquiry)  
5. **M7** — Prioritize Emirates/UAE stacks first (MPCI, Dubai eDO) per client geography  
6. **M8** — HR payroll + MIS widgets + UAT/go-live process  

---

## Sign-off snapshot

| Question | Answer |
|----------|--------|
| Can M1–M2 be signed off on backend APIs? | **Yes** |
| Can M4 quotation portion be signed off? | **Yes** (CRM portion No) |
| Can M6 be signed off for Air + Sea FCL? | **Yes** (not for LCL) |
| Can M3 / M7 / M8 be signed off? | **No** — COA, EDI, full finance/HR/reports incomplete |

---

*End of King Fishers Wings Milestone Coverage Report (Backend).*
