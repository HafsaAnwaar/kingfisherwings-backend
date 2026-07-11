# API FAIL Cases — Complete Catalog

**Base URL:** `https://kingfisherwings.onrender.com`
**Swagger:** https://kingfisherwings.onrender.com/docs
**Total APIs:** 287 (every OpenAPI operation — none skipped)
**Generated:** 2026-07-11T06:33:56.029Z

## How to use

Each API has **at least one primary FAIL case**. Secured routes also list secondary fails.

| Expected | Meaning |
|----------|---------|
| **401** | Missing/invalid JWT |
| **400** | Validation / bad body |
| **403** | Authenticated but missing permission/role |
| **404** | Unknown id or cross-tenant id |
| **409** | Duplicate unique key |

| # | Method | Path | Tag | Primary fail |
|---|--------|------|-----|--------------|
| 1 | POST | `/auth/change-password` | Auth | 401 |
| 2 | POST | `/auth/login` | Auth | 400 |
| 3 | POST | `/auth/logout` | Auth | 401 |
| 4 | POST | `/auth/logout-all` | Auth | 401 |
| 5 | GET | `/auth/me` | Auth | 401 |
| 6 | POST | `/auth/refresh` | Auth | 400 |
| 7 | GET | `/auth/sessions` | Auth | 401 |
| 8 | POST | `/auth/sessions/{sessionId}/revoke` | Auth | 401 |
| 9 | POST | `/auth/super-admin/login` | Auth | 400 |
| 10 | POST | `/auth/super-admin/signup` | Auth | 400 |
| 11 | POST | `/auth/tenant-login` | Auth | 400 |
| 12 | POST | `/auth/tenant/change-password` | Auth | 401 |
| 13 | GET | `/awb-stock/allocations` | AWB Stock | 401 |
| 14 | POST | `/awb-stock/allocations/{id}/mark-used` | AWB Stock | 401 |
| 15 | POST | `/awb-stock/allocations/{id}/void` | AWB Stock | 401 |
| 16 | GET | `/awb-stock/batches` | AWB Stock | 401 |
| 17 | POST | `/awb-stock/batches` | AWB Stock | 401 |
| 18 | DELETE | `/awb-stock/batches/{id}` | AWB Stock | 401 |
| 19 | GET | `/awb-stock/batches/{id}` | AWB Stock | 401 |
| 20 | PATCH | `/awb-stock/batches/{id}` | AWB Stock | 401 |
| 21 | POST | `/awb-stock/batches/{id}/allocate` | AWB Stock | 401 |
| 22 | POST | `/awb-stock/batches/{id}/transfer-branch` | AWB Stock | 401 |
| 23 | GET | `/awb-stock/reports/low-stock` | AWB Stock | 401 |
| 24 | GET | `/companies` | Companies | 401 |
| 25 | POST | `/companies` | Companies | 401 |
| 26 | DELETE | `/companies/{id}` | Companies | 401 |
| 27 | GET | `/companies/{id}` | Companies | 401 |
| 28 | PATCH | `/companies/{id}` | Companies | 401 |
| 29 | GET | `/credit-notes` | Credit Notes | 401 |
| 30 | POST | `/credit-notes` | Credit Notes | 401 |
| 31 | GET | `/credit-notes/{id}` | Credit Notes | 401 |
| 32 | POST | `/credit-notes/{id}/post` | Credit Notes | 401 |
| 33 | GET | `/files/{tenantId}/{filename}` | Files | 401 |
| 34 | GET | `/invoices` | Invoices | 401 |
| 35 | POST | `/invoices` | Invoices | 401 |
| 36 | DELETE | `/invoices/{id}` | Invoices | 401 |
| 37 | GET | `/invoices/{id}` | Invoices | 401 |
| 38 | PATCH | `/invoices/{id}` | Invoices | 401 |
| 39 | POST | `/invoices/{id}/cancel` | Invoices | 401 |
| 40 | POST | `/invoices/{id}/lines` | Invoices | 401 |
| 41 | DELETE | `/invoices/{id}/lines/{lineId}` | Invoices | 401 |
| 42 | PATCH | `/invoices/{id}/lines/{lineId}` | Invoices | 401 |
| 43 | GET | `/invoices/{id}/pdf` | Invoices | 401 |
| 44 | POST | `/invoices/{id}/pdf` | Invoices | 401 |
| 45 | POST | `/invoices/{id}/post` | Invoices | 401 |
| 46 | POST | `/invoices/{id}/send` | Invoices | 401 |
| 47 | POST | `/invoices/from-job/{jobId}` | Invoices | 401 |
| 48 | GET | `/invoices/reports/overdue` | Invoices | 401 |
| 49 | GET | `/jobs` | Jobs | 401 |
| 50 | POST | `/jobs` | Jobs | 401 |
| 51 | DELETE | `/jobs/{id}` | Jobs | 401 |
| 52 | GET | `/jobs/{id}` | Jobs | 401 |
| 53 | PATCH | `/jobs/{id}` | Jobs | 401 |
| 54 | PATCH | `/jobs/{id}/air-details` | Jobs | 401 |
| 55 | POST | `/jobs/{id}/cancel` | Jobs | 401 |
| 56 | POST | `/jobs/{id}/charges` | Jobs | 401 |
| 57 | DELETE | `/jobs/{id}/charges/{chargeId}` | Jobs | 401 |
| 58 | PATCH | `/jobs/{id}/charges/{chargeId}` | Jobs | 401 |
| 59 | POST | `/jobs/{id}/close` | Jobs | 401 |
| 60 | GET | `/jobs/{id}/containers` | Jobs | 401 |
| 61 | POST | `/jobs/{id}/containers` | Jobs | 401 |
| 62 | DELETE | `/jobs/{id}/containers/{containerId}` | Jobs | 401 |
| 63 | PATCH | `/jobs/{id}/containers/{containerId}` | Jobs | 401 |
| 64 | GET | `/jobs/{id}/documents` | Jobs | 401 |
| 65 | POST | `/jobs/{id}/documents` | Jobs | 401 |
| 66 | DELETE | `/jobs/{id}/documents/{documentId}` | Jobs | 401 |
| 67 | PATCH | `/jobs/{id}/documents/{documentId}` | Jobs | 401 |
| 68 | POST | `/jobs/{id}/documents/{documentId}/finalize` | Jobs | 401 |
| 69 | POST | `/jobs/{id}/documents/cargo-manifest` | Jobs | 401 |
| 70 | GET | `/jobs/{id}/documents/generation-status` | Jobs | 401 |
| 71 | POST | `/jobs/{id}/documents/hawb` | Jobs | 401 |
| 72 | POST | `/jobs/{id}/documents/mawb` | Jobs | 401 |
| 73 | POST | `/jobs/{id}/documents/pre-alert` | Jobs | 401 |
| 74 | GET | `/jobs/{id}/house-jobs` | Jobs | 401 |
| 75 | GET | `/jobs/{id}/milestones` | Jobs | 401 |
| 76 | POST | `/jobs/{id}/milestones` | Jobs | 401 |
| 77 | PATCH | `/jobs/{id}/milestones/{milestoneId}` | Jobs | 401 |
| 78 | GET | `/jobs/{id}/notes` | Jobs | 401 |
| 79 | POST | `/jobs/{id}/notes` | Jobs | 401 |
| 80 | DELETE | `/jobs/{id}/notes/{noteId}` | Jobs | 401 |
| 81 | PATCH | `/jobs/{id}/notes/{noteId}` | Jobs | 401 |
| 82 | GET | `/jobs/{id}/pnl` | Jobs | 401 |
| 83 | POST | `/jobs/{id}/pre-alert/send` | Jobs | 401 |
| 84 | POST | `/jobs/{id}/prorate-cost/{chargeCodeId}` | Jobs | 401 |
| 85 | PATCH | `/jobs/{id}/sea-fcl-details` | Jobs | 401 |
| 86 | GET | `/masters/airlines` | Masters — Airlines | 401 |
| 87 | POST | `/masters/airlines` | Masters — Airlines | 401 |
| 88 | DELETE | `/masters/airlines/{id}` | Masters — Airlines | 401 |
| 89 | GET | `/masters/airlines/{id}` | Masters — Airlines | 401 |
| 90 | PATCH | `/masters/airlines/{id}` | Masters — Airlines | 401 |
| 91 | GET | `/masters/airports` | Masters — Airports | 401 |
| 92 | POST | `/masters/airports` | Masters — Airports | 401 |
| 93 | DELETE | `/masters/airports/{id}` | Masters — Airports | 401 |
| 94 | GET | `/masters/airports/{id}` | Masters — Airports | 401 |
| 95 | PATCH | `/masters/airports/{id}` | Masters — Airports | 401 |
| 96 | GET | `/masters/banks` | Masters — Banks | 401 |
| 97 | POST | `/masters/banks` | Masters — Banks | 401 |
| 98 | DELETE | `/masters/banks/{id}` | Masters — Banks | 401 |
| 99 | GET | `/masters/banks/{id}` | Masters — Banks | 401 |
| 100 | PATCH | `/masters/banks/{id}` | Masters — Banks | 401 |
| 101 | GET | `/masters/branches` | Masters — Branches | 401 |
| 102 | POST | `/masters/branches` | Masters — Branches | 401 |
| 103 | DELETE | `/masters/branches/{id}` | Masters — Branches | 401 |
| 104 | GET | `/masters/branches/{id}` | Masters — Branches | 401 |
| 105 | PATCH | `/masters/branches/{id}` | Masters — Branches | 401 |
| 106 | GET | `/masters/charge-codes` | Masters — ChargeCodes | 401 |
| 107 | POST | `/masters/charge-codes` | Masters — ChargeCodes | 401 |
| 108 | DELETE | `/masters/charge-codes/{id}` | Masters — ChargeCodes | 401 |
| 109 | GET | `/masters/charge-codes/{id}` | Masters — ChargeCodes | 401 |
| 110 | PATCH | `/masters/charge-codes/{id}` | Masters — ChargeCodes | 401 |
| 111 | GET | `/masters/container-types` | Masters — ContainerTypes | 401 |
| 112 | POST | `/masters/container-types` | Masters — ContainerTypes | 401 |
| 113 | DELETE | `/masters/container-types/{id}` | Masters — ContainerTypes | 401 |
| 114 | GET | `/masters/container-types/{id}` | Masters — ContainerTypes | 401 |
| 115 | PATCH | `/masters/container-types/{id}` | Masters — ContainerTypes | 401 |
| 116 | GET | `/masters/countries` | Masters — Countries | 401 |
| 117 | POST | `/masters/countries` | Masters — Countries | 401 |
| 118 | DELETE | `/masters/countries/{id}` | Masters — Countries | 401 |
| 119 | GET | `/masters/countries/{id}` | Masters — Countries | 401 |
| 120 | PATCH | `/masters/countries/{id}` | Masters — Countries | 401 |
| 121 | GET | `/masters/currencies` | Masters — Currencies | 401 |
| 122 | POST | `/masters/currencies` | Masters — Currencies | 401 |
| 123 | DELETE | `/masters/currencies/{id}` | Masters — Currencies | 401 |
| 124 | GET | `/masters/currencies/{id}` | Masters — Currencies | 401 |
| 125 | PATCH | `/masters/currencies/{id}` | Masters — Currencies | 401 |
| 126 | GET | `/masters/departments` | Masters — Departments | 401 |
| 127 | POST | `/masters/departments` | Masters — Departments | 401 |
| 128 | DELETE | `/masters/departments/{id}` | Masters — Departments | 401 |
| 129 | GET | `/masters/departments/{id}` | Masters — Departments | 401 |
| 130 | PATCH | `/masters/departments/{id}` | Masters — Departments | 401 |
| 131 | GET | `/masters/designations` | Masters — Designations | 401 |
| 132 | POST | `/masters/designations` | Masters — Designations | 401 |
| 133 | DELETE | `/masters/designations/{id}` | Masters — Designations | 401 |
| 134 | GET | `/masters/designations/{id}` | Masters — Designations | 401 |
| 135 | PATCH | `/masters/designations/{id}` | Masters — Designations | 401 |
| 136 | GET | `/masters/exchange-rates` | Masters — Exchange Rates | 401 |
| 137 | POST | `/masters/exchange-rates` | Masters — Exchange Rates | 401 |
| 138 | GET | `/masters/exchange-rates/latest/{currencyId}` | Masters — Exchange Rates | 401 |
| 139 | GET | `/masters/holidays` | Masters — Holidays | 401 |
| 140 | POST | `/masters/holidays` | Masters — Holidays | 401 |
| 141 | DELETE | `/masters/holidays/{id}` | Masters — Holidays | 401 |
| 142 | GET | `/masters/holidays/{id}` | Masters — Holidays | 401 |
| 143 | PATCH | `/masters/holidays/{id}` | Masters — Holidays | 401 |
| 144 | GET | `/masters/hs-codes` | Masters — HsCodes | 401 |
| 145 | POST | `/masters/hs-codes` | Masters — HsCodes | 401 |
| 146 | DELETE | `/masters/hs-codes/{id}` | Masters — HsCodes | 401 |
| 147 | GET | `/masters/hs-codes/{id}` | Masters — HsCodes | 401 |
| 148 | PATCH | `/masters/hs-codes/{id}` | Masters — HsCodes | 401 |
| 149 | GET | `/masters/ports` | Masters — Ports | 401 |
| 150 | POST | `/masters/ports` | Masters — Ports | 401 |
| 151 | DELETE | `/masters/ports/{id}` | Masters — Ports | 401 |
| 152 | GET | `/masters/ports/{id}` | Masters — Ports | 401 |
| 153 | PATCH | `/masters/ports/{id}` | Masters — Ports | 401 |
| 154 | GET | `/masters/shipping-lines` | Masters — ShippingLines | 401 |
| 155 | POST | `/masters/shipping-lines` | Masters — ShippingLines | 401 |
| 156 | DELETE | `/masters/shipping-lines/{id}` | Masters — ShippingLines | 401 |
| 157 | GET | `/masters/shipping-lines/{id}` | Masters — ShippingLines | 401 |
| 158 | PATCH | `/masters/shipping-lines/{id}` | Masters — ShippingLines | 401 |
| 159 | GET | `/masters/tax-rates` | Masters — TaxRates | 401 |
| 160 | POST | `/masters/tax-rates` | Masters — TaxRates | 401 |
| 161 | DELETE | `/masters/tax-rates/{id}` | Masters — TaxRates | 401 |
| 162 | GET | `/masters/tax-rates/{id}` | Masters — TaxRates | 401 |
| 163 | PATCH | `/masters/tax-rates/{id}` | Masters — TaxRates | 401 |
| 164 | GET | `/masters/truckers` | Masters — Truckers | 401 |
| 165 | POST | `/masters/truckers` | Masters — Truckers | 401 |
| 166 | DELETE | `/masters/truckers/{id}` | Masters — Truckers | 401 |
| 167 | GET | `/masters/truckers/{id}` | Masters — Truckers | 401 |
| 168 | PATCH | `/masters/truckers/{id}` | Masters — Truckers | 401 |
| 169 | GET | `/masters/units-of-measure` | Masters — UnitsOfMeasure | 401 |
| 170 | POST | `/masters/units-of-measure` | Masters — UnitsOfMeasure | 401 |
| 171 | DELETE | `/masters/units-of-measure/{id}` | Masters — UnitsOfMeasure | 401 |
| 172 | GET | `/masters/units-of-measure/{id}` | Masters — UnitsOfMeasure | 401 |
| 173 | PATCH | `/masters/units-of-measure/{id}` | Masters — UnitsOfMeasure | 401 |
| 174 | GET | `/masters/vessels` | Masters — Vessels | 401 |
| 175 | POST | `/masters/vessels` | Masters — Vessels | 401 |
| 176 | DELETE | `/masters/vessels/{id}` | Masters — Vessels | 401 |
| 177 | GET | `/masters/vessels/{id}` | Masters — Vessels | 401 |
| 178 | PATCH | `/masters/vessels/{id}` | Masters — Vessels | 401 |
| 179 | GET | `/masters/warehouses` | Masters — Warehouses | 401 |
| 180 | POST | `/masters/warehouses` | Masters — Warehouses | 401 |
| 181 | DELETE | `/masters/warehouses/{id}` | Masters — Warehouses | 401 |
| 182 | GET | `/masters/warehouses/{id}` | Masters — Warehouses | 401 |
| 183 | PATCH | `/masters/warehouses/{id}` | Masters — Warehouses | 401 |
| 184 | GET | `/organization/bank-accounts` | Organization — Bank Accounts | 401 |
| 185 | POST | `/organization/bank-accounts` | Organization — Bank Accounts | 401 |
| 186 | DELETE | `/organization/bank-accounts/{id}` | Organization — Bank Accounts | 401 |
| 187 | GET | `/organization/bank-accounts/{id}` | Organization — Bank Accounts | 401 |
| 188 | PATCH | `/organization/bank-accounts/{id}` | Organization — Bank Accounts | 401 |
| 189 | GET | `/organization/number-formats` | Organization — Number Formats | 401 |
| 190 | POST | `/organization/number-formats` | Organization — Number Formats | 401 |
| 191 | GET | `/organization/number-formats/{documentType}` | Organization — Number Formats | 401 |
| 192 | PATCH | `/organization/number-formats/{documentType}` | Organization — Number Formats | 401 |
| 193 | GET | `/organization/number-formats/{documentType}/preview` | Organization — Number Formats | 401 |
| 194 | GET | `/organization/profile` | Organization Profile | 401 |
| 195 | PATCH | `/organization/profile` | Organization Profile | 401 |
| 196 | GET | `/parties` | Parties | 401 |
| 197 | POST | `/parties` | Parties | 401 |
| 198 | DELETE | `/parties/{id}` | Parties | 401 |
| 199 | GET | `/parties/{id}` | Parties | 401 |
| 200 | PATCH | `/parties/{id}` | Parties | 401 |
| 201 | POST | `/parties/{id}/addresses` | Parties | 401 |
| 202 | DELETE | `/parties/{id}/addresses/{addressId}` | Parties | 401 |
| 203 | PATCH | `/parties/{id}/addresses/{addressId}` | Parties | 401 |
| 204 | POST | `/parties/{id}/contacts` | Parties | 401 |
| 205 | DELETE | `/parties/{id}/contacts/{contactId}` | Parties | 401 |
| 206 | PATCH | `/parties/{id}/contacts/{contactId}` | Parties | 401 |
| 207 | PATCH | `/parties/{id}/credit-status` | Parties | 401 |
| 208 | POST | `/parties/import` | Parties | 401 |
| 209 | GET | `/payment-requests` | Payment Requests | 401 |
| 210 | POST | `/payment-requests` | Payment Requests | 401 |
| 211 | DELETE | `/payment-requests/{id}` | Payment Requests | 401 |
| 212 | GET | `/payment-requests/{id}` | Payment Requests | 401 |
| 213 | PATCH | `/payment-requests/{id}` | Payment Requests | 401 |
| 214 | POST | `/payment-requests/{id}/approve` | Payment Requests | 401 |
| 215 | POST | `/payment-requests/{id}/mark-paid` | Payment Requests | 401 |
| 216 | POST | `/payment-requests/{id}/reject` | Payment Requests | 401 |
| 217 | GET | `/purchase-invoices` | Purchase Invoices | 401 |
| 218 | POST | `/purchase-invoices` | Purchase Invoices | 401 |
| 219 | DELETE | `/purchase-invoices/{id}` | Purchase Invoices | 401 |
| 220 | GET | `/purchase-invoices/{id}` | Purchase Invoices | 401 |
| 221 | PATCH | `/purchase-invoices/{id}` | Purchase Invoices | 401 |
| 222 | POST | `/purchase-invoices/{id}/post` | Purchase Invoices | 401 |
| 223 | GET | `/quotations` | Quotations | 401 |
| 224 | POST | `/quotations` | Quotations | 401 |
| 225 | DELETE | `/quotations/{id}` | Quotations | 401 |
| 226 | GET | `/quotations/{id}` | Quotations | 401 |
| 227 | PATCH | `/quotations/{id}` | Quotations | 401 |
| 228 | POST | `/quotations/{id}/apply-tariff` | Quotations | 401 |
| 229 | POST | `/quotations/{id}/approve` | Quotations | 401 |
| 230 | POST | `/quotations/{id}/archive` | Quotations | 401 |
| 231 | POST | `/quotations/{id}/convert-to-job` | Quotations | 401 |
| 232 | POST | `/quotations/{id}/duplicate` | Quotations | 401 |
| 233 | POST | `/quotations/{id}/expire` | Quotations | 401 |
| 234 | POST | `/quotations/{id}/lines` | Quotations | 401 |
| 235 | DELETE | `/quotations/{id}/lines/{lineId}` | Quotations | 401 |
| 236 | PATCH | `/quotations/{id}/lines/{lineId}` | Quotations | 401 |
| 237 | POST | `/quotations/{id}/mark-lost` | Quotations | 401 |
| 238 | POST | `/quotations/{id}/mark-won` | Quotations | 401 |
| 239 | GET | `/quotations/{id}/pdf` | Quotations | 401 |
| 240 | POST | `/quotations/{id}/pdf` | Quotations | 401 |
| 241 | GET | `/quotations/{id}/pdf/status` | Quotations | 401 |
| 242 | POST | `/quotations/{id}/reject` | Quotations | 401 |
| 243 | GET | `/quotations/{id}/revisions` | Quotations | 401 |
| 244 | POST | `/quotations/{id}/send` | Quotations | 401 |
| 245 | POST | `/quotations/{id}/send-email` | Quotations | 401 |
| 246 | POST | `/quotations/{id}/submit` | Quotations | 401 |
| 247 | POST | `/quotations/expire-due` | Quotations | 401 |
| 248 | POST | `/quotations/online-quote` | Quotations | 400 |
| 249 | GET | `/quotations/reports/analytics` | Quotations | 401 |
| 250 | GET | `/quotations/reports/analytics/conversion` | Quotations | 401 |
| 251 | GET | `/quotations/reports/analytics/lost-reasons` | Quotations | 401 |
| 252 | GET | `/quotations/reports/analytics/response-time` | Quotations | 401 |
| 253 | GET | `/quotations/reports/chargewise` | Quotations | 401 |
| 254 | GET | `/quotations/tariffs` | Quotations — Online Tariff Master | 401 |
| 255 | POST | `/quotations/tariffs` | Quotations — Online Tariff Master | 401 |
| 256 | DELETE | `/quotations/tariffs/{id}` | Quotations — Online Tariff Master | 401 |
| 257 | GET | `/quotations/tariffs/{id}` | Quotations — Online Tariff Master | 401 |
| 258 | PATCH | `/quotations/tariffs/{id}` | Quotations — Online Tariff Master | 401 |
| 259 | GET | `/quotations/zip-distances` | Quotations — Zip Distance Master | 401 |
| 260 | POST | `/quotations/zip-distances` | Quotations — Zip Distance Master | 401 |
| 261 | DELETE | `/quotations/zip-distances/{id}` | Quotations — Zip Distance Master | 401 |
| 262 | GET | `/quotations/zip-distances/{id}` | Quotations — Zip Distance Master | 401 |
| 263 | PATCH | `/quotations/zip-distances/{id}` | Quotations — Zip Distance Master | 401 |
| 264 | GET | `/search` | Search | 401 |
| 265 | GET | `/tenants` | Tenants (Super Admin) | 401 |
| 266 | POST | `/tenants` | Tenants (Super Admin) | 401 |
| 267 | DELETE | `/tenants/{id}` | Tenants (Super Admin) | 401 |
| 268 | GET | `/tenants/{id}` | Tenants (Super Admin) | 401 |
| 269 | PATCH | `/tenants/{id}` | Tenants (Super Admin) | 401 |
| 270 | PATCH | `/tenants/{id}/activate` | Tenants (Super Admin) | 401 |
| 271 | PATCH | `/tenants/{id}/deactivate` | Tenants (Super Admin) | 401 |
| 272 | PATCH | `/tenants/{id}/restore` | Tenants (Super Admin) | 401 |
| 273 | POST | `/tenants/{id}/sync-permissions` | Tenants (Super Admin) | 401 |
| 274 | GET | `/tenants/statistics` | Tenants (Super Admin) | 401 |
| 275 | POST | `/tenants/sync-permissions` | Tenants (Super Admin) | 401 |
| 276 | GET | `/health` | Untagged | 401 |
| 277 | GET | `/users` | Users | 401 |
| 278 | POST | `/users` | Users | 401 |
| 279 | DELETE | `/users/{id}` | Users | 401 |
| 280 | GET | `/users/{id}` | Users | 401 |
| 281 | PATCH | `/users/{id}` | Users | 401 |
| 282 | POST | `/users/{id}/admin-reset-password` | Users | 401 |
| 283 | POST | `/users/{id}/force-logout` | Users | 401 |
| 284 | POST | `/users/{id}/restore` | Users | 401 |
| 285 | PATCH | `/users/{id}/status` | Users | 401 |
| 286 | POST | `/users/bulk` | Users | 401 |
| 287 | POST | `/users/me/change-password` | Users | 401 |

## Auth

### FAIL-001: `POST /auth/change-password`
**Purpose:** Change the authenticated user password

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /auth/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /auth/change-password HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-002: `POST /auth/login`
**Purpose:** Staff login: tenant slug + email + password

#### Primary FAIL — invalid / incomplete body

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **400** (or 401 for bad credentials on login) |

```http
POST /auth/login HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "not-an-email",
  "password": "x"
}
```

**Fail criteria:** Request is rejected; no resource created/updated.

---

### FAIL-003: `POST /auth/logout`
**Purpose:** Revoke the current session

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /auth/logout HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /auth/logout HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-004: `POST /auth/logout-all`
**Purpose:** Log out of every device (revokes all active sessions)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /auth/logout-all HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /auth/logout-all HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-005: `GET /auth/me`
**Purpose:** Get the authenticated principal (user, tenant owner, or super admin)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /auth/me HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-006: `POST /auth/refresh`
**Purpose:** Exchange a refresh token for a new token pair

#### Primary FAIL — invalid / incomplete body

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **400** (or 401 for bad credentials on login) |

```http
POST /auth/refresh HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "refresh_token": "invalid-token"
}
```

**Fail criteria:** Request is rejected; no resource created/updated.

---

### FAIL-007: `GET /auth/sessions`
**Purpose:** List the authenticated user's own active sessions

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /auth/sessions HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-008: `POST /auth/sessions/{sessionId}/revoke`
**Purpose:** Revoke one of the authenticated user's own sessions

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /auth/sessions/{{ID}}}/revoke HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /auth/sessions/{{ID}}}/revoke HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-009: `POST /auth/super-admin/login`
**Purpose:** Platform super admin login

#### Primary FAIL — invalid / incomplete body

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **400** (or 401 for bad credentials on login) |

```http
POST /auth/super-admin/login HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "not-an-email",
  "password": "x"
}
```

**Fail criteria:** Request is rejected; no resource created/updated.

---

### FAIL-010: `POST /auth/super-admin/signup`
**Purpose:** Platform super admin self-registration

#### Primary FAIL — invalid / incomplete body

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **400** (or 401 for bad credentials on login) |

```http
POST /auth/super-admin/signup HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "not-an-email",
  "password": "x"
}
```

**Fail criteria:** Request is rejected; no resource created/updated.

---

### FAIL-011: `POST /auth/tenant-login`
**Purpose:** Tenant admin login: tenant slug + the tenant's own password

#### Primary FAIL — invalid / incomplete body

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **400** (or 401 for bad credentials on login) |

```http
POST /auth/tenant-login HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "not-an-email",
  "password": "x"
}
```

**Fail criteria:** Request is rejected; no resource created/updated.

---

### FAIL-012: `POST /auth/tenant/change-password`
**Purpose:** Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /auth/tenant/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /auth/tenant/change-password HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## AWB Stock

### FAIL-013: `GET /awb-stock/allocations`
**Purpose:** List AWB allocations

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /awb-stock/allocations HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-014: `POST /awb-stock/allocations/{id}/mark-used`
**Purpose:** Mark an allocated AWB as used (flown/printed)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /awb-stock/allocations/{{ID}}}/mark-used HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /awb-stock/allocations/{{ID}}}/mark-used HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-015: `POST /awb-stock/allocations/{id}/void`
**Purpose:** Void an allocated (unused) AWB number

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /awb-stock/allocations/{{ID}}}/void HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /awb-stock/allocations/{{ID}}}/void HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-016: `GET /awb-stock/batches`
**Purpose:** List AWB stock batches

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /awb-stock/batches HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-017: `POST /awb-stock/batches`
**Purpose:** Register a new AWB number range for an airline

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /awb-stock/batches HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /awb-stock/batches HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-018: `DELETE /awb-stock/batches/{id}`
**Purpose:** Soft-delete an empty AWB stock batch

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /awb-stock/batches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /awb-stock/batches/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-019: `GET /awb-stock/batches/{id}`
**Purpose:** Get an AWB stock batch with recent allocations

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /awb-stock/batches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /awb-stock/batches/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-020: `PATCH /awb-stock/batches/{id}`
**Purpose:** Update batch metadata (threshold, notes)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /awb-stock/batches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /awb-stock/batches/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-021: `POST /awb-stock/batches/{id}/allocate`
**Purpose:** Allocate the next AWB number from a batch to a job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /awb-stock/batches/{{ID}}}/allocate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /awb-stock/batches/{{ID}}}/allocate HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-022: `POST /awb-stock/batches/{id}/transfer-branch`
**Purpose:** Transfer batch ownership to another branch

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /awb-stock/batches/{{ID}}}/transfer-branch HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /awb-stock/batches/{{ID}}}/transfer-branch HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-023: `GET /awb-stock/reports/low-stock`
**Purpose:** Batches at or below their low-stock threshold

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /awb-stock/reports/low-stock HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

## Companies

### FAIL-024: `GET /companies`
**Purpose:** List this tenant's companies (usually just the one default, more for multi-entity groups)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /companies HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-025: `POST /companies`
**Purpose:** Register an additional company under this tenant (multi-entity groups)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /companies HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /companies HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-026: `DELETE /companies/{id}`
**Purpose:** Soft-delete a company (blocked if it is the only one, or currently default)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /companies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /companies/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-027: `GET /companies/{id}`
**Purpose:** Get a company by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /companies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /companies/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-028: `PATCH /companies/{id}`
**Purpose:** Update a company

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /companies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /companies/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Credit Notes

### FAIL-029: `GET /credit-notes`
**Purpose:** List credit notes

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /credit-notes HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-030: `POST /credit-notes`
**Purpose:** Create a credit note against a posted customer invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /credit-notes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /credit-notes HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-031: `GET /credit-notes/{id}`
**Purpose:** Get a credit note

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /credit-notes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /credit-notes/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-032: `POST /credit-notes/{id}/post`
**Purpose:** Post a draft credit note

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /credit-notes/{{ID}}}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /credit-notes/{{ID}}}/post HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Files

### FAIL-033: `GET /files/{tenantId}/{filename}`
**Purpose:** Download a locally stored file (PDFs generated by the system)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /files/{{ID}}}/sample.pdf HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /files/00000000-0000-0000-0000-000000000099}/sample.pdf HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Invoices

### FAIL-034: `GET /invoices`
**Purpose:** List customer invoices (Ch.18)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /invoices HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-035: `POST /invoices`
**Purpose:** Create a draft customer invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /invoices HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /invoices HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-036: `DELETE /invoices/{id}`
**Purpose:** Soft-delete a draft invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /invoices/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-037: `GET /invoices/{id}`
**Purpose:** Get invoice with lines

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /invoices/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-038: `PATCH /invoices/{id}`
**Purpose:** Update a draft invoice header

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /invoices/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-039: `POST /invoices/{id}/cancel`
**Purpose:** Cancel an invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /invoices/{{ID}}}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /invoices/{{ID}}}/cancel HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-040: `POST /invoices/{id}/lines`
**Purpose:** Add a line to a draft invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /invoices/{{ID}}}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /invoices/{{ID}}}/lines HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-041: `DELETE /invoices/{id}/lines/{lineId}`
**Purpose:** Remove an invoice line

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /invoices/{{ID}}}/lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /invoices/00000000-0000-0000-0000-000000000099}/lines/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-042: `PATCH /invoices/{id}/lines/{lineId}`
**Purpose:** Update an invoice line

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /invoices/{{ID}}}/lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /invoices/{{ID}}}/lines/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-043: `GET /invoices/{id}/pdf`
**Purpose:** Get invoice PDF metadata

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /invoices/{{ID}}}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /invoices/00000000-0000-0000-0000-000000000099}/pdf HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-044: `POST /invoices/{id}/pdf`
**Purpose:** Generate invoice PDF

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /invoices/{{ID}}}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /invoices/{{ID}}}/pdf HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-045: `POST /invoices/{id}/post`
**Purpose:** Post a draft invoice (DRAFT -> POSTED)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /invoices/{{ID}}}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /invoices/{{ID}}}/post HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-046: `POST /invoices/{id}/send`
**Purpose:** Email invoice PDF to customer

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /invoices/{{ID}}}/send HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /invoices/{{ID}}}/send HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-047: `POST /invoices/from-job/{jobId}`
**Purpose:** Create draft invoice from uninvoiced billable job charges

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /invoices/from-job/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /invoices/from-job/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-048: `GET /invoices/reports/overdue`
**Purpose:** Overdue customer invoices past due_date with outstanding balance

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /invoices/reports/overdue HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

## Jobs

### FAIL-049: `GET /jobs`
**Purpose:** List jobs

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /jobs HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-050: `POST /jobs`
**Purpose:** Create a job (booking). AIR_EXPORT jobs auto-get their detail row + the full 15-milestone taxonomy. Set parent_job_id to create a HOUSE job under an existing master.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-051: `DELETE /jobs/{id}`
**Purpose:** Soft-delete a completed or cancelled job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /jobs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /jobs/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-052: `GET /jobs/{id}`
**Purpose:** Get a job with air details, charges, milestones, and its house jobs (if a master)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /jobs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /jobs/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-053: `PATCH /jobs/{id}`
**Purpose:** Update a job (not allowed once COMPLETED or CANCELLED)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /jobs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /jobs/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-054: `PATCH /jobs/{id}/air-details`
**Purpose:** Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /jobs/{{ID}}}/air-details HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /jobs/{{ID}}}/air-details HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-055: `POST /jobs/{id}/cancel`
**Purpose:** Cancel a job (status -> CANCELLED)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/cancel HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-056: `POST /jobs/{id}/charges`
**Purpose:** Add a charge line — Job P&L recalculates automatically

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/charges HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/charges HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-057: `DELETE /jobs/{id}/charges/{chargeId}`
**Purpose:** Remove a charge line

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /jobs/{{ID}}}/charges/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /jobs/00000000-0000-0000-0000-000000000099}/charges/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-058: `PATCH /jobs/{id}/charges/{chargeId}`
**Purpose:** Update a charge line

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /jobs/{{ID}}}/charges/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /jobs/{{ID}}}/charges/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-059: `POST /jobs/{id}/close`
**Purpose:** Close a job (status -> COMPLETED)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/close HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/close HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-060: `GET /jobs/{id}/containers`
**Purpose:** List containers on a Sea FCL job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /jobs/{{ID}}}/containers HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /jobs/00000000-0000-0000-0000-000000000099}/containers HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-061: `POST /jobs/{id}/containers`
**Purpose:** Add a container to a Sea FCL job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/containers HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/containers HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-062: `DELETE /jobs/{id}/containers/{containerId}`
**Purpose:** Remove a container from a Sea FCL job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /jobs/{{ID}}}/containers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /jobs/00000000-0000-0000-0000-000000000099}/containers/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-063: `PATCH /jobs/{id}/containers/{containerId}`
**Purpose:** Update a container on a Sea FCL job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /jobs/{{ID}}}/containers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /jobs/{{ID}}}/containers/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-064: `GET /jobs/{id}/documents`
**Purpose:** List documents attached to a job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /jobs/{{ID}}}/documents HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /jobs/00000000-0000-0000-0000-000000000099}/documents HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-065: `POST /jobs/{id}/documents`
**Purpose:** Register a document on a job (metadata + file URL)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/documents HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/documents HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-066: `DELETE /jobs/{id}/documents/{documentId}`
**Purpose:** Remove a draft document

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /jobs/{{ID}}}/documents/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /jobs/00000000-0000-0000-0000-000000000099}/documents/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-067: `PATCH /jobs/{id}/documents/{documentId}`
**Purpose:** Update a draft document metadata

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /jobs/{{ID}}}/documents/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /jobs/{{ID}}}/documents/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-068: `POST /jobs/{id}/documents/{documentId}/finalize`
**Purpose:** Finalize a document (DRAFT -> ORIGINAL, locked)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/documents/{{ID}}}/finalize HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/documents/{{ID}}}/finalize HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-069: `POST /jobs/{id}/documents/cargo-manifest`
**Purpose:** Queue cargo manifest PDF generation

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/documents/cargo-manifest HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/documents/cargo-manifest HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-070: `GET /jobs/{id}/documents/generation-status`
**Purpose:** List async document generation tasks for a job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /jobs/{{ID}}}/documents/generation-status HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /jobs/00000000-0000-0000-0000-000000000099}/documents/generation-status HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-071: `POST /jobs/{id}/documents/hawb`
**Purpose:** Queue HAWB PDF generation (Puppeteer + BullMQ)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/documents/hawb HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/documents/hawb HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-072: `POST /jobs/{id}/documents/mawb`
**Purpose:** Queue MAWB PDF generation (Puppeteer + BullMQ)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/documents/mawb HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/documents/mawb HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-073: `POST /jobs/{id}/documents/pre-alert`
**Purpose:** Queue pre-alert document PDF generation

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/documents/pre-alert HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/documents/pre-alert HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-074: `GET /jobs/{id}/house-jobs`
**Purpose:** List the house jobs consolidated under this master job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /jobs/{{ID}}}/house-jobs HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /jobs/00000000-0000-0000-0000-000000000099}/house-jobs HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-075: `GET /jobs/{id}/milestones`
**Purpose:** List all milestones for a job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /jobs/{{ID}}}/milestones HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /jobs/00000000-0000-0000-0000-000000000099}/milestones HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-076: `POST /jobs/{id}/milestones`
**Purpose:** Add a custom milestone outside the standard taxonomy

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/milestones HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/milestones HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-077: `PATCH /jobs/{id}/milestones/{milestoneId}`
**Purpose:** Update a milestone — set actual_date to mark it complete

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /jobs/{{ID}}}/milestones/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /jobs/{{ID}}}/milestones/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-078: `GET /jobs/{id}/notes`
**Purpose:** List notes on a job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /jobs/{{ID}}}/notes HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /jobs/00000000-0000-0000-0000-000000000099}/notes HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-079: `POST /jobs/{id}/notes`
**Purpose:** Add a note to a job

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/notes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/notes HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-080: `DELETE /jobs/{id}/notes/{noteId}`
**Purpose:** Remove a job note

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /jobs/{{ID}}}/notes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /jobs/00000000-0000-0000-0000-000000000099}/notes/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-081: `PATCH /jobs/{id}/notes/{noteId}`
**Purpose:** Update a job note

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /jobs/{{ID}}}/notes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /jobs/{{ID}}}/notes/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-082: `GET /jobs/{id}/pnl`
**Purpose:** Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /jobs/{{ID}}}/pnl HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /jobs/00000000-0000-0000-0000-000000000099}/pnl HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-083: `POST /jobs/{id}/pre-alert/send`
**Purpose:** Send pre-alert and mark PRE_ALERT_SENT milestone complete

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/pre-alert/send HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/pre-alert/send HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-084: `POST /jobs/{id}/prorate-cost/{chargeCodeId}`
**Purpose:** Distribute a master job's cost line to its house jobs, proportionally by chargeable weight

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /jobs/{{ID}}}/prorate-cost/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /jobs/{{ID}}}/prorate-cost/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-085: `PATCH /jobs/{id}/sea-fcl-details`
**Purpose:** Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /jobs/{{ID}}}/sea-fcl-details HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /jobs/{{ID}}}/sea-fcl-details HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Airlines

### FAIL-086: `GET /masters/airlines`
**Purpose:** list airlines

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/airlines HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-087: `POST /masters/airlines`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/airlines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/airlines HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-088: `DELETE /masters/airlines/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/airlines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/airlines/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-089: `GET /masters/airlines/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/airlines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/airlines/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-090: `PATCH /masters/airlines/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/airlines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/airlines/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Airports

### FAIL-091: `GET /masters/airports`
**Purpose:** List airports

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/airports HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-092: `POST /masters/airports`
**Purpose:** Create an airport

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/airports HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/airports HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-093: `DELETE /masters/airports/{id}`
**Purpose:** Soft-delete an airport

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/airports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/airports/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-094: `GET /masters/airports/{id}`
**Purpose:** Get an airport by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/airports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/airports/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-095: `PATCH /masters/airports/{id}`
**Purpose:** Update an airport

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/airports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/airports/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Banks

### FAIL-096: `GET /masters/banks`
**Purpose:** list banks

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/banks HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-097: `POST /masters/banks`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/banks HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/banks HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-098: `DELETE /masters/banks/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/banks/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/banks/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-099: `GET /masters/banks/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/banks/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/banks/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-100: `PATCH /masters/banks/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/banks/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/banks/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Branches

### FAIL-101: `GET /masters/branches`
**Purpose:** list branches

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/branches HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-102: `POST /masters/branches`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/branches HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/branches HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-103: `DELETE /masters/branches/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/branches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/branches/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-104: `GET /masters/branches/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/branches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/branches/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-105: `PATCH /masters/branches/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/branches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/branches/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — ChargeCodes

### FAIL-106: `GET /masters/charge-codes`
**Purpose:** list chargecodes

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/charge-codes HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-107: `POST /masters/charge-codes`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/charge-codes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/charge-codes HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-108: `DELETE /masters/charge-codes/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/charge-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/charge-codes/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-109: `GET /masters/charge-codes/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/charge-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/charge-codes/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-110: `PATCH /masters/charge-codes/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/charge-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/charge-codes/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — ContainerTypes

### FAIL-111: `GET /masters/container-types`
**Purpose:** List container types

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/container-types HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-112: `POST /masters/container-types`
**Purpose:** Create a container type

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/container-types HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/container-types HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-113: `DELETE /masters/container-types/{id}`
**Purpose:** Soft-delete a container type

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/container-types/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/container-types/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-114: `GET /masters/container-types/{id}`
**Purpose:** Get a container type by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/container-types/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/container-types/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-115: `PATCH /masters/container-types/{id}`
**Purpose:** Update a container type

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/container-types/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/container-types/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Countries

### FAIL-116: `GET /masters/countries`
**Purpose:** List countries

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/countries HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-117: `POST /masters/countries`
**Purpose:** Create a country

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/countries HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/countries HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-118: `DELETE /masters/countries/{id}`
**Purpose:** Soft-delete a country

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/countries/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/countries/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-119: `GET /masters/countries/{id}`
**Purpose:** Get a country by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/countries/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/countries/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-120: `PATCH /masters/countries/{id}`
**Purpose:** Update a country

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/countries/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/countries/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Currencies

### FAIL-121: `GET /masters/currencies`
**Purpose:** List currencies

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/currencies HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-122: `POST /masters/currencies`
**Purpose:** Create a currency

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/currencies HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/currencies HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-123: `DELETE /masters/currencies/{id}`
**Purpose:** Soft-delete a currency

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/currencies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/currencies/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-124: `GET /masters/currencies/{id}`
**Purpose:** Get a currency by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/currencies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/currencies/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-125: `PATCH /masters/currencies/{id}`
**Purpose:** Update a currency

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/currencies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/currencies/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Departments

### FAIL-126: `GET /masters/departments`
**Purpose:** list departments

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/departments HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-127: `POST /masters/departments`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/departments HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/departments HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-128: `DELETE /masters/departments/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/departments/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/departments/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-129: `GET /masters/departments/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/departments/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/departments/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-130: `PATCH /masters/departments/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/departments/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/departments/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Designations

### FAIL-131: `GET /masters/designations`
**Purpose:** list designations

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/designations HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-132: `POST /masters/designations`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/designations HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/designations HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-133: `DELETE /masters/designations/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/designations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/designations/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-134: `GET /masters/designations/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/designations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/designations/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-135: `PATCH /masters/designations/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/designations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/designations/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Exchange Rates

### FAIL-136: `GET /masters/exchange-rates`
**Purpose:** List exchange rates, optionally filtered by currency

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/exchange-rates HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-137: `POST /masters/exchange-rates`
**Purpose:** Record (or correct) an exchange rate for a date — upserts by currency + date

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/exchange-rates HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/exchange-rates HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-138: `GET /masters/exchange-rates/latest/{currencyId}`
**Purpose:** Most recent rate on file for a currency

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/exchange-rates/latest/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/exchange-rates/latest/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Holidays

### FAIL-139: `GET /masters/holidays`
**Purpose:** list holidays

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/holidays HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-140: `POST /masters/holidays`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/holidays HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/holidays HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-141: `DELETE /masters/holidays/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/holidays/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/holidays/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-142: `GET /masters/holidays/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/holidays/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/holidays/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-143: `PATCH /masters/holidays/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/holidays/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/holidays/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — HsCodes

### FAIL-144: `GET /masters/hs-codes`
**Purpose:** List HS codes

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/hs-codes HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-145: `POST /masters/hs-codes`
**Purpose:** Create an HS code

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/hs-codes HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/hs-codes HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-146: `DELETE /masters/hs-codes/{id}`
**Purpose:** Soft-delete an HS code

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/hs-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/hs-codes/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-147: `GET /masters/hs-codes/{id}`
**Purpose:** Get an HS code by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/hs-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/hs-codes/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-148: `PATCH /masters/hs-codes/{id}`
**Purpose:** Update an HS code

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/hs-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/hs-codes/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Ports

### FAIL-149: `GET /masters/ports`
**Purpose:** List ports

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/ports HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-150: `POST /masters/ports`
**Purpose:** Create a port

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/ports HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/ports HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-151: `DELETE /masters/ports/{id}`
**Purpose:** Soft-delete a port

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/ports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/ports/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-152: `GET /masters/ports/{id}`
**Purpose:** Get a port record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/ports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/ports/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-153: `PATCH /masters/ports/{id}`
**Purpose:** Update a port

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/ports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/ports/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — ShippingLines

### FAIL-154: `GET /masters/shipping-lines`
**Purpose:** list shippinglines

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/shipping-lines HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-155: `POST /masters/shipping-lines`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/shipping-lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/shipping-lines HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-156: `DELETE /masters/shipping-lines/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/shipping-lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/shipping-lines/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-157: `GET /masters/shipping-lines/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/shipping-lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/shipping-lines/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-158: `PATCH /masters/shipping-lines/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/shipping-lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/shipping-lines/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — TaxRates

### FAIL-159: `GET /masters/tax-rates`
**Purpose:** list taxrates

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/tax-rates HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-160: `POST /masters/tax-rates`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/tax-rates HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/tax-rates HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-161: `DELETE /masters/tax-rates/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/tax-rates/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/tax-rates/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-162: `GET /masters/tax-rates/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/tax-rates/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/tax-rates/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-163: `PATCH /masters/tax-rates/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/tax-rates/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/tax-rates/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Truckers

### FAIL-164: `GET /masters/truckers`
**Purpose:** list truckers

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/truckers HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-165: `POST /masters/truckers`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/truckers HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/truckers HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-166: `DELETE /masters/truckers/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/truckers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/truckers/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-167: `GET /masters/truckers/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/truckers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/truckers/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-168: `PATCH /masters/truckers/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/truckers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/truckers/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — UnitsOfMeasure

### FAIL-169: `GET /masters/units-of-measure`
**Purpose:** list unitsofmeasure

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/units-of-measure HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-170: `POST /masters/units-of-measure`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/units-of-measure HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/units-of-measure HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-171: `DELETE /masters/units-of-measure/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/units-of-measure/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/units-of-measure/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-172: `GET /masters/units-of-measure/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/units-of-measure/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/units-of-measure/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-173: `PATCH /masters/units-of-measure/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/units-of-measure/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/units-of-measure/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Vessels

### FAIL-174: `GET /masters/vessels`
**Purpose:** list vessels

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/vessels HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-175: `POST /masters/vessels`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/vessels HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/vessels HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-176: `DELETE /masters/vessels/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/vessels/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/vessels/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-177: `GET /masters/vessels/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/vessels/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/vessels/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-178: `PATCH /masters/vessels/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/vessels/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/vessels/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Masters — Warehouses

### FAIL-179: `GET /masters/warehouses`
**Purpose:** list warehouses

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/warehouses HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-180: `POST /masters/warehouses`
**Purpose:** Create a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /masters/warehouses HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /masters/warehouses HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-181: `DELETE /masters/warehouses/{id}`
**Purpose:** Soft-delete a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /masters/warehouses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /masters/warehouses/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-182: `GET /masters/warehouses/{id}`
**Purpose:** Get a record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /masters/warehouses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /masters/warehouses/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-183: `PATCH /masters/warehouses/{id}`
**Purpose:** Update a record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /masters/warehouses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /masters/warehouses/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Organization — Bank Accounts

### FAIL-184: `GET /organization/bank-accounts`
**Purpose:** List this tenant's own bank accounts

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /organization/bank-accounts HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-185: `POST /organization/bank-accounts`
**Purpose:** Add a bank account

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /organization/bank-accounts HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /organization/bank-accounts HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-186: `DELETE /organization/bank-accounts/{id}`
**Purpose:** Soft-delete a bank account

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /organization/bank-accounts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /organization/bank-accounts/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-187: `GET /organization/bank-accounts/{id}`
**Purpose:** Get a bank account by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /organization/bank-accounts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /organization/bank-accounts/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-188: `PATCH /organization/bank-accounts/{id}`
**Purpose:** Update a bank account

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /organization/bank-accounts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /organization/bank-accounts/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Organization — Number Formats

### FAIL-189: `GET /organization/number-formats`
**Purpose:** List all configured document number formats (Ch.2.2)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /organization/number-formats HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-190: `POST /organization/number-formats`
**Purpose:** Configure the number format for a document type

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /organization/number-formats HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /organization/number-formats HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-191: `GET /organization/number-formats/{documentType}`
**Purpose:** Get the number format for one document type

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /organization/number-formats/QUOTATION HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /organization/number-formats/QUOTATION HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-192: `PATCH /organization/number-formats/{documentType}`
**Purpose:** Update the number format for a document type

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /organization/number-formats/QUOTATION HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /organization/number-formats/QUOTATION HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-193: `GET /organization/number-formats/{documentType}/preview`
**Purpose:** Preview the next number for this format without consuming a sequence value

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /organization/number-formats/QUOTATION/preview HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /organization/number-formats/QUOTATION/preview HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Organization Profile

### FAIL-194: `GET /organization/profile`
**Purpose:** Get this tenant's own organization profile

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /organization/profile HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-195: `PATCH /organization/profile`
**Purpose:** Update this tenant's own organization profile (Ch.27.1)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /organization/profile HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /organization/profile HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Parties

### FAIL-196: `GET /parties`
**Purpose:** List parties (customers, agents, suppliers, carriers, etc.)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /parties HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-197: `POST /parties`
**Purpose:** Create a party

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /parties HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /parties HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-198: `DELETE /parties/{id}`
**Purpose:** Soft-delete a party

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /parties/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /parties/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-199: `GET /parties/{id}`
**Purpose:** Get a party with its contacts and addresses

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /parties/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /parties/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-200: `PATCH /parties/{id}`
**Purpose:** Update a party

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /parties/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /parties/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-201: `POST /parties/{id}/addresses`
**Purpose:** Add an address to a party

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /parties/{{ID}}}/addresses HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /parties/{{ID}}}/addresses HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-202: `DELETE /parties/{id}/addresses/{addressId}`
**Purpose:** Remove a party's address

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /parties/{{ID}}}/addresses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /parties/00000000-0000-0000-0000-000000000099}/addresses/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-203: `PATCH /parties/{id}/addresses/{addressId}`
**Purpose:** Update a party's address

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /parties/{{ID}}}/addresses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /parties/{{ID}}}/addresses/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-204: `POST /parties/{id}/contacts`
**Purpose:** Add a contact to a party

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /parties/{{ID}}}/contacts HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /parties/{{ID}}}/contacts HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-205: `DELETE /parties/{id}/contacts/{contactId}`
**Purpose:** Remove a party's contact

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /parties/{{ID}}}/contacts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /parties/00000000-0000-0000-0000-000000000099}/contacts/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-206: `PATCH /parties/{id}/contacts/{contactId}`
**Purpose:** Update a party's contact

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /parties/{{ID}}}/contacts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /parties/{{ID}}}/contacts/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-207: `PATCH /parties/{id}/credit-status`
**Purpose:** Change credit status (Active / On Hold / Blacklisted)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /parties/{{ID}}}/credit-status HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /parties/{{ID}}}/credit-status HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-208: `POST /parties/import`
**Purpose:** Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /parties/import HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /parties/import HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Payment Requests

### FAIL-209: `GET /payment-requests`
**Purpose:** List payment requests

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /payment-requests HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-210: `POST /payment-requests`
**Purpose:** Create a payment request

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /payment-requests HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /payment-requests HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-211: `DELETE /payment-requests/{id}`
**Purpose:** Soft-delete a pending payment request

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /payment-requests/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /payment-requests/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-212: `GET /payment-requests/{id}`
**Purpose:** Get a payment request

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /payment-requests/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /payment-requests/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-213: `PATCH /payment-requests/{id}`
**Purpose:** Update a pending payment request

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /payment-requests/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /payment-requests/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-214: `POST /payment-requests/{id}/approve`
**Purpose:** Approve a payment request

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /payment-requests/{{ID}}}/approve HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /payment-requests/{{ID}}}/approve HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-215: `POST /payment-requests/{id}/mark-paid`
**Purpose:** Mark an approved payment request as paid

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /payment-requests/{{ID}}}/mark-paid HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /payment-requests/{{ID}}}/mark-paid HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-216: `POST /payment-requests/{id}/reject`
**Purpose:** Reject a payment request

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /payment-requests/{{ID}}}/reject HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /payment-requests/{{ID}}}/reject HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Purchase Invoices

### FAIL-217: `GET /purchase-invoices`
**Purpose:** List purchase invoices (vendor bills)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /purchase-invoices HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-218: `POST /purchase-invoices`
**Purpose:** Create a draft purchase invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /purchase-invoices HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /purchase-invoices HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-219: `DELETE /purchase-invoices/{id}`
**Purpose:** Soft-delete a draft purchase invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /purchase-invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /purchase-invoices/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-220: `GET /purchase-invoices/{id}`
**Purpose:** Get a purchase invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /purchase-invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /purchase-invoices/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-221: `PATCH /purchase-invoices/{id}`
**Purpose:** Update a draft purchase invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /purchase-invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /purchase-invoices/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-222: `POST /purchase-invoices/{id}/post`
**Purpose:** Post a draft purchase invoice

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /purchase-invoices/{{ID}}}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /purchase-invoices/{{ID}}}/post HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Quotations

### FAIL-223: `GET /quotations`
**Purpose:** List quotations

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-224: `POST /quotations`
**Purpose:** Create a quotation (DRAFT)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-225: `DELETE /quotations/{id}`
**Purpose:** Soft-delete a quotation (DRAFT only)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /quotations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /quotations/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-226: `GET /quotations/{id}`
**Purpose:** Get a quotation with its lines, status history, and approvals

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /quotations/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-227: `PATCH /quotations/{id}`
**Purpose:** Update a quotation header (DRAFT or REJECTED only)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /quotations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /quotations/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-228: `POST /quotations/{id}/apply-tariff`
**Purpose:** Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/apply-tariff HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/apply-tariff HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-229: `POST /quotations/{id}/approve`
**Purpose:** SUBMITTED -> APPROVED

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/approve HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/approve HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-230: `POST /quotations/{id}/archive`
**Purpose:** Archive a closed quotation (soft-delete)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/archive HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/archive HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-231: `POST /quotations/{id}/convert-to-job`
**Purpose:** WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/convert-to-job HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/convert-to-job HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-232: `POST /quotations/{id}/duplicate`
**Purpose:** Clone into a new revision (new DRAFT, version+1, linked to the same parent)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/duplicate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/duplicate HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-233: `POST /quotations/{id}/expire`
**Purpose:** Manually expire a quotation past its valid_until date

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/expire HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/expire HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-234: `POST /quotations/{id}/lines`
**Purpose:** Add a charge line — GP recalculates automatically

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/lines HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-235: `DELETE /quotations/{id}/lines/{lineId}`
**Purpose:** Remove a charge line

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /quotations/{{ID}}}/lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /quotations/00000000-0000-0000-0000-000000000099}/lines/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-236: `PATCH /quotations/{id}/lines/{lineId}`
**Purpose:** Update a charge line

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /quotations/{{ID}}}/lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /quotations/{{ID}}}/lines/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-237: `POST /quotations/{id}/mark-lost`
**Purpose:** SENT -> LOST, with a reason code

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/mark-lost HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/mark-lost HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-238: `POST /quotations/{id}/mark-won`
**Purpose:** SENT -> WON

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/mark-won HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/mark-won HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-239: `GET /quotations/{id}/pdf`
**Purpose:** Get quotation PDF URLs and recent generation tasks

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/{{ID}}}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /quotations/00000000-0000-0000-0000-000000000099}/pdf HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-240: `POST /quotations/{id}/pdf`
**Purpose:** Queue PDF generation for a quotation (customer or internal mode)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/pdf HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-241: `GET /quotations/{id}/pdf/status`
**Purpose:** List PDF generation task status for a quotation

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/{{ID}}}/pdf/status HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /quotations/00000000-0000-0000-0000-000000000099}/pdf/status HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-242: `POST /quotations/{id}/reject`
**Purpose:** SUBMITTED -> REJECTED (editable again, can be resubmitted)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/reject HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/reject HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-243: `GET /quotations/{id}/revisions`
**Purpose:** List all revisions in this quotation version chain

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/{{ID}}}/revisions HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /quotations/00000000-0000-0000-0000-000000000099}/revisions HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-244: `POST /quotations/{id}/send`
**Purpose:** APPROVED -> SENT

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/send HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/send HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-245: `POST /quotations/{id}/send-email`
**Purpose:** Email quotation PDF to customer (generates PDF if not yet available)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/send-email HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/send-email HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-246: `POST /quotations/{id}/submit`
**Purpose:** DRAFT/REJECTED -> SUBMITTED, opens the approval cycle

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/{{ID}}}/submit HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/{{ID}}}/submit HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-247: `POST /quotations/expire-due`
**Purpose:** Batch-expire all quotations past valid_until (intended for daily cron)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/expire-due HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/expire-due HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-248: `POST /quotations/online-quote`
**Purpose:** Public online quote widget — customer submits cargo details, system auto-calculates from tariff (Ch.7.5)

#### Primary FAIL — invalid / incomplete body

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **400** (or 401 for bad credentials on login) |

```http
POST /quotations/online-quote HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "__invalid__": true
}
```

**Fail criteria:** Request is rejected; no resource created/updated.

---

### FAIL-249: `GET /quotations/reports/analytics`
**Purpose:** Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/reports/analytics HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-250: `GET /quotations/reports/analytics/conversion`
**Purpose:** Win/loss and quote-to-job conversion rates

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/reports/analytics/conversion HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-251: `GET /quotations/reports/analytics/lost-reasons`
**Purpose:** Lost quotation breakdown by reason code

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/reports/analytics/lost-reasons HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-252: `GET /quotations/reports/analytics/response-time`
**Purpose:** Average hours from creation to submit/send

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/reports/analytics/response-time HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-253: `GET /quotations/reports/chargewise`
**Purpose:** "All Quotations Chargewise" report — same filters as the list, with each charge line included

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/reports/chargewise HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

## Quotations — Online Tariff Master

### FAIL-254: `GET /quotations/tariffs`
**Purpose:** List tariff rate cards

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/tariffs HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-255: `POST /quotations/tariffs`
**Purpose:** Create a tariff rate card (sale rate + cost rate per lane/service/container type)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/tariffs HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/tariffs HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-256: `DELETE /quotations/tariffs/{id}`
**Purpose:** Soft-delete a tariff

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /quotations/tariffs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /quotations/tariffs/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-257: `GET /quotations/tariffs/{id}`
**Purpose:** Get a tariff by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/tariffs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /quotations/tariffs/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-258: `PATCH /quotations/tariffs/{id}`
**Purpose:** Update a tariff

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /quotations/tariffs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /quotations/tariffs/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Quotations — Zip Distance Master

### FAIL-259: `GET /quotations/zip-distances`
**Purpose:** List zip-to-zip distances

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/zip-distances HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-260: `POST /quotations/zip-distances`
**Purpose:** Record a distance between two zip/location codes

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /quotations/zip-distances HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /quotations/zip-distances HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-261: `DELETE /quotations/zip-distances/{id}`
**Purpose:** Soft-delete a zip distance record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /quotations/zip-distances/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /quotations/zip-distances/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-262: `GET /quotations/zip-distances/{id}`
**Purpose:** Get a zip distance record by id

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /quotations/zip-distances/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /quotations/zip-distances/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-263: `PATCH /quotations/zip-distances/{id}`
**Purpose:** Update a zip distance record

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /quotations/zip-distances/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /quotations/zip-distances/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Search

### FAIL-264: `GET /search`
**Purpose:** Global search across jobs, quotations, and parties

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /search HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

## Tenants (Super Admin)

### FAIL-265: `GET /tenants`
**Purpose:** Get all tenants

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /tenants HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-266: `POST /tenants`
**Purpose:** Create a new tenant (also provisions its TENANT_ADMIN owner user)

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /tenants HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /tenants HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-267: `DELETE /tenants/{id}`
**Purpose:** Soft delete tenant

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /tenants/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /tenants/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-268: `GET /tenants/{id}`
**Purpose:** Get tenant by ID

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /tenants/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /tenants/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-269: `PATCH /tenants/{id}`
**Purpose:** Update tenant

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /tenants/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /tenants/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-270: `PATCH /tenants/{id}/activate`
**Purpose:** Activate tenant

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /tenants/{{ID}}}/activate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /tenants/{{ID}}}/activate HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-271: `PATCH /tenants/{id}/deactivate`
**Purpose:** Deactivate tenant

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /tenants/{{ID}}}/deactivate HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /tenants/{{ID}}}/deactivate HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-272: `PATCH /tenants/{id}/restore`
**Purpose:** Restore tenant

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /tenants/{{ID}}}/restore HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /tenants/{{ID}}}/restore HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-273: `POST /tenants/{id}/sync-permissions`
**Purpose:** Reconcile one tenant against the current permission/role catalog

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /tenants/{{ID}}}/sync-permissions HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /tenants/{{ID}}}/sync-permissions HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-274: `GET /tenants/statistics`
**Purpose:** Tenant statistics

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /tenants/statistics HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-275: `POST /tenants/sync-permissions`
**Purpose:** Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /tenants/sync-permissions HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /tenants/sync-permissions HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Untagged

### FAIL-276: `GET /health`
**Purpose:** HealthController_health

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /health HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

## Users

### FAIL-277: `GET /users`
**Purpose:** List users for the current tenant (paginated, filterable).

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /users HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **403** if role lacks permission |

Use a staff token without the required permission (e.g. READ_ONLY / limited role).

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-278: `POST /users`
**Purpose:** Create a user. Returns a system-generated temporary password.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /users HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /users HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-279: `DELETE /users/{id}`
**Purpose:** Soft-delete a user.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
DELETE /users/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
DELETE /users/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-280: `GET /users/{id}`
**Purpose:** Get a single user by id.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
GET /users/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **404** (random UUID) or **403** |

```http
GET /users/00000000-0000-0000-0000-000000000099} HTTP/1.1
Authorization: Bearer {{TOKEN}}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-281: `PATCH /users/{id}`
**Purpose:** Update a user.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /users/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /users/{{ID}}} HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-282: `POST /users/{id}/admin-reset-password`
**Purpose:** Admin resets a target user's password to a new temporary password.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /users/{{ID}}}/admin-reset-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /users/{{ID}}}/admin-reset-password HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-283: `POST /users/{id}/force-logout`
**Purpose:** Force-logout: revoke a target user's active sessions on all devices.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /users/{{ID}}}/force-logout HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /users/{{ID}}}/force-logout HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-284: `POST /users/{id}/restore`
**Purpose:** Restore a soft-deleted user.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /users/{{ID}}}/restore HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /users/{{ID}}}/restore HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-285: `PATCH /users/{id}/status`
**Purpose:** Change a user's status (activate, suspend, etc).

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
PATCH /users/{{ID}}}/status HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
PATCH /users/{{ID}}}/status HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-286: `POST /users/bulk`
**Purpose:** Apply an action (activate/deactivate/suspend/delete/restore) to multiple users.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /users/bulk HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /users/bulk HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

### FAIL-287: `POST /users/me/change-password`
**Purpose:** Authenticated user changes their own password.

#### Primary FAIL — no Authorization header

| Field | Value |
|-------|-------|
| Case type | **FAIL** |
| Expected HTTP | **401 Unauthorized** |

```http
POST /users/me/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{}
```

**Fail criteria:** `{"statusCode":401,"message":"Unauthorized"}` (or equivalent).

#### Secondary FAIL — authenticated but invalid input / unknown id

| Field | Value |
|-------|-------|
| Auth | Bearer `{{TOKEN}}` |
| Expected HTTP | **400** (validation) or **404**/**403**/**409** |

```http
POST /users/me/change-password HTTP/1.1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "bad",
  "password": "x",
  "__invalid__": true
}
```

**Fail criteria:** Operation does not succeed; error status as above.

---

## Coverage check

- OpenAPI operations: **287**
- FAIL case sections written: **287**
- Missing: **0**
