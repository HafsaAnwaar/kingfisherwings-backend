# Live API Test Report

**Target:** https://kingfisherwings.onrender.com
**Run ID:** 1787902145904
**When:** 2026-08-28T07:30:11.081Z
**OpenAPI operations catalogued:** 441
**Test executions:** 443
**Passed:** 10
**Failed:** 433

## Summary by tag

| Tag | Pass | Fail |
|-----|------|------|
| AWB Stock | 0 | 11 |
| Auth | 6 | 14 |
| Companies | 0 | 5 |
| Credit Notes | 0 | 4 |
| Debit Notes | 0 | 4 |
| Files | 0 | 1 |
| GL — AR / AP Aging | 0 | 4 |
| GL — Bank Reconciliation | 0 | 11 |
| GL — Chart of Accounts | 0 | 9 |
| GL — Cheques / PDC | 0 | 9 |
| GL — Financial Reports | 0 | 5 |
| GL — MIS Dashboard | 0 | 3 |
| GL — My Reports | 0 | 5 |
| GL — Payments (AR/AP) | 0 | 9 |
| GL — Vouchers | 0 | 10 |
| Invoices | 0 | 15 |
| Jobs | 0 | 108 |
| Locale | 2 | 0 |
| Masters — Airlines | 0 | 5 |
| Masters — Airports | 0 | 5 |
| Masters — Banks | 0 | 5 |
| Masters — Branches | 0 | 5 |
| Masters — ChargeCodes | 0 | 5 |
| Masters — ContainerTypes | 0 | 5 |
| Masters — Countries | 0 | 5 |
| Masters — Currencies | 0 | 5 |
| Masters — Departments | 0 | 5 |
| Masters — Designations | 0 | 5 |
| Masters — Exchange Rates | 0 | 3 |
| Masters — Holidays | 0 | 5 |
| Masters — HsCodes | 0 | 5 |
| Masters — Ports | 0 | 5 |
| Masters — ShippingLines | 0 | 5 |
| Masters — TaxRates | 0 | 5 |
| Masters — Truckers | 0 | 5 |
| Masters — UnitsOfMeasure | 0 | 5 |
| Masters — Vessels | 0 | 5 |
| Masters — Warehouses | 0 | 5 |
| Organization Profile | 0 | 2 |
| Organization — Bank Accounts | 0 | 5 |
| Organization — Number Formats | 0 | 5 |
| Parties | 0 | 15 |
| Payment Requests | 0 | 8 |
| Purchase Invoices | 0 | 6 |
| Quotations — Online Tariff Master | 0 | 5 |
| Quotations — Zip Distance Master | 0 | 5 |
| Quotations | 1 | 30 |
| Search | 0 | 1 |
| Tenants (Super Admin) | 0 | 11 |
| Untagged | 1 | 0 |
| Users | 0 | 11 |
| Vessels — Schedules | 0 | 4 |

## Case types

- **FAIL_CASE** — negative test (no auth / bad payload). Status PASS means the API correctly rejected.
- **PASS_CASE** — positive test with proper data. Status PASS means the API succeeded as expected.

## Failed executions

| Type | Method | Path | Expected | Got | Notes |
|------|--------|------|----------|-----|-------|
| FAIL_CASE | POST | /tenants | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | GET | /tenants | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | GET | /tenants/statistics | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | POST | /tenants/sync-permissions | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /tenants/{id}/sync-permissions | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /tenants/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /tenants/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /tenants/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /tenants/{id}/restore | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /tenants/{id}/activate | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /tenants/{id}/deactivate | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /companies | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /companies | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /companies/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /companies/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /companies/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /users | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /users | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /users/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /users/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /users/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /users/{id}/status | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /users/bulk | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /users/{id}/restore | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /users/me/change-password | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /users/{id}/admin-reset-password | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /users/{id}/force-logout | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /auth/logout | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /auth/sessions | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /auth/sessions/{sessionId}/revoke | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /auth/logout-all | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /auth/me | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /auth/me | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /auth/change-password | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /auth/tenant/change-password | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /auth/invite | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /auth/2fa/setup | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /auth/2fa/enable | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /auth/2fa/disable | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/countries | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/countries | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/countries/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/countries/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/countries/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/currencies | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/currencies | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/currencies/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/currencies/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/currencies/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/exchange-rates | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/exchange-rates | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/exchange-rates/latest/{currencyId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/ports | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/ports | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/ports/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/ports/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/ports/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/airports | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/airports | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/airports/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/airports/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/airports/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/container-types | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/container-types | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/container-types/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/container-types/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/container-types/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/hs-codes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/hs-codes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/hs-codes/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/hs-codes/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/hs-codes/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/airlines | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/airlines | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/airlines/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/airlines/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/airlines/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/shipping-lines | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/shipping-lines | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/shipping-lines/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/shipping-lines/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/shipping-lines/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/vessels | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/vessels | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | GET | /masters/vessels/{id} | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | PATCH | /masters/vessels/{id} | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | DELETE | /masters/vessels/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /vessels/{id}/schedules | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /vessels/{id}/schedules | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /vessels/{id}/schedules/{scheduleId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /vessels/{id}/schedules/{scheduleId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/truckers | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/truckers | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/truckers/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/truckers/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/truckers/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/warehouses | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/warehouses | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/warehouses/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/warehouses/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/warehouses/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/charge-codes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/charge-codes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/charge-codes/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/charge-codes/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/charge-codes/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/banks | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/banks | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/banks/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/banks/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/banks/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/holidays | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/holidays | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/holidays/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/holidays/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/holidays/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/units-of-measure | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/units-of-measure | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/units-of-measure/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/units-of-measure/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/units-of-measure/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/tax-rates | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/tax-rates | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/tax-rates/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/tax-rates/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/tax-rates/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/branches | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/branches | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/branches/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/branches/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/branches/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/departments | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/departments | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/departments/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/departments/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/departments/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/designations | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /masters/designations | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /masters/designations/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /masters/designations/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /masters/designations/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /parties | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /parties | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /parties/export | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /parties/{id}/history | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /parties/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /parties/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /parties/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /parties/import | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /parties/{id}/credit-status | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /parties/{id}/contacts | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /parties/{id}/contacts/{contactId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /parties/{id}/contacts/{contactId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /parties/{id}/addresses | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /parties/{id}/addresses/{addressId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /parties/{id}/addresses/{addressId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /organization/profile | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /organization/profile | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /organization/bank-accounts | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /organization/bank-accounts | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /organization/bank-accounts/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /organization/bank-accounts/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /organization/bank-accounts/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /organization/number-formats | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /organization/number-formats | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /organization/number-formats/{documentType} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /organization/number-formats/{documentType} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /organization/number-formats/{documentType}/preview | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/tariffs | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/tariffs | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/tariffs/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /quotations/tariffs/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /quotations/tariffs/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/zip-distances | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/zip-distances | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/zip-distances/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /quotations/zip-distances/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /quotations/zip-distances/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/reports/chargewise | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | GET | /quotations/reports/analytics | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | GET | /quotations/reports/analytics/conversion | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | GET | /quotations/reports/analytics/lost-reasons | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/reports/analytics/response-time | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/expire-due | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /quotations/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /quotations/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/{id}/revisions | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/lines | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/apply-tariff | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /quotations/{id}/lines/{lineId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /quotations/{id}/lines/{lineId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/submit | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/approve | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/reject | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/send | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/mark-won | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/mark-lost | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/duplicate | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/convert-to-job | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/archive | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/expire | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/pdf | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/{id}/pdf | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /quotations/{id}/pdf/status | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /quotations/{id}/send-email | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /jobs/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/house-jobs | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/milestones | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/milestones | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/pnl | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/notes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/notes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/documents | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/containers | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/containers | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/containers/fill | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/containers/{containerId}/fill | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/cutoffs | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/cargo | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/cargo | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/bills-of-lading | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/bills-of-lading | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/stuffing-records | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/stuffing-records | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/close | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/cancel | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/air-details | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/sea-fcl-details | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/sea-fcl-details/si-submission | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/sea-fcl-details/vgm-submission | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/milestones/{milestoneId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/charges | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/charges/{chargeId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /jobs/{id}/charges/{chargeId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/prorate-cost/{chargeCodeId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/notes/{noteId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /jobs/{id}/notes/{noteId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/documents/{documentId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /jobs/{id}/documents/{documentId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/{documentId}/finalize | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/documents/generation-status | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/hawb | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/mawb | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/pre-alert | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/cargo-manifest | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/hbl | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/hbl-express-release | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/mbl | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/fiata-bl | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/rider-bl | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/switch-bl | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/proxy-bl | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/back-to-back-bl | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | POST | /jobs/{id}/documents/surrender-notice | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | POST | /jobs/{id}/documents/si | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | POST | /jobs/{id}/documents/stuffing-report | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/sailing-confirmation | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/transhipment-confirmation | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/freight-manifest | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/job-card | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/job-pnl | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/proforma-invoice | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/pre-alert/send | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/pre-alert/schedule | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/whatsapp/status | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/sub-jobs | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/sub-jobs | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/payment-requests | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/e-awb | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/barcode-label | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/consignee-label | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/job-costing | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/freight-certificate | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/containers/{containerId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /jobs/{id}/containers/{containerId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/cargo | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/split | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/cargo/{cargoId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /jobs/{id}/cargo/{cargoId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/bills-of-lading/{blId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /jobs/{id}/bills-of-lading/{blId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/stuffing-records/{recordId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /jobs/{id}/stuffing-records/{recordId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/free-days | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/free-days | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/free-days/recalculate | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/deposits | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/deposits | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/deposits/{depositId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /jobs/{id}/deposits/{depositId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /jobs/{id}/customs-status | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/return | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/part-deliveries | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/part-deliveries | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/pods | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/pods | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /jobs/{id}/damage-reports | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/damage-reports | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/transhipment-link | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/cfs-storage/calculate | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/pre-can | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/can | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/exchange-letter | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/undertake-letter | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/delivery-order | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | POST | /jobs/{id}/documents/transport-request | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/shipping-advice | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /jobs/{id}/documents/proof-of-delivery | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /awb-stock/batches | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /awb-stock/batches | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /awb-stock/reports/low-stock | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /awb-stock/allocations | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /awb-stock/batches/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /awb-stock/batches/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /awb-stock/batches/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /awb-stock/batches/{id}/allocate | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /awb-stock/batches/{id}/transfer-branch | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /awb-stock/allocations/{id}/void | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /awb-stock/allocations/{id}/mark-used | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /search | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /files/{tenantId}/{filename} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /invoices | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /invoices | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /invoices/reports/overdue | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /invoices/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /invoices/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /invoices/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /invoices/from-job/{jobId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /invoices/{id}/lines | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /invoices/{id}/lines/{lineId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /invoices/{id}/lines/{lineId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /invoices/{id}/post | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /invoices/{id}/send | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /invoices/{id}/pdf | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /invoices/{id}/pdf | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /invoices/{id}/cancel | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /credit-notes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /credit-notes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /credit-notes/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /credit-notes/{id}/post | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /debit-notes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /debit-notes | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /debit-notes/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /debit-notes/{id}/post | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /purchase-invoices | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /purchase-invoices | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /purchase-invoices/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /purchase-invoices/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /purchase-invoices/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /purchase-invoices/{id}/post | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /payment-requests | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /payment-requests | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /payment-requests/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /payment-requests/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /payment-requests/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /payment-requests/{id}/approve | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /payment-requests/{id}/reject | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /payment-requests/{id}/mark-paid | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/accounts | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/accounts | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/accounts/tree | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/accounts/reports/trial-balance | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/accounts/seed-defaults | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/accounts/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /gl/accounts/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /gl/accounts/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/accounts/{id}/ledger | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/vouchers | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/vouchers | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/vouchers/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /gl/vouchers/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /gl/vouchers/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/vouchers/{id}/lines | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /gl/vouchers/{id}/lines/{lineId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /gl/vouchers/{id}/lines/{lineId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/vouchers/{id}/post | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/vouchers/{id}/reverse | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | GET | /gl/payments | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | POST | /gl/payments | 401 | 503 | Expected 401, got 503 |
| FAIL_CASE | GET | /gl/payments/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /gl/payments/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /gl/payments/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/payments/{id}/allocations | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /gl/payments/{id}/allocations/{allocationId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/payments/{id}/post | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/payments/{id}/cancel | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/ar/aging | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/ap/aging | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/ar/statement/{partyId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/ap/statement/{partyId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/cheques | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/cheques | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/cheques/reports/pdc-due | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/cheques/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /gl/cheques/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/cheques/{id}/deposit | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/cheques/{id}/clear | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/cheques/{id}/bounce | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/cheques/{id}/cancel | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/bank-transfers | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/bank-reconciliations | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/bank-reconciliations | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/bank-reconciliations/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /gl/bank-reconciliations/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /gl/bank-reconciliations/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/bank-reconciliations/{id}/unmatched | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/bank-reconciliations/{id}/lines | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /gl/bank-reconciliations/{id}/lines/{lineId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /gl/bank-reconciliations/{id}/lines/{lineId} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/bank-reconciliations/{id}/complete | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/reports/trial-balance | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/reports/balance-sheet | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/reports/profit-and-loss | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/reports/cash-flow | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/reports/vat-return | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/mis/dashboard | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/mis/profitability | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/mis/operational | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/saved-reports | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | POST | /gl/saved-reports | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | GET | /gl/saved-reports/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | PATCH | /gl/saved-reports/{id} | 401 | 429 | Expected 401, got 429 |
| FAIL_CASE | DELETE | /gl/saved-reports/{id} | 401 | 429 | Expected 401, got 429 |
| PASS_CASE | POST | /auth/super-admin/signup | 201 | 429 | Expected 201, got 429: <!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content- |
| PASS_CASE | POST | /auth/super-admin/login | 200 | 429 | Expected 200, got 429: <!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content- |

## Full results

| Status | Type | Method | Path | Title | HTTP |
|--------|------|--------|------|-------|------|
| PASS | PASS | GET | /locale/defaults | Public route — auth not required (catalogued) |  |
| PASS | PASS | GET | /locale/{countryCode} | Public route — auth not required (catalogued) |  |
| PASS | PASS | GET | /health | Public route — auth not required (catalogued) |  |
| FAIL | FAIL_CASE | POST | /tenants | No Authorization header | 503 |
| FAIL | FAIL_CASE | GET | /tenants | No Authorization header | 503 |
| FAIL | FAIL_CASE | GET | /tenants/statistics | No Authorization header | 503 |
| FAIL | FAIL_CASE | POST | /tenants/sync-permissions | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /tenants/{id}/sync-permissions | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /tenants/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /tenants/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /tenants/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /tenants/{id}/restore | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /tenants/{id}/activate | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /tenants/{id}/deactivate | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /companies | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /companies | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /companies/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /companies/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /companies/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /users | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /users | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /users/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /users/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /users/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /users/{id}/status | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /users/bulk | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /users/{id}/restore | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /users/me/change-password | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /users/{id}/admin-reset-password | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /users/{id}/force-logout | No Authorization header | 429 |
| PASS | PASS | POST | /auth/login | Public route — auth not required (catalogued) |  |
| PASS | PASS | POST | /auth/tenant-login | Public route — auth not required (catalogued) |  |
| PASS | PASS | POST | /auth/super-admin/signup | Public route — auth not required (catalogued) |  |
| PASS | PASS | POST | /auth/super-admin/login | Public route — auth not required (catalogued) |  |
| PASS | PASS | POST | /auth/refresh | Public route — auth not required (catalogued) |  |
| FAIL | FAIL_CASE | POST | /auth/logout | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /auth/sessions | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /auth/sessions/{sessionId}/revoke | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /auth/logout-all | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /auth/me | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /auth/me | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /auth/change-password | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /auth/tenant/change-password | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /auth/invite | No Authorization header | 429 |
| PASS | PASS | POST | /auth/accept-invite | Public route — auth not required (catalogued) |  |
| FAIL | FAIL_CASE | POST | /auth/2fa/setup | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /auth/2fa/enable | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /auth/2fa/disable | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/countries | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/countries | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/countries/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/countries/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/countries/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/currencies | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/currencies | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/currencies/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/currencies/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/currencies/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/exchange-rates | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/exchange-rates | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/exchange-rates/latest/{currencyId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/ports | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/ports | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/ports/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/ports/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/ports/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/airports | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/airports | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/airports/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/airports/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/airports/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/container-types | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/container-types | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/container-types/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/container-types/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/container-types/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/hs-codes | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/hs-codes | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/hs-codes/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/hs-codes/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/hs-codes/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/airlines | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/airlines | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/airlines/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/airlines/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/airlines/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/shipping-lines | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/shipping-lines | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/shipping-lines/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/shipping-lines/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/shipping-lines/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/vessels | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/vessels | No Authorization header | 503 |
| FAIL | FAIL_CASE | GET | /masters/vessels/{id} | No Authorization header | 503 |
| FAIL | FAIL_CASE | PATCH | /masters/vessels/{id} | No Authorization header | 503 |
| FAIL | FAIL_CASE | DELETE | /masters/vessels/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /vessels/{id}/schedules | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /vessels/{id}/schedules | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /vessels/{id}/schedules/{scheduleId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /vessels/{id}/schedules/{scheduleId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/truckers | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/truckers | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/truckers/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/truckers/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/truckers/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/warehouses | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/warehouses | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/warehouses/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/warehouses/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/warehouses/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/charge-codes | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/charge-codes | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/charge-codes/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/charge-codes/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/charge-codes/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/banks | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/banks | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/banks/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/banks/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/banks/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/holidays | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/holidays | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/holidays/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/holidays/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/holidays/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/units-of-measure | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/units-of-measure | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/units-of-measure/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/units-of-measure/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/units-of-measure/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/tax-rates | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/tax-rates | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/tax-rates/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/tax-rates/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/tax-rates/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/branches | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/branches | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/branches/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/branches/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/branches/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/departments | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/departments | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/departments/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/departments/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/departments/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/designations | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /masters/designations | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /masters/designations/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /masters/designations/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /masters/designations/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /parties | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /parties | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /parties/export | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /parties/{id}/history | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /parties/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /parties/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /parties/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /parties/import | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /parties/{id}/credit-status | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /parties/{id}/contacts | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /parties/{id}/contacts/{contactId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /parties/{id}/contacts/{contactId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /parties/{id}/addresses | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /parties/{id}/addresses/{addressId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /parties/{id}/addresses/{addressId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /organization/profile | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /organization/profile | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /organization/bank-accounts | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /organization/bank-accounts | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /organization/bank-accounts/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /organization/bank-accounts/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /organization/bank-accounts/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /organization/number-formats | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /organization/number-formats | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /organization/number-formats/{documentType} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /organization/number-formats/{documentType} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /organization/number-formats/{documentType}/preview | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/tariffs | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/tariffs | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/tariffs/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /quotations/tariffs/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /quotations/tariffs/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/zip-distances | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/zip-distances | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/zip-distances/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /quotations/zip-distances/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /quotations/zip-distances/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/reports/chargewise | No Authorization header | 503 |
| FAIL | FAIL_CASE | GET | /quotations/reports/analytics | No Authorization header | 503 |
| FAIL | FAIL_CASE | GET | /quotations/reports/analytics/conversion | No Authorization header | 503 |
| FAIL | FAIL_CASE | GET | /quotations/reports/analytics/lost-reasons | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/reports/analytics/response-time | No Authorization header | 429 |
| PASS | PASS | POST | /quotations/online-quote | Public route — auth not required (catalogued) |  |
| FAIL | FAIL_CASE | POST | /quotations/expire-due | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /quotations/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /quotations/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/{id}/revisions | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/lines | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/apply-tariff | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /quotations/{id}/lines/{lineId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /quotations/{id}/lines/{lineId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/submit | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/approve | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/reject | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/send | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/mark-won | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/mark-lost | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/duplicate | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/convert-to-job | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/archive | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/expire | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/pdf | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/{id}/pdf | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /quotations/{id}/pdf/status | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /quotations/{id}/send-email | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /jobs/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/house-jobs | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/milestones | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/milestones | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/pnl | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/notes | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/notes | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/documents | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/containers | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/containers | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/containers/fill | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/containers/{containerId}/fill | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/cutoffs | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/cargo | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/cargo | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/bills-of-lading | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/bills-of-lading | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/stuffing-records | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/stuffing-records | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/close | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/cancel | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/air-details | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/sea-fcl-details | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/sea-fcl-details/si-submission | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/sea-fcl-details/vgm-submission | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/milestones/{milestoneId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/charges | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/charges/{chargeId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /jobs/{id}/charges/{chargeId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/prorate-cost/{chargeCodeId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/notes/{noteId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /jobs/{id}/notes/{noteId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/documents/{documentId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /jobs/{id}/documents/{documentId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/{documentId}/finalize | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/documents/generation-status | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/hawb | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/mawb | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/pre-alert | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/cargo-manifest | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/hbl | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/hbl-express-release | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/mbl | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/fiata-bl | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/rider-bl | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/switch-bl | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/proxy-bl | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/back-to-back-bl | No Authorization header | 503 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/surrender-notice | No Authorization header | 503 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/si | No Authorization header | 503 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/stuffing-report | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/sailing-confirmation | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/transhipment-confirmation | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/freight-manifest | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/job-card | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/job-pnl | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/proforma-invoice | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/pre-alert/send | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/pre-alert/schedule | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/whatsapp/status | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/sub-jobs | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/sub-jobs | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/payment-requests | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/e-awb | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/barcode-label | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/consignee-label | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/job-costing | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/freight-certificate | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/containers/{containerId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /jobs/{id}/containers/{containerId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/cargo | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/split | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/cargo/{cargoId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /jobs/{id}/cargo/{cargoId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/bills-of-lading/{blId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /jobs/{id}/bills-of-lading/{blId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/stuffing-records/{recordId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /jobs/{id}/stuffing-records/{recordId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/free-days | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/free-days | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/free-days/recalculate | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/deposits | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/deposits | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/deposits/{depositId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /jobs/{id}/deposits/{depositId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /jobs/{id}/customs-status | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/containers/{containerId}/return | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/part-deliveries | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/part-deliveries | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/pods | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/pods | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /jobs/{id}/damage-reports | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/damage-reports | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/transhipment-link | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/cfs-storage/calculate | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/pre-can | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/can | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/exchange-letter | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/undertake-letter | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/delivery-order | No Authorization header | 503 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/transport-request | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/shipping-advice | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /jobs/{id}/documents/proof-of-delivery | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /awb-stock/batches | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /awb-stock/batches | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /awb-stock/reports/low-stock | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /awb-stock/allocations | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /awb-stock/batches/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /awb-stock/batches/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /awb-stock/batches/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /awb-stock/batches/{id}/allocate | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /awb-stock/batches/{id}/transfer-branch | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /awb-stock/allocations/{id}/void | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /awb-stock/allocations/{id}/mark-used | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /search | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /files/{tenantId}/{filename} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /invoices | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /invoices | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /invoices/reports/overdue | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /invoices/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /invoices/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /invoices/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /invoices/from-job/{jobId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /invoices/{id}/lines | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /invoices/{id}/lines/{lineId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /invoices/{id}/lines/{lineId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /invoices/{id}/post | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /invoices/{id}/send | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /invoices/{id}/pdf | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /invoices/{id}/pdf | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /invoices/{id}/cancel | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /credit-notes | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /credit-notes | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /credit-notes/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /credit-notes/{id}/post | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /debit-notes | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /debit-notes | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /debit-notes/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /debit-notes/{id}/post | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /purchase-invoices | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /purchase-invoices | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /purchase-invoices/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /purchase-invoices/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /purchase-invoices/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /purchase-invoices/{id}/post | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /payment-requests | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /payment-requests | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /payment-requests/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /payment-requests/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /payment-requests/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /payment-requests/{id}/approve | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /payment-requests/{id}/reject | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /payment-requests/{id}/mark-paid | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/accounts | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/accounts | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/accounts/tree | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/accounts/reports/trial-balance | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/accounts/seed-defaults | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/accounts/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /gl/accounts/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /gl/accounts/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/accounts/{id}/ledger | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/vouchers | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/vouchers | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/vouchers/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /gl/vouchers/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /gl/vouchers/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/vouchers/{id}/lines | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /gl/vouchers/{id}/lines/{lineId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /gl/vouchers/{id}/lines/{lineId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/vouchers/{id}/post | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/vouchers/{id}/reverse | No Authorization header | 503 |
| FAIL | FAIL_CASE | GET | /gl/payments | No Authorization header | 503 |
| FAIL | FAIL_CASE | POST | /gl/payments | No Authorization header | 503 |
| FAIL | FAIL_CASE | GET | /gl/payments/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /gl/payments/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /gl/payments/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/payments/{id}/allocations | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /gl/payments/{id}/allocations/{allocationId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/payments/{id}/post | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/payments/{id}/cancel | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/ar/aging | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/ap/aging | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/ar/statement/{partyId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/ap/statement/{partyId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/cheques | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/cheques | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/cheques/reports/pdc-due | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/cheques/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /gl/cheques/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/cheques/{id}/deposit | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/cheques/{id}/clear | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/cheques/{id}/bounce | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/cheques/{id}/cancel | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/bank-transfers | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/bank-reconciliations | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/bank-reconciliations | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/bank-reconciliations/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /gl/bank-reconciliations/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /gl/bank-reconciliations/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/bank-reconciliations/{id}/unmatched | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/bank-reconciliations/{id}/lines | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /gl/bank-reconciliations/{id}/lines/{lineId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /gl/bank-reconciliations/{id}/lines/{lineId} | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/bank-reconciliations/{id}/complete | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/reports/trial-balance | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/reports/balance-sheet | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/reports/profit-and-loss | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/reports/cash-flow | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/reports/vat-return | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/mis/dashboard | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/mis/profitability | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/mis/operational | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/saved-reports | No Authorization header | 429 |
| FAIL | FAIL_CASE | POST | /gl/saved-reports | No Authorization header | 429 |
| FAIL | FAIL_CASE | GET | /gl/saved-reports/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | PATCH | /gl/saved-reports/{id} | No Authorization header | 429 |
| FAIL | FAIL_CASE | DELETE | /gl/saved-reports/{id} | No Authorization header | 429 |
| FAIL | PASS_CASE | POST | /auth/super-admin/signup | Super admin signup | 429 |
| FAIL | PASS_CASE | POST | /auth/super-admin/login | Super admin login (fallback) | 429 |

## Context IDs created this run
```json
{
  "saEmail": "live.sa.1787902145904@kingfisher.test",
  "tenantSlug": "live-1787902145904",
  "tenantId": null,
  "companyId": null,
  "customerId": null,
  "quotationId": null,
  "jobId": null,
  "invoiceId": null
}
```