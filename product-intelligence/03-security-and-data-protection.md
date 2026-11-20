# Security, Privacy and Data Protection

**Audience:** Business stakeholders and website/security page authors  
**Rule:** Only claim protections verified in the Kingfisher codebase or operational docs. Do not invent certifications, encryption percentages, or compliance seals.

**Internal evidence (not for marketing copy):** `docs/authentication-flow.md`, `docs/authorization-flow.md`, `docs/STORAGE_SETUP.md`, `docs/STRIPE_PAYMENTS.md`, `docs/client-review/KingFisher_Security_Privacy_Overview.html`, `src/modules/auth/`, portal/vendor ownership helpers, PostgreSQL tenant context / RLS patterns described in `README.md`.

---

## Executive summary

Kingfisher is built as a **multi-tenant business platform** where each logistics company (tenant) operates in a separated business space. Access is controlled by **secure sign-in**, **role-based permissions**, and **ownership rules** for customers and vendors. Sensitive files are intended to live in **private durable storage**. Card payments are processed by an **external payment provider**; Kingfisher records business receipts in its own ledger.

---

## A. Security protections currently implemented

### 1. Account protection
| Protection | Business-friendly meaning | Evidence (internal) |
|------------|---------------------------|---------------------|
| Separate login paths | Staff, tenant admin, platform admin, customers, and vendors do not share the same login doorway | Auth controllers for `/auth`, `/portal/auth`, `/vendor/auth`, super-admin |
| Password-protected accounts | Credentials are required and verified before access | Auth services |
| Secure password storage | Passwords are stored using secure one-way protection practices | Auth password utilities |
| Invite / activation | New users receive controlled invite flows rather than open registration into a tenant | Users + portal/vendor invite |
| Password change & admin reset | Accounts can be reset by authorized administrators | Auth/users endpoints |
| Server-side sessions | Sign-in creates a tracked session that can be ended | Session models |
| Logout & force logout | Sessions can be revoked; admins can force logout | Users/auth |
| Idle session timeout | Inactive staff sessions can expire automatically | Idle timeout / session touch |
| Login throttling | Repeated login attempts are rate-limited on portal (and related auth paths) | Throttle on portal auth |
| Optional IP / device restrictions | Accounts can be limited to allowed network/device markers when configured | Login meta checks |
| Account status checks | Disabled or locked accounts cannot continue | Auth validation |
| Login / session history | Sign-in activity is retained for accountability | Auth service / history |

**Customer-facing phrasing examples**
- “Your account credentials are protected using secure password protection practices.”
- “Access sessions can expire after inactivity and can be ended by administrators when needed.”
- “Customer, vendor, and staff access use separate secure sign-in paths.”

### 2. Business data isolation
| Protection | Meaning |
|------------|---------|
| Tenant separation | Each company’s records are scoped to its own tenant space |
| Application filtering | Business queries are constrained to the signed-in company’s context |
| Database isolation policies | Defence-in-depth isolation at the database layer for tenant data |
| Platform vs tenant | Super Admin manages tenants; does not operate as a normal tenant staff user inside customer books |

**Customer-facing phrasing**
- “Your business information remains separated from other companies on the platform, with access restricted to authorized users.”

### 3. Role-based access
| Audience | Access boundary |
|----------|-----------------|
| Super Admin | Platform: tenants, features, platform billing, tech observability |
| Tenant Admin | Users and configuration **within their tenant only** |
| Staff | Module permissions and job-type scopes (Sales, Ops, Finance, etc.) |
| Customers | Only their party’s permitted shipments, documents, quotes, invoices |
| Vendors | Only assigned / cost-linked information; cannot post the tenant’s books |

**Customer-facing phrasing**
- “Staff access is limited by role and permission — finance, operations, and sales see what they are authorized to see.”
- “Customers see their own shipment and invoice information, not other customers’ records.”
- “Vendors see work and documents linked to them, not unrelated vendor accounts.”

### 4. Document security
| Protection | Meaning |
|------------|---------|
| Private object storage | Business files (PDFs, proofs, uploads) are stored in private durable storage when configured |
| Metadata in database | Database stores keys/references — not a substitute for private file buckets |
| Authorized download paths | Files are served through controlled application routes |
| Portal document rights | Customer document visibility follows party permission settings |
| Job document visibility rules | Internal vs customer-visible document types |
| Public tracking sanitization | Public track views exclude costs, GP, internal notes, and staff personal details |
| Payment proof access controls | Proof files accessed via authorized endpoints |

**Customer-facing phrasing**
- “Your sensitive business documents are kept private and accessible only to authorized users.”
- “Public tracking shares shipment progress without exposing confidential commercial costs.”

### 5. Payment and financial security
| Protection | Meaning |
|------------|---------|
| External payment processing | Online card/bank checkout is handled by Stripe as the payment processor |
| ERP ledger remains source of truth | Successful online payments become ordinary posted receipts in Kingfisher’s books |
| Webhook verification | Payment provider events are verified and recorded before ledger updates |
| No second shadow ledger | Online pay reuses the same receipt/allocation/AR path as manual receipts |
| Permissioned refunds | Refunds require authorized payment permissions and reverse through accounting controls |
| Manual payment proofs | Customers/vendors can submit proofs for staff verification when online pay is not used |
| Financial permissions | Invoices, GL, payments require finance-oriented permissions |

**Critical marketing rule**
- **Do not claim** Kingfisher stores or protects full card numbers.
- **Do say:** “Online payments are processed by a trusted payment provider. Kingfisher records the business receipt and invoice status in your company books.”

Evidence: `docs/STRIPE_PAYMENTS.md`.

### 6. System monitoring and accountability
| Protection | Meaning |
|------------|---------|
| Audit / activity records | Significant operational and financial actions write audit/activity history |
| Ops continuum | Comments, attachments, and follow-ups create a shared trail on jobs and related entities |
| Notifications | Domain events create in-app (and often email) alerts |
| Tech logs (platform) | Super Admin observability for issues and client errors |
| Soft-delete patterns | Many records are soft-hidden rather than immediately destroyed |

### 7. Data privacy practices reflected in product design
| Practice | Meaning |
|----------|---------|
| Ownership filters | Portal helpers restrict customers to their parties |
| Preference / notification controls | Portal preferences exist |
| Separated principals | Portal tokens cannot be used as staff ERP sessions (by design) |
| Soft deletes | Supports controlled deactivation of records |

**Retention / hard deletion:** Soft-delete is widely used. Formal published retention schedules and one-click GDPR erasure packs should not be advertised unless productized and legally reviewed.

### 8. System reliability (verified vs recommended)

| Item | Status |
|------|--------|
| Cloud hosting (e.g. Render) + managed database | Documented operational pattern |
| Durable file storage (R2/S3) required in production | Documented — local disk ephemeral on redeploy |
| Health endpoint including storage durability signal | Implemented |
| Automated database backups | **Hosting-provider dependent** — claim only if ops confirms |
| Disaster recovery runbooks / RTO/RPO | **Not verified as product claims** — treat as ops recommendation |
| AWS migration | Documented as future / not current phase lock |

---

## B. Additional security improvements recommended

Before making **stronger** public security claims, prioritize:

1. **Enable and productize staff two-factor authentication** for all admin and finance roles (routes exist; default linked enforcement is incomplete).  
2. **Portal / vendor MFA** for high-value accounts.  
3. **Independent security review / penetration test** and remediate findings before “enterprise-grade security” language.  
4. **Published security whitepaper** aligned to this document (no invented ISO/SOC marks).  
5. **Formal data retention & deletion policy** pages reviewed by counsel.  
6. **Document malware scanning** on uploads (if not already enforced at storage edge).  
7. **Stricter production file URL strategy** (time-limited authorized downloads everywhere; avoid long-lived public object URLs).  
8. **SIEM / centralized security logging** beyond app tech-logs for production.  
9. **Backup restore drills** with documented RPO/RTO.  
10. **Secrets management audit** (no secrets in repos; rotate keys).  
11. **Vendor TDS / regional compliance** completeness before compliance marketing.  
12. **Complete live customs filing** only where legally certified adapters exist — do not claim global certified filing.  
13. **Frontend session hardening checklist** in the separate UI repos (CSP, secure cookies attributes where applicable).  
14. **Customer-facing trust center** with honest “what we do / what we don’t claim” sections.

---

## C. Potential gaps / honesty notes

| Topic | Note |
|-------|------|
| Certifications | No SOC 2 / ISO 27001 claim found as product fact in repo — do not invent |
| Encryption in transit | Standard HTTPS for hosted APIs is expected; state as deployment practice, not a special Kingfisher algorithm claim |
| Encryption at rest | Depends on database and storage provider settings — verify with ops before advertising |
| Suspicious login AI | Throttling and restrictions exist; advanced anomaly AI is not a verified product feature |
| Cross-company employee access | Tenant Admin is tenant-scoped; staff are tenant-scoped. Misconfigured permissions inside a tenant remain an admin responsibility |
| Files controller | Ensure production always uses private durable storage (`STORAGE_SETUP.md`) |

---

## D. Website Security page — approved claim set

Use only claims from section A, for example:

1. Separate secure access for staff, customers, and vendors  
2. Role-based permissions inside each company  
3. Company information kept separate from other companies on the platform  
4. Private document storage for authorized users  
5. Public tracking without exposing confidential commercial figures  
6. Online payments processed by a payment provider; Kingfisher updates invoices and receipts  
7. Activity and session accountability for business oversight  

Avoid: “military-grade,” “unhackable,” “bank-level encryption,” fake compliance badges, invented uptime %.
