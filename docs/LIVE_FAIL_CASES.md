# LIVE FAIL Cases — One Per API

**Base URL:** `https://kingfisherwings.onrender.com`
**Run ID:** 1783751652556
**When:** 2026-07-11T06:43:03.771Z
**OpenAPI APIs:** 287

Every OpenAPI operation appears exactly once. Live execution result is shown when available.

| # | Method | Path | Live result | HTTP |
|---|--------|------|-------------|------|
| 1 | GET | `/health` | EXECUTED_PASS (API correctly rejected) | 401 |
| 2 | POST | `/tenants` | EXECUTED_PASS (API correctly rejected) | 401 |
| 3 | GET | `/tenants` | EXECUTED_PASS (API correctly rejected) | 401 |
| 4 | GET | `/tenants/statistics` | EXECUTED_PASS (API correctly rejected) | 401 |
| 5 | POST | `/tenants/sync-permissions` | EXECUTED_PASS (API correctly rejected) | 401 |
| 6 | POST | `/tenants/{id}/sync-permissions` | EXECUTED_PASS (API correctly rejected) | 401 |
| 7 | GET | `/tenants/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 8 | PATCH | `/tenants/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 9 | DELETE | `/tenants/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 10 | PATCH | `/tenants/{id}/restore` | EXECUTED_PASS (API correctly rejected) | 401 |
| 11 | PATCH | `/tenants/{id}/activate` | EXECUTED_PASS (API correctly rejected) | 401 |
| 12 | PATCH | `/tenants/{id}/deactivate` | EXECUTED_PASS (API correctly rejected) | 401 |
| 13 | GET | `/companies` | EXECUTED_PASS (API correctly rejected) | 401 |
| 14 | POST | `/companies` | EXECUTED_PASS (API correctly rejected) | 401 |
| 15 | GET | `/companies/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 16 | PATCH | `/companies/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 17 | DELETE | `/companies/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 18 | GET | `/users` | EXECUTED_PASS (API correctly rejected) | 401 |
| 19 | POST | `/users` | EXECUTED_PASS (API correctly rejected) | 401 |
| 20 | GET | `/users/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 21 | PATCH | `/users/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 22 | DELETE | `/users/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 23 | PATCH | `/users/{id}/status` | EXECUTED_PASS (API correctly rejected) | 401 |
| 24 | POST | `/users/bulk` | EXECUTED_PASS (API correctly rejected) | 401 |
| 25 | POST | `/users/{id}/restore` | EXECUTED_PASS (API correctly rejected) | 401 |
| 26 | POST | `/users/me/change-password` | EXECUTED_PASS (API correctly rejected) | 401 |
| 27 | POST | `/users/{id}/admin-reset-password` | EXECUTED_PASS (API correctly rejected) | 401 |
| 28 | POST | `/users/{id}/force-logout` | EXECUTED_PASS (API correctly rejected) | 401 |
| 29 | POST | `/auth/login` | PUBLIC_USE_BAD_BODY | 400 |
| 30 | POST | `/auth/tenant-login` | PUBLIC_USE_BAD_BODY | 400 |
| 31 | POST | `/auth/super-admin/signup` | PUBLIC_USE_BAD_BODY | 400 |
| 32 | POST | `/auth/super-admin/login` | EXECUTED_PASS (API correctly rejected) | 401 |
| 33 | POST | `/auth/refresh` | PUBLIC_USE_BAD_BODY | 400 |
| 34 | POST | `/auth/logout` | EXECUTED_PASS (API correctly rejected) | 401 |
| 35 | GET | `/auth/sessions` | EXECUTED_PASS (API correctly rejected) | 401 |
| 36 | POST | `/auth/sessions/{sessionId}/revoke` | EXECUTED_PASS (API correctly rejected) | 401 |
| 37 | POST | `/auth/logout-all` | EXECUTED_PASS (API correctly rejected) | 401 |
| 38 | GET | `/auth/me` | EXECUTED_PASS (API correctly rejected) | 401 |
| 39 | POST | `/auth/change-password` | EXECUTED_PASS (API correctly rejected) | 401 |
| 40 | POST | `/auth/tenant/change-password` | EXECUTED_PASS (API correctly rejected) | 401 |
| 41 | GET | `/masters/countries` | EXECUTED_PASS (API correctly rejected) | 401 |
| 42 | POST | `/masters/countries` | EXECUTED_PASS (API correctly rejected) | 401 |
| 43 | GET | `/masters/countries/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 44 | PATCH | `/masters/countries/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 45 | DELETE | `/masters/countries/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 46 | GET | `/masters/currencies` | EXECUTED_PASS (API correctly rejected) | 401 |
| 47 | POST | `/masters/currencies` | EXECUTED_PASS (API correctly rejected) | 401 |
| 48 | GET | `/masters/currencies/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 49 | PATCH | `/masters/currencies/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 50 | DELETE | `/masters/currencies/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 51 | GET | `/masters/exchange-rates` | EXECUTED_PASS (API correctly rejected) | 401 |
| 52 | POST | `/masters/exchange-rates` | EXECUTED_PASS (API correctly rejected) | 401 |
| 53 | GET | `/masters/exchange-rates/latest/{currencyId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 54 | GET | `/masters/ports` | EXECUTED_PASS (API correctly rejected) | 401 |
| 55 | POST | `/masters/ports` | EXECUTED_PASS (API correctly rejected) | 401 |
| 56 | GET | `/masters/ports/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 57 | PATCH | `/masters/ports/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 58 | DELETE | `/masters/ports/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 59 | GET | `/masters/airports` | EXECUTED_PASS (API correctly rejected) | 401 |
| 60 | POST | `/masters/airports` | EXECUTED_PASS (API correctly rejected) | 401 |
| 61 | GET | `/masters/airports/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 62 | PATCH | `/masters/airports/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 63 | DELETE | `/masters/airports/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 64 | GET | `/masters/container-types` | EXECUTED_PASS (API correctly rejected) | 401 |
| 65 | POST | `/masters/container-types` | EXECUTED_PASS (API correctly rejected) | 401 |
| 66 | GET | `/masters/container-types/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 67 | PATCH | `/masters/container-types/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 68 | DELETE | `/masters/container-types/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 69 | GET | `/masters/hs-codes` | EXECUTED_PASS (API correctly rejected) | 401 |
| 70 | POST | `/masters/hs-codes` | EXECUTED_PASS (API correctly rejected) | 401 |
| 71 | GET | `/masters/hs-codes/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 72 | PATCH | `/masters/hs-codes/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 73 | DELETE | `/masters/hs-codes/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 74 | GET | `/masters/airlines` | EXECUTED_PASS (API correctly rejected) | 401 |
| 75 | POST | `/masters/airlines` | EXECUTED_PASS (API correctly rejected) | 401 |
| 76 | GET | `/masters/airlines/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 77 | PATCH | `/masters/airlines/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 78 | DELETE | `/masters/airlines/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 79 | GET | `/masters/shipping-lines` | EXECUTED_PASS (API correctly rejected) | 401 |
| 80 | POST | `/masters/shipping-lines` | EXECUTED_PASS (API correctly rejected) | 401 |
| 81 | GET | `/masters/shipping-lines/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 82 | PATCH | `/masters/shipping-lines/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 83 | DELETE | `/masters/shipping-lines/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 84 | GET | `/masters/vessels` | EXECUTED_PASS (API correctly rejected) | 401 |
| 85 | POST | `/masters/vessels` | EXECUTED_PASS (API correctly rejected) | 401 |
| 86 | GET | `/masters/vessels/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 87 | PATCH | `/masters/vessels/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 88 | DELETE | `/masters/vessels/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 89 | GET | `/masters/truckers` | EXECUTED_PASS (API correctly rejected) | 401 |
| 90 | POST | `/masters/truckers` | EXECUTED_PASS (API correctly rejected) | 401 |
| 91 | GET | `/masters/truckers/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 92 | PATCH | `/masters/truckers/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 93 | DELETE | `/masters/truckers/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 94 | GET | `/masters/warehouses` | EXECUTED_PASS (API correctly rejected) | 401 |
| 95 | POST | `/masters/warehouses` | EXECUTED_PASS (API correctly rejected) | 401 |
| 96 | GET | `/masters/warehouses/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 97 | PATCH | `/masters/warehouses/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 98 | DELETE | `/masters/warehouses/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 99 | GET | `/masters/charge-codes` | EXECUTED_PASS (API correctly rejected) | 401 |
| 100 | POST | `/masters/charge-codes` | EXECUTED_PASS (API correctly rejected) | 401 |
| 101 | GET | `/masters/charge-codes/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 102 | PATCH | `/masters/charge-codes/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 103 | DELETE | `/masters/charge-codes/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 104 | GET | `/masters/banks` | EXECUTED_PASS (API correctly rejected) | 401 |
| 105 | POST | `/masters/banks` | EXECUTED_PASS (API correctly rejected) | 401 |
| 106 | GET | `/masters/banks/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 107 | PATCH | `/masters/banks/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 108 | DELETE | `/masters/banks/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 109 | GET | `/masters/holidays` | EXECUTED_PASS (API correctly rejected) | 401 |
| 110 | POST | `/masters/holidays` | EXECUTED_PASS (API correctly rejected) | 401 |
| 111 | GET | `/masters/holidays/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 112 | PATCH | `/masters/holidays/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 113 | DELETE | `/masters/holidays/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 114 | GET | `/masters/units-of-measure` | EXECUTED_PASS (API correctly rejected) | 401 |
| 115 | POST | `/masters/units-of-measure` | EXECUTED_PASS (API correctly rejected) | 401 |
| 116 | GET | `/masters/units-of-measure/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 117 | PATCH | `/masters/units-of-measure/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 118 | DELETE | `/masters/units-of-measure/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 119 | GET | `/masters/tax-rates` | EXECUTED_PASS (API correctly rejected) | 401 |
| 120 | POST | `/masters/tax-rates` | EXECUTED_PASS (API correctly rejected) | 401 |
| 121 | GET | `/masters/tax-rates/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 122 | PATCH | `/masters/tax-rates/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 123 | DELETE | `/masters/tax-rates/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 124 | GET | `/masters/branches` | EXECUTED_PASS (API correctly rejected) | 401 |
| 125 | POST | `/masters/branches` | EXECUTED_PASS (API correctly rejected) | 401 |
| 126 | GET | `/masters/branches/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 127 | PATCH | `/masters/branches/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 128 | DELETE | `/masters/branches/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 129 | GET | `/masters/departments` | EXECUTED_PASS (API correctly rejected) | 401 |
| 130 | POST | `/masters/departments` | EXECUTED_PASS (API correctly rejected) | 401 |
| 131 | GET | `/masters/departments/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 132 | PATCH | `/masters/departments/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 133 | DELETE | `/masters/departments/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 134 | GET | `/masters/designations` | EXECUTED_PASS (API correctly rejected) | 401 |
| 135 | POST | `/masters/designations` | EXECUTED_PASS (API correctly rejected) | 401 |
| 136 | GET | `/masters/designations/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 137 | PATCH | `/masters/designations/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 138 | DELETE | `/masters/designations/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 139 | GET | `/parties` | EXECUTED_PASS (API correctly rejected) | 401 |
| 140 | POST | `/parties` | EXECUTED_PASS (API correctly rejected) | 401 |
| 141 | GET | `/parties/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 142 | PATCH | `/parties/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 143 | DELETE | `/parties/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 144 | POST | `/parties/import` | EXECUTED_PASS (API correctly rejected) | 401 |
| 145 | PATCH | `/parties/{id}/credit-status` | EXECUTED_PASS (API correctly rejected) | 401 |
| 146 | POST | `/parties/{id}/contacts` | EXECUTED_PASS (API correctly rejected) | 401 |
| 147 | PATCH | `/parties/{id}/contacts/{contactId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 148 | DELETE | `/parties/{id}/contacts/{contactId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 149 | POST | `/parties/{id}/addresses` | EXECUTED_PASS (API correctly rejected) | 401 |
| 150 | PATCH | `/parties/{id}/addresses/{addressId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 151 | DELETE | `/parties/{id}/addresses/{addressId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 152 | GET | `/organization/profile` | EXECUTED_PASS (API correctly rejected) | 401 |
| 153 | PATCH | `/organization/profile` | EXECUTED_PASS (API correctly rejected) | 401 |
| 154 | GET | `/organization/bank-accounts` | EXECUTED_PASS (API correctly rejected) | 401 |
| 155 | POST | `/organization/bank-accounts` | EXECUTED_PASS (API correctly rejected) | 401 |
| 156 | GET | `/organization/bank-accounts/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 157 | PATCH | `/organization/bank-accounts/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 158 | DELETE | `/organization/bank-accounts/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 159 | GET | `/organization/number-formats` | EXECUTED_PASS (API correctly rejected) | 401 |
| 160 | POST | `/organization/number-formats` | EXECUTED_PASS (API correctly rejected) | 401 |
| 161 | GET | `/organization/number-formats/{documentType}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 162 | PATCH | `/organization/number-formats/{documentType}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 163 | GET | `/organization/number-formats/{documentType}/preview` | EXECUTED_PASS (API correctly rejected) | 401 |
| 164 | GET | `/quotations` | EXECUTED_PASS (API correctly rejected) | 401 |
| 165 | POST | `/quotations` | EXECUTED_PASS (API correctly rejected) | 401 |
| 166 | GET | `/quotations/reports/chargewise` | EXECUTED_PASS (API correctly rejected) | 401 |
| 167 | GET | `/quotations/reports/analytics` | EXECUTED_PASS (API correctly rejected) | 401 |
| 168 | GET | `/quotations/reports/analytics/conversion` | EXECUTED_PASS (API correctly rejected) | 401 |
| 169 | GET | `/quotations/reports/analytics/lost-reasons` | EXECUTED_PASS (API correctly rejected) | 401 |
| 170 | GET | `/quotations/reports/analytics/response-time` | EXECUTED_PASS (API correctly rejected) | 401 |
| 171 | POST | `/quotations/online-quote` | PUBLIC_USE_BAD_BODY | 400 |
| 172 | POST | `/quotations/expire-due` | EXECUTED_PASS (API correctly rejected) | 401 |
| 173 | GET | `/quotations/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 174 | PATCH | `/quotations/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 175 | DELETE | `/quotations/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 176 | GET | `/quotations/{id}/revisions` | EXECUTED_PASS (API correctly rejected) | 401 |
| 177 | POST | `/quotations/{id}/lines` | EXECUTED_PASS (API correctly rejected) | 401 |
| 178 | POST | `/quotations/{id}/apply-tariff` | EXECUTED_PASS (API correctly rejected) | 401 |
| 179 | PATCH | `/quotations/{id}/lines/{lineId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 180 | DELETE | `/quotations/{id}/lines/{lineId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 181 | POST | `/quotations/{id}/submit` | EXECUTED_PASS (API correctly rejected) | 401 |
| 182 | POST | `/quotations/{id}/approve` | EXECUTED_PASS (API correctly rejected) | 401 |
| 183 | POST | `/quotations/{id}/reject` | EXECUTED_PASS (API correctly rejected) | 401 |
| 184 | POST | `/quotations/{id}/send` | EXECUTED_PASS (API correctly rejected) | 401 |
| 185 | POST | `/quotations/{id}/mark-won` | EXECUTED_PASS (API correctly rejected) | 401 |
| 186 | POST | `/quotations/{id}/mark-lost` | EXECUTED_PASS (API correctly rejected) | 401 |
| 187 | POST | `/quotations/{id}/duplicate` | EXECUTED_PASS (API correctly rejected) | 401 |
| 188 | POST | `/quotations/{id}/convert-to-job` | EXECUTED_PASS (API correctly rejected) | 401 |
| 189 | POST | `/quotations/{id}/archive` | EXECUTED_PASS (API correctly rejected) | 401 |
| 190 | POST | `/quotations/{id}/expire` | EXECUTED_PASS (API correctly rejected) | 401 |
| 191 | POST | `/quotations/{id}/pdf` | EXECUTED_PASS (API correctly rejected) | 401 |
| 192 | GET | `/quotations/{id}/pdf` | EXECUTED_PASS (API correctly rejected) | 401 |
| 193 | GET | `/quotations/{id}/pdf/status` | EXECUTED_PASS (API correctly rejected) | 401 |
| 194 | POST | `/quotations/{id}/send-email` | EXECUTED_PASS (API correctly rejected) | 401 |
| 195 | GET | `/quotations/tariffs` | EXECUTED_PASS (API correctly rejected) | 401 |
| 196 | POST | `/quotations/tariffs` | EXECUTED_PASS (API correctly rejected) | 401 |
| 197 | GET | `/quotations/tariffs/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 198 | PATCH | `/quotations/tariffs/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 199 | DELETE | `/quotations/tariffs/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 200 | GET | `/quotations/zip-distances` | EXECUTED_PASS (API correctly rejected) | 401 |
| 201 | POST | `/quotations/zip-distances` | EXECUTED_PASS (API correctly rejected) | 401 |
| 202 | GET | `/quotations/zip-distances/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 203 | PATCH | `/quotations/zip-distances/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 204 | DELETE | `/quotations/zip-distances/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 205 | GET | `/jobs` | EXECUTED_PASS (API correctly rejected) | 401 |
| 206 | POST | `/jobs` | EXECUTED_PASS (API correctly rejected) | 401 |
| 207 | GET | `/jobs/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 208 | PATCH | `/jobs/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 209 | DELETE | `/jobs/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 210 | GET | `/jobs/{id}/house-jobs` | EXECUTED_PASS (API correctly rejected) | 401 |
| 211 | GET | `/jobs/{id}/milestones` | EXECUTED_PASS (API correctly rejected) | 401 |
| 212 | POST | `/jobs/{id}/milestones` | EXECUTED_PASS (API correctly rejected) | 401 |
| 213 | GET | `/jobs/{id}/pnl` | EXECUTED_PASS (API correctly rejected) | 401 |
| 214 | GET | `/jobs/{id}/notes` | EXECUTED_PASS (API correctly rejected) | 401 |
| 215 | POST | `/jobs/{id}/notes` | EXECUTED_PASS (API correctly rejected) | 401 |
| 216 | GET | `/jobs/{id}/documents` | EXECUTED_PASS (API correctly rejected) | 401 |
| 217 | POST | `/jobs/{id}/documents` | EXECUTED_PASS (API correctly rejected) | 401 |
| 218 | GET | `/jobs/{id}/containers` | EXECUTED_PASS (API correctly rejected) | 401 |
| 219 | POST | `/jobs/{id}/containers` | EXECUTED_PASS (API correctly rejected) | 401 |
| 220 | POST | `/jobs/{id}/close` | EXECUTED_PASS (API correctly rejected) | 401 |
| 221 | POST | `/jobs/{id}/cancel` | EXECUTED_PASS (API correctly rejected) | 401 |
| 222 | PATCH | `/jobs/{id}/air-details` | EXECUTED_PASS (API correctly rejected) | 401 |
| 223 | PATCH | `/jobs/{id}/sea-fcl-details` | EXECUTED_PASS (API correctly rejected) | 401 |
| 224 | PATCH | `/jobs/{id}/milestones/{milestoneId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 225 | POST | `/jobs/{id}/charges` | EXECUTED_PASS (API correctly rejected) | 401 |
| 226 | PATCH | `/jobs/{id}/charges/{chargeId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 227 | DELETE | `/jobs/{id}/charges/{chargeId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 228 | POST | `/jobs/{id}/prorate-cost/{chargeCodeId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 229 | PATCH | `/jobs/{id}/notes/{noteId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 230 | DELETE | `/jobs/{id}/notes/{noteId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 231 | PATCH | `/jobs/{id}/documents/{documentId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 232 | DELETE | `/jobs/{id}/documents/{documentId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 233 | POST | `/jobs/{id}/documents/{documentId}/finalize` | EXECUTED_PASS (API correctly rejected) | 401 |
| 234 | GET | `/jobs/{id}/documents/generation-status` | EXECUTED_PASS (API correctly rejected) | 401 |
| 235 | POST | `/jobs/{id}/documents/hawb` | EXECUTED_PASS (API correctly rejected) | 401 |
| 236 | POST | `/jobs/{id}/documents/mawb` | EXECUTED_PASS (API correctly rejected) | 401 |
| 237 | POST | `/jobs/{id}/documents/pre-alert` | EXECUTED_PASS (API correctly rejected) | 401 |
| 238 | POST | `/jobs/{id}/documents/cargo-manifest` | EXECUTED_PASS (API correctly rejected) | 401 |
| 239 | POST | `/jobs/{id}/pre-alert/send` | EXECUTED_PASS (API correctly rejected) | 401 |
| 240 | PATCH | `/jobs/{id}/containers/{containerId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 241 | DELETE | `/jobs/{id}/containers/{containerId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 242 | GET | `/awb-stock/batches` | EXECUTED_PASS (API correctly rejected) | 401 |
| 243 | POST | `/awb-stock/batches` | EXECUTED_PASS (API correctly rejected) | 401 |
| 244 | GET | `/awb-stock/reports/low-stock` | EXECUTED_PASS (API correctly rejected) | 401 |
| 245 | GET | `/awb-stock/allocations` | EXECUTED_PASS (API correctly rejected) | 401 |
| 246 | GET | `/awb-stock/batches/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 247 | PATCH | `/awb-stock/batches/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 248 | DELETE | `/awb-stock/batches/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 249 | POST | `/awb-stock/batches/{id}/allocate` | EXECUTED_PASS (API correctly rejected) | 401 |
| 250 | POST | `/awb-stock/batches/{id}/transfer-branch` | EXECUTED_PASS (API correctly rejected) | 401 |
| 251 | POST | `/awb-stock/allocations/{id}/void` | EXECUTED_PASS (API correctly rejected) | 401 |
| 252 | POST | `/awb-stock/allocations/{id}/mark-used` | EXECUTED_PASS (API correctly rejected) | 401 |
| 253 | GET | `/search` | EXECUTED_PASS (API correctly rejected) | 401 |
| 254 | GET | `/files/{tenantId}/{filename}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 255 | GET | `/invoices` | EXECUTED_PASS (API correctly rejected) | 401 |
| 256 | POST | `/invoices` | EXECUTED_PASS (API correctly rejected) | 401 |
| 257 | GET | `/invoices/reports/overdue` | EXECUTED_PASS (API correctly rejected) | 401 |
| 258 | GET | `/invoices/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 259 | PATCH | `/invoices/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 260 | DELETE | `/invoices/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 261 | POST | `/invoices/from-job/{jobId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 262 | POST | `/invoices/{id}/lines` | EXECUTED_PASS (API correctly rejected) | 401 |
| 263 | PATCH | `/invoices/{id}/lines/{lineId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 264 | DELETE | `/invoices/{id}/lines/{lineId}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 265 | POST | `/invoices/{id}/post` | EXECUTED_PASS (API correctly rejected) | 401 |
| 266 | POST | `/invoices/{id}/send` | EXECUTED_PASS (API correctly rejected) | 401 |
| 267 | POST | `/invoices/{id}/pdf` | EXECUTED_PASS (API correctly rejected) | 401 |
| 268 | GET | `/invoices/{id}/pdf` | EXECUTED_PASS (API correctly rejected) | 401 |
| 269 | POST | `/invoices/{id}/cancel` | EXECUTED_PASS (API correctly rejected) | 401 |
| 270 | GET | `/credit-notes` | EXECUTED_PASS (API correctly rejected) | 401 |
| 271 | POST | `/credit-notes` | EXECUTED_PASS (API correctly rejected) | 401 |
| 272 | GET | `/credit-notes/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 273 | POST | `/credit-notes/{id}/post` | EXECUTED_PASS (API correctly rejected) | 401 |
| 274 | GET | `/purchase-invoices` | EXECUTED_PASS (API correctly rejected) | 401 |
| 275 | POST | `/purchase-invoices` | EXECUTED_PASS (API correctly rejected) | 401 |
| 276 | GET | `/purchase-invoices/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 277 | PATCH | `/purchase-invoices/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 278 | DELETE | `/purchase-invoices/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 279 | POST | `/purchase-invoices/{id}/post` | EXECUTED_PASS (API correctly rejected) | 401 |
| 280 | GET | `/payment-requests` | EXECUTED_PASS (API correctly rejected) | 401 |
| 281 | POST | `/payment-requests` | EXECUTED_PASS (API correctly rejected) | 401 |
| 282 | GET | `/payment-requests/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 283 | PATCH | `/payment-requests/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 284 | DELETE | `/payment-requests/{id}` | EXECUTED_PASS (API correctly rejected) | 401 |
| 285 | POST | `/payment-requests/{id}/approve` | EXECUTED_PASS (API correctly rejected) | 401 |
| 286 | POST | `/payment-requests/{id}/reject` | EXECUTED_PASS (API correctly rejected) | 401 |
| 287 | POST | `/payment-requests/{id}/mark-paid` | EXECUTED_PASS (API correctly rejected) | 401 |

## Per-API FAIL details

### FAIL-001: `GET /health`

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Untagged |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /health HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-002: `POST /tenants`
**Purpose:** Create a new tenant (also provisions its TENANT_ADMIN owner user)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /tenants HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-003: `GET /tenants`
**Purpose:** Get all tenants

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /tenants HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-004: `GET /tenants/statistics`
**Purpose:** Tenant statistics

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /tenants/statistics HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-005: `POST /tenants/sync-permissions`
**Purpose:** Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /tenants/sync-permissions HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-006: `POST /tenants/{id}/sync-permissions`
**Purpose:** Reconcile one tenant against the current permission/role catalog

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /tenants/{id}/sync-permissions HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-007: `GET /tenants/{id}`
**Purpose:** Get tenant by ID

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /tenants/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-008: `PATCH /tenants/{id}`
**Purpose:** Update tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /tenants/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-009: `DELETE /tenants/{id}`
**Purpose:** Soft delete tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /tenants/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-010: `PATCH /tenants/{id}/restore`
**Purpose:** Restore tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /tenants/{id}/restore HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-011: `PATCH /tenants/{id}/activate`
**Purpose:** Activate tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /tenants/{id}/activate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-012: `PATCH /tenants/{id}/deactivate`
**Purpose:** Deactivate tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /tenants/{id}/deactivate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-013: `GET /companies`
**Purpose:** List this tenant's companies (usually just the one default, more for multi-entity groups)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /companies HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-014: `POST /companies`
**Purpose:** Register an additional company under this tenant (multi-entity groups)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /companies HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-015: `GET /companies/{id}`
**Purpose:** Get a company by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /companies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-016: `PATCH /companies/{id}`
**Purpose:** Update a company

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /companies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-017: `DELETE /companies/{id}`
**Purpose:** Soft-delete a company (blocked if it is the only one, or currently default)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /companies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-018: `GET /users`
**Purpose:** List users for the current tenant (paginated, filterable).

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /users HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-019: `POST /users`
**Purpose:** Create a user. Returns a system-generated temporary password.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /users HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-020: `GET /users/{id}`
**Purpose:** Get a single user by id.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /users/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-021: `PATCH /users/{id}`
**Purpose:** Update a user.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /users/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-022: `DELETE /users/{id}`
**Purpose:** Soft-delete a user.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /users/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-023: `PATCH /users/{id}/status`
**Purpose:** Change a user's status (activate, suspend, etc).

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /users/{id}/status HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-024: `POST /users/bulk`
**Purpose:** Apply an action (activate/deactivate/suspend/delete/restore) to multiple users.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /users/bulk HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-025: `POST /users/{id}/restore`
**Purpose:** Restore a soft-deleted user.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /users/{id}/restore HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-026: `POST /users/me/change-password`
**Purpose:** Authenticated user changes their own password.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /users/me/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-027: `POST /users/{id}/admin-reset-password`
**Purpose:** Admin resets a target user's password to a new temporary password.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /users/{id}/admin-reset-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-028: `POST /users/{id}/force-logout`
**Purpose:** Force-logout: revoke a target user's active sessions on all devices.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /users/{id}/force-logout HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-029: `POST /auth/login`
**Purpose:** Staff login: tenant slug + email + password

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

```http
POST /auth/login HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-030: `POST /auth/tenant-login`
**Purpose:** Tenant admin login: tenant slug + the tenant's own password

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

```http
POST /auth/tenant-login HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-031: `POST /auth/super-admin/signup`
**Purpose:** Platform super admin self-registration

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

```http
POST /auth/super-admin/signup HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-032: `POST /auth/super-admin/login`
**Purpose:** Platform super admin login

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | Super admin login with wrong password |
| Live notes | OK |
| Assertion | PASS — rejection correct |

```http
POST /auth/super-admin/login HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-033: `POST /auth/refresh`
**Purpose:** Exchange a refresh token for a new token pair

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

```http
POST /auth/refresh HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-034: `POST /auth/logout`
**Purpose:** Revoke the current session

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /auth/logout HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-035: `GET /auth/sessions`
**Purpose:** List the authenticated user's own active sessions

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /auth/sessions HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-036: `POST /auth/sessions/{sessionId}/revoke`
**Purpose:** Revoke one of the authenticated user's own sessions

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /auth/sessions/{sessionId}/revoke HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-037: `POST /auth/logout-all`
**Purpose:** Log out of every device (revokes all active sessions)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /auth/logout-all HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-038: `GET /auth/me`
**Purpose:** Get the authenticated principal (user, tenant owner, or super admin)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /auth/me HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-039: `POST /auth/change-password`
**Purpose:** Change the authenticated user password

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /auth/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-040: `POST /auth/tenant/change-password`
**Purpose:** Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /auth/tenant/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-041: `GET /masters/countries`
**Purpose:** List countries

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/countries HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-042: `POST /masters/countries`
**Purpose:** Create a country

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/countries HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-043: `GET /masters/countries/{id}`
**Purpose:** Get a country by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/countries/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-044: `PATCH /masters/countries/{id}`
**Purpose:** Update a country

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/countries/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-045: `DELETE /masters/countries/{id}`
**Purpose:** Soft-delete a country

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/countries/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-046: `GET /masters/currencies`
**Purpose:** List currencies

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/currencies HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-047: `POST /masters/currencies`
**Purpose:** Create a currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/currencies HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-048: `GET /masters/currencies/{id}`
**Purpose:** Get a currency by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/currencies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-049: `PATCH /masters/currencies/{id}`
**Purpose:** Update a currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/currencies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-050: `DELETE /masters/currencies/{id}`
**Purpose:** Soft-delete a currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/currencies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-051: `GET /masters/exchange-rates`
**Purpose:** List exchange rates, optionally filtered by currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Exchange Rates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/exchange-rates HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-052: `POST /masters/exchange-rates`
**Purpose:** Record (or correct) an exchange rate for a date — upserts by currency + date

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Exchange Rates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/exchange-rates HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-053: `GET /masters/exchange-rates/latest/{currencyId}`
**Purpose:** Most recent rate on file for a currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Exchange Rates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/exchange-rates/latest/{currencyId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-054: `GET /masters/ports`
**Purpose:** List ports

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/ports HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-055: `POST /masters/ports`
**Purpose:** Create a port

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/ports HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-056: `GET /masters/ports/{id}`
**Purpose:** Get a port record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/ports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-057: `PATCH /masters/ports/{id}`
**Purpose:** Update a port

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/ports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-058: `DELETE /masters/ports/{id}`
**Purpose:** Soft-delete a port

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/ports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-059: `GET /masters/airports`
**Purpose:** List airports

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/airports HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-060: `POST /masters/airports`
**Purpose:** Create an airport

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/airports HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-061: `GET /masters/airports/{id}`
**Purpose:** Get an airport by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/airports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-062: `PATCH /masters/airports/{id}`
**Purpose:** Update an airport

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/airports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-063: `DELETE /masters/airports/{id}`
**Purpose:** Soft-delete an airport

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/airports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-064: `GET /masters/container-types`
**Purpose:** List container types

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/container-types HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-065: `POST /masters/container-types`
**Purpose:** Create a container type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/container-types HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-066: `GET /masters/container-types/{id}`
**Purpose:** Get a container type by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/container-types/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-067: `PATCH /masters/container-types/{id}`
**Purpose:** Update a container type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/container-types/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-068: `DELETE /masters/container-types/{id}`
**Purpose:** Soft-delete a container type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/container-types/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-069: `GET /masters/hs-codes`
**Purpose:** List HS codes

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/hs-codes HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-070: `POST /masters/hs-codes`
**Purpose:** Create an HS code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/hs-codes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-071: `GET /masters/hs-codes/{id}`
**Purpose:** Get an HS code by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/hs-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-072: `PATCH /masters/hs-codes/{id}`
**Purpose:** Update an HS code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/hs-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-073: `DELETE /masters/hs-codes/{id}`
**Purpose:** Soft-delete an HS code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/hs-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-074: `GET /masters/airlines`
**Purpose:** list airlines

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/airlines HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-075: `POST /masters/airlines`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/airlines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-076: `GET /masters/airlines/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/airlines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-077: `PATCH /masters/airlines/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/airlines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-078: `DELETE /masters/airlines/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/airlines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-079: `GET /masters/shipping-lines`
**Purpose:** list shippinglines

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/shipping-lines HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-080: `POST /masters/shipping-lines`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/shipping-lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-081: `GET /masters/shipping-lines/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/shipping-lines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-082: `PATCH /masters/shipping-lines/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/shipping-lines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-083: `DELETE /masters/shipping-lines/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/shipping-lines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-084: `GET /masters/vessels`
**Purpose:** list vessels

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/vessels HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-085: `POST /masters/vessels`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/vessels HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-086: `GET /masters/vessels/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/vessels/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-087: `PATCH /masters/vessels/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/vessels/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-088: `DELETE /masters/vessels/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/vessels/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-089: `GET /masters/truckers`
**Purpose:** list truckers

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/truckers HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-090: `POST /masters/truckers`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/truckers HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-091: `GET /masters/truckers/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/truckers/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-092: `PATCH /masters/truckers/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/truckers/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-093: `DELETE /masters/truckers/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/truckers/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-094: `GET /masters/warehouses`
**Purpose:** list warehouses

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/warehouses HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-095: `POST /masters/warehouses`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/warehouses HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-096: `GET /masters/warehouses/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/warehouses/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-097: `PATCH /masters/warehouses/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/warehouses/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-098: `DELETE /masters/warehouses/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/warehouses/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-099: `GET /masters/charge-codes`
**Purpose:** list chargecodes

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/charge-codes HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-100: `POST /masters/charge-codes`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/charge-codes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-101: `GET /masters/charge-codes/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/charge-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-102: `PATCH /masters/charge-codes/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/charge-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-103: `DELETE /masters/charge-codes/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/charge-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-104: `GET /masters/banks`
**Purpose:** list banks

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/banks HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-105: `POST /masters/banks`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/banks HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-106: `GET /masters/banks/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/banks/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-107: `PATCH /masters/banks/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/banks/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-108: `DELETE /masters/banks/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/banks/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-109: `GET /masters/holidays`
**Purpose:** list holidays

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/holidays HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-110: `POST /masters/holidays`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/holidays HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-111: `GET /masters/holidays/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/holidays/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-112: `PATCH /masters/holidays/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/holidays/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-113: `DELETE /masters/holidays/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/holidays/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-114: `GET /masters/units-of-measure`
**Purpose:** list unitsofmeasure

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/units-of-measure HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-115: `POST /masters/units-of-measure`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/units-of-measure HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-116: `GET /masters/units-of-measure/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/units-of-measure/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-117: `PATCH /masters/units-of-measure/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/units-of-measure/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-118: `DELETE /masters/units-of-measure/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/units-of-measure/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-119: `GET /masters/tax-rates`
**Purpose:** list taxrates

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/tax-rates HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-120: `POST /masters/tax-rates`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/tax-rates HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-121: `GET /masters/tax-rates/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/tax-rates/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-122: `PATCH /masters/tax-rates/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/tax-rates/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-123: `DELETE /masters/tax-rates/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/tax-rates/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-124: `GET /masters/branches`
**Purpose:** list branches

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/branches HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-125: `POST /masters/branches`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/branches HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-126: `GET /masters/branches/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/branches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-127: `PATCH /masters/branches/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/branches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-128: `DELETE /masters/branches/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/branches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-129: `GET /masters/departments`
**Purpose:** list departments

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/departments HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-130: `POST /masters/departments`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/departments HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-131: `GET /masters/departments/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/departments/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-132: `PATCH /masters/departments/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/departments/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-133: `DELETE /masters/departments/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/departments/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-134: `GET /masters/designations`
**Purpose:** list designations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/designations HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-135: `POST /masters/designations`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /masters/designations HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-136: `GET /masters/designations/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /masters/designations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-137: `PATCH /masters/designations/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /masters/designations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-138: `DELETE /masters/designations/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /masters/designations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-139: `GET /parties`
**Purpose:** List parties (customers, agents, suppliers, carriers, etc.)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /parties HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-140: `POST /parties`
**Purpose:** Create a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /parties HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-141: `GET /parties/{id}`
**Purpose:** Get a party with its contacts and addresses

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /parties/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-142: `PATCH /parties/{id}`
**Purpose:** Update a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /parties/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-143: `DELETE /parties/{id}`
**Purpose:** Soft-delete a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /parties/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-144: `POST /parties/import`
**Purpose:** Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /parties/import HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-145: `PATCH /parties/{id}/credit-status`
**Purpose:** Change credit status (Active / On Hold / Blacklisted)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /parties/{id}/credit-status HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-146: `POST /parties/{id}/contacts`
**Purpose:** Add a contact to a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /parties/{id}/contacts HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-147: `PATCH /parties/{id}/contacts/{contactId}`
**Purpose:** Update a party's contact

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /parties/{id}/contacts/{contactId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-148: `DELETE /parties/{id}/contacts/{contactId}`
**Purpose:** Remove a party's contact

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /parties/{id}/contacts/{contactId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-149: `POST /parties/{id}/addresses`
**Purpose:** Add an address to a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /parties/{id}/addresses HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-150: `PATCH /parties/{id}/addresses/{addressId}`
**Purpose:** Update a party's address

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /parties/{id}/addresses/{addressId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-151: `DELETE /parties/{id}/addresses/{addressId}`
**Purpose:** Remove a party's address

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /parties/{id}/addresses/{addressId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-152: `GET /organization/profile`
**Purpose:** Get this tenant's own organization profile

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization Profile |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /organization/profile HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-153: `PATCH /organization/profile`
**Purpose:** Update this tenant's own organization profile (Ch.27.1)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization Profile |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /organization/profile HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-154: `GET /organization/bank-accounts`
**Purpose:** List this tenant's own bank accounts

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /organization/bank-accounts HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-155: `POST /organization/bank-accounts`
**Purpose:** Add a bank account

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /organization/bank-accounts HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-156: `GET /organization/bank-accounts/{id}`
**Purpose:** Get a bank account by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /organization/bank-accounts/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-157: `PATCH /organization/bank-accounts/{id}`
**Purpose:** Update a bank account

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /organization/bank-accounts/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-158: `DELETE /organization/bank-accounts/{id}`
**Purpose:** Soft-delete a bank account

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /organization/bank-accounts/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-159: `GET /organization/number-formats`
**Purpose:** List all configured document number formats (Ch.2.2)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /organization/number-formats HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-160: `POST /organization/number-formats`
**Purpose:** Configure the number format for a document type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /organization/number-formats HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-161: `GET /organization/number-formats/{documentType}`
**Purpose:** Get the number format for one document type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /organization/number-formats/{documentType} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-162: `PATCH /organization/number-formats/{documentType}`
**Purpose:** Update the number format for a document type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /organization/number-formats/{documentType} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-163: `GET /organization/number-formats/{documentType}/preview`
**Purpose:** Preview the next number for this format without consuming a sequence value

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /organization/number-formats/{documentType}/preview HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-164: `GET /quotations`
**Purpose:** List quotations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-165: `POST /quotations`
**Purpose:** Create a quotation (DRAFT)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-166: `GET /quotations/reports/chargewise`
**Purpose:** "All Quotations Chargewise" report — same filters as the list, with each charge line included

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/reports/chargewise HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-167: `GET /quotations/reports/analytics`
**Purpose:** Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/reports/analytics HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-168: `GET /quotations/reports/analytics/conversion`
**Purpose:** Win/loss and quote-to-job conversion rates

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/reports/analytics/conversion HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-169: `GET /quotations/reports/analytics/lost-reasons`
**Purpose:** Lost quotation breakdown by reason code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/reports/analytics/lost-reasons HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-170: `GET /quotations/reports/analytics/response-time`
**Purpose:** Average hours from creation to submit/send

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/reports/analytics/response-time HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-171: `POST /quotations/online-quote`
**Purpose:** Public online quote widget — customer submits cargo details, system auto-calculates from tariff (Ch.7.5)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

```http
POST /quotations/online-quote HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-172: `POST /quotations/expire-due`
**Purpose:** Batch-expire all quotations past valid_until (intended for daily cron)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/expire-due HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-173: `GET /quotations/{id}`
**Purpose:** Get a quotation with its lines, status history, and approvals

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-174: `PATCH /quotations/{id}`
**Purpose:** Update a quotation header (DRAFT or REJECTED only)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /quotations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-175: `DELETE /quotations/{id}`
**Purpose:** Soft-delete a quotation (DRAFT only)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /quotations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-176: `GET /quotations/{id}/revisions`
**Purpose:** List all revisions in this quotation version chain

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/{id}/revisions HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-177: `POST /quotations/{id}/lines`
**Purpose:** Add a charge line — GP recalculates automatically

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-178: `POST /quotations/{id}/apply-tariff`
**Purpose:** Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/apply-tariff HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-179: `PATCH /quotations/{id}/lines/{lineId}`
**Purpose:** Update a charge line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /quotations/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-180: `DELETE /quotations/{id}/lines/{lineId}`
**Purpose:** Remove a charge line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /quotations/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-181: `POST /quotations/{id}/submit`
**Purpose:** DRAFT/REJECTED -> SUBMITTED, opens the approval cycle

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/submit HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-182: `POST /quotations/{id}/approve`
**Purpose:** SUBMITTED -> APPROVED

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/approve HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-183: `POST /quotations/{id}/reject`
**Purpose:** SUBMITTED -> REJECTED (editable again, can be resubmitted)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/reject HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-184: `POST /quotations/{id}/send`
**Purpose:** APPROVED -> SENT

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/send HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-185: `POST /quotations/{id}/mark-won`
**Purpose:** SENT -> WON

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/mark-won HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-186: `POST /quotations/{id}/mark-lost`
**Purpose:** SENT -> LOST, with a reason code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/mark-lost HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-187: `POST /quotations/{id}/duplicate`
**Purpose:** Clone into a new revision (new DRAFT, version+1, linked to the same parent)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/duplicate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-188: `POST /quotations/{id}/convert-to-job`
**Purpose:** WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/convert-to-job HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-189: `POST /quotations/{id}/archive`
**Purpose:** Archive a closed quotation (soft-delete)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/archive HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-190: `POST /quotations/{id}/expire`
**Purpose:** Manually expire a quotation past its valid_until date

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/expire HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-191: `POST /quotations/{id}/pdf`
**Purpose:** Queue PDF generation for a quotation (customer or internal mode)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-192: `GET /quotations/{id}/pdf`
**Purpose:** Get quotation PDF URLs and recent generation tasks

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/{id}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-193: `GET /quotations/{id}/pdf/status`
**Purpose:** List PDF generation task status for a quotation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/{id}/pdf/status HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-194: `POST /quotations/{id}/send-email`
**Purpose:** Email quotation PDF to customer (generates PDF if not yet available)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/{id}/send-email HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-195: `GET /quotations/tariffs`
**Purpose:** List tariff rate cards

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/tariffs HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-196: `POST /quotations/tariffs`
**Purpose:** Create a tariff rate card (sale rate + cost rate per lane/service/container type)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/tariffs HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-197: `GET /quotations/tariffs/{id}`
**Purpose:** Get a tariff by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/tariffs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-198: `PATCH /quotations/tariffs/{id}`
**Purpose:** Update a tariff

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /quotations/tariffs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-199: `DELETE /quotations/tariffs/{id}`
**Purpose:** Soft-delete a tariff

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /quotations/tariffs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-200: `GET /quotations/zip-distances`
**Purpose:** List zip-to-zip distances

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/zip-distances HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-201: `POST /quotations/zip-distances`
**Purpose:** Record a distance between two zip/location codes

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /quotations/zip-distances HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-202: `GET /quotations/zip-distances/{id}`
**Purpose:** Get a zip distance record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /quotations/zip-distances/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-203: `PATCH /quotations/zip-distances/{id}`
**Purpose:** Update a zip distance record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /quotations/zip-distances/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-204: `DELETE /quotations/zip-distances/{id}`
**Purpose:** Soft-delete a zip distance record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /quotations/zip-distances/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-205: `GET /jobs`
**Purpose:** List jobs

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /jobs HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-206: `POST /jobs`
**Purpose:** Create a job (booking). AIR_EXPORT jobs auto-get their detail row + the full 15-milestone taxonomy. Set parent_job_id to create a HOUSE job under an existing master.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-207: `GET /jobs/{id}`
**Purpose:** Get a job with air details, charges, milestones, and its house jobs (if a master)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /jobs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-208: `PATCH /jobs/{id}`
**Purpose:** Update a job (not allowed once COMPLETED or CANCELLED)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /jobs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-209: `DELETE /jobs/{id}`
**Purpose:** Soft-delete a completed or cancelled job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /jobs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-210: `GET /jobs/{id}/house-jobs`
**Purpose:** List the house jobs consolidated under this master job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /jobs/{id}/house-jobs HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-211: `GET /jobs/{id}/milestones`
**Purpose:** List all milestones for a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /jobs/{id}/milestones HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-212: `POST /jobs/{id}/milestones`
**Purpose:** Add a custom milestone outside the standard taxonomy

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/milestones HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-213: `GET /jobs/{id}/pnl`
**Purpose:** Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /jobs/{id}/pnl HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-214: `GET /jobs/{id}/notes`
**Purpose:** List notes on a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /jobs/{id}/notes HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-215: `POST /jobs/{id}/notes`
**Purpose:** Add a note to a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/notes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-216: `GET /jobs/{id}/documents`
**Purpose:** List documents attached to a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /jobs/{id}/documents HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-217: `POST /jobs/{id}/documents`
**Purpose:** Register a document on a job (metadata + file URL)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/documents HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-218: `GET /jobs/{id}/containers`
**Purpose:** List containers on a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /jobs/{id}/containers HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-219: `POST /jobs/{id}/containers`
**Purpose:** Add a container to a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/containers HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-220: `POST /jobs/{id}/close`
**Purpose:** Close a job (status -> COMPLETED)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/close HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-221: `POST /jobs/{id}/cancel`
**Purpose:** Cancel a job (status -> CANCELLED)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-222: `PATCH /jobs/{id}/air-details`
**Purpose:** Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /jobs/{id}/air-details HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-223: `PATCH /jobs/{id}/sea-fcl-details`
**Purpose:** Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /jobs/{id}/sea-fcl-details HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-224: `PATCH /jobs/{id}/milestones/{milestoneId}`
**Purpose:** Update a milestone — set actual_date to mark it complete

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /jobs/{id}/milestones/{milestoneId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-225: `POST /jobs/{id}/charges`
**Purpose:** Add a charge line — Job P&L recalculates automatically

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/charges HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-226: `PATCH /jobs/{id}/charges/{chargeId}`
**Purpose:** Update a charge line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /jobs/{id}/charges/{chargeId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-227: `DELETE /jobs/{id}/charges/{chargeId}`
**Purpose:** Remove a charge line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /jobs/{id}/charges/{chargeId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-228: `POST /jobs/{id}/prorate-cost/{chargeCodeId}`
**Purpose:** Distribute a master job's cost line to its house jobs, proportionally by chargeable weight

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/prorate-cost/{chargeCodeId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-229: `PATCH /jobs/{id}/notes/{noteId}`
**Purpose:** Update a job note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /jobs/{id}/notes/{noteId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-230: `DELETE /jobs/{id}/notes/{noteId}`
**Purpose:** Remove a job note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /jobs/{id}/notes/{noteId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-231: `PATCH /jobs/{id}/documents/{documentId}`
**Purpose:** Update a draft document metadata

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /jobs/{id}/documents/{documentId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-232: `DELETE /jobs/{id}/documents/{documentId}`
**Purpose:** Remove a draft document

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /jobs/{id}/documents/{documentId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-233: `POST /jobs/{id}/documents/{documentId}/finalize`
**Purpose:** Finalize a document (DRAFT -> ORIGINAL, locked)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/documents/{documentId}/finalize HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-234: `GET /jobs/{id}/documents/generation-status`
**Purpose:** List async document generation tasks for a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /jobs/{id}/documents/generation-status HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-235: `POST /jobs/{id}/documents/hawb`
**Purpose:** Queue HAWB PDF generation (Puppeteer + BullMQ)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/documents/hawb HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-236: `POST /jobs/{id}/documents/mawb`
**Purpose:** Queue MAWB PDF generation (Puppeteer + BullMQ)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/documents/mawb HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-237: `POST /jobs/{id}/documents/pre-alert`
**Purpose:** Queue pre-alert document PDF generation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/documents/pre-alert HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-238: `POST /jobs/{id}/documents/cargo-manifest`
**Purpose:** Queue cargo manifest PDF generation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/documents/cargo-manifest HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-239: `POST /jobs/{id}/pre-alert/send`
**Purpose:** Send pre-alert and mark PRE_ALERT_SENT milestone complete

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /jobs/{id}/pre-alert/send HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-240: `PATCH /jobs/{id}/containers/{containerId}`
**Purpose:** Update a container on a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /jobs/{id}/containers/{containerId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-241: `DELETE /jobs/{id}/containers/{containerId}`
**Purpose:** Remove a container from a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /jobs/{id}/containers/{containerId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-242: `GET /awb-stock/batches`
**Purpose:** List AWB stock batches

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /awb-stock/batches HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-243: `POST /awb-stock/batches`
**Purpose:** Register a new AWB number range for an airline

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /awb-stock/batches HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-244: `GET /awb-stock/reports/low-stock`
**Purpose:** Batches at or below their low-stock threshold

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /awb-stock/reports/low-stock HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-245: `GET /awb-stock/allocations`
**Purpose:** List AWB allocations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /awb-stock/allocations HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-246: `GET /awb-stock/batches/{id}`
**Purpose:** Get an AWB stock batch with recent allocations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /awb-stock/batches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-247: `PATCH /awb-stock/batches/{id}`
**Purpose:** Update batch metadata (threshold, notes)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /awb-stock/batches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-248: `DELETE /awb-stock/batches/{id}`
**Purpose:** Soft-delete an empty AWB stock batch

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /awb-stock/batches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-249: `POST /awb-stock/batches/{id}/allocate`
**Purpose:** Allocate the next AWB number from a batch to a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /awb-stock/batches/{id}/allocate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-250: `POST /awb-stock/batches/{id}/transfer-branch`
**Purpose:** Transfer batch ownership to another branch

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /awb-stock/batches/{id}/transfer-branch HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-251: `POST /awb-stock/allocations/{id}/void`
**Purpose:** Void an allocated (unused) AWB number

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /awb-stock/allocations/{id}/void HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-252: `POST /awb-stock/allocations/{id}/mark-used`
**Purpose:** Mark an allocated AWB as used (flown/printed)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /awb-stock/allocations/{id}/mark-used HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-253: `GET /search`
**Purpose:** Global search across jobs, quotations, and parties

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Search |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /search HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-254: `GET /files/{tenantId}/{filename}`
**Purpose:** Download a locally stored file (PDFs generated by the system)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Files |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /files/{tenantId}/{filename} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-255: `GET /invoices`
**Purpose:** List customer invoices (Ch.18)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /invoices HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-256: `POST /invoices`
**Purpose:** Create a draft customer invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /invoices HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-257: `GET /invoices/reports/overdue`
**Purpose:** Overdue customer invoices past due_date with outstanding balance

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /invoices/reports/overdue HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-258: `GET /invoices/{id}`
**Purpose:** Get invoice with lines

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-259: `PATCH /invoices/{id}`
**Purpose:** Update a draft invoice header

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-260: `DELETE /invoices/{id}`
**Purpose:** Soft-delete a draft invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-261: `POST /invoices/from-job/{jobId}`
**Purpose:** Create draft invoice from uninvoiced billable job charges

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /invoices/from-job/{jobId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-262: `POST /invoices/{id}/lines`
**Purpose:** Add a line to a draft invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /invoices/{id}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-263: `PATCH /invoices/{id}/lines/{lineId}`
**Purpose:** Update an invoice line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /invoices/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-264: `DELETE /invoices/{id}/lines/{lineId}`
**Purpose:** Remove an invoice line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /invoices/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-265: `POST /invoices/{id}/post`
**Purpose:** Post a draft invoice (DRAFT -> POSTED)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /invoices/{id}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-266: `POST /invoices/{id}/send`
**Purpose:** Email invoice PDF to customer

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /invoices/{id}/send HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-267: `POST /invoices/{id}/pdf`
**Purpose:** Generate invoice PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /invoices/{id}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-268: `GET /invoices/{id}/pdf`
**Purpose:** Get invoice PDF metadata

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /invoices/{id}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-269: `POST /invoices/{id}/cancel`
**Purpose:** Cancel an invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /invoices/{id}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-270: `GET /credit-notes`
**Purpose:** List credit notes

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Credit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /credit-notes HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-271: `POST /credit-notes`
**Purpose:** Create a credit note against a posted customer invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Credit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /credit-notes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-272: `GET /credit-notes/{id}`
**Purpose:** Get a credit note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Credit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /credit-notes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-273: `POST /credit-notes/{id}/post`
**Purpose:** Post a draft credit note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Credit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /credit-notes/{id}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-274: `GET /purchase-invoices`
**Purpose:** List purchase invoices (vendor bills)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /purchase-invoices HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-275: `POST /purchase-invoices`
**Purpose:** Create a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /purchase-invoices HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-276: `GET /purchase-invoices/{id}`
**Purpose:** Get a purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /purchase-invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-277: `PATCH /purchase-invoices/{id}`
**Purpose:** Update a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /purchase-invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-278: `DELETE /purchase-invoices/{id}`
**Purpose:** Soft-delete a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /purchase-invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-279: `POST /purchase-invoices/{id}/post`
**Purpose:** Post a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /purchase-invoices/{id}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-280: `GET /payment-requests`
**Purpose:** List payment requests

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /payment-requests HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-281: `POST /payment-requests`
**Purpose:** Create a payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /payment-requests HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-282: `GET /payment-requests/{id}`
**Purpose:** Get a payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
GET /payment-requests/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-283: `PATCH /payment-requests/{id}`
**Purpose:** Update a pending payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
PATCH /payment-requests/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-284: `DELETE /payment-requests/{id}`
**Purpose:** Soft-delete a pending payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
DELETE /payment-requests/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-285: `POST /payment-requests/{id}/approve`
**Purpose:** Approve a payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /payment-requests/{id}/approve HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-286: `POST /payment-requests/{id}/reject`
**Purpose:** Reject a payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /payment-requests/{id}/reject HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-287: `POST /payment-requests/{id}/mark-paid`
**Purpose:** Mark an approved payment request as paid

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_PASS (API correctly rejected)** |
| Live HTTP | 401 |
| Live title | No Authorization header |
| Live notes | Correctly rejected |
| Assertion | PASS — rejection correct |

```http
POST /payment-requests/{id}/mark-paid HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

## Coverage
- APIs in OpenAPI: **287**
- FAIL sections: **287**
- Missing: **0**