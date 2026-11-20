# Complete Feature Inventory

**Product:** Kingfisher Wings Logistics ERP (Kingfisher Technologies platform)  
**Evidence basis:** Controllers/services under `src/modules`, Prisma models, `docs/flow.md`, `docs/fresa-parity/*`, `docs/FE_OPS_HANDOFF.md`  
**Status legend:** Fully implemented · Partial · Planned/Not available

---

## Platform structure

| Layer | Capability | Status |
|-------|------------|--------|
| Super Admin console | Tenant CRUD, feature modules, platform billing, tech logs | Fully implemented |
| Tenant organization | Profile, logo, banks, number formats, settings | Fully implemented |
| Companies / branches | Multi-entity under tenant | Fully implemented |
| Masters | Ports, airports, airlines, vessels, charge codes, HS, tax, warehouses, truckers, currencies, etc. | Fully implemented |
| Global search | `GET /search` | Fully implemented |
| Favourites | User favourites for reports/jobs/docs | Fully implemented |
| Unit converters | Length/CBM/weight/liquid/volume tools | Fully implemented |
| Scheduler / crons | Quote expiry, demurrage, pre-alerts, overdue invoices, PDC, HR, WMS-related jobs | Fully implemented |

---

## A. Dashboard and business intelligence

| Feature | What exists | Who | Status |
|---------|-------------|-----|--------|
| GL MIS dashboard | `GET /gl/mis/dashboard`, profitability, operational | Finance / management | Fully implemented |
| Financial statements | Trial balance, balance sheet, P&L, cash flow, VAT | Finance | Fully implemented |
| CRM dashboard | Leads/calls/follow-ups/campaign metrics | Sales | Fully implemented |
| Portal dashboard | Open shipments, AR snapshot, notifications | Customers | Fully implemented |
| Vendor dashboard | AP / task-oriented snapshot | Vendors | Fully implemented |
| Ops boards | Job-not-invoiced DO, job finance by shipment date, exceptions, KPI | Ops / Finance | Fully implemented |
| Report catalog | Generate/list/download; large FRESA taxonomy with implemented packs | Staff with reports permission | Partial (engine + packs live; many registry stubs pending bind) |
| NVOCC MIS | Voyage P&L, utilization, trade-lane reports | NVOCC ops | Fully implemented |

**Do not claim:** a single unified “CEO home dashboard” with invented KPI widgets beyond what MIS/ops/CRM endpoints return.

---

## B. Customer management

| Feature | Detail | Status |
|---------|--------|--------|
| Party master | Customers/agents with contacts, addresses, credit fields | Fully implemented |
| Custom party types | Catalog-driven | Fully implemented |
| Credit status | Party credit controls | Fully implemented |
| Portal access enablement | Invite portal users per party | Fully implemented |
| Portal permissions | Document/type ACL matrix | Fully implemented |
| Linked commercial records | Quotes, shipments, jobs, invoices via ownership | Fully implemented |
| Customer portal | Auth, shipments, docs, finance, quotes, disputes, notifications, online pay | Fully implemented |
| Import/export parties | Supported on parties APIs | Fully implemented |

**Users:** Tenant Admin, Sales/CS staff, Finance (credit), Customers (portal).

**Business benefit:** One customer record drives quoting, ops visibility, documents, and AR.

---

## C. Vendor management

| Feature | Detail | Status |
|---------|--------|--------|
| Vendor parties | Supplier/agent parties | Fully implemented |
| Vendor portal users | Invite + permissions | Fully implemented |
| Job cost visibility | Cost-side charges for linked jobs | Fully implemented |
| Vendor quotes / job offers | Pass-through and offer flows | Fully implemented |
| Purchase invoice submit | Vendor submits DRAFT; staff posts | Fully implemented |
| AP aging / remittance | Vendor finance views | Fully implemented |
| Disputes | Vendor dispute records | Fully implemented |
| Stripe Connect payouts | When Connect enabled | Partial (feature-flag / env dependent) |
| TDS certificates | India Phase 3 | Stub / not complete |

**Users:** Ops/Finance staff; Vendors (portal).  
**Boundary:** Vendors cannot post tenant GL.

---

## D. Quotation management

| Feature | Detail | Status |
|---------|--------|--------|
| Create / draft quotes | Lines, services, tariffs, zip distances | Fully implemented |
| Service catalog | Quotation services | Fully implemented |
| Verify / approve / send | Staff workflow | Fully implemented (staff approve-after-verify nuances noted Partial in some matrices) |
| Customer accept / reject / negotiate | Portal-driven after send | Fully implemented |
| Convert to shipment / job | Staff + portal paths | Fully implemented |
| CRM enquiry → quote | Stops at quotation (not auto-job) | Fully implemented |
| Website quote requests | Integration connector | Fully implemented (depends on external site) |
| Booking forms on quote | Mode facades | Fully implemented |

**Workflow:** Draft → Verify → Approve → Sent → Customer decision → Shipment/Job → Converted.

---

## E. Freight operations

### Job & shipment layer
| Feature | Status |
|---------|--------|
| Shipments (booking layer) | Fully implemented |
| Jobs for all JobType enums | Fully implemented |
| Create drafts by mode | Fully implemented |
| Detail tabs / show-all | Fully implemented |
| Costing (sale/cost/GP) | Fully implemented |
| Containers (planned/actual) | Fully implemented |
| Dimensions / cargo | Fully implemented |
| Milestones & tracking profile | Fully implemented |
| Sub-jobs / house–master | Fully implemented |
| Pre-alerts | Fully implemented (scheduler) |
| Ops continuum (comments, attachments, tags, complaints) | Fully implemented |

### Air
| Feature | Status |
|---------|--------|
| Air import / export jobs | Fully implemented |
| Air booking / compliance forms | Fully implemented |
| AWB stock allocate/void | Fully implemented |
| Air workflow services | Fully implemented |
| ULD/pallet request lifecycle | Removed (obsolete) |
| Live flight tracking | Partial (provider keys) |

### Sea
| Feature | Status |
|---------|--------|
| FCL/LCL import & export | Fully implemented |
| Booking forms | Fully implemented |
| BL-oriented documentation | Fully implemented (documentation + job docs) |
| Live vessel tracking | Partial (provider keys) |

### Land / road / courier
| Feature | Status |
|---------|--------|
| Land, road freight, courier job details | Fully implemented |
| Booking forms | Fully implemented |
| Transport requests handoff | Fully implemented |

### NVOCC
| Feature | Status |
|---------|--------|
| Voyages, enquiries, bookings, tariffs | Fully implemented |
| Department stage workflow (CS→Sales→Portal→Ops→Docs→Accounts) | Fully implemented |
| HBL/MBL, load list, PnL | Fully implemented |
| Portal NVOCC actions | Fully implemented |

---

## F. Customs clearance

**Module:** `CUSTOMS_CLEARANCE` jobs + `/jobs/:id/cc/*` + portal `/portal/cc`.

### Stage machine (implemented)
`PENDING → QUOTED → ACCEPTED → OPS_OPEN → DOCS → CLASSIFIED → FILED → QUERY → ASSESSED → DUTY_PAID → CLEARED → RELEASED → INVOICE_READY → CLOSED`

| Responsibility | Actions |
|----------------|---------|
| **Sales** | Quote, accept, invoice-ready, close commercial side |
| **Operations** | Open job, document checklist, HS classify, file, handle queries, clear/release |
| **Accounts** | Duty payment request / duty paid recording; invoice posting path |
| **Customer (portal)** | Checklist/docs via portal CC endpoints |

| Feature | Status |
|---------|--------|
| Booking form | Fully implemented |
| Checklist seed (import/export/transit) | Fully implemented |
| HS / lines classify | Fully implemented |
| Duty payment request | Fully implemented |
| Freight job link | Fully implemented |
| Local declaration submit | Partial / stub adapter |
| Thinner customs-status on freight imports | Fully implemented (separate path) |

---

## G. Document management

| Feature | Detail | Status |
|---------|--------|--------|
| Job documents | Typed allowlists, visibility rules | Fully implemented |
| Booking/compliance uploads | Mandatory commercial invoice, packing list, BL/AWB, licence, tax docs (policy) | Fully implemented |
| Invoice / voucher attachments | Supported | Fully implemented |
| Payment proofs | Upload + approve/reject | Fully implemented |
| Documentation desk | DO, BOE, templates, EDI adapters | Partial (rich API; external submit varies) |
| Portal document rights | Party permission matrix | Fully implemented |
| Vendor document access | When cost-linked | Fully implemented |
| Object storage | Private durable storage (R2/S3 pattern) | Fully implemented when configured |
| Public track docs | Sanitized — no costs/GP/internal notes | Fully implemented |

---

## H. Financial management

| Feature | Detail | Status |
|---------|--------|--------|
| Customer invoices | Create from job/quote, draft, post, send PDF | Fully implemented |
| Purchase invoices | Staff + vendor draft submit | Fully implemented |
| Credit / debit notes | Draft → post | Fully implemented |
| Mark paid / proofs | Staff + portal paths | Fully implemented |
| GL vouchers | Auto-post from invoices/payments | Fully implemented |
| Receipts & payments | Allocations to invoices | Fully implemented |
| Cheques / PDC | Supported + maturity cron | Fully implemented |
| Bank reconciliation | Staff | Fully implemented |
| AR/AP aging & statements | Incl. opening balance & pending job charges | Fully implemented |
| Opening balances | AR/AP/CoA | Fully implemented |
| Online card/bank pay | Stripe Checkout / Connect — **card data at provider** | Fully implemented when enabled |
| Platform SaaS billing | Super Admin → Tenant | Fully implemented |
| Multi-country e-invoice portals | Depth vs Fresa | Partial |

---

## I. User management and permissions

| Principal | Login | Scope |
|-----------|-------|-------|
| Super Admin | `/auth/super-admin/login` | Platform |
| Tenant Admin | `/auth/tenant-login` or staff role | Own tenant users & settings |
| Staff | `/auth/login` + tenant slug | Role + permission matrix |
| Portal user | `/portal/auth/login` | Own party records |
| Vendor user | `/vendor/auth/login` | Vendor-eligible party |

**Roles seeded (examples):** Tenant Admin, Branch Manager, Sales, Customer Service, Operations, Finance, HR, Warehouse, and related presets (`src/common/constants/role-catalog.ts`).

**Permission models:**
1. Classic `module.action` permissions  
2. Matrix permissions (module × submodule × see/read/write), including job-type ops scopes  
3. Tenant `enabled_modules` feature flags  
4. Party portal/vendor document ACLs  

---

## J. Notifications and activity monitoring

| Feature | Status |
|---------|--------|
| In-app notifications (staff/portal/vendor) | Fully implemented |
| Email (invites, invoices, CRM, alerts) | Fully implemented (SMTP/provider config) |
| Ops activity continuum | Fully implemented |
| Login/session tracking | Fully implemented |
| Audit log usage across finance/ops actions | Fully implemented (domain writes) |
| Super Admin tech logs / client errors | Fully implemented |
| Staff activity processor | Fully implemented |
| WebSocket realtime push | Not available (polling) |
| WhatsApp Business as primary | Stub / deferred |

---

## K. Tracking

| Feature | Status |
|---------|--------|
| Public `/track` by job, BL/AWB, container, token | Fully implemented |
| Embed widget / PDF | Fully implemented |
| Staff job tracking | Fully implemented |
| Portal shipment tracking | Fully implemented |
| Live vessel/flight enrichment | Partial |

---

## L. HR / WMS / Transport (adjacent modules)

| Module | Highlights | Status |
|--------|------------|--------|
| HR | Employees, leave, timesheets, payroll runs, loans, evaluations, letters | Fully implemented (API) |
| WMS | Items, ASN, GRN, GDO, stock, transfers, storage charges, ops board | Fully implemented |
| Transport | Request lifecycle assign→delivered, cost, PDF | Fully implemented |

---

## M. Integrations

| Integration | Status |
|-------------|--------|
| Stripe payments & Connect | Fully implemented (env) |
| Quote-requests website connector | Fully implemented (external WP) |
| Public API v1 jobs/track + API keys/webhooks | Fully implemented |
| EDI Bayan/CCN/EQO/IAL/CGM/MPCI paths | Partial |
| AviationStack / VesselFinder | Partial |
| WordPress branded portal **links** | Fully implemented |
| WordPress API sign-in from org settings | Not implemented |

---

## Module index (folders under `src/modules`)

`auth`, `users`, `tenants`, `companies`, `masters`, `parties`, `organization`, `quotations`, `shipments`, `jobs`, `operations`, `awb-stock`, `search`, `favourites`, `ops-activity`, `tools`, `scheduler`, `invoices`, `gl`, `payments`, `portal`, `vendor`, `crm`, `hr`, `wms`, `transport`, `nvocc`, `documentation`, `reports`, `public-api`, `integrations`, `track`, `notifications`, `tech-logs`.

Plus `src/files` (file serve) and `src/health`.

---

## Implementation honesty checklist for marketing

| Claim | OK to say? |
|-------|------------|
| “Air, ocean, land, NVOCC, customs, warehouse in one platform” | Yes (backend) |
| “Customer and vendor portals” | Yes |
| “Integrated accounting and AR/AP” | Yes |
| “Online payments” | Yes — via payment provider; ERP posts receipts |
| “All 850+ Fresa reports live” | **No** — engine + packs yes; full registry no |
| “Certified customs filing in every country” | **No** — workflows yes; live filing adapters partial |
| “Native mobile app” | **No** |
| “WhatsApp-first operations” | **No** |
