# Fresa Gold — Complete Feature Specification  
# Backend Coverage Report (FreightSaas)

**Source document:** `FreightSaaS_Fresa_Complete_Feature_Specification (1).pdf` (71 pages)  
**System under assessment:** FreightSaas NestJS backend (`d:\FreightSaas`)  
**Assessment date:** 14 July 2026  
**Assessment scope:** Backend APIs, Prisma schema, shared services (PDF/email/queue/storage). Frontend UI is noted only where the spec is UI-only.

This report follows the **same chapter order and section numbering** as the Fresa Gold Complete Feature Specification. Under each section, every major feature/table from the source is listed with a coverage status.

---

## Status legend

| Status | Code | Meaning |
|--------|------|---------|
| Done | **D** | Implemented in backend at usable feature depth |
| Partial | **P** | Some fields/APIs exist; missing major sub-features from the spec |
| Schema only | **S** | Enum/column/role exists; no dedicated module APIs |
| Not started | **N** | Absent from backend |
| Frontend / process | **F** | Spec item is UI, training, or operational process — not backend |

---

## Executive coverage dashboard (by chapter)

| Ch. | Module / Section | Approx. coverage | Status |
|-----|------------------|------------------|--------|
| 1 | Platform Overview & Architecture | ~70% | **Partial** — multi-tenant SaaS Yes; full module map Incomplete |
| 2 | General Settings & System Configuration | ~35% | **Partial** — number formats Yes; themes/homepages/approvals matrix thin |
| 3 | Access Control & Security | ~90% | **Mostly Done** |
| 4 | Master Data Management | ~85% | **Mostly Done** — product/commodity & COA link Missing |
| 5 | Search & Navigation | ~60% | **Partial** — strong job/party/invoice search; voucher/WMS params N/A |
| 6 | Sales & CRM | ~5% | **Not started** |
| 7 | Quotation Module | ~90% | **Done** |
| 8 | Air Export Operations | ~90% | **Done** |
| 9 | Air Import Operations | ~85% | **Done** (backend APIs, PDFs, crons; no UI) |
| 10 | Sea FCL Export | ~90% | **Done** |
| 11 | Sea FCL Import | ~90% | **Done** |
| 12 | Sea LCL Export | ~5% | **Not started** |
| 13 | Sea LCL Import | ~5% | **Not started** |
| 14 | Land / Trucking | ~10% | **Schema/master only** |
| 15 | Courier | ~5% | **Not started** |
| 16 | Documentation & Document Generation | ~75% | **Mostly Done** for Air+FCL; LCL/land/courier docs Missing |
| 17 | Accounting — GL & Vouchers | ~0% | **Not started** |
| 18 | Accounting — Invoicing & Credit Notes | ~65% | **Partial** — core invoices Yes; 25+ formats / e-invoice / debit note thin |
| 19 | Accounting — AR, AP & Banking | ~20% | **Partial** — bank master + payment request; no AR/AP ledgers/recon/CCP/VPP |
| 20 | Accounting — Financial Reports | ~10% | **Not started** (job P&L only) |
| 21 | HR Module | ~90% | **Done** (backend) — employee, leave, payroll/WPS, loans, timesheets, evals, letters |
| 22 | Warehouse Management (WMS) | ~5% | **Warehouse master only** |
| 23 | MIS Reports & Dashboards | ~15% | **Partial** — quote analytics; no management dashboard |
| 24 | Customer & Vendor Portals | ~5% | **Flag only** (`portal_access`) |
| 25 | EDI, API & Integration | ~20% | **Partial** — SMTP, PDF queue, WhatsApp stub, online-quote; no EDI gateways |
| 26 | Mobile App — Fresa Sales App | ~0% | **Not started** |
| 27 | System Administration | ~55% | **Partial** |
| 28 | SaaS Implementation Guide | ~60% | **Partial** — multi-tenant RLS Yes; Stripe/billing/public API Missing |

### Headline estimate

| Band | Chapters | Est. backend % of full Fresa Gold surface |
|------|----------|-------------------------------------------|
| Strong | 3, 4, 7, 8, 10, 11, 21 (+ parts of 5, 16, 18) | Core forwarding Phase-1 path + HR |
| Thin / next | 2, 5, 9, 16 residual, 18–19, 23, 25, 27–28 | |
| Missing | 6, 12–15, 17, 20, 22, 24, 26 | |

**Rough overall backend feature coverage vs full 28-chapter spec: ~38–42%.**  
**Coverage of Phase-1 critical path (Auth → Masters → Quote → Air Export → Sea FCL Ex/Im → Ops Invoicing): ~80–85%.**

---

# Table of Contents (mirrored from source)

Same chapter list as the PDF — use section anchors below.

1. Platform Overview & Architecture  
2. General Settings & System Configuration  
3. Access Control & Security  
4. Master Data Management  
5. Search & Navigation  
6. Sales & CRM Module  
7. Quotation Module  
8. Air Export Operations  
9. Air Import Operations  
10. Sea FCL Export Operations  
11. Sea FCL Import Operations  
12. Sea LCL Export Operations  
13. Sea LCL Import Operations  
14. Land / Trucking Operations  
15. Courier Module  
16. Documentation & Document Generation  
17. Accounting — General Ledger & Vouchers  
18. Accounting — Invoicing & Credit Notes  
19. Accounting — AR, AP & Banking  
20. Accounting — Financial Reports  
21. HR Module  
22. Warehouse Management System (WMS)  
23. MIS Reports & Management Dashboards  
24. Customer & Vendor Portals  
25. EDI, API & Integration  
26. Mobile App — Fresa Sales App  
27. System Administration  
28. SaaS Implementation Guide  

---

# Chapter 1 — Platform Overview & Architecture

### 1.1 What is Fresa Gold?
FreightSaas targets the same domain (freight forwarding ERP SaaS). **D** as product intent.

### 1.2 Supported Business Types

| Business type | Status | Notes |
|---------------|--------|-------|
| Freight Forwarders (Air & Sea) | **D** | Air export + Sea FCL |
| NVOCC Operators | **S** | JobType enum only |
| IATA Cargo Agents | **P** | IATA/AWB stock Yes; agent portal No |
| CFS / CFS Operators | **P** | Party type + CFS calc on FCL import |
| Customs Brokers | **S** | Party type |
| Consolidators (LCL) | **N** | |
| 3PL / Warehouse Operators | **S** | Warehouse master only |
| Transporters & Trucking | **P** | Trucker master; land jobs stub |
| Courier Companies | **N** | |
| Import / Export Houses | **P** | As party/customer |
| Multi-branch Group Companies | **D** | Companies + branches + tenant |

### 1.3 Core Architecture Pillars

| Pillar | Status | Evidence |
|--------|--------|----------|
| Web-Based & Cloud-Native | **P** | Backend APIs; frontend separate |
| Multi-Company / Multi-Branch | **D** | |
| Multi-Currency | **D** | Currencies + exchange rates (+ fields on docs) |
| Multi-Mode Transport | **P** | Air Export + Sea FCL Ex/Im deep; other modes stub |
| Integrated Finance | **N** | Jobs do **not** auto-post GL |
| Role-Based Access | **D** | |
| Enter Once, Reuse Everywhere | **D** | Party → quote → job → invoice |
| Real-Time Visibility | **P** | Job status APIs; no batch MIS layer |

### 1.4 Module Map

| Spec module | Backend |
|-------------|---------|
| Sales & CRM | **N** |
| Quotation | **D** |
| Air Export / Import | Export **D** · Import **N** |
| Sea FCL Export / Import | **D** |
| Sea LCL Export / Import | **N** |
| Land / Trucking | **S** |
| Courier | **N** |
| Documentation | **D** (Air+FCL) |
| Accounting & Finance | **P** (invoices only) |
| AR / AP | **P** |
| HR & Payroll | **N** |
| WMS | **S** |
| MIS / Management Reports | **P** |
| Customer / Vendor Portal | **S** |
| EDI & API Integration | **P** |

### 1.5 Technology Stack

| Spec (original Fresa) | FreightSaas recommendation in Ch.28 / actual | Status |
|-----------------------|-----------------------------------------------|--------|
| Proprietary backend | NestJS | **D** (modern SaaS stack) |
| Relational DB multi-tenant | PostgreSQL + RLS + `tenant_id` | **D** |
| PDF server-side | Puppeteer + BullMQ | **D** |
| Email | Nodemailer + EmailLog | **D** |
| Mobile app | — | **N** |
| xe.com rates | Exchange rate master (API fetch optional) | **P** |
| Stripe / SaaS billing | — | **N** |

---

# Chapter 2 — General Settings & System Configuration

### 2.1 User Interface Settings

| Feature | Status |
|---------|--------|
| Themes (Green/Blue/Red), full-screen | **F** / **N** |
| User-wise homepage & widgets (GP, Top 10, AR/AP, bookings…) | **N** |

### 2.2 Number Format Configuration

| Document type | Status |
|---------------|--------|
| Job, HBL, MBL, HAWB, MAWB, Quotation, Invoice | **D** (`organization/number-formats`) |
| Voucher, Booking, GRN, GDO, Purchase Invoice | **P** / **S** — enum/types may exist; full ops not wired |

### 2.3 Document Format Configuration
BL/HAWB/invoice layout variants, letterhead, stamp/signature: **P** — PDF templates exist; multi-layout catalog & stamp upload admin **thin**.

### 2.4 Language & Regional Settings
| Feature | Status |
|---------|--------|
| Google Translate / multi-language COA | **N** |
| Date / decimal config | **P** |
| VAT/GST multi-country (UAE/India/MY/KSA/Oman) | **P** — tax rates master; no statutory e-invoice portals |

### 2.5 Email Configuration

| Feature | Status |
|---------|--------|
| SMTP per company/branch | **P** — app SMTP config |
| Subject/body templates per document | **P** — coded/templates; full admin UI config thin |
| Auto-send on status change | **D** — milestone status emails |
| Pre-alert auto / schedule | **D** |
| Invoice email with PDF | **D** |
| Outstanding statement scheduled email | **N** |
| WhatsApp status updates | **P** — stub |
| Attachment defaults | **P** |

### 2.6 Workflow & Approval Configuration

| Workflow | Status |
|----------|--------|
| Quotation approval (up to 3 levels) | **D** / **P** |
| Payment request approval by amount | **P** — approve/reject exists; bracket rules thin |
| Credit note / purchase invoice / job closing / booking / discount / refund approvals | **P** / **N** |

**Chapter 2 overall: ~35% — Partial.**

---

# Chapter 3 — Access Control & Security

### 3.1 User Management

| Feature | Status |
|---------|--------|
| Create / edit / deactivate users | **D** |
| Department / branch assignment | **D** |
| Salesperson / CS / Ops / Finance flags | **D** |
| User-wise report / menu / financial visibility / document rights | **P** — financial visibility flags + permissions; menu/doc rights incomplete vs full matrix |
| User activity log | **P** — login history + audit log |

### 3.2 Login Security Features

| Feature | Status |
|---------|--------|
| IP restriction | **D** |
| MAC restriction | **D** |
| Office hours + timezone | **D** |
| Multi-login / max concurrent / single-device | **D** |
| Session timeout | **P** — sessions + logout; idle timeout largely client/JWT |
| Failed login lockout | **D** |
| Password policy | **D** |
| Two-Factor Authentication (TOTP) | **D** |
| Login audit log | **D** |
| Invite / accept-invite | **D** |

### 3.3 Menu & Feature Access Control
Permission catalog covering modules: **P** — RBAC Done; per-menu item productization Partial.

### 3.4 Financial Data Visibility Controls
Sales / Cost / GP / invoices / payments / bank / AR-AP / mgmt reports / job P&L flags: **D** (User `can_see_*` + permissions).

### 3.5 Document Rights
View / preview / download / email / edit draft / finalize / delete / reprint: **P** — finalize + generate + permission gates; full fine-grained matrix Partial.

### 3.6 Audit Trail
Create/edit/delete + login + email log + document generation tasks: **D** / **P**. Voucher posting log **N**.

**Chapter 3 overall: ~90% — Mostly Done.**

---

# Chapter 4 — Master Data Management

### 4.1 Organization & Company Master

| Area | Status |
|------|--------|
| Company profile, branches, address, tax reg, IATA/customs codes | **D** / **P** |
| Logo / stamp / signature images | **P** |
| Bank accounts per org | **D** |
| Document numbering prefix | **D** |
| Default currency / financial year | **P** |

### 4.2 Customer Master (Party)

| Section | Status |
|---------|--------|
| Basic info, types, addresses, contacts | **D** |
| Credit limit/days, credit status | **D** |
| Tax / bank / IATA / SCAC / tags | **D** / **P** |
| History (quotes, jobs, invoices, PRs, audit) | **D** |
| Attachments, portal access, marketing subscription | **P** / **S** |
| Follow-up notes / likes / preferences | **N** / **P** |
| CSV import / export | **D** |

### 4.3–4.8 Carrier, Port, Charge, Currency, HS, Container
All: **D** (airlines, shipping lines, ports, airports, charge codes, currencies+rates, HS, container types). Charge→GL account mapping: **N**.

### 4.9 Other Master Data

| Master | Status |
|--------|--------|
| Vessel + schedules | **D** |
| Airline | **D** |
| Trucker | **D** |
| CFS / customs broker | **S** as party types |
| Warehouse | **D** master only |
| Product / commodity | **N** |
| Department / designation / branch / bank / tax / holiday / UoM | **D** |
| Tariff templates | **D** under quotations |

**Chapter 4 overall: ~85% — Mostly Done.**

---

# Chapter 5 — Search & Navigation

### 5.1 Global Search Box

| Parameter | Status |
|-----------|--------|
| AWB / MAWB / HBL / MBL / job / quotation / container / invoice / party | **D** |
| Booking / BOE / shipping bill / voucher / cheque / receipt / truck / IGM / GRN / GDO / narration | **N** or **S** (no underlying modules) |
| ETD / ETA date range | **D** / **P** |

### 5.2 Advanced / Enhanced Search
Multi-filter on jobs/quotations/parties/invoices: **D**. Cross-module advanced panels: **P**.

### 5.3 Party-Wise Job History
Quotes, jobs, invoices, payment requests, audit: **D**. Payments/AR-AP outstanding/comms/CRM call logs: **P** / **N**.

**Chapter 5 overall: ~60% — Partial.**

---

# Chapter 6 — Sales & CRM Module

| Section | Status |
|---------|--------|
| 6.1 Overview | **N** |
| 6.2 Lead Management | **N** |
| 6.3 Call Sheet / Daily Call Log | **N** |
| 6.4 Enquiry Management | **N** |
| 6.5 Follow-up Management | **N** |
| 6.6 Email Marketing | **N** |
| 6.7 Salesperson Budget & Performance | **N** |
| 6.8 Sales Dashboard & Reports | **N** (quotation analytics only as substitute Partial) |

**Chapter 6 overall: ~5% — Not started.**

---

# Chapter 7 — Quotation Module

### 7.1 Quotation Creation
Service types, ports, cargo, currency, exchange rate, salesperson, validity, etc.: **D**.

### 7.2 Charge Lines
Revenue/cost, tax, GP live calc, supplier on cost: **D**.

### 7.3 Quotation Actions
Draft, submit, approve/reject, revise, send email, PDF, duplicate, convert to job, won/lost, archive, expire: **D**.

### 7.4 Quotation Formats
Customer vs internal PDF: **D**. Full 8+ mode-specific layout catalog: **P**.

### 7.5 Online Quotation
Public/online quote API: **D**.

### 7.6 Tariff Management
LCL/FCL/Air/Land/local/standard templates: **D** / **P** (tariff model supports lanes; depth vs every tariff type Partial).

### 7.7 Quotation Reports
List + conversion + lost reasons + response time + analytics: **D**.

**Chapter 7 overall: ~90% — Done.**

---

# Chapter 8 — Air Export Operations

### 8.1 Air Export Booking
Core fields (airports, airline, flight, weights, dims, DG flag, freight terms, refs): **D** via job + `AirJobDetail`.

### 8.2 Air Export House Job
HAWB, charges, provisional cost/sales, sub-jobs, prorate, P&L, pre-alert, payment request: **D**. CSV sub-job dimensions: **P**.

### 8.3 Air Export Master Job
Master/house hierarchy, MAWB, manifests, AWB stock usage, E-AWB doc: **D**. Weight discrepancy / airline billing depth: **P**.

### 8.4 Air Export — All Documents Generated

| Document | Status |
|----------|--------|
| HAWB / MAWB draft-original workflow | **D** (generate + finalize) |
| Cargo / Freight manifest | **D** |
| Shipping Instruction | **P** (sea SI strong; air SI thin) |
| Barcode / Consignee labels | **D** |
| Job Card / Job P&L / Proforma / Costing | **D** |
| Pre-Alert | **D** |
| Shipping Advice | **P** / via shared templates |
| Freight Certificate | **D** |
| E-AWB | **D** (PDF generation; not airline EDI submit) |

### 8.5 Air Export — Job Status Milestones
Pre/post-flight milestone set: **D**.

### 8.6 Air Export — Status Update Emails
Milestone auto emails + pre-alert: **D**. Full 7 named templates as independent config: **P**.

### 8.7 AWB Stock Management
Receipt ranges, allocate, used, void, transfer branch, low stock report/alert: **D**.

**Chapter 8 overall: ~90% — Done.**

---

# Chapter 9 — Air Import Operations

| Section | Status | Notes |
|---------|--------|-------|
| 9.1 Booking & job creation | **D** | `AIR_IMPORT` + extended `AirJobDetail`; 16 milestones seeded; quote convert |
| 9.2 Documents (Pre-CAN, CAN, DO, POD, etc.) | **D** | Per-job-type allowlist; air-shaped PDF payload; CAN/DO email + schedule |
| 9.3 Milestones | **D** | 16 seeded; auto-complete subset (booking, MAWB, CAN/DO, customs, POD) |
| 9.4 Special features (deposit, transhipment, storage, damage…) | **D** | Reuses FCL import child tables + air-only customs exams / storage invoice / transhipment |

**Chapter 9 overall: ~85% — Done (backend).** UI deferred.

---

# Chapter 10 — Sea FCL Export Operations

### 10.1 FCL Export Booking
Vessel/voyage, POL/POD, containers, seals, cutoffs (SI/VGM/CY), stuffing: **D**.

### 10.2 FCL Export — All Documents Generated

| Document | Status |
|----------|--------|
| Job Card / P&L / Cargo & Freight Manifest / Proforma / Pre-Alert | **D** |
| Stuffing Report / Surrender Notice / SI / Sailing / Transhipment Confirmation | **D** |
| Draft/Original HBL, Rider, FIATA, Switch, Proxy, Express Release, Back-to-Back, MBL | **D** |

### 10.3 FCL Export — Milestones
Full pre/post-departure set including SI/VGM/stuffing/sail/BL: **D**.

**Chapter 10 overall: ~90% — Done.**

---

# Chapter 11 — Sea FCL Import Operations

### 11.1 FCL Import Job Fields
MBL/HBL, vessels, containers, customs, free days, demurrage/detention: **D**.

### 11.2 FCL Import — All Documents Generated

| Document | Status |
|----------|--------|
| Pre-CAN, CAN, Exchange Letter, Undertake Letter | **D** |
| Delivery Order, Transport Request, Shipping Advice, POD | **D** |
| Job Card / P&L / Manifests / Proforma | **D** (shared generators) |

### 11.3 Special Features
Demurrage/detention, free days, deposits, part delivery, POD, damage, transhipment link, CFS storage: **D**. Container split multi-consignee: **P**. Daily demurrage cron: **D**.

**Chapter 11 overall: ~90% — Done.**

---

# Chapter 12 — Sea LCL Export Operations

| Section | Status |
|---------|--------|
| 12.1 LCL Export House Job | **N** |
| 12.2 LCL Export Master Job | **N** |
| 12.3 LCL Export Documents | **N** |

JobType `SEA_LCL_EXPORT` enum + job number prefix only (**S**).

**Chapter 12 overall: ~5% — Not started.**

---

# Chapter 13 — Sea LCL Import Operations

| Section | Status |
|---------|--------|
| 13.1 LCL Import Job | **N** |
| 13.2 LCL Import Documents | **N** |

**Chapter 13 overall: ~5% — Not started.**

---

# Chapter 14 — Land / Trucking Operations

| Section | Status |
|---------|--------|
| 14.1 Land Job Creation | **S** — JobType + trucker master |
| 14.2 Land Documents | **N** |
| 14.3 Transport Request Management | **P** — transport-request PDF exists in import context; no full land TR module |

**Chapter 14 overall: ~10% — Schema / partial.**

---

# Chapter 15 — Courier Module

| Section | Status |
|---------|--------|
| 15.1 Overview (booking, tracking, barcode, vendors) | **N** |
| 15.2 Documents | **N** (generic barcode label on air exists) |

**Chapter 15 overall: ~5% — Not started.**

---

# Chapter 16 — Documentation & Document Generation

### 16.1 Shipping Documents — Complete List

| Document family | Status |
|-----------------|--------|
| HAWB / MAWB / E-AWB | **D** (Air Export) |
| HBL / MBL / FIATA / Rider / Switch / Proxy / Back-to-Back / Express | **D** (Sea FCL Export) |
| Cargo / Freight Manifests | **D** |
| SI / Stuffing / Surrender / Sailing / Transhipment | **D** (FCL) |
| Pre-CAN / CAN / Exchange / Undertake / DO / Transport Request / POD / Shipping Advice | **D** (Sea FCL Import) |
| Barcode / Consignee labels | **D** |
| Freight Certificate | **D** |
| LCL-specific / Land / Courier specialized sets | **N** |
| Airline e-AWB **EDI submission** | **N** (PDF only) |

### 16.2 Financial Documents

| Document | Status |
|----------|--------|
| Job Card / Job P&L / Costing / Proforma | **D** |
| Customer Invoice / Purchase Invoice / Credit Note PDF | **D** / **P** |
| Debit Note / Receipt / Payment / Cheque / Outstanding / Aging statement / LPO | **N** / **P** |

### 16.3 Document Management Features
Attach to job, generation tasks, storage download: **P**. Soft docket, expiry alerts, share links: **N** / **P**.

### 16.4 Pre-Alert Email Configuration
To/subject/body, schedule, confirmation, resend: **D** / **P**. Pre-alert report: **P**.

**Chapter 16 overall: ~75% — Mostly Done (for implemented job modes).**

---

# Chapter 17 — Accounting — General Ledger & Vouchers

| Section | Status |
|---------|--------|
| 17.1 Chart of Accounts | **N** |
| 17.2 Voucher Types (JV, BPV, CPV, BRV, CRV, Contra, PI, PCN, Recurring, Opening) | **N** |
| 17.3 Voucher Features | **N** |
| 17.4 General Ledger Management | **N** |

**Chapter 17 overall: ~0% — Not started.**  
*(Highest priority finance gap after invoicing.)*

---

# Chapter 18 — Accounting — Invoicing & Credit Notes

### 18.1 Customer Invoice
Auto from job, lines, tax fields, post/send/cancel, PDF, email, payment status, overdue: **D**.  
Credit-limit warn, partial invoicing depth, India/KSA e-invoice portals, payment allocation to GL: **P** / **N**.

### 18.2 Invoice Format Variants (25+)
Configurable multi-layout catalog (IRN, ZATCA QR, GST, multi-currency layouts…): **P** — generator exists; not 25+ certified variants.

### 18.3 Credit Note & Debit Note
Credit notes create/post: **D**. Debit notes: **S** / **N**. Approval thresholds / GL impact: **P** / **N**.

### 18.4 Purchase Invoice & Purchase Credit Note
Purchase invoices CRUD + post: **D**. Purchase credit note / LPO / TDS / aging: **N** / **P**.

### 18.5 Payment Request
Create from job / standalone, approve/reject/mark-paid: **D**. Amount-bracket multi-level + voucher handoff: **P**.

**Chapter 18 overall: ~65% — Partial / operational core Done.**

---

# Chapter 19 — Accounting — AR, AP & Banking

| Section | Status |
|---------|--------|
| 19.1 Accounts Receivable (aging, statements, allocation, advances, write-off) | **P** — overdue invoices only |
| 19.2 Accounts Payable | **P** — purchase invoices; no AP aging module |
| 19.3 Bank Management (recon, cheques, PDC, transfers) | **P** — bank account master only |
| 19.4 Voucher Matching | **N** |
| 19.5 Customer Credit Portal (CCP) | **N** |
| 19.6 Vendor Payment Portal (VPP) | **N** |

**Chapter 19 overall: ~20% — Partial.**

---

# Chapter 20 — Accounting — Financial Reports

| Section | Status |
|---------|--------|
| 20.1 Trial Balance / Balance Sheet / P&L / Cash Flow / Group P&L | **N** |
| Job P&L / Sub-Job P&L | **D** / **P** |
| 20.2 Tax Reports (UAE/KSA/Oman VAT, India GST/TDS…) | **N** |
| 20.3 AR/AP Financial Reports | **P** (overdue) |
| 20.4 Banking & Cash Reports | **N** |
| 20.5 Fixed Asset Reports | **N** |

**Chapter 20 overall: ~10% — Not started (job P&L exception).**

---

# Chapter 21 — HR Module

| Section | Status |
|---------|--------|
| 21.1 Employee Master | **S** |
| 21.2 Document Expiry Alerts | **S** |
| 21.3 Leave Management | **S** |
| 21.4 Payroll (WPS, payslips, EOS gratuity) | **S** (backend; UI Phase 4) |
| 21.5 Loans & Advances | **S** |
| 21.6 Timesheet | **S** (manual attendance; biometric deferred) |
| 21.7 Performance Evaluation | **S** |
| 21.8 HR Documents & Letters | **S** |

**Chapter 21 overall: ~90% — Shipped (backend).** Self-service UI and biometric attendance remain out of scope.

---

# Chapter 22 — Warehouse Management System (WMS)

| Section | Status |
|---------|--------|
| 22.1 Overview | **N** |
| 22.2 GRN | **N** (enum type may exist) |
| 22.3 GDO | **N** |
| 22.4 Stock Management (FIFO/LIFO, transfers…) | **N** |
| 22.5 WMS Reports | **N** |
| 22.6 Storage Calculation & Invoicing | **P** — CFS storage calc on FCL import only |

Warehouse master: **D**.

**Chapter 22 overall: ~5% — Not started.**

---

# Chapter 23 — MIS Reports & Management Dashboards

| Section | Status |
|---------|--------|
| 23.1 Management Dashboard widgets (17) | **N** |
| 23.2 Profitability Reports (agent/client/salesman/airline/line/country…) | **N** |
| 23.3 Operational Reports | **P** — AWB low stock, overdue invoices, job lists via query APIs |
| 23.4 Report Builder — My Reports | **N** |
| 23.5 Export Options | **P** — PDF/CSV in places |

Quotation analytics endpoints: **D** (commercial MIS start).

**Chapter 23 overall: ~15% — Partial.**

---

# Chapter 24 — Customer & Vendor Portals

| Section | Status |
|---------|--------|
| 24.1 Customer Web Portal | **N** (`portal_access` flag **S**) |
| 24.2 Website Track & Trace Widget | **N** |
| 24.3 Vendor Payment Portal | **N** |

**Chapter 24 overall: ~5% — Not started.**

---

# Chapter 25 — EDI, API & Integration

### 25.1 EDI Interface
Agent/customer/carrier EDI, customs EDI, container tracking feeds: **N**.

### 25.2 API Web Services
Internal NestJS Swagger APIs: **D**. Public partner API keys / OAuth product / webhooks: **N**. Online quote + track APIs: **P**.

### 25.3 Third-Party Integrations

| Integration | Status |
|-------------|--------|
| xe.com | **P** |
| Container tracking providers | **N** |
| IATA E-AWB systems | **N** |
| India GST / ZATCA e-invoice | **N** |
| WhatsApp Business API | **P** stub |
| Google Maps (sales app) | **N** |
| SMTP email | **D** |
| Payment gateways | **N** |
| WPS (UAE payroll) | **N** |

**Chapter 25 overall: ~20% — Partial.**

---

# Chapter 26 — Mobile App — Fresa Sales App

Entire chapter (dashboard, GPS calls, offline, push): **N**.

**Chapter 26 overall: ~0% — Not started.**

---

# Chapter 27 — System Administration

### 27.1 Company / Organization Administration
Profile, branches, number formats, banks, tax rates: **D** / **P**. GL mapping / standard charge admin UI depth: **P**.

### 27.2 User Administration
Users, roles, permissions, login restrictions, password reset, force logout, sessions: **D**. Homepage per user: **N**.

### 27.3 Data Management
Party CSV import/export: **D**. Broad multi-module import/export, opening balances, archive tooling: **P** / **N**.

### 27.4 System Monitoring
Health endpoint: **D**. Full ops dashboard (pending docs/payments, Sentry, email delivery ops UI): **P**.

**Chapter 27 overall: ~55% — Partial.**

---

# Chapter 28 — SaaS Implementation Guide

### 28.1 Multi-Tenancy Architecture
Single DB + RLS + JWT + RBAC + Prisma + Puppeteer + Nodemailer + S3/local: **D** (NestJS instead of Fastify). Stripe billing: **N**.

### 28.2 Core Database Tables — coverage

| Module tables (spec) | Status |
|----------------------|--------|
| Auth & Tenancy | **D** |
| Master Data | **D** |
| Quotations | **D** |
| Jobs & shipments (core) | **D** |
| Air operations | **D** export |
| Sea FCL operations | **D** |
| Land / Courier | **N** / **S** |
| Accounting GL / vouchers / bank recon / assets | **N** |
| Invoicing (invoice, lines, credit, purchase, payment request) | **D** / **P** (no debit notes module) |
| HR / WMS | **N** |
| Tariff | **D** |
| CRM / Sales | **N** |
| Portals / SaaS subscriptions / api_keys / webhooks | **N** / **S** |

### 28.3 16-Week Build Priority (spec) vs FreightSaas reality

| Spec phase | Weeks | Spec modules | Backend reality |
|------------|-------|--------------|-----------------|
| Phase 1 Foundation | 1–3 | Auth, multi-tenancy, masters, quotation | **Done** |
| Phase 2 Core Ops | 4–7 | Air Ex/Im, Sea FCL, docs | Air Export + **Air Import** + Sea FCL Ex/Im **Done** |
| Phase 3 Finance | 8–12 | Full accounting | **Invoicing Partial**; GL/AR/AP/Reports **Missing** |
| Phase 4 Secondary | 13–14 | LCL, Land, HR, WMS, CRM, MIS | **Mostly Missing** |
| Phase 5 SaaS Launch | 15–16 | Stripe, API docs, hardening, deploy | **Partial** (Swagger/auth hardening started; Stripe **N**) |

### 28.4 Claude-Assisted Workflow
Process guidance — **F** (not a product feature).

**Chapter 28 overall: ~60% of foundation recommendations implemented; ~40% of table inventory missing.**

---

## Consolidated “what is covered” — backend product list

### Implemented (substantial)
- Multi-tenant SaaS core (tenants, companies, branches, RLS)  
- Auth: JWT, sessions, invite, 2FA, IP/MAC/hours, RBAC, password policy, audit/login history  
- Masters (15+), organization, number formats, party master + CSV + history  
- Quotations + tariffs + online quote + PDF/email + analytics  
- Jobs core: air export, sea FCL export/import, milestones, charges (incl. provisional), house/sub-jobs, P&L  
- AWB stock  
- Large PDF document set for Air Export + Sea FCL Ex/Im  
- Pre-alert (send + schedule), milestone emails, WhatsApp stub  
- Search (jobs/quotes/parties/invoices)  
- Invoices, credit notes, purchase invoices, payment requests  
- Locale / optional country-aware validation  
- PDF queue, storage, SMTP email, scheduler crons  

### Not implemented (major)
- CRM / leads / enquiry / call sheets / email campaigns  
- ~~Air Import module~~ **Done (Week 15 backend)**  
- Sea LCL Export/Import  
- Land & Courier full modules  
- Chart of Accounts, vouchers, GL, bank recon, cheques/PDC  
- Full AR/AP aging, statements, voucher matching  
- Debit notes, LPO, fixed assets  
- Financial statements & tax return packs  
- HR & payroll  
- WMS (GRN/GDO/stock)  
- MIS dashboard & report builder  
- Customer/Vendor portals & public track & trace  
- Government EDI (MPCI, eDO, Bayan, CCN, IAL, etc.)  
- Public API keys/webhooks, Stripe SaaS billing  
- Mobile sales app  

---

## Recommended roadmap (feature-spec driven)

1. **Week 11 equivalent** — Ch.17–19 finance spine (COA → vouchers → AR/AP → banking)  
2. **Ch.20 + 23** — Financial + MIS reports (Phase 1 close)  
3. **Ch.9 Air Import** — reuse FCL import patterns  
4. **Ch.12–13 LCL** — consolidator product  
5. **Ch.6 CRM** if sales process is contractual  
6. **Ch.25 EDI** prioritized by country  
7. **Ch.22 / 21 / 24 / 26** as secondary phase  

---

## Document control

| Item | Value |
|------|-------|
| Source PDF | FreightSaaS_Fresa_Complete_Feature_Specification (1).pdf |
| Companion SOW report | `docs/KFW-Milestone-Coverage-Report.md` |
| Repo assessed | FreightSaas backend |
| Next suggested product milestone | Chart of Accounts + GL vouchers (Ch.17) |

---

*End of Fresa Gold Feature Specification — Backend Coverage Report.*
