# API PASS Cases — Complete Catalog

**Base URL:** `https://kingfisherwings.onrender.com`
**Swagger:** https://kingfisherwings.onrender.com/docs
**Total APIs:** 287 (every OpenAPI operation — none skipped)
**Generated:** 2026-07-11T06:33:56.023Z

## How to use

1. Create Super Admin → create Tenant → `POST /auth/tenant-login` → save `{{TOKEN}}`.
2. Replace placeholders: `{{TOKEN}}`, `{{ID}}`, `{{JOB_ID}}`, `{{UUID}}`, etc. with real IDs from earlier responses.
3. Password for all sample auth bodies: `Welcome@123`.
4. Header for secured routes:

```http
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

| # | Method | Path | Tag | Expected |
|---|--------|------|-----|----------|
| 1 | POST | `/auth/change-password` | Auth | 200 |
| 2 | POST | `/auth/login` | Auth | 200 |
| 3 | POST | `/auth/logout` | Auth | 200 |
| 4 | POST | `/auth/logout-all` | Auth | 200 |
| 5 | GET | `/auth/me` | Auth | 200 |
| 6 | POST | `/auth/refresh` | Auth | 200 |
| 7 | GET | `/auth/sessions` | Auth | 200 |
| 8 | POST | `/auth/sessions/{sessionId}/revoke` | Auth | 200 |
| 9 | POST | `/auth/super-admin/login` | Auth | 200 |
| 10 | POST | `/auth/super-admin/signup` | Auth | 201 |
| 11 | POST | `/auth/tenant-login` | Auth | 200 |
| 12 | POST | `/auth/tenant/change-password` | Auth | 200 |
| 13 | GET | `/awb-stock/allocations` | AWB Stock | 200 |
| 14 | POST | `/awb-stock/allocations/{id}/mark-used` | AWB Stock | 201 |
| 15 | POST | `/awb-stock/allocations/{id}/void` | AWB Stock | 201 |
| 16 | GET | `/awb-stock/batches` | AWB Stock | 200 |
| 17 | POST | `/awb-stock/batches` | AWB Stock | 201 |
| 18 | DELETE | `/awb-stock/batches/{id}` | AWB Stock | 204 |
| 19 | GET | `/awb-stock/batches/{id}` | AWB Stock | 200 |
| 20 | PATCH | `/awb-stock/batches/{id}` | AWB Stock | 200 |
| 21 | POST | `/awb-stock/batches/{id}/allocate` | AWB Stock | 201 |
| 22 | POST | `/awb-stock/batches/{id}/transfer-branch` | AWB Stock | 201 |
| 23 | GET | `/awb-stock/reports/low-stock` | AWB Stock | 200 |
| 24 | GET | `/companies` | Companies | 200 |
| 25 | POST | `/companies` | Companies | 201 |
| 26 | DELETE | `/companies/{id}` | Companies | 204 |
| 27 | GET | `/companies/{id}` | Companies | 200 |
| 28 | PATCH | `/companies/{id}` | Companies | 200 |
| 29 | GET | `/credit-notes` | Credit Notes | 200 |
| 30 | POST | `/credit-notes` | Credit Notes | 201 |
| 31 | GET | `/credit-notes/{id}` | Credit Notes | 200 |
| 32 | POST | `/credit-notes/{id}/post` | Credit Notes | 201 |
| 33 | GET | `/files/{tenantId}/{filename}` | Files | 200 |
| 34 | GET | `/invoices` | Invoices | 200 |
| 35 | POST | `/invoices` | Invoices | 201 |
| 36 | DELETE | `/invoices/{id}` | Invoices | 204 |
| 37 | GET | `/invoices/{id}` | Invoices | 200 |
| 38 | PATCH | `/invoices/{id}` | Invoices | 200 |
| 39 | POST | `/invoices/{id}/cancel` | Invoices | 201 |
| 40 | POST | `/invoices/{id}/lines` | Invoices | 201 |
| 41 | DELETE | `/invoices/{id}/lines/{lineId}` | Invoices | 204 |
| 42 | PATCH | `/invoices/{id}/lines/{lineId}` | Invoices | 200 |
| 43 | GET | `/invoices/{id}/pdf` | Invoices | 200 |
| 44 | POST | `/invoices/{id}/pdf` | Invoices | 201 |
| 45 | POST | `/invoices/{id}/post` | Invoices | 201 |
| 46 | POST | `/invoices/{id}/send` | Invoices | 201 |
| 47 | POST | `/invoices/from-job/{jobId}` | Invoices | 201 |
| 48 | GET | `/invoices/reports/overdue` | Invoices | 200 |
| 49 | GET | `/jobs` | Jobs | 200 |
| 50 | POST | `/jobs` | Jobs | 201 |
| 51 | DELETE | `/jobs/{id}` | Jobs | 204 |
| 52 | GET | `/jobs/{id}` | Jobs | 200 |
| 53 | PATCH | `/jobs/{id}` | Jobs | 200 |
| 54 | PATCH | `/jobs/{id}/air-details` | Jobs | 200 |
| 55 | POST | `/jobs/{id}/cancel` | Jobs | 201 |
| 56 | POST | `/jobs/{id}/charges` | Jobs | 201 |
| 57 | DELETE | `/jobs/{id}/charges/{chargeId}` | Jobs | 204 |
| 58 | PATCH | `/jobs/{id}/charges/{chargeId}` | Jobs | 200 |
| 59 | POST | `/jobs/{id}/close` | Jobs | 201 |
| 60 | GET | `/jobs/{id}/containers` | Jobs | 200 |
| 61 | POST | `/jobs/{id}/containers` | Jobs | 201 |
| 62 | DELETE | `/jobs/{id}/containers/{containerId}` | Jobs | 204 |
| 63 | PATCH | `/jobs/{id}/containers/{containerId}` | Jobs | 200 |
| 64 | GET | `/jobs/{id}/documents` | Jobs | 200 |
| 65 | POST | `/jobs/{id}/documents` | Jobs | 201 |
| 66 | DELETE | `/jobs/{id}/documents/{documentId}` | Jobs | 204 |
| 67 | PATCH | `/jobs/{id}/documents/{documentId}` | Jobs | 200 |
| 68 | POST | `/jobs/{id}/documents/{documentId}/finalize` | Jobs | 201 |
| 69 | POST | `/jobs/{id}/documents/cargo-manifest` | Jobs | 201 |
| 70 | GET | `/jobs/{id}/documents/generation-status` | Jobs | 200 |
| 71 | POST | `/jobs/{id}/documents/hawb` | Jobs | 201 |
| 72 | POST | `/jobs/{id}/documents/mawb` | Jobs | 201 |
| 73 | POST | `/jobs/{id}/documents/pre-alert` | Jobs | 201 |
| 74 | GET | `/jobs/{id}/house-jobs` | Jobs | 200 |
| 75 | GET | `/jobs/{id}/milestones` | Jobs | 200 |
| 76 | POST | `/jobs/{id}/milestones` | Jobs | 201 |
| 77 | PATCH | `/jobs/{id}/milestones/{milestoneId}` | Jobs | 200 |
| 78 | GET | `/jobs/{id}/notes` | Jobs | 200 |
| 79 | POST | `/jobs/{id}/notes` | Jobs | 201 |
| 80 | DELETE | `/jobs/{id}/notes/{noteId}` | Jobs | 204 |
| 81 | PATCH | `/jobs/{id}/notes/{noteId}` | Jobs | 200 |
| 82 | GET | `/jobs/{id}/pnl` | Jobs | 200 |
| 83 | POST | `/jobs/{id}/pre-alert/send` | Jobs | 201 |
| 84 | POST | `/jobs/{id}/prorate-cost/{chargeCodeId}` | Jobs | 201 |
| 85 | PATCH | `/jobs/{id}/sea-fcl-details` | Jobs | 200 |
| 86 | GET | `/masters/airlines` | Masters — Airlines | 200 |
| 87 | POST | `/masters/airlines` | Masters — Airlines | 201 |
| 88 | DELETE | `/masters/airlines/{id}` | Masters — Airlines | 204 |
| 89 | GET | `/masters/airlines/{id}` | Masters — Airlines | 200 |
| 90 | PATCH | `/masters/airlines/{id}` | Masters — Airlines | 200 |
| 91 | GET | `/masters/airports` | Masters — Airports | 200 |
| 92 | POST | `/masters/airports` | Masters — Airports | 201 |
| 93 | DELETE | `/masters/airports/{id}` | Masters — Airports | 204 |
| 94 | GET | `/masters/airports/{id}` | Masters — Airports | 200 |
| 95 | PATCH | `/masters/airports/{id}` | Masters — Airports | 200 |
| 96 | GET | `/masters/banks` | Masters — Banks | 200 |
| 97 | POST | `/masters/banks` | Masters — Banks | 201 |
| 98 | DELETE | `/masters/banks/{id}` | Masters — Banks | 204 |
| 99 | GET | `/masters/banks/{id}` | Masters — Banks | 200 |
| 100 | PATCH | `/masters/banks/{id}` | Masters — Banks | 200 |
| 101 | GET | `/masters/branches` | Masters — Branches | 200 |
| 102 | POST | `/masters/branches` | Masters — Branches | 201 |
| 103 | DELETE | `/masters/branches/{id}` | Masters — Branches | 204 |
| 104 | GET | `/masters/branches/{id}` | Masters — Branches | 200 |
| 105 | PATCH | `/masters/branches/{id}` | Masters — Branches | 200 |
| 106 | GET | `/masters/charge-codes` | Masters — ChargeCodes | 200 |
| 107 | POST | `/masters/charge-codes` | Masters — ChargeCodes | 201 |
| 108 | DELETE | `/masters/charge-codes/{id}` | Masters — ChargeCodes | 204 |
| 109 | GET | `/masters/charge-codes/{id}` | Masters — ChargeCodes | 200 |
| 110 | PATCH | `/masters/charge-codes/{id}` | Masters — ChargeCodes | 200 |
| 111 | GET | `/masters/container-types` | Masters — ContainerTypes | 200 |
| 112 | POST | `/masters/container-types` | Masters — ContainerTypes | 201 |
| 113 | DELETE | `/masters/container-types/{id}` | Masters — ContainerTypes | 204 |
| 114 | GET | `/masters/container-types/{id}` | Masters — ContainerTypes | 200 |
| 115 | PATCH | `/masters/container-types/{id}` | Masters — ContainerTypes | 200 |
| 116 | GET | `/masters/countries` | Masters — Countries | 200 |
| 117 | POST | `/masters/countries` | Masters — Countries | 201 |
| 118 | DELETE | `/masters/countries/{id}` | Masters — Countries | 204 |
| 119 | GET | `/masters/countries/{id}` | Masters — Countries | 200 |
| 120 | PATCH | `/masters/countries/{id}` | Masters — Countries | 200 |
| 121 | GET | `/masters/currencies` | Masters — Currencies | 200 |
| 122 | POST | `/masters/currencies` | Masters — Currencies | 201 |
| 123 | DELETE | `/masters/currencies/{id}` | Masters — Currencies | 204 |
| 124 | GET | `/masters/currencies/{id}` | Masters — Currencies | 200 |
| 125 | PATCH | `/masters/currencies/{id}` | Masters — Currencies | 200 |
| 126 | GET | `/masters/departments` | Masters — Departments | 200 |
| 127 | POST | `/masters/departments` | Masters — Departments | 201 |
| 128 | DELETE | `/masters/departments/{id}` | Masters — Departments | 204 |
| 129 | GET | `/masters/departments/{id}` | Masters — Departments | 200 |
| 130 | PATCH | `/masters/departments/{id}` | Masters — Departments | 200 |
| 131 | GET | `/masters/designations` | Masters — Designations | 200 |
| 132 | POST | `/masters/designations` | Masters — Designations | 201 |
| 133 | DELETE | `/masters/designations/{id}` | Masters — Designations | 204 |
| 134 | GET | `/masters/designations/{id}` | Masters — Designations | 200 |
| 135 | PATCH | `/masters/designations/{id}` | Masters — Designations | 200 |
| 136 | GET | `/masters/exchange-rates` | Masters — Exchange Rates | 200 |
| 137 | POST | `/masters/exchange-rates` | Masters — Exchange Rates | 201 |
| 138 | GET | `/masters/exchange-rates/latest/{currencyId}` | Masters — Exchange Rates | 200 |
| 139 | GET | `/masters/holidays` | Masters — Holidays | 200 |
| 140 | POST | `/masters/holidays` | Masters — Holidays | 201 |
| 141 | DELETE | `/masters/holidays/{id}` | Masters — Holidays | 204 |
| 142 | GET | `/masters/holidays/{id}` | Masters — Holidays | 200 |
| 143 | PATCH | `/masters/holidays/{id}` | Masters — Holidays | 200 |
| 144 | GET | `/masters/hs-codes` | Masters — HsCodes | 200 |
| 145 | POST | `/masters/hs-codes` | Masters — HsCodes | 201 |
| 146 | DELETE | `/masters/hs-codes/{id}` | Masters — HsCodes | 204 |
| 147 | GET | `/masters/hs-codes/{id}` | Masters — HsCodes | 200 |
| 148 | PATCH | `/masters/hs-codes/{id}` | Masters — HsCodes | 200 |
| 149 | GET | `/masters/ports` | Masters — Ports | 200 |
| 150 | POST | `/masters/ports` | Masters — Ports | 201 |
| 151 | DELETE | `/masters/ports/{id}` | Masters — Ports | 204 |
| 152 | GET | `/masters/ports/{id}` | Masters — Ports | 200 |
| 153 | PATCH | `/masters/ports/{id}` | Masters — Ports | 200 |
| 154 | GET | `/masters/shipping-lines` | Masters — ShippingLines | 200 |
| 155 | POST | `/masters/shipping-lines` | Masters — ShippingLines | 201 |
| 156 | DELETE | `/masters/shipping-lines/{id}` | Masters — ShippingLines | 204 |
| 157 | GET | `/masters/shipping-lines/{id}` | Masters — ShippingLines | 200 |
| 158 | PATCH | `/masters/shipping-lines/{id}` | Masters — ShippingLines | 200 |
| 159 | GET | `/masters/tax-rates` | Masters — TaxRates | 200 |
| 160 | POST | `/masters/tax-rates` | Masters — TaxRates | 201 |
| 161 | DELETE | `/masters/tax-rates/{id}` | Masters — TaxRates | 204 |
| 162 | GET | `/masters/tax-rates/{id}` | Masters — TaxRates | 200 |
| 163 | PATCH | `/masters/tax-rates/{id}` | Masters — TaxRates | 200 |
| 164 | GET | `/masters/truckers` | Masters — Truckers | 200 |
| 165 | POST | `/masters/truckers` | Masters — Truckers | 201 |
| 166 | DELETE | `/masters/truckers/{id}` | Masters — Truckers | 204 |
| 167 | GET | `/masters/truckers/{id}` | Masters — Truckers | 200 |
| 168 | PATCH | `/masters/truckers/{id}` | Masters — Truckers | 200 |
| 169 | GET | `/masters/units-of-measure` | Masters — UnitsOfMeasure | 200 |
| 170 | POST | `/masters/units-of-measure` | Masters — UnitsOfMeasure | 201 |
| 171 | DELETE | `/masters/units-of-measure/{id}` | Masters — UnitsOfMeasure | 204 |
| 172 | GET | `/masters/units-of-measure/{id}` | Masters — UnitsOfMeasure | 200 |
| 173 | PATCH | `/masters/units-of-measure/{id}` | Masters — UnitsOfMeasure | 200 |
| 174 | GET | `/masters/vessels` | Masters — Vessels | 200 |
| 175 | POST | `/masters/vessels` | Masters — Vessels | 201 |
| 176 | DELETE | `/masters/vessels/{id}` | Masters — Vessels | 204 |
| 177 | GET | `/masters/vessels/{id}` | Masters — Vessels | 200 |
| 178 | PATCH | `/masters/vessels/{id}` | Masters — Vessels | 200 |
| 179 | GET | `/masters/warehouses` | Masters — Warehouses | 200 |
| 180 | POST | `/masters/warehouses` | Masters — Warehouses | 201 |
| 181 | DELETE | `/masters/warehouses/{id}` | Masters — Warehouses | 204 |
| 182 | GET | `/masters/warehouses/{id}` | Masters — Warehouses | 200 |
| 183 | PATCH | `/masters/warehouses/{id}` | Masters — Warehouses | 200 |
| 184 | GET | `/organization/bank-accounts` | Organization — Bank Accounts | 200 |
| 185 | POST | `/organization/bank-accounts` | Organization — Bank Accounts | 201 |
| 186 | DELETE | `/organization/bank-accounts/{id}` | Organization — Bank Accounts | 204 |
| 187 | GET | `/organization/bank-accounts/{id}` | Organization — Bank Accounts | 200 |
| 188 | PATCH | `/organization/bank-accounts/{id}` | Organization — Bank Accounts | 200 |
| 189 | GET | `/organization/number-formats` | Organization — Number Formats | 200 |
| 190 | POST | `/organization/number-formats` | Organization — Number Formats | 201 |
| 191 | GET | `/organization/number-formats/{documentType}` | Organization — Number Formats | 200 |
| 192 | PATCH | `/organization/number-formats/{documentType}` | Organization — Number Formats | 200 |
| 193 | GET | `/organization/number-formats/{documentType}/preview` | Organization — Number Formats | 200 |
| 194 | GET | `/organization/profile` | Organization Profile | 200 |
| 195 | PATCH | `/organization/profile` | Organization Profile | 200 |
| 196 | GET | `/parties` | Parties | 200 |
| 197 | POST | `/parties` | Parties | 201 |
| 198 | DELETE | `/parties/{id}` | Parties | 204 |
| 199 | GET | `/parties/{id}` | Parties | 200 |
| 200 | PATCH | `/parties/{id}` | Parties | 200 |
| 201 | POST | `/parties/{id}/addresses` | Parties | 201 |
| 202 | DELETE | `/parties/{id}/addresses/{addressId}` | Parties | 204 |
| 203 | PATCH | `/parties/{id}/addresses/{addressId}` | Parties | 200 |
| 204 | POST | `/parties/{id}/contacts` | Parties | 201 |
| 205 | DELETE | `/parties/{id}/contacts/{contactId}` | Parties | 204 |
| 206 | PATCH | `/parties/{id}/contacts/{contactId}` | Parties | 200 |
| 207 | PATCH | `/parties/{id}/credit-status` | Parties | 200 |
| 208 | POST | `/parties/import` | Parties | 201 |
| 209 | GET | `/payment-requests` | Payment Requests | 200 |
| 210 | POST | `/payment-requests` | Payment Requests | 201 |
| 211 | DELETE | `/payment-requests/{id}` | Payment Requests | 204 |
| 212 | GET | `/payment-requests/{id}` | Payment Requests | 200 |
| 213 | PATCH | `/payment-requests/{id}` | Payment Requests | 200 |
| 214 | POST | `/payment-requests/{id}/approve` | Payment Requests | 201 |
| 215 | POST | `/payment-requests/{id}/mark-paid` | Payment Requests | 201 |
| 216 | POST | `/payment-requests/{id}/reject` | Payment Requests | 201 |
| 217 | GET | `/purchase-invoices` | Purchase Invoices | 200 |
| 218 | POST | `/purchase-invoices` | Purchase Invoices | 201 |
| 219 | DELETE | `/purchase-invoices/{id}` | Purchase Invoices | 204 |
| 220 | GET | `/purchase-invoices/{id}` | Purchase Invoices | 200 |
| 221 | PATCH | `/purchase-invoices/{id}` | Purchase Invoices | 200 |
| 222 | POST | `/purchase-invoices/{id}/post` | Purchase Invoices | 201 |
| 223 | GET | `/quotations` | Quotations | 200 |
| 224 | POST | `/quotations` | Quotations | 201 |
| 225 | DELETE | `/quotations/{id}` | Quotations | 204 |
| 226 | GET | `/quotations/{id}` | Quotations | 200 |
| 227 | PATCH | `/quotations/{id}` | Quotations | 200 |
| 228 | POST | `/quotations/{id}/apply-tariff` | Quotations | 201 |
| 229 | POST | `/quotations/{id}/approve` | Quotations | 201 |
| 230 | POST | `/quotations/{id}/archive` | Quotations | 204 |
| 231 | POST | `/quotations/{id}/convert-to-job` | Quotations | 201 |
| 232 | POST | `/quotations/{id}/duplicate` | Quotations | 201 |
| 233 | POST | `/quotations/{id}/expire` | Quotations | 201 |
| 234 | POST | `/quotations/{id}/lines` | Quotations | 201 |
| 235 | DELETE | `/quotations/{id}/lines/{lineId}` | Quotations | 204 |
| 236 | PATCH | `/quotations/{id}/lines/{lineId}` | Quotations | 200 |
| 237 | POST | `/quotations/{id}/mark-lost` | Quotations | 201 |
| 238 | POST | `/quotations/{id}/mark-won` | Quotations | 201 |
| 239 | GET | `/quotations/{id}/pdf` | Quotations | 200 |
| 240 | POST | `/quotations/{id}/pdf` | Quotations | 201 |
| 241 | GET | `/quotations/{id}/pdf/status` | Quotations | 200 |
| 242 | POST | `/quotations/{id}/reject` | Quotations | 201 |
| 243 | GET | `/quotations/{id}/revisions` | Quotations | 200 |
| 244 | POST | `/quotations/{id}/send` | Quotations | 201 |
| 245 | POST | `/quotations/{id}/send-email` | Quotations | 201 |
| 246 | POST | `/quotations/{id}/submit` | Quotations | 201 |
| 247 | POST | `/quotations/expire-due` | Quotations | 200 |
| 248 | POST | `/quotations/online-quote` | Quotations | 201 |
| 249 | GET | `/quotations/reports/analytics` | Quotations | 200 |
| 250 | GET | `/quotations/reports/analytics/conversion` | Quotations | 200 |
| 251 | GET | `/quotations/reports/analytics/lost-reasons` | Quotations | 200 |
| 252 | GET | `/quotations/reports/analytics/response-time` | Quotations | 200 |
| 253 | GET | `/quotations/reports/chargewise` | Quotations | 200 |
| 254 | GET | `/quotations/tariffs` | Quotations — Online Tariff Master | 200 |
| 255 | POST | `/quotations/tariffs` | Quotations — Online Tariff Master | 201 |
| 256 | DELETE | `/quotations/tariffs/{id}` | Quotations — Online Tariff Master | 204 |
| 257 | GET | `/quotations/tariffs/{id}` | Quotations — Online Tariff Master | 200 |
| 258 | PATCH | `/quotations/tariffs/{id}` | Quotations — Online Tariff Master | 200 |
| 259 | GET | `/quotations/zip-distances` | Quotations — Zip Distance Master | 200 |
| 260 | POST | `/quotations/zip-distances` | Quotations — Zip Distance Master | 201 |
| 261 | DELETE | `/quotations/zip-distances/{id}` | Quotations — Zip Distance Master | 204 |
| 262 | GET | `/quotations/zip-distances/{id}` | Quotations — Zip Distance Master | 200 |
| 263 | PATCH | `/quotations/zip-distances/{id}` | Quotations — Zip Distance Master | 200 |
| 264 | GET | `/search` | Search | 200 |
| 265 | GET | `/tenants` | Tenants (Super Admin) | 200 |
| 266 | POST | `/tenants` | Tenants (Super Admin) | 201 |
| 267 | DELETE | `/tenants/{id}` | Tenants (Super Admin) | 200 |
| 268 | GET | `/tenants/{id}` | Tenants (Super Admin) | 200 |
| 269 | PATCH | `/tenants/{id}` | Tenants (Super Admin) | 200 |
| 270 | PATCH | `/tenants/{id}/activate` | Tenants (Super Admin) | 200 |
| 271 | PATCH | `/tenants/{id}/deactivate` | Tenants (Super Admin) | 200 |
| 272 | PATCH | `/tenants/{id}/restore` | Tenants (Super Admin) | 200 |
| 273 | POST | `/tenants/{id}/sync-permissions` | Tenants (Super Admin) | 201 |
| 274 | GET | `/tenants/statistics` | Tenants (Super Admin) | 200 |
| 275 | POST | `/tenants/sync-permissions` | Tenants (Super Admin) | 201 |
| 276 | GET | `/health` | Untagged | 200 |
| 277 | GET | `/users` | Users | 200 |
| 278 | POST | `/users` | Users | 201 |
| 279 | DELETE | `/users/{id}` | Users | 204 |
| 280 | GET | `/users/{id}` | Users | 200 |
| 281 | PATCH | `/users/{id}` | Users | 200 |
| 282 | POST | `/users/{id}/admin-reset-password` | Users | 201 |
| 283 | POST | `/users/{id}/force-logout` | Users | 200 |
| 284 | POST | `/users/{id}/restore` | Users | 200 |
| 285 | PATCH | `/users/{id}/status` | Users | 200 |
| 286 | POST | `/users/bulk` | Users | 201 |
| 287 | POST | `/users/me/change-password` | Users | 204 |

## Auth

### PASS-001: `POST /auth/change-password`
**Purpose:** Change the authenticated user password

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/change-password` |

**Request**

```http
POST /auth/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

**Body (copy-paste)**

```json
{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-002: `POST /auth/login`
**Purpose:** Staff login: tenant slug + email + password

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Not required (@Public) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/login` |

**Request**

```http
POST /auth/login HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "tenant_slug": "kingfisher",
  "email": "test@example.com",
  "password": "Welcome@123"
}
```

**Body (copy-paste)**

```json
{
  "tenant_slug": "kingfisher",
  "email": "test@example.com",
  "password": "Welcome@123"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-003: `POST /auth/logout`
**Purpose:** Revoke the current session

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/logout` |

**Request**

```http
POST /auth/logout HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-004: `POST /auth/logout-all`
**Purpose:** Log out of every device (revokes all active sessions)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/logout-all` |

**Request**

```http
POST /auth/logout-all HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-005: `GET /auth/me`
**Purpose:** Get the authenticated principal (user, tenant owner, or super admin)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/me` |

**Request**

```http
GET /auth/me HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-006: `POST /auth/refresh`
**Purpose:** Exchange a refresh token for a new token pair

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Not required (@Public) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/refresh` |

**Request**

```http
POST /auth/refresh HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "refresh_token": "string"
}
```

**Body (copy-paste)**

```json
{
  "refresh_token": "string"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-007: `GET /auth/sessions`
**Purpose:** List the authenticated user's own active sessions

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/sessions` |

**Request**

```http
GET /auth/sessions HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-008: `POST /auth/sessions/{sessionId}/revoke`
**Purpose:** Revoke one of the authenticated user's own sessions

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/sessions/{{ID}}}/revoke` |

**Request**

```http
POST /auth/sessions/{{ID}}}/revoke HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-009: `POST /auth/super-admin/login`
**Purpose:** Platform super admin login

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Not required (@Public) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/super-admin/login` |

**Request**

```http
POST /auth/super-admin/login HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Welcome@123"
}
```

**Body (copy-paste)**

```json
{
  "email": "test@example.com",
  "password": "Welcome@123"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-010: `POST /auth/super-admin/signup`
**Purpose:** Platform super admin self-registration

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Not required (@Public) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/super-admin/signup` |

**Request**

```http
POST /auth/super-admin/signup HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Welcome@123",
  "first_name": "SAMPLE",
  "last_name": "SAMPLE"
}
```

**Body (copy-paste)**

```json
{
  "email": "test@example.com",
  "password": "Welcome@123",
  "first_name": "SAMPLE",
  "last_name": "SAMPLE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-011: `POST /auth/tenant-login`
**Purpose:** Tenant admin login: tenant slug + the tenant's own password

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Not required (@Public) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/tenant-login` |

**Request**

```http
POST /auth/tenant-login HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "tenant_slug": "kingfisher",
  "password": "Welcome@123"
}
```

**Body (copy-paste)**

```json
{
  "tenant_slug": "kingfisher",
  "password": "Welcome@123"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-012: `POST /auth/tenant/change-password`
**Purpose:** Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/auth/tenant/change-password` |

**Request**

```http
POST /auth/tenant/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

**Body (copy-paste)**

```json
{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## AWB Stock

### PASS-013: `GET /awb-stock/allocations`
**Purpose:** List AWB allocations

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/allocations?airline_id=%7B%7BUUID%7D%7D&branch_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /awb-stock/allocations?airline_id=%7B%7BUUID%7D%7D&branch_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "airline_id": "{{UUID}}",
  "branch_id": "{{UUID}}",
  "job_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-014: `POST /awb-stock/allocations/{id}/mark-used`
**Purpose:** Mark an allocated AWB as used (flown/printed)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/allocations/{{ID}}}/mark-used` |

**Request**

```http
POST /awb-stock/allocations/{{ID}}}/mark-used HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-015: `POST /awb-stock/allocations/{id}/void`
**Purpose:** Void an allocated (unused) AWB number

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/allocations/{{ID}}}/void` |

**Request**

```http
POST /awb-stock/allocations/{{ID}}}/void HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "void_reason": "SAMPLE"
}
```

**Body (copy-paste)**

```json
{
  "void_reason": "SAMPLE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-016: `GET /awb-stock/batches`
**Purpose:** List AWB stock batches

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/batches?airline_id=%7B%7BUUID%7D%7D&branch_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /awb-stock/batches?airline_id=%7B%7BUUID%7D%7D&branch_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "airline_id": "{{UUID}}",
  "branch_id": "{{UUID}}",
  "job_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-017: `POST /awb-stock/batches`
**Purpose:** Register a new AWB number range for an airline

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/batches` |

**Request**

```http
POST /awb-stock/batches HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "airline_id": "{{UUID}}",
  "prefix": "176",
  "range_from": 12345670,
  "range_to": 12345699
}
```

**Body (copy-paste)**

```json
{
  "airline_id": "{{UUID}}",
  "prefix": "176",
  "range_from": 12345670,
  "range_to": 12345699
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-018: `DELETE /awb-stock/batches/{id}`
**Purpose:** Soft-delete an empty AWB stock batch

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/batches/{{ID}}}` |

**Request**

```http
DELETE /awb-stock/batches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-019: `GET /awb-stock/batches/{id}`
**Purpose:** Get an AWB stock batch with recent allocations

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/batches/{{ID}}}` |

**Request**

```http
GET /awb-stock/batches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-020: `PATCH /awb-stock/batches/{id}`
**Purpose:** Update batch metadata (threshold, notes)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/batches/{{ID}}}` |

**Request**

```http
PATCH /awb-stock/batches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "low_stock_threshold": 1,
  "notes": "string"
}
```

**Body (copy-paste)**

```json
{
  "low_stock_threshold": 1,
  "notes": "string"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-021: `POST /awb-stock/batches/{id}/allocate`
**Purpose:** Allocate the next AWB number from a batch to a job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/batches/{{ID}}}/allocate` |

**Request**

```http
POST /awb-stock/batches/{{ID}}}/allocate HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "job_id": "{{UUID}}"
}
```

**Body (copy-paste)**

```json
{
  "job_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-022: `POST /awb-stock/batches/{id}/transfer-branch`
**Purpose:** Transfer batch ownership to another branch

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/batches/{{ID}}}/transfer-branch` |

**Request**

```http
POST /awb-stock/batches/{{ID}}}/transfer-branch HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "branch_id": "{{UUID}}"
}
```

**Body (copy-paste)**

```json
{
  "branch_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-023: `GET /awb-stock/reports/low-stock`
**Purpose:** Batches at or below their low-stock threshold

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/awb-stock/reports/low-stock` |

**Request**

```http
GET /awb-stock/reports/low-stock HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Companies

### PASS-024: `GET /companies`
**Purpose:** List this tenant's companies (usually just the one default, more for multi-entity groups)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/companies?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /companies?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-025: `POST /companies`
**Purpose:** Register an additional company under this tenant (multi-entity groups)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/companies` |

**Request**

```http
POST /companies HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "OCE-DXB",
  "name": "Oceanic Freight Forwarders (Abu Dhabi Branch) LLC",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "code": "OCE-DXB",
  "name": "Oceanic Freight Forwarders (Abu Dhabi Branch) LLC",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-026: `DELETE /companies/{id}`
**Purpose:** Soft-delete a company (blocked if it is the only one, or currently default)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/companies/{{ID}}}` |

**Request**

```http
DELETE /companies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-027: `GET /companies/{id}`
**Purpose:** Get a company by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/companies/{{ID}}}` |

**Request**

```http
GET /companies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-028: `PATCH /companies/{id}`
**Purpose:** Update a company

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/companies/{{ID}}}` |

**Request**

```http
PATCH /companies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "OCE-DXB",
  "name": "Oceanic Freight Forwarders (Abu Dhabi Branch) LLC",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "code": "OCE-DXB",
  "name": "Oceanic Freight Forwarders (Abu Dhabi Branch) LLC",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Credit Notes

### PASS-029: `GET /credit-notes`
**Purpose:** List credit notes

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/credit-notes?page=1&limit=20&status=DRAFT&invoice_type=CUSTOMER_INVOICE&party_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /credit-notes?page=1&limit=20&status=DRAFT&invoice_type=CUSTOMER_INVOICE&party_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "status": "DRAFT",
  "invoice_type": "CUSTOMER_INVOICE",
  "party_id": "{{UUID}}",
  "job_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-030: `POST /credit-notes`
**Purpose:** Create a credit note against a posted customer invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/credit-notes` |

**Request**

```http
POST /credit-notes HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "credited_invoice_id": "{{UUID}}"
}
```

**Body (copy-paste)**

```json
{
  "credited_invoice_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-031: `GET /credit-notes/{id}`
**Purpose:** Get a credit note

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/credit-notes/{{ID}}}` |

**Request**

```http
GET /credit-notes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-032: `POST /credit-notes/{id}/post`
**Purpose:** Post a draft credit note

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/credit-notes/{{ID}}}/post` |

**Request**

```http
POST /credit-notes/{{ID}}}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Files

### PASS-033: `GET /files/{tenantId}/{filename}`
**Purpose:** Download a locally stored file (PDFs generated by the system)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/files/{{ID}}}/sample.pdf` |

**Request**

```http
GET /files/{{ID}}}/sample.pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Invoices

### PASS-034: `GET /invoices`
**Purpose:** List customer invoices (Ch.18)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices?page=1&limit=20&status=DRAFT&invoice_type=CUSTOMER_INVOICE&party_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /invoices?page=1&limit=20&status=DRAFT&invoice_type=CUSTOMER_INVOICE&party_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "status": "DRAFT",
  "invoice_type": "CUSTOMER_INVOICE",
  "party_id": "{{UUID}}",
  "job_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-035: `POST /invoices`
**Purpose:** Create a draft customer invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices` |

**Request**

```http
POST /invoices HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "party_id": "{{UUID}}",
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "party_id": "{{UUID}}",
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-036: `DELETE /invoices/{id}`
**Purpose:** Soft-delete a draft invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}` |

**Request**

```http
DELETE /invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-037: `GET /invoices/{id}`
**Purpose:** Get invoice with lines

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}` |

**Request**

```http
GET /invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-038: `PATCH /invoices/{id}`
**Purpose:** Update a draft invoice header

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}` |

**Request**

```http
PATCH /invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-039: `POST /invoices/{id}/cancel`
**Purpose:** Cancel an invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}/cancel` |

**Request**

```http
POST /invoices/{{ID}}}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-040: `POST /invoices/{id}/lines`
**Purpose:** Add a line to a draft invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}/lines` |

**Request**

```http
POST /invoices/{{ID}}}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "description": "Ocean Freight",
  "unit_price": 1500
}
```

**Body (copy-paste)**

```json
{
  "description": "Ocean Freight",
  "unit_price": 1500
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-041: `DELETE /invoices/{id}/lines/{lineId}`
**Purpose:** Remove an invoice line

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}/lines/{{ID}}}` |

**Request**

```http
DELETE /invoices/{{ID}}}/lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-042: `PATCH /invoices/{id}/lines/{lineId}`
**Purpose:** Update an invoice line

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}/lines/{{ID}}}` |

**Request**

```http
PATCH /invoices/{{ID}}}/lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "description": "Ocean Freight",
  "quantity": 1,
  "unit_price": 1500,
  "charge_code_id": "{{UUID}}",
  "tax_rate_id": "{{UUID}}",
  "is_taxable": true,
  "sort_order": 0
}
```

**Body (copy-paste)**

```json
{
  "description": "Ocean Freight",
  "quantity": 1,
  "unit_price": 1500,
  "charge_code_id": "{{UUID}}",
  "tax_rate_id": "{{UUID}}",
  "is_taxable": true,
  "sort_order": 0
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-043: `GET /invoices/{id}/pdf`
**Purpose:** Get invoice PDF metadata

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}/pdf` |

**Request**

```http
GET /invoices/{{ID}}}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-044: `POST /invoices/{id}/pdf`
**Purpose:** Generate invoice PDF

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}/pdf` |

**Request**

```http
POST /invoices/{{ID}}}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-045: `POST /invoices/{id}/post`
**Purpose:** Post a draft invoice (DRAFT -> POSTED)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}/post` |

**Request**

```http
POST /invoices/{{ID}}}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-046: `POST /invoices/{id}/send`
**Purpose:** Email invoice PDF to customer

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/{{ID}}}/send` |

**Request**

```http
POST /invoices/{{ID}}}/send HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "to_email": "customer@example.com"
}
```

**Body (copy-paste)**

```json
{
  "to_email": "customer@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-047: `POST /invoices/from-job/{jobId}`
**Purpose:** Create draft invoice from uninvoiced billable job charges

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/from-job/{{ID}}}` |

**Request**

```http
POST /invoices/from-job/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-048: `GET /invoices/reports/overdue`
**Purpose:** Overdue customer invoices past due_date with outstanding balance

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/invoices/reports/overdue` |

**Request**

```http
GET /invoices/reports/overdue HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Jobs

### PASS-049: `GET /jobs`
**Purpose:** List jobs

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs?page=1&limit=20&search=string&status=ENQUIRY&job_type=AIR_EXPORT&shipper_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /jobs?page=1&limit=20&search=string&status=ENQUIRY&job_type=AIR_EXPORT&shipper_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "status": "ENQUIRY",
  "job_type": "AIR_EXPORT",
  "shipper_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-050: `POST /jobs`
**Purpose:** Create a job (booking). AIR_EXPORT jobs auto-get their detail row + the full 15-milestone taxonomy. Set parent_job_id to create a HOUSE job under an existing master.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs` |

**Request**

```http
POST /jobs HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "job_type": "AIR_EXPORT",
  "shipper_id": "{{UUID}}"
}
```

**Body (copy-paste)**

```json
{
  "job_type": "AIR_EXPORT",
  "shipper_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-051: `DELETE /jobs/{id}`
**Purpose:** Soft-delete a completed or cancelled job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}` |

**Request**

```http
DELETE /jobs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-052: `GET /jobs/{id}`
**Purpose:** Get a job with air details, charges, milestones, and its house jobs (if a master)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}` |

**Request**

```http
GET /jobs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-053: `PATCH /jobs/{id}`
**Purpose:** Update a job (not allowed once COMPLETED or CANCELLED)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}` |

**Request**

```http
PATCH /jobs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "job_type": "AIR_EXPORT"
}
```

**Body (copy-paste)**

```json
{
  "job_type": "AIR_EXPORT"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-054: `PATCH /jobs/{id}/air-details`
**Purpose:** Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/air-details` |

**Request**

```http
PATCH /jobs/{{ID}}}/air-details HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "airline_id": "{{UUID}}",
  "origin_airport_id": "{{UUID}}",
  "dest_airport_id": "{{UUID}}",
  "hawb_number": "string",
  "mawb_number": "string",
  "flight_number": "string",
  "flight_date": "string",
  "screened": false
}
```

**Body (copy-paste)**

```json
{
  "airline_id": "{{UUID}}",
  "origin_airport_id": "{{UUID}}",
  "dest_airport_id": "{{UUID}}",
  "hawb_number": "string",
  "mawb_number": "string",
  "flight_number": "string",
  "flight_date": "string",
  "screened": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-055: `POST /jobs/{id}/cancel`
**Purpose:** Cancel a job (status -> CANCELLED)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/cancel` |

**Request**

```http
POST /jobs/{{ID}}}/cancel HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-056: `POST /jobs/{id}/charges`
**Purpose:** Add a charge line — Job P&L recalculates automatically

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/charges` |

**Request**

```http
POST /jobs/{{ID}}}/charges HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "charge_code_id": "{{UUID}}",
  "description": "Ocean Freight",
  "unit_price": 850,
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "charge_code_id": "{{UUID}}",
  "description": "Ocean Freight",
  "unit_price": 850,
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-057: `DELETE /jobs/{id}/charges/{chargeId}`
**Purpose:** Remove a charge line

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/charges/{{ID}}}` |

**Request**

```http
DELETE /jobs/{{ID}}}/charges/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-058: `PATCH /jobs/{id}/charges/{chargeId}`
**Purpose:** Update a charge line

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/charges/{{ID}}}` |

**Request**

```http
PATCH /jobs/{{ID}}}/charges/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-059: `POST /jobs/{id}/close`
**Purpose:** Close a job (status -> COMPLETED)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/close` |

**Request**

```http
POST /jobs/{{ID}}}/close HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-060: `GET /jobs/{id}/containers`
**Purpose:** List containers on a Sea FCL job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/containers` |

**Request**

```http
GET /jobs/{{ID}}}/containers HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-061: `POST /jobs/{id}/containers`
**Purpose:** Add a container to a Sea FCL job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/containers` |

**Request**

```http
POST /jobs/{{ID}}}/containers HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "container_type_id": "{{UUID}}"
}
```

**Body (copy-paste)**

```json
{
  "container_type_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-062: `DELETE /jobs/{id}/containers/{containerId}`
**Purpose:** Remove a container from a Sea FCL job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/containers/{{ID}}}` |

**Request**

```http
DELETE /jobs/{{ID}}}/containers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-063: `PATCH /jobs/{id}/containers/{containerId}`
**Purpose:** Update a container on a Sea FCL job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/containers/{{ID}}}` |

**Request**

```http
PATCH /jobs/{{ID}}}/containers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "container_type_id": "{{UUID}}",
  "container_number": "SAMPLE",
  "seal_number": "SAMPLE",
  "tare_weight": 0,
  "gross_weight": 0,
  "vgm_weight": 0,
  "cbm": 0,
  "is_soc": false
}
```

**Body (copy-paste)**

```json
{
  "container_type_id": "{{UUID}}",
  "container_number": "SAMPLE",
  "seal_number": "SAMPLE",
  "tare_weight": 0,
  "gross_weight": 0,
  "vgm_weight": 0,
  "cbm": 0,
  "is_soc": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-064: `GET /jobs/{id}/documents`
**Purpose:** List documents attached to a job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents` |

**Request**

```http
GET /jobs/{{ID}}}/documents HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-065: `POST /jobs/{id}/documents`
**Purpose:** Register a document on a job (metadata + file URL)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents` |

**Request**

```http
POST /jobs/{{ID}}}/documents HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "document_type": "HAWB",
  "file_name": "HAWB-KFW-AE-001.pdf",
  "file_url": "string"
}
```

**Body (copy-paste)**

```json
{
  "document_type": "HAWB",
  "file_name": "HAWB-KFW-AE-001.pdf",
  "file_url": "string"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-066: `DELETE /jobs/{id}/documents/{documentId}`
**Purpose:** Remove a draft document

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents/{{ID}}}` |

**Request**

```http
DELETE /jobs/{{ID}}}/documents/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-067: `PATCH /jobs/{id}/documents/{documentId}`
**Purpose:** Update a draft document metadata

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents/{{ID}}}` |

**Request**

```http
PATCH /jobs/{{ID}}}/documents/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "document_type": "HAWB",
  "file_name": "HAWB-KFW-AE-001.pdf",
  "file_url": "string",
  "reference_number": "SAMPLE",
  "s3_key": "string",
  "file_size": 0,
  "mime_type": "string"
}
```

**Body (copy-paste)**

```json
{
  "document_type": "HAWB",
  "file_name": "HAWB-KFW-AE-001.pdf",
  "file_url": "string",
  "reference_number": "SAMPLE",
  "s3_key": "string",
  "file_size": 0,
  "mime_type": "string"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-068: `POST /jobs/{id}/documents/{documentId}/finalize`
**Purpose:** Finalize a document (DRAFT -> ORIGINAL, locked)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents/{{ID}}}/finalize` |

**Request**

```http
POST /jobs/{{ID}}}/documents/{{ID}}}/finalize HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "is_finalized": true
}
```

**Body (copy-paste)**

```json
{
  "is_finalized": true
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-069: `POST /jobs/{id}/documents/cargo-manifest`
**Purpose:** Queue cargo manifest PDF generation

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents/cargo-manifest` |

**Request**

```http
POST /jobs/{{ID}}}/documents/cargo-manifest HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "layout_variant": "SAMPLE",
  "is_original": false
}
```

**Body (copy-paste)**

```json
{
  "layout_variant": "SAMPLE",
  "is_original": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-070: `GET /jobs/{id}/documents/generation-status`
**Purpose:** List async document generation tasks for a job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents/generation-status` |

**Request**

```http
GET /jobs/{{ID}}}/documents/generation-status HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-071: `POST /jobs/{id}/documents/hawb`
**Purpose:** Queue HAWB PDF generation (Puppeteer + BullMQ)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents/hawb` |

**Request**

```http
POST /jobs/{{ID}}}/documents/hawb HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "layout_variant": "SAMPLE",
  "is_original": false
}
```

**Body (copy-paste)**

```json
{
  "layout_variant": "SAMPLE",
  "is_original": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-072: `POST /jobs/{id}/documents/mawb`
**Purpose:** Queue MAWB PDF generation (Puppeteer + BullMQ)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents/mawb` |

**Request**

```http
POST /jobs/{{ID}}}/documents/mawb HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "layout_variant": "SAMPLE",
  "is_original": false
}
```

**Body (copy-paste)**

```json
{
  "layout_variant": "SAMPLE",
  "is_original": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-073: `POST /jobs/{id}/documents/pre-alert`
**Purpose:** Queue pre-alert document PDF generation

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/documents/pre-alert` |

**Request**

```http
POST /jobs/{{ID}}}/documents/pre-alert HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "layout_variant": "SAMPLE",
  "is_original": false
}
```

**Body (copy-paste)**

```json
{
  "layout_variant": "SAMPLE",
  "is_original": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-074: `GET /jobs/{id}/house-jobs`
**Purpose:** List the house jobs consolidated under this master job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/house-jobs` |

**Request**

```http
GET /jobs/{{ID}}}/house-jobs HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-075: `GET /jobs/{id}/milestones`
**Purpose:** List all milestones for a job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/milestones` |

**Request**

```http
GET /jobs/{{ID}}}/milestones HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-076: `POST /jobs/{id}/milestones`
**Purpose:** Add a custom milestone outside the standard taxonomy

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/milestones` |

**Request**

```http
POST /jobs/{{ID}}}/milestones HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "milestone": "CUSTOMS_QUERY_RAISED"
}
```

**Body (copy-paste)**

```json
{
  "milestone": "CUSTOMS_QUERY_RAISED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-077: `PATCH /jobs/{id}/milestones/{milestoneId}`
**Purpose:** Update a milestone — set actual_date to mark it complete

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/milestones/{{ID}}}` |

**Request**

```http
PATCH /jobs/{{ID}}}/milestones/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "actual_date": "2026-07-15",
  "planned_date": "string",
  "notes": "string"
}
```

**Body (copy-paste)**

```json
{
  "actual_date": "2026-07-15",
  "planned_date": "string",
  "notes": "string"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-078: `GET /jobs/{id}/notes`
**Purpose:** List notes on a job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/notes` |

**Request**

```http
GET /jobs/{{ID}}}/notes HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-079: `POST /jobs/{id}/notes`
**Purpose:** Add a note to a job

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/notes` |

**Request**

```http
POST /jobs/{{ID}}}/notes HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "note": "SAMPLE"
}
```

**Body (copy-paste)**

```json
{
  "note": "SAMPLE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-080: `DELETE /jobs/{id}/notes/{noteId}`
**Purpose:** Remove a job note

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/notes/{{ID}}}` |

**Request**

```http
DELETE /jobs/{{ID}}}/notes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-081: `PATCH /jobs/{id}/notes/{noteId}`
**Purpose:** Update a job note

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/notes/{{ID}}}` |

**Request**

```http
PATCH /jobs/{{ID}}}/notes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "note": "SAMPLE",
  "is_private": false,
  "is_pinned": false
}
```

**Body (copy-paste)**

```json
{
  "note": "SAMPLE",
  "is_private": false,
  "is_pinned": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-082: `GET /jobs/{id}/pnl`
**Purpose:** Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/pnl` |

**Request**

```http
GET /jobs/{{ID}}}/pnl HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-083: `POST /jobs/{id}/pre-alert/send`
**Purpose:** Send pre-alert and mark PRE_ALERT_SENT milestone complete

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/pre-alert/send` |

**Request**

```http
POST /jobs/{{ID}}}/pre-alert/send HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "to_email": "consignee@example.com"
}
```

**Body (copy-paste)**

```json
{
  "to_email": "consignee@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-084: `POST /jobs/{id}/prorate-cost/{chargeCodeId}`
**Purpose:** Distribute a master job's cost line to its house jobs, proportionally by chargeable weight

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/prorate-cost/{{ID}}}` |

**Request**

```http
POST /jobs/{{ID}}}/prorate-cost/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-085: `PATCH /jobs/{id}/sea-fcl-details`
**Purpose:** Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/jobs/{{ID}}}/sea-fcl-details` |

**Request**

```http
PATCH /jobs/{{ID}}}/sea-fcl-details HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "shipping_line_id": "{{UUID}}",
  "vessel_id": "{{UUID}}",
  "voyage_number": "string",
  "hbl_number": "string",
  "mbl_number": "string",
  "booking_number": "string",
  "si_cutoff": "string",
  "vgm_cutoff": "string"
}
```

**Body (copy-paste)**

```json
{
  "shipping_line_id": "{{UUID}}",
  "vessel_id": "{{UUID}}",
  "voyage_number": "string",
  "hbl_number": "string",
  "mbl_number": "string",
  "booking_number": "string",
  "si_cutoff": "string",
  "vgm_cutoff": "string"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Airlines

### PASS-086: `GET /masters/airlines`
**Purpose:** list airlines

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airlines?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/airlines?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-087: `POST /masters/airlines`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airlines` |

**Request**

```http
POST /masters/airlines HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "iata_code": "EK",
  "name": "Emirates"
}
```

**Body (copy-paste)**

```json
{
  "iata_code": "EK",
  "name": "Emirates"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-088: `DELETE /masters/airlines/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airlines/{{ID}}}` |

**Request**

```http
DELETE /masters/airlines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-089: `GET /masters/airlines/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airlines/{{ID}}}` |

**Request**

```http
GET /masters/airlines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-090: `PATCH /masters/airlines/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airlines/{{ID}}}` |

**Request**

```http
PATCH /masters/airlines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Emirates"
}
```

**Body (copy-paste)**

```json
{
  "name": "Emirates"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Airports

### PASS-091: `GET /masters/airports`
**Purpose:** List airports

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airports?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/airports?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-092: `POST /masters/airports`
**Purpose:** Create an airport

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airports` |

**Request**

```http
POST /masters/airports HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "iata_code": "DXB",
  "name": "Dubai International Airport",
  "country_code": "AE"
}
```

**Body (copy-paste)**

```json
{
  "iata_code": "DXB",
  "name": "Dubai International Airport",
  "country_code": "AE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-093: `DELETE /masters/airports/{id}`
**Purpose:** Soft-delete an airport

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airports/{{ID}}}` |

**Request**

```http
DELETE /masters/airports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-094: `GET /masters/airports/{id}`
**Purpose:** Get an airport by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airports/{{ID}}}` |

**Request**

```http
GET /masters/airports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-095: `PATCH /masters/airports/{id}`
**Purpose:** Update an airport

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/airports/{{ID}}}` |

**Request**

```http
PATCH /masters/airports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Dubai International Airport"
}
```

**Body (copy-paste)**

```json
{
  "name": "Dubai International Airport"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Banks

### PASS-096: `GET /masters/banks`
**Purpose:** list banks

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/banks?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/banks?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-097: `POST /masters/banks`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/banks` |

**Request**

```http
POST /masters/banks HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Emirates NBD"
}
```

**Body (copy-paste)**

```json
{
  "name": "Emirates NBD"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-098: `DELETE /masters/banks/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/banks/{{ID}}}` |

**Request**

```http
DELETE /masters/banks/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-099: `GET /masters/banks/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/banks/{{ID}}}` |

**Request**

```http
GET /masters/banks/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-100: `PATCH /masters/banks/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/banks/{{ID}}}` |

**Request**

```http
PATCH /masters/banks/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Emirates NBD"
}
```

**Body (copy-paste)**

```json
{
  "name": "Emirates NBD"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Branches

### PASS-101: `GET /masters/branches`
**Purpose:** list branches

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/branches?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/branches?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-102: `POST /masters/branches`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/branches` |

**Request**

```http
POST /masters/branches HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Dubai Head Office",
  "code": "HO",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "name": "Dubai Head Office",
  "code": "HO",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-103: `DELETE /masters/branches/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/branches/{{ID}}}` |

**Request**

```http
DELETE /masters/branches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-104: `GET /masters/branches/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/branches/{{ID}}}` |

**Request**

```http
GET /masters/branches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-105: `PATCH /masters/branches/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/branches/{{ID}}}` |

**Request**

```http
PATCH /masters/branches/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Dubai Head Office",
  "code": "HO",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "name": "Dubai Head Office",
  "code": "HO",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — ChargeCodes

### PASS-106: `GET /masters/charge-codes`
**Purpose:** list chargecodes

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/charge-codes?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/charge-codes?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-107: `POST /masters/charge-codes`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/charge-codes` |

**Request**

```http
POST /masters/charge-codes HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "OFT",
  "description": "Ocean Freight",
  "applicable_modes": [
    "SEA",
    "AIR"
  ]
}
```

**Body (copy-paste)**

```json
{
  "code": "OFT",
  "description": "Ocean Freight",
  "applicable_modes": [
    "SEA",
    "AIR"
  ]
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-108: `DELETE /masters/charge-codes/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/charge-codes/{{ID}}}` |

**Request**

```http
DELETE /masters/charge-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-109: `GET /masters/charge-codes/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/charge-codes/{{ID}}}` |

**Request**

```http
GET /masters/charge-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-110: `PATCH /masters/charge-codes/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/charge-codes/{{ID}}}` |

**Request**

```http
PATCH /masters/charge-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "OFT"
}
```

**Body (copy-paste)**

```json
{
  "code": "OFT"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — ContainerTypes

### PASS-111: `GET /masters/container-types`
**Purpose:** List container types

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/container-types?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/container-types?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-112: `POST /masters/container-types`
**Purpose:** Create a container type

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/container-types` |

**Request**

```http
POST /masters/container-types HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "40HC",
  "name": "40ft High Cube",
  "size": "SIZE_20GP"
}
```

**Body (copy-paste)**

```json
{
  "code": "40HC",
  "name": "40ft High Cube",
  "size": "SIZE_20GP"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-113: `DELETE /masters/container-types/{id}`
**Purpose:** Soft-delete a container type

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/container-types/{{ID}}}` |

**Request**

```http
DELETE /masters/container-types/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-114: `GET /masters/container-types/{id}`
**Purpose:** Get a container type by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/container-types/{{ID}}}` |

**Request**

```http
GET /masters/container-types/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-115: `PATCH /masters/container-types/{id}`
**Purpose:** Update a container type

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/container-types/{{ID}}}` |

**Request**

```http
PATCH /masters/container-types/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "40HC",
  "name": "40ft High Cube"
}
```

**Body (copy-paste)**

```json
{
  "code": "40HC",
  "name": "40ft High Cube"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Countries

### PASS-116: `GET /masters/countries`
**Purpose:** List countries

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/countries?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/countries?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-117: `POST /masters/countries`
**Purpose:** Create a country

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/countries` |

**Request**

```http
POST /masters/countries HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "iso_code": "AE",
  "iso3_code": "ARE",
  "name": "United Arab Emirates"
}
```

**Body (copy-paste)**

```json
{
  "iso_code": "AE",
  "iso3_code": "ARE",
  "name": "United Arab Emirates"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-118: `DELETE /masters/countries/{id}`
**Purpose:** Soft-delete a country

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/countries/{{ID}}}` |

**Request**

```http
DELETE /masters/countries/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-119: `GET /masters/countries/{id}`
**Purpose:** Get a country by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/countries/{{ID}}}` |

**Request**

```http
GET /masters/countries/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-120: `PATCH /masters/countries/{id}`
**Purpose:** Update a country

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/countries/{{ID}}}` |

**Request**

```http
PATCH /masters/countries/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "United Arab Emirates"
}
```

**Body (copy-paste)**

```json
{
  "name": "United Arab Emirates"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Currencies

### PASS-121: `GET /masters/currencies`
**Purpose:** List currencies

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/currencies?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/currencies?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-122: `POST /masters/currencies`
**Purpose:** Create a currency

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/currencies` |

**Request**

```http
POST /masters/currencies HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "AED",
  "name": "UAE Dirham",
  "symbol": "د.إ"
}
```

**Body (copy-paste)**

```json
{
  "code": "AED",
  "name": "UAE Dirham",
  "symbol": "د.إ"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-123: `DELETE /masters/currencies/{id}`
**Purpose:** Soft-delete a currency

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/currencies/{{ID}}}` |

**Request**

```http
DELETE /masters/currencies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-124: `GET /masters/currencies/{id}`
**Purpose:** Get a currency by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/currencies/{{ID}}}` |

**Request**

```http
GET /masters/currencies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-125: `PATCH /masters/currencies/{id}`
**Purpose:** Update a currency

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/currencies/{{ID}}}` |

**Request**

```http
PATCH /masters/currencies/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "AED",
  "name": "UAE Dirham"
}
```

**Body (copy-paste)**

```json
{
  "code": "AED",
  "name": "UAE Dirham"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Departments

### PASS-126: `GET /masters/departments`
**Purpose:** list departments

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/departments?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/departments?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-127: `POST /masters/departments`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/departments` |

**Request**

```http
POST /masters/departments HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Operations",
  "code": "OPS"
}
```

**Body (copy-paste)**

```json
{
  "name": "Operations",
  "code": "OPS"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-128: `DELETE /masters/departments/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/departments/{{ID}}}` |

**Request**

```http
DELETE /masters/departments/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-129: `GET /masters/departments/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/departments/{{ID}}}` |

**Request**

```http
GET /masters/departments/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-130: `PATCH /masters/departments/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/departments/{{ID}}}` |

**Request**

```http
PATCH /masters/departments/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Operations",
  "code": "OPS"
}
```

**Body (copy-paste)**

```json
{
  "name": "Operations",
  "code": "OPS"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Designations

### PASS-131: `GET /masters/designations`
**Purpose:** list designations

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/designations?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/designations?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-132: `POST /masters/designations`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/designations` |

**Request**

```http
POST /masters/designations HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Operations Executive"
}
```

**Body (copy-paste)**

```json
{
  "name": "Operations Executive"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-133: `DELETE /masters/designations/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/designations/{{ID}}}` |

**Request**

```http
DELETE /masters/designations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-134: `GET /masters/designations/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/designations/{{ID}}}` |

**Request**

```http
GET /masters/designations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-135: `PATCH /masters/designations/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/designations/{{ID}}}` |

**Request**

```http
PATCH /masters/designations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Operations Executive"
}
```

**Body (copy-paste)**

```json
{
  "name": "Operations Executive"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Exchange Rates

### PASS-136: `GET /masters/exchange-rates`
**Purpose:** List exchange rates, optionally filtered by currency

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/exchange-rates?page=1&limit=20&search=string&is_active=true&order=asc&currency_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /masters/exchange-rates?page=1&limit=20&search=string&is_active=true&order=asc&currency_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc",
  "currency_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-137: `POST /masters/exchange-rates`
**Purpose:** Record (or correct) an exchange rate for a date — upserts by currency + date

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/exchange-rates` |

**Request**

```http
POST /masters/exchange-rates HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currency_id": "{{UUID}}",
  "base_currency": "USD",
  "rate": 3.6725,
  "rate_date": "2026-07-06"
}
```

**Body (copy-paste)**

```json
{
  "currency_id": "{{UUID}}",
  "base_currency": "USD",
  "rate": 3.6725,
  "rate_date": "2026-07-06"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-138: `GET /masters/exchange-rates/latest/{currencyId}`
**Purpose:** Most recent rate on file for a currency

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/exchange-rates/latest/{{ID}}}` |

**Request**

```http
GET /masters/exchange-rates/latest/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Holidays

### PASS-139: `GET /masters/holidays`
**Purpose:** list holidays

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/holidays?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/holidays?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-140: `POST /masters/holidays`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/holidays` |

**Request**

```http
POST /masters/holidays HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "country_code": "AE",
  "date": "2026-12-02",
  "name": "UAE National Day"
}
```

**Body (copy-paste)**

```json
{
  "country_code": "AE",
  "date": "2026-12-02",
  "name": "UAE National Day"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-141: `DELETE /masters/holidays/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/holidays/{{ID}}}` |

**Request**

```http
DELETE /masters/holidays/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-142: `GET /masters/holidays/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/holidays/{{ID}}}` |

**Request**

```http
GET /masters/holidays/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-143: `PATCH /masters/holidays/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/holidays/{{ID}}}` |

**Request**

```http
PATCH /masters/holidays/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "UAE National Day"
}
```

**Body (copy-paste)**

```json
{
  "name": "UAE National Day"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — HsCodes

### PASS-144: `GET /masters/hs-codes`
**Purpose:** List HS codes

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/hs-codes?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/hs-codes?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-145: `POST /masters/hs-codes`
**Purpose:** Create an HS code

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/hs-codes` |

**Request**

```http
POST /masters/hs-codes HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "hs_code": "8517.12",
  "description": "Telephones for cellular networks"
}
```

**Body (copy-paste)**

```json
{
  "hs_code": "8517.12",
  "description": "Telephones for cellular networks"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-146: `DELETE /masters/hs-codes/{id}`
**Purpose:** Soft-delete an HS code

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/hs-codes/{{ID}}}` |

**Request**

```http
DELETE /masters/hs-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-147: `GET /masters/hs-codes/{id}`
**Purpose:** Get an HS code by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/hs-codes/{{ID}}}` |

**Request**

```http
GET /masters/hs-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-148: `PATCH /masters/hs-codes/{id}`
**Purpose:** Update an HS code

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/hs-codes/{{ID}}}` |

**Request**

```http
PATCH /masters/hs-codes/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "hs_code": "8517.12",
  "description": "Telephones for cellular networks",
  "import_duty_rate": 0,
  "export_duty_rate": 0,
  "dg_class": "9",
  "un_number": "UN3481",
  "is_prohibited": false,
  "is_restricted": false
}
```

**Body (copy-paste)**

```json
{
  "hs_code": "8517.12",
  "description": "Telephones for cellular networks",
  "import_duty_rate": 0,
  "export_duty_rate": 0,
  "dg_class": "9",
  "un_number": "UN3481",
  "is_prohibited": false,
  "is_restricted": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Ports

### PASS-149: `GET /masters/ports`
**Purpose:** List ports

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/ports?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/ports?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-150: `POST /masters/ports`
**Purpose:** Create a port

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/ports` |

**Request**

```http
POST /masters/ports HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "un_locode": "AEJEA",
  "name": "Jebel Ali",
  "country_code": "AE",
  "mode": "SEA"
}
```

**Body (copy-paste)**

```json
{
  "un_locode": "AEJEA",
  "name": "Jebel Ali",
  "country_code": "AE",
  "mode": "SEA"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-151: `DELETE /masters/ports/{id}`
**Purpose:** Soft-delete a port

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/ports/{{ID}}}` |

**Request**

```http
DELETE /masters/ports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-152: `GET /masters/ports/{id}`
**Purpose:** Get a port record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/ports/{{ID}}}` |

**Request**

```http
GET /masters/ports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-153: `PATCH /masters/ports/{id}`
**Purpose:** Update a port

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/ports/{{ID}}}` |

**Request**

```http
PATCH /masters/ports/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Jebel Ali",
  "mode": "SEA"
}
```

**Body (copy-paste)**

```json
{
  "name": "Jebel Ali",
  "mode": "SEA"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — ShippingLines

### PASS-154: `GET /masters/shipping-lines`
**Purpose:** list shippinglines

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/shipping-lines?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/shipping-lines?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-155: `POST /masters/shipping-lines`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/shipping-lines` |

**Request**

```http
POST /masters/shipping-lines HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "scac_code": "MAEU",
  "name": "Maersk Line"
}
```

**Body (copy-paste)**

```json
{
  "scac_code": "MAEU",
  "name": "Maersk Line"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-156: `DELETE /masters/shipping-lines/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/shipping-lines/{{ID}}}` |

**Request**

```http
DELETE /masters/shipping-lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-157: `GET /masters/shipping-lines/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/shipping-lines/{{ID}}}` |

**Request**

```http
GET /masters/shipping-lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-158: `PATCH /masters/shipping-lines/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/shipping-lines/{{ID}}}` |

**Request**

```http
PATCH /masters/shipping-lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Maersk Line"
}
```

**Body (copy-paste)**

```json
{
  "name": "Maersk Line"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — TaxRates

### PASS-159: `GET /masters/tax-rates`
**Purpose:** list taxrates

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/tax-rates?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/tax-rates?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-160: `POST /masters/tax-rates`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/tax-rates` |

**Request**

```http
POST /masters/tax-rates HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "UAE VAT Standard",
  "code": "VAT5",
  "rate": 5,
  "country_code": "AE",
  "effective_from": "2018-01-01"
}
```

**Body (copy-paste)**

```json
{
  "name": "UAE VAT Standard",
  "code": "VAT5",
  "rate": 5,
  "country_code": "AE",
  "effective_from": "2018-01-01"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-161: `DELETE /masters/tax-rates/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/tax-rates/{{ID}}}` |

**Request**

```http
DELETE /masters/tax-rates/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-162: `GET /masters/tax-rates/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/tax-rates/{{ID}}}` |

**Request**

```http
GET /masters/tax-rates/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-163: `PATCH /masters/tax-rates/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/tax-rates/{{ID}}}` |

**Request**

```http
PATCH /masters/tax-rates/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "UAE VAT Standard",
  "code": "VAT5"
}
```

**Body (copy-paste)**

```json
{
  "name": "UAE VAT Standard",
  "code": "VAT5"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Truckers

### PASS-164: `GET /masters/truckers`
**Purpose:** list truckers

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/truckers?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/truckers?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-165: `POST /masters/truckers`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/truckers` |

**Request**

```http
POST /masters/truckers HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Al Futtaim Logistics",
  "code": "TRK-001",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "name": "Al Futtaim Logistics",
  "code": "TRK-001",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-166: `DELETE /masters/truckers/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/truckers/{{ID}}}` |

**Request**

```http
DELETE /masters/truckers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-167: `GET /masters/truckers/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/truckers/{{ID}}}` |

**Request**

```http
GET /masters/truckers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-168: `PATCH /masters/truckers/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/truckers/{{ID}}}` |

**Request**

```http
PATCH /masters/truckers/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Al Futtaim Logistics",
  "code": "TRK-001",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "name": "Al Futtaim Logistics",
  "code": "TRK-001",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — UnitsOfMeasure

### PASS-169: `GET /masters/units-of-measure`
**Purpose:** list unitsofmeasure

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/units-of-measure?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/units-of-measure?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-170: `POST /masters/units-of-measure`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/units-of-measure` |

**Request**

```http
POST /masters/units-of-measure HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "CBM",
  "name": "Cubic Meter",
  "category": "Volume"
}
```

**Body (copy-paste)**

```json
{
  "code": "CBM",
  "name": "Cubic Meter",
  "category": "Volume"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-171: `DELETE /masters/units-of-measure/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/units-of-measure/{{ID}}}` |

**Request**

```http
DELETE /masters/units-of-measure/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-172: `GET /masters/units-of-measure/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/units-of-measure/{{ID}}}` |

**Request**

```http
GET /masters/units-of-measure/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-173: `PATCH /masters/units-of-measure/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/units-of-measure/{{ID}}}` |

**Request**

```http
PATCH /masters/units-of-measure/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "CBM",
  "name": "Cubic Meter"
}
```

**Body (copy-paste)**

```json
{
  "code": "CBM",
  "name": "Cubic Meter"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Vessels

### PASS-174: `GET /masters/vessels`
**Purpose:** list vessels

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/vessels?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/vessels?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-175: `POST /masters/vessels`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/vessels` |

**Request**

```http
POST /masters/vessels HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "MSC GULSUN"
}
```

**Body (copy-paste)**

```json
{
  "name": "MSC GULSUN"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-176: `DELETE /masters/vessels/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/vessels/{{ID}}}` |

**Request**

```http
DELETE /masters/vessels/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-177: `GET /masters/vessels/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/vessels/{{ID}}}` |

**Request**

```http
GET /masters/vessels/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-178: `PATCH /masters/vessels/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/vessels/{{ID}}}` |

**Request**

```http
PATCH /masters/vessels/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "MSC GULSUN"
}
```

**Body (copy-paste)**

```json
{
  "name": "MSC GULSUN"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Masters — Warehouses

### PASS-179: `GET /masters/warehouses`
**Purpose:** list warehouses

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/warehouses?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /masters/warehouses?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-180: `POST /masters/warehouses`
**Purpose:** Create a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/warehouses` |

**Request**

```http
POST /masters/warehouses HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Jebel Ali Warehouse 3",
  "code": "WH-JA3"
}
```

**Body (copy-paste)**

```json
{
  "name": "Jebel Ali Warehouse 3",
  "code": "WH-JA3"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-181: `DELETE /masters/warehouses/{id}`
**Purpose:** Soft-delete a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/warehouses/{{ID}}}` |

**Request**

```http
DELETE /masters/warehouses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-182: `GET /masters/warehouses/{id}`
**Purpose:** Get a record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/warehouses/{{ID}}}` |

**Request**

```http
GET /masters/warehouses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-183: `PATCH /masters/warehouses/{id}`
**Purpose:** Update a record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/masters/warehouses/{{ID}}}` |

**Request**

```http
PATCH /masters/warehouses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Jebel Ali Warehouse 3",
  "code": "WH-JA3"
}
```

**Body (copy-paste)**

```json
{
  "name": "Jebel Ali Warehouse 3",
  "code": "WH-JA3"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Organization — Bank Accounts

### PASS-184: `GET /organization/bank-accounts`
**Purpose:** List this tenant's own bank accounts

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/bank-accounts?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /organization/bank-accounts?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-185: `POST /organization/bank-accounts`
**Purpose:** Add a bank account

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/bank-accounts` |

**Request**

```http
POST /organization/bank-accounts HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "bank_name": "Emirates NBD",
  "account_name": "Oceanic Freight Forwarders LLC",
  "account_number": "1234567890123",
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "bank_name": "Emirates NBD",
  "account_name": "Oceanic Freight Forwarders LLC",
  "account_number": "1234567890123",
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-186: `DELETE /organization/bank-accounts/{id}`
**Purpose:** Soft-delete a bank account

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/bank-accounts/{{ID}}}` |

**Request**

```http
DELETE /organization/bank-accounts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-187: `GET /organization/bank-accounts/{id}`
**Purpose:** Get a bank account by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/bank-accounts/{{ID}}}` |

**Request**

```http
GET /organization/bank-accounts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-188: `PATCH /organization/bank-accounts/{id}`
**Purpose:** Update a bank account

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/bank-accounts/{{ID}}}` |

**Request**

```http
PATCH /organization/bank-accounts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Organization — Number Formats

### PASS-189: `GET /organization/number-formats`
**Purpose:** List all configured document number formats (Ch.2.2)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/number-formats` |

**Request**

```http
GET /organization/number-formats HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-190: `POST /organization/number-formats`
**Purpose:** Configure the number format for a document type

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/number-formats` |

**Request**

```http
POST /organization/number-formats HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "document_type": "JOB_NUMBER",
  "prefix": "KFW"
}
```

**Body (copy-paste)**

```json
{
  "document_type": "JOB_NUMBER",
  "prefix": "KFW"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-191: `GET /organization/number-formats/{documentType}`
**Purpose:** Get the number format for one document type

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/number-formats/QUOTATION` |

**Request**

```http
GET /organization/number-formats/QUOTATION HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-192: `PATCH /organization/number-formats/{documentType}`
**Purpose:** Update the number format for a document type

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/number-formats/QUOTATION` |

**Request**

```http
PATCH /organization/number-formats/QUOTATION HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "document_type": "JOB_NUMBER",
  "prefix": "KFW",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": false,
  "sequence_length": 5,
  "separator": "/"
}
```

**Body (copy-paste)**

```json
{
  "document_type": "JOB_NUMBER",
  "prefix": "KFW",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": false,
  "sequence_length": 5,
  "separator": "/"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-193: `GET /organization/number-formats/{documentType}/preview`
**Purpose:** Preview the next number for this format without consuming a sequence value

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/number-formats/QUOTATION/preview` |

**Request**

```http
GET /organization/number-formats/QUOTATION/preview HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Organization Profile

### PASS-194: `GET /organization/profile`
**Purpose:** Get this tenant's own organization profile

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/profile` |

**Request**

```http
GET /organization/profile HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-195: `PATCH /organization/profile`
**Purpose:** Update this tenant's own organization profile (Ch.27.1)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/organization/profile` |

**Request**

```http
PATCH /organization/profile HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "SAMPLE",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "name": "SAMPLE",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Parties

### PASS-196: `GET /parties`
**Purpose:** List parties (customers, agents, suppliers, carriers, etc.)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties?page=1&limit=20&search=string&party_type=CUSTOMER&credit_status=ACTIVE&company_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /parties?page=1&limit=20&search=string&party_type=CUSTOMER&credit_status=ACTIVE&company_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "party_type": "CUSTOMER",
  "credit_status": "ACTIVE",
  "company_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-197: `POST /parties`
**Purpose:** Create a party

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties` |

**Request**

```http
POST /parties HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "email": "test@example.com",
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "email": "test@example.com",
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-198: `DELETE /parties/{id}`
**Purpose:** Soft-delete a party

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}` |

**Request**

```http
DELETE /parties/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-199: `GET /parties/{id}`
**Purpose:** Get a party with its contacts and addresses

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}` |

**Request**

```http
GET /parties/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-200: `PATCH /parties/{id}`
**Purpose:** Update a party

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}` |

**Request**

```http
PATCH /parties/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "email": "test@example.com",
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "email": "test@example.com",
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-201: `POST /parties/{id}/addresses`
**Purpose:** Add an address to a party

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}/addresses` |

**Request**

```http
POST /parties/{{ID}}}/addresses HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "label": "Warehouse",
  "address_line1": "Plot 45, Jebel Ali Free Zone",
  "country_code": "AE"
}
```

**Body (copy-paste)**

```json
{
  "label": "Warehouse",
  "address_line1": "Plot 45, Jebel Ali Free Zone",
  "country_code": "AE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-202: `DELETE /parties/{id}/addresses/{addressId}`
**Purpose:** Remove a party's address

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}/addresses/{{ID}}}` |

**Request**

```http
DELETE /parties/{{ID}}}/addresses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-203: `PATCH /parties/{id}/addresses/{addressId}`
**Purpose:** Update a party's address

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}/addresses/{{ID}}}` |

**Request**

```http
PATCH /parties/{{ID}}}/addresses/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "label": "Warehouse",
  "address_line1": "Plot 45, Jebel Ali Free Zone",
  "address_line2": "string",
  "city": "Dubai",
  "state": "string",
  "postal_code": "string",
  "country_code": "AE",
  "is_default": false
}
```

**Body (copy-paste)**

```json
{
  "label": "Warehouse",
  "address_line1": "Plot 45, Jebel Ali Free Zone",
  "address_line2": "string",
  "city": "Dubai",
  "state": "string",
  "postal_code": "string",
  "country_code": "AE",
  "is_default": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-204: `POST /parties/{id}/contacts`
**Purpose:** Add a contact to a party

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}/contacts` |

**Request**

```http
POST /parties/{{ID}}}/contacts HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Fatima Al Suwaidi",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "name": "Fatima Al Suwaidi",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-205: `DELETE /parties/{id}/contacts/{contactId}`
**Purpose:** Remove a party's contact

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}/contacts/{{ID}}}` |

**Request**

```http
DELETE /parties/{{ID}}}/contacts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-206: `PATCH /parties/{id}/contacts/{contactId}`
**Purpose:** Update a party's contact

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}/contacts/{{ID}}}` |

**Request**

```http
PATCH /parties/{{ID}}}/contacts/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Fatima Al Suwaidi",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "name": "Fatima Al Suwaidi",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-207: `PATCH /parties/{id}/credit-status`
**Purpose:** Change credit status (Active / On Hold / Blacklisted)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/{{ID}}}/credit-status` |

**Request**

```http
PATCH /parties/{{ID}}}/credit-status HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "credit_status": "ACTIVE"
}
```

**Body (copy-paste)**

```json
{
  "credit_status": "ACTIVE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-208: `POST /parties/import`
**Purpose:** Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/parties/import` |

**Request**

```http
POST /parties/import HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Payment Requests

### PASS-209: `GET /payment-requests`
**Purpose:** List payment requests

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/payment-requests?page=1&limit=20&status=PENDING&party_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /payment-requests?page=1&limit=20&status=PENDING&party_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "status": "PENDING",
  "party_id": "{{UUID}}",
  "job_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-210: `POST /payment-requests`
**Purpose:** Create a payment request

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/payment-requests` |

**Request**

```http
POST /payment-requests HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "party_id": "{{UUID}}",
  "amount": 5000,
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "party_id": "{{UUID}}",
  "amount": 5000,
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-211: `DELETE /payment-requests/{id}`
**Purpose:** Soft-delete a pending payment request

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/payment-requests/{{ID}}}` |

**Request**

```http
DELETE /payment-requests/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-212: `GET /payment-requests/{id}`
**Purpose:** Get a payment request

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/payment-requests/{{ID}}}` |

**Request**

```http
GET /payment-requests/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-213: `PATCH /payment-requests/{id}`
**Purpose:** Update a pending payment request

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/payment-requests/{{ID}}}` |

**Request**

```http
PATCH /payment-requests/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-214: `POST /payment-requests/{id}/approve`
**Purpose:** Approve a payment request

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/payment-requests/{{ID}}}/approve` |

**Request**

```http
POST /payment-requests/{{ID}}}/approve HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-215: `POST /payment-requests/{id}/mark-paid`
**Purpose:** Mark an approved payment request as paid

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/payment-requests/{{ID}}}/mark-paid` |

**Request**

```http
POST /payment-requests/{{ID}}}/mark-paid HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-216: `POST /payment-requests/{id}/reject`
**Purpose:** Reject a payment request

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/payment-requests/{{ID}}}/reject` |

**Request**

```http
POST /payment-requests/{{ID}}}/reject HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "rejected_reason": "SAMPLE"
}
```

**Body (copy-paste)**

```json
{
  "rejected_reason": "SAMPLE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Purchase Invoices

### PASS-217: `GET /purchase-invoices`
**Purpose:** List purchase invoices (vendor bills)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/purchase-invoices?page=1&limit=20&status=DRAFT&invoice_type=CUSTOMER_INVOICE&party_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /purchase-invoices?page=1&limit=20&status=DRAFT&invoice_type=CUSTOMER_INVOICE&party_id=%7B%7BUUID%7D%7D&job_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "status": "DRAFT",
  "invoice_type": "CUSTOMER_INVOICE",
  "party_id": "{{UUID}}",
  "job_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-218: `POST /purchase-invoices`
**Purpose:** Create a draft purchase invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/purchase-invoices` |

**Request**

```http
POST /purchase-invoices HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "party_id": "{{UUID}}",
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "party_id": "{{UUID}}",
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-219: `DELETE /purchase-invoices/{id}`
**Purpose:** Soft-delete a draft purchase invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/purchase-invoices/{{ID}}}` |

**Request**

```http
DELETE /purchase-invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-220: `GET /purchase-invoices/{id}`
**Purpose:** Get a purchase invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/purchase-invoices/{{ID}}}` |

**Request**

```http
GET /purchase-invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-221: `PATCH /purchase-invoices/{id}`
**Purpose:** Update a draft purchase invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/purchase-invoices/{{ID}}}` |

**Request**

```http
PATCH /purchase-invoices/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-222: `POST /purchase-invoices/{id}/post`
**Purpose:** Post a draft purchase invoice

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/purchase-invoices/{{ID}}}/post` |

**Request**

```http
POST /purchase-invoices/{{ID}}}/post HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Quotations

### PASS-223: `GET /quotations`
**Purpose:** List quotations

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations?page=1&limit=20&search=string&status=DRAFT&job_type=AIR_EXPORT&customer_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /quotations?page=1&limit=20&search=string&status=DRAFT&job_type=AIR_EXPORT&customer_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "status": "DRAFT",
  "job_type": "AIR_EXPORT",
  "customer_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-224: `POST /quotations`
**Purpose:** Create a quotation (DRAFT)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations` |

**Request**

```http
POST /quotations HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "job_type": "AIR_EXPORT",
  "customer_id": "{{UUID}}",
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "job_type": "AIR_EXPORT",
  "customer_id": "{{UUID}}",
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-225: `DELETE /quotations/{id}`
**Purpose:** Soft-delete a quotation (DRAFT only)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}` |

**Request**

```http
DELETE /quotations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-226: `GET /quotations/{id}`
**Purpose:** Get a quotation with its lines, status history, and approvals

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}` |

**Request**

```http
GET /quotations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-227: `PATCH /quotations/{id}`
**Purpose:** Update a quotation header (DRAFT or REJECTED only)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}` |

**Request**

```http
PATCH /quotations/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "job_type": "AIR_EXPORT",
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "job_type": "AIR_EXPORT",
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-228: `POST /quotations/{id}/apply-tariff`
**Purpose:** Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/apply-tariff` |

**Request**

```http
POST /quotations/{{ID}}}/apply-tariff HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-229: `POST /quotations/{id}/approve`
**Purpose:** SUBMITTED -> APPROVED

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/approve` |

**Request**

```http
POST /quotations/{{ID}}}/approve HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "comments": "SAMPLE"
}
```

**Body (copy-paste)**

```json
{
  "comments": "SAMPLE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-230: `POST /quotations/{id}/archive`
**Purpose:** Archive a closed quotation (soft-delete)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/archive` |

**Request**

```http
POST /quotations/{{ID}}}/archive HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-231: `POST /quotations/{id}/convert-to-job`
**Purpose:** WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/convert-to-job` |

**Request**

```http
POST /quotations/{{ID}}}/convert-to-job HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-232: `POST /quotations/{id}/duplicate`
**Purpose:** Clone into a new revision (new DRAFT, version+1, linked to the same parent)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/duplicate` |

**Request**

```http
POST /quotations/{{ID}}}/duplicate HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-233: `POST /quotations/{id}/expire`
**Purpose:** Manually expire a quotation past its valid_until date

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/expire` |

**Request**

```http
POST /quotations/{{ID}}}/expire HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-234: `POST /quotations/{id}/lines`
**Purpose:** Add a charge line — GP recalculates automatically

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/lines` |

**Request**

```http
POST /quotations/{{ID}}}/lines HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "charge_code_id": "{{UUID}}",
  "description": "Ocean Freight",
  "unit_price": 850,
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "charge_code_id": "{{UUID}}",
  "description": "Ocean Freight",
  "unit_price": 850,
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-235: `DELETE /quotations/{id}/lines/{lineId}`
**Purpose:** Remove a charge line

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/lines/{{ID}}}` |

**Request**

```http
DELETE /quotations/{{ID}}}/lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-236: `PATCH /quotations/{id}/lines/{lineId}`
**Purpose:** Update a charge line

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/lines/{{ID}}}` |

**Request**

```http
PATCH /quotations/{{ID}}}/lines/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-237: `POST /quotations/{id}/mark-lost`
**Purpose:** SENT -> LOST, with a reason code

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/mark-lost` |

**Request**

```http
POST /quotations/{{ID}}}/mark-lost HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "reason": "Competitor Rate"
}
```

**Body (copy-paste)**

```json
{
  "reason": "Competitor Rate"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-238: `POST /quotations/{id}/mark-won`
**Purpose:** SENT -> WON

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/mark-won` |

**Request**

```http
POST /quotations/{{ID}}}/mark-won HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-239: `GET /quotations/{id}/pdf`
**Purpose:** Get quotation PDF URLs and recent generation tasks

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/pdf` |

**Request**

```http
GET /quotations/{{ID}}}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-240: `POST /quotations/{id}/pdf`
**Purpose:** Queue PDF generation for a quotation (customer or internal mode)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/pdf` |

**Request**

```http
POST /quotations/{{ID}}}/pdf HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "mode": "CUSTOMER"
}
```

**Body (copy-paste)**

```json
{
  "mode": "CUSTOMER"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-241: `GET /quotations/{id}/pdf/status`
**Purpose:** List PDF generation task status for a quotation

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/pdf/status` |

**Request**

```http
GET /quotations/{{ID}}}/pdf/status HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-242: `POST /quotations/{id}/reject`
**Purpose:** SUBMITTED -> REJECTED (editable again, can be resubmitted)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/reject` |

**Request**

```http
POST /quotations/{{ID}}}/reject HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "comments": "SAMPLE"
}
```

**Body (copy-paste)**

```json
{
  "comments": "SAMPLE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-243: `GET /quotations/{id}/revisions`
**Purpose:** List all revisions in this quotation version chain

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/revisions` |

**Request**

```http
GET /quotations/{{ID}}}/revisions HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-244: `POST /quotations/{id}/send`
**Purpose:** APPROVED -> SENT

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/send` |

**Request**

```http
POST /quotations/{{ID}}}/send HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-245: `POST /quotations/{id}/send-email`
**Purpose:** Email quotation PDF to customer (generates PDF if not yet available)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/send-email` |

**Request**

```http
POST /quotations/{{ID}}}/send-email HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "to_email": "customer@example.com"
}
```

**Body (copy-paste)**

```json
{
  "to_email": "customer@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-246: `POST /quotations/{id}/submit`
**Purpose:** DRAFT/REJECTED -> SUBMITTED, opens the approval cycle

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/{{ID}}}/submit` |

**Request**

```http
POST /quotations/{{ID}}}/submit HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-247: `POST /quotations/expire-due`
**Purpose:** Batch-expire all quotations past valid_until (intended for daily cron)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/expire-due` |

**Request**

```http
POST /quotations/expire-due HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-248: `POST /quotations/online-quote`
**Purpose:** Public online quote widget — customer submits cargo details, system auto-calculates from tariff (Ch.7.5)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Not required (@Public) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/online-quote` |

**Request**

```http
POST /quotations/online-quote HTTP/1.1
Host: kingfisherwings.onrender.com
Content-Type: application/json

{
  "tenant_slug": "kingfisher",
  "job_type": "AIR_EXPORT",
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "tenant_slug": "kingfisher",
  "job_type": "AIR_EXPORT",
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-249: `GET /quotations/reports/analytics`
**Purpose:** Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/reports/analytics?from_date=string&to_date=string&branch_id=%7B%7BUUID%7D%7D&salesperson_id=%7B%7BUUID%7D%7D&customer_id=%7B%7BUUID%7D%7D&job_type=AIR_EXPORT` |

**Request**

```http
GET /quotations/reports/analytics?from_date=string&to_date=string&branch_id=%7B%7BUUID%7D%7D&salesperson_id=%7B%7BUUID%7D%7D&customer_id=%7B%7BUUID%7D%7D&job_type=AIR_EXPORT HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "from_date": "string",
  "to_date": "string",
  "branch_id": "{{UUID}}",
  "salesperson_id": "{{UUID}}",
  "customer_id": "{{UUID}}",
  "job_type": "AIR_EXPORT"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-250: `GET /quotations/reports/analytics/conversion`
**Purpose:** Win/loss and quote-to-job conversion rates

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/reports/analytics/conversion?from_date=string&to_date=string&branch_id=%7B%7BUUID%7D%7D&salesperson_id=%7B%7BUUID%7D%7D&customer_id=%7B%7BUUID%7D%7D&job_type=AIR_EXPORT` |

**Request**

```http
GET /quotations/reports/analytics/conversion?from_date=string&to_date=string&branch_id=%7B%7BUUID%7D%7D&salesperson_id=%7B%7BUUID%7D%7D&customer_id=%7B%7BUUID%7D%7D&job_type=AIR_EXPORT HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "from_date": "string",
  "to_date": "string",
  "branch_id": "{{UUID}}",
  "salesperson_id": "{{UUID}}",
  "customer_id": "{{UUID}}",
  "job_type": "AIR_EXPORT"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-251: `GET /quotations/reports/analytics/lost-reasons`
**Purpose:** Lost quotation breakdown by reason code

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/reports/analytics/lost-reasons?from_date=string&to_date=string&branch_id=%7B%7BUUID%7D%7D&salesperson_id=%7B%7BUUID%7D%7D&customer_id=%7B%7BUUID%7D%7D&job_type=AIR_EXPORT` |

**Request**

```http
GET /quotations/reports/analytics/lost-reasons?from_date=string&to_date=string&branch_id=%7B%7BUUID%7D%7D&salesperson_id=%7B%7BUUID%7D%7D&customer_id=%7B%7BUUID%7D%7D&job_type=AIR_EXPORT HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "from_date": "string",
  "to_date": "string",
  "branch_id": "{{UUID}}",
  "salesperson_id": "{{UUID}}",
  "customer_id": "{{UUID}}",
  "job_type": "AIR_EXPORT"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-252: `GET /quotations/reports/analytics/response-time`
**Purpose:** Average hours from creation to submit/send

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/reports/analytics/response-time?from_date=string&to_date=string&branch_id=%7B%7BUUID%7D%7D&salesperson_id=%7B%7BUUID%7D%7D&customer_id=%7B%7BUUID%7D%7D&job_type=AIR_EXPORT` |

**Request**

```http
GET /quotations/reports/analytics/response-time?from_date=string&to_date=string&branch_id=%7B%7BUUID%7D%7D&salesperson_id=%7B%7BUUID%7D%7D&customer_id=%7B%7BUUID%7D%7D&job_type=AIR_EXPORT HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "from_date": "string",
  "to_date": "string",
  "branch_id": "{{UUID}}",
  "salesperson_id": "{{UUID}}",
  "customer_id": "{{UUID}}",
  "job_type": "AIR_EXPORT"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-253: `GET /quotations/reports/chargewise`
**Purpose:** "All Quotations Chargewise" report — same filters as the list, with each charge line included

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/reports/chargewise?page=1&limit=20&search=string&status=DRAFT&job_type=AIR_EXPORT&customer_id=%7B%7BUUID%7D%7D` |

**Request**

```http
GET /quotations/reports/chargewise?page=1&limit=20&search=string&status=DRAFT&job_type=AIR_EXPORT&customer_id=%7B%7BUUID%7D%7D HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "status": "DRAFT",
  "job_type": "AIR_EXPORT",
  "customer_id": "{{UUID}}"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Quotations — Online Tariff Master

### PASS-254: `GET /quotations/tariffs`
**Purpose:** List tariff rate cards

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/tariffs?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /quotations/tariffs?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-255: `POST /quotations/tariffs`
**Purpose:** Create a tariff rate card (sale rate + cost rate per lane/service/container type)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/tariffs` |

**Request**

```http
POST /quotations/tariffs HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "service_type": "AIR_EXPORT",
  "charge_code_id": "{{UUID}}",
  "sale_rate": 850,
  "cost_rate": 620,
  "currency_code": "AED",
  "valid_from": "2026-01-01"
}
```

**Body (copy-paste)**

```json
{
  "service_type": "AIR_EXPORT",
  "charge_code_id": "{{UUID}}",
  "sale_rate": 850,
  "cost_rate": 620,
  "currency_code": "AED",
  "valid_from": "2026-01-01"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-256: `DELETE /quotations/tariffs/{id}`
**Purpose:** Soft-delete a tariff

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/tariffs/{{ID}}}` |

**Request**

```http
DELETE /quotations/tariffs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-257: `GET /quotations/tariffs/{id}`
**Purpose:** Get a tariff by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/tariffs/{{ID}}}` |

**Request**

```http
GET /quotations/tariffs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-258: `PATCH /quotations/tariffs/{id}`
**Purpose:** Update a tariff

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/tariffs/{{ID}}}` |

**Request**

```http
PATCH /quotations/tariffs/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currency_code": "AED"
}
```

**Body (copy-paste)**

```json
{
  "currency_code": "AED"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Quotations — Zip Distance Master

### PASS-259: `GET /quotations/zip-distances`
**Purpose:** List zip-to-zip distances

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/zip-distances?page=1&limit=20&search=string&is_active=true&order=asc` |

**Request**

```http
GET /quotations/zip-distances?page=1&limit=20&search=string&is_active=true&order=asc HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "is_active": true,
  "order": "asc"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-260: `POST /quotations/zip-distances`
**Purpose:** Record a distance between two zip/location codes

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/zip-distances` |

**Request**

```http
POST /quotations/zip-distances HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "from_zip": "00000",
  "to_zip": "11111",
  "distance": 140
}
```

**Body (copy-paste)**

```json
{
  "from_zip": "00000",
  "to_zip": "11111",
  "distance": 140
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-261: `DELETE /quotations/zip-distances/{id}`
**Purpose:** Soft-delete a zip distance record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/zip-distances/{{ID}}}` |

**Request**

```http
DELETE /quotations/zip-distances/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-262: `GET /quotations/zip-distances/{id}`
**Purpose:** Get a zip distance record by id

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/zip-distances/{{ID}}}` |

**Request**

```http
GET /quotations/zip-distances/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-263: `PATCH /quotations/zip-distances/{id}`
**Purpose:** Update a zip distance record

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/quotations/zip-distances/{{ID}}}` |

**Request**

```http
PATCH /quotations/zip-distances/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "from_zip": "00000",
  "from_city": "Dubai",
  "to_zip": "11111",
  "to_city": "Abu Dhabi",
  "distance": 140,
  "unit": "KM",
  "is_active": true
}
```

**Body (copy-paste)**

```json
{
  "from_zip": "00000",
  "from_city": "Dubai",
  "to_zip": "11111",
  "to_city": "Abu Dhabi",
  "distance": 140,
  "unit": "KM",
  "is_active": true
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Search

### PASS-264: `GET /search`
**Purpose:** Global search across jobs, quotations, and parties

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/search?q=KFW%2FAE&types=jobs%2Cquotations%2Cparties&limit=20` |

**Request**

```http
GET /search?q=KFW%2FAE&types=jobs%2Cquotations%2Cparties&limit=20 HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "q": "KFW/AE",
  "types": "jobs,quotations,parties",
  "limit": 20
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Tenants (Super Admin)

### PASS-265: `GET /tenants`
**Purpose:** Get all tenants

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants?search=string` |

**Request**

```http
GET /tenants?search=string HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "search": "string"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-266: `POST /tenants`
**Purpose:** Create a new tenant (also provisions its TENANT_ADMIN owner user)

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants` |

**Request**

```http
POST /tenants HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "code": "SAMPLE",
  "name": "SAMPLE",
  "slug": "kingfisher",
  "password": "Welcome@123",
  "email": "test@example.com"
}
```

**Body (copy-paste)**

```json
{
  "code": "SAMPLE",
  "name": "SAMPLE",
  "slug": "kingfisher",
  "password": "Welcome@123",
  "email": "test@example.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-267: `DELETE /tenants/{id}`
**Purpose:** Soft delete tenant

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants/{{ID}}}` |

**Request**

```http
DELETE /tenants/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-268: `GET /tenants/{id}`
**Purpose:** Get tenant by ID

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants/{{ID}}}` |

**Request**

```http
GET /tenants/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-269: `PATCH /tenants/{id}`
**Purpose:** Update tenant

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants/{{ID}}}` |

**Request**

```http
PATCH /tenants/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{}
```

**Body (copy-paste)**

```json
{}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-270: `PATCH /tenants/{id}/activate`
**Purpose:** Activate tenant

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants/{{ID}}}/activate` |

**Request**

```http
PATCH /tenants/{{ID}}}/activate HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-271: `PATCH /tenants/{id}/deactivate`
**Purpose:** Deactivate tenant

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants/{{ID}}}/deactivate` |

**Request**

```http
PATCH /tenants/{{ID}}}/deactivate HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-272: `PATCH /tenants/{id}/restore`
**Purpose:** Restore tenant

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants/{{ID}}}/restore` |

**Request**

```http
PATCH /tenants/{{ID}}}/restore HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-273: `POST /tenants/{id}/sync-permissions`
**Purpose:** Reconcile one tenant against the current permission/role catalog

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants/{{ID}}}/sync-permissions` |

**Request**

```http
POST /tenants/{{ID}}}/sync-permissions HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-274: `GET /tenants/statistics`
**Purpose:** Tenant statistics

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants/statistics` |

**Request**

```http
GET /tenants/statistics HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-275: `POST /tenants/sync-permissions`
**Purpose:** Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/tenants/sync-permissions` |

**Request**

```http
POST /tenants/sync-permissions HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Untagged

### PASS-276: `GET /health`
**Purpose:** HealthController_health

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/health` |

**Request**

```http
GET /health HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Users

### PASS-277: `GET /users`
**Purpose:** List users for the current tenant (paginated, filterable).

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/users?page=1&limit=10&search=string&role=SUPER_ADMIN&status=ACTIVE&sortBy=created_at` |

**Request**

```http
GET /users?page=1&limit=10&search=string&role=SUPER_ADMIN&status=ACTIVE&sortBy=created_at HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Query params**

```json
{
  "page": 1,
  "limit": 10,
  "search": "string",
  "role": "SUPER_ADMIN",
  "status": "ACTIVE",
  "sortBy": "created_at"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-278: `POST /users`
**Purpose:** Create a user. Returns a system-generated temporary password.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/users` |

**Request**

```http
POST /users HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "ahmed@kingfisherwings.com",
  "first_name": "Ahmed",
  "last_name": "Khan",
  "role": "SUPER_ADMIN"
}
```

**Body (copy-paste)**

```json
{
  "email": "ahmed@kingfisherwings.com",
  "first_name": "Ahmed",
  "last_name": "Khan",
  "role": "SUPER_ADMIN"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-279: `DELETE /users/{id}`
**Purpose:** Soft-delete a user.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/users/{{ID}}}` |

**Request**

```http
DELETE /users/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-280: `GET /users/{id}`
**Purpose:** Get a single user by id.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/users/{{ID}}}` |

**Request**

```http
GET /users/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-281: `PATCH /users/{id}`
**Purpose:** Update a user.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/users/{{ID}}}` |

**Request**

```http
PATCH /users/{{ID}}} HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "ahmed@kingfisherwings.com"
}
```

**Body (copy-paste)**

```json
{
  "email": "ahmed@kingfisherwings.com"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-282: `POST /users/{id}/admin-reset-password`
**Purpose:** Admin resets a target user's password to a new temporary password.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/users/{{ID}}}/admin-reset-password` |

**Request**

```http
POST /users/{{ID}}}/admin-reset-password HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "require_password_change": true,
  "send_email": false
}
```

**Body (copy-paste)**

```json
{
  "require_password_change": true,
  "send_email": false
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-283: `POST /users/{id}/force-logout`
**Purpose:** Force-logout: revoke a target user's active sessions on all devices.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/users/{{ID}}}/force-logout` |

**Request**

```http
POST /users/{{ID}}}/force-logout HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-284: `POST /users/{id}/restore`
**Purpose:** Restore a soft-deleted user.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/users/{{ID}}}/restore` |

**Request**

```http
POST /users/{{ID}}}/restore HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-285: `PATCH /users/{id}/status`
**Purpose:** Change a user's status (activate, suspend, etc).

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **200** |
| Concrete URL | `https://kingfisherwings.onrender.com/users/{{ID}}}/status` |

**Request**

```http
PATCH /users/{{ID}}}/status HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

**Body (copy-paste)**

```json
{
  "status": "ACTIVE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-286: `POST /users/bulk`
**Purpose:** Apply an action (activate/deactivate/suspend/delete/restore) to multiple users.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **201** |
| Concrete URL | `https://kingfisherwings.onrender.com/users/bulk` |

**Request**

```http
POST /users/bulk HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "ids": [
    "{{UUID}}"
  ],
  "action": "ACTIVATE"
}
```

**Body (copy-paste)**

```json
{
  "ids": [
    "{{UUID}}"
  ],
  "action": "ACTIVATE"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

### PASS-287: `POST /users/me/change-password`
**Purpose:** Authenticated user changes their own password.

| Field | Value |
|-------|-------|
| Case type | **PASS** |
| Auth | Bearer `{{TOKEN}}` (or Super-Admin token for /tenants) |
| Expected HTTP | **204** |
| Concrete URL | `https://kingfisherwings.onrender.com/users/me/change-password` |

**Request**

```http
POST /users/me/change-password HTTP/1.1
Host: kingfisherwings.onrender.com
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

**Body (copy-paste)**

```json
{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

**Pass criteria:** Response status is in 2xx and body matches the resource contract (id present on create, list/meta on list, empty on 204).

---

## Coverage check

- OpenAPI operations: **287**
- PASS cases written: **287**
- Missing: **0**
