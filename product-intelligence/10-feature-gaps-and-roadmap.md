# Feature Gaps and Recommended Roadmap

**Purpose:** Separate shipped capability from incomplete, stubbed, or marketing-risky gaps.  
**Sources:** `docs/decision.md`, `docs/flow.md`, `WAVE_STATUS` / fresa-parity notes, code stubs, portal extras docs.

---

## 1. Incomplete or partial functionality

| Area | Gap | Impact | Priority |
|------|-----|--------|----------|
| Live vessel/flight tracking | Needs external API keys; otherwise stub/links | Tracking demos less “live” | Medium |
| Customs declaration submit | Stub adapters in places | Cannot claim certified global e-filing | High (for customs sales) |
| EDI country stacks | Adapter-style; not all live | Docs desk depth varies by connector | High (regional) |
| FRESA report registry | Many templates unbound | “Hundreds of reports” claim unsafe | Medium |
| E-invoice country portals | Partial vs full India/KSA-style depth | Finance compliance marketing | Medium |
| Staff 2FA | Routes exist; not default-linked | Security claims limited | High |
| Portal/vendor MFA | Not a verified default | Portal security messaging | High |
| WhatsApp channel | Stub/deferred | Do not market as core | Low (unless product prioritizes) |
| WebSocket notifications | Polling only | Realtime UX expectation | Low–Medium |
| WordPress API sign-in | Not implemented; link-mode only | Website SSO story limited | Medium |
| Vendor TDS | Stub | India AP compliance | Medium (market-dependent) |
| Dual-read shipment↔job | Migration coexistence | FE complexity | Medium (tech debt) |
| Frontend UAT programme | Separate from this API repo | Website screenshots / polish | High (GTM) |
| Native mobile app | Missing | Mobile buyers | Low unless strategy changes |

---

## 2. Security gaps (before stronger public claims)

See also `03` section B.

1. Enforce MFA for privileged roles  
2. Independent penetration test  
3. Formal retention/deletion productization  
4. Upload malware scanning assurance  
5. Backup restore drills + published RPO/RTO only after proof  
6. Trust Center with subprocessors list  
7. Counsel-approved legal pages  

---

## 3. Portal extras still largely missing

Week 13 shortlist A items are largely shipped (accept/reject, prefs, etc.). Many Tier 2–3 extras in `Week13-Customer-Portal-Extra-Features.md` remain missing (treat as backlog, not product facts). Examples of themes still incomplete historically: advanced portal analytics, some collaboration niceties, broader self-serve admin — verify against current controllers before promising any single extra.

---

## 4. Documentation debt (internal)

| Issue | Action |
|-------|--------|
| Root README lists only early modules | Update README to match `app.module.ts` |
| CUSTOMER_PORTAL_FUNCTIONAL_SPEC header “pre-implementation” | Mark superseded |
| WEEK13 plan “Not started” header | Mark shipped / historical |
| Stale coverage % PDFs | Point to `WAVE_STATUS` / fresa-parity |

---

## 5. Recommended development priorities (GTM-oriented)

### P0 — Trust & sales safety
1. MFA enforcement for Tenant Admin + Finance  
2. Security page + Trust Center content freeze (no false claims)  
3. Legal pages  
4. Sanitized demo tenant + screenshot kit  
5. Confirm production durable storage + backup story with ops  

### P1 — Differentiation depth
1. Harden customs filing connectors for target countries only (honest scope)  
2. Bind highest-value report packs customers ask for  
3. FE UAT for quote→job→invoice→portal happy path  
4. Payment provider go-live checklist per tenant  

### P2 — Experience
1. Notification realtime (SSE/WebSocket) if customers demand it  
2. Selective portal extras with highest support-ticket reduction  
3. WordPress deeper integration only if website strategy requires API sign-in  

### P3 — Expansion
1. Mobile strategy decision (responsive web vs native)  
2. WhatsApp Business only with clear ops design  
3. Broader EDI geography  

---

## 6. Marketing stop-list (do not advertise yet)

- SOC 2 / ISO certified (unless independently true)  
- Global certified customs filing everywhere  
- Native mobile app  
- WhatsApp-first automation  
- “All Fresa reports included”  
- Guaranteed uptime percentages  
- Card data stored by Kingfisher  
- Invented customer counts/logos  

---

## 7. Shipped foundation (do advertise carefully)

Use `02` and `06`. The platform already has a credible multi-mode ERP continuum with portals and ledger-grade finance — that is enough for a serious website if honesty is maintained.
