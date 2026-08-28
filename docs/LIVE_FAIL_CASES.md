# LIVE FAIL Cases — One Per API

**Base URL:** `https://kingfisherwings.onrender.com`
**Run ID:** 1787902145904
**When:** 2026-08-28T07:30:11.114Z
**OpenAPI APIs:** 441

Every OpenAPI operation appears exactly once. Live execution result is shown when available.

| # | Method | Path | Live result | HTTP |
|---|--------|------|-------------|------|
| 1 | GET | `/locale/defaults` | PUBLIC_USE_BAD_BODY | 400 |
| 2 | GET | `/locale/{countryCode}` | PUBLIC_USE_BAD_BODY | 400 |
| 3 | GET | `/health` | PUBLIC_USE_BAD_BODY | 400 |
| 4 | POST | `/tenants` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 5 | GET | `/tenants` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 6 | GET | `/tenants/statistics` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 7 | POST | `/tenants/sync-permissions` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 8 | POST | `/tenants/{id}/sync-permissions` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 9 | GET | `/tenants/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 10 | PATCH | `/tenants/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 11 | DELETE | `/tenants/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 12 | PATCH | `/tenants/{id}/restore` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 13 | PATCH | `/tenants/{id}/activate` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 14 | PATCH | `/tenants/{id}/deactivate` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 15 | GET | `/companies` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 16 | POST | `/companies` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 17 | GET | `/companies/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 18 | PATCH | `/companies/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 19 | DELETE | `/companies/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 20 | GET | `/users` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 21 | POST | `/users` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 22 | GET | `/users/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 23 | PATCH | `/users/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 24 | DELETE | `/users/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 25 | PATCH | `/users/{id}/status` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 26 | POST | `/users/bulk` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 27 | POST | `/users/{id}/restore` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 28 | POST | `/users/me/change-password` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 29 | POST | `/users/{id}/admin-reset-password` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 30 | POST | `/users/{id}/force-logout` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 31 | POST | `/auth/login` | PUBLIC_USE_BAD_BODY | 400 |
| 32 | POST | `/auth/tenant-login` | PUBLIC_USE_BAD_BODY | 400 |
| 33 | POST | `/auth/super-admin/signup` | PUBLIC_USE_BAD_BODY | 400 |
| 34 | POST | `/auth/super-admin/login` | PUBLIC_USE_BAD_BODY | 400 |
| 35 | POST | `/auth/refresh` | PUBLIC_USE_BAD_BODY | 400 |
| 36 | POST | `/auth/logout` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 37 | GET | `/auth/sessions` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 38 | POST | `/auth/sessions/{sessionId}/revoke` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 39 | POST | `/auth/logout-all` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 40 | GET | `/auth/me` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 41 | PATCH | `/auth/me` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 42 | POST | `/auth/change-password` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 43 | POST | `/auth/tenant/change-password` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 44 | POST | `/auth/invite` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 45 | POST | `/auth/accept-invite` | PUBLIC_USE_BAD_BODY | 400 |
| 46 | POST | `/auth/2fa/setup` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 47 | POST | `/auth/2fa/enable` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 48 | POST | `/auth/2fa/disable` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 49 | GET | `/masters/countries` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 50 | POST | `/masters/countries` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 51 | GET | `/masters/countries/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 52 | PATCH | `/masters/countries/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 53 | DELETE | `/masters/countries/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 54 | GET | `/masters/currencies` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 55 | POST | `/masters/currencies` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 56 | GET | `/masters/currencies/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 57 | PATCH | `/masters/currencies/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 58 | DELETE | `/masters/currencies/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 59 | GET | `/masters/exchange-rates` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 60 | POST | `/masters/exchange-rates` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 61 | GET | `/masters/exchange-rates/latest/{currencyId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 62 | GET | `/masters/ports` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 63 | POST | `/masters/ports` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 64 | GET | `/masters/ports/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 65 | PATCH | `/masters/ports/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 66 | DELETE | `/masters/ports/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 67 | GET | `/masters/airports` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 68 | POST | `/masters/airports` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 69 | GET | `/masters/airports/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 70 | PATCH | `/masters/airports/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 71 | DELETE | `/masters/airports/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 72 | GET | `/masters/container-types` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 73 | POST | `/masters/container-types` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 74 | GET | `/masters/container-types/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 75 | PATCH | `/masters/container-types/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 76 | DELETE | `/masters/container-types/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 77 | GET | `/masters/hs-codes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 78 | POST | `/masters/hs-codes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 79 | GET | `/masters/hs-codes/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 80 | PATCH | `/masters/hs-codes/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 81 | DELETE | `/masters/hs-codes/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 82 | GET | `/masters/airlines` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 83 | POST | `/masters/airlines` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 84 | GET | `/masters/airlines/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 85 | PATCH | `/masters/airlines/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 86 | DELETE | `/masters/airlines/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 87 | GET | `/masters/shipping-lines` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 88 | POST | `/masters/shipping-lines` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 89 | GET | `/masters/shipping-lines/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 90 | PATCH | `/masters/shipping-lines/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 91 | DELETE | `/masters/shipping-lines/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 92 | GET | `/masters/vessels` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 93 | POST | `/masters/vessels` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 94 | GET | `/masters/vessels/{id}` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 95 | PATCH | `/masters/vessels/{id}` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 96 | DELETE | `/masters/vessels/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 97 | GET | `/vessels/{id}/schedules` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 98 | POST | `/vessels/{id}/schedules` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 99 | PATCH | `/vessels/{id}/schedules/{scheduleId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 100 | DELETE | `/vessels/{id}/schedules/{scheduleId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 101 | GET | `/masters/truckers` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 102 | POST | `/masters/truckers` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 103 | GET | `/masters/truckers/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 104 | PATCH | `/masters/truckers/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 105 | DELETE | `/masters/truckers/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 106 | GET | `/masters/warehouses` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 107 | POST | `/masters/warehouses` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 108 | GET | `/masters/warehouses/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 109 | PATCH | `/masters/warehouses/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 110 | DELETE | `/masters/warehouses/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 111 | GET | `/masters/charge-codes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 112 | POST | `/masters/charge-codes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 113 | GET | `/masters/charge-codes/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 114 | PATCH | `/masters/charge-codes/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 115 | DELETE | `/masters/charge-codes/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 116 | GET | `/masters/banks` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 117 | POST | `/masters/banks` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 118 | GET | `/masters/banks/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 119 | PATCH | `/masters/banks/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 120 | DELETE | `/masters/banks/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 121 | GET | `/masters/holidays` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 122 | POST | `/masters/holidays` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 123 | GET | `/masters/holidays/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 124 | PATCH | `/masters/holidays/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 125 | DELETE | `/masters/holidays/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 126 | GET | `/masters/units-of-measure` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 127 | POST | `/masters/units-of-measure` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 128 | GET | `/masters/units-of-measure/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 129 | PATCH | `/masters/units-of-measure/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 130 | DELETE | `/masters/units-of-measure/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 131 | GET | `/masters/tax-rates` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 132 | POST | `/masters/tax-rates` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 133 | GET | `/masters/tax-rates/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 134 | PATCH | `/masters/tax-rates/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 135 | DELETE | `/masters/tax-rates/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 136 | GET | `/masters/branches` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 137 | POST | `/masters/branches` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 138 | GET | `/masters/branches/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 139 | PATCH | `/masters/branches/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 140 | DELETE | `/masters/branches/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 141 | GET | `/masters/departments` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 142 | POST | `/masters/departments` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 143 | GET | `/masters/departments/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 144 | PATCH | `/masters/departments/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 145 | DELETE | `/masters/departments/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 146 | GET | `/masters/designations` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 147 | POST | `/masters/designations` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 148 | GET | `/masters/designations/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 149 | PATCH | `/masters/designations/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 150 | DELETE | `/masters/designations/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 151 | GET | `/parties` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 152 | POST | `/parties` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 153 | GET | `/parties/export` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 154 | GET | `/parties/{id}/history` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 155 | GET | `/parties/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 156 | PATCH | `/parties/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 157 | DELETE | `/parties/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 158 | POST | `/parties/import` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 159 | PATCH | `/parties/{id}/credit-status` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 160 | POST | `/parties/{id}/contacts` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 161 | PATCH | `/parties/{id}/contacts/{contactId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 162 | DELETE | `/parties/{id}/contacts/{contactId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 163 | POST | `/parties/{id}/addresses` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 164 | PATCH | `/parties/{id}/addresses/{addressId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 165 | DELETE | `/parties/{id}/addresses/{addressId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 166 | GET | `/organization/profile` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 167 | PATCH | `/organization/profile` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 168 | GET | `/organization/bank-accounts` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 169 | POST | `/organization/bank-accounts` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 170 | GET | `/organization/bank-accounts/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 171 | PATCH | `/organization/bank-accounts/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 172 | DELETE | `/organization/bank-accounts/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 173 | GET | `/organization/number-formats` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 174 | POST | `/organization/number-formats` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 175 | GET | `/organization/number-formats/{documentType}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 176 | PATCH | `/organization/number-formats/{documentType}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 177 | GET | `/organization/number-formats/{documentType}/preview` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 178 | GET | `/quotations/tariffs` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 179 | POST | `/quotations/tariffs` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 180 | GET | `/quotations/tariffs/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 181 | PATCH | `/quotations/tariffs/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 182 | DELETE | `/quotations/tariffs/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 183 | GET | `/quotations/zip-distances` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 184 | POST | `/quotations/zip-distances` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 185 | GET | `/quotations/zip-distances/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 186 | PATCH | `/quotations/zip-distances/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 187 | DELETE | `/quotations/zip-distances/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 188 | GET | `/quotations` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 189 | POST | `/quotations` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 190 | GET | `/quotations/reports/chargewise` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 191 | GET | `/quotations/reports/analytics` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 192 | GET | `/quotations/reports/analytics/conversion` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 193 | GET | `/quotations/reports/analytics/lost-reasons` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 194 | GET | `/quotations/reports/analytics/response-time` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 195 | POST | `/quotations/online-quote` | PUBLIC_USE_BAD_BODY | 400 |
| 196 | POST | `/quotations/expire-due` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 197 | GET | `/quotations/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 198 | PATCH | `/quotations/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 199 | DELETE | `/quotations/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 200 | GET | `/quotations/{id}/revisions` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 201 | POST | `/quotations/{id}/lines` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 202 | POST | `/quotations/{id}/apply-tariff` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 203 | PATCH | `/quotations/{id}/lines/{lineId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 204 | DELETE | `/quotations/{id}/lines/{lineId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 205 | POST | `/quotations/{id}/submit` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 206 | POST | `/quotations/{id}/approve` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 207 | POST | `/quotations/{id}/reject` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 208 | POST | `/quotations/{id}/send` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 209 | POST | `/quotations/{id}/mark-won` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 210 | POST | `/quotations/{id}/mark-lost` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 211 | POST | `/quotations/{id}/duplicate` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 212 | POST | `/quotations/{id}/convert-to-job` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 213 | POST | `/quotations/{id}/archive` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 214 | POST | `/quotations/{id}/expire` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 215 | POST | `/quotations/{id}/pdf` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 216 | GET | `/quotations/{id}/pdf` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 217 | GET | `/quotations/{id}/pdf/status` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 218 | POST | `/quotations/{id}/send-email` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 219 | GET | `/jobs` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 220 | POST | `/jobs` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 221 | GET | `/jobs/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 222 | PATCH | `/jobs/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 223 | DELETE | `/jobs/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 224 | GET | `/jobs/{id}/house-jobs` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 225 | GET | `/jobs/{id}/milestones` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 226 | POST | `/jobs/{id}/milestones` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 227 | GET | `/jobs/{id}/pnl` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 228 | GET | `/jobs/{id}/notes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 229 | POST | `/jobs/{id}/notes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 230 | GET | `/jobs/{id}/documents` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 231 | POST | `/jobs/{id}/documents` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 232 | GET | `/jobs/{id}/containers` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 233 | POST | `/jobs/{id}/containers` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 234 | GET | `/jobs/{id}/containers/fill` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 235 | GET | `/jobs/{id}/containers/{containerId}/fill` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 236 | GET | `/jobs/{id}/cutoffs` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 237 | GET | `/jobs/{id}/cargo` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 238 | POST | `/jobs/{id}/cargo` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 239 | GET | `/jobs/{id}/bills-of-lading` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 240 | POST | `/jobs/{id}/bills-of-lading` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 241 | GET | `/jobs/{id}/stuffing-records` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 242 | POST | `/jobs/{id}/stuffing-records` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 243 | POST | `/jobs/{id}/close` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 244 | POST | `/jobs/{id}/cancel` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 245 | PATCH | `/jobs/{id}/air-details` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 246 | PATCH | `/jobs/{id}/sea-fcl-details` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 247 | POST | `/jobs/{id}/sea-fcl-details/si-submission` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 248 | POST | `/jobs/{id}/sea-fcl-details/vgm-submission` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 249 | PATCH | `/jobs/{id}/milestones/{milestoneId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 250 | POST | `/jobs/{id}/charges` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 251 | PATCH | `/jobs/{id}/charges/{chargeId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 252 | DELETE | `/jobs/{id}/charges/{chargeId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 253 | POST | `/jobs/{id}/prorate-cost/{chargeCodeId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 254 | PATCH | `/jobs/{id}/notes/{noteId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 255 | DELETE | `/jobs/{id}/notes/{noteId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 256 | PATCH | `/jobs/{id}/documents/{documentId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 257 | DELETE | `/jobs/{id}/documents/{documentId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 258 | POST | `/jobs/{id}/documents/{documentId}/finalize` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 259 | GET | `/jobs/{id}/documents/generation-status` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 260 | POST | `/jobs/{id}/documents/hawb` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 261 | POST | `/jobs/{id}/documents/mawb` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 262 | POST | `/jobs/{id}/documents/pre-alert` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 263 | POST | `/jobs/{id}/documents/cargo-manifest` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 264 | POST | `/jobs/{id}/documents/hbl` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 265 | POST | `/jobs/{id}/documents/hbl-express-release` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 266 | POST | `/jobs/{id}/documents/mbl` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 267 | POST | `/jobs/{id}/documents/fiata-bl` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 268 | POST | `/jobs/{id}/documents/rider-bl` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 269 | POST | `/jobs/{id}/documents/switch-bl` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 270 | POST | `/jobs/{id}/documents/proxy-bl` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 271 | POST | `/jobs/{id}/documents/back-to-back-bl` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 272 | POST | `/jobs/{id}/documents/surrender-notice` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 273 | POST | `/jobs/{id}/documents/si` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 274 | POST | `/jobs/{id}/documents/stuffing-report` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 275 | POST | `/jobs/{id}/documents/sailing-confirmation` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 276 | POST | `/jobs/{id}/documents/transhipment-confirmation` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 277 | POST | `/jobs/{id}/documents/freight-manifest` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 278 | POST | `/jobs/{id}/documents/job-card` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 279 | POST | `/jobs/{id}/documents/job-pnl` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 280 | POST | `/jobs/{id}/documents/proforma-invoice` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 281 | POST | `/jobs/{id}/pre-alert/send` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 282 | POST | `/jobs/{id}/pre-alert/schedule` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 283 | POST | `/jobs/{id}/whatsapp/status` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 284 | GET | `/jobs/{id}/sub-jobs` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 285 | POST | `/jobs/{id}/sub-jobs` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 286 | POST | `/jobs/{id}/payment-requests` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 287 | POST | `/jobs/{id}/documents/e-awb` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 288 | POST | `/jobs/{id}/documents/barcode-label` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 289 | POST | `/jobs/{id}/documents/consignee-label` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 290 | POST | `/jobs/{id}/documents/job-costing` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 291 | POST | `/jobs/{id}/documents/freight-certificate` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 292 | PATCH | `/jobs/{id}/containers/{containerId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 293 | DELETE | `/jobs/{id}/containers/{containerId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 294 | POST | `/jobs/{id}/containers/{containerId}/cargo` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 295 | POST | `/jobs/{id}/containers/{containerId}/split` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 296 | PATCH | `/jobs/{id}/cargo/{cargoId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 297 | DELETE | `/jobs/{id}/cargo/{cargoId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 298 | PATCH | `/jobs/{id}/bills-of-lading/{blId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 299 | DELETE | `/jobs/{id}/bills-of-lading/{blId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 300 | PATCH | `/jobs/{id}/stuffing-records/{recordId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 301 | DELETE | `/jobs/{id}/stuffing-records/{recordId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 302 | GET | `/jobs/{id}/free-days` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 303 | POST | `/jobs/{id}/free-days` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 304 | POST | `/jobs/{id}/free-days/recalculate` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 305 | GET | `/jobs/{id}/deposits` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 306 | POST | `/jobs/{id}/deposits` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 307 | PATCH | `/jobs/{id}/deposits/{depositId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 308 | DELETE | `/jobs/{id}/deposits/{depositId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 309 | PATCH | `/jobs/{id}/customs-status` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 310 | POST | `/jobs/{id}/containers/{containerId}/return` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 311 | GET | `/jobs/{id}/part-deliveries` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 312 | POST | `/jobs/{id}/part-deliveries` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 313 | GET | `/jobs/{id}/pods` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 314 | POST | `/jobs/{id}/pods` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 315 | GET | `/jobs/{id}/damage-reports` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 316 | POST | `/jobs/{id}/damage-reports` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 317 | POST | `/jobs/{id}/transhipment-link` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 318 | POST | `/jobs/{id}/cfs-storage/calculate` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 319 | POST | `/jobs/{id}/documents/pre-can` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 320 | POST | `/jobs/{id}/documents/can` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 321 | POST | `/jobs/{id}/documents/exchange-letter` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 322 | POST | `/jobs/{id}/documents/undertake-letter` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 323 | POST | `/jobs/{id}/documents/delivery-order` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 324 | POST | `/jobs/{id}/documents/transport-request` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 325 | POST | `/jobs/{id}/documents/shipping-advice` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 326 | POST | `/jobs/{id}/documents/proof-of-delivery` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 327 | GET | `/awb-stock/batches` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 328 | POST | `/awb-stock/batches` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 329 | GET | `/awb-stock/reports/low-stock` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 330 | GET | `/awb-stock/allocations` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 331 | GET | `/awb-stock/batches/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 332 | PATCH | `/awb-stock/batches/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 333 | DELETE | `/awb-stock/batches/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 334 | POST | `/awb-stock/batches/{id}/allocate` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 335 | POST | `/awb-stock/batches/{id}/transfer-branch` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 336 | POST | `/awb-stock/allocations/{id}/void` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 337 | POST | `/awb-stock/allocations/{id}/mark-used` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 338 | GET | `/search` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 339 | GET | `/files/{tenantId}/{filename}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 340 | GET | `/invoices` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 341 | POST | `/invoices` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 342 | GET | `/invoices/reports/overdue` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 343 | GET | `/invoices/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 344 | PATCH | `/invoices/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 345 | DELETE | `/invoices/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 346 | POST | `/invoices/from-job/{jobId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 347 | POST | `/invoices/{id}/lines` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 348 | PATCH | `/invoices/{id}/lines/{lineId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 349 | DELETE | `/invoices/{id}/lines/{lineId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 350 | POST | `/invoices/{id}/post` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 351 | POST | `/invoices/{id}/send` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 352 | POST | `/invoices/{id}/pdf` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 353 | GET | `/invoices/{id}/pdf` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 354 | POST | `/invoices/{id}/cancel` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 355 | GET | `/credit-notes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 356 | POST | `/credit-notes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 357 | GET | `/credit-notes/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 358 | POST | `/credit-notes/{id}/post` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 359 | GET | `/debit-notes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 360 | POST | `/debit-notes` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 361 | GET | `/debit-notes/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 362 | POST | `/debit-notes/{id}/post` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 363 | GET | `/purchase-invoices` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 364 | POST | `/purchase-invoices` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 365 | GET | `/purchase-invoices/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 366 | PATCH | `/purchase-invoices/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 367 | DELETE | `/purchase-invoices/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 368 | POST | `/purchase-invoices/{id}/post` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 369 | GET | `/payment-requests` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 370 | POST | `/payment-requests` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 371 | GET | `/payment-requests/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 372 | PATCH | `/payment-requests/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 373 | DELETE | `/payment-requests/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 374 | POST | `/payment-requests/{id}/approve` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 375 | POST | `/payment-requests/{id}/reject` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 376 | POST | `/payment-requests/{id}/mark-paid` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 377 | GET | `/gl/accounts` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 378 | POST | `/gl/accounts` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 379 | GET | `/gl/accounts/tree` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 380 | GET | `/gl/accounts/reports/trial-balance` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 381 | POST | `/gl/accounts/seed-defaults` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 382 | GET | `/gl/accounts/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 383 | PATCH | `/gl/accounts/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 384 | DELETE | `/gl/accounts/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 385 | GET | `/gl/accounts/{id}/ledger` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 386 | GET | `/gl/vouchers` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 387 | POST | `/gl/vouchers` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 388 | GET | `/gl/vouchers/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 389 | PATCH | `/gl/vouchers/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 390 | DELETE | `/gl/vouchers/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 391 | POST | `/gl/vouchers/{id}/lines` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 392 | PATCH | `/gl/vouchers/{id}/lines/{lineId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 393 | DELETE | `/gl/vouchers/{id}/lines/{lineId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 394 | POST | `/gl/vouchers/{id}/post` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 395 | POST | `/gl/vouchers/{id}/reverse` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 396 | GET | `/gl/payments` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 397 | POST | `/gl/payments` | EXECUTED_FAIL (API did not reject as expected) | 503 |
| 398 | GET | `/gl/payments/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 399 | PATCH | `/gl/payments/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 400 | DELETE | `/gl/payments/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 401 | POST | `/gl/payments/{id}/allocations` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 402 | DELETE | `/gl/payments/{id}/allocations/{allocationId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 403 | POST | `/gl/payments/{id}/post` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 404 | POST | `/gl/payments/{id}/cancel` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 405 | GET | `/gl/ar/aging` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 406 | GET | `/gl/ap/aging` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 407 | GET | `/gl/ar/statement/{partyId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 408 | GET | `/gl/ap/statement/{partyId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 409 | GET | `/gl/cheques` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 410 | POST | `/gl/cheques` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 411 | GET | `/gl/cheques/reports/pdc-due` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 412 | GET | `/gl/cheques/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 413 | PATCH | `/gl/cheques/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 414 | POST | `/gl/cheques/{id}/deposit` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 415 | POST | `/gl/cheques/{id}/clear` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 416 | POST | `/gl/cheques/{id}/bounce` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 417 | POST | `/gl/cheques/{id}/cancel` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 418 | POST | `/gl/bank-transfers` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 419 | GET | `/gl/bank-reconciliations` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 420 | POST | `/gl/bank-reconciliations` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 421 | GET | `/gl/bank-reconciliations/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 422 | PATCH | `/gl/bank-reconciliations/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 423 | DELETE | `/gl/bank-reconciliations/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 424 | GET | `/gl/bank-reconciliations/{id}/unmatched` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 425 | POST | `/gl/bank-reconciliations/{id}/lines` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 426 | PATCH | `/gl/bank-reconciliations/{id}/lines/{lineId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 427 | DELETE | `/gl/bank-reconciliations/{id}/lines/{lineId}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 428 | POST | `/gl/bank-reconciliations/{id}/complete` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 429 | GET | `/gl/reports/trial-balance` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 430 | GET | `/gl/reports/balance-sheet` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 431 | GET | `/gl/reports/profit-and-loss` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 432 | GET | `/gl/reports/cash-flow` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 433 | GET | `/gl/reports/vat-return` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 434 | GET | `/gl/mis/dashboard` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 435 | GET | `/gl/mis/profitability` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 436 | GET | `/gl/mis/operational` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 437 | GET | `/gl/saved-reports` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 438 | POST | `/gl/saved-reports` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 439 | GET | `/gl/saved-reports/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 440 | PATCH | `/gl/saved-reports/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |
| 441 | DELETE | `/gl/saved-reports/{id}` | EXECUTED_FAIL (API did not reject as expected) | 429 |

## Per-API FAIL details

### FAIL-001: `GET /locale/defaults`
**Purpose:** Optional country → suggested dial / currency / timezone

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Locale |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

```http
GET /locale/defaults HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-002: `GET /locale/{countryCode}`
**Purpose:** Locale suggestions for an ISO country (still optional to use)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Locale |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

```http
GET /locale/{countryCode} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-003: `GET /health`

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Untagged |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

```http
GET /health HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-004: `POST /tenants`
**Purpose:** Create a new tenant (also provisions its TENANT_ADMIN owner user)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
POST /tenants HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-005: `GET /tenants`
**Purpose:** Get all tenants

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
GET /tenants HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-006: `GET /tenants/statistics`
**Purpose:** Tenant statistics

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
GET /tenants/statistics HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-007: `POST /tenants/sync-permissions`
**Purpose:** Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /tenants/sync-permissions HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-008: `POST /tenants/{id}/sync-permissions`
**Purpose:** Reconcile one tenant against the current permission/role catalog

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /tenants/{id}/sync-permissions HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-009: `GET /tenants/{id}`
**Purpose:** Get tenant by ID

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /tenants/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-010: `PATCH /tenants/{id}`
**Purpose:** Update tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /tenants/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-011: `DELETE /tenants/{id}`
**Purpose:** Soft delete tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /tenants/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-012: `PATCH /tenants/{id}/restore`
**Purpose:** Restore tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /tenants/{id}/restore HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-013: `PATCH /tenants/{id}/activate`
**Purpose:** Activate tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /tenants/{id}/activate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-014: `PATCH /tenants/{id}/deactivate`
**Purpose:** Deactivate tenant

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Tenants (Super Admin) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /tenants/{id}/deactivate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-015: `GET /companies`
**Purpose:** List this tenant's companies (usually just the one default, more for multi-entity groups)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /companies HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-016: `POST /companies`
**Purpose:** Register an additional company under this tenant (multi-entity groups)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /companies HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-017: `GET /companies/{id}`
**Purpose:** Get a company by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /companies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-018: `PATCH /companies/{id}`
**Purpose:** Update a company

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /companies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-019: `DELETE /companies/{id}`
**Purpose:** Soft-delete a company (blocked if it is the only one, or currently default)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Companies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /companies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-020: `GET /users`
**Purpose:** List users for the current tenant (paginated, filterable).

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /users HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-021: `POST /users`
**Purpose:** Create a user. Returns a system-generated temporary password.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /users HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-022: `GET /users/{id}`
**Purpose:** Get a single user by id.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /users/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-023: `PATCH /users/{id}`
**Purpose:** Update a user.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /users/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-024: `DELETE /users/{id}`
**Purpose:** Soft-delete a user.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /users/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-025: `PATCH /users/{id}/status`
**Purpose:** Change a user's status (activate, suspend, etc).

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /users/{id}/status HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-026: `POST /users/bulk`
**Purpose:** Apply an action (activate/deactivate/suspend/delete/restore) to multiple users.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /users/bulk HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-027: `POST /users/{id}/restore`
**Purpose:** Restore a soft-deleted user.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /users/{id}/restore HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-028: `POST /users/me/change-password`
**Purpose:** Authenticated user changes their own password.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /users/me/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-029: `POST /users/{id}/admin-reset-password`
**Purpose:** Admin resets a target user's password to a new temporary password.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /users/{id}/admin-reset-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-030: `POST /users/{id}/force-logout`
**Purpose:** Force-logout: revoke a target user's active sessions on all devices.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Users |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /users/{id}/force-logout HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-031: `POST /auth/login`
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

### FAIL-032: `POST /auth/tenant-login`
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

### FAIL-033: `POST /auth/super-admin/signup`
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

### FAIL-034: `POST /auth/super-admin/login`
**Purpose:** Platform super admin login

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

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

### FAIL-035: `POST /auth/refresh`
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

### FAIL-036: `POST /auth/logout`
**Purpose:** Revoke the current session

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /auth/logout HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-037: `GET /auth/sessions`
**Purpose:** List the authenticated user's own active sessions

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /auth/sessions HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-038: `POST /auth/sessions/{sessionId}/revoke`
**Purpose:** Revoke one of the authenticated user's own sessions

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /auth/sessions/{sessionId}/revoke HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-039: `POST /auth/logout-all`
**Purpose:** Log out of every device (revokes all active sessions)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /auth/logout-all HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-040: `GET /auth/me`
**Purpose:** Get the authenticated principal (user, tenant owner, or super admin)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /auth/me HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-041: `PATCH /auth/me`
**Purpose:** Update own profile after login (preferred country, phone, locale)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /auth/me HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-042: `POST /auth/change-password`
**Purpose:** Change the authenticated user password

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /auth/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-043: `POST /auth/tenant/change-password`
**Purpose:** Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /auth/tenant/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-044: `POST /auth/invite`
**Purpose:** Send invite email with accept token for an INVITED user

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /auth/invite HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-045: `POST /auth/accept-invite`
**Purpose:** Accept invite token and set password

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | Invalid / incomplete body |
| Expected | **400** (or 401 for bad login credentials) |
| Live status | **PUBLIC_USE_BAD_BODY** |
| Live HTTP | _see secondary_ |

```http
POST /auth/accept-invite HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

---

### FAIL-046: `POST /auth/2fa/setup`
**Purpose:** Generate TOTP secret + QR for the current user

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /auth/2fa/setup HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-047: `POST /auth/2fa/enable`
**Purpose:** Enable 2FA after verifying a TOTP code from the authenticator app

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /auth/2fa/enable HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-048: `POST /auth/2fa/disable`
**Purpose:** Disable 2FA (password + optional TOTP/backup code)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Auth |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /auth/2fa/disable HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-049: `GET /masters/countries`
**Purpose:** List countries

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/countries HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-050: `POST /masters/countries`
**Purpose:** Create a country

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/countries HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-051: `GET /masters/countries/{id}`
**Purpose:** Get a country by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/countries/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-052: `PATCH /masters/countries/{id}`
**Purpose:** Update a country

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/countries/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-053: `DELETE /masters/countries/{id}`
**Purpose:** Soft-delete a country

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Countries |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/countries/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-054: `GET /masters/currencies`
**Purpose:** List currencies

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/currencies HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-055: `POST /masters/currencies`
**Purpose:** Create a currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/currencies HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-056: `GET /masters/currencies/{id}`
**Purpose:** Get a currency by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/currencies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-057: `PATCH /masters/currencies/{id}`
**Purpose:** Update a currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/currencies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-058: `DELETE /masters/currencies/{id}`
**Purpose:** Soft-delete a currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Currencies |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/currencies/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-059: `GET /masters/exchange-rates`
**Purpose:** List exchange rates, optionally filtered by currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Exchange Rates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/exchange-rates HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-060: `POST /masters/exchange-rates`
**Purpose:** Record (or correct) an exchange rate for a date — upserts by currency + date

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Exchange Rates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/exchange-rates HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-061: `GET /masters/exchange-rates/latest/{currencyId}`
**Purpose:** Most recent rate on file for a currency

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Exchange Rates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/exchange-rates/latest/{currencyId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-062: `GET /masters/ports`
**Purpose:** List ports

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/ports HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-063: `POST /masters/ports`
**Purpose:** Create a port

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/ports HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-064: `GET /masters/ports/{id}`
**Purpose:** Get a port record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/ports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-065: `PATCH /masters/ports/{id}`
**Purpose:** Update a port

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/ports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-066: `DELETE /masters/ports/{id}`
**Purpose:** Soft-delete a port

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Ports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/ports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-067: `GET /masters/airports`
**Purpose:** List airports

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/airports HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-068: `POST /masters/airports`
**Purpose:** Create an airport

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/airports HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-069: `GET /masters/airports/{id}`
**Purpose:** Get an airport by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/airports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-070: `PATCH /masters/airports/{id}`
**Purpose:** Update an airport

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/airports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-071: `DELETE /masters/airports/{id}`
**Purpose:** Soft-delete an airport

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/airports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-072: `GET /masters/container-types`
**Purpose:** List container types

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/container-types HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-073: `POST /masters/container-types`
**Purpose:** Create a container type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/container-types HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-074: `GET /masters/container-types/{id}`
**Purpose:** Get a container type by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/container-types/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-075: `PATCH /masters/container-types/{id}`
**Purpose:** Update a container type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/container-types/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-076: `DELETE /masters/container-types/{id}`
**Purpose:** Soft-delete a container type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ContainerTypes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/container-types/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-077: `GET /masters/hs-codes`
**Purpose:** List HS codes

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/hs-codes HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-078: `POST /masters/hs-codes`
**Purpose:** Create an HS code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/hs-codes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-079: `GET /masters/hs-codes/{id}`
**Purpose:** Get an HS code by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/hs-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-080: `PATCH /masters/hs-codes/{id}`
**Purpose:** Update an HS code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/hs-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-081: `DELETE /masters/hs-codes/{id}`
**Purpose:** Soft-delete an HS code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — HsCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/hs-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-082: `GET /masters/airlines`
**Purpose:** list airlines

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/airlines HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-083: `POST /masters/airlines`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/airlines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-084: `GET /masters/airlines/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/airlines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-085: `PATCH /masters/airlines/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/airlines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-086: `DELETE /masters/airlines/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Airlines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/airlines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-087: `GET /masters/shipping-lines`
**Purpose:** list shippinglines

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/shipping-lines HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-088: `POST /masters/shipping-lines`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/shipping-lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-089: `GET /masters/shipping-lines/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/shipping-lines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-090: `PATCH /masters/shipping-lines/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/shipping-lines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-091: `DELETE /masters/shipping-lines/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ShippingLines |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/shipping-lines/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-092: `GET /masters/vessels`
**Purpose:** list vessels

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/vessels HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-093: `POST /masters/vessels`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/vessels HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-094: `GET /masters/vessels/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/vessels/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-095: `PATCH /masters/vessels/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/vessels/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-096: `DELETE /masters/vessels/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Vessels |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/vessels/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-097: `GET /vessels/{id}/schedules`
**Purpose:** List vessel voyage schedules (filter by ETD/ETA)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Vessels — Schedules |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /vessels/{id}/schedules HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-098: `POST /vessels/{id}/schedules`
**Purpose:** Create a vessel voyage schedule

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Vessels — Schedules |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /vessels/{id}/schedules HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-099: `PATCH /vessels/{id}/schedules/{scheduleId}`
**Purpose:** Update a vessel voyage schedule

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Vessels — Schedules |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /vessels/{id}/schedules/{scheduleId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-100: `DELETE /vessels/{id}/schedules/{scheduleId}`
**Purpose:** Soft-delete a vessel voyage schedule

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Vessels — Schedules |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /vessels/{id}/schedules/{scheduleId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-101: `GET /masters/truckers`
**Purpose:** list truckers

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/truckers HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-102: `POST /masters/truckers`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/truckers HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-103: `GET /masters/truckers/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/truckers/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-104: `PATCH /masters/truckers/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/truckers/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-105: `DELETE /masters/truckers/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Truckers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/truckers/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-106: `GET /masters/warehouses`
**Purpose:** list warehouses

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/warehouses HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-107: `POST /masters/warehouses`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/warehouses HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-108: `GET /masters/warehouses/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/warehouses/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-109: `PATCH /masters/warehouses/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/warehouses/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-110: `DELETE /masters/warehouses/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Warehouses |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/warehouses/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-111: `GET /masters/charge-codes`
**Purpose:** list chargecodes

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/charge-codes HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-112: `POST /masters/charge-codes`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/charge-codes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-113: `GET /masters/charge-codes/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/charge-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-114: `PATCH /masters/charge-codes/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/charge-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-115: `DELETE /masters/charge-codes/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — ChargeCodes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/charge-codes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-116: `GET /masters/banks`
**Purpose:** list banks

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/banks HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-117: `POST /masters/banks`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/banks HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-118: `GET /masters/banks/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/banks/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-119: `PATCH /masters/banks/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/banks/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-120: `DELETE /masters/banks/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Banks |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/banks/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-121: `GET /masters/holidays`
**Purpose:** list holidays

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/holidays HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-122: `POST /masters/holidays`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/holidays HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-123: `GET /masters/holidays/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/holidays/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-124: `PATCH /masters/holidays/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/holidays/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-125: `DELETE /masters/holidays/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Holidays |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/holidays/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-126: `GET /masters/units-of-measure`
**Purpose:** list unitsofmeasure

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/units-of-measure HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-127: `POST /masters/units-of-measure`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/units-of-measure HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-128: `GET /masters/units-of-measure/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/units-of-measure/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-129: `PATCH /masters/units-of-measure/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/units-of-measure/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-130: `DELETE /masters/units-of-measure/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — UnitsOfMeasure |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/units-of-measure/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-131: `GET /masters/tax-rates`
**Purpose:** list taxrates

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/tax-rates HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-132: `POST /masters/tax-rates`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/tax-rates HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-133: `GET /masters/tax-rates/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/tax-rates/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-134: `PATCH /masters/tax-rates/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/tax-rates/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-135: `DELETE /masters/tax-rates/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — TaxRates |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/tax-rates/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-136: `GET /masters/branches`
**Purpose:** list branches

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/branches HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-137: `POST /masters/branches`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/branches HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-138: `GET /masters/branches/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/branches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-139: `PATCH /masters/branches/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/branches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-140: `DELETE /masters/branches/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Branches |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/branches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-141: `GET /masters/departments`
**Purpose:** list departments

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/departments HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-142: `POST /masters/departments`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/departments HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-143: `GET /masters/departments/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/departments/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-144: `PATCH /masters/departments/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/departments/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-145: `DELETE /masters/departments/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Departments |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/departments/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-146: `GET /masters/designations`
**Purpose:** list designations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/designations HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-147: `POST /masters/designations`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /masters/designations HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-148: `GET /masters/designations/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /masters/designations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-149: `PATCH /masters/designations/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /masters/designations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-150: `DELETE /masters/designations/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Masters — Designations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /masters/designations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-151: `GET /parties`
**Purpose:** List parties (customers, agents, suppliers, carriers, etc.)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /parties HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-152: `POST /parties`
**Purpose:** Create a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /parties HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-153: `GET /parties/export`
**Purpose:** Export parties as CSV

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /parties/export HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-154: `GET /parties/{id}/history`
**Purpose:** Party transaction history — jobs, quotations, invoices, payment requests, audit trail

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /parties/{id}/history HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-155: `GET /parties/{id}`
**Purpose:** Get a party with its contacts and addresses

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /parties/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-156: `PATCH /parties/{id}`
**Purpose:** Update a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /parties/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-157: `DELETE /parties/{id}`
**Purpose:** Soft-delete a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /parties/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-158: `POST /parties/import`
**Purpose:** Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /parties/import HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-159: `PATCH /parties/{id}/credit-status`
**Purpose:** Change credit status (Active / On Hold / Blacklisted)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /parties/{id}/credit-status HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-160: `POST /parties/{id}/contacts`
**Purpose:** Add a contact to a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /parties/{id}/contacts HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-161: `PATCH /parties/{id}/contacts/{contactId}`
**Purpose:** Update a party's contact

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /parties/{id}/contacts/{contactId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-162: `DELETE /parties/{id}/contacts/{contactId}`
**Purpose:** Remove a party's contact

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /parties/{id}/contacts/{contactId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-163: `POST /parties/{id}/addresses`
**Purpose:** Add an address to a party

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /parties/{id}/addresses HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-164: `PATCH /parties/{id}/addresses/{addressId}`
**Purpose:** Update a party's address

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /parties/{id}/addresses/{addressId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-165: `DELETE /parties/{id}/addresses/{addressId}`
**Purpose:** Remove a party's address

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Parties |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /parties/{id}/addresses/{addressId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-166: `GET /organization/profile`
**Purpose:** Get this tenant's own organization profile

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization Profile |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /organization/profile HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-167: `PATCH /organization/profile`
**Purpose:** Update this tenant's own organization profile (Ch.27.1)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization Profile |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /organization/profile HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-168: `GET /organization/bank-accounts`
**Purpose:** List this tenant's own bank accounts

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /organization/bank-accounts HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-169: `POST /organization/bank-accounts`
**Purpose:** Add a bank account

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /organization/bank-accounts HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-170: `GET /organization/bank-accounts/{id}`
**Purpose:** Get a bank account by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /organization/bank-accounts/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-171: `PATCH /organization/bank-accounts/{id}`
**Purpose:** Update a bank account

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /organization/bank-accounts/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-172: `DELETE /organization/bank-accounts/{id}`
**Purpose:** Soft-delete a bank account

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Bank Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /organization/bank-accounts/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-173: `GET /organization/number-formats`
**Purpose:** List all configured document number formats (Ch.2.2)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /organization/number-formats HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-174: `POST /organization/number-formats`
**Purpose:** Configure the number format for a document type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /organization/number-formats HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-175: `GET /organization/number-formats/{documentType}`
**Purpose:** Get the number format for one document type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /organization/number-formats/{documentType} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-176: `PATCH /organization/number-formats/{documentType}`
**Purpose:** Update the number format for a document type

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /organization/number-formats/{documentType} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-177: `GET /organization/number-formats/{documentType}/preview`
**Purpose:** Preview the next number for this format without consuming a sequence value

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Organization — Number Formats |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /organization/number-formats/{documentType}/preview HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-178: `GET /quotations/tariffs`
**Purpose:** List tariff rate cards

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/tariffs HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-179: `POST /quotations/tariffs`
**Purpose:** Create a tariff rate card (sale rate + cost rate per lane/service/container type)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/tariffs HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-180: `GET /quotations/tariffs/{id}`
**Purpose:** Get a tariff by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/tariffs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-181: `PATCH /quotations/tariffs/{id}`
**Purpose:** Update a tariff

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /quotations/tariffs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-182: `DELETE /quotations/tariffs/{id}`
**Purpose:** Soft-delete a tariff

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Online Tariff Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /quotations/tariffs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-183: `GET /quotations/zip-distances`
**Purpose:** List zip-to-zip distances

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/zip-distances HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-184: `POST /quotations/zip-distances`
**Purpose:** Record a distance between two zip/location codes

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/zip-distances HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-185: `GET /quotations/zip-distances/{id}`
**Purpose:** Get a zip distance record by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/zip-distances/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-186: `PATCH /quotations/zip-distances/{id}`
**Purpose:** Update a zip distance record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /quotations/zip-distances/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-187: `DELETE /quotations/zip-distances/{id}`
**Purpose:** Soft-delete a zip distance record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations — Zip Distance Master |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /quotations/zip-distances/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-188: `GET /quotations`
**Purpose:** List quotations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-189: `POST /quotations`
**Purpose:** Create a quotation (DRAFT)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-190: `GET /quotations/reports/chargewise`
**Purpose:** "All Quotations Chargewise" report — same filters as the list, with each charge line included

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/reports/chargewise HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-191: `GET /quotations/reports/analytics`
**Purpose:** Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/reports/analytics HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-192: `GET /quotations/reports/analytics/conversion`
**Purpose:** Win/loss and quote-to-job conversion rates

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/reports/analytics/conversion HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-193: `GET /quotations/reports/analytics/lost-reasons`
**Purpose:** Lost quotation breakdown by reason code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/reports/analytics/lost-reasons HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-194: `GET /quotations/reports/analytics/response-time`
**Purpose:** Average hours from creation to submit/send

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/reports/analytics/response-time HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-195: `POST /quotations/online-quote`
**Purpose:** Public online quote widget — no auth required (Ch.7.5)

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

### FAIL-196: `POST /quotations/expire-due`
**Purpose:** Batch-expire quotations past valid_until (cron / internal only)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/expire-due HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-197: `GET /quotations/{id}`
**Purpose:** Get a quotation with its lines, status history, and approvals

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-198: `PATCH /quotations/{id}`
**Purpose:** Update a quotation header (DRAFT or REJECTED only)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /quotations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-199: `DELETE /quotations/{id}`
**Purpose:** Soft-delete a quotation (DRAFT only)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /quotations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-200: `GET /quotations/{id}/revisions`
**Purpose:** List all revisions in this quotation version chain

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/{id}/revisions HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-201: `POST /quotations/{id}/lines`
**Purpose:** Add a charge line — GP recalculates automatically

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-202: `POST /quotations/{id}/apply-tariff`
**Purpose:** Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/apply-tariff HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-203: `PATCH /quotations/{id}/lines/{lineId}`
**Purpose:** Update a charge line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /quotations/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-204: `DELETE /quotations/{id}/lines/{lineId}`
**Purpose:** Remove a charge line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /quotations/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-205: `POST /quotations/{id}/submit`
**Purpose:** DRAFT/REJECTED -> SUBMITTED, opens the approval cycle

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/submit HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-206: `POST /quotations/{id}/approve`
**Purpose:** SUBMITTED -> APPROVED

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/approve HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-207: `POST /quotations/{id}/reject`
**Purpose:** SUBMITTED -> REJECTED (editable again, can be resubmitted)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/reject HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-208: `POST /quotations/{id}/send`
**Purpose:** APPROVED -> SENT

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/send HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-209: `POST /quotations/{id}/mark-won`
**Purpose:** SENT -> WON

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/mark-won HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-210: `POST /quotations/{id}/mark-lost`
**Purpose:** SENT -> LOST, with a reason code

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/mark-lost HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-211: `POST /quotations/{id}/duplicate`
**Purpose:** Clone into a new revision (new DRAFT, version+1, linked to the same parent)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/duplicate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-212: `POST /quotations/{id}/convert-to-job`
**Purpose:** WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/convert-to-job HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-213: `POST /quotations/{id}/archive`
**Purpose:** Archive a closed quotation (soft-delete)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/archive HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-214: `POST /quotations/{id}/expire`
**Purpose:** Manually expire a quotation past its valid_until date

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/expire HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-215: `POST /quotations/{id}/pdf`
**Purpose:** Queue PDF generation for a quotation (customer or internal mode)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-216: `GET /quotations/{id}/pdf`
**Purpose:** Get quotation PDF URLs and recent generation tasks

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/{id}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-217: `GET /quotations/{id}/pdf/status`
**Purpose:** List PDF generation task status for a quotation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /quotations/{id}/pdf/status HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-218: `POST /quotations/{id}/send-email`
**Purpose:** Email quotation PDF to customer (generates PDF if not yet available)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Quotations |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /quotations/{id}/send-email HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-219: `GET /jobs`
**Purpose:** List jobs

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-220: `POST /jobs`
**Purpose:** Create a job (booking). AIR_EXPORT auto-seeds 15 milestones; SEA_FCL_EXPORT auto-seeds 16 FCL milestones + sea_fcl_details. Set parent_job_id for a HOUSE job.

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-221: `GET /jobs/{id}`
**Purpose:** Get a job with air details, charges, milestones, and its house jobs (if a master)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-222: `PATCH /jobs/{id}`
**Purpose:** Update a job (not allowed once COMPLETED or CANCELLED)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-223: `DELETE /jobs/{id}`
**Purpose:** Soft-delete a completed or cancelled job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /jobs/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-224: `GET /jobs/{id}/house-jobs`
**Purpose:** List the house jobs consolidated under this master job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/house-jobs HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-225: `GET /jobs/{id}/milestones`
**Purpose:** List all milestones for a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/milestones HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-226: `POST /jobs/{id}/milestones`
**Purpose:** Add a custom milestone outside the standard taxonomy

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/milestones HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-227: `GET /jobs/{id}/pnl`
**Purpose:** Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/pnl HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-228: `GET /jobs/{id}/notes`
**Purpose:** List notes on a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/notes HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-229: `POST /jobs/{id}/notes`
**Purpose:** Add a note to a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/notes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-230: `GET /jobs/{id}/documents`
**Purpose:** List documents attached to a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/documents HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-231: `POST /jobs/{id}/documents`
**Purpose:** Register a document on a job (metadata + file URL)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-232: `GET /jobs/{id}/containers`
**Purpose:** List containers on a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/containers HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-233: `POST /jobs/{id}/containers`
**Purpose:** Add a container to a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/containers HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-234: `GET /jobs/{id}/containers/fill`
**Purpose:** Container fill indicators — weight % and CBM % for all containers

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/containers/fill HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-235: `GET /jobs/{id}/containers/{containerId}/fill`
**Purpose:** Container fill indicator for one container

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/containers/{containerId}/fill HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-236: `GET /jobs/{id}/cutoffs`
**Purpose:** SI / VGM / CY cutoff traffic-light status (green / amber ≤24h / red past)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/cutoffs HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-237: `GET /jobs/{id}/cargo`
**Purpose:** List FCL cargo lines on a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/cargo HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-238: `POST /jobs/{id}/cargo`
**Purpose:** Add an FCL cargo line (optionally assigned to a container)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/cargo HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-239: `GET /jobs/{id}/bills-of-lading`
**Purpose:** List bills of lading on a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/bills-of-lading HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-240: `POST /jobs/{id}/bills-of-lading`
**Purpose:** Create a bill of lading data record (PDF variants are Week 8)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/bills-of-lading HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-241: `GET /jobs/{id}/stuffing-records`
**Purpose:** List stuffing records on a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/stuffing-records HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-242: `POST /jobs/{id}/stuffing-records`
**Purpose:** Create a stuffing record and mark STUFFING_COMPLETED

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/stuffing-records HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-243: `POST /jobs/{id}/close`
**Purpose:** Close a job (status -> COMPLETED)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/close HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-244: `POST /jobs/{id}/cancel`
**Purpose:** Cancel a job (status -> CANCELLED)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-245: `PATCH /jobs/{id}/air-details`
**Purpose:** Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/air-details HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-246: `PATCH /jobs/{id}/sea-fcl-details`
**Purpose:** Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs, VGM/SI)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/sea-fcl-details HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-247: `POST /jobs/{id}/sea-fcl-details/si-submission`
**Purpose:** Record SI submission (date + version) and mark SI_SUBMITTED milestone

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/sea-fcl-details/si-submission HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-248: `POST /jobs/{id}/sea-fcl-details/vgm-submission`
**Purpose:** Record VGM submission (date + SM1/SM2) and mark VGM_SUBMITTED milestone

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/sea-fcl-details/vgm-submission HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-249: `PATCH /jobs/{id}/milestones/{milestoneId}`
**Purpose:** Update a milestone — set actual_date to mark it complete

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/milestones/{milestoneId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-250: `POST /jobs/{id}/charges`
**Purpose:** Add a charge line — Job P&L recalculates automatically

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/charges HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-251: `PATCH /jobs/{id}/charges/{chargeId}`
**Purpose:** Update a charge line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/charges/{chargeId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-252: `DELETE /jobs/{id}/charges/{chargeId}`
**Purpose:** Remove a charge line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /jobs/{id}/charges/{chargeId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-253: `POST /jobs/{id}/prorate-cost/{chargeCodeId}`
**Purpose:** Distribute a master job's cost line to its house jobs, proportionally by chargeable weight

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/prorate-cost/{chargeCodeId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-254: `PATCH /jobs/{id}/notes/{noteId}`
**Purpose:** Update a job note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/notes/{noteId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-255: `DELETE /jobs/{id}/notes/{noteId}`
**Purpose:** Remove a job note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /jobs/{id}/notes/{noteId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-256: `PATCH /jobs/{id}/documents/{documentId}`
**Purpose:** Update a draft document metadata

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/documents/{documentId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-257: `DELETE /jobs/{id}/documents/{documentId}`
**Purpose:** Remove a draft document

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /jobs/{id}/documents/{documentId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-258: `POST /jobs/{id}/documents/{documentId}/finalize`
**Purpose:** Finalize a document (DRAFT -> ORIGINAL, locked)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/{documentId}/finalize HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-259: `GET /jobs/{id}/documents/generation-status`
**Purpose:** List async document generation tasks for a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/documents/generation-status HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-260: `POST /jobs/{id}/documents/hawb`
**Purpose:** Queue HAWB PDF generation (Puppeteer + BullMQ)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/hawb HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-261: `POST /jobs/{id}/documents/mawb`
**Purpose:** Queue MAWB PDF generation (Puppeteer + BullMQ)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/mawb HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-262: `POST /jobs/{id}/documents/pre-alert`
**Purpose:** Queue pre-alert document PDF generation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/pre-alert HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-263: `POST /jobs/{id}/documents/cargo-manifest`
**Purpose:** Queue cargo manifest PDF generation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/cargo-manifest HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-264: `POST /jobs/{id}/documents/hbl`
**Purpose:** Queue HBL draft/original PDF (layout_variant: STANDARD | LAYOUT_A | LAYOUT_B)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/hbl HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-265: `POST /jobs/{id}/documents/hbl-express-release`
**Purpose:** Queue Non-Negotiable HBL Express/Telex Release PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/hbl-express-release HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-266: `POST /jobs/{id}/documents/mbl`
**Purpose:** Queue Master BL / OBL PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/mbl HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-267: `POST /jobs/{id}/documents/fiata-bl`
**Purpose:** Queue FIATA FBL PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/fiata-bl HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-268: `POST /jobs/{id}/documents/rider-bl`
**Purpose:** Queue Rider/Addendum to BL PDF (pass rider_terms)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/rider-bl HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-269: `POST /jobs/{id}/documents/switch-bl`
**Purpose:** Queue Switch BL PDF (switched_from_bl_number + switch consignee/notify)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/switch-bl HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-270: `POST /jobs/{id}/documents/proxy-bl`
**Purpose:** Queue Proxy BL PDF (proxy_forwarder_name / address)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/proxy-bl HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-271: `POST /jobs/{id}/documents/back-to-back-bl`
**Purpose:** Queue Back-to-Back BL PDF (master + house pair)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/back-to-back-bl HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-272: `POST /jobs/{id}/documents/surrender-notice`
**Purpose:** Queue BL Surrender Notice PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/surrender-notice HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-273: `POST /jobs/{id}/documents/si`
**Purpose:** Queue Shipping Instruction (SI) PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/si HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-274: `POST /jobs/{id}/documents/stuffing-report`
**Purpose:** Queue Stuffing Report PDF from stuffing records + containers

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/stuffing-report HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-275: `POST /jobs/{id}/documents/sailing-confirmation`
**Purpose:** Queue Sailing Confirmation PDF (uses sailed_at / vessel sailed milestone)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/sailing-confirmation HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-276: `POST /jobs/{id}/documents/transhipment-confirmation`
**Purpose:** Queue Transhipment Confirmation PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/transhipment-confirmation HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-277: `POST /jobs/{id}/documents/freight-manifest`
**Purpose:** Queue Freight Manifest PDF (FCL)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/freight-manifest HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-278: `POST /jobs/{id}/documents/job-card`
**Purpose:** Queue Job Card PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/job-card HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-279: `POST /jobs/{id}/documents/job-pnl`
**Purpose:** Queue Job P&L Statement PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/job-pnl HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-280: `POST /jobs/{id}/documents/proforma-invoice`
**Purpose:** Queue Proforma Invoice PDF for the job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/proforma-invoice HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-281: `POST /jobs/{id}/pre-alert/send`
**Purpose:** Send pre-alert and mark PRE_ALERT_SENT milestone complete

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/pre-alert/send HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-282: `POST /jobs/{id}/pre-alert/schedule`
**Purpose:** Schedule a pre-alert email for a future UTC time (cron delivers it)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/pre-alert/schedule HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-283: `POST /jobs/{id}/whatsapp/status`
**Purpose:** Send WhatsApp status stub (logged until WHATSAPP_ENABLED=true)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/whatsapp/status HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-284: `GET /jobs/{id}/sub-jobs`
**Purpose:** List operational sub-jobs under this parent

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/sub-jobs HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-285: `POST /jobs/{id}/sub-jobs`
**Purpose:** Create an operational sub-job under this parent

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/sub-jobs HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-286: `POST /jobs/{id}/payment-requests`
**Purpose:** Create a payment request from job totals / parties

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/payment-requests HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-287: `POST /jobs/{id}/documents/e-awb`
**Purpose:** Queue E-AWB PDF generation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/e-awb HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-288: `POST /jobs/{id}/documents/barcode-label`
**Purpose:** Queue barcode label PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/barcode-label HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-289: `POST /jobs/{id}/documents/consignee-label`
**Purpose:** Queue consignee label PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/consignee-label HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-290: `POST /jobs/{id}/documents/job-costing`
**Purpose:** Queue job costing sheet PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/job-costing HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-291: `POST /jobs/{id}/documents/freight-certificate`
**Purpose:** Queue freight certificate PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/freight-certificate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-292: `PATCH /jobs/{id}/containers/{containerId}`
**Purpose:** Update a container on a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/containers/{containerId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-293: `DELETE /jobs/{id}/containers/{containerId}`
**Purpose:** Remove a container from a Sea FCL job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /jobs/{id}/containers/{containerId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-294: `POST /jobs/{id}/containers/{containerId}/cargo`
**Purpose:** Assign an existing cargo line to a container

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/containers/{containerId}/cargo HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-295: `POST /jobs/{id}/containers/{containerId}/split`
**Purpose:** Split one container across multiple house consignees (co-loading)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/containers/{containerId}/split HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-296: `PATCH /jobs/{id}/cargo/{cargoId}`
**Purpose:** Update an FCL cargo line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/cargo/{cargoId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-297: `DELETE /jobs/{id}/cargo/{cargoId}`
**Purpose:** Remove an FCL cargo line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /jobs/{id}/cargo/{cargoId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-298: `PATCH /jobs/{id}/bills-of-lading/{blId}`
**Purpose:** Update a bill of lading (draft → original / surrendered flags)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/bills-of-lading/{blId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-299: `DELETE /jobs/{id}/bills-of-lading/{blId}`
**Purpose:** Soft-delete a bill of lading

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /jobs/{id}/bills-of-lading/{blId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-300: `PATCH /jobs/{id}/stuffing-records/{recordId}`
**Purpose:** Update a stuffing record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/stuffing-records/{recordId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-301: `DELETE /jobs/{id}/stuffing-records/{recordId}`
**Purpose:** Soft-delete a stuffing record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /jobs/{id}/stuffing-records/{recordId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-302: `GET /jobs/{id}/free-days`
**Purpose:** List per-container free days + demurrage/detention accrual (traffic light)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/free-days HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-303: `POST /jobs/{id}/free-days`
**Purpose:** Upsert free-days / demurrage rates for a container

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/free-days HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-304: `POST /jobs/{id}/free-days/recalculate`
**Purpose:** Recalculate demurrage + detention accruals for all containers on the job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/free-days/recalculate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-305: `GET /jobs/{id}/deposits`
**Purpose:** List customs / port deposits with expiry alert bands

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/deposits HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-306: `POST /jobs/{id}/deposits`
**Purpose:** Create a customs or port deposit record

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/deposits HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-307: `PATCH /jobs/{id}/deposits/{depositId}`
**Purpose:** Update a deposit

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/deposits/{depositId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-308: `DELETE /jobs/{id}/deposits/{depositId}`
**Purpose:** Soft-delete a deposit

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /jobs/{id}/deposits/{depositId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-309: `PATCH /jobs/{id}/customs-status`
**Purpose:** Update customs clearance workflow (PENDING→FILED→QUERY→CLEARED→RELEASED)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /jobs/{id}/customs-status HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-310: `POST /jobs/{id}/containers/{containerId}/return`
**Purpose:** Record container return to shipping line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/containers/{containerId}/return HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-311: `GET /jobs/{id}/part-deliveries`
**Purpose:** List part deliveries

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/part-deliveries HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-312: `POST /jobs/{id}/part-deliveries`
**Purpose:** Record a part delivery (remaining balance auto-calculated from job pieces)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/part-deliveries HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-313: `GET /jobs/{id}/pods`
**Purpose:** List proofs of delivery

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/pods HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-314: `POST /jobs/{id}/pods`
**Purpose:** Record proof of delivery

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/pods HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-315: `GET /jobs/{id}/damage-reports`
**Purpose:** List damage reports

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /jobs/{id}/damage-reports HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-316: `POST /jobs/{id}/damage-reports`
**Purpose:** Create a damage report (description + photo URLs + survey #)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/damage-reports HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-317: `POST /jobs/{id}/transhipment-link`
**Purpose:** Link this FCL Import job to an outbound SEA_FCL_EXPORT job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/transhipment-link HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-318: `POST /jobs/{id}/cfs-storage/calculate`
**Purpose:** Calculate CFS storage: days × rate_per_day from sea-fcl-details

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/cfs-storage/calculate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-319: `POST /jobs/{id}/documents/pre-can`
**Purpose:** Queue Pre-CAN (pre-arrival notice) PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/pre-can HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-320: `POST /jobs/{id}/documents/can`
**Purpose:** Queue Cargo Arrival Notice (CAN) PDF and mark CAN_SENT

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/can HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-321: `POST /jobs/{id}/documents/exchange-letter`
**Purpose:** Queue Exchange Letter PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/exchange-letter HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-322: `POST /jobs/{id}/documents/undertake-letter`
**Purpose:** Queue Undertake Letter PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/undertake-letter HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-323: `POST /jobs/{id}/documents/delivery-order`
**Purpose:** Queue Delivery Order PDF and mark DO_ISSUED

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/delivery-order HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-324: `POST /jobs/{id}/documents/transport-request`
**Purpose:** Queue Transport Request PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/transport-request HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-325: `POST /jobs/{id}/documents/shipping-advice`
**Purpose:** Queue Shipping Advice PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/shipping-advice HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-326: `POST /jobs/{id}/documents/proof-of-delivery`
**Purpose:** Queue Proof of Delivery PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Jobs |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /jobs/{id}/documents/proof-of-delivery HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-327: `GET /awb-stock/batches`
**Purpose:** List AWB stock batches

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /awb-stock/batches HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-328: `POST /awb-stock/batches`
**Purpose:** Register a new AWB number range for an airline

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /awb-stock/batches HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-329: `GET /awb-stock/reports/low-stock`
**Purpose:** Batches at or below their low-stock threshold

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /awb-stock/reports/low-stock HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-330: `GET /awb-stock/allocations`
**Purpose:** List AWB allocations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /awb-stock/allocations HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-331: `GET /awb-stock/batches/{id}`
**Purpose:** Get an AWB stock batch with recent allocations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /awb-stock/batches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-332: `PATCH /awb-stock/batches/{id}`
**Purpose:** Update batch metadata (threshold, notes)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /awb-stock/batches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-333: `DELETE /awb-stock/batches/{id}`
**Purpose:** Soft-delete an empty AWB stock batch

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /awb-stock/batches/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-334: `POST /awb-stock/batches/{id}/allocate`
**Purpose:** Allocate the next AWB number from a batch to a job

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /awb-stock/batches/{id}/allocate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-335: `POST /awb-stock/batches/{id}/transfer-branch`
**Purpose:** Transfer batch ownership to another branch

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /awb-stock/batches/{id}/transfer-branch HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-336: `POST /awb-stock/allocations/{id}/void`
**Purpose:** Void an allocated (unused) AWB number

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /awb-stock/allocations/{id}/void HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-337: `POST /awb-stock/allocations/{id}/mark-used`
**Purpose:** Mark an allocated AWB as used (flown/printed)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | AWB Stock |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /awb-stock/allocations/{id}/mark-used HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-338: `GET /search`
**Purpose:** Global search across jobs, quotations, and parties

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Search |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /search HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-339: `GET /files/{tenantId}/{filename}`
**Purpose:** Download a locally stored file (PDFs generated by the system)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Files |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /files/{tenantId}/{filename} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-340: `GET /invoices`
**Purpose:** List customer invoices (Ch.18)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /invoices HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-341: `POST /invoices`
**Purpose:** Create a draft customer invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /invoices HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-342: `GET /invoices/reports/overdue`
**Purpose:** Overdue customer invoices past due_date with outstanding balance

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /invoices/reports/overdue HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-343: `GET /invoices/{id}`
**Purpose:** Get invoice with lines

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-344: `PATCH /invoices/{id}`
**Purpose:** Update a draft invoice header

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-345: `DELETE /invoices/{id}`
**Purpose:** Soft-delete a draft invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-346: `POST /invoices/from-job/{jobId}`
**Purpose:** Create draft invoice from uninvoiced billable job charges

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /invoices/from-job/{jobId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-347: `POST /invoices/{id}/lines`
**Purpose:** Add a line to a draft invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /invoices/{id}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-348: `PATCH /invoices/{id}/lines/{lineId}`
**Purpose:** Update an invoice line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /invoices/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-349: `DELETE /invoices/{id}/lines/{lineId}`
**Purpose:** Remove an invoice line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /invoices/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-350: `POST /invoices/{id}/post`
**Purpose:** Post a draft invoice (DRAFT -> POSTED)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /invoices/{id}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-351: `POST /invoices/{id}/send`
**Purpose:** Email invoice PDF to customer

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /invoices/{id}/send HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-352: `POST /invoices/{id}/pdf`
**Purpose:** Generate invoice PDF

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /invoices/{id}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-353: `GET /invoices/{id}/pdf`
**Purpose:** Get invoice PDF metadata

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /invoices/{id}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-354: `POST /invoices/{id}/cancel`
**Purpose:** Cancel an invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /invoices/{id}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-355: `GET /credit-notes`
**Purpose:** List credit notes

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Credit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /credit-notes HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-356: `POST /credit-notes`
**Purpose:** Create a credit note against a posted customer invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Credit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /credit-notes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-357: `GET /credit-notes/{id}`
**Purpose:** Get a credit note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Credit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /credit-notes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-358: `POST /credit-notes/{id}/post`
**Purpose:** Post a draft credit note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Credit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /credit-notes/{id}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-359: `GET /debit-notes`
**Purpose:** List debit notes

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Debit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /debit-notes HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-360: `POST /debit-notes`
**Purpose:** Create a debit note against a posted customer invoice (extra charge)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Debit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /debit-notes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-361: `GET /debit-notes/{id}`
**Purpose:** Get a debit note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Debit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /debit-notes/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-362: `POST /debit-notes/{id}/post`
**Purpose:** Post a draft debit note

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Debit Notes |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /debit-notes/{id}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-363: `GET /purchase-invoices`
**Purpose:** List purchase invoices (vendor bills)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /purchase-invoices HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-364: `POST /purchase-invoices`
**Purpose:** Create a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /purchase-invoices HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-365: `GET /purchase-invoices/{id}`
**Purpose:** Get a purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /purchase-invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-366: `PATCH /purchase-invoices/{id}`
**Purpose:** Update a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /purchase-invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-367: `DELETE /purchase-invoices/{id}`
**Purpose:** Soft-delete a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /purchase-invoices/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-368: `POST /purchase-invoices/{id}/post`
**Purpose:** Post a draft purchase invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Purchase Invoices |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /purchase-invoices/{id}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-369: `GET /payment-requests`
**Purpose:** List payment requests

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /payment-requests HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-370: `POST /payment-requests`
**Purpose:** Create a payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /payment-requests HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-371: `GET /payment-requests/{id}`
**Purpose:** Get a payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /payment-requests/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-372: `PATCH /payment-requests/{id}`
**Purpose:** Update a pending payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /payment-requests/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-373: `DELETE /payment-requests/{id}`
**Purpose:** Soft-delete a pending payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /payment-requests/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-374: `POST /payment-requests/{id}/approve`
**Purpose:** Approve a payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /payment-requests/{id}/approve HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-375: `POST /payment-requests/{id}/reject`
**Purpose:** Reject a payment request

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /payment-requests/{id}/reject HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-376: `POST /payment-requests/{id}/mark-paid`
**Purpose:** Mark an approved payment request as paid

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | Payment Requests |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /payment-requests/{id}/mark-paid HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-377: `GET /gl/accounts`
**Purpose:** List chart of accounts (Ch.17)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Chart of Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/accounts HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-378: `POST /gl/accounts`
**Purpose:** Create a GL account

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Chart of Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/accounts HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-379: `GET /gl/accounts/tree`
**Purpose:** Hierarchical chart of accounts tree

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Chart of Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/accounts/tree HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-380: `GET /gl/accounts/reports/trial-balance`
**Purpose:** Trial balance from posted voucher lines + opening balances

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Chart of Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/accounts/reports/trial-balance HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-381: `POST /gl/accounts/seed-defaults`
**Purpose:** Seed a starter freight COA (only when empty)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Chart of Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/accounts/seed-defaults HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-382: `GET /gl/accounts/{id}`
**Purpose:** Get account by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Chart of Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/accounts/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-383: `PATCH /gl/accounts/{id}`
**Purpose:** Update a GL account

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Chart of Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /gl/accounts/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-384: `DELETE /gl/accounts/{id}`
**Purpose:** Soft-delete a GL account (blocked if used on voucher lines)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Chart of Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /gl/accounts/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-385: `GET /gl/accounts/{id}/ledger`
**Purpose:** GL register for one account (posted vouchers)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Chart of Accounts |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/accounts/{id}/ledger HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-386: `GET /gl/vouchers`
**Purpose:** List vouchers (Ch.17)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/vouchers HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-387: `POST /gl/vouchers`
**Purpose:** Create a draft voucher (optionally with lines)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/vouchers HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-388: `GET /gl/vouchers/{id}`
**Purpose:** Get voucher with lines

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/vouchers/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-389: `PATCH /gl/vouchers/{id}`
**Purpose:** Update draft voucher header

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /gl/vouchers/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-390: `DELETE /gl/vouchers/{id}`
**Purpose:** Soft-delete a draft voucher

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /gl/vouchers/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-391: `POST /gl/vouchers/{id}/lines`
**Purpose:** Add a line to a draft voucher

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/vouchers/{id}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-392: `PATCH /gl/vouchers/{id}/lines/{lineId}`
**Purpose:** Update a draft voucher line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /gl/vouchers/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-393: `DELETE /gl/vouchers/{id}/lines/{lineId}`
**Purpose:** Remove a line from a draft voucher

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /gl/vouchers/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-394: `POST /gl/vouchers/{id}/post`
**Purpose:** Post a balanced draft voucher to the GL

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/vouchers/{id}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-395: `POST /gl/vouchers/{id}/reverse`
**Purpose:** Create an offsetting posted reversal voucher

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Vouchers |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/vouchers/{id}/reverse HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-396: `GET /gl/payments`
**Purpose:** List customer receipts and vendor payments (Ch.19)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Payments (AR/AP) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/payments HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-397: `POST /gl/payments`
**Purpose:** Create a draft receipt or vendor payment

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Payments (AR/AP) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 503 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 503 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/payments HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-398: `GET /gl/payments/{id}`
**Purpose:** Get payment with allocations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Payments (AR/AP) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/payments/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-399: `PATCH /gl/payments/{id}`
**Purpose:** Update a draft payment header

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Payments (AR/AP) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /gl/payments/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-400: `DELETE /gl/payments/{id}`
**Purpose:** Soft-delete a draft payment

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Payments (AR/AP) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /gl/payments/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-401: `POST /gl/payments/{id}/allocations`
**Purpose:** Allocate payment amount to an open invoice

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Payments (AR/AP) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/payments/{id}/allocations HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-402: `DELETE /gl/payments/{id}/allocations/{allocationId}`
**Purpose:** Remove a draft payment allocation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Payments (AR/AP) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /gl/payments/{id}/allocations/{allocationId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-403: `POST /gl/payments/{id}/post`
**Purpose:** Post payment: update invoice balances + create GL voucher

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Payments (AR/AP) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/payments/{id}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-404: `POST /gl/payments/{id}/cancel`
**Purpose:** Cancel payment (reverses invoice balances and GL if posted)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Payments (AR/AP) |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/payments/{id}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-405: `GET /gl/ar/aging`
**Purpose:** Accounts Receivable aging buckets (Ch.19.1)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — AR / AP Aging |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/ar/aging HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-406: `GET /gl/ap/aging`
**Purpose:** Accounts Payable aging buckets (Ch.19.2)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — AR / AP Aging |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/ap/aging HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-407: `GET /gl/ar/statement/{partyId}`
**Purpose:** Customer AR statement (invoices + receipts)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — AR / AP Aging |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/ar/statement/{partyId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-408: `GET /gl/ap/statement/{partyId}`
**Purpose:** Vendor AP statement (purchase invoices + payments)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — AR / AP Aging |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/ap/statement/{partyId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-409: `GET /gl/cheques`
**Purpose:** List cheques (receivable / payable / PDC)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Cheques / PDC |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/cheques HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-410: `POST /gl/cheques`
**Purpose:** Register a cheque / PDC

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Cheques / PDC |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/cheques HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-411: `GET /gl/cheques/reports/pdc-due`
**Purpose:** PDC due within N days (default 30)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Cheques / PDC |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/cheques/reports/pdc-due HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-412: `GET /gl/cheques/{id}`
**Purpose:** Get cheque by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Cheques / PDC |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/cheques/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-413: `PATCH /gl/cheques/{id}`
**Purpose:** Update a pending cheque

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Cheques / PDC |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /gl/cheques/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-414: `POST /gl/cheques/{id}/deposit`
**Purpose:** Mark cheque deposited

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Cheques / PDC |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/cheques/{id}/deposit HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-415: `POST /gl/cheques/{id}/clear`
**Purpose:** Mark cheque cleared

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Cheques / PDC |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/cheques/{id}/clear HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-416: `POST /gl/cheques/{id}/bounce`
**Purpose:** Mark cheque bounced

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Cheques / PDC |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/cheques/{id}/bounce HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-417: `POST /gl/cheques/{id}/cancel`
**Purpose:** Cancel a cheque

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Cheques / PDC |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/cheques/{id}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-418: `POST /gl/bank-transfers`
**Purpose:** Post a contra bank/cash transfer voucher (Ch.19.3)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/bank-transfers HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-419: `GET /gl/bank-reconciliations`
**Purpose:** List bank reconciliations

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/bank-reconciliations HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-420: `POST /gl/bank-reconciliations`
**Purpose:** Start a draft bank reconciliation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/bank-reconciliations HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-421: `GET /gl/bank-reconciliations/{id}`
**Purpose:** Get bank reconciliation with lines + summary

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/bank-reconciliations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-422: `PATCH /gl/bank-reconciliations/{id}`
**Purpose:** Update draft bank reconciliation header

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /gl/bank-reconciliations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-423: `DELETE /gl/bank-reconciliations/{id}`
**Purpose:** Cancel / soft-delete a draft reconciliation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /gl/bank-reconciliations/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-424: `GET /gl/bank-reconciliations/{id}/unmatched`
**Purpose:** Posted bank GL lines not yet matched on this recon

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/bank-reconciliations/{id}/unmatched HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-425: `POST /gl/bank-reconciliations/{id}/lines`
**Purpose:** Add a matched / statement line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/bank-reconciliations/{id}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-426: `PATCH /gl/bank-reconciliations/{id}/lines/{lineId}`
**Purpose:** Update recon line match flags

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /gl/bank-reconciliations/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-427: `DELETE /gl/bank-reconciliations/{id}/lines/{lineId}`
**Purpose:** Remove a recon line

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /gl/bank-reconciliations/{id}/lines/{lineId} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-428: `POST /gl/bank-reconciliations/{id}/complete`
**Purpose:** Complete bank reconciliation

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Bank Reconciliation |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/bank-reconciliations/{id}/complete HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-429: `GET /gl/reports/trial-balance`
**Purpose:** Trial balance (Ch.20.1) — also available at GET /gl/accounts/reports/trial-balance

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Financial Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/reports/trial-balance HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-430: `GET /gl/reports/balance-sheet`
**Purpose:** Balance Sheet as of a date (Ch.20.1 / Week 12)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Financial Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/reports/balance-sheet HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-431: `GET /gl/reports/profit-and-loss`
**Purpose:** Profit & Loss for a period (Ch.20.1 / Week 12)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Financial Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/reports/profit-and-loss HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-432: `GET /gl/reports/cash-flow`
**Purpose:** Cash Flow from bank/cash voucher activity (Ch.20.1 / Week 12)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Financial Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/reports/cash-flow HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-433: `GET /gl/reports/vat-return`
**Purpose:** UAE VAT return draft from posted invoices (Ch.20.2 / Week 12)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — Financial Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/reports/vat-return HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-434: `GET /gl/mis/dashboard`
**Purpose:** Management MIS dashboard widgets (Ch.23 / Week 12)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — MIS Dashboard |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/mis/dashboard HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-435: `GET /gl/mis/profitability`
**Purpose:** Job profitability by shipper / job_type / branch / salesperson (Ch.23)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — MIS Dashboard |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/mis/profitability HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-436: `GET /gl/mis/operational`
**Purpose:** Operational KPIs — pending PRs, draft invoices, uninvoiced charges

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — MIS Dashboard |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/mis/operational HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-437: `GET /gl/saved-reports`
**Purpose:** List saved / shared report configurations (Ch.23 My Reports)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — My Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/saved-reports HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-438: `POST /gl/saved-reports`
**Purpose:** Save a report configuration (filters + type)

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — My Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
POST /gl/saved-reports HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-439: `GET /gl/saved-reports/{id}`
**Purpose:** Get a saved report by id

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — My Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
GET /gl/saved-reports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

### FAIL-440: `PATCH /gl/saved-reports/{id}`
**Purpose:** Update a saved report

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — My Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
PATCH /gl/saved-reports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

---

### FAIL-441: `DELETE /gl/saved-reports/{id}`
**Purpose:** Soft-delete a saved report

| Field | Value |
|-------|-------|
| Case | **FAIL** |
| Tag | GL — My Reports |
| Primary attack | No `Authorization` header |
| Expected | **401 Unauthorized** |
| Live status | **EXECUTED_FAIL (API did not reject as expected)** |
| Live HTTP | 429 |
| Live title | No Authorization header |
| Live notes | Expected 401, got 429 |
| Assertion | FAIL — unexpected response |

```http
DELETE /gl/saved-reports/{id} HTTP/1.1
Host: kingfisherwings.onrender.com
```

---

## Coverage
- APIs in OpenAPI: **441**
- FAIL sections: **441**
- Missing: **0**