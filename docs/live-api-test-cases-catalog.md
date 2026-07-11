# Live API Test Cases Catalog (Pass + Fail)

**Target:** https://kingfisherwings.onrender.com
**Swagger:** https://kingfisherwings.onrender.com/docs
**Total operations:** 287

## How to run automated suite

```bash
npm run test:live:fetch-spec   # refresh OpenAPI from Render
npm run test:live             # execute pass + fail against live
```

Reports:
- `docs/live-api-test-report.md`
- `docs/live-api-test-results.json`

Default strong password used in positive auth tests: `Welcome@123`

## Legend

| Case | Meaning |
|------|---------|
| **PASS** | Valid auth + valid data → expect 2xx |
| **FAIL (401)** | Missing Bearer token → expect Unauthorized |
| **FAIL (400)** | Invalid/missing body fields → expect Bad Request |
| **FAIL (403)** | Authenticated but missing permission → Forbidden |
| **FAIL (404)** | Unknown UUID / other tenant → Not Found |

## AWB Stock

### 1. `GET /awb-stock/batches`
_List AWB stock batches_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 2. `POST /awb-stock/batches`
_Register a new AWB number range for an airline_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 3. `GET /awb-stock/reports/low-stock`
_Batches at or below their low-stock threshold_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 4. `GET /awb-stock/allocations`
_List AWB allocations_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 5. `GET /awb-stock/batches/{id}`
_Get an AWB stock batch with recent allocations_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 6. `PATCH /awb-stock/batches/{id}`
_Update batch metadata (threshold, notes)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 7. `DELETE /awb-stock/batches/{id}`
_Soft-delete an empty AWB stock batch_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 8. `POST /awb-stock/batches/{id}/allocate`
_Allocate the next AWB number from a batch to a job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 9. `POST /awb-stock/batches/{id}/transfer-branch`
_Transfer batch ownership to another branch_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 10. `POST /awb-stock/allocations/{id}/void`
_Void an allocated (unused) AWB number_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 11. `POST /awb-stock/allocations/{id}/mark-used`
_Mark an allocated AWB as used (flown/printed)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Auth

### 12. `POST /auth/login`
_Staff login: tenant slug + email + password_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | Valid body (see `docs/api-complete-testing-guide.md`) |
| FAIL | 400 | Omit required fields / wrong types |

### 13. `POST /auth/tenant-login`
_Tenant admin login: tenant slug + the tenant's own password_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | Valid body (see `docs/api-complete-testing-guide.md`) |
| FAIL | 400 | Omit required fields / wrong types |

### 14. `POST /auth/super-admin/signup`
_Platform super admin self-registration_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | Valid body (see `docs/api-complete-testing-guide.md`) |
| FAIL | 400 | Omit required fields / wrong types |

### 15. `POST /auth/super-admin/login`
_Platform super admin login_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | Valid body (see `docs/api-complete-testing-guide.md`) |
| FAIL | 400 | Omit required fields / wrong types |

### 16. `POST /auth/refresh`
_Exchange a refresh token for a new token pair_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | Valid body (see `docs/api-complete-testing-guide.md`) |
| FAIL | 400 | Omit required fields / wrong types |

### 17. `POST /auth/logout`
_Revoke the current session_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 18. `GET /auth/sessions`
_List the authenticated user's own active sessions_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 19. `POST /auth/sessions/{sessionId}/revoke`
_Revoke one of the authenticated user's own sessions_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 20. `POST /auth/logout-all`
_Log out of every device (revokes all active sessions)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 21. `GET /auth/me`
_Get the authenticated principal (user, tenant owner, or super admin)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 22. `POST /auth/change-password`
_Change the authenticated user password_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 23. `POST /auth/tenant/change-password`
_Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Companies

### 24. `GET /companies`
_List this tenant's companies (usually just the one default, more for multi-entity groups)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 25. `POST /companies`
_Register an additional company under this tenant (multi-entity groups)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 26. `GET /companies/{id}`
_Get a company by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 27. `PATCH /companies/{id}`
_Update a company_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 28. `DELETE /companies/{id}`
_Soft-delete a company (blocked if it is the only one, or currently default)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Credit Notes

### 29. `GET /credit-notes`
_List credit notes_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 30. `POST /credit-notes`
_Create a credit note against a posted customer invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 31. `GET /credit-notes/{id}`
_Get a credit note_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 32. `POST /credit-notes/{id}/post`
_Post a draft credit note_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Files

### 33. `GET /files/{tenantId}/{filename}`
_Download a locally stored file (PDFs generated by the system)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Invoices

### 34. `GET /invoices`
_List customer invoices (Ch.18)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 35. `POST /invoices`
_Create a draft customer invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 36. `GET /invoices/reports/overdue`
_Overdue customer invoices past due_date with outstanding balance_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 37. `GET /invoices/{id}`
_Get invoice with lines_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 38. `PATCH /invoices/{id}`
_Update a draft invoice header_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 39. `DELETE /invoices/{id}`
_Soft-delete a draft invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 40. `POST /invoices/from-job/{jobId}`
_Create draft invoice from uninvoiced billable job charges_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 41. `POST /invoices/{id}/lines`
_Add a line to a draft invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 42. `PATCH /invoices/{id}/lines/{lineId}`
_Update an invoice line_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 43. `DELETE /invoices/{id}/lines/{lineId}`
_Remove an invoice line_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 44. `POST /invoices/{id}/post`
_Post a draft invoice (DRAFT -> POSTED)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 45. `POST /invoices/{id}/send`
_Email invoice PDF to customer_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 46. `POST /invoices/{id}/pdf`
_Generate invoice PDF_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 47. `GET /invoices/{id}/pdf`
_Get invoice PDF metadata_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 48. `POST /invoices/{id}/cancel`
_Cancel an invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Jobs

### 49. `GET /jobs`
_List jobs_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 50. `POST /jobs`
_Create a job (booking). AIR_EXPORT jobs auto-get their detail row + the full 15-milestone taxonomy. Set parent_job_id to create a HOUSE job under an existing master._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 51. `GET /jobs/{id}`
_Get a job with air details, charges, milestones, and its house jobs (if a master)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 52. `PATCH /jobs/{id}`
_Update a job (not allowed once COMPLETED or CANCELLED)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 53. `DELETE /jobs/{id}`
_Soft-delete a completed or cancelled job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 54. `GET /jobs/{id}/house-jobs`
_List the house jobs consolidated under this master job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 55. `GET /jobs/{id}/milestones`
_List all milestones for a job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 56. `POST /jobs/{id}/milestones`
_Add a custom milestone outside the standard taxonomy_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 57. `GET /jobs/{id}/pnl`
_Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 58. `GET /jobs/{id}/notes`
_List notes on a job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 59. `POST /jobs/{id}/notes`
_Add a note to a job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 60. `GET /jobs/{id}/documents`
_List documents attached to a job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 61. `POST /jobs/{id}/documents`
_Register a document on a job (metadata + file URL)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 62. `GET /jobs/{id}/containers`
_List containers on a Sea FCL job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 63. `POST /jobs/{id}/containers`
_Add a container to a Sea FCL job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 64. `POST /jobs/{id}/close`
_Close a job (status -> COMPLETED)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 65. `POST /jobs/{id}/cancel`
_Cancel a job (status -> CANCELLED)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 66. `PATCH /jobs/{id}/air-details`
_Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 67. `PATCH /jobs/{id}/sea-fcl-details`
_Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 68. `PATCH /jobs/{id}/milestones/{milestoneId}`
_Update a milestone — set actual_date to mark it complete_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 69. `POST /jobs/{id}/charges`
_Add a charge line — Job P&L recalculates automatically_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 70. `PATCH /jobs/{id}/charges/{chargeId}`
_Update a charge line_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 71. `DELETE /jobs/{id}/charges/{chargeId}`
_Remove a charge line_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 72. `POST /jobs/{id}/prorate-cost/{chargeCodeId}`
_Distribute a master job's cost line to its house jobs, proportionally by chargeable weight_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 73. `PATCH /jobs/{id}/notes/{noteId}`
_Update a job note_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 74. `DELETE /jobs/{id}/notes/{noteId}`
_Remove a job note_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 75. `PATCH /jobs/{id}/documents/{documentId}`
_Update a draft document metadata_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 76. `DELETE /jobs/{id}/documents/{documentId}`
_Remove a draft document_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 77. `POST /jobs/{id}/documents/{documentId}/finalize`
_Finalize a document (DRAFT -> ORIGINAL, locked)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 78. `GET /jobs/{id}/documents/generation-status`
_List async document generation tasks for a job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 79. `POST /jobs/{id}/documents/hawb`
_Queue HAWB PDF generation (Puppeteer + BullMQ)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 80. `POST /jobs/{id}/documents/mawb`
_Queue MAWB PDF generation (Puppeteer + BullMQ)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 81. `POST /jobs/{id}/documents/pre-alert`
_Queue pre-alert document PDF generation_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 82. `POST /jobs/{id}/documents/cargo-manifest`
_Queue cargo manifest PDF generation_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 83. `POST /jobs/{id}/pre-alert/send`
_Send pre-alert and mark PRE_ALERT_SENT milestone complete_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 84. `PATCH /jobs/{id}/containers/{containerId}`
_Update a container on a Sea FCL job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 85. `DELETE /jobs/{id}/containers/{containerId}`
_Remove a container from a Sea FCL job_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Airlines

### 86. `GET /masters/airlines`
_list airlines_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 87. `POST /masters/airlines`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 88. `GET /masters/airlines/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 89. `PATCH /masters/airlines/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 90. `DELETE /masters/airlines/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Airports

### 91. `GET /masters/airports`
_List airports_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 92. `POST /masters/airports`
_Create an airport_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 93. `GET /masters/airports/{id}`
_Get an airport by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 94. `PATCH /masters/airports/{id}`
_Update an airport_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 95. `DELETE /masters/airports/{id}`
_Soft-delete an airport_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Banks

### 96. `GET /masters/banks`
_list banks_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 97. `POST /masters/banks`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 98. `GET /masters/banks/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 99. `PATCH /masters/banks/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 100. `DELETE /masters/banks/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Branches

### 101. `GET /masters/branches`
_list branches_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 102. `POST /masters/branches`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 103. `GET /masters/branches/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 104. `PATCH /masters/branches/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 105. `DELETE /masters/branches/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — ChargeCodes

### 106. `GET /masters/charge-codes`
_list chargecodes_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 107. `POST /masters/charge-codes`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 108. `GET /masters/charge-codes/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 109. `PATCH /masters/charge-codes/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 110. `DELETE /masters/charge-codes/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — ContainerTypes

### 111. `GET /masters/container-types`
_List container types_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 112. `POST /masters/container-types`
_Create a container type_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 113. `GET /masters/container-types/{id}`
_Get a container type by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 114. `PATCH /masters/container-types/{id}`
_Update a container type_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 115. `DELETE /masters/container-types/{id}`
_Soft-delete a container type_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Countries

### 116. `GET /masters/countries`
_List countries_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 117. `POST /masters/countries`
_Create a country_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 118. `GET /masters/countries/{id}`
_Get a country by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 119. `PATCH /masters/countries/{id}`
_Update a country_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 120. `DELETE /masters/countries/{id}`
_Soft-delete a country_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Currencies

### 121. `GET /masters/currencies`
_List currencies_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 122. `POST /masters/currencies`
_Create a currency_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 123. `GET /masters/currencies/{id}`
_Get a currency by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 124. `PATCH /masters/currencies/{id}`
_Update a currency_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 125. `DELETE /masters/currencies/{id}`
_Soft-delete a currency_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Departments

### 126. `GET /masters/departments`
_list departments_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 127. `POST /masters/departments`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 128. `GET /masters/departments/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 129. `PATCH /masters/departments/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 130. `DELETE /masters/departments/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Designations

### 131. `GET /masters/designations`
_list designations_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 132. `POST /masters/designations`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 133. `GET /masters/designations/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 134. `PATCH /masters/designations/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 135. `DELETE /masters/designations/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Exchange Rates

### 136. `GET /masters/exchange-rates`
_List exchange rates, optionally filtered by currency_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 137. `POST /masters/exchange-rates`
_Record (or correct) an exchange rate for a date — upserts by currency + date_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 138. `GET /masters/exchange-rates/latest/{currencyId}`
_Most recent rate on file for a currency_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Holidays

### 139. `GET /masters/holidays`
_list holidays_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 140. `POST /masters/holidays`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 141. `GET /masters/holidays/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 142. `PATCH /masters/holidays/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 143. `DELETE /masters/holidays/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — HsCodes

### 144. `GET /masters/hs-codes`
_List HS codes_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 145. `POST /masters/hs-codes`
_Create an HS code_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 146. `GET /masters/hs-codes/{id}`
_Get an HS code by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 147. `PATCH /masters/hs-codes/{id}`
_Update an HS code_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 148. `DELETE /masters/hs-codes/{id}`
_Soft-delete an HS code_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Ports

### 149. `GET /masters/ports`
_List ports_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 150. `POST /masters/ports`
_Create a port_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 151. `GET /masters/ports/{id}`
_Get a port record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 152. `PATCH /masters/ports/{id}`
_Update a port_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 153. `DELETE /masters/ports/{id}`
_Soft-delete a port_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — ShippingLines

### 154. `GET /masters/shipping-lines`
_list shippinglines_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 155. `POST /masters/shipping-lines`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 156. `GET /masters/shipping-lines/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 157. `PATCH /masters/shipping-lines/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 158. `DELETE /masters/shipping-lines/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — TaxRates

### 159. `GET /masters/tax-rates`
_list taxrates_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 160. `POST /masters/tax-rates`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 161. `GET /masters/tax-rates/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 162. `PATCH /masters/tax-rates/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 163. `DELETE /masters/tax-rates/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Truckers

### 164. `GET /masters/truckers`
_list truckers_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 165. `POST /masters/truckers`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 166. `GET /masters/truckers/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 167. `PATCH /masters/truckers/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 168. `DELETE /masters/truckers/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — UnitsOfMeasure

### 169. `GET /masters/units-of-measure`
_list unitsofmeasure_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 170. `POST /masters/units-of-measure`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 171. `GET /masters/units-of-measure/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 172. `PATCH /masters/units-of-measure/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 173. `DELETE /masters/units-of-measure/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Vessels

### 174. `GET /masters/vessels`
_list vessels_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 175. `POST /masters/vessels`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 176. `GET /masters/vessels/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 177. `PATCH /masters/vessels/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 178. `DELETE /masters/vessels/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Masters — Warehouses

### 179. `GET /masters/warehouses`
_list warehouses_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 180. `POST /masters/warehouses`
_Create a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 181. `GET /masters/warehouses/{id}`
_Get a record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 182. `PATCH /masters/warehouses/{id}`
_Update a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 183. `DELETE /masters/warehouses/{id}`
_Soft-delete a record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Organization Profile

### 184. `GET /organization/profile`
_Get this tenant's own organization profile_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 185. `PATCH /organization/profile`
_Update this tenant's own organization profile (Ch.27.1)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Organization — Bank Accounts

### 186. `GET /organization/bank-accounts`
_List this tenant's own bank accounts_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 187. `POST /organization/bank-accounts`
_Add a bank account_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 188. `GET /organization/bank-accounts/{id}`
_Get a bank account by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 189. `PATCH /organization/bank-accounts/{id}`
_Update a bank account_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 190. `DELETE /organization/bank-accounts/{id}`
_Soft-delete a bank account_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Organization — Number Formats

### 191. `GET /organization/number-formats`
_List all configured document number formats (Ch.2.2)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 192. `POST /organization/number-formats`
_Configure the number format for a document type_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 193. `GET /organization/number-formats/{documentType}`
_Get the number format for one document type_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 194. `PATCH /organization/number-formats/{documentType}`
_Update the number format for a document type_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 195. `GET /organization/number-formats/{documentType}/preview`
_Preview the next number for this format without consuming a sequence value_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Other

### 196. `GET /health`

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Parties

### 197. `GET /parties`
_List parties (customers, agents, suppliers, carriers, etc.)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 198. `POST /parties`
_Create a party_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 199. `GET /parties/{id}`
_Get a party with its contacts and addresses_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 200. `PATCH /parties/{id}`
_Update a party_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 201. `DELETE /parties/{id}`
_Soft-delete a party_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 202. `POST /parties/import`
_Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 203. `PATCH /parties/{id}/credit-status`
_Change credit status (Active / On Hold / Blacklisted)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 204. `POST /parties/{id}/contacts`
_Add a contact to a party_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 205. `PATCH /parties/{id}/contacts/{contactId}`
_Update a party's contact_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 206. `DELETE /parties/{id}/contacts/{contactId}`
_Remove a party's contact_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 207. `POST /parties/{id}/addresses`
_Add an address to a party_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 208. `PATCH /parties/{id}/addresses/{addressId}`
_Update a party's address_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 209. `DELETE /parties/{id}/addresses/{addressId}`
_Remove a party's address_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Payment Requests

### 210. `GET /payment-requests`
_List payment requests_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 211. `POST /payment-requests`
_Create a payment request_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 212. `GET /payment-requests/{id}`
_Get a payment request_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 213. `PATCH /payment-requests/{id}`
_Update a pending payment request_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 214. `DELETE /payment-requests/{id}`
_Soft-delete a pending payment request_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 215. `POST /payment-requests/{id}/approve`
_Approve a payment request_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 216. `POST /payment-requests/{id}/reject`
_Reject a payment request_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 217. `POST /payment-requests/{id}/mark-paid`
_Mark an approved payment request as paid_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Purchase Invoices

### 218. `GET /purchase-invoices`
_List purchase invoices (vendor bills)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 219. `POST /purchase-invoices`
_Create a draft purchase invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 220. `GET /purchase-invoices/{id}`
_Get a purchase invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 221. `PATCH /purchase-invoices/{id}`
_Update a draft purchase invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 222. `DELETE /purchase-invoices/{id}`
_Soft-delete a draft purchase invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 223. `POST /purchase-invoices/{id}/post`
_Post a draft purchase invoice_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Quotations — Online Tariff Master

### 224. `GET /quotations/tariffs`
_List tariff rate cards_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 225. `POST /quotations/tariffs`
_Create a tariff rate card (sale rate + cost rate per lane/service/container type)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 226. `GET /quotations/tariffs/{id}`
_Get a tariff by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 227. `PATCH /quotations/tariffs/{id}`
_Update a tariff_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 228. `DELETE /quotations/tariffs/{id}`
_Soft-delete a tariff_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Quotations — Zip Distance Master

### 229. `GET /quotations/zip-distances`
_List zip-to-zip distances_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 230. `POST /quotations/zip-distances`
_Record a distance between two zip/location codes_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 231. `GET /quotations/zip-distances/{id}`
_Get a zip distance record by id_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 232. `PATCH /quotations/zip-distances/{id}`
_Update a zip distance record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 233. `DELETE /quotations/zip-distances/{id}`
_Soft-delete a zip distance record_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Quotations

### 234. `GET /quotations`
_List quotations_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 235. `POST /quotations`
_Create a quotation (DRAFT)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 236. `GET /quotations/reports/chargewise`
_"All Quotations Chargewise" report — same filters as the list, with each charge line included_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 237. `GET /quotations/reports/analytics`
_Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 238. `GET /quotations/reports/analytics/conversion`
_Win/loss and quote-to-job conversion rates_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 239. `GET /quotations/reports/analytics/lost-reasons`
_Lost quotation breakdown by reason code_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 240. `GET /quotations/reports/analytics/response-time`
_Average hours from creation to submit/send_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 241. `POST /quotations/online-quote`
_Public online quote widget — customer submits cargo details, system auto-calculates from tariff (Ch.7.5)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | Valid body (see `docs/api-complete-testing-guide.md`) |
| FAIL | 400 | Omit required fields / wrong types |

### 242. `POST /quotations/expire-due`
_Batch-expire all quotations past valid_until (intended for daily cron)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 243. `GET /quotations/{id}`
_Get a quotation with its lines, status history, and approvals_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 244. `PATCH /quotations/{id}`
_Update a quotation header (DRAFT or REJECTED only)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 245. `DELETE /quotations/{id}`
_Soft-delete a quotation (DRAFT only)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 246. `GET /quotations/{id}/revisions`
_List all revisions in this quotation version chain_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 247. `POST /quotations/{id}/lines`
_Add a charge line — GP recalculates automatically_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 248. `POST /quotations/{id}/apply-tariff`
_Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 249. `PATCH /quotations/{id}/lines/{lineId}`
_Update a charge line_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 250. `DELETE /quotations/{id}/lines/{lineId}`
_Remove a charge line_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 251. `POST /quotations/{id}/submit`
_DRAFT/REJECTED -> SUBMITTED, opens the approval cycle_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 252. `POST /quotations/{id}/approve`
_SUBMITTED -> APPROVED_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 253. `POST /quotations/{id}/reject`
_SUBMITTED -> REJECTED (editable again, can be resubmitted)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 254. `POST /quotations/{id}/send`
_APPROVED -> SENT_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 255. `POST /quotations/{id}/mark-won`
_SENT -> WON_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 256. `POST /quotations/{id}/mark-lost`
_SENT -> LOST, with a reason code_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 257. `POST /quotations/{id}/duplicate`
_Clone into a new revision (new DRAFT, version+1, linked to the same parent)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 258. `POST /quotations/{id}/convert-to-job`
_WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 259. `POST /quotations/{id}/archive`
_Archive a closed quotation (soft-delete)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 260. `POST /quotations/{id}/expire`
_Manually expire a quotation past its valid_until date_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 261. `POST /quotations/{id}/pdf`
_Queue PDF generation for a quotation (customer or internal mode)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 262. `GET /quotations/{id}/pdf`
_Get quotation PDF URLs and recent generation tasks_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 263. `GET /quotations/{id}/pdf/status`
_List PDF generation task status for a quotation_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 264. `POST /quotations/{id}/send-email`
_Email quotation PDF to customer (generates PDF if not yet available)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Search

### 265. `GET /search`
_Global search across jobs, quotations, and parties_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Tenants (Super Admin)

### 266. `POST /tenants`
_Create a new tenant (also provisions its TENANT_ADMIN owner user)_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 267. `GET /tenants`
_Get all tenants_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 268. `GET /tenants/statistics`
_Tenant statistics_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 269. `POST /tenants/sync-permissions`
_Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 270. `POST /tenants/{id}/sync-permissions`
_Reconcile one tenant against the current permission/role catalog_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 271. `GET /tenants/{id}`
_Get tenant by ID_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 272. `PATCH /tenants/{id}`
_Update tenant_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 273. `DELETE /tenants/{id}`
_Soft delete tenant_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 274. `PATCH /tenants/{id}/restore`
_Restore tenant_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 275. `PATCH /tenants/{id}/activate`
_Activate tenant_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 276. `PATCH /tenants/{id}/deactivate`
_Deactivate tenant_

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

## Users

### 277. `GET /users`
_List users for the current tenant (paginated, filterable)._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 278. `POST /users`
_Create a user. Returns a system-generated temporary password._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 279. `GET /users/{id}`
_Get a single user by id._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 280. `PATCH /users/{id}`
_Update a user._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 281. `DELETE /users/{id}`
_Soft-delete a user._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 282. `PATCH /users/{id}/status`
_Change a user's status (activate, suspend, etc)._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 283. `POST /users/bulk`
_Apply an action (activate/deactivate/suspend/delete/restore) to multiple users._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 284. `POST /users/{id}/restore`
_Restore a soft-deleted user._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 285. `POST /users/me/change-password`
_Authenticated user changes their own password._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 286. `POST /users/{id}/admin-reset-password`
_Admin resets a target user's password to a new temporary password._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |

### 287. `POST /users/{id}/force-logout`
_Force-logout: revoke a target user's active sessions on all devices._

| Case | Expected | How to test |
|------|----------|-------------|
| PASS | 2xx | `Authorization: Bearer <token>` + valid payload / real id |
| FAIL | 401 | Call with no Authorization header |
| FAIL | 400/403/404 | Bad body, wrong role, or random UUID |
