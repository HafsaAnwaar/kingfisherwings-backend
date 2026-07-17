# KingFisher Wings — Full Live API Test Results

**Swagger:** https://kingfisherwings.onrender.com/docs

**Base URL:** https://kingfisherwings.onrender.com

**Run ID:** 1784282902909

**When:** 2026-07-17T10:08:23.449Z

## Executive summary

| Metric | Count |
|--------|------:|
| OpenAPI operations | 444 |
| Total test executions | 771 |
| Executions passed | 760 |
| Executions failed | 11 |
| APIs with all tests passing | 434 |
| APIs with at least one failure | 10 |

### Test credentials (created for this run)

| Role | Value |
|------|-------|
| Super Admin email | live.sa.1784282902909@kingfisher.test |
| Super Admin password | Welcome@123 |
| Tenant slug | live-1784282902909 |
| Tenant admin password | Welcome@123 |
| Staff login | tenant slug + staff user created in run |

## APIs with failures (10)

| Method | Path | Tag | Failed tests |
|--------|------|-----|-------------|
| POST | /auth/accept-invite | Auth | FAIL_CASE: No Authorization header (400) |
| POST | /auth/logout | Auth | FAIL_CASE: Invalid / incomplete payload (200); PASS_CASE: Logout (401) |
| POST | /credit-notes | Credit Notes | PASS_CASE: Create credit note (500) |
| POST | /invoices/{id}/pdf | Invoices | PASS_CASE: Generate invoice PDF (500) |
| POST | /invoices/{id}/send | Invoices | PASS_CASE: Send invoice email (500) |
| POST | /jobs/{id}/documents/hawb | Jobs | PASS_CASE: Queue HAWB PDF (500) |
| GET | /locale/{countryCode} | Locale | FAIL_CASE: No Authorization header (200) |
| GET | /locale/defaults | Locale | FAIL_CASE: No Authorization header (200) |
| POST | /purchase-invoices | Purchase Invoices | PASS_CASE: Create purchase invoice (500) |
| POST | /quotations/{id}/pdf | Quotations | PASS_CASE: Queue quotation PDF (n/a) |

## All APIs — pass/fail per endpoint

| # | Method | Path | Tag | Tests | Pass | Fail | Overall |
|---|--------|------|-----|------:|-----:|-----:|---------|
| 1 | POST | /auth/2fa/disable | Auth | 2 | 2 | 0 | **PASS** |
| 2 | POST | /auth/2fa/enable | Auth | 2 | 2 | 0 | **PASS** |
| 3 | POST | /auth/2fa/setup | Auth | 2 | 2 | 0 | **PASS** |
| 4 | POST | /auth/accept-invite | Auth | 2 | 1 | 1 | **FAIL** |
| 5 | POST | /auth/change-password | Auth | 2 | 2 | 0 | **PASS** |
| 6 | POST | /auth/invite | Auth | 2 | 2 | 0 | **PASS** |
| 7 | POST | /auth/login | Auth | 1 | 1 | 0 | **PASS** |
| 8 | POST | /auth/logout | Auth | 3 | 1 | 2 | **FAIL** |
| 9 | POST | /auth/logout-all | Auth | 2 | 2 | 0 | **PASS** |
| 10 | GET | /auth/me | Auth | 2 | 2 | 0 | **PASS** |
| 11 | PATCH | /auth/me | Auth | 2 | 2 | 0 | **PASS** |
| 12 | POST | /auth/refresh | Auth | 2 | 2 | 0 | **PASS** |
| 13 | GET | /auth/sessions | Auth | 2 | 2 | 0 | **PASS** |
| 14 | POST | /auth/sessions/{sessionId}/revoke | Auth | 2 | 2 | 0 | **PASS** |
| 15 | POST | /auth/super-admin/login | Auth | 2 | 2 | 0 | **PASS** |
| 16 | POST | /auth/super-admin/signup | Auth | 2 | 2 | 0 | **PASS** |
| 17 | POST | /auth/tenant-login | Auth | 3 | 3 | 0 | **PASS** |
| 18 | POST | /auth/tenant/change-password | Auth | 2 | 2 | 0 | **PASS** |
| 19 | GET | /awb-stock/allocations | AWB Stock | 1 | 1 | 0 | **PASS** |
| 20 | POST | /awb-stock/allocations/{id}/mark-used | AWB Stock | 2 | 2 | 0 | **PASS** |
| 21 | POST | /awb-stock/allocations/{id}/void | AWB Stock | 2 | 2 | 0 | **PASS** |
| 22 | GET | /awb-stock/batches | AWB Stock | 2 | 2 | 0 | **PASS** |
| 23 | POST | /awb-stock/batches | AWB Stock | 3 | 3 | 0 | **PASS** |
| 24 | GET | /awb-stock/batches/{id} | AWB Stock | 1 | 1 | 0 | **PASS** |
| 25 | PATCH | /awb-stock/batches/{id} | AWB Stock | 2 | 2 | 0 | **PASS** |
| 26 | DELETE | /awb-stock/batches/{id} | AWB Stock | 1 | 1 | 0 | **PASS** |
| 27 | POST | /awb-stock/batches/{id}/allocate | AWB Stock | 3 | 3 | 0 | **PASS** |
| 28 | POST | /awb-stock/batches/{id}/transfer-branch | AWB Stock | 2 | 2 | 0 | **PASS** |
| 29 | GET | /awb-stock/reports/low-stock | AWB Stock | 2 | 2 | 0 | **PASS** |
| 30 | GET | /companies | Companies | 2 | 2 | 0 | **PASS** |
| 31 | POST | /companies | Companies | 2 | 2 | 0 | **PASS** |
| 32 | GET | /companies/{id} | Companies | 1 | 1 | 0 | **PASS** |
| 33 | PATCH | /companies/{id} | Companies | 2 | 2 | 0 | **PASS** |
| 34 | DELETE | /companies/{id} | Companies | 1 | 1 | 0 | **PASS** |
| 35 | GET | /credit-notes | Credit Notes | 1 | 1 | 0 | **PASS** |
| 36 | POST | /credit-notes | Credit Notes | 3 | 2 | 1 | **FAIL** |
| 37 | GET | /credit-notes/{id} | Credit Notes | 1 | 1 | 0 | **PASS** |
| 38 | POST | /credit-notes/{id}/post | Credit Notes | 2 | 2 | 0 | **PASS** |
| 39 | GET | /debit-notes | Debit Notes | 1 | 1 | 0 | **PASS** |
| 40 | POST | /debit-notes | Debit Notes | 2 | 2 | 0 | **PASS** |
| 41 | GET | /debit-notes/{id} | Debit Notes | 1 | 1 | 0 | **PASS** |
| 42 | POST | /debit-notes/{id}/post | Debit Notes | 2 | 2 | 0 | **PASS** |
| 43 | GET | /files/{tenantId}/{filename} | Files | 1 | 1 | 0 | **PASS** |
| 44 | GET | /gl/accounts | GL — Chart of Accounts | 1 | 1 | 0 | **PASS** |
| 45 | POST | /gl/accounts | GL — Chart of Accounts | 2 | 2 | 0 | **PASS** |
| 46 | GET | /gl/accounts/{id} | GL — Chart of Accounts | 1 | 1 | 0 | **PASS** |
| 47 | PATCH | /gl/accounts/{id} | GL — Chart of Accounts | 2 | 2 | 0 | **PASS** |
| 48 | DELETE | /gl/accounts/{id} | GL — Chart of Accounts | 1 | 1 | 0 | **PASS** |
| 49 | GET | /gl/accounts/{id}/ledger | GL — Chart of Accounts | 1 | 1 | 0 | **PASS** |
| 50 | GET | /gl/accounts/reports/trial-balance | GL — Chart of Accounts | 1 | 1 | 0 | **PASS** |
| 51 | POST | /gl/accounts/seed-defaults | GL — Chart of Accounts | 2 | 2 | 0 | **PASS** |
| 52 | GET | /gl/accounts/tree | GL — Chart of Accounts | 1 | 1 | 0 | **PASS** |
| 53 | GET | /gl/ap/aging | GL — AR / AP Aging | 1 | 1 | 0 | **PASS** |
| 54 | GET | /gl/ap/statement/{partyId} | GL — AR / AP Aging | 1 | 1 | 0 | **PASS** |
| 55 | GET | /gl/ar/aging | GL — AR / AP Aging | 1 | 1 | 0 | **PASS** |
| 56 | GET | /gl/ar/statement/{partyId} | GL — AR / AP Aging | 1 | 1 | 0 | **PASS** |
| 57 | GET | /gl/bank-reconciliations | GL — Bank Reconciliation | 1 | 1 | 0 | **PASS** |
| 58 | POST | /gl/bank-reconciliations | GL — Bank Reconciliation | 2 | 2 | 0 | **PASS** |
| 59 | GET | /gl/bank-reconciliations/{id} | GL — Bank Reconciliation | 1 | 1 | 0 | **PASS** |
| 60 | PATCH | /gl/bank-reconciliations/{id} | GL — Bank Reconciliation | 2 | 2 | 0 | **PASS** |
| 61 | DELETE | /gl/bank-reconciliations/{id} | GL — Bank Reconciliation | 1 | 1 | 0 | **PASS** |
| 62 | POST | /gl/bank-reconciliations/{id}/complete | GL — Bank Reconciliation | 2 | 2 | 0 | **PASS** |
| 63 | POST | /gl/bank-reconciliations/{id}/lines | GL — Bank Reconciliation | 2 | 2 | 0 | **PASS** |
| 64 | PATCH | /gl/bank-reconciliations/{id}/lines/{lineId} | GL — Bank Reconciliation | 2 | 2 | 0 | **PASS** |
| 65 | DELETE | /gl/bank-reconciliations/{id}/lines/{lineId} | GL — Bank Reconciliation | 1 | 1 | 0 | **PASS** |
| 66 | GET | /gl/bank-reconciliations/{id}/unmatched | GL — Bank Reconciliation | 1 | 1 | 0 | **PASS** |
| 67 | POST | /gl/bank-transfers | GL — Bank Reconciliation | 2 | 2 | 0 | **PASS** |
| 68 | GET | /gl/cheques | GL — Cheques / PDC | 1 | 1 | 0 | **PASS** |
| 69 | POST | /gl/cheques | GL — Cheques / PDC | 2 | 2 | 0 | **PASS** |
| 70 | GET | /gl/cheques/{id} | GL — Cheques / PDC | 1 | 1 | 0 | **PASS** |
| 71 | PATCH | /gl/cheques/{id} | GL — Cheques / PDC | 2 | 2 | 0 | **PASS** |
| 72 | POST | /gl/cheques/{id}/bounce | GL — Cheques / PDC | 2 | 2 | 0 | **PASS** |
| 73 | POST | /gl/cheques/{id}/cancel | GL — Cheques / PDC | 2 | 2 | 0 | **PASS** |
| 74 | POST | /gl/cheques/{id}/clear | GL — Cheques / PDC | 2 | 2 | 0 | **PASS** |
| 75 | POST | /gl/cheques/{id}/deposit | GL — Cheques / PDC | 2 | 2 | 0 | **PASS** |
| 76 | GET | /gl/cheques/reports/pdc-due | GL — Cheques / PDC | 1 | 1 | 0 | **PASS** |
| 77 | GET | /gl/mis/dashboard | GL — MIS Dashboard | 1 | 1 | 0 | **PASS** |
| 78 | GET | /gl/mis/operational | GL — MIS Dashboard | 1 | 1 | 0 | **PASS** |
| 79 | GET | /gl/mis/profitability | GL — MIS Dashboard | 1 | 1 | 0 | **PASS** |
| 80 | GET | /gl/payments | GL — Payments (AR/AP) | 1 | 1 | 0 | **PASS** |
| 81 | POST | /gl/payments | GL — Payments (AR/AP) | 2 | 2 | 0 | **PASS** |
| 82 | GET | /gl/payments/{id} | GL — Payments (AR/AP) | 1 | 1 | 0 | **PASS** |
| 83 | PATCH | /gl/payments/{id} | GL — Payments (AR/AP) | 2 | 2 | 0 | **PASS** |
| 84 | DELETE | /gl/payments/{id} | GL — Payments (AR/AP) | 1 | 1 | 0 | **PASS** |
| 85 | POST | /gl/payments/{id}/allocations | GL — Payments (AR/AP) | 2 | 2 | 0 | **PASS** |
| 86 | DELETE | /gl/payments/{id}/allocations/{allocationId} | GL — Payments (AR/AP) | 1 | 1 | 0 | **PASS** |
| 87 | POST | /gl/payments/{id}/cancel | GL — Payments (AR/AP) | 2 | 2 | 0 | **PASS** |
| 88 | POST | /gl/payments/{id}/post | GL — Payments (AR/AP) | 2 | 2 | 0 | **PASS** |
| 89 | GET | /gl/reports/balance-sheet | GL — Financial Reports | 1 | 1 | 0 | **PASS** |
| 90 | GET | /gl/reports/cash-flow | GL — Financial Reports | 1 | 1 | 0 | **PASS** |
| 91 | GET | /gl/reports/profit-and-loss | GL — Financial Reports | 1 | 1 | 0 | **PASS** |
| 92 | GET | /gl/reports/trial-balance | GL — Financial Reports | 1 | 1 | 0 | **PASS** |
| 93 | GET | /gl/reports/vat-return | GL — Financial Reports | 1 | 1 | 0 | **PASS** |
| 94 | GET | /gl/saved-reports | GL — My Reports | 1 | 1 | 0 | **PASS** |
| 95 | POST | /gl/saved-reports | GL — My Reports | 2 | 2 | 0 | **PASS** |
| 96 | GET | /gl/saved-reports/{id} | GL — My Reports | 1 | 1 | 0 | **PASS** |
| 97 | PATCH | /gl/saved-reports/{id} | GL — My Reports | 2 | 2 | 0 | **PASS** |
| 98 | DELETE | /gl/saved-reports/{id} | GL — My Reports | 1 | 1 | 0 | **PASS** |
| 99 | GET | /gl/vouchers | GL — Vouchers | 1 | 1 | 0 | **PASS** |
| 100 | POST | /gl/vouchers | GL — Vouchers | 2 | 2 | 0 | **PASS** |
| 101 | GET | /gl/vouchers/{id} | GL — Vouchers | 1 | 1 | 0 | **PASS** |
| 102 | PATCH | /gl/vouchers/{id} | GL — Vouchers | 2 | 2 | 0 | **PASS** |
| 103 | DELETE | /gl/vouchers/{id} | GL — Vouchers | 1 | 1 | 0 | **PASS** |
| 104 | POST | /gl/vouchers/{id}/lines | GL — Vouchers | 2 | 2 | 0 | **PASS** |
| 105 | PATCH | /gl/vouchers/{id}/lines/{lineId} | GL — Vouchers | 2 | 2 | 0 | **PASS** |
| 106 | DELETE | /gl/vouchers/{id}/lines/{lineId} | GL — Vouchers | 1 | 1 | 0 | **PASS** |
| 107 | POST | /gl/vouchers/{id}/post | GL — Vouchers | 2 | 2 | 0 | **PASS** |
| 108 | POST | /gl/vouchers/{id}/reverse | GL — Vouchers | 2 | 2 | 0 | **PASS** |
| 109 | GET | /health | Untagged | 1 | 1 | 0 | **PASS** |
| 110 | GET | /invoices | Invoices | 2 | 2 | 0 | **PASS** |
| 111 | POST | /invoices | Invoices | 2 | 2 | 0 | **PASS** |
| 112 | GET | /invoices/{id} | Invoices | 2 | 2 | 0 | **PASS** |
| 113 | PATCH | /invoices/{id} | Invoices | 2 | 2 | 0 | **PASS** |
| 114 | DELETE | /invoices/{id} | Invoices | 1 | 1 | 0 | **PASS** |
| 115 | POST | /invoices/{id}/cancel | Invoices | 2 | 2 | 0 | **PASS** |
| 116 | POST | /invoices/{id}/lines | Invoices | 2 | 2 | 0 | **PASS** |
| 117 | PATCH | /invoices/{id}/lines/{lineId} | Invoices | 2 | 2 | 0 | **PASS** |
| 118 | DELETE | /invoices/{id}/lines/{lineId} | Invoices | 1 | 1 | 0 | **PASS** |
| 119 | POST | /invoices/{id}/pdf | Invoices | 3 | 2 | 1 | **FAIL** |
| 120 | GET | /invoices/{id}/pdf | Invoices | 1 | 1 | 0 | **PASS** |
| 121 | POST | /invoices/{id}/post | Invoices | 3 | 3 | 0 | **PASS** |
| 122 | POST | /invoices/{id}/send | Invoices | 3 | 2 | 1 | **FAIL** |
| 123 | POST | /invoices/from-job/{id} | Invoices | 1 | 1 | 0 | **PASS** |
| 124 | POST | /invoices/from-job/{jobId} | Invoices | 2 | 2 | 0 | **PASS** |
| 125 | GET | /invoices/reports/overdue | Invoices | 2 | 2 | 0 | **PASS** |
| 126 | GET | /jobs | Jobs | 2 | 2 | 0 | **PASS** |
| 127 | POST | /jobs | Jobs | 3 | 3 | 0 | **PASS** |
| 128 | GET | /jobs/{id} | Jobs | 2 | 2 | 0 | **PASS** |
| 129 | PATCH | /jobs/{id} | Jobs | 2 | 2 | 0 | **PASS** |
| 130 | DELETE | /jobs/{id} | Jobs | 1 | 1 | 0 | **PASS** |
| 131 | PATCH | /jobs/{id}/air-details | Jobs | 3 | 3 | 0 | **PASS** |
| 132 | GET | /jobs/{id}/bills-of-lading | Jobs | 1 | 1 | 0 | **PASS** |
| 133 | POST | /jobs/{id}/bills-of-lading | Jobs | 2 | 2 | 0 | **PASS** |
| 134 | PATCH | /jobs/{id}/bills-of-lading/{blId} | Jobs | 2 | 2 | 0 | **PASS** |
| 135 | DELETE | /jobs/{id}/bills-of-lading/{blId} | Jobs | 1 | 1 | 0 | **PASS** |
| 136 | POST | /jobs/{id}/cancel | Jobs | 2 | 2 | 0 | **PASS** |
| 137 | GET | /jobs/{id}/cargo | Jobs | 1 | 1 | 0 | **PASS** |
| 138 | POST | /jobs/{id}/cargo | Jobs | 2 | 2 | 0 | **PASS** |
| 139 | PATCH | /jobs/{id}/cargo/{cargoId} | Jobs | 2 | 2 | 0 | **PASS** |
| 140 | DELETE | /jobs/{id}/cargo/{cargoId} | Jobs | 1 | 1 | 0 | **PASS** |
| 141 | POST | /jobs/{id}/cfs-storage/calculate | Jobs | 2 | 2 | 0 | **PASS** |
| 142 | POST | /jobs/{id}/charges | Jobs | 3 | 3 | 0 | **PASS** |
| 143 | PATCH | /jobs/{id}/charges/{chargeId} | Jobs | 2 | 2 | 0 | **PASS** |
| 144 | DELETE | /jobs/{id}/charges/{chargeId} | Jobs | 1 | 1 | 0 | **PASS** |
| 145 | POST | /jobs/{id}/close | Jobs | 2 | 2 | 0 | **PASS** |
| 146 | GET | /jobs/{id}/containers | Jobs | 1 | 1 | 0 | **PASS** |
| 147 | POST | /jobs/{id}/containers | Jobs | 2 | 2 | 0 | **PASS** |
| 148 | PATCH | /jobs/{id}/containers/{containerId} | Jobs | 2 | 2 | 0 | **PASS** |
| 149 | DELETE | /jobs/{id}/containers/{containerId} | Jobs | 1 | 1 | 0 | **PASS** |
| 150 | POST | /jobs/{id}/containers/{containerId}/cargo | Jobs | 2 | 2 | 0 | **PASS** |
| 151 | GET | /jobs/{id}/containers/{containerId}/fill | Jobs | 1 | 1 | 0 | **PASS** |
| 152 | POST | /jobs/{id}/containers/{containerId}/return | Jobs | 2 | 2 | 0 | **PASS** |
| 153 | POST | /jobs/{id}/containers/{containerId}/split | Jobs | 2 | 2 | 0 | **PASS** |
| 154 | GET | /jobs/{id}/containers/fill | Jobs | 1 | 1 | 0 | **PASS** |
| 155 | PATCH | /jobs/{id}/customs-status | Jobs | 2 | 2 | 0 | **PASS** |
| 156 | GET | /jobs/{id}/cutoffs | Jobs | 1 | 1 | 0 | **PASS** |
| 157 | GET | /jobs/{id}/damage-reports | Jobs | 1 | 1 | 0 | **PASS** |
| 158 | POST | /jobs/{id}/damage-reports | Jobs | 2 | 2 | 0 | **PASS** |
| 159 | GET | /jobs/{id}/deposits | Jobs | 1 | 1 | 0 | **PASS** |
| 160 | POST | /jobs/{id}/deposits | Jobs | 2 | 2 | 0 | **PASS** |
| 161 | PATCH | /jobs/{id}/deposits/{depositId} | Jobs | 2 | 2 | 0 | **PASS** |
| 162 | DELETE | /jobs/{id}/deposits/{depositId} | Jobs | 1 | 1 | 0 | **PASS** |
| 163 | GET | /jobs/{id}/documents | Jobs | 1 | 1 | 0 | **PASS** |
| 164 | POST | /jobs/{id}/documents | Jobs | 2 | 2 | 0 | **PASS** |
| 165 | PATCH | /jobs/{id}/documents/{documentId} | Jobs | 2 | 2 | 0 | **PASS** |
| 166 | DELETE | /jobs/{id}/documents/{documentId} | Jobs | 1 | 1 | 0 | **PASS** |
| 167 | POST | /jobs/{id}/documents/{documentId}/finalize | Jobs | 2 | 2 | 0 | **PASS** |
| 168 | POST | /jobs/{id}/documents/back-to-back-bl | Jobs | 2 | 2 | 0 | **PASS** |
| 169 | POST | /jobs/{id}/documents/barcode-label | Jobs | 2 | 2 | 0 | **PASS** |
| 170 | POST | /jobs/{id}/documents/can | Jobs | 2 | 2 | 0 | **PASS** |
| 171 | POST | /jobs/{id}/documents/cargo-manifest | Jobs | 2 | 2 | 0 | **PASS** |
| 172 | POST | /jobs/{id}/documents/consignee-label | Jobs | 2 | 2 | 0 | **PASS** |
| 173 | POST | /jobs/{id}/documents/delivery-order | Jobs | 2 | 2 | 0 | **PASS** |
| 174 | POST | /jobs/{id}/documents/e-awb | Jobs | 2 | 2 | 0 | **PASS** |
| 175 | POST | /jobs/{id}/documents/exchange-letter | Jobs | 2 | 2 | 0 | **PASS** |
| 176 | POST | /jobs/{id}/documents/fiata-bl | Jobs | 2 | 2 | 0 | **PASS** |
| 177 | POST | /jobs/{id}/documents/freight-certificate | Jobs | 2 | 2 | 0 | **PASS** |
| 178 | POST | /jobs/{id}/documents/freight-manifest | Jobs | 2 | 2 | 0 | **PASS** |
| 179 | GET | /jobs/{id}/documents/generation-status | Jobs | 2 | 2 | 0 | **PASS** |
| 180 | POST | /jobs/{id}/documents/hawb | Jobs | 3 | 2 | 1 | **FAIL** |
| 181 | POST | /jobs/{id}/documents/hbl | Jobs | 2 | 2 | 0 | **PASS** |
| 182 | POST | /jobs/{id}/documents/hbl-express-release | Jobs | 2 | 2 | 0 | **PASS** |
| 183 | POST | /jobs/{id}/documents/job-card | Jobs | 2 | 2 | 0 | **PASS** |
| 184 | POST | /jobs/{id}/documents/job-costing | Jobs | 2 | 2 | 0 | **PASS** |
| 185 | POST | /jobs/{id}/documents/job-pnl | Jobs | 2 | 2 | 0 | **PASS** |
| 186 | POST | /jobs/{id}/documents/mawb | Jobs | 2 | 2 | 0 | **PASS** |
| 187 | POST | /jobs/{id}/documents/mbl | Jobs | 2 | 2 | 0 | **PASS** |
| 188 | POST | /jobs/{id}/documents/pre-alert | Jobs | 2 | 2 | 0 | **PASS** |
| 189 | POST | /jobs/{id}/documents/pre-can | Jobs | 2 | 2 | 0 | **PASS** |
| 190 | POST | /jobs/{id}/documents/proforma-invoice | Jobs | 2 | 2 | 0 | **PASS** |
| 191 | POST | /jobs/{id}/documents/proof-of-delivery | Jobs | 2 | 2 | 0 | **PASS** |
| 192 | POST | /jobs/{id}/documents/proxy-bl | Jobs | 2 | 2 | 0 | **PASS** |
| 193 | POST | /jobs/{id}/documents/rider-bl | Jobs | 2 | 2 | 0 | **PASS** |
| 194 | POST | /jobs/{id}/documents/sailing-confirmation | Jobs | 2 | 2 | 0 | **PASS** |
| 195 | POST | /jobs/{id}/documents/shipping-advice | Jobs | 2 | 2 | 0 | **PASS** |
| 196 | POST | /jobs/{id}/documents/si | Jobs | 2 | 2 | 0 | **PASS** |
| 197 | POST | /jobs/{id}/documents/stuffing-report | Jobs | 2 | 2 | 0 | **PASS** |
| 198 | POST | /jobs/{id}/documents/surrender-notice | Jobs | 2 | 2 | 0 | **PASS** |
| 199 | POST | /jobs/{id}/documents/switch-bl | Jobs | 2 | 2 | 0 | **PASS** |
| 200 | POST | /jobs/{id}/documents/transhipment-confirmation | Jobs | 2 | 2 | 0 | **PASS** |
| 201 | POST | /jobs/{id}/documents/transport-request | Jobs | 2 | 2 | 0 | **PASS** |
| 202 | POST | /jobs/{id}/documents/undertake-letter | Jobs | 2 | 2 | 0 | **PASS** |
| 203 | GET | /jobs/{id}/free-days | Jobs | 1 | 1 | 0 | **PASS** |
| 204 | POST | /jobs/{id}/free-days | Jobs | 2 | 2 | 0 | **PASS** |
| 205 | POST | /jobs/{id}/free-days/recalculate | Jobs | 2 | 2 | 0 | **PASS** |
| 206 | GET | /jobs/{id}/house-jobs | Jobs | 1 | 1 | 0 | **PASS** |
| 207 | GET | /jobs/{id}/milestones | Jobs | 2 | 2 | 0 | **PASS** |
| 208 | POST | /jobs/{id}/milestones | Jobs | 2 | 2 | 0 | **PASS** |
| 209 | PATCH | /jobs/{id}/milestones/{id} | Jobs | 1 | 1 | 0 | **PASS** |
| 210 | PATCH | /jobs/{id}/milestones/{milestoneId} | Jobs | 2 | 2 | 0 | **PASS** |
| 211 | GET | /jobs/{id}/notes | Jobs | 1 | 1 | 0 | **PASS** |
| 212 | POST | /jobs/{id}/notes | Jobs | 3 | 3 | 0 | **PASS** |
| 213 | PATCH | /jobs/{id}/notes/{noteId} | Jobs | 2 | 2 | 0 | **PASS** |
| 214 | DELETE | /jobs/{id}/notes/{noteId} | Jobs | 1 | 1 | 0 | **PASS** |
| 215 | GET | /jobs/{id}/part-deliveries | Jobs | 1 | 1 | 0 | **PASS** |
| 216 | POST | /jobs/{id}/part-deliveries | Jobs | 2 | 2 | 0 | **PASS** |
| 217 | POST | /jobs/{id}/payment-requests | Jobs | 2 | 2 | 0 | **PASS** |
| 218 | GET | /jobs/{id}/pnl | Jobs | 2 | 2 | 0 | **PASS** |
| 219 | GET | /jobs/{id}/pods | Jobs | 1 | 1 | 0 | **PASS** |
| 220 | POST | /jobs/{id}/pods | Jobs | 2 | 2 | 0 | **PASS** |
| 221 | POST | /jobs/{id}/pre-alert/schedule | Jobs | 2 | 2 | 0 | **PASS** |
| 222 | POST | /jobs/{id}/pre-alert/send | Jobs | 3 | 3 | 0 | **PASS** |
| 223 | POST | /jobs/{id}/prorate-cost/{chargeCodeId} | Jobs | 2 | 2 | 0 | **PASS** |
| 224 | PATCH | /jobs/{id}/sea-fcl-details | Jobs | 2 | 2 | 0 | **PASS** |
| 225 | POST | /jobs/{id}/sea-fcl-details/si-submission | Jobs | 2 | 2 | 0 | **PASS** |
| 226 | POST | /jobs/{id}/sea-fcl-details/vgm-submission | Jobs | 2 | 2 | 0 | **PASS** |
| 227 | GET | /jobs/{id}/stuffing-records | Jobs | 1 | 1 | 0 | **PASS** |
| 228 | POST | /jobs/{id}/stuffing-records | Jobs | 2 | 2 | 0 | **PASS** |
| 229 | PATCH | /jobs/{id}/stuffing-records/{recordId} | Jobs | 2 | 2 | 0 | **PASS** |
| 230 | DELETE | /jobs/{id}/stuffing-records/{recordId} | Jobs | 1 | 1 | 0 | **PASS** |
| 231 | GET | /jobs/{id}/sub-jobs | Jobs | 1 | 1 | 0 | **PASS** |
| 232 | POST | /jobs/{id}/sub-jobs | Jobs | 2 | 2 | 0 | **PASS** |
| 233 | POST | /jobs/{id}/transhipment-link | Jobs | 2 | 2 | 0 | **PASS** |
| 234 | POST | /jobs/{id}/whatsapp/status | Jobs | 2 | 2 | 0 | **PASS** |
| 235 | GET | /locale/{countryCode} | Locale | 1 | 0 | 1 | **FAIL** |
| 236 | GET | /locale/defaults | Locale | 1 | 0 | 1 | **FAIL** |
| 237 | GET | /masters/airlines | Masters — Airlines | 2 | 2 | 0 | **PASS** |
| 238 | POST | /masters/airlines | Masters — Airlines | 3 | 3 | 0 | **PASS** |
| 239 | GET | /masters/airlines/{id} | Masters — Airlines | 1 | 1 | 0 | **PASS** |
| 240 | PATCH | /masters/airlines/{id} | Masters — Airlines | 2 | 2 | 0 | **PASS** |
| 241 | DELETE | /masters/airlines/{id} | Masters — Airlines | 1 | 1 | 0 | **PASS** |
| 242 | GET | /masters/airports | Masters — Airports | 2 | 2 | 0 | **PASS** |
| 243 | POST | /masters/airports | Masters — Airports | 2 | 2 | 0 | **PASS** |
| 244 | GET | /masters/airports/{id} | Masters — Airports | 1 | 1 | 0 | **PASS** |
| 245 | PATCH | /masters/airports/{id} | Masters — Airports | 2 | 2 | 0 | **PASS** |
| 246 | DELETE | /masters/airports/{id} | Masters — Airports | 1 | 1 | 0 | **PASS** |
| 247 | GET | /masters/banks | Masters — Banks | 2 | 2 | 0 | **PASS** |
| 248 | POST | /masters/banks | Masters — Banks | 2 | 2 | 0 | **PASS** |
| 249 | GET | /masters/banks/{id} | Masters — Banks | 1 | 1 | 0 | **PASS** |
| 250 | PATCH | /masters/banks/{id} | Masters — Banks | 2 | 2 | 0 | **PASS** |
| 251 | DELETE | /masters/banks/{id} | Masters — Banks | 1 | 1 | 0 | **PASS** |
| 252 | GET | /masters/branches | Masters — Branches | 2 | 2 | 0 | **PASS** |
| 253 | POST | /masters/branches | Masters — Branches | 3 | 3 | 0 | **PASS** |
| 254 | GET | /masters/branches/{id} | Masters — Branches | 1 | 1 | 0 | **PASS** |
| 255 | PATCH | /masters/branches/{id} | Masters — Branches | 2 | 2 | 0 | **PASS** |
| 256 | DELETE | /masters/branches/{id} | Masters — Branches | 1 | 1 | 0 | **PASS** |
| 257 | GET | /masters/charge-codes | Masters — ChargeCodes | 2 | 2 | 0 | **PASS** |
| 258 | POST | /masters/charge-codes | Masters — ChargeCodes | 3 | 3 | 0 | **PASS** |
| 259 | GET | /masters/charge-codes/{id} | Masters — ChargeCodes | 1 | 1 | 0 | **PASS** |
| 260 | PATCH | /masters/charge-codes/{id} | Masters — ChargeCodes | 2 | 2 | 0 | **PASS** |
| 261 | DELETE | /masters/charge-codes/{id} | Masters — ChargeCodes | 1 | 1 | 0 | **PASS** |
| 262 | GET | /masters/container-types | Masters — ContainerTypes | 2 | 2 | 0 | **PASS** |
| 263 | POST | /masters/container-types | Masters — ContainerTypes | 2 | 2 | 0 | **PASS** |
| 264 | GET | /masters/container-types/{id} | Masters — ContainerTypes | 1 | 1 | 0 | **PASS** |
| 265 | PATCH | /masters/container-types/{id} | Masters — ContainerTypes | 2 | 2 | 0 | **PASS** |
| 266 | DELETE | /masters/container-types/{id} | Masters — ContainerTypes | 1 | 1 | 0 | **PASS** |
| 267 | GET | /masters/countries | Masters — Countries | 2 | 2 | 0 | **PASS** |
| 268 | POST | /masters/countries | Masters — Countries | 4 | 4 | 0 | **PASS** |
| 269 | GET | /masters/countries/{id} | Masters — Countries | 1 | 1 | 0 | **PASS** |
| 270 | PATCH | /masters/countries/{id} | Masters — Countries | 2 | 2 | 0 | **PASS** |
| 271 | DELETE | /masters/countries/{id} | Masters — Countries | 1 | 1 | 0 | **PASS** |
| 272 | GET | /masters/currencies | Masters — Currencies | 2 | 2 | 0 | **PASS** |
| 273 | POST | /masters/currencies | Masters — Currencies | 3 | 3 | 0 | **PASS** |
| 274 | GET | /masters/currencies/{id} | Masters — Currencies | 1 | 1 | 0 | **PASS** |
| 275 | PATCH | /masters/currencies/{id} | Masters — Currencies | 2 | 2 | 0 | **PASS** |
| 276 | DELETE | /masters/currencies/{id} | Masters — Currencies | 1 | 1 | 0 | **PASS** |
| 277 | GET | /masters/departments | Masters — Departments | 2 | 2 | 0 | **PASS** |
| 278 | POST | /masters/departments | Masters — Departments | 2 | 2 | 0 | **PASS** |
| 279 | GET | /masters/departments/{id} | Masters — Departments | 1 | 1 | 0 | **PASS** |
| 280 | PATCH | /masters/departments/{id} | Masters — Departments | 2 | 2 | 0 | **PASS** |
| 281 | DELETE | /masters/departments/{id} | Masters — Departments | 1 | 1 | 0 | **PASS** |
| 282 | GET | /masters/designations | Masters — Designations | 2 | 2 | 0 | **PASS** |
| 283 | POST | /masters/designations | Masters — Designations | 2 | 2 | 0 | **PASS** |
| 284 | GET | /masters/designations/{id} | Masters — Designations | 1 | 1 | 0 | **PASS** |
| 285 | PATCH | /masters/designations/{id} | Masters — Designations | 2 | 2 | 0 | **PASS** |
| 286 | DELETE | /masters/designations/{id} | Masters — Designations | 1 | 1 | 0 | **PASS** |
| 287 | GET | /masters/exchange-rates | Masters — Exchange Rates | 1 | 1 | 0 | **PASS** |
| 288 | POST | /masters/exchange-rates | Masters — Exchange Rates | 2 | 2 | 0 | **PASS** |
| 289 | GET | /masters/exchange-rates/latest/{currencyId} | Masters — Exchange Rates | 1 | 1 | 0 | **PASS** |
| 290 | GET | /masters/holidays | Masters — Holidays | 2 | 2 | 0 | **PASS** |
| 291 | POST | /masters/holidays | Masters — Holidays | 2 | 2 | 0 | **PASS** |
| 292 | GET | /masters/holidays/{id} | Masters — Holidays | 1 | 1 | 0 | **PASS** |
| 293 | PATCH | /masters/holidays/{id} | Masters — Holidays | 2 | 2 | 0 | **PASS** |
| 294 | DELETE | /masters/holidays/{id} | Masters — Holidays | 1 | 1 | 0 | **PASS** |
| 295 | GET | /masters/hs-codes | Masters — HsCodes | 2 | 2 | 0 | **PASS** |
| 296 | POST | /masters/hs-codes | Masters — HsCodes | 2 | 2 | 0 | **PASS** |
| 297 | GET | /masters/hs-codes/{id} | Masters — HsCodes | 1 | 1 | 0 | **PASS** |
| 298 | PATCH | /masters/hs-codes/{id} | Masters — HsCodes | 2 | 2 | 0 | **PASS** |
| 299 | DELETE | /masters/hs-codes/{id} | Masters — HsCodes | 1 | 1 | 0 | **PASS** |
| 300 | GET | /masters/ports | Masters — Ports | 2 | 2 | 0 | **PASS** |
| 301 | POST | /masters/ports | Masters — Ports | 4 | 4 | 0 | **PASS** |
| 302 | GET | /masters/ports/{id} | Masters — Ports | 1 | 1 | 0 | **PASS** |
| 303 | PATCH | /masters/ports/{id} | Masters — Ports | 2 | 2 | 0 | **PASS** |
| 304 | DELETE | /masters/ports/{id} | Masters — Ports | 1 | 1 | 0 | **PASS** |
| 305 | GET | /masters/shipping-lines | Masters — ShippingLines | 2 | 2 | 0 | **PASS** |
| 306 | POST | /masters/shipping-lines | Masters — ShippingLines | 2 | 2 | 0 | **PASS** |
| 307 | GET | /masters/shipping-lines/{id} | Masters — ShippingLines | 1 | 1 | 0 | **PASS** |
| 308 | PATCH | /masters/shipping-lines/{id} | Masters — ShippingLines | 2 | 2 | 0 | **PASS** |
| 309 | DELETE | /masters/shipping-lines/{id} | Masters — ShippingLines | 1 | 1 | 0 | **PASS** |
| 310 | GET | /masters/tax-rates | Masters — TaxRates | 2 | 2 | 0 | **PASS** |
| 311 | POST | /masters/tax-rates | Masters — TaxRates | 3 | 3 | 0 | **PASS** |
| 312 | GET | /masters/tax-rates/{id} | Masters — TaxRates | 1 | 1 | 0 | **PASS** |
| 313 | PATCH | /masters/tax-rates/{id} | Masters — TaxRates | 2 | 2 | 0 | **PASS** |
| 314 | DELETE | /masters/tax-rates/{id} | Masters — TaxRates | 1 | 1 | 0 | **PASS** |
| 315 | GET | /masters/truckers | Masters — Truckers | 2 | 2 | 0 | **PASS** |
| 316 | POST | /masters/truckers | Masters — Truckers | 2 | 2 | 0 | **PASS** |
| 317 | GET | /masters/truckers/{id} | Masters — Truckers | 1 | 1 | 0 | **PASS** |
| 318 | PATCH | /masters/truckers/{id} | Masters — Truckers | 2 | 2 | 0 | **PASS** |
| 319 | DELETE | /masters/truckers/{id} | Masters — Truckers | 1 | 1 | 0 | **PASS** |
| 320 | GET | /masters/units-of-measure | Masters — UnitsOfMeasure | 2 | 2 | 0 | **PASS** |
| 321 | POST | /masters/units-of-measure | Masters — UnitsOfMeasure | 2 | 2 | 0 | **PASS** |
| 322 | GET | /masters/units-of-measure/{id} | Masters — UnitsOfMeasure | 1 | 1 | 0 | **PASS** |
| 323 | PATCH | /masters/units-of-measure/{id} | Masters — UnitsOfMeasure | 2 | 2 | 0 | **PASS** |
| 324 | DELETE | /masters/units-of-measure/{id} | Masters — UnitsOfMeasure | 1 | 1 | 0 | **PASS** |
| 325 | GET | /masters/vessels | Masters — Vessels | 2 | 2 | 0 | **PASS** |
| 326 | POST | /masters/vessels | Masters — Vessels | 2 | 2 | 0 | **PASS** |
| 327 | GET | /masters/vessels/{id} | Masters — Vessels | 1 | 1 | 0 | **PASS** |
| 328 | PATCH | /masters/vessels/{id} | Masters — Vessels | 2 | 2 | 0 | **PASS** |
| 329 | DELETE | /masters/vessels/{id} | Masters — Vessels | 1 | 1 | 0 | **PASS** |
| 330 | GET | /masters/warehouses | Masters — Warehouses | 2 | 2 | 0 | **PASS** |
| 331 | POST | /masters/warehouses | Masters — Warehouses | 2 | 2 | 0 | **PASS** |
| 332 | GET | /masters/warehouses/{id} | Masters — Warehouses | 1 | 1 | 0 | **PASS** |
| 333 | PATCH | /masters/warehouses/{id} | Masters — Warehouses | 2 | 2 | 0 | **PASS** |
| 334 | DELETE | /masters/warehouses/{id} | Masters — Warehouses | 1 | 1 | 0 | **PASS** |
| 335 | GET | /organization/bank-accounts | Organization — Bank Accounts | 1 | 1 | 0 | **PASS** |
| 336 | POST | /organization/bank-accounts | Organization — Bank Accounts | 2 | 2 | 0 | **PASS** |
| 337 | GET | /organization/bank-accounts/{id} | Organization — Bank Accounts | 1 | 1 | 0 | **PASS** |
| 338 | PATCH | /organization/bank-accounts/{id} | Organization — Bank Accounts | 2 | 2 | 0 | **PASS** |
| 339 | DELETE | /organization/bank-accounts/{id} | Organization — Bank Accounts | 1 | 1 | 0 | **PASS** |
| 340 | GET | /organization/number-formats | Organization — Number Formats | 2 | 2 | 0 | **PASS** |
| 341 | POST | /organization/number-formats | Organization — Number Formats | 8 | 8 | 0 | **PASS** |
| 342 | GET | /organization/number-formats/{documentType} | Organization — Number Formats | 1 | 1 | 0 | **PASS** |
| 343 | PATCH | /organization/number-formats/{documentType} | Organization — Number Formats | 2 | 2 | 0 | **PASS** |
| 344 | GET | /organization/number-formats/{documentType}/preview | Organization — Number Formats | 1 | 1 | 0 | **PASS** |
| 345 | GET | /organization/profile | Organization Profile | 2 | 2 | 0 | **PASS** |
| 346 | PATCH | /organization/profile | Organization Profile | 2 | 2 | 0 | **PASS** |
| 347 | GET | /parties | Parties | 2 | 2 | 0 | **PASS** |
| 348 | POST | /parties | Parties | 5 | 5 | 0 | **PASS** |
| 349 | GET | /parties/{id} | Parties | 2 | 2 | 0 | **PASS** |
| 350 | PATCH | /parties/{id} | Parties | 2 | 2 | 0 | **PASS** |
| 351 | DELETE | /parties/{id} | Parties | 1 | 1 | 0 | **PASS** |
| 352 | POST | /parties/{id}/addresses | Parties | 2 | 2 | 0 | **PASS** |
| 353 | PATCH | /parties/{id}/addresses/{addressId} | Parties | 2 | 2 | 0 | **PASS** |
| 354 | DELETE | /parties/{id}/addresses/{addressId} | Parties | 1 | 1 | 0 | **PASS** |
| 355 | POST | /parties/{id}/contacts | Parties | 3 | 3 | 0 | **PASS** |
| 356 | PATCH | /parties/{id}/contacts/{contactId} | Parties | 2 | 2 | 0 | **PASS** |
| 357 | DELETE | /parties/{id}/contacts/{contactId} | Parties | 1 | 1 | 0 | **PASS** |
| 358 | PATCH | /parties/{id}/credit-status | Parties | 2 | 2 | 0 | **PASS** |
| 359 | GET | /parties/{id}/history | Parties | 1 | 1 | 0 | **PASS** |
| 360 | GET | /parties/export | Parties | 1 | 1 | 0 | **PASS** |
| 361 | POST | /parties/import | Parties | 1 | 1 | 0 | **PASS** |
| 362 | GET | /payment-requests | Payment Requests | 1 | 1 | 0 | **PASS** |
| 363 | POST | /payment-requests | Payment Requests | 3 | 3 | 0 | **PASS** |
| 364 | GET | /payment-requests/{id} | Payment Requests | 1 | 1 | 0 | **PASS** |
| 365 | PATCH | /payment-requests/{id} | Payment Requests | 2 | 2 | 0 | **PASS** |
| 366 | DELETE | /payment-requests/{id} | Payment Requests | 1 | 1 | 0 | **PASS** |
| 367 | POST | /payment-requests/{id}/approve | Payment Requests | 3 | 3 | 0 | **PASS** |
| 368 | POST | /payment-requests/{id}/mark-paid | Payment Requests | 3 | 3 | 0 | **PASS** |
| 369 | POST | /payment-requests/{id}/reject | Payment Requests | 2 | 2 | 0 | **PASS** |
| 370 | GET | /purchase-invoices | Purchase Invoices | 1 | 1 | 0 | **PASS** |
| 371 | POST | /purchase-invoices | Purchase Invoices | 3 | 2 | 1 | **FAIL** |
| 372 | GET | /purchase-invoices/{id} | Purchase Invoices | 1 | 1 | 0 | **PASS** |
| 373 | PATCH | /purchase-invoices/{id} | Purchase Invoices | 2 | 2 | 0 | **PASS** |
| 374 | DELETE | /purchase-invoices/{id} | Purchase Invoices | 1 | 1 | 0 | **PASS** |
| 375 | POST | /purchase-invoices/{id}/post | Purchase Invoices | 2 | 2 | 0 | **PASS** |
| 376 | GET | /quotations | Quotations | 2 | 2 | 0 | **PASS** |
| 377 | POST | /quotations | Quotations | 3 | 3 | 0 | **PASS** |
| 378 | GET | /quotations/{id} | Quotations | 1 | 1 | 0 | **PASS** |
| 379 | PATCH | /quotations/{id} | Quotations | 2 | 2 | 0 | **PASS** |
| 380 | DELETE | /quotations/{id} | Quotations | 1 | 1 | 0 | **PASS** |
| 381 | POST | /quotations/{id}/apply-tariff | Quotations | 2 | 2 | 0 | **PASS** |
| 382 | POST | /quotations/{id}/approve | Quotations | 3 | 3 | 0 | **PASS** |
| 383 | POST | /quotations/{id}/archive | Quotations | 2 | 2 | 0 | **PASS** |
| 384 | POST | /quotations/{id}/convert-to-job | Quotations | 3 | 3 | 0 | **PASS** |
| 385 | POST | /quotations/{id}/duplicate | Quotations | 2 | 2 | 0 | **PASS** |
| 386 | POST | /quotations/{id}/expire | Quotations | 2 | 2 | 0 | **PASS** |
| 387 | POST | /quotations/{id}/lines | Quotations | 4 | 4 | 0 | **PASS** |
| 388 | PATCH | /quotations/{id}/lines/{lineId} | Quotations | 2 | 2 | 0 | **PASS** |
| 389 | DELETE | /quotations/{id}/lines/{lineId} | Quotations | 1 | 1 | 0 | **PASS** |
| 390 | POST | /quotations/{id}/mark-lost | Quotations | 2 | 2 | 0 | **PASS** |
| 391 | POST | /quotations/{id}/mark-won | Quotations | 3 | 3 | 0 | **PASS** |
| 392 | POST | /quotations/{id}/pdf | Quotations | 3 | 2 | 1 | **FAIL** |
| 393 | GET | /quotations/{id}/pdf | Quotations | 2 | 2 | 0 | **PASS** |
| 394 | GET | /quotations/{id}/pdf/status | Quotations | 1 | 1 | 0 | **PASS** |
| 395 | POST | /quotations/{id}/reject | Quotations | 2 | 2 | 0 | **PASS** |
| 396 | GET | /quotations/{id}/revisions | Quotations | 1 | 1 | 0 | **PASS** |
| 397 | POST | /quotations/{id}/send | Quotations | 3 | 3 | 0 | **PASS** |
| 398 | POST | /quotations/{id}/send-email | Quotations | 2 | 2 | 0 | **PASS** |
| 399 | POST | /quotations/{id}/submit | Quotations | 3 | 3 | 0 | **PASS** |
| 400 | POST | /quotations/expire-due | Quotations | 2 | 2 | 0 | **PASS** |
| 401 | POST | /quotations/online-quote | Quotations | 1 | 1 | 0 | **PASS** |
| 402 | GET | /quotations/reports/analytics | Quotations | 2 | 2 | 0 | **PASS** |
| 403 | GET | /quotations/reports/analytics/conversion | Quotations | 1 | 1 | 0 | **PASS** |
| 404 | GET | /quotations/reports/analytics/lost-reasons | Quotations | 1 | 1 | 0 | **PASS** |
| 405 | GET | /quotations/reports/analytics/response-time | Quotations | 1 | 1 | 0 | **PASS** |
| 406 | GET | /quotations/reports/chargewise | Quotations | 1 | 1 | 0 | **PASS** |
| 407 | GET | /quotations/tariffs | Quotations — Online Tariff Master | 1 | 1 | 0 | **PASS** |
| 408 | POST | /quotations/tariffs | Quotations — Online Tariff Master | 2 | 2 | 0 | **PASS** |
| 409 | GET | /quotations/tariffs/{id} | Quotations — Online Tariff Master | 1 | 1 | 0 | **PASS** |
| 410 | PATCH | /quotations/tariffs/{id} | Quotations — Online Tariff Master | 2 | 2 | 0 | **PASS** |
| 411 | DELETE | /quotations/tariffs/{id} | Quotations — Online Tariff Master | 1 | 1 | 0 | **PASS** |
| 412 | GET | /quotations/zip-distances | Quotations — Zip Distance Master | 1 | 1 | 0 | **PASS** |
| 413 | POST | /quotations/zip-distances | Quotations — Zip Distance Master | 2 | 2 | 0 | **PASS** |
| 414 | GET | /quotations/zip-distances/{id} | Quotations — Zip Distance Master | 1 | 1 | 0 | **PASS** |
| 415 | PATCH | /quotations/zip-distances/{id} | Quotations — Zip Distance Master | 2 | 2 | 0 | **PASS** |
| 416 | DELETE | /quotations/zip-distances/{id} | Quotations — Zip Distance Master | 1 | 1 | 0 | **PASS** |
| 417 | GET | /search | Search | 1 | 1 | 0 | **PASS** |
| 418 | GET | /search?q=Al%20Noor&limit=10 | Search | 1 | 1 | 0 | **PASS** |
| 419 | POST | /tenants | Tenants (Super Admin) | 3 | 3 | 0 | **PASS** |
| 420 | GET | /tenants | Tenants (Super Admin) | 1 | 1 | 0 | **PASS** |
| 421 | GET | /tenants/{id} | Tenants (Super Admin) | 1 | 1 | 0 | **PASS** |
| 422 | PATCH | /tenants/{id} | Tenants (Super Admin) | 2 | 2 | 0 | **PASS** |
| 423 | DELETE | /tenants/{id} | Tenants (Super Admin) | 1 | 1 | 0 | **PASS** |
| 424 | PATCH | /tenants/{id}/activate | Tenants (Super Admin) | 2 | 2 | 0 | **PASS** |
| 425 | PATCH | /tenants/{id}/deactivate | Tenants (Super Admin) | 2 | 2 | 0 | **PASS** |
| 426 | PATCH | /tenants/{id}/restore | Tenants (Super Admin) | 2 | 2 | 0 | **PASS** |
| 427 | POST | /tenants/{id}/sync-permissions | Tenants (Super Admin) | 2 | 2 | 0 | **PASS** |
| 428 | GET | /tenants/statistics | Tenants (Super Admin) | 1 | 1 | 0 | **PASS** |
| 429 | POST | /tenants/sync-permissions | Tenants (Super Admin) | 2 | 2 | 0 | **PASS** |
| 430 | GET | /users | Users | 2 | 2 | 0 | **PASS** |
| 431 | POST | /users | Users | 2 | 2 | 0 | **PASS** |
| 432 | GET | /users/{id} | Users | 1 | 1 | 0 | **PASS** |
| 433 | PATCH | /users/{id} | Users | 2 | 2 | 0 | **PASS** |
| 434 | DELETE | /users/{id} | Users | 1 | 1 | 0 | **PASS** |
| 435 | POST | /users/{id}/admin-reset-password | Users | 2 | 2 | 0 | **PASS** |
| 436 | POST | /users/{id}/force-logout | Users | 2 | 2 | 0 | **PASS** |
| 437 | POST | /users/{id}/restore | Users | 2 | 2 | 0 | **PASS** |
| 438 | PATCH | /users/{id}/status | Users | 2 | 2 | 0 | **PASS** |
| 439 | POST | /users/bulk | Users | 2 | 2 | 0 | **PASS** |
| 440 | POST | /users/me/change-password | Users | 2 | 2 | 0 | **PASS** |
| 441 | GET | /vessels/{id}/schedules | Vessels — Schedules | 1 | 1 | 0 | **PASS** |
| 442 | POST | /vessels/{id}/schedules | Vessels — Schedules | 2 | 2 | 0 | **PASS** |
| 443 | PATCH | /vessels/{id}/schedules/{scheduleId} | Vessels — Schedules | 2 | 2 | 0 | **PASS** |
| 444 | DELETE | /vessels/{id}/schedules/{scheduleId} | Vessels — Schedules | 1 | 1 | 0 | **PASS** |
