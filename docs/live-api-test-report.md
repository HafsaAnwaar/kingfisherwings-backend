# Live API Test Report

**Target:** https://kingfisherwings.onrender.com
**Run ID:** 1783751652556
**When:** 2026-07-11T06:43:03.740Z
**OpenAPI operations catalogued:** 287
**Test executions:** 524
**Passed:** 515
**Failed:** 9

## Summary by tag

| Tag | Pass | Fail |
|-----|------|------|
| AWB Stock | 21 | 0 |
| Auth | 23 | 2 |
| Companies | 8 | 0 |
| Credit Notes | 6 | 1 |
| Files | 1 | 0 |
| Invoices | 29 | 2 |
| Jobs | 71 | 1 |
| Masters — Airlines | 7 | 0 |
| Masters — Airports | 7 | 0 |
| Masters — Banks | 7 | 0 |
| Masters — Branches | 7 | 0 |
| Masters — ChargeCodes | 7 | 0 |
| Masters — ContainerTypes | 7 | 0 |
| Masters — Countries | 7 | 0 |
| Masters — Currencies | 7 | 0 |
| Masters — Departments | 7 | 0 |
| Masters — Designations | 7 | 0 |
| Masters — Exchange Rates | 4 | 0 |
| Masters — Holidays | 7 | 0 |
| Masters — HsCodes | 7 | 0 |
| Masters — Ports | 7 | 0 |
| Masters — ShippingLines | 7 | 0 |
| Masters — TaxRates | 7 | 0 |
| Masters — Truckers | 7 | 0 |
| Masters — UnitsOfMeasure | 7 | 0 |
| Masters — Vessels | 7 | 0 |
| Masters — Warehouses | 7 | 0 |
| Masters | 27 | 1 |
| Organization Profile | 3 | 0 |
| Organization — Bank Accounts | 7 | 0 |
| Organization — Number Formats | 7 | 0 |
| Organization | 8 | 0 |
| Parties | 26 | 0 |
| Payment Requests | 16 | 0 |
| Purchase Invoices | 9 | 1 |
| Quotations — Online Tariff Master | 7 | 0 |
| Quotations — Zip Distance Master | 7 | 0 |
| Quotations | 60 | 1 |
| Search | 2 | 0 |
| Tenants (Super Admin) | 18 | 0 |
| Tenants | 1 | 0 |
| Untagged | 1 | 0 |
| Users | 20 | 0 |

## Case types

- **FAIL_CASE** — negative test (no auth / bad payload). Status PASS means the API correctly rejected.
- **PASS_CASE** — positive test with proper data. Status PASS means the API succeeded as expected.

## Failed executions

| Type | Method | Path | Expected | Got | Notes |
|------|--------|------|----------|-----|-------|
| PASS_CASE | POST | /masters/tax-rates | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| PASS_CASE | POST | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/pdf | 2xx |  | fetch failed |
| PASS_CASE | POST | /jobs/365b233e-6602-465c-b9aa-bc088a151162/documents/hawb | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| PASS_CASE | POST | /invoices/87cb2ed9-df7e-452f-b304-246f083dd953/pdf | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| PASS_CASE | POST | /invoices/87cb2ed9-df7e-452f-b304-246f083dd953/send | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| PASS_CASE | POST | /credit-notes | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| PASS_CASE | POST | /purchase-invoices | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| FAIL_CASE | POST | /auth/logout | 400/403/404/422 | 200 | Unexpected success/status 200 |
| PASS_CASE | POST | /auth/logout | 2xx | 401 | {"message":"Session is no longer valid.","error":"Unauthorized","statusCode":401} |

## Full results

| Status | Type | Method | Path | Title | HTTP |
|--------|------|--------|------|-------|------|
| PASS | FAIL_CASE | GET | /health | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /tenants | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /tenants | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /tenants/statistics | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /tenants/sync-permissions | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /tenants/{id}/sync-permissions | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /tenants/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /tenants/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /tenants/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /tenants/{id}/restore | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /tenants/{id}/activate | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /tenants/{id}/deactivate | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /companies | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /companies | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /companies/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /companies/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /companies/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /users | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /users | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /users/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /users/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /users/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /users/{id}/status | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /users/bulk | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /users/{id}/restore | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /users/me/change-password | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /users/{id}/admin-reset-password | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /users/{id}/force-logout | No Authorization header | 401 |
| PASS | PASS | POST | /auth/login | Public route — auth not required (catalogued) |  |
| PASS | PASS | POST | /auth/tenant-login | Public route — auth not required (catalogued) |  |
| PASS | PASS | POST | /auth/super-admin/signup | Public route — auth not required (catalogued) |  |
| PASS | PASS | POST | /auth/super-admin/login | Public route — auth not required (catalogued) |  |
| PASS | PASS | POST | /auth/refresh | Public route — auth not required (catalogued) |  |
| PASS | FAIL_CASE | POST | /auth/logout | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /auth/sessions | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /auth/sessions/{sessionId}/revoke | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /auth/logout-all | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /auth/me | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /auth/change-password | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /auth/tenant/change-password | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/countries | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/countries | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/countries/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/countries/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/countries/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/currencies | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/currencies | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/currencies/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/currencies/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/currencies/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/exchange-rates | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/exchange-rates | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/exchange-rates/latest/{currencyId} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/ports | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/ports | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/ports/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/ports/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/ports/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/airports | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/airports | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/airports/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/airports/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/airports/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/container-types | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/container-types | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/container-types/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/container-types/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/container-types/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/hs-codes | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/hs-codes | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/hs-codes/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/hs-codes/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/hs-codes/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/airlines | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/airlines | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/airlines/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/airlines/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/airlines/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/shipping-lines | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/shipping-lines | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/shipping-lines/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/shipping-lines/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/shipping-lines/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/vessels | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/vessels | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/vessels/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/vessels/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/vessels/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/truckers | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/truckers | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/truckers/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/truckers/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/truckers/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/warehouses | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/warehouses | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/warehouses/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/warehouses/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/warehouses/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/charge-codes | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/charge-codes | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/charge-codes/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/charge-codes/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/charge-codes/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/banks | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/banks | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/banks/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/banks/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/banks/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/holidays | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/holidays | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/holidays/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/holidays/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/holidays/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/units-of-measure | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/units-of-measure | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/units-of-measure/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/units-of-measure/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/units-of-measure/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/tax-rates | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/tax-rates | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/tax-rates/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/tax-rates/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/tax-rates/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/branches | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/branches | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/branches/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/branches/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/branches/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/departments | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/departments | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/departments/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/departments/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/departments/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/designations | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /masters/designations | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /masters/designations/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /masters/designations/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /masters/designations/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /parties | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /parties | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /parties/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /parties/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /parties/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /parties/import | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /parties/{id}/credit-status | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /parties/{id}/contacts | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /parties/{id}/contacts/{contactId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /parties/{id}/contacts/{contactId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /parties/{id}/addresses | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /parties/{id}/addresses/{addressId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /parties/{id}/addresses/{addressId} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /organization/profile | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /organization/profile | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /organization/bank-accounts | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /organization/bank-accounts | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /organization/bank-accounts/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /organization/bank-accounts/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /organization/bank-accounts/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /organization/number-formats | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /organization/number-formats | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /organization/number-formats/{documentType} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /organization/number-formats/{documentType} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /organization/number-formats/{documentType}/preview | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/chargewise | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/analytics | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/analytics/conversion | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/analytics/lost-reasons | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/analytics/response-time | No Authorization header | 401 |
| PASS | PASS | POST | /quotations/online-quote | Public route — auth not required (catalogued) |  |
| PASS | FAIL_CASE | POST | /quotations/expire-due | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /quotations/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/{id}/revisions | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/lines | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/apply-tariff | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/{id}/lines/{lineId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /quotations/{id}/lines/{lineId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/submit | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/approve | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/reject | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/send | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/mark-won | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/mark-lost | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/duplicate | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/convert-to-job | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/archive | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/expire | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/pdf | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/{id}/pdf | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/{id}/pdf/status | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/send-email | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/tariffs | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/tariffs | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/tariffs/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/tariffs/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /quotations/tariffs/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/zip-distances | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations/zip-distances | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/zip-distances/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/zip-distances/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /quotations/zip-distances/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/house-jobs | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/milestones | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/milestones | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/pnl | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/notes | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/notes | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/documents | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/containers | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/containers | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/close | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/cancel | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/air-details | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/sea-fcl-details | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/milestones/{milestoneId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/charges | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/charges/{chargeId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id}/charges/{chargeId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/prorate-cost/{chargeCodeId} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/notes/{noteId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id}/notes/{noteId} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/documents/{documentId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id}/documents/{documentId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/{documentId}/finalize | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/documents/generation-status | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/hawb | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/mawb | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/pre-alert | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/cargo-manifest | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/pre-alert/send | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/containers/{containerId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id}/containers/{containerId} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /awb-stock/batches | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/batches | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /awb-stock/reports/low-stock | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /awb-stock/allocations | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /awb-stock/batches/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /awb-stock/batches/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /awb-stock/batches/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/batches/{id}/allocate | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/batches/{id}/transfer-branch | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/allocations/{id}/void | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/allocations/{id}/mark-used | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /search | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /files/{tenantId}/{filename} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /invoices | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /invoices | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /invoices/reports/overdue | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /invoices/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /invoices/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /invoices/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /invoices/from-job/{jobId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/lines | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /invoices/{id}/lines/{lineId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /invoices/{id}/lines/{lineId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/post | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/send | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/pdf | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /invoices/{id}/pdf | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/cancel | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /credit-notes | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /credit-notes | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /credit-notes/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /credit-notes/{id}/post | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /purchase-invoices | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /purchase-invoices | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /purchase-invoices/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /purchase-invoices/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /purchase-invoices/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /purchase-invoices/{id}/post | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /payment-requests | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /payment-requests | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /payment-requests/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /payment-requests/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /payment-requests/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /payment-requests/{id}/approve | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /payment-requests/{id}/reject | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /payment-requests/{id}/mark-paid | No Authorization header | 401 |
| PASS | PASS_CASE | POST | /auth/super-admin/signup | Super admin signup | 201 |
| PASS | FAIL_CASE | POST | /auth/super-admin/login | Super admin login with wrong password | 401 |
| PASS | PASS_CASE | POST | /tenants | Create tenant | 201 |
| PASS | PASS_CASE | POST | /auth/tenant-login | Tenant login | 200 |
| PASS | PASS_CASE | POST | /auth/tenant-login | Tenant login — wrong password | 401 |
| PASS | PASS_CASE | GET | /auth/me | GET /auth/me | 200 |
| PASS | PASS_CASE | GET | /auth/sessions | List sessions | 200 |
| PASS | PASS_CASE | GET | /companies | List companies | 200 |
| PASS | PASS_CASE | POST | /organization/number-formats | Number format QUOTATION | 201 |
| PASS | PASS_CASE | POST | /organization/number-formats | Number format JOB_NUMBER | 201 |
| PASS | PASS_CASE | POST | /organization/number-formats | Number format INVOICE | 201 |
| PASS | PASS_CASE | POST | /organization/number-formats | Number format CREDIT_NOTE | 201 |
| PASS | PASS_CASE | POST | /organization/number-formats | Number format PURCHASE_INVOICE | 201 |
| PASS | PASS_CASE | POST | /organization/number-formats | Number format VOUCHER | 201 |
| PASS | PASS_CASE | GET | /organization/number-formats | List number formats | 200 |
| PASS | PASS_CASE | GET | /organization/profile | Org profile | 200 |
| PASS | PASS_CASE | POST | /masters/currencies | Create currency AED | 201 |
| PASS | PASS_CASE | POST | /masters/countries | Create country AE | 201 |
| PASS | PASS_CASE | POST | /masters/countries | Create duplicate country (expect fail) | 409 |
| PASS | PASS_CASE | POST | /masters/ports | Create port DXB | 201 |
| PASS | PASS_CASE | POST | /masters/ports | Create port LHR | 201 |
| PASS | PASS_CASE | POST | /masters/airlines | Create airline EK | 201 |
| PASS | PASS_CASE | POST | /masters/charge-codes | Create charge code AFR | 201 |
| FAIL | PASS_CASE | POST | /masters/tax-rates | Create tax rate VAT5 | 500 |
| PASS | PASS_CASE | POST | /masters/branches | Create branch | 201 |
| PASS | PASS_CASE | GET | /masters/currencies | List masters/currencies | 200 |
| PASS | PASS_CASE | GET | /masters/countries | List masters/countries | 200 |
| PASS | PASS_CASE | GET | /masters/ports | List masters/ports | 200 |
| PASS | PASS_CASE | GET | /masters/airlines | List masters/airlines | 200 |
| PASS | PASS_CASE | GET | /masters/charge-codes | List masters/charge-codes | 200 |
| PASS | PASS_CASE | GET | /masters/tax-rates | List masters/tax-rates | 200 |
| PASS | PASS_CASE | GET | /masters/branches | List masters/branches | 200 |
| PASS | PASS_CASE | GET | /masters/airports | List masters/airports | 200 |
| PASS | PASS_CASE | GET | /masters/banks | List masters/banks | 200 |
| PASS | PASS_CASE | GET | /masters/departments | List masters/departments | 200 |
| PASS | PASS_CASE | GET | /masters/designations | List masters/designations | 200 |
| PASS | PASS_CASE | GET | /masters/holidays | List masters/holidays | 200 |
| PASS | PASS_CASE | GET | /masters/hs-codes | List masters/hs-codes | 200 |
| PASS | PASS_CASE | GET | /masters/shipping-lines | List masters/shipping-lines | 200 |
| PASS | PASS_CASE | GET | /masters/container-types | List masters/container-types | 200 |
| PASS | PASS_CASE | GET | /masters/truckers | List masters/truckers | 200 |
| PASS | PASS_CASE | GET | /masters/units-of-measure | List masters/units-of-measure | 200 |
| PASS | PASS_CASE | GET | /masters/vessels | List masters/vessels | 200 |
| PASS | PASS_CASE | GET | /masters/warehouses | List masters/warehouses | 200 |
| PASS | PASS_CASE | POST | /parties | Create customer party | 201 |
| PASS | PASS_CASE | POST | /parties | Create consignee party | 201 |
| PASS | PASS_CASE | POST | /parties | Create party — missing required fields | 400 |
| PASS | PASS_CASE | POST | /parties/8d413ed4-f9a3-4443-8463-cf033dadae40/contacts | Add party contact | 201 |
| PASS | PASS_CASE | GET | /parties/8d413ed4-f9a3-4443-8463-cf033dadae40 | Get party | 200 |
| PASS | PASS_CASE | GET | /parties | List parties | 200 |
| PASS | PASS_CASE | POST | /quotations | Create quotation | 201 |
| PASS | PASS_CASE | POST | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/lines | Add quotation revenue line | 201 |
| PASS | PASS_CASE | POST | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/lines | Add quotation cost line | 201 |
| PASS | PASS_CASE | POST | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/submit | Submit quotation | 201 |
| PASS | PASS_CASE | POST | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/approve | Approve quotation | 201 |
| PASS | PASS_CASE | POST | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/send | Send quotation | 201 |
| PASS | PASS_CASE | POST | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/mark-won | Mark won | 201 |
| PASS | PASS_CASE | POST | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/convert-to-job | Convert to job | 201 |
| FAIL | PASS_CASE | POST | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/pdf | Queue quotation PDF |  |
| PASS | PASS_CASE | GET | /quotations/87cbc756-011b-4b2d-8cc6-d34d7f8d04fd/pdf | Get quotation PDF info | 200 |
| PASS | PASS_CASE | POST | /jobs | Create job directly | 201 |
| PASS | PASS_CASE | GET | /jobs/365b233e-6602-465c-b9aa-bc088a151162 | Get job | 200 |
| PASS | PASS_CASE | GET | /jobs | List jobs | 200 |
| PASS | PASS_CASE | PATCH | /jobs/365b233e-6602-465c-b9aa-bc088a151162/air-details | Update air details | 200 |
| PASS | PASS_CASE | GET | /jobs/365b233e-6602-465c-b9aa-bc088a151162/milestones | List milestones | 200 |
| PASS | PASS_CASE | PATCH | /jobs/365b233e-6602-465c-b9aa-bc088a151162/milestones/25b6a81f-bd91-4761-bf67-76ecb0a34e2f | Complete milestone | 200 |
| PASS | PASS_CASE | POST | /jobs/365b233e-6602-465c-b9aa-bc088a151162/charges | Add job charge | 201 |
| PASS | PASS_CASE | GET | /jobs/365b233e-6602-465c-b9aa-bc088a151162/pnl | Job P&L | 200 |
| PASS | PASS_CASE | POST | /jobs/365b233e-6602-465c-b9aa-bc088a151162/notes | Add job note | 201 |
| FAIL | PASS_CASE | POST | /jobs/365b233e-6602-465c-b9aa-bc088a151162/documents/hawb | Queue HAWB PDF | 500 |
| PASS | PASS_CASE | GET | /jobs/365b233e-6602-465c-b9aa-bc088a151162/documents/generation-status | Doc generation status | 200 |
| PASS | PASS_CASE | POST | /jobs/365b233e-6602-465c-b9aa-bc088a151162/pre-alert/send | Send pre-alert | 201 |
| PASS | PASS_CASE | POST | /awb-stock/batches | Create AWB batch | 201 |
| PASS | PASS_CASE | POST | /awb-stock/batches/a6ec8be4-f8c9-4f9b-99de-3424bc404d27/allocate | Allocate AWB | 201 |
| PASS | PASS_CASE | GET | /awb-stock/reports/low-stock | Low stock report | 200 |
| PASS | PASS_CASE | GET | /awb-stock/batches | List batches | 200 |
| PASS | PASS_CASE | POST | /invoices/from-job/365b233e-6602-465c-b9aa-bc088a151162 | Invoice from job | 201 |
| PASS | PASS_CASE | GET | /invoices/87cb2ed9-df7e-452f-b304-246f083dd953 | Get invoice | 200 |
| PASS | PASS_CASE | POST | /invoices/87cb2ed9-df7e-452f-b304-246f083dd953/post | Post invoice | 201 |
| FAIL | PASS_CASE | POST | /invoices/87cb2ed9-df7e-452f-b304-246f083dd953/pdf | Generate invoice PDF | 500 |
| FAIL | PASS_CASE | POST | /invoices/87cb2ed9-df7e-452f-b304-246f083dd953/send | Send invoice email | 500 |
| PASS | PASS_CASE | GET | /invoices/reports/overdue | Overdue report | 200 |
| FAIL | PASS_CASE | POST | /credit-notes | Create credit note | 500 |
| PASS | PASS_CASE | POST | /payment-requests | Create payment request | 201 |
| PASS | PASS_CASE | POST | /payment-requests/62135902-cf60-446b-8b5e-cc02bb0b51e4/approve | Approve payment request | 201 |
| PASS | PASS_CASE | POST | /payment-requests/62135902-cf60-446b-8b5e-cc02bb0b51e4/mark-paid | Mark payment paid | 201 |
| FAIL | PASS_CASE | POST | /purchase-invoices | Create purchase invoice | 500 |
| PASS | PASS_CASE | GET | /search?q=Al%20Noor&limit=10 | Global search | 200 |
| PASS | PASS_CASE | GET | /users | List users | 200 |
| PASS | PASS_CASE | GET | /quotations | List quotations | 200 |
| PASS | PASS_CASE | GET | /invoices | List invoices | 200 |
| PASS | PASS_CASE | GET | /quotations/reports/analytics | Quotation analytics | 200 |
| PASS | PASS_CASE | POST | /auth/refresh | Refresh token | 200 |
| PASS | FAIL_CASE | POST | /tenants | Invalid / incomplete payload | 403 |
| PASS | FAIL_CASE | POST | /tenants/sync-permissions | Invalid / incomplete payload | 403 |
| PASS | FAIL_CASE | POST | /tenants/{id}/sync-permissions | Invalid / incomplete payload | 403 |
| PASS | FAIL_CASE | PATCH | /tenants/{id} | Invalid / incomplete payload | 403 |
| PASS | FAIL_CASE | PATCH | /tenants/{id}/restore | Invalid / incomplete payload | 403 |
| PASS | FAIL_CASE | PATCH | /tenants/{id}/activate | Invalid / incomplete payload | 403 |
| PASS | FAIL_CASE | PATCH | /tenants/{id}/deactivate | Invalid / incomplete payload | 403 |
| PASS | FAIL_CASE | POST | /companies | Invalid / incomplete payload | 400 |
| PASS | FAIL_CASE | PATCH | /companies/{id} | Invalid / incomplete payload | 400 |
| PASS | FAIL_CASE | POST | /users | Invalid / incomplete payload | 400 |
| PASS | FAIL_CASE | PATCH | /users/{id} | Invalid / incomplete payload | 400 |
| PASS | FAIL_CASE | PATCH | /users/{id}/status | Invalid / incomplete payload | 400 |
| PASS | FAIL_CASE | POST | /users/bulk | Invalid / incomplete payload | 400 |
| PASS | FAIL_CASE | POST | /users/{id}/restore | Invalid / incomplete payload | 404 |
| PASS | FAIL_CASE | POST | /users/me/change-password | Invalid / incomplete payload | 400 |
| PASS | FAIL_CASE | POST | /users/{id}/admin-reset-password | Invalid / incomplete payload | 400 |
| PASS | FAIL_CASE | POST | /users/{id}/force-logout | Invalid / incomplete payload | 404 |
| FAIL | FAIL_CASE | POST | /auth/logout | Invalid / incomplete payload | 200 |
| PASS | FAIL_CASE | POST | /auth/sessions/{sessionId}/revoke | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /auth/logout-all | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /auth/change-password | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /auth/tenant/change-password | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/countries | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/countries/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/currencies | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/currencies/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/exchange-rates | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/ports | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/ports/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/airports | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/airports/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/container-types | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/container-types/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/hs-codes | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/hs-codes/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/airlines | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/airlines/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/shipping-lines | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/shipping-lines/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/vessels | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/vessels/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/truckers | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/truckers/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/warehouses | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/warehouses/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/charge-codes | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/charge-codes/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/banks | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/banks/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/holidays | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/holidays/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/units-of-measure | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/units-of-measure/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/tax-rates | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/tax-rates/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/branches | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/branches/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/departments | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/departments/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /masters/designations | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /masters/designations/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /parties | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /parties/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /parties/{id}/credit-status | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /parties/{id}/contacts | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /parties/{id}/contacts/{contactId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /parties/{id}/addresses | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /parties/{id}/addresses/{addressId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /organization/profile | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /organization/bank-accounts | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /organization/bank-accounts/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /organization/number-formats | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /organization/number-formats/{documentType} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/expire-due | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/lines | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/apply-tariff | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/{id}/lines/{lineId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/submit | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/approve | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/reject | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/send | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/mark-won | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/mark-lost | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/duplicate | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/convert-to-job | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/archive | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/expire | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/pdf | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/{id}/send-email | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/tariffs | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/tariffs/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/zip-distances | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/zip-distances/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/milestones | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/notes | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/containers | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/close | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/cancel | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/air-details | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/sea-fcl-details | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/milestones/{milestoneId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/charges | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/charges/{chargeId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/prorate-cost/{chargeCodeId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/notes/{noteId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/documents/{documentId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/{documentId}/finalize | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/hawb | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/mawb | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/pre-alert | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/cargo-manifest | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/pre-alert/send | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/containers/{containerId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/batches | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /awb-stock/batches/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/batches/{id}/allocate | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/batches/{id}/transfer-branch | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/allocations/{id}/void | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /awb-stock/allocations/{id}/mark-used | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /invoices | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /invoices/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /invoices/from-job/{jobId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/lines | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /invoices/{id}/lines/{lineId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/post | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/send | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/pdf | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /invoices/{id}/cancel | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /credit-notes | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /credit-notes/{id}/post | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /purchase-invoices | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /purchase-invoices/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /purchase-invoices/{id}/post | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /payment-requests | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /payment-requests/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /payment-requests/{id}/approve | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /payment-requests/{id}/reject | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /payment-requests/{id}/mark-paid | Invalid / incomplete payload | 401 |
| FAIL | PASS_CASE | POST | /auth/logout | Logout | 401 |

## Context IDs created this run
```json
{
  "saEmail": "live.sa.1783751652556@kingfisher.test",
  "tenantSlug": "live-1783751652556",
  "tenantId": "9aa39198-9fba-430d-9c22-b81d328a0186",
  "companyId": "64b08617-3d49-40da-8ef5-c62c15ab6acf",
  "customerId": "8d413ed4-f9a3-4443-8463-cf033dadae40",
  "quotationId": "87cbc756-011b-4b2d-8cc6-d34d7f8d04fd",
  "jobId": "365b233e-6602-465c-b9aa-bc088a151162",
  "invoiceId": "87cb2ed9-df7e-452f-b304-246f083dd953"
}
```