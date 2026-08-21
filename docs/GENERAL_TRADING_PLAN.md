# General Trading Plan — External Invoices & Quotes (One Tenant)

**Status:** Research / design only — **not scheduled** into the freight ERP roadmap.  
**Audience:** Product + engineering.  
**Goal:** For **one** customer (given by SuperAdmin as a Tenant), show **invoices and quotes from their existing general-trading system** inside KingFisher / Fresa Gold — without building a full trading ERP, and without exposing that data to any other company.

---

## 1. Business requirement 

- SuperAdmin onboards many company owners as **Tenants**.
- Most tenants use this product as a **freight / logistics ERP**.
- **One** tenant already runs a **general trading** business (buy/sell goods) on a **separate system**.
- That tenant wants this ERP to **display** (and optionally sync) **their trading invoices and quotes** so staff see them in one place.
- Scope is **that tenant only** — not a platform-wide trading module for every customer.

**Out of scope for this plan (unless product later expands):**

- Replacing their trading POS / inventory / purchasing system.
- Building full general-trading CRUD (SKU master, stock, purchase orders, etc.) for all tenants.
- Mixing trading AR/AP into freight GL automatically without an explicit decision.

---

## 2. How this maps to *our* hierarchy

Locked product hierarchy:

```
SuperAdmin → Company → Tenant → Tenant Admin → Users
```

| Concept in this product | Meaning for this feature |
|-------------------------|--------------------------|
| **SuperAdmin** | Decides *which* tenant may use the trading bridge (enable / disable). |
| **Tenant** | The SaaS customer. **Isolation key is always `tenant_id`.** All mirrored or proxied trading docs must be scoped to this tenant. |
| **Company** (legal entity under Tenant) | Optional: if the trading system invoices under multiple legal entities, map each external entity → one of our `Company` rows. Default = tenant’s primary company. |
| **Tenant Admin / Finance / Sales** | Who can *see* trading invoices/quotes (via new permissions). |

**Important:** Do **not** implement “only for one Company under a multi-company tenant” without also enforcing `tenant_id`. Company filtering is secondary; tenant isolation is mandatory (app `where` + Postgres RLS).

---

## 3. What already exists (do not confuse)

This ERP already has first-class **freight** documents:

| Domain | Module | Routes (examples) |
|--------|--------|-------------------|
| Freight quotations | `src/modules/quotations/` | `/quotations`, tariffs, zip-distances |
| Freight invoices (AR/AP docs) | `src/modules/invoices/` | `/invoices`, credit/debit notes, purchase invoices |

Those models (`Quotation`, `Invoice`, …) are **freight lifecycle** (quote → job → invoice → GL).  

**Recommendation:** Treat general-trading invoices/quotes as a **separate read surface** (new module or adapter), **not** as rows forced into freight `Invoice` / `Quotation` tables — unless product explicitly wants one unified AR list (see §6 Option C). Forcing trading docs into freight tables risks breaking numbering, GL posting, and job linkage.

Public partner API / webhooks are still **OPEN** (Week 21) — there is **no** production inbound partner API yet. Closest patterns today: SMTP, WhatsApp stub, PDF queue, internal notification emitter.

There is **no** per-tenant feature-flag / module-enablement system today. All Nest modules load for every tenant; gating is RBAC + subscription limits. **A new enablement gate is required** for “this tenant only.”

---

## 4. Feasibility verdict

**Yes — it is possible**, in a controlled way:

1. SuperAdmin **enables** a “General Trading bridge” for Tenant X only.  
2. Tenant X stores **connection credentials** (API URL, key, etc.) in encrypted tenant settings.  
3. Backend **pulls or receives** invoice/quote summaries from the external system.  
4. UI (later) shows a **Trading → Invoices / Quotes** area visible **only** when the bridge is enabled and the user has permission.  
5. Other tenants never see routes data or get empty 404/403 for the module.

Complexity depends on what the **existing trading system** can offer (API, DB export, CSV, email PDF only, etc.). That is the first discovery question with the customer.

---

## 5. Integration patterns (how it can work)

Pick based on what the trading system supports.

### Option A — Live API proxy (read-through)

```
Staff UI → KingFisher API → TradingConnector → External trading API
```

| Pros | Cons |
|------|------|
| Always fresh data; little storage | External downtime = blank screens; latency; rate limits |
| Fastest to pilot if they have a REST API | Harder offline/reporting; need resilient timeouts |

**Best when:** Trading system has a stable REST/GraphQL API with list + get-by-id for invoices and quotes.

### Option B — Sync mirror (recommended default for ERP UX)

```
External system → (pull cron / webhook / nightly job) → KingFisher tables
Staff UI → KingFisher DB (tenant-scoped)
```

Store **mirror** tables, e.g.:

- `trading_external_connection` (tenant_id, base_url, encrypted secrets, status)
- `trading_quote` (tenant_id, external_id, number, customer, amounts, status, issued_at, raw_json, last_synced_at)
- `trading_invoice` (same idea)
- Optional: `trading_sync_cursor` / run log

| Pros | Cons |
|------|------|
| Fast UI; searchable; works if external is down briefly | Stale until next sync; storage + conflict rules |
| Fits our RLS / `runWithTenant` model | Must define upsert keys (`tenant_id` + `external_id`) |

**Best when:** They want a normal ERP list/filter/PDF experience and can tolerate sync lag (e.g. 5–15 min or nightly).

### Option C — Hybrid

- Mirror **headers** (number, party, totals, status, dates) for lists.  
- On detail open, optionally **re-fetch** live PDF/lines from the external API.  

Good balance for most “show my trading docs here” requests.

### Option D — Deep link / embed only (lightest)

- Do not store documents; store only SSO or deep-link URLs into the trading product.  
- KingFisher shows a menu item “Open trading invoices” that opens their system.

| Pros | Cons |
|------|------|
| Almost no backend | Not “shown in this system”; poor single-pane UX |
| Days of work | No unified search with freight docs |

Use only if the customer accepts “shortcut,” not “data in ERP.”

### Option E — File / SFTP / CSV drop

- They export invoices/quotes nightly to S3/SFTP; we ingest.  
Useful when **no API** exists. Higher ops burden; schema mapping per export format.

---

## 6. Product design choices (must decide with the customer)

| Decision | Options | Suggested default for “just show invoices & quotes” |
|----------|---------|-----------------------------------------------------|
| **Direction** | Read-only vs bi-directional create | **Read-only** display first |
| **Document home** | Separate Trading menus vs merge into freight Invoices/Quotations | **Separate** menus/APIs (`/trading/...`) |
| **Financials** | Display only vs post to our GL / AR ageing | **Display only**; no GL until explicitly requested |
| **Customers/parties** | Link to our `Customer` / parties vs free-text from external | Free-text + optional later mapping |
| **PDF** | Store copy vs stream from external | Stream or cache PDF URL; don’t regenerate freight PDF templates |
| **Who enables** | SuperAdmin only vs Tenant Admin self-serve | **SuperAdmin enable**; Tenant Admin configures connection after enable |
| **Scope of enable** | One named tenant vs plan add-on for many | Start **allowlist of tenant_id(s)**; generalize later |

---

## 7. Tenant-only gating (how “just that company” works)

Because the platform has **no** module flags today, introduce one of:

### Recommended: Tenant setting + SuperAdmin allowlist

1. Platform table or tenant column, e.g. `tenant.trading_bridge_enabled = true` (or `tenant_features` JSON).  
2. SuperAdmin API: `PATCH /tenants/:id/features { trading_bridge: true }`.  
3. Guard on all `/trading/*` routes:

   - If `!tenant.trading_bridge_enabled` → `404` or `403 FEATURE_DISABLED` (prefer **404** to hide existence).  
4. Connection secrets stored only when enabled; wipe or lock on disable.

### Permissions (RBAC catalog — sync for that tenant)

Suggested new permissions (names illustrative):

- `trading.view_quotes`
- `trading.view_invoices`
- `trading.manage_connection` (Tenant Admin / Finance)
- `trading.sync` (manual sync trigger)

Assign to `TENANT_ADMIN`, `FINANCE`, optionally `SALES` (view only).  
Other tenants: feature off → no permission seed required, or seed but guard still blocks.

### Isolation checklist

- Every query: `tenant_id` from JWT + `prisma.runWithTenant`.  
- Never trust client-supplied `tenant_id`.  
- External credentials encrypted at rest (same class of care as 2FA secrets / future API keys).  
- Logs must not dump full invoice PII to shared logging tenants.  
- If webhooks inbound: authenticate with per-tenant secret; reject payloads for wrong tenant.

---

## 8. Suggested module shape (when we build)

```
src/modules/trading/   # or general-trading/
  trading.module.ts
  trading-quotes.controller.ts      → GET /trading/quotes, GET /trading/quotes/:id
  trading-invoices.controller.ts    → GET /trading/invoices, GET /trading/invoices/:id
  trading-connection.controller.ts  → GET/PUT connection (admin)
  trading-sync.controller.ts        → POST /trading/sync (manual)
  connectors/
    trading-connector.interface.ts
    http-trading.connector.ts       # first implementation
  trading-sync.cron.ts              # optional pull
```

**Do not** register freight invoice numbering / GL auto-post for these documents unless product expands scope.

Align with future **Week 21 Public API** only if *they* push into us; until then, prefer **outbound pull** from their API so we control schedule and mapping.

---

## 9. Discovery checklist (ask the trading-system owner)

Before coding, collect:

1. Product name / vendor of the current trading system.  
2. Can they expose **REST API** for quotes & invoices? Docs + auth (API key, OAuth, basic)?  
3. Or only **DB read replica / CSV / SFTP / email PDF**?  
4. Fields needed in our UI (minimum viable list):

   - Quote: number, date, customer name, currency, total, status, PDF link  
   - Invoice: number, date, due date, customer, currency, total, paid/outstanding, status, PDF link  
5. Volume (docs/month) and whether historical import is required.  
6. Multi-company / multi-branch in their system?  
7. Latency tolerance (live vs hourly vs daily).  
8. Legal: who owns data residency; can we store copies in our Neon DB?  
9. UI: ERP staff only, or also Customer Portal later? (**Portal = later phase; staff-only first.**)

---

## 10. Phased delivery (if approved later)

| Phase | Deliverable | Outcome |
|-------|-------------|---------|
| **P0 — Discovery** | Connector contract + sample payloads from their system | Know Option A/B/C/E |
| **P1 — Gate** | `trading_bridge_enabled` + SuperAdmin toggle + permissions | Only Tenant X can hit `/trading/*` |
| **P2 — Connection** | Encrypted connection settings + health check | Admin proves API works |
| **P3 — Read API** | List/detail quotes & invoices (proxy or first sync) | Backend usable from Swagger |
| **P4 — Sync harden** | Cron/webhook, upsert, sync logs, PDF fetch | Production-grade mirror |
| **P5 — UI** | Trading menus in frontend (separate from freight) | Staff “see everything in one login” |
| **P6 — Optional** | Map parties to our Customers; AR reports; portal visibility | Only if requested |

Estimated effort is **highly dependent on their API quality**. Rough ballpark after discovery:

- Deep-link only: days  
- Proxy read if clean API: ~1–2 weeks backend  
- Sync mirror + PDFs + admin UX: ~3–6 weeks backend (+ frontend)

*(Not committed schedule — research estimate.)*

---

## 11. Risks & non-goals

| Risk | Mitigation |
|------|------------|
| Accidental exposure to other tenants | Feature flag + RLS + integration tests with two tenants |
| Polluting freight Invoice/Quotation | Separate `/trading` domain and tables |
| Secret leakage | Encrypt secrets; never return raw keys on GET |
| External schema changes | Versioned connector; raw_json retain for re-map |
| Scope creep into full trading ERP | Written product boundary: **display + optional sync only** |
| GL / VAT double-counting | No auto GL post in v1 |

---

## 12. Recommendation (summary)

1. Treat this as a **tenant-scoped optional bridge**, not a new product line for all SuperAdmin customers.  
2. Prefer **sync mirror or hybrid** so the ERP UX stays fast and tenant-isolated.  
3. Keep documents in a **new Trading module**, separate from freight `/invoices` and `/quotations`.  
4. SuperAdmin **enables** the feature per tenant; Tenant Admin configures credentials.  
5. Start **read-only**; no GL posting.  
6. Do **discovery with the one trading system** before writing production connectors — the feasibility of their API/export is the real critical path.

---

## 13. Relation to existing roadmap

| Item | Relation |
|------|----------|
| Freight Weeks 1–16+ | Unchanged; this is **beside** the freight plan |
| Week 21 Public API / webhooks | May later *receive* pushes; not required for a pull-based pilot |
| Domain reuse (portal/vendor) | Only reuse if portal should see trading docs — **not** assumed |

---

## 14. Open questions for product owner

1. Confirm: **one tenant only** for the foreseeable future, or eventual paid add-on for many traders?  
2. Read-only forever, or eventual “create quote in trading system from KingFisher”?  
3. Must trading invoices appear in the **same** finance ageing screens as freight invoices?  
4. Is PDF/view enough, or do they need line-item edit (implies write-back — reject for v1)?  
5. Preferred filename/module branding in UI: “General Trading”, “Merchandise”, or customer’s product name?

---

*Document created for research. Implementation starts only after discovery answers (§9) and explicit scheduling — this file is not a Week commitment.*
