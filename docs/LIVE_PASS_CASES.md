# LIVE PASS Cases — One Per API

**Base URL:** `https://kingfisherwings.onrender.com`
**Run ID:** 1784282902909
**When:** 2026-07-17T10:18:47.828Z
**OpenAPI APIs:** 441

Every OpenAPI operation appears exactly once. Live execution result is shown when available.

| # | Method | Path | Live result | HTTP |
|---|--------|------|-------------|------|
| 1 | GET | `/locale/defaults` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 2 | GET | `/locale/{countryCode}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 3 | GET | `/health` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 4 | POST | `/tenants` | EXECUTED_PASS | 201 |
| 5 | GET | `/tenants` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 6 | GET | `/tenants/statistics` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 7 | POST | `/tenants/sync-permissions` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 8 | POST | `/tenants/{id}/sync-permissions` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 9 | GET | `/tenants/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 10 | PATCH | `/tenants/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 11 | DELETE | `/tenants/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 12 | PATCH | `/tenants/{id}/restore` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 13 | PATCH | `/tenants/{id}/activate` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 14 | PATCH | `/tenants/{id}/deactivate` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 15 | GET | `/companies` | EXECUTED_PASS | 200 |
| 16 | POST | `/companies` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 17 | GET | `/companies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 18 | PATCH | `/companies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 19 | DELETE | `/companies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 20 | GET | `/users` | EXECUTED_PASS | 200 |
| 21 | POST | `/users` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 22 | GET | `/users/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 23 | PATCH | `/users/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 24 | DELETE | `/users/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 25 | PATCH | `/users/{id}/status` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 26 | POST | `/users/bulk` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 27 | POST | `/users/{id}/restore` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 28 | POST | `/users/me/change-password` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 29 | POST | `/users/{id}/admin-reset-password` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 30 | POST | `/users/{id}/force-logout` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 31 | POST | `/auth/login` | EXECUTED_PASS |  |
| 32 | POST | `/auth/tenant-login` | EXECUTED_PASS | 200 |
| 33 | POST | `/auth/super-admin/signup` | EXECUTED_PASS | 201 |
| 34 | POST | `/auth/super-admin/login` | EXECUTED_PASS |  |
| 35 | POST | `/auth/refresh` | EXECUTED_PASS | 200 |
| 36 | POST | `/auth/logout` | EXECUTED_FAIL | 401 |
| 37 | GET | `/auth/sessions` | EXECUTED_PASS | 200 |
| 38 | POST | `/auth/sessions/{sessionId}/revoke` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 39 | POST | `/auth/logout-all` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 40 | GET | `/auth/me` | EXECUTED_PASS | 200 |
| 41 | PATCH | `/auth/me` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 42 | POST | `/auth/change-password` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 43 | POST | `/auth/tenant/change-password` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 44 | POST | `/auth/invite` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 45 | POST | `/auth/accept-invite` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 46 | POST | `/auth/2fa/setup` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 47 | POST | `/auth/2fa/enable` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 48 | POST | `/auth/2fa/disable` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 49 | GET | `/masters/countries` | EXECUTED_PASS | 200 |
| 50 | POST | `/masters/countries` | EXECUTED_PASS | 201 |
| 51 | GET | `/masters/countries/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 52 | PATCH | `/masters/countries/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 53 | DELETE | `/masters/countries/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 54 | GET | `/masters/currencies` | EXECUTED_PASS | 200 |
| 55 | POST | `/masters/currencies` | EXECUTED_PASS | 201 |
| 56 | GET | `/masters/currencies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 57 | PATCH | `/masters/currencies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 58 | DELETE | `/masters/currencies/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 59 | GET | `/masters/exchange-rates` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 60 | POST | `/masters/exchange-rates` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 61 | GET | `/masters/exchange-rates/latest/{currencyId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 62 | GET | `/masters/ports` | EXECUTED_PASS | 200 |
| 63 | POST | `/masters/ports` | EXECUTED_PASS | 201 |
| 64 | GET | `/masters/ports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 65 | PATCH | `/masters/ports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 66 | DELETE | `/masters/ports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 67 | GET | `/masters/airports` | EXECUTED_PASS | 200 |
| 68 | POST | `/masters/airports` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 69 | GET | `/masters/airports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 70 | PATCH | `/masters/airports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 71 | DELETE | `/masters/airports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 72 | GET | `/masters/container-types` | EXECUTED_PASS | 200 |
| 73 | POST | `/masters/container-types` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 74 | GET | `/masters/container-types/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 75 | PATCH | `/masters/container-types/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 76 | DELETE | `/masters/container-types/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 77 | GET | `/masters/hs-codes` | EXECUTED_PASS | 200 |
| 78 | POST | `/masters/hs-codes` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 79 | GET | `/masters/hs-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 80 | PATCH | `/masters/hs-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 81 | DELETE | `/masters/hs-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 82 | GET | `/masters/airlines` | EXECUTED_PASS | 200 |
| 83 | POST | `/masters/airlines` | EXECUTED_PASS | 201 |
| 84 | GET | `/masters/airlines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 85 | PATCH | `/masters/airlines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 86 | DELETE | `/masters/airlines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 87 | GET | `/masters/shipping-lines` | EXECUTED_PASS | 200 |
| 88 | POST | `/masters/shipping-lines` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 89 | GET | `/masters/shipping-lines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 90 | PATCH | `/masters/shipping-lines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 91 | DELETE | `/masters/shipping-lines/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 92 | GET | `/masters/vessels` | EXECUTED_PASS | 200 |
| 93 | POST | `/masters/vessels` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 94 | GET | `/masters/vessels/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 95 | PATCH | `/masters/vessels/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 96 | DELETE | `/masters/vessels/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 97 | GET | `/vessels/{id}/schedules` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 98 | POST | `/vessels/{id}/schedules` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 99 | PATCH | `/vessels/{id}/schedules/{scheduleId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 100 | DELETE | `/vessels/{id}/schedules/{scheduleId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 101 | GET | `/masters/truckers` | EXECUTED_PASS | 200 |
| 102 | POST | `/masters/truckers` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 103 | GET | `/masters/truckers/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 104 | PATCH | `/masters/truckers/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 105 | DELETE | `/masters/truckers/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 106 | GET | `/masters/warehouses` | EXECUTED_PASS | 200 |
| 107 | POST | `/masters/warehouses` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 108 | GET | `/masters/warehouses/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 109 | PATCH | `/masters/warehouses/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 110 | DELETE | `/masters/warehouses/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 111 | GET | `/masters/charge-codes` | EXECUTED_PASS | 200 |
| 112 | POST | `/masters/charge-codes` | EXECUTED_PASS | 201 |
| 113 | GET | `/masters/charge-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 114 | PATCH | `/masters/charge-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 115 | DELETE | `/masters/charge-codes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 116 | GET | `/masters/banks` | EXECUTED_PASS | 200 |
| 117 | POST | `/masters/banks` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 118 | GET | `/masters/banks/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 119 | PATCH | `/masters/banks/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 120 | DELETE | `/masters/banks/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 121 | GET | `/masters/holidays` | EXECUTED_PASS | 200 |
| 122 | POST | `/masters/holidays` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 123 | GET | `/masters/holidays/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 124 | PATCH | `/masters/holidays/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 125 | DELETE | `/masters/holidays/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 126 | GET | `/masters/units-of-measure` | EXECUTED_PASS | 200 |
| 127 | POST | `/masters/units-of-measure` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 128 | GET | `/masters/units-of-measure/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 129 | PATCH | `/masters/units-of-measure/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 130 | DELETE | `/masters/units-of-measure/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 131 | GET | `/masters/tax-rates` | EXECUTED_PASS | 200 |
| 132 | POST | `/masters/tax-rates` | EXECUTED_PASS | 201 |
| 133 | GET | `/masters/tax-rates/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 134 | PATCH | `/masters/tax-rates/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 135 | DELETE | `/masters/tax-rates/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 136 | GET | `/masters/branches` | EXECUTED_PASS | 200 |
| 137 | POST | `/masters/branches` | EXECUTED_PASS | 201 |
| 138 | GET | `/masters/branches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 139 | PATCH | `/masters/branches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 140 | DELETE | `/masters/branches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 141 | GET | `/masters/departments` | EXECUTED_PASS | 200 |
| 142 | POST | `/masters/departments` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 143 | GET | `/masters/departments/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 144 | PATCH | `/masters/departments/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 145 | DELETE | `/masters/departments/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 146 | GET | `/masters/designations` | EXECUTED_PASS | 200 |
| 147 | POST | `/masters/designations` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 148 | GET | `/masters/designations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 149 | PATCH | `/masters/designations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 150 | DELETE | `/masters/designations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 151 | GET | `/parties` | EXECUTED_PASS | 200 |
| 152 | POST | `/parties` | EXECUTED_PASS | 201 |
| 153 | GET | `/parties/export` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 154 | GET | `/parties/{id}/history` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 155 | GET | `/parties/{id}` | EXECUTED_PASS | 200 |
| 156 | PATCH | `/parties/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 157 | DELETE | `/parties/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 158 | POST | `/parties/import` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 159 | PATCH | `/parties/{id}/credit-status` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 160 | POST | `/parties/{id}/contacts` | EXECUTED_PASS | 201 |
| 161 | PATCH | `/parties/{id}/contacts/{contactId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 162 | DELETE | `/parties/{id}/contacts/{contactId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 163 | POST | `/parties/{id}/addresses` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 164 | PATCH | `/parties/{id}/addresses/{addressId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 165 | DELETE | `/parties/{id}/addresses/{addressId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 166 | GET | `/organization/profile` | EXECUTED_PASS | 200 |
| 167 | PATCH | `/organization/profile` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 168 | GET | `/organization/bank-accounts` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 169 | POST | `/organization/bank-accounts` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 170 | GET | `/organization/bank-accounts/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 171 | PATCH | `/organization/bank-accounts/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 172 | DELETE | `/organization/bank-accounts/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 173 | GET | `/organization/number-formats` | EXECUTED_PASS | 200 |
| 174 | POST | `/organization/number-formats` | EXECUTED_PASS | 201 |
| 175 | GET | `/organization/number-formats/{documentType}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 176 | PATCH | `/organization/number-formats/{documentType}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 177 | GET | `/organization/number-formats/{documentType}/preview` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 178 | GET | `/quotations/tariffs` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 179 | POST | `/quotations/tariffs` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 180 | GET | `/quotations/tariffs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 181 | PATCH | `/quotations/tariffs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 182 | DELETE | `/quotations/tariffs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 183 | GET | `/quotations/zip-distances` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 184 | POST | `/quotations/zip-distances` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 185 | GET | `/quotations/zip-distances/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 186 | PATCH | `/quotations/zip-distances/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 187 | DELETE | `/quotations/zip-distances/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 188 | GET | `/quotations` | EXECUTED_PASS | 200 |
| 189 | POST | `/quotations` | EXECUTED_PASS | 201 |
| 190 | GET | `/quotations/reports/chargewise` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 191 | GET | `/quotations/reports/analytics` | EXECUTED_PASS | 200 |
| 192 | GET | `/quotations/reports/analytics/conversion` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 193 | GET | `/quotations/reports/analytics/lost-reasons` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 194 | GET | `/quotations/reports/analytics/response-time` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 195 | POST | `/quotations/online-quote` | EXECUTED_PASS |  |
| 196 | POST | `/quotations/expire-due` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 197 | GET | `/quotations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 198 | PATCH | `/quotations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 199 | DELETE | `/quotations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 200 | GET | `/quotations/{id}/revisions` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 201 | POST | `/quotations/{id}/lines` | EXECUTED_PASS | 201 |
| 202 | POST | `/quotations/{id}/apply-tariff` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 203 | PATCH | `/quotations/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 204 | DELETE | `/quotations/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 205 | POST | `/quotations/{id}/submit` | EXECUTED_PASS | 201 |
| 206 | POST | `/quotations/{id}/approve` | EXECUTED_PASS | 201 |
| 207 | POST | `/quotations/{id}/reject` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 208 | POST | `/quotations/{id}/send` | EXECUTED_PASS | 201 |
| 209 | POST | `/quotations/{id}/mark-won` | EXECUTED_PASS | 201 |
| 210 | POST | `/quotations/{id}/mark-lost` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 211 | POST | `/quotations/{id}/duplicate` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 212 | POST | `/quotations/{id}/convert-to-job` | EXECUTED_PASS | 201 |
| 213 | POST | `/quotations/{id}/archive` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 214 | POST | `/quotations/{id}/expire` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 215 | POST | `/quotations/{id}/pdf` | EXECUTED_FAIL |  |
| 216 | GET | `/quotations/{id}/pdf` | EXECUTED_PASS | 200 |
| 217 | GET | `/quotations/{id}/pdf/status` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 218 | POST | `/quotations/{id}/send-email` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 219 | GET | `/jobs` | EXECUTED_PASS | 200 |
| 220 | POST | `/jobs` | EXECUTED_PASS | 201 |
| 221 | GET | `/jobs/{id}` | EXECUTED_PASS | 200 |
| 222 | PATCH | `/jobs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 223 | DELETE | `/jobs/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 224 | GET | `/jobs/{id}/house-jobs` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 225 | GET | `/jobs/{id}/milestones` | EXECUTED_PASS | 200 |
| 226 | POST | `/jobs/{id}/milestones` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 227 | GET | `/jobs/{id}/pnl` | EXECUTED_PASS | 200 |
| 228 | GET | `/jobs/{id}/notes` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 229 | POST | `/jobs/{id}/notes` | EXECUTED_PASS | 201 |
| 230 | GET | `/jobs/{id}/documents` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 231 | POST | `/jobs/{id}/documents` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 232 | GET | `/jobs/{id}/containers` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 233 | POST | `/jobs/{id}/containers` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 234 | GET | `/jobs/{id}/containers/fill` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 235 | GET | `/jobs/{id}/containers/{containerId}/fill` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 236 | GET | `/jobs/{id}/cutoffs` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 237 | GET | `/jobs/{id}/cargo` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 238 | POST | `/jobs/{id}/cargo` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 239 | GET | `/jobs/{id}/bills-of-lading` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 240 | POST | `/jobs/{id}/bills-of-lading` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 241 | GET | `/jobs/{id}/stuffing-records` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 242 | POST | `/jobs/{id}/stuffing-records` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 243 | POST | `/jobs/{id}/close` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 244 | POST | `/jobs/{id}/cancel` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 245 | PATCH | `/jobs/{id}/air-details` | EXECUTED_PASS | 200 |
| 246 | PATCH | `/jobs/{id}/sea-fcl-details` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 247 | POST | `/jobs/{id}/sea-fcl-details/si-submission` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 248 | POST | `/jobs/{id}/sea-fcl-details/vgm-submission` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 249 | PATCH | `/jobs/{id}/milestones/{milestoneId}` | EXECUTED_PASS | 200 |
| 250 | POST | `/jobs/{id}/charges` | EXECUTED_PASS | 201 |
| 251 | PATCH | `/jobs/{id}/charges/{chargeId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 252 | DELETE | `/jobs/{id}/charges/{chargeId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 253 | POST | `/jobs/{id}/prorate-cost/{chargeCodeId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 254 | PATCH | `/jobs/{id}/notes/{noteId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 255 | DELETE | `/jobs/{id}/notes/{noteId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 256 | PATCH | `/jobs/{id}/documents/{documentId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 257 | DELETE | `/jobs/{id}/documents/{documentId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 258 | POST | `/jobs/{id}/documents/{documentId}/finalize` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 259 | GET | `/jobs/{id}/documents/generation-status` | EXECUTED_PASS | 200 |
| 260 | POST | `/jobs/{id}/documents/hawb` | EXECUTED_FAIL | 500 |
| 261 | POST | `/jobs/{id}/documents/mawb` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 262 | POST | `/jobs/{id}/documents/pre-alert` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 263 | POST | `/jobs/{id}/documents/cargo-manifest` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 264 | POST | `/jobs/{id}/documents/hbl` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 265 | POST | `/jobs/{id}/documents/hbl-express-release` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 266 | POST | `/jobs/{id}/documents/mbl` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 267 | POST | `/jobs/{id}/documents/fiata-bl` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 268 | POST | `/jobs/{id}/documents/rider-bl` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 269 | POST | `/jobs/{id}/documents/switch-bl` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 270 | POST | `/jobs/{id}/documents/proxy-bl` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 271 | POST | `/jobs/{id}/documents/back-to-back-bl` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 272 | POST | `/jobs/{id}/documents/surrender-notice` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 273 | POST | `/jobs/{id}/documents/si` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 274 | POST | `/jobs/{id}/documents/stuffing-report` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 275 | POST | `/jobs/{id}/documents/sailing-confirmation` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 276 | POST | `/jobs/{id}/documents/transhipment-confirmation` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 277 | POST | `/jobs/{id}/documents/freight-manifest` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 278 | POST | `/jobs/{id}/documents/job-card` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 279 | POST | `/jobs/{id}/documents/job-pnl` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 280 | POST | `/jobs/{id}/documents/proforma-invoice` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 281 | POST | `/jobs/{id}/pre-alert/send` | EXECUTED_PASS | 201 |
| 282 | POST | `/jobs/{id}/pre-alert/schedule` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 283 | POST | `/jobs/{id}/whatsapp/status` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 284 | GET | `/jobs/{id}/sub-jobs` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 285 | POST | `/jobs/{id}/sub-jobs` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 286 | POST | `/jobs/{id}/payment-requests` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 287 | POST | `/jobs/{id}/documents/e-awb` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 288 | POST | `/jobs/{id}/documents/barcode-label` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 289 | POST | `/jobs/{id}/documents/consignee-label` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 290 | POST | `/jobs/{id}/documents/job-costing` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 291 | POST | `/jobs/{id}/documents/freight-certificate` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 292 | PATCH | `/jobs/{id}/containers/{containerId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 293 | DELETE | `/jobs/{id}/containers/{containerId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 294 | POST | `/jobs/{id}/containers/{containerId}/cargo` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 295 | POST | `/jobs/{id}/containers/{containerId}/split` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 296 | PATCH | `/jobs/{id}/cargo/{cargoId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 297 | DELETE | `/jobs/{id}/cargo/{cargoId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 298 | PATCH | `/jobs/{id}/bills-of-lading/{blId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 299 | DELETE | `/jobs/{id}/bills-of-lading/{blId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 300 | PATCH | `/jobs/{id}/stuffing-records/{recordId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 301 | DELETE | `/jobs/{id}/stuffing-records/{recordId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 302 | GET | `/jobs/{id}/free-days` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 303 | POST | `/jobs/{id}/free-days` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 304 | POST | `/jobs/{id}/free-days/recalculate` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 305 | GET | `/jobs/{id}/deposits` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 306 | POST | `/jobs/{id}/deposits` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 307 | PATCH | `/jobs/{id}/deposits/{depositId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 308 | DELETE | `/jobs/{id}/deposits/{depositId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 309 | PATCH | `/jobs/{id}/customs-status` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 310 | POST | `/jobs/{id}/containers/{containerId}/return` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 311 | GET | `/jobs/{id}/part-deliveries` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 312 | POST | `/jobs/{id}/part-deliveries` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 313 | GET | `/jobs/{id}/pods` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 314 | POST | `/jobs/{id}/pods` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 315 | GET | `/jobs/{id}/damage-reports` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 316 | POST | `/jobs/{id}/damage-reports` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 317 | POST | `/jobs/{id}/transhipment-link` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 318 | POST | `/jobs/{id}/cfs-storage/calculate` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 319 | POST | `/jobs/{id}/documents/pre-can` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 320 | POST | `/jobs/{id}/documents/can` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 321 | POST | `/jobs/{id}/documents/exchange-letter` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 322 | POST | `/jobs/{id}/documents/undertake-letter` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 323 | POST | `/jobs/{id}/documents/delivery-order` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 324 | POST | `/jobs/{id}/documents/transport-request` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 325 | POST | `/jobs/{id}/documents/shipping-advice` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 326 | POST | `/jobs/{id}/documents/proof-of-delivery` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 327 | GET | `/awb-stock/batches` | EXECUTED_PASS | 200 |
| 328 | POST | `/awb-stock/batches` | EXECUTED_PASS | 201 |
| 329 | GET | `/awb-stock/reports/low-stock` | EXECUTED_PASS | 200 |
| 330 | GET | `/awb-stock/allocations` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 331 | GET | `/awb-stock/batches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 332 | PATCH | `/awb-stock/batches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 333 | DELETE | `/awb-stock/batches/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 334 | POST | `/awb-stock/batches/{id}/allocate` | EXECUTED_PASS | 201 |
| 335 | POST | `/awb-stock/batches/{id}/transfer-branch` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 336 | POST | `/awb-stock/allocations/{id}/void` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 337 | POST | `/awb-stock/allocations/{id}/mark-used` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 338 | GET | `/search` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 339 | GET | `/files/{tenantId}/{filename}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 340 | GET | `/invoices` | EXECUTED_PASS | 200 |
| 341 | POST | `/invoices` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 342 | GET | `/invoices/reports/overdue` | EXECUTED_PASS | 200 |
| 343 | GET | `/invoices/{id}` | EXECUTED_PASS | 200 |
| 344 | PATCH | `/invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 345 | DELETE | `/invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 346 | POST | `/invoices/from-job/{jobId}` | EXECUTED_PASS | 201 |
| 347 | POST | `/invoices/{id}/lines` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 348 | PATCH | `/invoices/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 349 | DELETE | `/invoices/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 350 | POST | `/invoices/{id}/post` | EXECUTED_PASS | 201 |
| 351 | POST | `/invoices/{id}/send` | EXECUTED_FAIL | 500 |
| 352 | POST | `/invoices/{id}/pdf` | EXECUTED_FAIL | 500 |
| 353 | GET | `/invoices/{id}/pdf` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 354 | POST | `/invoices/{id}/cancel` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 355 | GET | `/credit-notes` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 356 | POST | `/credit-notes` | EXECUTED_FAIL | 500 |
| 357 | GET | `/credit-notes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 358 | POST | `/credit-notes/{id}/post` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 359 | GET | `/debit-notes` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 360 | POST | `/debit-notes` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 361 | GET | `/debit-notes/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 362 | POST | `/debit-notes/{id}/post` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 363 | GET | `/purchase-invoices` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 364 | POST | `/purchase-invoices` | EXECUTED_FAIL | 500 |
| 365 | GET | `/purchase-invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 366 | PATCH | `/purchase-invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 367 | DELETE | `/purchase-invoices/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 368 | POST | `/purchase-invoices/{id}/post` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 369 | GET | `/payment-requests` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 370 | POST | `/payment-requests` | EXECUTED_PASS | 201 |
| 371 | GET | `/payment-requests/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 372 | PATCH | `/payment-requests/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 373 | DELETE | `/payment-requests/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 374 | POST | `/payment-requests/{id}/approve` | EXECUTED_PASS | 201 |
| 375 | POST | `/payment-requests/{id}/reject` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 376 | POST | `/payment-requests/{id}/mark-paid` | EXECUTED_PASS | 201 |
| 377 | GET | `/gl/accounts` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 378 | POST | `/gl/accounts` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 379 | GET | `/gl/accounts/tree` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 380 | GET | `/gl/accounts/reports/trial-balance` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 381 | POST | `/gl/accounts/seed-defaults` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 382 | GET | `/gl/accounts/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 383 | PATCH | `/gl/accounts/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 384 | DELETE | `/gl/accounts/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 385 | GET | `/gl/accounts/{id}/ledger` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 386 | GET | `/gl/vouchers` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 387 | POST | `/gl/vouchers` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 388 | GET | `/gl/vouchers/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 389 | PATCH | `/gl/vouchers/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 390 | DELETE | `/gl/vouchers/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 391 | POST | `/gl/vouchers/{id}/lines` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 392 | PATCH | `/gl/vouchers/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 393 | DELETE | `/gl/vouchers/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 394 | POST | `/gl/vouchers/{id}/post` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 395 | POST | `/gl/vouchers/{id}/reverse` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 396 | GET | `/gl/payments` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 397 | POST | `/gl/payments` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 398 | GET | `/gl/payments/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 399 | PATCH | `/gl/payments/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 400 | DELETE | `/gl/payments/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 401 | POST | `/gl/payments/{id}/allocations` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 402 | DELETE | `/gl/payments/{id}/allocations/{allocationId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 403 | POST | `/gl/payments/{id}/post` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 404 | POST | `/gl/payments/{id}/cancel` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 405 | GET | `/gl/ar/aging` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 406 | GET | `/gl/ap/aging` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 407 | GET | `/gl/ar/statement/{partyId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 408 | GET | `/gl/ap/statement/{partyId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 409 | GET | `/gl/cheques` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 410 | POST | `/gl/cheques` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 411 | GET | `/gl/cheques/reports/pdc-due` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 412 | GET | `/gl/cheques/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 413 | PATCH | `/gl/cheques/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 414 | POST | `/gl/cheques/{id}/deposit` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 415 | POST | `/gl/cheques/{id}/clear` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 416 | POST | `/gl/cheques/{id}/bounce` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 417 | POST | `/gl/cheques/{id}/cancel` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 418 | POST | `/gl/bank-transfers` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 419 | GET | `/gl/bank-reconciliations` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 420 | POST | `/gl/bank-reconciliations` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 421 | GET | `/gl/bank-reconciliations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 422 | PATCH | `/gl/bank-reconciliations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 423 | DELETE | `/gl/bank-reconciliations/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 424 | GET | `/gl/bank-reconciliations/{id}/unmatched` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 425 | POST | `/gl/bank-reconciliations/{id}/lines` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 426 | PATCH | `/gl/bank-reconciliations/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 427 | DELETE | `/gl/bank-reconciliations/{id}/lines/{lineId}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 428 | POST | `/gl/bank-reconciliations/{id}/complete` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 429 | GET | `/gl/reports/trial-balance` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 430 | GET | `/gl/reports/balance-sheet` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 431 | GET | `/gl/reports/profit-and-loss` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 432 | GET | `/gl/reports/cash-flow` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 433 | GET | `/gl/reports/vat-return` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 434 | GET | `/gl/mis/dashboard` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 435 | GET | `/gl/mis/profitability` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 436 | GET | `/gl/mis/operational` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 437 | GET | `/gl/saved-reports` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 438 | POST | `/gl/saved-reports` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 439 | GET | `/gl/saved-reports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 440 | PATCH | `/gl/saved-reports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |
| 441 | DELETE | `/gl/saved-reports/{id}` | DEFINED_NOT_HIT_IN_HAPPY_PATH |  |

## Per-API PASS details

### PASS-001: `GET /locale/defaults`
**Purpose:** Optional country → suggested dial / currency / timezone

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Locale |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-002: `GET /locale/{countryCode}`
**Purpose:** Locale suggestions for an ISO country (still optional to use)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Locale |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-003: `GET /health`

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

### PASS-004: `POST /tenants`
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

### PASS-005: `GET /tenants`
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

### PASS-006: `GET /tenants/statistics`
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

### PASS-007: `POST /tenants/sync-permissions`
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

### PASS-008: `POST /tenants/{id}/sync-permissions`
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

### PASS-009: `GET /tenants/{id}`
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

### PASS-010: `PATCH /tenants/{id}`
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

### PASS-011: `DELETE /tenants/{id}`
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

### PASS-012: `PATCH /tenants/{id}/restore`
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

### PASS-013: `PATCH /tenants/{id}/activate`
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

### PASS-014: `PATCH /tenants/{id}/deactivate`
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

### PASS-015: `GET /companies`
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

### PASS-016: `POST /companies`
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

### PASS-017: `GET /companies/{id}`
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

### PASS-018: `PATCH /companies/{id}`
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

### PASS-019: `DELETE /companies/{id}`
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

### PASS-020: `GET /users`
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

### PASS-021: `POST /users`
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

### PASS-022: `GET /users/{id}`
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

### PASS-023: `PATCH /users/{id}`
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

### PASS-024: `DELETE /users/{id}`
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

### PASS-025: `PATCH /users/{id}/status`
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

### PASS-026: `POST /users/bulk`
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

### PASS-027: `POST /users/{id}/restore`
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

### PASS-028: `POST /users/me/change-password`
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

### PASS-029: `POST /users/{id}/admin-reset-password`
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

### PASS-030: `POST /users/{id}/force-logout`
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

### PASS-031: `POST /auth/login`
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

### PASS-032: `POST /auth/tenant-login`
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

### PASS-033: `POST /auth/super-admin/signup`
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

### PASS-034: `POST /auth/super-admin/login`
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

### PASS-035: `POST /auth/refresh`
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

### PASS-036: `POST /auth/logout`
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

### PASS-037: `GET /auth/sessions`
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

### PASS-038: `POST /auth/sessions/{sessionId}/revoke`
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

### PASS-039: `POST /auth/logout-all`
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

### PASS-040: `GET /auth/me`
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

### PASS-041: `PATCH /auth/me`
**Purpose:** Update own profile after login (preferred country, phone, locale)

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

### PASS-042: `POST /auth/change-password`
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

### PASS-043: `POST /auth/tenant/change-password`
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

### PASS-044: `POST /auth/invite`
**Purpose:** Send invite email with accept token for an INVITED user

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

### PASS-045: `POST /auth/accept-invite`
**Purpose:** Accept invite token and set password

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

### PASS-046: `POST /auth/2fa/setup`
**Purpose:** Generate TOTP secret + QR for the current user

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

### PASS-047: `POST /auth/2fa/enable`
**Purpose:** Enable 2FA after verifying a TOTP code from the authenticator app

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

### PASS-048: `POST /auth/2fa/disable`
**Purpose:** Disable 2FA (password + optional TOTP/backup code)

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

### PASS-049: `GET /masters/countries`
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

### PASS-050: `POST /masters/countries`
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

### PASS-051: `GET /masters/countries/{id}`
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

### PASS-052: `PATCH /masters/countries/{id}`
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

### PASS-053: `DELETE /masters/countries/{id}`
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

### PASS-054: `GET /masters/currencies`
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

### PASS-055: `POST /masters/currencies`
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

### PASS-056: `GET /masters/currencies/{id}`
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

### PASS-057: `PATCH /masters/currencies/{id}`
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

### PASS-058: `DELETE /masters/currencies/{id}`
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

### PASS-059: `GET /masters/exchange-rates`
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

### PASS-060: `POST /masters/exchange-rates`
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

### PASS-061: `GET /masters/exchange-rates/latest/{currencyId}`
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

### PASS-062: `GET /masters/ports`
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

### PASS-063: `POST /masters/ports`
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

### PASS-064: `GET /masters/ports/{id}`
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

### PASS-065: `PATCH /masters/ports/{id}`
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

### PASS-066: `DELETE /masters/ports/{id}`
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

### PASS-067: `GET /masters/airports`
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

### PASS-068: `POST /masters/airports`
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

### PASS-069: `GET /masters/airports/{id}`
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

### PASS-070: `PATCH /masters/airports/{id}`
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

### PASS-071: `DELETE /masters/airports/{id}`
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

### PASS-072: `GET /masters/container-types`
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

### PASS-073: `POST /masters/container-types`
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

### PASS-074: `GET /masters/container-types/{id}`
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

### PASS-075: `PATCH /masters/container-types/{id}`
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

### PASS-076: `DELETE /masters/container-types/{id}`
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

### PASS-077: `GET /masters/hs-codes`
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

### PASS-078: `POST /masters/hs-codes`
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

### PASS-079: `GET /masters/hs-codes/{id}`
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

### PASS-080: `PATCH /masters/hs-codes/{id}`
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

### PASS-081: `DELETE /masters/hs-codes/{id}`
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

### PASS-082: `GET /masters/airlines`
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

### PASS-083: `POST /masters/airlines`
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

### PASS-084: `GET /masters/airlines/{id}`
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

### PASS-085: `PATCH /masters/airlines/{id}`
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

### PASS-086: `DELETE /masters/airlines/{id}`
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

### PASS-087: `GET /masters/shipping-lines`
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

### PASS-088: `POST /masters/shipping-lines`
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

### PASS-089: `GET /masters/shipping-lines/{id}`
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

### PASS-090: `PATCH /masters/shipping-lines/{id}`
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

### PASS-091: `DELETE /masters/shipping-lines/{id}`
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

### PASS-092: `GET /masters/vessels`
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

### PASS-093: `POST /masters/vessels`
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

### PASS-094: `GET /masters/vessels/{id}`
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

### PASS-095: `PATCH /masters/vessels/{id}`
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

### PASS-096: `DELETE /masters/vessels/{id}`
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

### PASS-097: `GET /vessels/{id}/schedules`
**Purpose:** List vessel voyage schedules (filter by ETD/ETA)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Vessels — Schedules |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-098: `POST /vessels/{id}/schedules`
**Purpose:** Create a vessel voyage schedule

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Vessels — Schedules |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-099: `PATCH /vessels/{id}/schedules/{scheduleId}`
**Purpose:** Update a vessel voyage schedule

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Vessels — Schedules |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-100: `DELETE /vessels/{id}/schedules/{scheduleId}`
**Purpose:** Soft-delete a vessel voyage schedule

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Vessels — Schedules |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-101: `GET /masters/truckers`
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

### PASS-102: `POST /masters/truckers`
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

### PASS-103: `GET /masters/truckers/{id}`
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

### PASS-104: `PATCH /masters/truckers/{id}`
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

### PASS-105: `DELETE /masters/truckers/{id}`
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

### PASS-106: `GET /masters/warehouses`
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

### PASS-107: `POST /masters/warehouses`
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

### PASS-108: `GET /masters/warehouses/{id}`
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

### PASS-109: `PATCH /masters/warehouses/{id}`
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

### PASS-110: `DELETE /masters/warehouses/{id}`
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

### PASS-111: `GET /masters/charge-codes`
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

### PASS-112: `POST /masters/charge-codes`
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

### PASS-113: `GET /masters/charge-codes/{id}`
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

### PASS-114: `PATCH /masters/charge-codes/{id}`
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

### PASS-115: `DELETE /masters/charge-codes/{id}`
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

### PASS-116: `GET /masters/banks`
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

### PASS-117: `POST /masters/banks`
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

### PASS-118: `GET /masters/banks/{id}`
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

### PASS-119: `PATCH /masters/banks/{id}`
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

### PASS-120: `DELETE /masters/banks/{id}`
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

### PASS-121: `GET /masters/holidays`
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

### PASS-122: `POST /masters/holidays`
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

### PASS-123: `GET /masters/holidays/{id}`
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

### PASS-124: `PATCH /masters/holidays/{id}`
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

### PASS-125: `DELETE /masters/holidays/{id}`
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

### PASS-126: `GET /masters/units-of-measure`
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

### PASS-127: `POST /masters/units-of-measure`
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

### PASS-128: `GET /masters/units-of-measure/{id}`
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

### PASS-129: `PATCH /masters/units-of-measure/{id}`
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

### PASS-130: `DELETE /masters/units-of-measure/{id}`
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

### PASS-131: `GET /masters/tax-rates`
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

### PASS-132: `POST /masters/tax-rates`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Masters — TaxRates |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **EXECUTED_PASS** |
| Live HTTP | 201 |
| Live title | Create tax rate VAT5 |
| Live notes | OK |

---

### PASS-133: `GET /masters/tax-rates/{id}`
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

### PASS-134: `PATCH /masters/tax-rates/{id}`
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

### PASS-135: `DELETE /masters/tax-rates/{id}`
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

### PASS-136: `GET /masters/branches`
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

### PASS-137: `POST /masters/branches`
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

### PASS-138: `GET /masters/branches/{id}`
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

### PASS-139: `PATCH /masters/branches/{id}`
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

### PASS-140: `DELETE /masters/branches/{id}`
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

### PASS-141: `GET /masters/departments`
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

### PASS-142: `POST /masters/departments`
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

### PASS-143: `GET /masters/departments/{id}`
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

### PASS-144: `PATCH /masters/departments/{id}`
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

### PASS-145: `DELETE /masters/departments/{id}`
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

### PASS-146: `GET /masters/designations`
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

### PASS-147: `POST /masters/designations`
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

### PASS-148: `GET /masters/designations/{id}`
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

### PASS-149: `PATCH /masters/designations/{id}`
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

### PASS-150: `DELETE /masters/designations/{id}`
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

### PASS-151: `GET /parties`
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

### PASS-152: `POST /parties`
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

### PASS-153: `GET /parties/export`
**Purpose:** Export parties as CSV

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

### PASS-154: `GET /parties/{id}/history`
**Purpose:** Party transaction history — jobs, quotations, invoices, payment requests, audit trail

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

### PASS-155: `GET /parties/{id}`
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

### PASS-156: `PATCH /parties/{id}`
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

### PASS-157: `DELETE /parties/{id}`
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

### PASS-158: `POST /parties/import`
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

### PASS-159: `PATCH /parties/{id}/credit-status`
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

### PASS-160: `POST /parties/{id}/contacts`
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

### PASS-161: `PATCH /parties/{id}/contacts/{contactId}`
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

### PASS-162: `DELETE /parties/{id}/contacts/{contactId}`
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

### PASS-163: `POST /parties/{id}/addresses`
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

### PASS-164: `PATCH /parties/{id}/addresses/{addressId}`
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

### PASS-165: `DELETE /parties/{id}/addresses/{addressId}`
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

### PASS-166: `GET /organization/profile`
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

### PASS-167: `PATCH /organization/profile`
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

### PASS-168: `GET /organization/bank-accounts`
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

### PASS-169: `POST /organization/bank-accounts`
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

### PASS-170: `GET /organization/bank-accounts/{id}`
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

### PASS-171: `PATCH /organization/bank-accounts/{id}`
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

### PASS-172: `DELETE /organization/bank-accounts/{id}`
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

### PASS-173: `GET /organization/number-formats`
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

### PASS-174: `POST /organization/number-formats`
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

### PASS-175: `GET /organization/number-formats/{documentType}`
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

### PASS-176: `PATCH /organization/number-formats/{documentType}`
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

### PASS-177: `GET /organization/number-formats/{documentType}/preview`
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

### PASS-178: `GET /quotations/tariffs`
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

### PASS-179: `POST /quotations/tariffs`
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

### PASS-180: `GET /quotations/tariffs/{id}`
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

### PASS-181: `PATCH /quotations/tariffs/{id}`
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

### PASS-182: `DELETE /quotations/tariffs/{id}`
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

### PASS-183: `GET /quotations/zip-distances`
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

### PASS-184: `POST /quotations/zip-distances`
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

### PASS-185: `GET /quotations/zip-distances/{id}`
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

### PASS-186: `PATCH /quotations/zip-distances/{id}`
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

### PASS-187: `DELETE /quotations/zip-distances/{id}`
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

### PASS-188: `GET /quotations`
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

### PASS-189: `POST /quotations`
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

### PASS-190: `GET /quotations/reports/chargewise`
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

### PASS-191: `GET /quotations/reports/analytics`
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

### PASS-192: `GET /quotations/reports/analytics/conversion`
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

### PASS-193: `GET /quotations/reports/analytics/lost-reasons`
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

### PASS-194: `GET /quotations/reports/analytics/response-time`
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

### PASS-195: `POST /quotations/online-quote`
**Purpose:** Public online quote widget — no auth required (Ch.7.5)

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

### PASS-196: `POST /quotations/expire-due`
**Purpose:** Batch-expire quotations past valid_until (cron / internal only)

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

### PASS-197: `GET /quotations/{id}`
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

### PASS-198: `PATCH /quotations/{id}`
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

### PASS-199: `DELETE /quotations/{id}`
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

### PASS-200: `GET /quotations/{id}/revisions`
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

### PASS-201: `POST /quotations/{id}/lines`
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

### PASS-202: `POST /quotations/{id}/apply-tariff`
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

### PASS-203: `PATCH /quotations/{id}/lines/{lineId}`
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

### PASS-204: `DELETE /quotations/{id}/lines/{lineId}`
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

### PASS-205: `POST /quotations/{id}/submit`
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

### PASS-206: `POST /quotations/{id}/approve`
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

### PASS-207: `POST /quotations/{id}/reject`
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

### PASS-208: `POST /quotations/{id}/send`
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

### PASS-209: `POST /quotations/{id}/mark-won`
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

### PASS-210: `POST /quotations/{id}/mark-lost`
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

### PASS-211: `POST /quotations/{id}/duplicate`
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

### PASS-212: `POST /quotations/{id}/convert-to-job`
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

### PASS-213: `POST /quotations/{id}/archive`
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

### PASS-214: `POST /quotations/{id}/expire`
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

### PASS-215: `POST /quotations/{id}/pdf`
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

### PASS-216: `GET /quotations/{id}/pdf`
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

### PASS-217: `GET /quotations/{id}/pdf/status`
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

### PASS-218: `POST /quotations/{id}/send-email`
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

### PASS-219: `GET /jobs`
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

### PASS-220: `POST /jobs`
**Purpose:** Create a job (booking). AIR_EXPORT auto-seeds 15 milestones; SEA_FCL_EXPORT auto-seeds 16 FCL milestones + sea_fcl_details. Set parent_job_id for a HOUSE job.

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

### PASS-221: `GET /jobs/{id}`
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

### PASS-222: `PATCH /jobs/{id}`
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

### PASS-223: `DELETE /jobs/{id}`
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

### PASS-224: `GET /jobs/{id}/house-jobs`
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

### PASS-225: `GET /jobs/{id}/milestones`
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

### PASS-226: `POST /jobs/{id}/milestones`
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

### PASS-227: `GET /jobs/{id}/pnl`
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

### PASS-228: `GET /jobs/{id}/notes`
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

### PASS-229: `POST /jobs/{id}/notes`
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

### PASS-230: `GET /jobs/{id}/documents`
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

### PASS-231: `POST /jobs/{id}/documents`
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

### PASS-232: `GET /jobs/{id}/containers`
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

### PASS-233: `POST /jobs/{id}/containers`
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

### PASS-234: `GET /jobs/{id}/containers/fill`
**Purpose:** Container fill indicators — weight % and CBM % for all containers

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

### PASS-235: `GET /jobs/{id}/containers/{containerId}/fill`
**Purpose:** Container fill indicator for one container

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

### PASS-236: `GET /jobs/{id}/cutoffs`
**Purpose:** SI / VGM / CY cutoff traffic-light status (green / amber ≤24h / red past)

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

### PASS-237: `GET /jobs/{id}/cargo`
**Purpose:** List FCL cargo lines on a job

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

### PASS-238: `POST /jobs/{id}/cargo`
**Purpose:** Add an FCL cargo line (optionally assigned to a container)

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

### PASS-239: `GET /jobs/{id}/bills-of-lading`
**Purpose:** List bills of lading on a Sea FCL job

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

### PASS-240: `POST /jobs/{id}/bills-of-lading`
**Purpose:** Create a bill of lading data record (PDF variants are Week 8)

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

### PASS-241: `GET /jobs/{id}/stuffing-records`
**Purpose:** List stuffing records on a Sea FCL job

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

### PASS-242: `POST /jobs/{id}/stuffing-records`
**Purpose:** Create a stuffing record and mark STUFFING_COMPLETED

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

### PASS-243: `POST /jobs/{id}/close`
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

### PASS-244: `POST /jobs/{id}/cancel`
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

### PASS-245: `PATCH /jobs/{id}/air-details`
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

### PASS-246: `PATCH /jobs/{id}/sea-fcl-details`
**Purpose:** Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs, VGM/SI)

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

### PASS-247: `POST /jobs/{id}/sea-fcl-details/si-submission`
**Purpose:** Record SI submission (date + version) and mark SI_SUBMITTED milestone

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

### PASS-248: `POST /jobs/{id}/sea-fcl-details/vgm-submission`
**Purpose:** Record VGM submission (date + SM1/SM2) and mark VGM_SUBMITTED milestone

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

### PASS-249: `PATCH /jobs/{id}/milestones/{milestoneId}`
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

### PASS-250: `POST /jobs/{id}/charges`
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

### PASS-251: `PATCH /jobs/{id}/charges/{chargeId}`
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

### PASS-252: `DELETE /jobs/{id}/charges/{chargeId}`
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

### PASS-253: `POST /jobs/{id}/prorate-cost/{chargeCodeId}`
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

### PASS-254: `PATCH /jobs/{id}/notes/{noteId}`
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

### PASS-255: `DELETE /jobs/{id}/notes/{noteId}`
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

### PASS-256: `PATCH /jobs/{id}/documents/{documentId}`
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

### PASS-257: `DELETE /jobs/{id}/documents/{documentId}`
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

### PASS-258: `POST /jobs/{id}/documents/{documentId}/finalize`
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

### PASS-259: `GET /jobs/{id}/documents/generation-status`
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

### PASS-260: `POST /jobs/{id}/documents/hawb`
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

### PASS-261: `POST /jobs/{id}/documents/mawb`
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

### PASS-262: `POST /jobs/{id}/documents/pre-alert`
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

### PASS-263: `POST /jobs/{id}/documents/cargo-manifest`
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

### PASS-264: `POST /jobs/{id}/documents/hbl`
**Purpose:** Queue HBL draft/original PDF (layout_variant: STANDARD | LAYOUT_A | LAYOUT_B)

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

### PASS-265: `POST /jobs/{id}/documents/hbl-express-release`
**Purpose:** Queue Non-Negotiable HBL Express/Telex Release PDF

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

### PASS-266: `POST /jobs/{id}/documents/mbl`
**Purpose:** Queue Master BL / OBL PDF

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

### PASS-267: `POST /jobs/{id}/documents/fiata-bl`
**Purpose:** Queue FIATA FBL PDF

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

### PASS-268: `POST /jobs/{id}/documents/rider-bl`
**Purpose:** Queue Rider/Addendum to BL PDF (pass rider_terms)

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

### PASS-269: `POST /jobs/{id}/documents/switch-bl`
**Purpose:** Queue Switch BL PDF (switched_from_bl_number + switch consignee/notify)

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

### PASS-270: `POST /jobs/{id}/documents/proxy-bl`
**Purpose:** Queue Proxy BL PDF (proxy_forwarder_name / address)

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

### PASS-271: `POST /jobs/{id}/documents/back-to-back-bl`
**Purpose:** Queue Back-to-Back BL PDF (master + house pair)

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

### PASS-272: `POST /jobs/{id}/documents/surrender-notice`
**Purpose:** Queue BL Surrender Notice PDF

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

### PASS-273: `POST /jobs/{id}/documents/si`
**Purpose:** Queue Shipping Instruction (SI) PDF

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

### PASS-274: `POST /jobs/{id}/documents/stuffing-report`
**Purpose:** Queue Stuffing Report PDF from stuffing records + containers

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

### PASS-275: `POST /jobs/{id}/documents/sailing-confirmation`
**Purpose:** Queue Sailing Confirmation PDF (uses sailed_at / vessel sailed milestone)

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

### PASS-276: `POST /jobs/{id}/documents/transhipment-confirmation`
**Purpose:** Queue Transhipment Confirmation PDF

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

### PASS-277: `POST /jobs/{id}/documents/freight-manifest`
**Purpose:** Queue Freight Manifest PDF (FCL)

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

### PASS-278: `POST /jobs/{id}/documents/job-card`
**Purpose:** Queue Job Card PDF

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

### PASS-279: `POST /jobs/{id}/documents/job-pnl`
**Purpose:** Queue Job P&L Statement PDF

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

### PASS-280: `POST /jobs/{id}/documents/proforma-invoice`
**Purpose:** Queue Proforma Invoice PDF for the job

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

### PASS-281: `POST /jobs/{id}/pre-alert/send`
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

### PASS-282: `POST /jobs/{id}/pre-alert/schedule`
**Purpose:** Schedule a pre-alert email for a future UTC time (cron delivers it)

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

### PASS-283: `POST /jobs/{id}/whatsapp/status`
**Purpose:** Send WhatsApp status stub (logged until WHATSAPP_ENABLED=true)

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

### PASS-284: `GET /jobs/{id}/sub-jobs`
**Purpose:** List operational sub-jobs under this parent

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

### PASS-285: `POST /jobs/{id}/sub-jobs`
**Purpose:** Create an operational sub-job under this parent

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

### PASS-286: `POST /jobs/{id}/payment-requests`
**Purpose:** Create a payment request from job totals / parties

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

### PASS-287: `POST /jobs/{id}/documents/e-awb`
**Purpose:** Queue E-AWB PDF generation

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

### PASS-288: `POST /jobs/{id}/documents/barcode-label`
**Purpose:** Queue barcode label PDF

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

### PASS-289: `POST /jobs/{id}/documents/consignee-label`
**Purpose:** Queue consignee label PDF

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

### PASS-290: `POST /jobs/{id}/documents/job-costing`
**Purpose:** Queue job costing sheet PDF

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

### PASS-291: `POST /jobs/{id}/documents/freight-certificate`
**Purpose:** Queue freight certificate PDF

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

### PASS-292: `PATCH /jobs/{id}/containers/{containerId}`
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

### PASS-293: `DELETE /jobs/{id}/containers/{containerId}`
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

### PASS-294: `POST /jobs/{id}/containers/{containerId}/cargo`
**Purpose:** Assign an existing cargo line to a container

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

### PASS-295: `POST /jobs/{id}/containers/{containerId}/split`
**Purpose:** Split one container across multiple house consignees (co-loading)

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

### PASS-296: `PATCH /jobs/{id}/cargo/{cargoId}`
**Purpose:** Update an FCL cargo line

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

### PASS-297: `DELETE /jobs/{id}/cargo/{cargoId}`
**Purpose:** Remove an FCL cargo line

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

### PASS-298: `PATCH /jobs/{id}/bills-of-lading/{blId}`
**Purpose:** Update a bill of lading (draft → original / surrendered flags)

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

### PASS-299: `DELETE /jobs/{id}/bills-of-lading/{blId}`
**Purpose:** Soft-delete a bill of lading

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

### PASS-300: `PATCH /jobs/{id}/stuffing-records/{recordId}`
**Purpose:** Update a stuffing record

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

### PASS-301: `DELETE /jobs/{id}/stuffing-records/{recordId}`
**Purpose:** Soft-delete a stuffing record

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

### PASS-302: `GET /jobs/{id}/free-days`
**Purpose:** List per-container free days + demurrage/detention accrual (traffic light)

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

### PASS-303: `POST /jobs/{id}/free-days`
**Purpose:** Upsert free-days / demurrage rates for a container

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

### PASS-304: `POST /jobs/{id}/free-days/recalculate`
**Purpose:** Recalculate demurrage + detention accruals for all containers on the job

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

### PASS-305: `GET /jobs/{id}/deposits`
**Purpose:** List customs / port deposits with expiry alert bands

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

### PASS-306: `POST /jobs/{id}/deposits`
**Purpose:** Create a customs or port deposit record

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

### PASS-307: `PATCH /jobs/{id}/deposits/{depositId}`
**Purpose:** Update a deposit

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

### PASS-308: `DELETE /jobs/{id}/deposits/{depositId}`
**Purpose:** Soft-delete a deposit

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

### PASS-309: `PATCH /jobs/{id}/customs-status`
**Purpose:** Update customs clearance workflow (PENDING→FILED→QUERY→CLEARED→RELEASED)

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

### PASS-310: `POST /jobs/{id}/containers/{containerId}/return`
**Purpose:** Record container return to shipping line

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

### PASS-311: `GET /jobs/{id}/part-deliveries`
**Purpose:** List part deliveries

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

### PASS-312: `POST /jobs/{id}/part-deliveries`
**Purpose:** Record a part delivery (remaining balance auto-calculated from job pieces)

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

### PASS-313: `GET /jobs/{id}/pods`
**Purpose:** List proofs of delivery

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

### PASS-314: `POST /jobs/{id}/pods`
**Purpose:** Record proof of delivery

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

### PASS-315: `GET /jobs/{id}/damage-reports`
**Purpose:** List damage reports

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

### PASS-316: `POST /jobs/{id}/damage-reports`
**Purpose:** Create a damage report (description + photo URLs + survey #)

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

### PASS-317: `POST /jobs/{id}/transhipment-link`
**Purpose:** Link this FCL Import job to an outbound SEA_FCL_EXPORT job

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

### PASS-318: `POST /jobs/{id}/cfs-storage/calculate`
**Purpose:** Calculate CFS storage: days × rate_per_day from sea-fcl-details

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

### PASS-319: `POST /jobs/{id}/documents/pre-can`
**Purpose:** Queue Pre-CAN (pre-arrival notice) PDF

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

### PASS-320: `POST /jobs/{id}/documents/can`
**Purpose:** Queue Cargo Arrival Notice (CAN) PDF and mark CAN_SENT

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

### PASS-321: `POST /jobs/{id}/documents/exchange-letter`
**Purpose:** Queue Exchange Letter PDF

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

### PASS-322: `POST /jobs/{id}/documents/undertake-letter`
**Purpose:** Queue Undertake Letter PDF

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

### PASS-323: `POST /jobs/{id}/documents/delivery-order`
**Purpose:** Queue Delivery Order PDF and mark DO_ISSUED

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

### PASS-324: `POST /jobs/{id}/documents/transport-request`
**Purpose:** Queue Transport Request PDF

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

### PASS-325: `POST /jobs/{id}/documents/shipping-advice`
**Purpose:** Queue Shipping Advice PDF

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

### PASS-326: `POST /jobs/{id}/documents/proof-of-delivery`
**Purpose:** Queue Proof of Delivery PDF

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

### PASS-327: `GET /awb-stock/batches`
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

### PASS-328: `POST /awb-stock/batches`
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

### PASS-329: `GET /awb-stock/reports/low-stock`
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

### PASS-330: `GET /awb-stock/allocations`
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

### PASS-331: `GET /awb-stock/batches/{id}`
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

### PASS-332: `PATCH /awb-stock/batches/{id}`
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

### PASS-333: `DELETE /awb-stock/batches/{id}`
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

### PASS-334: `POST /awb-stock/batches/{id}/allocate`
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

### PASS-335: `POST /awb-stock/batches/{id}/transfer-branch`
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

### PASS-336: `POST /awb-stock/allocations/{id}/void`
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

### PASS-337: `POST /awb-stock/allocations/{id}/mark-used`
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

### PASS-338: `GET /search`
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

### PASS-339: `GET /files/{tenantId}/{filename}`
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

### PASS-340: `GET /invoices`
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

### PASS-341: `POST /invoices`
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

### PASS-342: `GET /invoices/reports/overdue`
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

### PASS-343: `GET /invoices/{id}`
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

### PASS-344: `PATCH /invoices/{id}`
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

### PASS-345: `DELETE /invoices/{id}`
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

### PASS-346: `POST /invoices/from-job/{jobId}`
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

### PASS-347: `POST /invoices/{id}/lines`
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

### PASS-348: `PATCH /invoices/{id}/lines/{lineId}`
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

### PASS-349: `DELETE /invoices/{id}/lines/{lineId}`
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

### PASS-350: `POST /invoices/{id}/post`
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

### PASS-351: `POST /invoices/{id}/send`
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

### PASS-352: `POST /invoices/{id}/pdf`
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

### PASS-353: `GET /invoices/{id}/pdf`
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

### PASS-354: `POST /invoices/{id}/cancel`
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

### PASS-355: `GET /credit-notes`
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

### PASS-356: `POST /credit-notes`
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

### PASS-357: `GET /credit-notes/{id}`
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

### PASS-358: `POST /credit-notes/{id}/post`
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

### PASS-359: `GET /debit-notes`
**Purpose:** List debit notes

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Debit Notes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-360: `POST /debit-notes`
**Purpose:** Create a debit note against a posted customer invoice (extra charge)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Debit Notes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-361: `GET /debit-notes/{id}`
**Purpose:** Get a debit note

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Debit Notes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-362: `POST /debit-notes/{id}/post`
**Purpose:** Post a draft debit note

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | Debit Notes |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-363: `GET /purchase-invoices`
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

### PASS-364: `POST /purchase-invoices`
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

### PASS-365: `GET /purchase-invoices/{id}`
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

### PASS-366: `PATCH /purchase-invoices/{id}`
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

### PASS-367: `DELETE /purchase-invoices/{id}`
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

### PASS-368: `POST /purchase-invoices/{id}/post`
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

### PASS-369: `GET /payment-requests`
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

### PASS-370: `POST /payment-requests`
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

### PASS-371: `GET /payment-requests/{id}`
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

### PASS-372: `PATCH /payment-requests/{id}`
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

### PASS-373: `DELETE /payment-requests/{id}`
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

### PASS-374: `POST /payment-requests/{id}/approve`
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

### PASS-375: `POST /payment-requests/{id}/reject`
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

### PASS-376: `POST /payment-requests/{id}/mark-paid`
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

### PASS-377: `GET /gl/accounts`
**Purpose:** List chart of accounts (Ch.17)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Chart of Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-378: `POST /gl/accounts`
**Purpose:** Create a GL account

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Chart of Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-379: `GET /gl/accounts/tree`
**Purpose:** Hierarchical chart of accounts tree

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Chart of Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-380: `GET /gl/accounts/reports/trial-balance`
**Purpose:** Trial balance from posted voucher lines + opening balances

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Chart of Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-381: `POST /gl/accounts/seed-defaults`
**Purpose:** Seed a starter freight COA (only when empty)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Chart of Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-382: `GET /gl/accounts/{id}`
**Purpose:** Get account by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Chart of Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-383: `PATCH /gl/accounts/{id}`
**Purpose:** Update a GL account

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Chart of Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-384: `DELETE /gl/accounts/{id}`
**Purpose:** Soft-delete a GL account (blocked if used on voucher lines)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Chart of Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-385: `GET /gl/accounts/{id}/ledger`
**Purpose:** GL register for one account (posted vouchers)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Chart of Accounts |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-386: `GET /gl/vouchers`
**Purpose:** List vouchers (Ch.17)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-387: `POST /gl/vouchers`
**Purpose:** Create a draft voucher (optionally with lines)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-388: `GET /gl/vouchers/{id}`
**Purpose:** Get voucher with lines

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-389: `PATCH /gl/vouchers/{id}`
**Purpose:** Update draft voucher header

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-390: `DELETE /gl/vouchers/{id}`
**Purpose:** Soft-delete a draft voucher

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-391: `POST /gl/vouchers/{id}/lines`
**Purpose:** Add a line to a draft voucher

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-392: `PATCH /gl/vouchers/{id}/lines/{lineId}`
**Purpose:** Update a draft voucher line

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-393: `DELETE /gl/vouchers/{id}/lines/{lineId}`
**Purpose:** Remove a line from a draft voucher

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-394: `POST /gl/vouchers/{id}/post`
**Purpose:** Post a balanced draft voucher to the GL

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-395: `POST /gl/vouchers/{id}/reverse`
**Purpose:** Create an offsetting posted reversal voucher

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Vouchers |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-396: `GET /gl/payments`
**Purpose:** List customer receipts and vendor payments (Ch.19)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Payments (AR/AP) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-397: `POST /gl/payments`
**Purpose:** Create a draft receipt or vendor payment

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Payments (AR/AP) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-398: `GET /gl/payments/{id}`
**Purpose:** Get payment with allocations

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Payments (AR/AP) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-399: `PATCH /gl/payments/{id}`
**Purpose:** Update a draft payment header

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Payments (AR/AP) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-400: `DELETE /gl/payments/{id}`
**Purpose:** Soft-delete a draft payment

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Payments (AR/AP) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-401: `POST /gl/payments/{id}/allocations`
**Purpose:** Allocate payment amount to an open invoice

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Payments (AR/AP) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-402: `DELETE /gl/payments/{id}/allocations/{allocationId}`
**Purpose:** Remove a draft payment allocation

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Payments (AR/AP) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-403: `POST /gl/payments/{id}/post`
**Purpose:** Post payment: update invoice balances + create GL voucher

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Payments (AR/AP) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-404: `POST /gl/payments/{id}/cancel`
**Purpose:** Cancel payment (reverses invoice balances and GL if posted)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Payments (AR/AP) |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-405: `GET /gl/ar/aging`
**Purpose:** Accounts Receivable aging buckets (Ch.19.1)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — AR / AP Aging |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-406: `GET /gl/ap/aging`
**Purpose:** Accounts Payable aging buckets (Ch.19.2)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — AR / AP Aging |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-407: `GET /gl/ar/statement/{partyId}`
**Purpose:** Customer AR statement (invoices + receipts)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — AR / AP Aging |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-408: `GET /gl/ap/statement/{partyId}`
**Purpose:** Vendor AP statement (purchase invoices + payments)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — AR / AP Aging |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-409: `GET /gl/cheques`
**Purpose:** List cheques (receivable / payable / PDC)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Cheques / PDC |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-410: `POST /gl/cheques`
**Purpose:** Register a cheque / PDC

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Cheques / PDC |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-411: `GET /gl/cheques/reports/pdc-due`
**Purpose:** PDC due within N days (default 30)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Cheques / PDC |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-412: `GET /gl/cheques/{id}`
**Purpose:** Get cheque by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Cheques / PDC |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-413: `PATCH /gl/cheques/{id}`
**Purpose:** Update a pending cheque

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Cheques / PDC |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-414: `POST /gl/cheques/{id}/deposit`
**Purpose:** Mark cheque deposited

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Cheques / PDC |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-415: `POST /gl/cheques/{id}/clear`
**Purpose:** Mark cheque cleared

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Cheques / PDC |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-416: `POST /gl/cheques/{id}/bounce`
**Purpose:** Mark cheque bounced

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Cheques / PDC |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-417: `POST /gl/cheques/{id}/cancel`
**Purpose:** Cancel a cheque

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Cheques / PDC |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-418: `POST /gl/bank-transfers`
**Purpose:** Post a contra bank/cash transfer voucher (Ch.19.3)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-419: `GET /gl/bank-reconciliations`
**Purpose:** List bank reconciliations

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-420: `POST /gl/bank-reconciliations`
**Purpose:** Start a draft bank reconciliation

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-421: `GET /gl/bank-reconciliations/{id}`
**Purpose:** Get bank reconciliation with lines + summary

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-422: `PATCH /gl/bank-reconciliations/{id}`
**Purpose:** Update draft bank reconciliation header

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-423: `DELETE /gl/bank-reconciliations/{id}`
**Purpose:** Cancel / soft-delete a draft reconciliation

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-424: `GET /gl/bank-reconciliations/{id}/unmatched`
**Purpose:** Posted bank GL lines not yet matched on this recon

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-425: `POST /gl/bank-reconciliations/{id}/lines`
**Purpose:** Add a matched / statement line

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-426: `PATCH /gl/bank-reconciliations/{id}/lines/{lineId}`
**Purpose:** Update recon line match flags

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-427: `DELETE /gl/bank-reconciliations/{id}/lines/{lineId}`
**Purpose:** Remove a recon line

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-428: `POST /gl/bank-reconciliations/{id}/complete`
**Purpose:** Complete bank reconciliation

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Bank Reconciliation |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-429: `GET /gl/reports/trial-balance`
**Purpose:** Trial balance (Ch.20.1) — also available at GET /gl/accounts/reports/trial-balance

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Financial Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-430: `GET /gl/reports/balance-sheet`
**Purpose:** Balance Sheet as of a date (Ch.20.1 / Week 12)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Financial Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-431: `GET /gl/reports/profit-and-loss`
**Purpose:** Profit & Loss for a period (Ch.20.1 / Week 12)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Financial Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-432: `GET /gl/reports/cash-flow`
**Purpose:** Cash Flow from bank/cash voucher activity (Ch.20.1 / Week 12)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Financial Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-433: `GET /gl/reports/vat-return`
**Purpose:** UAE VAT return draft from posted invoices (Ch.20.2 / Week 12)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — Financial Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-434: `GET /gl/mis/dashboard`
**Purpose:** Management MIS dashboard widgets (Ch.23 / Week 12)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — MIS Dashboard |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-435: `GET /gl/mis/profitability`
**Purpose:** Job profitability by shipper / job_type / branch / salesperson (Ch.23)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — MIS Dashboard |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-436: `GET /gl/mis/operational`
**Purpose:** Operational KPIs — pending PRs, draft invoices, uninvoiced charges

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — MIS Dashboard |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-437: `GET /gl/saved-reports`
**Purpose:** List saved / shared report configurations (Ch.23 My Reports)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — My Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-438: `POST /gl/saved-reports`
**Purpose:** Save a report configuration (filters + type)

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — My Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-439: `GET /gl/saved-reports/{id}`
**Purpose:** Get a saved report by id

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — My Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-440: `PATCH /gl/saved-reports/{id}`
**Purpose:** Update a saved report

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — My Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

### PASS-441: `DELETE /gl/saved-reports/{id}`
**Purpose:** Soft-delete a saved report

| Field | Value |
|-------|-------|
| Case | **PASS** |
| Tag | GL — My Reports |
| Auth | Bearer {{TOKEN}} |
| Expected | 2xx |
| Live status | **DEFINED_NOT_HIT_IN_HAPPY_PATH** |
| Live HTTP | _not executed in happy-path this run_ |
| How to pass | Use valid token + body from `docs/API_PASS_CASES.md` for this path |

---

## Coverage
- APIs in OpenAPI: **441**
- PASS sections: **441**
- Missing: **0**