# KingFisher Wings / Fresa Gold ERP
# Week 13 Customer Portal — Extra Features Beyond Plan

**Document type:** Productivity enhancement backlog (backend-first)  
**Scope:** Customer Party Portal only (not Vendor Payment Portal / CRM)  
**Audience:** Product & engineering  
**Date:** 8 August 2026  

---

## Purpose

Week 13 Customer Portal backend is feature-complete against the functional plan (auth, shipments, documents, quotations, finance/CCP, messages, track widget, notifications, invite).

This document consolidates **all suggested extras beyond the plan** that improve customer productivity and product quality before moving to Week 14 — without requiring a full UI build first (APIs + domain logic).

---

## Guiding principles

- Backend-first; UI can consume later.
- Customer facilitation only — no staff ERP redesign.
- No payment gateway, no full live chat, no customer editing of jobs/invoices/quotes.
- Do not pull Week 14 Vendor Payment Portal or CRM into this backlog.
- Prefer request forms + read-enriched views over write access to ops data.

---

## Tier 1 — Strong productivity wins (recommended first)

| # | Feature | What it does | Why it helps |
|---|---------|--------------|--------------|
| 1 | Portal quote accept / reject | `POST …/quotations/:id/accept` and `…/reject` (with reason) | Cuts email lag; sales closes faster |
| 2 | Document expiry / readiness alerts | Notify when required docs (DO, CAN, POD, etc.) are uploaded or about to expire | Stops “is my DO ready?” chasing |
| 3 | Saved filters / dashboard preferences | Per-user defaults: shipment filters, invoice view, notification prefs | Power users work faster every day |
| 4 | Bulk / export endpoints | CSV export for shipments and invoices (statement PDF already exists) | Finance customers live in Excel; fewer support tickets |
| 5 | Shared party inbox | Party-level message visibility for all contacts at the same Party | Matches real CS + finance sharing |

---

## Tier 2 — Freight differentiation

| # | Feature | What it does | Why it helps |
|---|---------|--------------|--------------|
| 6 | Container / cargo visibility pack | Safe cargo/container summary (containers, seals, free days, demurrage flags) without financials | High value for importers |
| 7 | Appointment / delivery window requests | Structured delivery/pickup window request → staff queue | Reduces phone/WhatsApp for last-mile / DO pickup |
| 8 | Milestone subscription controls | Per-party or per-user opt-in for milestone alerts (+ optional email) | Turns alert noise into a product feature |
| 9 | Credit early-warning digests | Daily digest: invoices due soon, credit % used | Finance foresight; fewer holds |
| 10 | Public track short links | Branded short or signed track URLs for email/SMS without full portal login | Ops/sales paste into emails easily |

---

## Tier 3 — Platform polish & trust

| # | Feature | What it does | Why it helps |
|---|---------|--------------|--------------|
| 11 | Portal audit log | Who viewed/downloaded which invoice or document | Compliance and dispute support |
| 12 | Password change + force rotate | Self-serve password change; staff can force rotate | Security without staff reset every time |
| 13 | 2FA for portal | OTP / authenticator for portal login | Enterprise customer requirement |
| 14 | API keys for integrations | Customer pulls shipment status into their own TMS | Large shipper stickiness |
| 15 | Idempotent dispute/message create | Idempotency keys on create endpoints | Prevents double-submit on flaky networks |
| 16 | Rate limits per party | Cap noisy portal users | Protects staff inbox quality |

---

## Ops self-serve (cuts phone / email)

| # | Feature | What it does | Why it helps |
|---|---------|--------------|--------------|
| 17 | Exception / hold reason visibility | Safe hold reason + “what customer must do” on a shipment | Answers “why isn’t it moving?” |
| 18 | Document checklist per shipment | Required vs available vs missing docs per job | Clear “what’s blocking me” |
| 19 | POD / delivery confirmation request | Customer confirms receipt or flags short/damage → staff ticket | Closes last-mile loop without WhatsApp |
| 20 | Amend / SI / shipping-instruction request | Structured amend form (consignee, notify, marks, notes) with status flow | High exporter traffic; CS time saver |
| 21 | Container free-time countdown | Remaining free days + demurrage risk from container/ETA data | Daily stickiness for importers |

---

## Finance friction reducers

| # | Feature | What it does | Why it helps |
|---|---------|--------------|--------------|
| 22 | Invoice “I will pay by” commitment | Intent only: date + method (cheque / transfer / PDC) — not a gateway | Finance forecast queue; fewer chase calls |
| 23 | Remittance advice upload | Reference + optional PDF for staff matching | Customer feels heard; matching faster |
| 24 | Tax / GST invoice pack download | Month or job multi-PDF / ZIP pack | Compliance users ask constantly |
| 25 | Dispute context pack | Auto-attach invoice lines + shipment ref when raising a dispute | Fewer “which invoice?” loops |

---

## Quote & commercial

| # | Feature | What it does | Why it helps |
|---|---------|--------------|--------------|
| 26 | Re-quote / clone previous | Prefill new quote request from past quotation or job | Repeat customers book in seconds |
| 27 | Quote comparison (variants) | Side-by-side customer-safe totals for Option A/B | Faster accept/reject decisions |
| 28 | Quote validity countdown + remind | Notify N days before quote expires | Protects both sides from silent expiry |

---

## Collaboration inside the customer org

| # | Feature | What it does | Why it helps |
|---|---------|--------------|--------------|
| 29 | Internal notes (party-private) | Notes on a shipment visible only to the Party (not staff) | CS + finance coordination |
| 30 | Watchlist / follow shipment | Pin jobs; only those drive push/email | Better than all-or-nothing alerts |
| 31 | Delegate access (temporary viewer) | Time-boxed view-only access for broker/warehouse on one job or docs | Common real-world freight pattern |

---

## Onboarding & confidence

| # | Feature | What it does | Why it helps |
|---|---------|--------------|--------------|
| 32 | First-login guided checklist (API) | Invite accepted, profile complete, first shipment/invoice actions | Adoption visibility for staff + clarity for users |
| 33 | Contact directory | Tenant-configured CS / ops / finance contacts per party (read-only) | Stops wrong-person emails |
| 34 | FAQ / knowledge snippets by event | Tenant-managed help snippets for milestones/exceptions | Self-serve before opening a message |

---

## Quiet but high-trust

| # | Feature | What it does | Why it helps |
|---|---------|--------------|--------------|
| 35 | Signed document share links | Time-limited public URL for one DO/invoice; audit-logged | Share with warehouse without full portal login |
| 36 | Activity feed (customer timeline) | Unified feed: milestones, docs, invoices, replies | One place to stay current |

---

## Suggested implementation order (Week 13.5)

### Shortlist A — original “before Week 14” five
1. Quote accept / reject (#1)  
2. Export CSV — shipments + invoices (#4)  
3. Party-shared messages (#5)  
4. Document-ready notifications (#2)  
5. Portal preferences + milestone opt-in (#3 + #8)  

### Shortlist B — maximum customer facilitation five
1. Document checklist per shipment (#18)  
2. Free-time / demurrage risk (#21)  
3. Re-quote from past (#26)  
4. Remittance advice upload (#23)  
5. Activity feed (#36)  

---

## Explicitly out of scope (do not pull into Week 13.5)

| Item | Reason |
|------|--------|
| Online payment gateway | Large PCI / product surface; not required for first productivity gains |
| Full live agent chat / WebSocket chat | Replies already exist; realtime chat is its own product |
| Customer editing of jobs, invoices, or quotes | Spec forbids; breaks ops trust |
| Vendor Payment Portal | Week 14 |
| CRM | Week 14 |
| WhatsApp as primary channel | Optional later; email + in-app first |

---

## Feature index (all 36)

1. Portal quote accept / reject  
2. Document expiry / readiness alerts  
3. Saved filters / dashboard preferences  
4. Bulk / export endpoints (CSV)  
5. Shared party inbox  
6. Container / cargo visibility pack  
7. Appointment / delivery window requests  
8. Milestone subscription controls  
9. Credit early-warning digests  
10. Public track short links  
11. Portal audit log  
12. Password change + force rotate  
13. 2FA for portal  
14. API keys for integrations  
15. Idempotent dispute/message create  
16. Rate limits per party  
17. Exception / hold reason visibility  
18. Document checklist per shipment  
19. POD / delivery confirmation request  
20. Amend / SI / shipping-instruction request  
21. Container free-time countdown  
22. Invoice “I will pay by” commitment  
23. Remittance advice upload  
24. Tax / GST invoice pack download  
25. Dispute context pack  
26. Re-quote / clone previous  
27. Quote comparison (variants)  
28. Quote validity countdown + remind  
29. Internal notes (party-private)  
30. Watchlist / follow shipment  
31. Delegate access (temporary viewer)  
32. First-login guided checklist  
33. Contact directory  
34. FAQ / knowledge snippets by event  
35. Signed document share links  
36. Activity feed (customer timeline)  

---

## Notes for engineering

- Reuse existing portal guards, party ownership helpers, and domain services.
- Keep writes as **request / intent** records with staff review queues where ops ownership must stay with the forwarder.
- Emit notifications consistently with existing `NotificationType` patterns.
- Every new portal read/write must remain tenant- and party-scoped.

---

*End of document — KingFisher Wings / Fresa Gold · Customer Portal Week 13 extras*
