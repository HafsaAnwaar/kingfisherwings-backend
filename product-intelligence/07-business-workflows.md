# Business Workflows and User Journeys

Evidence: `docs/flow.md`, `docs/decision.md`, `docs/fresa-parity/*`, customs/NVOCC controllers, portal/vendor modules.

Status: **Complete** | **Partial** | **Missing**

---

## 1. New company (tenant) onboarding — Complete

| | |
|--|--|
| **Start** | Super Admin creates tenant |
| **Actor** | Super Admin |
| **Actions** | Create tenant → seed roles/permissions/number formats → set enabled modules → create companies/branches as needed |
| **Information** | Tenant slug, profile, admin access |
| **Next** | Tenant Admin / staff invites |
| **Outcome** | Isolated company workspace ready |

---

## 2. Administrator onboarding — Complete

| | |
|--|--|
| **Start** | Tenant login or first TENANT_ADMIN user |
| **Actor** | Tenant Admin |
| **Actions** | Organization profile, banks, number formats, logo, module confirmation, invite staff |
| **Outcome** | Configured tenant admin control |

---

## 3. Employee onboarding — Complete

| | |
|--|--|
| **Start** | Invite staff user |
| **Actor** | Tenant Admin |
| **Actions** | Create/invite user → assign role/permissions → user accepts → sets password → logs in with tenant slug |
| **Outcome** | Staff member in role-scoped ERP |
| **Note** | Optional two-factor is not the default linked enforcement path |

---

## 4. Customer registration (portal) — Complete

| | |
|--|--|
| **Start** | Party marked for portal access |
| **Actor** | Staff + Customer |
| **Actions** | Enable portal → invite → customer accepts → sets password → portal login |
| **Outcome** | Customer portal user limited to party ownership |

---

## 5. Vendor registration — Complete

| | |
|--|--|
| **Start** | Vendor-eligible party |
| **Actor** | Staff + Vendor |
| **Actions** | Invite vendor user → accept → login → permissions |
| **Outcome** | Vendor portal access to assigned work |

---

## 6. Customer quotation request — Complete

| Paths | |
|-------|--|
| Portal quote request / estimate | Customer |
| CRM enquiry → quotation | Sales (enquiry does **not** auto-create job) |
| Website quote-request sync | Integration connector |

**Outcome:** Draft or working quotation for sales handling.

---

## 7. Quotation creation and acceptance — Complete

| Step | Actor | Action |
|------|-------|--------|
| 1 | Sales | Create DRAFT quotation |
| 2 | Sales | Verify / approve |
| 3 | Sales | Send to customer |
| 4 | Customer | Accept / reject / negotiate (after send — customer-driven) |
| 5 | System/Staff | On accept: shipment and/or job conversion paths |
| **Outcome** | Quotation converted; booking/job continuum starts |

**Incomplete nuance:** Some “staff approve after verify” UX details marked Partial in parity matrices; core API path exists.

---

## 8. Job creation — Complete

| Paths | |
|-------|--|
| From quotation generate-job / convert | Staff or portal |
| From shipment generate-job | Staff/portal |
| Direct create-draft by job type | Staff |

**Information:** Job type, parties, ports/airports, commodity, charges as applicable.  
**Outcome:** Operational job file with milestones/costing tabs.

---

## 9. Freight booking — Complete

| | |
|--|--|
| **Start** | Quote accepted or provisional job |
| **Actor** | Customer (portal) and/or CS/Sales |
| **Actions** | Complete mode booking/compliance form; upload mandatory docs |
| **Required docs (policy)** | Commercial invoice, packing list, BL/AWB, licence, tax/UAT docs (correspondence/COD optional) |
| **Outcome** | Form complete; milestone unlocks further stages |

---

## 10. Air freight operation — Complete (live flight Partial)

| | |
|--|--|
| **Start** | AIR_IMPORT / AIR_EXPORT job |
| **Actors** | Sales, Ops, Docs, Accounts |
| **Actions** | Booking form → AWB stock allocation as needed → milestones → costing → invoice → track |
| **Outcome** | Executed air file with documents and financials |
| **Partial** | Live flight enrichment needs provider configuration |

---

## 11. Sea freight operation — Complete (live vessel Partial)

| | |
|--|--|
| **Start** | SEA_FCL/LCL import/export or NVOCC |
| **Actors** | Ops, Docs, Accounts; NVOCC adds CS stage ownership |
| **Actions** | Booking → containers → documentation (BL/HBL) → milestones → invoice |
| **NVOCC extra** | Voyage/booking workflow with CRO, portal confirm, HBL gates, payment gates |
| **Partial** | Live vessel enrichment needs provider configuration |

---

## 12. Customs clearance — Complete (external filing Partial)

| Stage focus | Owner |
|-------------|-------|
| Quote / accept | Sales |
| Open ops, docs, classify, file, queries, clear/release | Operations |
| Duty paid | Accounts (+ ops coordination) |
| Invoice ready / close | Sales / Accounts |

**Full stage list:** PENDING → QUOTED → ACCEPTED → OPS_OPEN → DOCS → CLASSIFIED → FILED → QUERY → ASSESSED → DUTY_PAID → CLEARED → RELEASED → INVOICE_READY → CLOSED  

**Partial:** Local declaration submit adapters may be stubbed depending on country connector.

---

## 13. Document submission — Complete

| Actor | Action |
|-------|--------|
| Customer/Vendor | Upload via portal/vendor with rights |
| Staff | Upload on job/documentation desk |
| **Outcome** | Documents attached with visibility rules |

---

## 14. Document verification — Complete / Partial

| | |
|--|--|
| **Complete** | Checklists, payment proof approve/reject, compliance form completeness gates |
| **Partial** | Automated AI document classification / OCR not a verified core product claim |

---

## 15. Shipment tracking — Complete

| Channel | |
|---------|--|
| Public `/track` | By job, BL/AWB, container, tracking token |
| Portal | Shipment tracking |
| Staff | Job tracking profile |
| **Safety** | No costs/GP/internal notes/staff PII on public track |

---

## 16. Invoice generation — Complete

| Path | |
|------|--|
| From job costing sale/purchase | Create DRAFT → review → POST → GL auto-post → optional send PDF |
| Credit/debit notes | Parallel note flows |
| **Outcome** | Posted invoice with ledger voucher |

---

## 17. Payment processing — Complete

| Method | |
|--------|--|
| Manual receipt/payment in GL | Allocate to invoices |
| Payment proof upload | Staff approve → posts receipt/payment |
| Online (Stripe) | Checkout at provider → webhook → ERP receipt |
| **Outcome** | Invoice paid/partial; AR/AP updated |

---

## 18. Job completion — Complete

| | |
|--|--|
| **Actions** | Final milestones, docs complete, invoices settled or flagged, close job / close-report (NVOCC), notifications |
| **Outcome** | Closed operational file with retained history |

---

## Workflow status scorecard

| # | Journey | Status |
|---|---------|--------|
| 1–5 | Onboarding (tenant/admin/staff/customer/vendor) | Complete |
| 6–9 | Quote request → accept → job → booking | Complete |
| 10–11 | Air / Sea ops | Complete (live track Partial) |
| 12 | Customs clearance | Complete (filing adapters Partial) |
| 13–15 | Docs + track | Complete |
| 16–18 | Invoice → pay → close | Complete |
| — | Native mobile journeys | Missing |
| — | WhatsApp-primary ops | Missing / stub |
| — | Full Tier-2 portal extras | Many Missing (see `10`) |
