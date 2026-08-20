# Week 14 VPP + CRM — API Test Summary

**Target:** `http://localhost:3000`  
**When:** 2026-08-15T09:35:05.540Z  
**Suite:** `scripts/week14-vpp-crm-api-test.cjs`

## Verdict

**All 69 Week 14 endpoints covered** in flow order (P1→P7), with both happy-path and negative cases.

| Metric | Result |
|--------|-------:|
| Planned endpoints | 69 |
| Endpoints hit | 69 |
| Missing endpoints | 0 |
| Total executions | 154 |
| PASS cases succeeded | 89 / 90 |
| FAIL cases correctly rejected | 64 / 64 |
| Unexpected API failures | 1 |

## Documents

- [PASS results](./WEEK14_API_PASS_RESULTS.md) — happy-path cases
- [FAIL results](./WEEK14_API_FAIL_RESULTS.md) — auth / validation / business-rule negatives
- [JSON export](./WEEK14_API_TEST_RESULTS.json) — full machine-readable log

## Flow executed

1. Bootstrap — health → SuperAdmin signup/login → tenant create → tenant login → vendor + customer parties  
2. **P1** Vendor identity — invite/users, permissions, login/refresh/logout/me  
3. **P2** Vendor AP reads — invoices, payments, credit, aging, statement, schedule, TDS  
4. **P3** Vendor writes — submit DRAFT PI, disputes, staff review  
5. **P4** CRM leads — CRUD, pipeline, CSV import, convert  
6. **P5** Activity — call logs, follow-ups, enquiries → quote  
7. **P6** Dashboard — overview, 14 report types, budgets  
8. **P7** Email marketing — subscribers, templates, campaigns schedule/send  

## Sole unexpected failure

| Case | HTTP | Cause |
|------|------|-------|
| `GET /vendor/credit/statement.pdf` (vendor happy path) | 503 | Chromium/Puppeteer not installed locally — `PdfService` returns 503 by design |

Auth isolation and JSON statement (`GET /vendor/credit/statement`) both passed. PDF will pass once Chrome is available (or on a Render image with Chromium).

## Coverage notes

- `POST /vendor/auth/accept-invite` exercised as a negative case (invalid token). Create-invite API does not return the raw invite token, so a happy-path accept was not possible without DB access.
- `GET /vendor/payments/:id/remittance.pdf` covered via unknown-id negative (404).
- Production `https://kingfisherwings.onrender.com` was **503** during this run; testing used the local Nest process.

## Re-run

```bash
# local API must be up on :3000
node scripts/week14-vpp-crm-api-test.cjs
# or
BASE_URL=http://localhost:3000 node scripts/week14-vpp-crm-api-test.cjs
```
