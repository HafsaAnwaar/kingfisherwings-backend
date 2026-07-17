# Live API Test Report

**Target:** https://kingfisherwings.onrender.com
**Run ID:** 1784282902909
**When:** 2026-07-17T10:18:47.769Z
**OpenAPI operations catalogued:** 441
**Test executions:** 771
**Passed:** 760
**Failed:** 11

## Summary by tag

| Tag | Pass | Fail |
|-----|------|------|
| AWB Stock | 21 | 0 |
| Auth | 34 | 3 |
| Companies | 8 | 0 |
| Credit Notes | 6 | 1 |
| Debit Notes | 6 | 0 |
| Files | 1 | 0 |
| GL — AR / AP Aging | 4 | 0 |
| GL — Bank Reconciliation | 17 | 0 |
| GL — Chart of Accounts | 12 | 0 |
| GL — Cheques / PDC | 15 | 0 |
| GL — Financial Reports | 5 | 0 |
| GL — MIS Dashboard | 3 | 0 |
| GL — My Reports | 7 | 0 |
| GL — Payments (AR/AP) | 14 | 0 |
| GL — Vouchers | 16 | 0 |
| Invoices | 29 | 2 |
| Jobs | 197 | 1 |
| Locale | 0 | 2 |
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
| Masters | 28 | 0 |
| Organization Profile | 3 | 0 |
| Organization — Bank Accounts | 7 | 0 |
| Organization — Number Formats | 7 | 0 |
| Organization | 8 | 0 |
| Parties | 28 | 0 |
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
| Vessels — Schedules | 6 | 0 |

## Case types

- **FAIL_CASE** — negative test (no auth / bad payload). Status PASS means the API correctly rejected.
- **PASS_CASE** — positive test with proper data. Status PASS means the API succeeded as expected.

## Failed executions

| Type | Method | Path | Expected | Got | Notes |
|------|--------|------|----------|-----|-------|
| FAIL_CASE | GET | /locale/defaults | 401 | 200 | Expected 401, got 200 |
| FAIL_CASE | GET | /locale/{countryCode} | 401 | 200 | Expected 401, got 200 |
| FAIL_CASE | POST | /auth/accept-invite | 401 | 400 | Expected 401, got 400 |
| PASS_CASE | POST | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/pdf | 2xx |  | fetch failed |
| PASS_CASE | POST | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/documents/hawb | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| PASS_CASE | POST | /invoices/daa7f5a5-ac70-43a9-bec0-49e395ccc685/pdf | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| PASS_CASE | POST | /invoices/daa7f5a5-ac70-43a9-bec0-49e395ccc685/send | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| PASS_CASE | POST | /credit-notes | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| PASS_CASE | POST | /purchase-invoices | 2xx | 500 | {"statusCode":500,"message":"Internal server error"} |
| FAIL_CASE | POST | /auth/logout | 400/403/404/422 | 200 | Unexpected success/status 200 |
| PASS_CASE | POST | /auth/logout | 2xx | 401 | {"message":"Session is no longer valid.","error":"Unauthorized","statusCode":401} |

## Full results

| Status | Type | Method | Path | Title | HTTP |
|--------|------|--------|------|-------|------|
| FAIL | FAIL_CASE | GET | /locale/defaults | No Authorization header | 200 |
| FAIL | FAIL_CASE | GET | /locale/{countryCode} | No Authorization header | 200 |
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
| PASS | FAIL_CASE | PATCH | /auth/me | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /auth/change-password | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /auth/tenant/change-password | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /auth/invite | No Authorization header | 401 |
| FAIL | FAIL_CASE | POST | /auth/accept-invite | No Authorization header | 400 |
| PASS | FAIL_CASE | POST | /auth/2fa/setup | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /auth/2fa/enable | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /auth/2fa/disable | No Authorization header | 401 |
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
| PASS | FAIL_CASE | GET | /vessels/{id}/schedules | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /vessels/{id}/schedules | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /vessels/{id}/schedules/{scheduleId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /vessels/{id}/schedules/{scheduleId} | No Authorization header | 401 |
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
| PASS | FAIL_CASE | GET | /parties/export | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /parties/{id}/history | No Authorization header | 401 |
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
| PASS | FAIL_CASE | GET | /quotations | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /quotations | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/chargewise | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/analytics | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/analytics/conversion | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/analytics/lost-reasons | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /quotations/reports/analytics/response-time | No Authorization header | 401 |
| PASS | PASS | POST | /quotations/online-quote | Public route — auth not required (catalogued) |  |
| PASS | FAIL_CASE | POST | /quotations/expire-due | No Authorization header | 403 |
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
| PASS | FAIL_CASE | GET | /jobs/{id}/containers/fill | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/containers/{containerId}/fill | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/cutoffs | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/cargo | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/cargo | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/bills-of-lading | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/bills-of-lading | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/stuffing-records | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/stuffing-records | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/close | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/cancel | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/air-details | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/sea-fcl-details | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/sea-fcl-details/si-submission | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/sea-fcl-details/vgm-submission | No Authorization header | 401 |
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
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/hbl | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/hbl-express-release | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/mbl | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/fiata-bl | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/rider-bl | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/switch-bl | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/proxy-bl | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/back-to-back-bl | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/surrender-notice | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/si | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/stuffing-report | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/sailing-confirmation | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/transhipment-confirmation | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/freight-manifest | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/job-card | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/job-pnl | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/proforma-invoice | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/pre-alert/send | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/pre-alert/schedule | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/whatsapp/status | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/sub-jobs | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/sub-jobs | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/payment-requests | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/e-awb | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/barcode-label | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/consignee-label | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/job-costing | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/freight-certificate | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/containers/{containerId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id}/containers/{containerId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/cargo | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/split | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/cargo/{cargoId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id}/cargo/{cargoId} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/bills-of-lading/{blId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id}/bills-of-lading/{blId} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/stuffing-records/{recordId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id}/stuffing-records/{recordId} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/free-days | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/free-days | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/free-days/recalculate | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/deposits | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/deposits | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/deposits/{depositId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /jobs/{id}/deposits/{depositId} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/customs-status | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/return | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/part-deliveries | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/part-deliveries | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/pods | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/pods | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /jobs/{id}/damage-reports | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/damage-reports | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/transhipment-link | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/cfs-storage/calculate | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/pre-can | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/can | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/exchange-letter | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/undertake-letter | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/delivery-order | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/transport-request | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/shipping-advice | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/proof-of-delivery | No Authorization header | 401 |
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
| PASS | FAIL_CASE | GET | /debit-notes | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /debit-notes | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /debit-notes/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /debit-notes/{id}/post | No Authorization header | 401 |
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
| PASS | FAIL_CASE | GET | /gl/accounts | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/accounts | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/accounts/tree | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/accounts/reports/trial-balance | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/accounts/seed-defaults | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/accounts/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /gl/accounts/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /gl/accounts/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/accounts/{id}/ledger | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/vouchers | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/vouchers | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/vouchers/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /gl/vouchers/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /gl/vouchers/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/vouchers/{id}/lines | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /gl/vouchers/{id}/lines/{lineId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /gl/vouchers/{id}/lines/{lineId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/vouchers/{id}/post | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/vouchers/{id}/reverse | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/payments | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/payments | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/payments/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /gl/payments/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /gl/payments/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/payments/{id}/allocations | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /gl/payments/{id}/allocations/{allocationId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/payments/{id}/post | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/payments/{id}/cancel | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/ar/aging | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/ap/aging | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/ar/statement/{partyId} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/ap/statement/{partyId} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/cheques | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/cheques/reports/pdc-due | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/cheques/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /gl/cheques/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques/{id}/deposit | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques/{id}/clear | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques/{id}/bounce | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques/{id}/cancel | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/bank-transfers | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/bank-reconciliations | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/bank-reconciliations | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/bank-reconciliations/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /gl/bank-reconciliations/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /gl/bank-reconciliations/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/bank-reconciliations/{id}/unmatched | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/bank-reconciliations/{id}/lines | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /gl/bank-reconciliations/{id}/lines/{lineId} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /gl/bank-reconciliations/{id}/lines/{lineId} | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/bank-reconciliations/{id}/complete | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/reports/trial-balance | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/reports/balance-sheet | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/reports/profit-and-loss | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/reports/cash-flow | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/reports/vat-return | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/mis/dashboard | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/mis/profitability | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/mis/operational | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/saved-reports | No Authorization header | 401 |
| PASS | FAIL_CASE | POST | /gl/saved-reports | No Authorization header | 401 |
| PASS | FAIL_CASE | GET | /gl/saved-reports/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | PATCH | /gl/saved-reports/{id} | No Authorization header | 401 |
| PASS | FAIL_CASE | DELETE | /gl/saved-reports/{id} | No Authorization header | 401 |
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
| PASS | PASS_CASE | POST | /masters/tax-rates | Create tax rate VAT5 | 201 |
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
| PASS | PASS_CASE | POST | /parties/37d2d332-b5a8-48db-883f-68de86a13a45/contacts | Add party contact | 201 |
| PASS | PASS_CASE | GET | /parties/37d2d332-b5a8-48db-883f-68de86a13a45 | Get party | 200 |
| PASS | PASS_CASE | GET | /parties | List parties | 200 |
| PASS | PASS_CASE | POST | /quotations | Create quotation | 201 |
| PASS | PASS_CASE | POST | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/lines | Add quotation revenue line | 201 |
| PASS | PASS_CASE | POST | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/lines | Add quotation cost line | 201 |
| PASS | PASS_CASE | POST | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/submit | Submit quotation | 201 |
| PASS | PASS_CASE | POST | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/approve | Approve quotation | 201 |
| PASS | PASS_CASE | POST | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/send | Send quotation | 201 |
| PASS | PASS_CASE | POST | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/mark-won | Mark won | 201 |
| PASS | PASS_CASE | POST | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/convert-to-job | Convert to job | 201 |
| FAIL | PASS_CASE | POST | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/pdf | Queue quotation PDF |  |
| PASS | PASS_CASE | GET | /quotations/29e22fd1-b083-4a66-bb72-47634cff4d5e/pdf | Get quotation PDF info | 200 |
| PASS | PASS_CASE | POST | /jobs | Create job directly | 201 |
| PASS | PASS_CASE | GET | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e | Get job | 200 |
| PASS | PASS_CASE | GET | /jobs | List jobs | 200 |
| PASS | PASS_CASE | PATCH | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/air-details | Update air details | 200 |
| PASS | PASS_CASE | GET | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/milestones | List milestones | 200 |
| PASS | PASS_CASE | PATCH | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/milestones/94e2c718-e342-4118-ad51-84566b67d3df | Complete milestone | 200 |
| PASS | PASS_CASE | POST | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/charges | Add job charge | 201 |
| PASS | PASS_CASE | GET | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/pnl | Job P&L | 200 |
| PASS | PASS_CASE | POST | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/notes | Add job note | 201 |
| FAIL | PASS_CASE | POST | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/documents/hawb | Queue HAWB PDF | 500 |
| PASS | PASS_CASE | GET | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/documents/generation-status | Doc generation status | 200 |
| PASS | PASS_CASE | POST | /jobs/34dd1cb7-da3d-43ec-865f-95f7fac3df8e/pre-alert/send | Send pre-alert | 201 |
| PASS | PASS_CASE | POST | /awb-stock/batches | Create AWB batch | 201 |
| PASS | PASS_CASE | POST | /awb-stock/batches/4f063554-ce04-47f3-9b0e-d36e761403c5/allocate | Allocate AWB | 201 |
| PASS | PASS_CASE | GET | /awb-stock/reports/low-stock | Low stock report | 200 |
| PASS | PASS_CASE | GET | /awb-stock/batches | List batches | 200 |
| PASS | PASS_CASE | POST | /invoices/from-job/34dd1cb7-da3d-43ec-865f-95f7fac3df8e | Invoice from job | 201 |
| PASS | PASS_CASE | GET | /invoices/daa7f5a5-ac70-43a9-bec0-49e395ccc685 | Get invoice | 200 |
| PASS | PASS_CASE | POST | /invoices/daa7f5a5-ac70-43a9-bec0-49e395ccc685/post | Post invoice | 201 |
| FAIL | PASS_CASE | POST | /invoices/daa7f5a5-ac70-43a9-bec0-49e395ccc685/pdf | Generate invoice PDF | 500 |
| FAIL | PASS_CASE | POST | /invoices/daa7f5a5-ac70-43a9-bec0-49e395ccc685/send | Send invoice email | 500 |
| PASS | PASS_CASE | GET | /invoices/reports/overdue | Overdue report | 200 |
| FAIL | PASS_CASE | POST | /credit-notes | Create credit note | 500 |
| PASS | PASS_CASE | POST | /payment-requests | Create payment request | 201 |
| PASS | PASS_CASE | POST | /payment-requests/1d58d6aa-19ad-4ff9-8304-b6876022118a/approve | Approve payment request | 201 |
| PASS | PASS_CASE | POST | /payment-requests/1d58d6aa-19ad-4ff9-8304-b6876022118a/mark-paid | Mark payment paid | 201 |
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
| PASS | FAIL_CASE | PATCH | /auth/me | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /auth/change-password | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /auth/tenant/change-password | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /auth/invite | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /auth/accept-invite | Invalid / incomplete payload | 400 |
| PASS | FAIL_CASE | POST | /auth/2fa/setup | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /auth/2fa/enable | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /auth/2fa/disable | Invalid / incomplete payload | 401 |
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
| PASS | FAIL_CASE | POST | /vessels/{id}/schedules | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /vessels/{id}/schedules/{scheduleId} | Invalid / incomplete payload | 401 |
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
| PASS | FAIL_CASE | POST | /quotations/tariffs | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/tariffs/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/zip-distances | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /quotations/zip-distances/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /quotations/expire-due | Invalid / incomplete payload | 403 |
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
| PASS | FAIL_CASE | POST | /jobs | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/milestones | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/notes | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/containers | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/cargo | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/bills-of-lading | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/stuffing-records | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/close | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/cancel | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/air-details | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/sea-fcl-details | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/sea-fcl-details/si-submission | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/sea-fcl-details/vgm-submission | Invalid / incomplete payload | 401 |
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
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/hbl | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/hbl-express-release | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/mbl | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/fiata-bl | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/rider-bl | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/switch-bl | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/proxy-bl | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/back-to-back-bl | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/surrender-notice | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/si | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/stuffing-report | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/sailing-confirmation | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/transhipment-confirmation | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/freight-manifest | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/job-card | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/job-pnl | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/proforma-invoice | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/pre-alert/send | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/pre-alert/schedule | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/whatsapp/status | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/sub-jobs | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/payment-requests | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/e-awb | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/barcode-label | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/consignee-label | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/job-costing | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/freight-certificate | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/containers/{containerId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/cargo | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/split | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/cargo/{cargoId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/bills-of-lading/{blId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/stuffing-records/{recordId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/free-days | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/free-days/recalculate | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/deposits | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/deposits/{depositId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /jobs/{id}/customs-status | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/return | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/part-deliveries | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/pods | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/damage-reports | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/transhipment-link | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/cfs-storage/calculate | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/pre-can | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/can | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/exchange-letter | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/undertake-letter | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/delivery-order | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/transport-request | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/shipping-advice | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /jobs/{id}/documents/proof-of-delivery | Invalid / incomplete payload | 401 |
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
| PASS | FAIL_CASE | POST | /debit-notes | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /debit-notes/{id}/post | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /purchase-invoices | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /purchase-invoices/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /purchase-invoices/{id}/post | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /payment-requests | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /payment-requests/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /payment-requests/{id}/approve | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /payment-requests/{id}/reject | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /payment-requests/{id}/mark-paid | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/accounts | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/accounts/seed-defaults | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /gl/accounts/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/vouchers | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /gl/vouchers/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/vouchers/{id}/lines | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /gl/vouchers/{id}/lines/{lineId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/vouchers/{id}/post | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/vouchers/{id}/reverse | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/payments | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /gl/payments/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/payments/{id}/allocations | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/payments/{id}/post | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/payments/{id}/cancel | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /gl/cheques/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques/{id}/deposit | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques/{id}/clear | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques/{id}/bounce | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/cheques/{id}/cancel | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/bank-transfers | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/bank-reconciliations | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /gl/bank-reconciliations/{id} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/bank-reconciliations/{id}/lines | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /gl/bank-reconciliations/{id}/lines/{lineId} | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/bank-reconciliations/{id}/complete | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | POST | /gl/saved-reports | Invalid / incomplete payload | 401 |
| PASS | FAIL_CASE | PATCH | /gl/saved-reports/{id} | Invalid / incomplete payload | 401 |
| FAIL | PASS_CASE | POST | /auth/logout | Logout | 401 |

## Context IDs created this run
```json
{
  "saEmail": "live.sa.1784282902909@kingfisher.test",
  "tenantSlug": "live-1784282902909",
  "tenantId": "4a244149-aec4-4cbd-a4c4-fb96b60a5dc8",
  "companyId": "0f31377f-c3ef-4e72-ab77-0cdc4a40005c",
  "customerId": "37d2d332-b5a8-48db-883f-68de86a13a45",
  "quotationId": "29e22fd1-b083-4a66-bb72-47634cff4d5e",
  "jobId": "34dd1cb7-da3d-43ec-865f-95f7fac3df8e",
  "invoiceId": "daa7f5a5-ac70-43a9-bec0-49e395ccc685"
}
```