# Kingfisher Technologies — Product Overview

**Document type:** Product intelligence (evidence-based)  
**Source of truth:** `D:\FreightSaas` backend repository (KingFisher Wings Logistics ERP)  
**Investigation date:** 20 November 2026  
**Scope note:** This repository is the **enterprise backend API** that powers the Kingfisher platform. Staff UI, WordPress portal shells, and mobile apps may live in separate frontends that consume these APIs.

---

## 1. What Kingfisher Technologies is

Kingfisher Technologies delivers a **multi-tenant freight forwarding and logistics operating platform** — commercially presented as an end-to-end system for freight forwarders, NVOCCs, customs brokers, and logistics companies to run sales, operations, documentation, customer/vendor collaboration, warehouse and transport handoffs, and financial control in one connected environment.

Internally the product is known as **KingFisher Wings Logistics ERP** (`fresa-gold-backend`). It is designed as SaaS: a platform operator (Super Admin) provisions tenant businesses; each tenant runs its own companies, staff, customers, vendors, jobs, and books — isolated from other tenants.

---

## 2. The problem it solves

Freight businesses often run on a patchwork of:

- Spreadsheets for quotes and costing  
- Email and WhatsApp for customer/vendor updates  
- Separate tools for invoices and receipts  
- Shared drives for shipping documents  
- Manual tracking pages or carrier websites  
- No shared audit trail across Sales, Ops, Docs, and Accounts  

That creates delayed handoffs, duplicated data entry, weak visibility for customers, disputed invoices, and limited management control.

Kingfisher addresses this by connecting the **commercial continuum**:

> **Enquiry / CRM → Quotation → Shipment (booking) → Job (operations) → Documents & milestones → Invoices / GL → Customer & vendor portals → Public track & trace**

Evidence: `docs/flow.md`, `docs/fresa-parity/README.md`, `src/app.module.ts`.

---

## 3. Industries and modes served

| Segment | Supported in product |
|--------|----------------------|
| Freight forwarders | Yes — core |
| NVOCC / consolidation | Yes — dedicated NVOCC module |
| Customs brokers / clearance agents | Yes — Customs Clearance job workflow |
| Air cargo operators | Yes — Air Import / Air Export |
| Ocean forwarders | Yes — Sea FCL / LCL Import & Export |
| Inland / road / courier | Yes — Land, Road Freight, Courier |
| Warehouse / CFS-style ops | Yes — WMS + Warehouse jobs |
| Multi-entity logistics groups | Yes — Tenant → Company → Branch |

**Job types in the data model** (`prisma/schema.prisma` `JobType`):  
`AIR_EXPORT`, `AIR_IMPORT`, `SEA_FCL_EXPORT`, `SEA_FCL_IMPORT`, `SEA_LCL_EXPORT`, `SEA_LCL_IMPORT`, `LAND`, `ROAD_FREIGHT`, `COURIER`, `CUSTOMS_CLEARANCE`, `NVOCC_EXPORT`, `NVOCC_IMPORT`, `SERVICE_JOB`, `WAREHOUSE`.

---

## 4. Who the product is for

### Buying personas
- Logistics company owners and directors  
- Freight forwarding GMs / COOs  
- Finance managers needing AR/AP and job profitability  
- Operations and documentation managers  
- Sales / customer service leaders  

### Daily users
| Audience | How they use Kingfisher |
|----------|-------------------------|
| **Super Admin** | Platform console: tenants, features, platform billing |
| **Tenant Admin** | Company setup, users, permissions, organization settings |
| **Staff** (Sales, CS, Ops, Finance, Branch Manager, HR, Warehouse, Docs) | Role-scoped ERP modules |
| **Customers** | Customer portal: quotes, shipments, docs, invoices, payments |
| **Vendors** | Vendor portal: cost jobs, offers, purchase invoices, AP visibility |
| **Public / end receivers** | Track & trace by reference (no login for basic tracking) |

Hierarchy (product rule):  
**SuperAdmin → Company → Tenant → Tenant Admin → Staff users** (Sales, CS, Ops, Finance, Branch Manager, other staff). Customers and vendors are **party-linked portal users**, not staff Users.

---

## 5. What the platform actually does (capability summary)

### Fully implemented (backend evidence)
1. Multi-tenant SaaS provisioning and feature modules  
2. Staff authentication with sessions, idle timeout, invite/password flows  
3. Fine-grained permissions (classic + module matrix)  
4. Masters / reference data (ports, airlines, charge codes, HS codes, etc.)  
5. Parties (customers, vendors, agents) with portal/vendor access controls  
6. CRM (leads, enquiries, campaigns, follow-ups)  
7. Quotations with verify/approve/send and customer accept/reject/negotiate  
8. Shipments (booking layer) and Jobs (operational files) for all major modes  
9. Mode booking / compliance forms and document checklists  
10. Costing (sale/cost), containers, milestones, tracking profiles  
11. AWB stock management  
12. NVOCC voyages, bookings, tariffs, HBL/MBL document flows  
13. Customs Clearance stage machine (quote → file → duty → clear → invoice → close)  
14. Documentation desk (DO, BOE, EDI-oriented adapters, templates)  
15. WMS (items, ASN, GRN, GDO, stock, storage charges)  
16. Transport requests  
17. Invoices, credit/debit notes, payment proofs/requests  
18. Full GL: chart of accounts, vouchers, receipts/payments, cheques, bank recon, AR/AP, MIS, financial statements  
19. Online payments via Stripe (external processor; ERP remains ledger of truth)  
20. Customer portal and vendor portal APIs  
21. Public track & trace (+ optional live flight/vessel when keys configured)  
22. Notifications + email delivery  
23. Reports engine with implemented data packs (large FRESA catalog partially activated)  
24. HR (employees, leave, timesheets, payroll-oriented APIs)  
25. Ops activity continuum (comments, attachments, follow-ups across entities)  
26. Public API keys / webhooks (scoped)  
27. Quote-request website integration connector  

### Partial / environment-dependent
- Live AIS / flight tracking without provider API keys → stub + links  
- Full EDI live submit for all country stacks → adapters; some stubs  
- Entire FRESA report registry → many templates pending renderer bind  
- Staff two-factor authentication routes exist but are not the default linked path  
- WhatsApp as primary channel → optional/stub; email + in-app first  
- Multi-format / country e-invoicing depth → partial vs enterprise Fresa depth  

### Not claimed as complete from this repo
- Native mobile app  
- Real-time WebSocket notification push (polling model)  
- WordPress API sign-in from organization settings (link-mode portals only)  
- Full FE UAT for every screen (FE is a separate programme; this repo is API)  

---

## 6. Why a company would choose Kingfisher

1. **One operational truth** — Quote, booking, job, docs, and money stay linked.  
2. **Department clarity** — Sales, Ops, Docs, and Accounts have defined stages (especially NVOCC and Customs Clearance).  
3. **Customer self-service** — Portal for quotes, documents, invoices, and tracking reduces “where is my shipment?” emails.  
4. **Vendor collaboration** — Vendors see cost-side work and can submit purchase invoices without posting the tenant’s books.  
5. **Financial control** — Job costing → invoice → GL voucher → AR/AP statement is a first-class path.  
6. **Tenant isolation** — Each logistics company operates in its own secure business space.  
7. **Mode coverage** — Air, ocean FCL/LCL, land/road/courier, NVOCC, customs, warehouse in one product surface.  
8. **Fresa-oriented parity** — Explicit parity matrices (`docs/fresa-parity/`) show intentional coverage of established freight ERP workflows.

---

## 7. Positioning statement (business language)

**Kingfisher Technologies** provides a unified freight and logistics management platform that helps forwarders and logistics companies run quotations, shipments, customs and documentation, customer and vendor collaboration, and financial control from one secure, multi-tenant system — reducing disconnected tools and improving operational accountability.

---

## 8. Evidence map (internal)

| Topic | Primary evidence |
|-------|------------------|
| Module registration | `src/app.module.ts` |
| Auth principals | `docs/authentication-flow.md`, `src/modules/auth/` |
| Job continuum | `docs/flow.md`, `docs/fresa-parity/` |
| Portals | `src/modules/portal/`, `src/modules/vendor/`, `docs/WORDPRESS_PORTALS.md` |
| Finance | `src/modules/invoices/`, `src/modules/gl/`, `docs/STRIPE_PAYMENTS.md` |
| Security briefing (client) | `docs/client-review/KingFisher_Security_Privacy_Overview.html` |
| Ops handoff | `docs/FE_OPS_HANDOFF.md` |

---

## 9. What this overview is not

- Not a claim of ISO / SOC certification unless independently obtained  
- Not a claim that every Fresa report template is live  
- Not a claim that the marketing website already exists in this repo  
- Not inventing client logos, case studies, or uptime SLAs  

See companion documents `02`–`11` for features, security, competitors, website, workflows, value, trust, gaps, and the master blueprint.
