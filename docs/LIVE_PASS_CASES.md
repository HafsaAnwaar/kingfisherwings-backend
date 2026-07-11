# LIVE PASS Cases — One Per API

**Base URL:** `https://kingfisherwings.onrender.com`
**Run ID:** 1783751652556
**When:** 2026-07-11T06:43:03.771Z
**OpenAPI APIs:** 287

Every OpenAPI operation appears exactly once. Live execution result is shown when available.

| # | Method | Path | Live result | HTTP |
|---|--------|------|-------------|------|
| 1 | GET | `/health` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 2 | POST | `/tenants` | EXECUTED_PASS | 201 |
| 3 | GET | `/tenants` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 4 | GET | `/tenants/statistics` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 5 | POST | `/tenants/sync-permissions` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 6 | POST | `/tenants/{id}/sync-permissions` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 7 | GET | `/tenants/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 8 | PATCH | `/tenants/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 9 | DELETE | `/tenants/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 10 | PATCH | `/tenants/{id}/restore` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 11 | PATCH | `/tenants/{id}/activate` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 12 | PATCH | `/tenants/{id}/deactivate` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 13 | GET | `/companies` | EXECUTED_PASS | 200 |
| 14 | POST | `/companies` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 15 | GET | `/companies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 16 | PATCH | `/companies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 17 | DELETE | `/companies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 18 | GET | `/users` | EXECUTED_PASS | 200 |
| 19 | POST | `/users` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 20 | GET | `/users/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 21 | PATCH | `/users/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 22 | DELETE | `/users/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 23 | PATCH | `/users/{id}/status` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 24 | POST | `/users/bulk` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 25 | POST | `/users/{id}/restore` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 26 | POST | `/users/me/change-password` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 27 | POST | `/users/{id}/admin-reset-password` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 28 | POST | `/users/{id}/force-logout` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 29 | POST | `/auth/login` | EXECUTED_PASS |  |
| 30 | POST | `/auth/tenant-login` | EXECUTED_PASS | 200 |
| 31 | POST | `/auth/super-admin/signup` | EXECUTED_PASS | 201 |
| 32 | POST | `/auth/super-admin/login` | EXECUTED_PASS |  |
| 33 | POST | `/auth/refresh` | EXECUTED_PASS | 200 |
| 34 | POST | `/auth/logout` | EXECUTED_FAIL | 401 |
| 35 | GET | `/auth/sessions` | EXECUTED_PASS | 200 |
| 36 | POST | `/auth/sessions/{sessionId}/revoke` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 37 | POST | `/auth/logout-all` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 38 | GET | `/auth/me` | EXECUTED_PASS | 200 |
| 39 | POST | `/auth/change-password` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 40 | POST | `/auth/tenant/change-password` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 41 | GET | `/masters/countries` | EXECUTED_PASS | 200 |
| 42 | POST | `/masters/countries` | EXECUTED_PASS | 201 |
| 43 | GET | `/masters/countries/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 44 | PATCH | `/masters/countries/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 45 | DELETE | `/masters/countries/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 46 | GET | `/masters/currencies` | EXECUTED_PASS | 200 |
| 47 | POST | `/masters/currencies` | EXECUTED_PASS | 201 |
| 48 | GET | `/masters/currencies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 49 | PATCH | `/masters/currencies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 50 | DELETE | `/masters/currencies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 51 | GET | `/masters/exchange-rates` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 52 | POST | `/masters/exchange-rates` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 53 | GET | `/masters/exchange-rates/latest/{currencyId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 54 | GET | `/masters/ports` | EXECUTED_PASS | 200 |
| 55 | POST | `/masters/ports` | EXECUTED_PASS | 201 |
| 56 | GET | `/masters/ports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 57 | PATCH | `/masters/ports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 58 | DELETE | `/masters/ports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 59 | GET | `/masters/airports` | EXECUTED_PASS | 200 |
| 60 | POST | `/masters/airports` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 61 | GET | `/masters/airports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 62 | PATCH | `/masters/airports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 63 | DELETE | `/masters/airports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 64 | GET | `/masters/container-types` | EXECUTED_PASS | 200 |
| 65 | POST | `/masters/container-types` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 66 | GET | `/masters/container-types/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 67 | PATCH | `/masters/container-types/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 68 | DELETE | `/masters/container-types/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 69 | GET | `/masters/hs-codes` | EXECUTED_PASS | 200 |
| 70 | POST | `/masters/hs-codes` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 71 | GET | `/masters/hs-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 72 | PATCH | `/masters/hs-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 73 | DELETE | `/masters/hs-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 74 | GET | `/masters/airlines` | EXECUTED_PASS | 200 |
| 75 | POST | `/masters/airlines` | EXECUTED_PASS | 201 |
| 76 | GET | `/masters/airlines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 77 | PATCH | `/masters/airlines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 78 | DELETE | `/masters/airlines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 79 | GET | `/masters/shipping-lines` | EXECUTED_PASS | 200 |
| 80 | POST | `/masters/shipping-lines` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 81 | GET | `/masters/shipping-lines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 82 | PATCH | `/masters/shipping-lines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 83 | DELETE | `/masters/shipping-lines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 84 | GET | `/masters/vessels` | EXECUTED_PASS | 200 |
| 85 | POST | `/masters/vessels` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 86 | GET | `/masters/vessels/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 87 | PATCH | `/masters/vessels/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 88 | DELETE | `/masters/vessels/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 89 | GET | `/masters/truckers` | EXECUTED_PASS | 200 |
| 90 | POST | `/masters/truckers` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 91 | GET | `/masters/truckers/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 92 | PATCH | `/masters/truckers/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 93 | DELETE | `/masters/truckers/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 94 | GET | `/masters/warehouses` | EXECUTED_PASS | 200 |
| 95 | POST | `/masters/warehouses` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 96 | GET | `/masters/warehouses/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 97 | PATCH | `/masters/warehouses/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 98 | DELETE | `/masters/warehouses/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 99 | GET | `/masters/charge-codes` | EXECUTED_PASS | 200 |
| 100 | POST | `/masters/charge-codes` | EXECUTED_PASS | 201 |
| 101 | GET | `/masters/charge-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 102 | PATCH | `/masters/charge-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 103 | DELETE | `/masters/charge-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 104 | GET | `/masters/banks` | EXECUTED_PASS | 200 |
| 105 | POST | `/masters/banks` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 106 | GET | `/masters/banks/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 107 | PATCH | `/masters/banks/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 108 | DELETE | `/masters/banks/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 109 | GET | `/masters/holidays` | EXECUTED_PASS | 200 |
| 110 | POST | `/masters/holidays` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 111 | GET | `/masters/holidays/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 112 | PATCH | `/masters/holidays/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 113 | DELETE | `/masters/holidays/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 114 | GET | `/masters/units-of-measure` | EXECUTED_PASS | 200 |
| 115 | POST | `/masters/units-of-measure` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 116 | GET | `/masters/units-of-measure/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 117 | PATCH | `/masters/units-of-measure/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 118 | DELETE | `/masters/units-of-measure/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 119 | GET | `/masters/tax-rates` | EXECUTED_PASS | 200 |
| 120 | POST | `/masters/tax-rates` | EXECUTED_FAIL | 500 |
| 121 | GET | `/masters/tax-rates/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 122 | PATCH | `/masters/tax-rates/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 123 | DELETE | `/masters/tax-rates/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 124 | GET | `/masters/branches` | EXECUTED_PASS | 200 |
| 125 | POST | `/masters/branches` | EXECUTED_PASS | 201 |
| 126 | GET | `/masters/branches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 127 | PATCH | `/masters/branches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 128 | DELETE | `/masters/branches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 129 | GET | `/masters/departments` | EXECUTED_PASS | 200 |
| 130 | POST | `/masters/departments` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 131 | GET | `/masters/departments/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 132 | PATCH | `/masters/departments/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 133 | DELETE | `/masters/departments/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 134 | GET | `/masters/designations` | EXECUTED_PASS | 200 |
| 135 | POST | `/masters/designations` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 136 | GET | `/masters/designations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 137 | PATCH | `/masters/designations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 138 | DELETE | `/masters/designations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 139 | GET | `/parties` | EXECUTED_PASS | 200 |
| 140 | POST | `/parties` | EXECUTED_PASS | 201 |
| 141 | GET | `/parties/{id}` | EXECUTED_PASS | 200 |
| 142 | PATCH | `/parties/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 143 | DELETE | `/parties/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 144 | POST | `/parties/import` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 145 | PATCH | `/parties/{id}/credit-status` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 146 | POST | `/parties/{id}/contacts` | EXECUTED_PASS | 201 |
| 147 | PATCH | `/parties/{id}/contacts/{contactId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 148 | DELETE | `/parties/{id}/contacts/{contactId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 149 | POST | `/parties/{id}/addresses` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 150 | PATCH | `/parties/{id}/addresses/{addressId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 151 | DELETE | `/parties/{id}/addresses/{addressId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 152 | GET | `/organization/profile` | EXECUTED_PASS | 200 |
| 153 | PATCH | `/organization/profile` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 154 | GET | `/organization/bank-accounts` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 155 | POST | `/organization/bank-accounts` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 156 | GET | `/organization/bank-accounts/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 157 | PATCH | `/organization/bank-accounts/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 158 | DELETE | `/organization/bank-accounts/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 159 | GET | `/organization/number-formats` | EXECUTED_PASS | 200 |
| 160 | POST | `/organization/number-formats` | EXECUTED_PASS | 201 |
| 161 | GET | `/organization/number-formats/{documentType}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 162 | PATCH | `/organization/number-formats/{documentType}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 163 | GET | `/organization/number-formats/{documentType}/preview` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 164 | GET | `/quotations` | EXECUTED_PASS | 200 |
| 165 | POST | `/quotations` | EXECUTED_PASS | 201 |
| 166 | GET | `/quotations/reports/chargewise` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 167 | GET | `/quotations/reports/analytics` | EXECUTED_PASS | 200 |
| 168 | GET | `/quotations/reports/analytics/conversion` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 169 | GET | `/quotations/reports/analytics/lost-reasons` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 170 | GET | `/quotations/reports/analytics/response-time` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 171 | POST | `/quotations/online-quote` | EXECUTED_PASS |  |
| 172 | POST | `/quotations/expire-due` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 173 | GET | `/quotations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 174 | PATCH | `/quotations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 175 | DELETE | `/quotations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 176 | GET | `/quotations/{id}/revisions` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 177 | POST | `/quotations/{id}/lines` | EXECUTED_PASS | 201 |
| 178 | POST | `/quotations/{id}/apply-tariff` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 179 | PATCH | `/quotations/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 180 | DELETE | `/quotations/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 181 | POST | `/quotations/{id}/submit` | EXECUTED_PASS | 201 |
| 182 | POST | `/quotations/{id}/approve` | EXECUTED_PASS | 201 |
| 183 | POST | `/quotations/{id}/reject` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 184 | POST | `/quotations/{id}/send` | EXECUTED_PASS | 201 |
| 185 | POST | `/quotations/{id}/mark-won` | EXECUTED_PASS | 201 |
| 186 | POST | `/quotations/{id}/mark-lost` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 187 | POST | `/quotations/{id}/duplicate` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 188 | POST | `/quotations/{id}/convert-to-job` | EXECUTED_PASS | 201 |
| 189 | POST | `/quotations/{id}/archive` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 190 | POST | `/quotations/{id}/expire` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 191 | POST | `/quotations/{id}/pdf` | EXECUTED_FAIL |  |
| 192 | GET | `/quotations/{id}/pdf` | EXECUTED_PASS | 200 |
| 193 | GET | `/quotations/{id}/pdf/status` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 194 | POST | `/quotations/{id}/send-email` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 195 | GET | `/quotations/tariffs` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 196 | POST | `/quotations/tariffs` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 197 | GET | `/quotations/tariffs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 198 | PATCH | `/quotations/tariffs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 199 | DELETE | `/quotations/tariffs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 200 | GET | `/quotations/zip-distances` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 201 | POST | `/quotations/zip-distances` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 202 | GET | `/quotations/zip-distances/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 203 | PATCH | `/quotations/zip-distances/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 204 | DELETE | `/quotations/zip-distances/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 205 | GET | `/jobs` | EXECUTED_PASS | 200 |
| 206 | POST | `/jobs` | EXECUTED_PASS | 201 |
| 207 | GET | `/jobs/{id}` | EXECUTED_PASS | 200 |
| 208 | PATCH | `/jobs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 209 | DELETE | `/jobs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 210 | GET | `/jobs/{id}/house-jobs` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 211 | GET | `/jobs/{id}/milestones` | EXECUTED_PASS | 200 |
| 212 | POST | `/jobs/{id}/milestones` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 213 | GET | `/jobs/{id}/pnl` | EXECUTED_PASS | 200 |
| 214 | GET | `/jobs/{id}/notes` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 215 | POST | `/jobs/{id}/notes` | EXECUTED_PASS | 201 |
| 216 | GET | `/jobs/{id}/documents` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 217 | POST | `/jobs/{id}/documents` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 218 | GET | `/jobs/{id}/containers` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 219 | POST | `/jobs/{id}/containers` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 220 | POST | `/jobs/{id}/close` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 221 | POST | `/jobs/{id}/cancel` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 222 | PATCH | `/jobs/{id}/air-details` | EXECUTED_PASS | 200 |
| 223 | PATCH | `/jobs/{id}/sea-fcl-details` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 224 | PATCH | `/jobs/{id}/milestones/{milestoneId}` | EXECUTED_PASS | 200 |
| 225 | POST | `/jobs/{id}/charges` | EXECUTED_PASS | 201 |
| 226 | PATCH | `/jobs/{id}/charges/{chargeId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 227 | DELETE | `/jobs/{id}/charges/{chargeId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 228 | POST | `/jobs/{id}/prorate-cost/{chargeCodeId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 229 | PATCH | `/jobs/{id}/notes/{noteId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 230 | DELETE | `/jobs/{id}/notes/{noteId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 231 | PATCH | `/jobs/{id}/documents/{documentId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 232 | DELETE | `/jobs/{id}/documents/{documentId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 233 | POST | `/jobs/{id}/documents/{documentId}/finalize` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 234 | GET | `/jobs/{id}/documents/generation-status` | EXECUTED_PASS | 200 |
| 235 | POST | `/jobs/{id}/documents/hawb` | EXECUTED_FAIL | 500 |
| 236 | POST | `/jobs/{id}/documents/mawb` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 237 | POST | `/jobs/{id}/documents/pre-alert` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 238 | POST | `/jobs/{id}/documents/cargo-manifest` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 239 | POST | `/jobs/{id}/pre-alert/send` | EXECUTED_PASS | 201 |
| 240 | PATCH | `/jobs/{id}/containers/{containerId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 241 | DELETE | `/jobs/{id}/containers/{containerId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 242 | GET | `/awb-stock/batches` | EXECUTED_PASS | 200 |
| 243 | POST | `/awb-stock/batches` | EXECUTED_PASS | 201 |
| 244 | GET | `/awb-stock/reports/low-stock` | EXECUTED_PASS | 200 |
| 245 | GET | `/awb-stock/allocations` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 246 | GET | `/awb-stock/batches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 247 | PATCH | `/awb-stock/batches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 248 | DELETE | `/awb-stock/batches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 249 | POST | `/awb-stock/batches/{id}/allocate` | EXECUTED_PASS | 201 |
| 250 | POST | `/awb-stock/batches/{id}/transfer-branch` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 251 | POST | `/awb-stock/allocations/{id}/void` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 252 | POST | `/awb-stock/allocations/{id}/mark-used` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 253 | GET | `/search` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 254 | GET | `/files/{tenantId}/{filename}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 255 | GET | `/invoices` | EXECUTED_PASS | 200 |
| 256 | POST | `/invoices` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 257 | GET | `/invoices/reports/overdue` | EXECUTED_PASS | 200 |
| 258 | GET | `/invoices/{id}` | EXECUTED_PASS | 200 |
| 259 | PATCH | `/invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 260 | DELETE | `/invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 261 | POST | `/invoices/from-job/{jobId}` | EXECUTED_PASS | 201 |
| 262 | POST | `/invoices/{id}/lines` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 263 | PATCH | `/invoices/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 264 | DELETE | `/invoices/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 265 | POST | `/invoices/{id}/post` | EXECUTED_PASS | 201 |
| 266 | POST | `/invoices/{id}/send` | EXECUTED_FAIL | 500 |
| 267 | POST | `/invoices/{id}/pdf` | EXECUTED_FAIL | 500 |
| 268 | GET | `/invoices/{id}/pdf` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 269 | POST | `/invoices/{id}/cancel` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 270 | GET | `/credit-notes` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 271 | POST | `/credit-notes` | EXECUTED_FAIL | 500 |
| 272 | GET | `/credit-notes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 273 | POST | `/credit-notes/{id}/post` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 274 | GET | `/purchase-invoices` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 275 | POST | `/purchase-invoices` | EXECUTED_FAIL | 500 |
| 276 | GET | `/purchase-invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 277 | PATCH | `/purchase-invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 278 | DELETE | `/purchase-invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 279 | POST | `/purchase-invoices/{id}/post` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 280 | GET | `/payment-requests` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 281 | POST | `/payment-requests` | EXECUTED_PASS | 201 |
| 282 | GET | `/payment-requests/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 283 | PATCH | `/payment-requests/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 284 | DELETE | `/payment-requests/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 285 | POST | `/payment-requests/{id}/approve` | EXECUTED_PASS | 201 |
| 286 | POST | `/payment-requests/{id}/reject` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 287 | POST | `/payment-requests/{id}/mark-paid` | EXECUTED_PASS | 201 |

## Per-API PASS details

### PASS-001: `GET /health`

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Untagged |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-002: `POST /tenants`
**Purpose:** Create a new tenant (also provisions its TENANT_ADMIN owner user)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create tenant |
| Live notes | OK |

---

### PASS-003: `GET /tenants`
**Purpose:** Get all tenants

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-004: `GET /tenants/statistics`
**Purpose:** Tenant statistics

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-005: `POST /tenants/sync-permissions`
**Purpose:** Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-006: `POST /tenants/{id}/sync-permissions`
**Purpose:** Reconcile one tenant against the current permission/role catalog

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-007: `GET /tenants/{id}`
**Purpose:** Get tenant by ID

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-008: `PATCH /tenants/{id}`
**Purpose:** Update tenant

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-009: `DELETE /tenants/{id}`
**Purpose:** Soft delete tenant

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-010: `PATCH /tenants/{id}/restore`
**Purpose:** Restore tenant

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-011: `PATCH /tenants/{id}/activate`
**Purpose:** Activate tenant

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-012: `PATCH /tenants/{id}/deactivate`
**Purpose:** Deactivate tenant

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Tenants (Super Admin) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-013: `GET /companies`
**Purpose:** List this tenant's companies (usually just the one default, more for multi-entity groups)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Companies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List companies |
| Live notes | OK |

---

### PASS-014: `POST /companies`
**Purpose:** Register an additional company under this tenant (multi-entity groups)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Companies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-015: `GET /companies/{id}`
**Purpose:** Get a company by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Companies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-016: `PATCH /companies/{id}`
**Purpose:** Update a company

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Companies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-017: `DELETE /companies/{id}`
**Purpose:** Soft-delete a company (blocked if it is the only one, or currently default)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Companies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-018: `GET /users`
**Purpose:** List users for the current tenant (paginated, filterable).

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List users |
| Live notes | OK |

---

### PASS-019: `POST /users`
**Purpose:** Create a user. Returns a system-generated temporary password.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-020: `GET /users/{id}`
**Purpose:** Get a single user by id.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-021: `PATCH /users/{id}`
**Purpose:** Update a user.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-022: `DELETE /users/{id}`
**Purpose:** Soft-delete a user.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-023: `PATCH /users/{id}/status`
**Purpose:** Change a user's status (activate, suspend, etc).

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-024: `POST /users/bulk`
**Purpose:** Apply an action (activate/deactivate/suspend/delete/restore) to multiple users.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-025: `POST /users/{id}/restore`
**Purpose:** Restore a soft-deleted user.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-026: `POST /users/me/change-password`
**Purpose:** Authenticated user changes their own password.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-027: `POST /users/{id}/admin-reset-password`
**Purpose:** Admin resets a target user's password to a new temporary password.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-028: `POST /users/{id}/force-logout`
**Purpose:** Force-logout: revoke a target user's active sessions on all devices.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Users |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-029: `POST /auth/login`
**Purpose:** Staff login: tenant slug + email + password

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Public |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | n/a |
| Live title | Public route — auth not required (catalogued) |
| Live notes | Skipped unauth fail — route is @Public |

---

### PASS-030: `POST /auth/tenant-login`
**Purpose:** Tenant admin login: tenant slug + the tenant's own password

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Public |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Tenant login |
| Live notes | OK |

---

### PASS-031: `POST /auth/super-admin/signup`
**Purpose:** Platform super admin self-registration

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Public |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Super admin signup |
| Live notes | OK |

---

### PASS-032: `POST /auth/super-admin/login`
**Purpose:** Platform super admin login

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Public |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | n/a |
| Live title | Public route — auth not required (catalogued) |
| Live notes | Skipped unauth fail — route is @Public |

---

### PASS-033: `POST /auth/refresh`
**Purpose:** Exchange a refresh token for a new token pair

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Public |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Refresh token |
| Live notes | OK |

---

### PASS-034: `POST /auth/logout`
**Purpose:** Revoke the current session

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_FAIL** |
| Live HTTP | 401 |
| Live title | Logout |
| Live notes | {"message":"Session is no longer valid.","error":"Unauthorized","statusCode":401} |

---

### PASS-035: `GET /auth/sessions`
**Purpose:** List the authenticated user's own active sessions

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List sessions |
| Live notes | OK |

---

### PASS-036: `POST /auth/sessions/{sessionId}/revoke`
**Purpose:** Revoke one of the authenticated user's own sessions

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-037: `POST /auth/logout-all`
**Purpose:** Log out of every device (revokes all active sessions)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-038: `GET /auth/me`
**Purpose:** Get the authenticated principal (user, tenant owner, or super admin)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | GET /auth/me |
| Live notes | OK |

---

### PASS-039: `POST /auth/change-password`
**Purpose:** Change the authenticated user password

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-040: `POST /auth/tenant/change-password`
**Purpose:** Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Auth |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-041: `GET /masters/countries`
**Purpose:** List countries

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Countries |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/countries |
| Live notes | OK |

---

### PASS-042: `POST /masters/countries`
**Purpose:** Create a country

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Countries |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create country AE |
| Live notes | OK |

---

### PASS-043: `GET /masters/countries/{id}`
**Purpose:** Get a country by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Countries |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-044: `PATCH /masters/countries/{id}`
**Purpose:** Update a country

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Countries |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-045: `DELETE /masters/countries/{id}`
**Purpose:** Soft-delete a country

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Countries |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-046: `GET /masters/currencies`
**Purpose:** List currencies

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Currencies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/currencies |
| Live notes | OK |

---

### PASS-047: `POST /masters/currencies`
**Purpose:** Create a currency

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Currencies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create currency AED |
| Live notes | OK |

---

### PASS-048: `GET /masters/currencies/{id}`
**Purpose:** Get a currency by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Currencies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-049: `PATCH /masters/currencies/{id}`
**Purpose:** Update a currency

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Currencies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-050: `DELETE /masters/currencies/{id}`
**Purpose:** Soft-delete a currency

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Currencies |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-051: `GET /masters/exchange-rates`
**Purpose:** List exchange rates, optionally filtered by currency

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Exchange Rates |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-052: `POST /masters/exchange-rates`
**Purpose:** Record (or correct) an exchange rate for a date — upserts by currency + date

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Exchange Rates |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-053: `GET /masters/exchange-rates/latest/{currencyId}`
**Purpose:** Most recent rate on file for a currency

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Exchange Rates |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-054: `GET /masters/ports`
**Purpose:** List ports

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Ports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/ports |
| Live notes | OK |

---

### PASS-055: `POST /masters/ports`
**Purpose:** Create a port

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Ports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create port DXB |
| Live notes | OK |

---

### PASS-056: `GET /masters/ports/{id}`
**Purpose:** Get a port record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Ports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-057: `PATCH /masters/ports/{id}`
**Purpose:** Update a port

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Ports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-058: `DELETE /masters/ports/{id}`
**Purpose:** Soft-delete a port

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Ports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-059: `GET /masters/airports`
**Purpose:** List airports

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/airports |
| Live notes | OK |

---

### PASS-060: `POST /masters/airports`
**Purpose:** Create an airport

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-061: `GET /masters/airports/{id}`
**Purpose:** Get an airport by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-062: `PATCH /masters/airports/{id}`
**Purpose:** Update an airport

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-063: `DELETE /masters/airports/{id}`
**Purpose:** Soft-delete an airport

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-064: `GET /masters/container-types`
**Purpose:** List container types

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ContainerTypes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/container-types |
| Live notes | OK |

---

### PASS-065: `POST /masters/container-types`
**Purpose:** Create a container type

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ContainerTypes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-066: `GET /masters/container-types/{id}`
**Purpose:** Get a container type by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ContainerTypes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-067: `PATCH /masters/container-types/{id}`
**Purpose:** Update a container type

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ContainerTypes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-068: `DELETE /masters/container-types/{id}`
**Purpose:** Soft-delete a container type

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ContainerTypes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-069: `GET /masters/hs-codes`
**Purpose:** List HS codes

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — HsCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/hs-codes |
| Live notes | OK |

---

### PASS-070: `POST /masters/hs-codes`
**Purpose:** Create an HS code

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — HsCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-071: `GET /masters/hs-codes/{id}`
**Purpose:** Get an HS code by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — HsCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-072: `PATCH /masters/hs-codes/{id}`
**Purpose:** Update an HS code

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — HsCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-073: `DELETE /masters/hs-codes/{id}`
**Purpose:** Soft-delete an HS code

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — HsCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-074: `GET /masters/airlines`
**Purpose:** list airlines

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airlines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/airlines |
| Live notes | OK |

---

### PASS-075: `POST /masters/airlines`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airlines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create airline EK |
| Live notes | OK |

---

### PASS-076: `GET /masters/airlines/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airlines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-077: `PATCH /masters/airlines/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airlines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-078: `DELETE /masters/airlines/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Airlines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-079: `GET /masters/shipping-lines`
**Purpose:** list shippinglines

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ShippingLines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/shipping-lines |
| Live notes | OK |

---

### PASS-080: `POST /masters/shipping-lines`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ShippingLines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-081: `GET /masters/shipping-lines/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ShippingLines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-082: `PATCH /masters/shipping-lines/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ShippingLines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-083: `DELETE /masters/shipping-lines/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ShippingLines |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-084: `GET /masters/vessels`
**Purpose:** list vessels

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Vessels |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/vessels |
| Live notes | OK |

---

### PASS-085: `POST /masters/vessels`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Vessels |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-086: `GET /masters/vessels/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Vessels |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-087: `PATCH /masters/vessels/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Vessels |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-088: `DELETE /masters/vessels/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Vessels |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-089: `GET /masters/truckers`
**Purpose:** list truckers

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Truckers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/truckers |
| Live notes | OK |

---

### PASS-090: `POST /masters/truckers`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Truckers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-091: `GET /masters/truckers/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Truckers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-092: `PATCH /masters/truckers/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Truckers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-093: `DELETE /masters/truckers/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Truckers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-094: `GET /masters/warehouses`
**Purpose:** list warehouses

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Warehouses |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/warehouses |
| Live notes | OK |

---

### PASS-095: `POST /masters/warehouses`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Warehouses |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-096: `GET /masters/warehouses/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Warehouses |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-097: `PATCH /masters/warehouses/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Warehouses |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-098: `DELETE /masters/warehouses/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Warehouses |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-099: `GET /masters/charge-codes`
**Purpose:** list chargecodes

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ChargeCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/charge-codes |
| Live notes | OK |

---

### PASS-100: `POST /masters/charge-codes`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ChargeCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create charge code AFR |
| Live notes | OK |

---

### PASS-101: `GET /masters/charge-codes/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ChargeCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-102: `PATCH /masters/charge-codes/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ChargeCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-103: `DELETE /masters/charge-codes/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — ChargeCodes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-104: `GET /masters/banks`
**Purpose:** list banks

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Banks |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/banks |
| Live notes | OK |

---

### PASS-105: `POST /masters/banks`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Banks |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-106: `GET /masters/banks/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Banks |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-107: `PATCH /masters/banks/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Banks |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-108: `DELETE /masters/banks/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Banks |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-109: `GET /masters/holidays`
**Purpose:** list holidays

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Holidays |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/holidays |
| Live notes | OK |

---

### PASS-110: `POST /masters/holidays`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Holidays |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-111: `GET /masters/holidays/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Holidays |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-112: `PATCH /masters/holidays/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Holidays |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-113: `DELETE /masters/holidays/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Holidays |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-114: `GET /masters/units-of-measure`
**Purpose:** list unitsofmeasure

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — UnitsOfMeasure |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/units-of-measure |
| Live notes | OK |

---

### PASS-115: `POST /masters/units-of-measure`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — UnitsOfMeasure |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-116: `GET /masters/units-of-measure/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — UnitsOfMeasure |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-117: `PATCH /masters/units-of-measure/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — UnitsOfMeasure |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-118: `DELETE /masters/units-of-measure/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — UnitsOfMeasure |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-119: `GET /masters/tax-rates`
**Purpose:** list taxrates

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — TaxRates |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/tax-rates |
| Live notes | OK |

---

### PASS-120: `POST /masters/tax-rates`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — TaxRates |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_FAIL** |
| Live HTTP | 500 |
| Live title | Create tax rate VAT5 |
| Live notes | {"statusCode":500,"message":"Internal server error"} |

---

### PASS-121: `GET /masters/tax-rates/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — TaxRates |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-122: `PATCH /masters/tax-rates/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — TaxRates |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-123: `DELETE /masters/tax-rates/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — TaxRates |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-124: `GET /masters/branches`
**Purpose:** list branches

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Branches |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/branches |
| Live notes | OK |

---

### PASS-125: `POST /masters/branches`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Branches |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create branch |
| Live notes | OK |

---

### PASS-126: `GET /masters/branches/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Branches |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-127: `PATCH /masters/branches/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Branches |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-128: `DELETE /masters/branches/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Branches |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-129: `GET /masters/departments`
**Purpose:** list departments

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Departments |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/departments |
| Live notes | OK |

---

### PASS-130: `POST /masters/departments`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Departments |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-131: `GET /masters/departments/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Departments |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-132: `PATCH /masters/departments/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Departments |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-133: `DELETE /masters/departments/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Departments |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-134: `GET /masters/designations`
**Purpose:** list designations

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Designations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List masters/designations |
| Live notes | OK |

---

### PASS-135: `POST /masters/designations`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Designations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-136: `GET /masters/designations/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Designations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-137: `PATCH /masters/designations/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Designations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-138: `DELETE /masters/designations/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — Designations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-139: `GET /parties`
**Purpose:** List parties (customers, agents, suppliers, carriers, etc.)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List parties |
| Live notes | OK |

---

### PASS-140: `POST /parties`
**Purpose:** Create a party

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create customer party |
| Live notes | OK |

---

### PASS-141: `GET /parties/{id}`
**Purpose:** Get a party with its contacts and addresses

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Get party |
| Live notes | OK |

---

### PASS-142: `PATCH /parties/{id}`
**Purpose:** Update a party

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-143: `DELETE /parties/{id}`
**Purpose:** Soft-delete a party

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-144: `POST /parties/import`
**Purpose:** Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-145: `PATCH /parties/{id}/credit-status`
**Purpose:** Change credit status (Active / On Hold / Blacklisted)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-146: `POST /parties/{id}/contacts`
**Purpose:** Add a contact to a party

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Add party contact |
| Live notes | OK |

---

### PASS-147: `PATCH /parties/{id}/contacts/{contactId}`
**Purpose:** Update a party's contact

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-148: `DELETE /parties/{id}/contacts/{contactId}`
**Purpose:** Remove a party's contact

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-149: `POST /parties/{id}/addresses`
**Purpose:** Add an address to a party

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-150: `PATCH /parties/{id}/addresses/{addressId}`
**Purpose:** Update a party's address

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-151: `DELETE /parties/{id}/addresses/{addressId}`
**Purpose:** Remove a party's address

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Parties |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-152: `GET /organization/profile`
**Purpose:** Get this tenant's own organization profile

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization Profile |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Org profile |
| Live notes | OK |

---

### PASS-153: `PATCH /organization/profile`
**Purpose:** Update this tenant's own organization profile (Ch.27.1)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization Profile |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-154: `GET /organization/bank-accounts`
**Purpose:** List this tenant's own bank accounts

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Bank Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-155: `POST /organization/bank-accounts`
**Purpose:** Add a bank account

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Bank Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-156: `GET /organization/bank-accounts/{id}`
**Purpose:** Get a bank account by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Bank Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-157: `PATCH /organization/bank-accounts/{id}`
**Purpose:** Update a bank account

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Bank Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-158: `DELETE /organization/bank-accounts/{id}`
**Purpose:** Soft-delete a bank account

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Bank Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-159: `GET /organization/number-formats`
**Purpose:** List all configured document number formats (Ch.2.2)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Number Formats |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List number formats |
| Live notes | OK |

---

### PASS-160: `POST /organization/number-formats`
**Purpose:** Configure the number format for a document type

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Number Formats |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Number format QUOTATION |
| Live notes | OK |

---

### PASS-161: `GET /organization/number-formats/{documentType}`
**Purpose:** Get the number format for one document type

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Number Formats |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-162: `PATCH /organization/number-formats/{documentType}`
**Purpose:** Update the number format for a document type

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Number Formats |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-163: `GET /organization/number-formats/{documentType}/preview`
**Purpose:** Preview the next number for this format without consuming a sequence value

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Organization — Number Formats |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-164: `GET /quotations`
**Purpose:** List quotations

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List quotations |
| Live notes | OK |

---

### PASS-165: `POST /quotations`
**Purpose:** Create a quotation (DRAFT)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create quotation |
| Live notes | OK |

---

### PASS-166: `GET /quotations/reports/chargewise`
**Purpose:** "All Quotations Chargewise" report — same filters as the list, with each charge line included

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-167: `GET /quotations/reports/analytics`
**Purpose:** Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Quotation analytics |
| Live notes | OK |

---

### PASS-168: `GET /quotations/reports/analytics/conversion`
**Purpose:** Win/loss and quote-to-job conversion rates

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-169: `GET /quotations/reports/analytics/lost-reasons`
**Purpose:** Lost quotation breakdown by reason code

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-170: `GET /quotations/reports/analytics/response-time`
**Purpose:** Average hours from creation to submit/send

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-171: `POST /quotations/online-quote`
**Purpose:** Public online quote widget — customer submits cargo details, system auto-calculates from tariff (Ch.7.5)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Public |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | n/a |
| Live title | Public route — auth not required (catalogued) |
| Live notes | Skipped unauth fail — route is @Public |

---

### PASS-172: `POST /quotations/expire-due`
**Purpose:** Batch-expire all quotations past valid_until (intended for daily cron)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-173: `GET /quotations/{id}`
**Purpose:** Get a quotation with its lines, status history, and approvals

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-174: `PATCH /quotations/{id}`
**Purpose:** Update a quotation header (DRAFT or REJECTED only)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-175: `DELETE /quotations/{id}`
**Purpose:** Soft-delete a quotation (DRAFT only)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-176: `GET /quotations/{id}/revisions`
**Purpose:** List all revisions in this quotation version chain

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-177: `POST /quotations/{id}/lines`
**Purpose:** Add a charge line — GP recalculates automatically

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Add quotation revenue line |
| Live notes | OK |

---

### PASS-178: `POST /quotations/{id}/apply-tariff`
**Purpose:** Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-179: `PATCH /quotations/{id}/lines/{lineId}`
**Purpose:** Update a charge line

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-180: `DELETE /quotations/{id}/lines/{lineId}`
**Purpose:** Remove a charge line

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-181: `POST /quotations/{id}/submit`
**Purpose:** DRAFT/REJECTED -> SUBMITTED, opens the approval cycle

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Submit quotation |
| Live notes | OK |

---

### PASS-182: `POST /quotations/{id}/approve`
**Purpose:** SUBMITTED -> APPROVED

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Approve quotation |
| Live notes | OK |

---

### PASS-183: `POST /quotations/{id}/reject`
**Purpose:** SUBMITTED -> REJECTED (editable again, can be resubmitted)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-184: `POST /quotations/{id}/send`
**Purpose:** APPROVED -> SENT

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Send quotation |
| Live notes | OK |

---

### PASS-185: `POST /quotations/{id}/mark-won`
**Purpose:** SENT -> WON

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Mark won |
| Live notes | OK |

---

### PASS-186: `POST /quotations/{id}/mark-lost`
**Purpose:** SENT -> LOST, with a reason code

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-187: `POST /quotations/{id}/duplicate`
**Purpose:** Clone into a new revision (new DRAFT, version+1, linked to the same parent)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-188: `POST /quotations/{id}/convert-to-job`
**Purpose:** WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Convert to job |
| Live notes | OK |

---

### PASS-189: `POST /quotations/{id}/archive`
**Purpose:** Archive a closed quotation (soft-delete)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-190: `POST /quotations/{id}/expire`
**Purpose:** Manually expire a quotation past its valid_until date

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-191: `POST /quotations/{id}/pdf`
**Purpose:** Queue PDF generation for a quotation (customer or internal mode)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_FAIL** |
| Live HTTP | n/a |
| Live title | Queue quotation PDF |
| Live notes | fetch failed |

---

### PASS-192: `GET /quotations/{id}/pdf`
**Purpose:** Get quotation PDF URLs and recent generation tasks

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Get quotation PDF info |
| Live notes | OK |

---

### PASS-193: `GET /quotations/{id}/pdf/status`
**Purpose:** List PDF generation task status for a quotation

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-194: `POST /quotations/{id}/send-email`
**Purpose:** Email quotation PDF to customer (generates PDF if not yet available)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-195: `GET /quotations/tariffs`
**Purpose:** List tariff rate cards

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Online Tariff Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-196: `POST /quotations/tariffs`
**Purpose:** Create a tariff rate card (sale rate + cost rate per lane/service/container type)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Online Tariff Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-197: `GET /quotations/tariffs/{id}`
**Purpose:** Get a tariff by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Online Tariff Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-198: `PATCH /quotations/tariffs/{id}`
**Purpose:** Update a tariff

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Online Tariff Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-199: `DELETE /quotations/tariffs/{id}`
**Purpose:** Soft-delete a tariff

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Online Tariff Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-200: `GET /quotations/zip-distances`
**Purpose:** List zip-to-zip distances

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Zip Distance Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-201: `POST /quotations/zip-distances`
**Purpose:** Record a distance between two zip/location codes

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Zip Distance Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-202: `GET /quotations/zip-distances/{id}`
**Purpose:** Get a zip distance record by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Zip Distance Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-203: `PATCH /quotations/zip-distances/{id}`
**Purpose:** Update a zip distance record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Zip Distance Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-204: `DELETE /quotations/zip-distances/{id}`
**Purpose:** Soft-delete a zip distance record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Quotations — Zip Distance Master |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-205: `GET /jobs`
**Purpose:** List jobs

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List jobs |
| Live notes | OK |

---

### PASS-206: `POST /jobs`
**Purpose:** Create a job (booking). AIR_EXPORT jobs auto-get their detail row + the full 15-milestone taxonomy. Set parent_job_id to create a HOUSE job under an existing master.

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create job directly |
| Live notes | OK |

---

### PASS-207: `GET /jobs/{id}`
**Purpose:** Get a job with air details, charges, milestones, and its house jobs (if a master)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Get job |
| Live notes | OK |

---

### PASS-208: `PATCH /jobs/{id}`
**Purpose:** Update a job (not allowed once COMPLETED or CANCELLED)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-209: `DELETE /jobs/{id}`
**Purpose:** Soft-delete a completed or cancelled job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-210: `GET /jobs/{id}/house-jobs`
**Purpose:** List the house jobs consolidated under this master job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-211: `GET /jobs/{id}/milestones`
**Purpose:** List all milestones for a job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List milestones |
| Live notes | OK |

---

### PASS-212: `POST /jobs/{id}/milestones`
**Purpose:** Add a custom milestone outside the standard taxonomy

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-213: `GET /jobs/{id}/pnl`
**Purpose:** Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Job P&L |
| Live notes | OK |

---

### PASS-214: `GET /jobs/{id}/notes`
**Purpose:** List notes on a job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-215: `POST /jobs/{id}/notes`
**Purpose:** Add a note to a job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Add job note |
| Live notes | OK |

---

### PASS-216: `GET /jobs/{id}/documents`
**Purpose:** List documents attached to a job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-217: `POST /jobs/{id}/documents`
**Purpose:** Register a document on a job (metadata + file URL)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-218: `GET /jobs/{id}/containers`
**Purpose:** List containers on a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-219: `POST /jobs/{id}/containers`
**Purpose:** Add a container to a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-220: `POST /jobs/{id}/close`
**Purpose:** Close a job (status -> COMPLETED)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-221: `POST /jobs/{id}/cancel`
**Purpose:** Cancel a job (status -> CANCELLED)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-222: `PATCH /jobs/{id}/air-details`
**Purpose:** Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Update air details |
| Live notes | OK |

---

### PASS-223: `PATCH /jobs/{id}/sea-fcl-details`
**Purpose:** Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-224: `PATCH /jobs/{id}/milestones/{milestoneId}`
**Purpose:** Update a milestone — set actual_date to mark it complete

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Complete milestone |
| Live notes | OK |

---

### PASS-225: `POST /jobs/{id}/charges`
**Purpose:** Add a charge line — Job P&L recalculates automatically

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Add job charge |
| Live notes | OK |

---

### PASS-226: `PATCH /jobs/{id}/charges/{chargeId}`
**Purpose:** Update a charge line

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-227: `DELETE /jobs/{id}/charges/{chargeId}`
**Purpose:** Remove a charge line

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-228: `POST /jobs/{id}/prorate-cost/{chargeCodeId}`
**Purpose:** Distribute a master job's cost line to its house jobs, proportionally by chargeable weight

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-229: `PATCH /jobs/{id}/notes/{noteId}`
**Purpose:** Update a job note

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-230: `DELETE /jobs/{id}/notes/{noteId}`
**Purpose:** Remove a job note

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-231: `PATCH /jobs/{id}/documents/{documentId}`
**Purpose:** Update a draft document metadata

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-232: `DELETE /jobs/{id}/documents/{documentId}`
**Purpose:** Remove a draft document

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-233: `POST /jobs/{id}/documents/{documentId}/finalize`
**Purpose:** Finalize a document (DRAFT -> ORIGINAL, locked)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-234: `GET /jobs/{id}/documents/generation-status`
**Purpose:** List async document generation tasks for a job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Doc generation status |
| Live notes | OK |

---

### PASS-235: `POST /jobs/{id}/documents/hawb`
**Purpose:** Queue HAWB PDF generation (Puppeteer + BullMQ)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_FAIL** |
| Live HTTP | 500 |
| Live title | Queue HAWB PDF |
| Live notes | {"statusCode":500,"message":"Internal server error"} |

---

### PASS-236: `POST /jobs/{id}/documents/mawb`
**Purpose:** Queue MAWB PDF generation (Puppeteer + BullMQ)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-237: `POST /jobs/{id}/documents/pre-alert`
**Purpose:** Queue pre-alert document PDF generation

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-238: `POST /jobs/{id}/documents/cargo-manifest`
**Purpose:** Queue cargo manifest PDF generation

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-239: `POST /jobs/{id}/pre-alert/send`
**Purpose:** Send pre-alert and mark PRE_ALERT_SENT milestone complete

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Send pre-alert |
| Live notes | OK |

---

### PASS-240: `PATCH /jobs/{id}/containers/{containerId}`
**Purpose:** Update a container on a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-241: `DELETE /jobs/{id}/containers/{containerId}`
**Purpose:** Remove a container from a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Jobs |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-242: `GET /awb-stock/batches`
**Purpose:** List AWB stock batches

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List batches |
| Live notes | OK |

---

### PASS-243: `POST /awb-stock/batches`
**Purpose:** Register a new AWB number range for an airline

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create AWB batch |
| Live notes | OK |

---

### PASS-244: `GET /awb-stock/reports/low-stock`
**Purpose:** Batches at or below their low-stock threshold

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Low stock report |
| Live notes | OK |

---

### PASS-245: `GET /awb-stock/allocations`
**Purpose:** List AWB allocations

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-246: `GET /awb-stock/batches/{id}`
**Purpose:** Get an AWB stock batch with recent allocations

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-247: `PATCH /awb-stock/batches/{id}`
**Purpose:** Update batch metadata (threshold, notes)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-248: `DELETE /awb-stock/batches/{id}`
**Purpose:** Soft-delete an empty AWB stock batch

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-249: `POST /awb-stock/batches/{id}/allocate`
**Purpose:** Allocate the next AWB number from a batch to a job

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Allocate AWB |
| Live notes | OK |

---

### PASS-250: `POST /awb-stock/batches/{id}/transfer-branch`
**Purpose:** Transfer batch ownership to another branch

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-251: `POST /awb-stock/allocations/{id}/void`
**Purpose:** Void an allocated (unused) AWB number

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-252: `POST /awb-stock/allocations/{id}/mark-used`
**Purpose:** Mark an allocated AWB as used (flown/printed)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | AWB Stock |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-253: `GET /search`
**Purpose:** Global search across jobs, quotations, and parties

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Search |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-254: `GET /files/{tenantId}/{filename}`
**Purpose:** Download a locally stored file (PDFs generated by the system)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Files |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-255: `GET /invoices`
**Purpose:** List customer invoices (Ch.18)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | List invoices |
| Live notes | OK |

---

### PASS-256: `POST /invoices`
**Purpose:** Create a draft customer invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-257: `GET /invoices/reports/overdue`
**Purpose:** Overdue customer invoices past due_date with outstanding balance

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Overdue report |
| Live notes | OK |

---

### PASS-258: `GET /invoices/{id}`
**Purpose:** Get invoice with lines

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 200 |
| Live title | Get invoice |
| Live notes | OK |

---

### PASS-259: `PATCH /invoices/{id}`
**Purpose:** Update a draft invoice header

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-260: `DELETE /invoices/{id}`
**Purpose:** Soft-delete a draft invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-261: `POST /invoices/from-job/{jobId}`
**Purpose:** Create draft invoice from uninvoiced billable job charges

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Invoice from job |
| Live notes | OK |

---

### PASS-262: `POST /invoices/{id}/lines`
**Purpose:** Add a line to a draft invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-263: `PATCH /invoices/{id}/lines/{lineId}`
**Purpose:** Update an invoice line

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-264: `DELETE /invoices/{id}/lines/{lineId}`
**Purpose:** Remove an invoice line

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-265: `POST /invoices/{id}/post`
**Purpose:** Post a draft invoice (DRAFT -> POSTED)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Post invoice |
| Live notes | OK |

---

### PASS-266: `POST /invoices/{id}/send`
**Purpose:** Email invoice PDF to customer

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_FAIL** |
| Live HTTP | 500 |
| Live title | Send invoice email |
| Live notes | {"statusCode":500,"message":"Internal server error"} |

---

### PASS-267: `POST /invoices/{id}/pdf`
**Purpose:** Generate invoice PDF

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_FAIL** |
| Live HTTP | 500 |
| Live title | Generate invoice PDF |
| Live notes | {"statusCode":500,"message":"Internal server error"} |

---

### PASS-268: `GET /invoices/{id}/pdf`
**Purpose:** Get invoice PDF metadata

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-269: `POST /invoices/{id}/cancel`
**Purpose:** Cancel an invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-270: `GET /credit-notes`
**Purpose:** List credit notes

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Credit Notes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-271: `POST /credit-notes`
**Purpose:** Create a credit note against a posted customer invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Credit Notes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_FAIL** |
| Live HTTP | 500 |
| Live title | Create credit note |
| Live notes | {"statusCode":500,"message":"Internal server error"} |

---

### PASS-272: `GET /credit-notes/{id}`
**Purpose:** Get a credit note

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Credit Notes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-273: `POST /credit-notes/{id}/post`
**Purpose:** Post a draft credit note

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Credit Notes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-274: `GET /purchase-invoices`
**Purpose:** List purchase invoices (vendor bills)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Purchase Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-275: `POST /purchase-invoices`
**Purpose:** Create a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Purchase Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_FAIL** |
| Live HTTP | 500 |
| Live title | Create purchase invoice |
| Live notes | {"statusCode":500,"message":"Internal server error"} |

---

### PASS-276: `GET /purchase-invoices/{id}`
**Purpose:** Get a purchase invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Purchase Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-277: `PATCH /purchase-invoices/{id}`
**Purpose:** Update a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Purchase Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-278: `DELETE /purchase-invoices/{id}`
**Purpose:** Soft-delete a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Purchase Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-279: `POST /purchase-invoices/{id}/post`
**Purpose:** Post a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Purchase Invoices |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-280: `GET /payment-requests`
**Purpose:** List payment requests

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Payment Requests |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-281: `POST /payment-requests`
**Purpose:** Create a payment request

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Payment Requests |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create payment request |
| Live notes | OK |

---

### PASS-282: `GET /payment-requests/{id}`
**Purpose:** Get a payment request

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Payment Requests |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-283: `PATCH /payment-requests/{id}`
**Purpose:** Update a pending payment request

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Payment Requests |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-284: `DELETE /payment-requests/{id}`
**Purpose:** Soft-delete a pending payment request

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Payment Requests |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-285: `POST /payment-requests/{id}/approve`
**Purpose:** Approve a payment request

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Payment Requests |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Approve payment request |
| Live notes | OK |

---

### PASS-286: `POST /payment-requests/{id}/reject`
**Purpose:** Reject a payment request

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Payment Requests |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-287: `POST /payment-requests/{id}/mark-paid`
**Purpose:** Mark an approved payment request as paid

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Payment Requests |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Mark payment paid |
| Live notes | OK |

---

## Coverage
- APIs in OpenAPI: **287**
- PASS sections: **287**
- Missing: **0**