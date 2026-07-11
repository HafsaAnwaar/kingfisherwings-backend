# Kingfisher Wings ERP — Purpose of Every API

**Base URL:** `https://kingfisherwings.onrender.com`
**Swagger:** https://kingfisherwings.onrender.com/docs
**Total APIs documented:** 287 (none skipped)
**Generated:** 2026-07-11T07:36:18.360Z

This guide explains **what each area of the system is for**, then **why each API exists** and **what it does**.

## End-to-end business flow (how APIs connect)

```
Super Admin creates Tenant
   → Tenant Admin / Staff login (Auth)
   → Masters (ports, airlines, charge codes, tax…)
   → Parties (customers / shippers)
   → Quotation (price → approve → send → win)
   → Job (booking, milestones, charges)
   → AWB Stock allocate (air waybill number)
   → Documents / pre-alert
   → Invoice from job → post → PDF → email
   → Payment request / credit note if needed
```

## Index by module

| # | Method | Path | Module |
|---|--------|------|--------|
| 1 | POST | `/auth/change-password` | Auth |
| 2 | POST | `/auth/login` | Auth |
| 3 | POST | `/auth/logout` | Auth |
| 4 | POST | `/auth/logout-all` | Auth |
| 5 | GET | `/auth/me` | Auth |
| 6 | POST | `/auth/refresh` | Auth |
| 7 | GET | `/auth/sessions` | Auth |
| 8 | POST | `/auth/sessions/{sessionId}/revoke` | Auth |
| 9 | POST | `/auth/super-admin/login` | Auth |
| 10 | POST | `/auth/super-admin/signup` | Auth |
| 11 | POST | `/auth/tenant-login` | Auth |
| 12 | POST | `/auth/tenant/change-password` | Auth |
| 13 | GET | `/awb-stock/allocations` | AWB Stock |
| 14 | POST | `/awb-stock/allocations/{id}/mark-used` | AWB Stock |
| 15 | POST | `/awb-stock/allocations/{id}/void` | AWB Stock |
| 16 | GET | `/awb-stock/batches` | AWB Stock |
| 17 | POST | `/awb-stock/batches` | AWB Stock |
| 18 | DELETE | `/awb-stock/batches/{id}` | AWB Stock |
| 19 | GET | `/awb-stock/batches/{id}` | AWB Stock |
| 20 | PATCH | `/awb-stock/batches/{id}` | AWB Stock |
| 21 | POST | `/awb-stock/batches/{id}/allocate` | AWB Stock |
| 22 | POST | `/awb-stock/batches/{id}/transfer-branch` | AWB Stock |
| 23 | GET | `/awb-stock/reports/low-stock` | AWB Stock |
| 24 | GET | `/companies` | Companies |
| 25 | POST | `/companies` | Companies |
| 26 | DELETE | `/companies/{id}` | Companies |
| 27 | GET | `/companies/{id}` | Companies |
| 28 | PATCH | `/companies/{id}` | Companies |
| 29 | GET | `/credit-notes` | Credit Notes |
| 30 | POST | `/credit-notes` | Credit Notes |
| 31 | GET | `/credit-notes/{id}` | Credit Notes |
| 32 | POST | `/credit-notes/{id}/post` | Credit Notes |
| 33 | GET | `/files/{tenantId}/{filename}` | Files |
| 34 | GET | `/invoices` | Invoices |
| 35 | POST | `/invoices` | Invoices |
| 36 | DELETE | `/invoices/{id}` | Invoices |
| 37 | GET | `/invoices/{id}` | Invoices |
| 38 | PATCH | `/invoices/{id}` | Invoices |
| 39 | POST | `/invoices/{id}/cancel` | Invoices |
| 40 | POST | `/invoices/{id}/lines` | Invoices |
| 41 | DELETE | `/invoices/{id}/lines/{lineId}` | Invoices |
| 42 | PATCH | `/invoices/{id}/lines/{lineId}` | Invoices |
| 43 | GET | `/invoices/{id}/pdf` | Invoices |
| 44 | POST | `/invoices/{id}/pdf` | Invoices |
| 45 | POST | `/invoices/{id}/post` | Invoices |
| 46 | POST | `/invoices/{id}/send` | Invoices |
| 47 | POST | `/invoices/from-job/{jobId}` | Invoices |
| 48 | GET | `/invoices/reports/overdue` | Invoices |
| 49 | GET | `/jobs` | Jobs |
| 50 | POST | `/jobs` | Jobs |
| 51 | DELETE | `/jobs/{id}` | Jobs |
| 52 | GET | `/jobs/{id}` | Jobs |
| 53 | PATCH | `/jobs/{id}` | Jobs |
| 54 | PATCH | `/jobs/{id}/air-details` | Jobs |
| 55 | POST | `/jobs/{id}/cancel` | Jobs |
| 56 | POST | `/jobs/{id}/charges` | Jobs |
| 57 | DELETE | `/jobs/{id}/charges/{chargeId}` | Jobs |
| 58 | PATCH | `/jobs/{id}/charges/{chargeId}` | Jobs |
| 59 | POST | `/jobs/{id}/close` | Jobs |
| 60 | GET | `/jobs/{id}/containers` | Jobs |
| 61 | POST | `/jobs/{id}/containers` | Jobs |
| 62 | DELETE | `/jobs/{id}/containers/{containerId}` | Jobs |
| 63 | PATCH | `/jobs/{id}/containers/{containerId}` | Jobs |
| 64 | GET | `/jobs/{id}/documents` | Jobs |
| 65 | POST | `/jobs/{id}/documents` | Jobs |
| 66 | DELETE | `/jobs/{id}/documents/{documentId}` | Jobs |
| 67 | PATCH | `/jobs/{id}/documents/{documentId}` | Jobs |
| 68 | POST | `/jobs/{id}/documents/{documentId}/finalize` | Jobs |
| 69 | POST | `/jobs/{id}/documents/cargo-manifest` | Jobs |
| 70 | GET | `/jobs/{id}/documents/generation-status` | Jobs |
| 71 | POST | `/jobs/{id}/documents/hawb` | Jobs |
| 72 | POST | `/jobs/{id}/documents/mawb` | Jobs |
| 73 | POST | `/jobs/{id}/documents/pre-alert` | Jobs |
| 74 | GET | `/jobs/{id}/house-jobs` | Jobs |
| 75 | GET | `/jobs/{id}/milestones` | Jobs |
| 76 | POST | `/jobs/{id}/milestones` | Jobs |
| 77 | PATCH | `/jobs/{id}/milestones/{milestoneId}` | Jobs |
| 78 | GET | `/jobs/{id}/notes` | Jobs |
| 79 | POST | `/jobs/{id}/notes` | Jobs |
| 80 | DELETE | `/jobs/{id}/notes/{noteId}` | Jobs |
| 81 | PATCH | `/jobs/{id}/notes/{noteId}` | Jobs |
| 82 | GET | `/jobs/{id}/pnl` | Jobs |
| 83 | POST | `/jobs/{id}/pre-alert/send` | Jobs |
| 84 | POST | `/jobs/{id}/prorate-cost/{chargeCodeId}` | Jobs |
| 85 | PATCH | `/jobs/{id}/sea-fcl-details` | Jobs |
| 86 | GET | `/masters/airlines` | Masters — Airlines |
| 87 | POST | `/masters/airlines` | Masters — Airlines |
| 88 | DELETE | `/masters/airlines/{id}` | Masters — Airlines |
| 89 | GET | `/masters/airlines/{id}` | Masters — Airlines |
| 90 | PATCH | `/masters/airlines/{id}` | Masters — Airlines |
| 91 | GET | `/masters/airports` | Masters — Airports |
| 92 | POST | `/masters/airports` | Masters — Airports |
| 93 | DELETE | `/masters/airports/{id}` | Masters — Airports |
| 94 | GET | `/masters/airports/{id}` | Masters — Airports |
| 95 | PATCH | `/masters/airports/{id}` | Masters — Airports |
| 96 | GET | `/masters/banks` | Masters — Banks |
| 97 | POST | `/masters/banks` | Masters — Banks |
| 98 | DELETE | `/masters/banks/{id}` | Masters — Banks |
| 99 | GET | `/masters/banks/{id}` | Masters — Banks |
| 100 | PATCH | `/masters/banks/{id}` | Masters — Banks |
| 101 | GET | `/masters/branches` | Masters — Branches |
| 102 | POST | `/masters/branches` | Masters — Branches |
| 103 | DELETE | `/masters/branches/{id}` | Masters — Branches |
| 104 | GET | `/masters/branches/{id}` | Masters — Branches |
| 105 | PATCH | `/masters/branches/{id}` | Masters — Branches |
| 106 | GET | `/masters/charge-codes` | Masters — ChargeCodes |
| 107 | POST | `/masters/charge-codes` | Masters — ChargeCodes |
| 108 | DELETE | `/masters/charge-codes/{id}` | Masters — ChargeCodes |
| 109 | GET | `/masters/charge-codes/{id}` | Masters — ChargeCodes |
| 110 | PATCH | `/masters/charge-codes/{id}` | Masters — ChargeCodes |
| 111 | GET | `/masters/container-types` | Masters — ContainerTypes |
| 112 | POST | `/masters/container-types` | Masters — ContainerTypes |
| 113 | DELETE | `/masters/container-types/{id}` | Masters — ContainerTypes |
| 114 | GET | `/masters/container-types/{id}` | Masters — ContainerTypes |
| 115 | PATCH | `/masters/container-types/{id}` | Masters — ContainerTypes |
| 116 | GET | `/masters/countries` | Masters — Countries |
| 117 | POST | `/masters/countries` | Masters — Countries |
| 118 | DELETE | `/masters/countries/{id}` | Masters — Countries |
| 119 | GET | `/masters/countries/{id}` | Masters — Countries |
| 120 | PATCH | `/masters/countries/{id}` | Masters — Countries |
| 121 | GET | `/masters/currencies` | Masters — Currencies |
| 122 | POST | `/masters/currencies` | Masters — Currencies |
| 123 | DELETE | `/masters/currencies/{id}` | Masters — Currencies |
| 124 | GET | `/masters/currencies/{id}` | Masters — Currencies |
| 125 | PATCH | `/masters/currencies/{id}` | Masters — Currencies |
| 126 | GET | `/masters/departments` | Masters — Departments |
| 127 | POST | `/masters/departments` | Masters — Departments |
| 128 | DELETE | `/masters/departments/{id}` | Masters — Departments |
| 129 | GET | `/masters/departments/{id}` | Masters — Departments |
| 130 | PATCH | `/masters/departments/{id}` | Masters — Departments |
| 131 | GET | `/masters/designations` | Masters — Designations |
| 132 | POST | `/masters/designations` | Masters — Designations |
| 133 | DELETE | `/masters/designations/{id}` | Masters — Designations |
| 134 | GET | `/masters/designations/{id}` | Masters — Designations |
| 135 | PATCH | `/masters/designations/{id}` | Masters — Designations |
| 136 | GET | `/masters/exchange-rates` | Masters — Exchange Rates |
| 137 | POST | `/masters/exchange-rates` | Masters — Exchange Rates |
| 138 | GET | `/masters/exchange-rates/latest/{currencyId}` | Masters — Exchange Rates |
| 139 | GET | `/masters/holidays` | Masters — Holidays |
| 140 | POST | `/masters/holidays` | Masters — Holidays |
| 141 | DELETE | `/masters/holidays/{id}` | Masters — Holidays |
| 142 | GET | `/masters/holidays/{id}` | Masters — Holidays |
| 143 | PATCH | `/masters/holidays/{id}` | Masters — Holidays |
| 144 | GET | `/masters/hs-codes` | Masters — HsCodes |
| 145 | POST | `/masters/hs-codes` | Masters — HsCodes |
| 146 | DELETE | `/masters/hs-codes/{id}` | Masters — HsCodes |
| 147 | GET | `/masters/hs-codes/{id}` | Masters — HsCodes |
| 148 | PATCH | `/masters/hs-codes/{id}` | Masters — HsCodes |
| 149 | GET | `/masters/ports` | Masters — Ports |
| 150 | POST | `/masters/ports` | Masters — Ports |
| 151 | DELETE | `/masters/ports/{id}` | Masters — Ports |
| 152 | GET | `/masters/ports/{id}` | Masters — Ports |
| 153 | PATCH | `/masters/ports/{id}` | Masters — Ports |
| 154 | GET | `/masters/shipping-lines` | Masters — ShippingLines |
| 155 | POST | `/masters/shipping-lines` | Masters — ShippingLines |
| 156 | DELETE | `/masters/shipping-lines/{id}` | Masters — ShippingLines |
| 157 | GET | `/masters/shipping-lines/{id}` | Masters — ShippingLines |
| 158 | PATCH | `/masters/shipping-lines/{id}` | Masters — ShippingLines |
| 159 | GET | `/masters/tax-rates` | Masters — TaxRates |
| 160 | POST | `/masters/tax-rates` | Masters — TaxRates |
| 161 | DELETE | `/masters/tax-rates/{id}` | Masters — TaxRates |
| 162 | GET | `/masters/tax-rates/{id}` | Masters — TaxRates |
| 163 | PATCH | `/masters/tax-rates/{id}` | Masters — TaxRates |
| 164 | GET | `/masters/truckers` | Masters — Truckers |
| 165 | POST | `/masters/truckers` | Masters — Truckers |
| 166 | DELETE | `/masters/truckers/{id}` | Masters — Truckers |
| 167 | GET | `/masters/truckers/{id}` | Masters — Truckers |
| 168 | PATCH | `/masters/truckers/{id}` | Masters — Truckers |
| 169 | GET | `/masters/units-of-measure` | Masters — UnitsOfMeasure |
| 170 | POST | `/masters/units-of-measure` | Masters — UnitsOfMeasure |
| 171 | DELETE | `/masters/units-of-measure/{id}` | Masters — UnitsOfMeasure |
| 172 | GET | `/masters/units-of-measure/{id}` | Masters — UnitsOfMeasure |
| 173 | PATCH | `/masters/units-of-measure/{id}` | Masters — UnitsOfMeasure |
| 174 | GET | `/masters/vessels` | Masters — Vessels |
| 175 | POST | `/masters/vessels` | Masters — Vessels |
| 176 | DELETE | `/masters/vessels/{id}` | Masters — Vessels |
| 177 | GET | `/masters/vessels/{id}` | Masters — Vessels |
| 178 | PATCH | `/masters/vessels/{id}` | Masters — Vessels |
| 179 | GET | `/masters/warehouses` | Masters — Warehouses |
| 180 | POST | `/masters/warehouses` | Masters — Warehouses |
| 181 | DELETE | `/masters/warehouses/{id}` | Masters — Warehouses |
| 182 | GET | `/masters/warehouses/{id}` | Masters — Warehouses |
| 183 | PATCH | `/masters/warehouses/{id}` | Masters — Warehouses |
| 184 | GET | `/organization/bank-accounts` | Organization — Bank Accounts |
| 185 | POST | `/organization/bank-accounts` | Organization — Bank Accounts |
| 186 | DELETE | `/organization/bank-accounts/{id}` | Organization — Bank Accounts |
| 187 | GET | `/organization/bank-accounts/{id}` | Organization — Bank Accounts |
| 188 | PATCH | `/organization/bank-accounts/{id}` | Organization — Bank Accounts |
| 189 | GET | `/organization/number-formats` | Organization — Number Formats |
| 190 | POST | `/organization/number-formats` | Organization — Number Formats |
| 191 | GET | `/organization/number-formats/{documentType}` | Organization — Number Formats |
| 192 | PATCH | `/organization/number-formats/{documentType}` | Organization — Number Formats |
| 193 | GET | `/organization/number-formats/{documentType}/preview` | Organization — Number Formats |
| 194 | GET | `/organization/profile` | Organization Profile |
| 195 | PATCH | `/organization/profile` | Organization Profile |
| 196 | GET | `/parties` | Parties |
| 197 | POST | `/parties` | Parties |
| 198 | DELETE | `/parties/{id}` | Parties |
| 199 | GET | `/parties/{id}` | Parties |
| 200 | PATCH | `/parties/{id}` | Parties |
| 201 | POST | `/parties/{id}/addresses` | Parties |
| 202 | DELETE | `/parties/{id}/addresses/{addressId}` | Parties |
| 203 | PATCH | `/parties/{id}/addresses/{addressId}` | Parties |
| 204 | POST | `/parties/{id}/contacts` | Parties |
| 205 | DELETE | `/parties/{id}/contacts/{contactId}` | Parties |
| 206 | PATCH | `/parties/{id}/contacts/{contactId}` | Parties |
| 207 | PATCH | `/parties/{id}/credit-status` | Parties |
| 208 | POST | `/parties/import` | Parties |
| 209 | GET | `/payment-requests` | Payment Requests |
| 210 | POST | `/payment-requests` | Payment Requests |
| 211 | DELETE | `/payment-requests/{id}` | Payment Requests |
| 212 | GET | `/payment-requests/{id}` | Payment Requests |
| 213 | PATCH | `/payment-requests/{id}` | Payment Requests |
| 214 | POST | `/payment-requests/{id}/approve` | Payment Requests |
| 215 | POST | `/payment-requests/{id}/mark-paid` | Payment Requests |
| 216 | POST | `/payment-requests/{id}/reject` | Payment Requests |
| 217 | GET | `/purchase-invoices` | Purchase Invoices |
| 218 | POST | `/purchase-invoices` | Purchase Invoices |
| 219 | DELETE | `/purchase-invoices/{id}` | Purchase Invoices |
| 220 | GET | `/purchase-invoices/{id}` | Purchase Invoices |
| 221 | PATCH | `/purchase-invoices/{id}` | Purchase Invoices |
| 222 | POST | `/purchase-invoices/{id}/post` | Purchase Invoices |
| 223 | GET | `/quotations` | Quotations |
| 224 | POST | `/quotations` | Quotations |
| 225 | DELETE | `/quotations/{id}` | Quotations |
| 226 | GET | `/quotations/{id}` | Quotations |
| 227 | PATCH | `/quotations/{id}` | Quotations |
| 228 | POST | `/quotations/{id}/apply-tariff` | Quotations |
| 229 | POST | `/quotations/{id}/approve` | Quotations |
| 230 | POST | `/quotations/{id}/archive` | Quotations |
| 231 | POST | `/quotations/{id}/convert-to-job` | Quotations |
| 232 | POST | `/quotations/{id}/duplicate` | Quotations |
| 233 | POST | `/quotations/{id}/expire` | Quotations |
| 234 | POST | `/quotations/{id}/lines` | Quotations |
| 235 | DELETE | `/quotations/{id}/lines/{lineId}` | Quotations |
| 236 | PATCH | `/quotations/{id}/lines/{lineId}` | Quotations |
| 237 | POST | `/quotations/{id}/mark-lost` | Quotations |
| 238 | POST | `/quotations/{id}/mark-won` | Quotations |
| 239 | GET | `/quotations/{id}/pdf` | Quotations |
| 240 | POST | `/quotations/{id}/pdf` | Quotations |
| 241 | GET | `/quotations/{id}/pdf/status` | Quotations |
| 242 | POST | `/quotations/{id}/reject` | Quotations |
| 243 | GET | `/quotations/{id}/revisions` | Quotations |
| 244 | POST | `/quotations/{id}/send` | Quotations |
| 245 | POST | `/quotations/{id}/send-email` | Quotations |
| 246 | POST | `/quotations/{id}/submit` | Quotations |
| 247 | POST | `/quotations/expire-due` | Quotations |
| 248 | POST | `/quotations/online-quote` | Quotations |
| 249 | GET | `/quotations/reports/analytics` | Quotations |
| 250 | GET | `/quotations/reports/analytics/conversion` | Quotations |
| 251 | GET | `/quotations/reports/analytics/lost-reasons` | Quotations |
| 252 | GET | `/quotations/reports/analytics/response-time` | Quotations |
| 253 | GET | `/quotations/reports/chargewise` | Quotations |
| 254 | GET | `/quotations/tariffs` | Quotations — Online Tariff Master |
| 255 | POST | `/quotations/tariffs` | Quotations — Online Tariff Master |
| 256 | DELETE | `/quotations/tariffs/{id}` | Quotations — Online Tariff Master |
| 257 | GET | `/quotations/tariffs/{id}` | Quotations — Online Tariff Master |
| 258 | PATCH | `/quotations/tariffs/{id}` | Quotations — Online Tariff Master |
| 259 | GET | `/quotations/zip-distances` | Quotations — Zip Distance Master |
| 260 | POST | `/quotations/zip-distances` | Quotations — Zip Distance Master |
| 261 | DELETE | `/quotations/zip-distances/{id}` | Quotations — Zip Distance Master |
| 262 | GET | `/quotations/zip-distances/{id}` | Quotations — Zip Distance Master |
| 263 | PATCH | `/quotations/zip-distances/{id}` | Quotations — Zip Distance Master |
| 264 | GET | `/search` | Search |
| 265 | GET | `/tenants` | Tenants (Super Admin) |
| 266 | POST | `/tenants` | Tenants (Super Admin) |
| 267 | DELETE | `/tenants/{id}` | Tenants (Super Admin) |
| 268 | GET | `/tenants/{id}` | Tenants (Super Admin) |
| 269 | PATCH | `/tenants/{id}` | Tenants (Super Admin) |
| 270 | PATCH | `/tenants/{id}/activate` | Tenants (Super Admin) |
| 271 | PATCH | `/tenants/{id}/deactivate` | Tenants (Super Admin) |
| 272 | PATCH | `/tenants/{id}/restore` | Tenants (Super Admin) |
| 273 | POST | `/tenants/{id}/sync-permissions` | Tenants (Super Admin) |
| 274 | GET | `/tenants/statistics` | Tenants (Super Admin) |
| 275 | POST | `/tenants/sync-permissions` | Tenants (Super Admin) |
| 276 | GET | `/health` | Untagged |
| 277 | GET | `/users` | Users |
| 278 | POST | `/users` | Users |
| 279 | DELETE | `/users/{id}` | Users |
| 280 | GET | `/users/{id}` | Users |
| 281 | PATCH | `/users/{id}` | Users |
| 282 | POST | `/users/{id}/admin-reset-password` | Users |
| 283 | POST | `/users/{id}/force-logout` | Users |
| 284 | POST | `/users/{id}/restore` | Users |
| 285 | PATCH | `/users/{id}/status` | Users |
| 286 | POST | `/users/bulk` | Users |
| 287 | POST | `/users/me/change-password` | Users |

## Auth

### What is Auth?
Authentication proves **who** is calling the API. Kingfisher has three login types:
- **Super Admin** — platform owner (creates tenants)
- **Tenant Admin** — company owner (tenant password)
- **Staff User** — employees with roles/permissions

JWTs (access + refresh) carry `tenantId` and permissions. Almost every other API requires `Authorization: Bearer <token>`.

### 001. `POST /auth/change-password`

**Swagger summary:** Change the authenticated user password

| | |
|-|-|
| **Why it exists** | Users must rotate passwords (policy / first login). |
| **What it does** | Updates the user password hash and password history. |

### 002. `POST /auth/login`

**Swagger summary:** Staff login: tenant slug + email + password

| | |
|-|-|
| **Why it exists** | Daily staff login. |
| **What it does** | Validates tenant slug + email + password; returns access/refresh tokens and permissions. |

### 003. `POST /auth/logout`

**Swagger summary:** Revoke the current session

| | |
|-|-|
| **Why it exists** | End current device session securely. |
| **What it does** | Revokes the current session (jti) so the token cannot be reused. |

### 004. `POST /auth/logout-all`

**Swagger summary:** Log out of every device (revokes all active sessions)

| | |
|-|-|
| **Why it exists** | Lost laptop / security incident. |
| **What it does** | Revokes every active session for the user. |

### 005. `GET /auth/me`

**Swagger summary:** Get the authenticated principal (user, tenant owner, or super admin)

| | |
|-|-|
| **Why it exists** | UI needs current user profile and permissions on load. |
| **What it does** | Returns the authenticated principal (user or super admin). |

### 006. `POST /auth/refresh`

**Swagger summary:** Exchange a refresh token for a new token pair

| | |
|-|-|
| **Why it exists** | Access tokens expire; clients renew without re-entering password. |
| **What it does** | Exchanges refresh token for a new token pair. |

### 007. `GET /auth/sessions`

**Swagger summary:** List the authenticated user's own active sessions

| | |
|-|-|
| **Why it exists** | Show where the user is logged in. |
| **What it does** | Lists active sessions (devices). |

### 008. `POST /auth/sessions/{sessionId}/revoke`

**Swagger summary:** Revoke one of the authenticated user's own sessions

| | |
|-|-|
| **Why it exists** | Kill one suspicious device. |
| **What it does** | Revokes a single session by id. |

### 009. `POST /auth/super-admin/login`

**Swagger summary:** Platform super admin login

| | |
|-|-|
| **Why it exists** | Super Admin must access tenant management. |
| **What it does** | Validates credentials and issues Super Admin JWT. |

### 010. `POST /auth/super-admin/signup`

**Swagger summary:** Platform super admin self-registration

| | |
|-|-|
| **Why it exists** | Bootstrap the platform owner account once. |
| **What it does** | Creates a Super Admin and returns tokens. |

### 011. `POST /auth/tenant-login`

**Swagger summary:** Tenant admin login: tenant slug + the tenant's own password

| | |
|-|-|
| **Why it exists** | Company owner logs in with the tenant password (not a staff email). |
| **What it does** | Verifies tenant password and returns TENANT_ADMIN user tokens. |

### 012. `POST /auth/tenant/change-password`

**Swagger summary:** Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only.

| | |
|-|-|
| **Why it exists** | Change the tenant-owner login credential separately from staff passwords. |
| **What it does** | Updates Tenant.password_hash (TENANT_ADMIN only). |

## AWB Stock

### What is AWB?
**AWB = Air Waybill** — the official air cargo transport document/number.

Airlines issue blocks of AWB numbers (prefix + serial range), e.g. Emirates prefix `176` with numbers `176-12345670` … `176-12345699`.

**AWB Stock** is the inventory of those unused numbers. Ops:
1. Register a batch (range) for an airline
2. **Allocate** the next number to a job (stamps HAWB/MAWB)
3. Mark **used** when flown/printed, or **void** if spoiled
4. Monitor **low stock** so you reorder from the airline before running out

Without stock control, duplicate or invalid AWBs cause airline rejection and customs delays.

### 013. `GET /awb-stock/allocations`

**Swagger summary:** List AWB allocations

| | |
|-|-|
| **Why it exists** | Audit which jobs received which AWB numbers. |
| **What it does** | Lists AWB allocations (optionally filtered by job/airline). |

### 014. `POST /awb-stock/allocations/{id}/mark-used`

**Swagger summary:** Mark an allocated AWB as used (flown/printed)

| | |
|-|-|
| **Why it exists** | Track that the AWB was actually printed/flown so stock reporting stays accurate. |
| **What it does** | Moves allocation status from ALLOCATED → USED. |

### 015. `POST /awb-stock/allocations/{id}/void`

**Swagger summary:** Void an allocated (unused) AWB number

| | |
|-|-|
| **Why it exists** | Wrong print, damaged stock, or cancelled booking must not leave the number reusable incorrectly. |
| **What it does** | Marks an allocated (unused) AWB as VOIDED with a reason. |

### 016. `GET /awb-stock/batches`

**Swagger summary:** List AWB stock batches

| | |
|-|-|
| **Why it exists** | See available AWB inventory. |
| **What it does** | Lists AWB stock batches for the tenant. |

### 017. `POST /awb-stock/batches`

**Swagger summary:** Register a new AWB number range for an airline

| | |
|-|-|
| **Why it exists** | Register a new block of AWB numbers received from an airline. |
| **What it does** | Creates a stock batch with prefix + range_from/range_to and next_number pointer. |

### 018. `DELETE /awb-stock/batches/{id}`

**Swagger summary:** Soft-delete an empty AWB stock batch

| | |
|-|-|
| **Why it exists** | Remove an empty/unused batch from active inventory. |
| **What it does** | Soft-deletes the batch if no active allocations. |

### 019. `GET /awb-stock/batches/{id}`

**Swagger summary:** Get an AWB stock batch with recent allocations

| | |
|-|-|
| **Why it exists** | Inspect one batch and recent allocations. |
| **What it does** | Get an AWB stock batch with recent allocations |

### 020. `PATCH /awb-stock/batches/{id}`

**Swagger summary:** Update batch metadata (threshold, notes)

| | |
|-|-|
| **Why it exists** | Adjust threshold/notes without changing the number range. |
| **What it does** | Update batch metadata (threshold, notes) |

### 021. `POST /awb-stock/batches/{id}/allocate`

**Swagger summary:** Allocate the next AWB number from a batch to a job

| | |
|-|-|
| **Why it exists** | Each air shipment needs a unique AWB number assigned from airline stock. |
| **What it does** | Takes the next serial from the batch, creates an allocation linked to the job, and stamps HAWB/MAWB on air details. |

### 022. `POST /awb-stock/batches/{id}/transfer-branch`

**Swagger summary:** Transfer batch ownership to another branch

| | |
|-|-|
| **Why it exists** | AWB paper/electronic stock may move between Dubai and another branch. |
| **What it does** | Updates the batch’s owning branch_id. |

### 023. `GET /awb-stock/reports/low-stock`

**Swagger summary:** Batches at or below their low-stock threshold

| | |
|-|-|
| **Why it exists** | Running out of AWB numbers stops air bookings; ops must reorder from the airline in time. |
| **What it does** | Returns batches whose remaining numbers are at or below the low-stock threshold. |

## Companies

### What is a Company?
A **company** is a legal entity under a tenant (multi-entity groups). Most tenants have one default company created at signup. Jobs, parties, and invoices can be tagged to a company.

### 024. `GET /companies`

**Swagger summary:** List this tenant's companies (usually just the one default, more for multi-entity groups)

| | |
|-|-|
| **Why it exists** | Legal entity under the tenant for multi-company accounting. |
| **What it does** | List this tenant's companies (usually just the one default, more for multi-entity groups) |

### 025. `POST /companies`

**Swagger summary:** Register an additional company under this tenant (multi-entity groups)

| | |
|-|-|
| **Why it exists** | Legal entity under the tenant for multi-company accounting. |
| **What it does** | Register an additional company under this tenant (multi-entity groups) |

### 026. `DELETE /companies/{id}`

**Swagger summary:** Soft-delete a company (blocked if it is the only one, or currently default)

| | |
|-|-|
| **Why it exists** | Legal entity under the tenant for multi-company accounting. |
| **What it does** | Soft-delete a company (blocked if it is the only one, or currently default) |

### 027. `GET /companies/{id}`

**Swagger summary:** Get a company by id

| | |
|-|-|
| **Why it exists** | Legal entity under the tenant for multi-company accounting. |
| **What it does** | Get a company by id |

### 028. `PATCH /companies/{id}`

**Swagger summary:** Update a company

| | |
|-|-|
| **Why it exists** | Legal entity under the tenant for multi-company accounting. |
| **What it does** | Update a company |

## Credit Notes

### What is a Credit Note?
A document that **reduces** what a customer owes on a previous invoice (rate correction, short-shipment, goodwill). Always linked to the original invoice.

### 029. `GET /credit-notes`

**Swagger summary:** List credit notes

| | |
|-|-|
| **Why it exists** | Correct overbilling without deleting the original tax invoice. |
| **What it does** | List credit notes |

### 030. `POST /credit-notes`

**Swagger summary:** Create a credit note against a posted customer invoice

| | |
|-|-|
| **Why it exists** | Correct overbilling without deleting the original tax invoice. |
| **What it does** | Create a credit note against a posted customer invoice |

### 031. `GET /credit-notes/{id}`

**Swagger summary:** Get a credit note

| | |
|-|-|
| **Why it exists** | Correct overbilling without deleting the original tax invoice. |
| **What it does** | Get a credit note |

### 032. `POST /credit-notes/{id}/post`

**Swagger summary:** Post a draft credit note

| | |
|-|-|
| **Why it exists** | Lock the invoice for accounting (no more draft edits). |
| **What it does** | DRAFT → POSTED. |

## Files

### What are Files?
Download endpoint for PDFs stored locally after generation (quotations, invoices, HAWB). Tenant in the URL must match the JWT tenant.

### 033. `GET /files/{tenantId}/{filename}`

**Swagger summary:** Download a locally stored file (PDFs generated by the system)

| | |
|-|-|
| **Why it exists** | Generated PDFs are stored on disk/S3; the UI needs a secure download URL scoped to the tenant. |
| **What it does** | Download a locally stored file (PDFs generated by the system) Streams the file if the JWT tenant matches the path tenant. |

## Invoices

### What is an Invoice?
A **customer tax invoice** (AR) for freight charges — often created from billable job charges. UAE VAT (default 5%) is applied. Lifecycle: DRAFT → POSTED → SENT → PAID (or CANCELLED). PDF + email deliver the invoice.

### 034. `GET /invoices`

**Swagger summary:** List customer invoices (Ch.18)

| | |
|-|-|
| **Why it exists** | Accounts receivable / billing for freight services. |
| **What it does** | List customer invoices (Ch.18) |

### 035. `POST /invoices`

**Swagger summary:** Create a draft customer invoice

| | |
|-|-|
| **Why it exists** | Accounts receivable / billing for freight services. |
| **What it does** | Create a draft customer invoice |

### 036. `DELETE /invoices/{id}`

**Swagger summary:** Soft-delete a draft invoice

| | |
|-|-|
| **Why it exists** | Accounts receivable / billing for freight services. |
| **What it does** | Soft-delete a draft invoice |

### 037. `GET /invoices/{id}`

**Swagger summary:** Get invoice with lines

| | |
|-|-|
| **Why it exists** | Accounts receivable / billing for freight services. |
| **What it does** | Get invoice with lines |

### 038. `PATCH /invoices/{id}`

**Swagger summary:** Update a draft invoice header

| | |
|-|-|
| **Why it exists** | Accounts receivable / billing for freight services. |
| **What it does** | Update a draft invoice header |

### 039. `POST /invoices/{id}/cancel`

**Swagger summary:** Cancel an invoice

| | |
|-|-|
| **Why it exists** | Void an invoice that should not be collected. |
| **What it does** | Cancel an invoice |

### 040. `POST /invoices/{id}/lines`

**Swagger summary:** Add a line to a draft invoice

| | |
|-|-|
| **Why it exists** | Invoice amounts are built from taxable/non-taxable lines. |
| **What it does** | Add a line to a draft invoice |

### 041. `DELETE /invoices/{id}/lines/{lineId}`

**Swagger summary:** Remove an invoice line

| | |
|-|-|
| **Why it exists** | Invoice amounts are built from taxable/non-taxable lines. |
| **What it does** | Remove an invoice line |

### 042. `PATCH /invoices/{id}/lines/{lineId}`

**Swagger summary:** Update an invoice line

| | |
|-|-|
| **Why it exists** | Invoice amounts are built from taxable/non-taxable lines. |
| **What it does** | Update an invoice line |

### 043. `GET /invoices/{id}/pdf`

**Swagger summary:** Get invoice PDF metadata

| | |
|-|-|
| **Why it exists** | Produce tax invoice PDF for customer/records. |
| **What it does** | Get invoice PDF metadata |

### 044. `POST /invoices/{id}/pdf`

**Swagger summary:** Generate invoice PDF

| | |
|-|-|
| **Why it exists** | Produce tax invoice PDF for customer/records. |
| **What it does** | Generate invoice PDF |

### 045. `POST /invoices/{id}/post`

**Swagger summary:** Post a draft invoice (DRAFT -> POSTED)

| | |
|-|-|
| **Why it exists** | Lock the invoice for accounting (no more draft edits). |
| **What it does** | DRAFT → POSTED. |

### 046. `POST /invoices/{id}/send`

**Swagger summary:** Email invoice PDF to customer

| | |
|-|-|
| **Why it exists** | Email the invoice PDF to accounts payable at the customer. |
| **What it does** | Email invoice PDF to customer |

### 047. `POST /invoices/from-job/{jobId}`

**Swagger summary:** Create draft invoice from uninvoiced billable job charges

| | |
|-|-|
| **Why it exists** | Bill the customer quickly from uninvoiced billable job charges. |
| **What it does** | Creates a draft customer invoice and links/marks those charges. |

### 048. `GET /invoices/reports/overdue`

**Swagger summary:** Overdue customer invoices past due_date with outstanding balance

| | |
|-|-|
| **Why it exists** | Collections team needs past-due AR. |
| **What it does** | Overdue customer invoices past due_date with outstanding balance |

## Jobs

### What is a Job?
A **shipment / booking file** (operations). Created from a won quotation or directly. Holds parties, ports, weights, milestones, charges (P&L), documents (HAWB/MAWB), notes, and containers (sea). Air Export jobs get a standard milestone checklist.

### 049. `GET /jobs`

**Swagger summary:** List jobs

| | |
|-|-|
| **Why it exists** | Shipment/booking operations file for freight execution. |
| **What it does** | List jobs |

### 050. `POST /jobs`

**Swagger summary:** Create a job (booking). AIR_EXPORT jobs auto-get their detail row + the full 15-milestone taxonomy. Set parent_job_id to create a HOUSE job under an existing master.

| | |
|-|-|
| **Why it exists** | Shipment/booking operations file for freight execution. |
| **What it does** | Create a job (booking). AIR_EXPORT jobs auto-get their detail row + the full 15-milestone taxonomy. Set parent_job_id to create a HOUSE job under an existing master. |

### 051. `DELETE /jobs/{id}`

**Swagger summary:** Soft-delete a completed or cancelled job

| | |
|-|-|
| **Why it exists** | Shipment/booking operations file for freight execution. |
| **What it does** | Soft-delete a completed or cancelled job |

### 052. `GET /jobs/{id}`

**Swagger summary:** Get a job with air details, charges, milestones, and its house jobs (if a master)

| | |
|-|-|
| **Why it exists** | Shipment/booking operations file for freight execution. |
| **What it does** | Get a job with air details, charges, milestones, and its house jobs (if a master) |

### 053. `PATCH /jobs/{id}`

**Swagger summary:** Update a job (not allowed once COMPLETED or CANCELLED)

| | |
|-|-|
| **Why it exists** | Shipment/booking operations file for freight execution. |
| **What it does** | Update a job (not allowed once COMPLETED or CANCELLED) |

### 054. `PATCH /jobs/{id}/air-details`

**Swagger summary:** Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)

| | |
|-|-|
| **Why it exists** | Store airline, flight, HAWB/MAWB, freight type. |
| **What it does** | Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type) |

### 055. `POST /jobs/{id}/cancel`

**Swagger summary:** Cancel a job (status -> CANCELLED)

| | |
|-|-|
| **Why it exists** | Stop a booking that will not move. |
| **What it does** | Status → CANCELLED. |

### 056. `POST /jobs/{id}/charges`

**Swagger summary:** Add a charge line — Job P&L recalculates automatically

| | |
|-|-|
| **Why it exists** | Job P&L and later invoicing come from charge lines. |
| **What it does** | Add a charge line — Job P&L recalculates automatically |

### 057. `DELETE /jobs/{id}/charges/{chargeId}`

**Swagger summary:** Remove a charge line

| | |
|-|-|
| **Why it exists** | Job P&L and later invoicing come from charge lines. |
| **What it does** | Remove a charge line |

### 058. `PATCH /jobs/{id}/charges/{chargeId}`

**Swagger summary:** Update a charge line

| | |
|-|-|
| **Why it exists** | Job P&L and later invoicing come from charge lines. |
| **What it does** | Update a charge line |

### 059. `POST /jobs/{id}/close`

**Swagger summary:** Close a job (status -> COMPLETED)

| | |
|-|-|
| **Why it exists** | Mark shipment operationally complete. |
| **What it does** | Status → COMPLETED. |

### 060. `GET /jobs/{id}/containers`

**Swagger summary:** List containers on a Sea FCL job

| | |
|-|-|
| **Why it exists** | Sea FCL needs container numbers, seals, weights. |
| **What it does** | List containers on a Sea FCL job |

### 061. `POST /jobs/{id}/containers`

**Swagger summary:** Add a container to a Sea FCL job

| | |
|-|-|
| **Why it exists** | Sea FCL needs container numbers, seals, weights. |
| **What it does** | Add a container to a Sea FCL job |

### 062. `DELETE /jobs/{id}/containers/{containerId}`

**Swagger summary:** Remove a container from a Sea FCL job

| | |
|-|-|
| **Why it exists** | Sea FCL needs container numbers, seals, weights. |
| **What it does** | Remove a container from a Sea FCL job |

### 063. `PATCH /jobs/{id}/containers/{containerId}`

**Swagger summary:** Update a container on a Sea FCL job

| | |
|-|-|
| **Why it exists** | Sea FCL needs container numbers, seals, weights. |
| **What it does** | Update a container on a Sea FCL job |

### 064. `GET /jobs/{id}/documents`

**Swagger summary:** List documents attached to a job

| | |
|-|-|
| **Why it exists** | Register or finalize shipment documents (draft → original). |
| **What it does** | List documents attached to a job |

### 065. `POST /jobs/{id}/documents`

**Swagger summary:** Register a document on a job (metadata + file URL)

| | |
|-|-|
| **Why it exists** | Register or finalize shipment documents (draft → original). |
| **What it does** | Register a document on a job (metadata + file URL) |

### 066. `DELETE /jobs/{id}/documents/{documentId}`

**Swagger summary:** Remove a draft document

| | |
|-|-|
| **Why it exists** | Register or finalize shipment documents (draft → original). |
| **What it does** | Remove a draft document |

### 067. `PATCH /jobs/{id}/documents/{documentId}`

**Swagger summary:** Update a draft document metadata

| | |
|-|-|
| **Why it exists** | Register or finalize shipment documents (draft → original). |
| **What it does** | Update a draft document metadata |

### 068. `POST /jobs/{id}/documents/{documentId}/finalize`

**Swagger summary:** Finalize a document (DRAFT -> ORIGINAL, locked)

| | |
|-|-|
| **Why it exists** | Register or finalize shipment documents (draft → original). |
| **What it does** | Finalize a document (DRAFT -> ORIGINAL, locked) |

### 069. `POST /jobs/{id}/documents/cargo-manifest`

**Swagger summary:** Queue cargo manifest PDF generation

| | |
|-|-|
| **Why it exists** | Airlines/customs/customers need transport documents as PDF. |
| **What it does** | Queue cargo manifest PDF generation Queues Puppeteer/Bull PDF generation. |

### 070. `GET /jobs/{id}/documents/generation-status`

**Swagger summary:** List async document generation tasks for a job

| | |
|-|-|
| **Why it exists** | UI polls until async PDF is ready. |
| **What it does** | List async document generation tasks for a job |

### 071. `POST /jobs/{id}/documents/hawb`

**Swagger summary:** Queue HAWB PDF generation (Puppeteer + BullMQ)

| | |
|-|-|
| **Why it exists** | Airlines/customs/customers need transport documents as PDF. |
| **What it does** | Queue HAWB PDF generation (Puppeteer + BullMQ) Queues Puppeteer/Bull PDF generation. |

### 072. `POST /jobs/{id}/documents/mawb`

**Swagger summary:** Queue MAWB PDF generation (Puppeteer + BullMQ)

| | |
|-|-|
| **Why it exists** | Airlines/customs/customers need transport documents as PDF. |
| **What it does** | Queue MAWB PDF generation (Puppeteer + BullMQ) Queues Puppeteer/Bull PDF generation. |

### 073. `POST /jobs/{id}/documents/pre-alert`

**Swagger summary:** Queue pre-alert document PDF generation

| | |
|-|-|
| **Why it exists** | Airlines/customs/customers need transport documents as PDF. |
| **What it does** | Queue pre-alert document PDF generation Queues Puppeteer/Bull PDF generation. |

### 074. `GET /jobs/{id}/house-jobs`

**Swagger summary:** List the house jobs consolidated under this master job

| | |
|-|-|
| **Why it exists** | View houses under a master consol. |
| **What it does** | List the house jobs consolidated under this master job |

### 075. `GET /jobs/{id}/milestones`

**Swagger summary:** List all milestones for a job

| | |
|-|-|
| **Why it exists** | Track operational progress (booking → docs → departure → delivery). |
| **What it does** | List all milestones for a job |

### 076. `POST /jobs/{id}/milestones`

**Swagger summary:** Add a custom milestone outside the standard taxonomy

| | |
|-|-|
| **Why it exists** | Track operational progress (booking → docs → departure → delivery). |
| **What it does** | Add a custom milestone outside the standard taxonomy |

### 077. `PATCH /jobs/{id}/milestones/{milestoneId}`

**Swagger summary:** Update a milestone — set actual_date to mark it complete

| | |
|-|-|
| **Why it exists** | Track operational progress (booking → docs → departure → delivery). |
| **What it does** | Update a milestone — set actual_date to mark it complete |

### 078. `GET /jobs/{id}/notes`

**Swagger summary:** List notes on a job

| | |
|-|-|
| **Why it exists** | Internal collaboration on the shipment file. |
| **What it does** | List notes on a job |

### 079. `POST /jobs/{id}/notes`

**Swagger summary:** Add a note to a job

| | |
|-|-|
| **Why it exists** | Internal collaboration on the shipment file. |
| **What it does** | Add a note to a job |

### 080. `DELETE /jobs/{id}/notes/{noteId}`

**Swagger summary:** Remove a job note

| | |
|-|-|
| **Why it exists** | Internal collaboration on the shipment file. |
| **What it does** | Remove a job note |

### 081. `PATCH /jobs/{id}/notes/{noteId}`

**Swagger summary:** Update a job note

| | |
|-|-|
| **Why it exists** | Internal collaboration on the shipment file. |
| **What it does** | Update a job note |

### 082. `GET /jobs/{id}/pnl`

**Swagger summary:** Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)

| | |
|-|-|
| **Why it exists** | Ops/finance see job profitability. |
| **What it does** | Returns revenue vs cost lines and GP. |

### 083. `POST /jobs/{id}/pre-alert/send`

**Swagger summary:** Send pre-alert and mark PRE_ALERT_SENT milestone complete

| | |
|-|-|
| **Why it exists** | Notify consignee/agent that cargo is departing (standard air export step). |
| **What it does** | Sends pre-alert email and completes the PRE_ALERT_SENT milestone. |

### 084. `POST /jobs/{id}/prorate-cost/{chargeCodeId}`

**Swagger summary:** Distribute a master job's cost line to its house jobs, proportionally by chargeable weight

| | |
|-|-|
| **Why it exists** | Master consol costs must be shared fairly across house jobs. |
| **What it does** | Splits a master cost line to houses by chargeable weight. |

### 085. `PATCH /jobs/{id}/sea-fcl-details`

**Swagger summary:** Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs)

| | |
|-|-|
| **Why it exists** | Store shipping line, BL numbers, cutoffs for FCL. |
| **What it does** | Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs) |

## Masters — Airlines

### What is this master?
**Airlines** is reference data used across ops and finance. Carriers for air jobs and AWB stock (IATA code, AWB prefix).

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 086. `GET /masters/airlines`

**Swagger summary:** list airlines

| | |
|-|-|
| **Why it exists** | Reference data (airlines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List airlines for dropdowns and admin screens. (list airlines) |

### 087. `POST /masters/airlines`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (airlines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new airlines reference record. (Create a record) |

### 088. `DELETE /masters/airlines/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (airlines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete airlines (keeps history; hides from active lists). (Soft-delete a record) |

### 089. `GET /masters/airlines/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (airlines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one airlines record by id. (Get a record by id) |

### 090. `PATCH /masters/airlines/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (airlines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update airlines fields. (Update a record) |

## Masters — Airports

### What is this master?
**Airports** is reference data used across ops and finance. Origin/destination airports for air bookings.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 091. `GET /masters/airports`

**Swagger summary:** List airports

| | |
|-|-|
| **Why it exists** | Reference data (airports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List airports for dropdowns and admin screens. (List airports) |

### 092. `POST /masters/airports`

**Swagger summary:** Create an airport

| | |
|-|-|
| **Why it exists** | Reference data (airports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new airports reference record. (Create an airport) |

### 093. `DELETE /masters/airports/{id}`

**Swagger summary:** Soft-delete an airport

| | |
|-|-|
| **Why it exists** | Reference data (airports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete airports (keeps history; hides from active lists). (Soft-delete an airport) |

### 094. `GET /masters/airports/{id}`

**Swagger summary:** Get an airport by id

| | |
|-|-|
| **Why it exists** | Reference data (airports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one airports record by id. (Get an airport by id) |

### 095. `PATCH /masters/airports/{id}`

**Swagger summary:** Update an airport

| | |
|-|-|
| **Why it exists** | Reference data (airports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update airports fields. (Update an airport) |

## Masters — Banks

### What is this master?
**Banks** is reference data used across ops and finance. Bank directory for organization bank accounts.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 096. `GET /masters/banks`

**Swagger summary:** list banks

| | |
|-|-|
| **Why it exists** | Reference data (banks) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List banks for dropdowns and admin screens. (list banks) |

### 097. `POST /masters/banks`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (banks) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new banks reference record. (Create a record) |

### 098. `DELETE /masters/banks/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (banks) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete banks (keeps history; hides from active lists). (Soft-delete a record) |

### 099. `GET /masters/banks/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (banks) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one banks record by id. (Get a record by id) |

### 100. `PATCH /masters/banks/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (banks) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update banks fields. (Update a record) |

## Masters — Branches

### What is this master?
**Branches** is reference data used across ops and finance. Office locations; used on jobs, stock, numbering.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 101. `GET /masters/branches`

**Swagger summary:** list branches

| | |
|-|-|
| **Why it exists** | Reference data (branches) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List branches for dropdowns and admin screens. (list branches) |

### 102. `POST /masters/branches`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (branches) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new branches reference record. (Create a record) |

### 103. `DELETE /masters/branches/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (branches) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete branches (keeps history; hides from active lists). (Soft-delete a record) |

### 104. `GET /masters/branches/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (branches) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one branches record by id. (Get a record by id) |

### 105. `PATCH /masters/branches/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (branches) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update branches fields. (Update a record) |

## Masters — ChargeCodes

### What is this master?
**Charge codes** is reference data used across ops and finance. Freight/local/customs charge types on quotes, jobs, invoices (e.g. AFR = Air Freight).

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 106. `GET /masters/charge-codes`

**Swagger summary:** list chargecodes

| | |
|-|-|
| **Why it exists** | Reference data (charge-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List charge-codes for dropdowns and admin screens. (list chargecodes) |

### 107. `POST /masters/charge-codes`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (charge-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new charge-codes reference record. (Create a record) |

### 108. `DELETE /masters/charge-codes/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (charge-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete charge-codes (keeps history; hides from active lists). (Soft-delete a record) |

### 109. `GET /masters/charge-codes/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (charge-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one charge-codes record by id. (Get a record by id) |

### 110. `PATCH /masters/charge-codes/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (charge-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update charge-codes fields. (Update a record) |

## Masters — ContainerTypes

### What is this master?
**Container types** is reference data used across ops and finance. 20GP/40HC etc. for sea FCL jobs.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 111. `GET /masters/container-types`

**Swagger summary:** List container types

| | |
|-|-|
| **Why it exists** | Reference data (container-types) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List container-types for dropdowns and admin screens. (List container types) |

### 112. `POST /masters/container-types`

**Swagger summary:** Create a container type

| | |
|-|-|
| **Why it exists** | Reference data (container-types) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new container-types reference record. (Create a container type) |

### 113. `DELETE /masters/container-types/{id}`

**Swagger summary:** Soft-delete a container type

| | |
|-|-|
| **Why it exists** | Reference data (container-types) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete container-types (keeps history; hides from active lists). (Soft-delete a container type) |

### 114. `GET /masters/container-types/{id}`

**Swagger summary:** Get a container type by id

| | |
|-|-|
| **Why it exists** | Reference data (container-types) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one container-types record by id. (Get a container type by id) |

### 115. `PATCH /masters/container-types/{id}`

**Swagger summary:** Update a container type

| | |
|-|-|
| **Why it exists** | Reference data (container-types) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update container-types fields. (Update a container type) |

## Masters — Countries

### What is this master?
**Countries** is reference data used across ops and finance. ISO country list for parties, ports, tax.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 116. `GET /masters/countries`

**Swagger summary:** List countries

| | |
|-|-|
| **Why it exists** | Reference data (countries) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List countries for dropdowns and admin screens. (List countries) |

### 117. `POST /masters/countries`

**Swagger summary:** Create a country

| | |
|-|-|
| **Why it exists** | Reference data (countries) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new countries reference record. (Create a country) |

### 118. `DELETE /masters/countries/{id}`

**Swagger summary:** Soft-delete a country

| | |
|-|-|
| **Why it exists** | Reference data (countries) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete countries (keeps history; hides from active lists). (Soft-delete a country) |

### 119. `GET /masters/countries/{id}`

**Swagger summary:** Get a country by id

| | |
|-|-|
| **Why it exists** | Reference data (countries) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one countries record by id. (Get a country by id) |

### 120. `PATCH /masters/countries/{id}`

**Swagger summary:** Update a country

| | |
|-|-|
| **Why it exists** | Reference data (countries) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update countries fields. (Update a country) |

## Masters — Currencies

### What is this master?
**Currencies** is reference data used across ops and finance. AED/USD etc. for pricing and invoices.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 121. `GET /masters/currencies`

**Swagger summary:** List currencies

| | |
|-|-|
| **Why it exists** | Reference data (currencies) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List currencies for dropdowns and admin screens. (List currencies) |

### 122. `POST /masters/currencies`

**Swagger summary:** Create a currency

| | |
|-|-|
| **Why it exists** | Reference data (currencies) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new currencies reference record. (Create a currency) |

### 123. `DELETE /masters/currencies/{id}`

**Swagger summary:** Soft-delete a currency

| | |
|-|-|
| **Why it exists** | Reference data (currencies) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete currencies (keeps history; hides from active lists). (Soft-delete a currency) |

### 124. `GET /masters/currencies/{id}`

**Swagger summary:** Get a currency by id

| | |
|-|-|
| **Why it exists** | Reference data (currencies) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one currencies record by id. (Get a currency by id) |

### 125. `PATCH /masters/currencies/{id}`

**Swagger summary:** Update a currency

| | |
|-|-|
| **Why it exists** | Reference data (currencies) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update currencies fields. (Update a currency) |

## Masters — Departments

### What is this master?
**Departments** is reference data used across ops and finance. Org structure (Sales, Ops, Finance).

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 126. `GET /masters/departments`

**Swagger summary:** list departments

| | |
|-|-|
| **Why it exists** | Reference data (departments) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List departments for dropdowns and admin screens. (list departments) |

### 127. `POST /masters/departments`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (departments) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new departments reference record. (Create a record) |

### 128. `DELETE /masters/departments/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (departments) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete departments (keeps history; hides from active lists). (Soft-delete a record) |

### 129. `GET /masters/departments/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (departments) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one departments record by id. (Get a record by id) |

### 130. `PATCH /masters/departments/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (departments) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update departments fields. (Update a record) |

## Masters — Designations

### What is this master?
**Designations** is reference data used across ops and finance. Job titles for users/HR.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 131. `GET /masters/designations`

**Swagger summary:** list designations

| | |
|-|-|
| **Why it exists** | Reference data (designations) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List designations for dropdowns and admin screens. (list designations) |

### 132. `POST /masters/designations`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (designations) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new designations reference record. (Create a record) |

### 133. `DELETE /masters/designations/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (designations) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete designations (keeps history; hides from active lists). (Soft-delete a record) |

### 134. `GET /masters/designations/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (designations) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one designations record by id. (Get a record by id) |

### 135. `PATCH /masters/designations/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (designations) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update designations fields. (Update a record) |

## Masters — Exchange Rates

### What is this master?
**Exchange rates** is reference data used across ops and finance. FX rates for multi-currency P&L.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 136. `GET /masters/exchange-rates`

**Swagger summary:** List exchange rates, optionally filtered by currency

| | |
|-|-|
| **Why it exists** | Reference data (exchange-rates) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List exchange-rates for dropdowns and admin screens. (List exchange rates, optionally filtered by currency) |

### 137. `POST /masters/exchange-rates`

**Swagger summary:** Record (or correct) an exchange rate for a date — upserts by currency + date

| | |
|-|-|
| **Why it exists** | Reference data (exchange-rates) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new exchange-rates reference record. (Record (or correct) an exchange rate for a date — upserts by currency + date) |

### 138. `GET /masters/exchange-rates/latest/{currencyId}`

**Swagger summary:** Most recent rate on file for a currency

| | |
|-|-|
| **Why it exists** | Reference data (exchange-rates) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one exchange-rates record by id. (Most recent rate on file for a currency) |

## Masters — Holidays

### What is this master?
**Holidays** is reference data used across ops and finance. Calendar for SLA / working-day logic.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 139. `GET /masters/holidays`

**Swagger summary:** list holidays

| | |
|-|-|
| **Why it exists** | Reference data (holidays) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List holidays for dropdowns and admin screens. (list holidays) |

### 140. `POST /masters/holidays`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (holidays) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new holidays reference record. (Create a record) |

### 141. `DELETE /masters/holidays/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (holidays) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete holidays (keeps history; hides from active lists). (Soft-delete a record) |

### 142. `GET /masters/holidays/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (holidays) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one holidays record by id. (Get a record by id) |

### 143. `PATCH /masters/holidays/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (holidays) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update holidays fields. (Update a record) |

## Masters — HsCodes

### What is this master?
**HS codes** is reference data used across ops and finance. Harmonized System commodity codes for customs.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 144. `GET /masters/hs-codes`

**Swagger summary:** List HS codes

| | |
|-|-|
| **Why it exists** | Reference data (hs-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List hs-codes for dropdowns and admin screens. (List HS codes) |

### 145. `POST /masters/hs-codes`

**Swagger summary:** Create an HS code

| | |
|-|-|
| **Why it exists** | Reference data (hs-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new hs-codes reference record. (Create an HS code) |

### 146. `DELETE /masters/hs-codes/{id}`

**Swagger summary:** Soft-delete an HS code

| | |
|-|-|
| **Why it exists** | Reference data (hs-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete hs-codes (keeps history; hides from active lists). (Soft-delete an HS code) |

### 147. `GET /masters/hs-codes/{id}`

**Swagger summary:** Get an HS code by id

| | |
|-|-|
| **Why it exists** | Reference data (hs-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one hs-codes record by id. (Get an HS code by id) |

### 148. `PATCH /masters/hs-codes/{id}`

**Swagger summary:** Update an HS code

| | |
|-|-|
| **Why it exists** | Reference data (hs-codes) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update hs-codes fields. (Update an HS code) |

## Masters — Ports

### What is this master?
**Ports** is reference data used across ops and finance. Sea/air/land ports (UN/LOCODE) for origin/destination.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 149. `GET /masters/ports`

**Swagger summary:** List ports

| | |
|-|-|
| **Why it exists** | Reference data (ports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List ports for dropdowns and admin screens. (List ports) |

### 150. `POST /masters/ports`

**Swagger summary:** Create a port

| | |
|-|-|
| **Why it exists** | Reference data (ports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new ports reference record. (Create a port) |

### 151. `DELETE /masters/ports/{id}`

**Swagger summary:** Soft-delete a port

| | |
|-|-|
| **Why it exists** | Reference data (ports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete ports (keeps history; hides from active lists). (Soft-delete a port) |

### 152. `GET /masters/ports/{id}`

**Swagger summary:** Get a port record by id

| | |
|-|-|
| **Why it exists** | Reference data (ports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one ports record by id. (Get a port record by id) |

### 153. `PATCH /masters/ports/{id}`

**Swagger summary:** Update a port

| | |
|-|-|
| **Why it exists** | Reference data (ports) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update ports fields. (Update a port) |

## Masters — ShippingLines

### What is this master?
**Shipping lines** is reference data used across ops and finance. Ocean carriers for sea jobs.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 154. `GET /masters/shipping-lines`

**Swagger summary:** list shippinglines

| | |
|-|-|
| **Why it exists** | Reference data (shipping-lines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List shipping-lines for dropdowns and admin screens. (list shippinglines) |

### 155. `POST /masters/shipping-lines`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (shipping-lines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new shipping-lines reference record. (Create a record) |

### 156. `DELETE /masters/shipping-lines/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (shipping-lines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete shipping-lines (keeps history; hides from active lists). (Soft-delete a record) |

### 157. `GET /masters/shipping-lines/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (shipping-lines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one shipping-lines record by id. (Get a record by id) |

### 158. `PATCH /masters/shipping-lines/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (shipping-lines) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update shipping-lines fields. (Update a record) |

## Masters — TaxRates

### What is this master?
**Tax rates** is reference data used across ops and finance. VAT/GST rates (e.g. UAE VAT 5%) for invoices.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 159. `GET /masters/tax-rates`

**Swagger summary:** list taxrates

| | |
|-|-|
| **Why it exists** | Reference data (tax-rates) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List tax-rates for dropdowns and admin screens. (list taxrates) |

### 160. `POST /masters/tax-rates`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (tax-rates) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new tax-rates reference record. (Create a record) |

### 161. `DELETE /masters/tax-rates/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (tax-rates) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete tax-rates (keeps history; hides from active lists). (Soft-delete a record) |

### 162. `GET /masters/tax-rates/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (tax-rates) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one tax-rates record by id. (Get a record by id) |

### 163. `PATCH /masters/tax-rates/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (tax-rates) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update tax-rates fields. (Update a record) |

## Masters — Truckers

### What is this master?
**Truckers** is reference data used across ops and finance. Road carriers for land legs.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 164. `GET /masters/truckers`

**Swagger summary:** list truckers

| | |
|-|-|
| **Why it exists** | Reference data (truckers) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List truckers for dropdowns and admin screens. (list truckers) |

### 165. `POST /masters/truckers`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (truckers) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new truckers reference record. (Create a record) |

### 166. `DELETE /masters/truckers/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (truckers) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete truckers (keeps history; hides from active lists). (Soft-delete a record) |

### 167. `GET /masters/truckers/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (truckers) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one truckers record by id. (Get a record by id) |

### 168. `PATCH /masters/truckers/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (truckers) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update truckers fields. (Update a record) |

## Masters — UnitsOfMeasure

### What is this master?
**Units of measure** is reference data used across ops and finance. KG, CBM, PKG for cargo quantities.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 169. `GET /masters/units-of-measure`

**Swagger summary:** list unitsofmeasure

| | |
|-|-|
| **Why it exists** | Reference data (units-of-measure) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List units-of-measure for dropdowns and admin screens. (list unitsofmeasure) |

### 170. `POST /masters/units-of-measure`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (units-of-measure) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new units-of-measure reference record. (Create a record) |

### 171. `DELETE /masters/units-of-measure/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (units-of-measure) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete units-of-measure (keeps history; hides from active lists). (Soft-delete a record) |

### 172. `GET /masters/units-of-measure/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (units-of-measure) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one units-of-measure record by id. (Get a record by id) |

### 173. `PATCH /masters/units-of-measure/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (units-of-measure) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update units-of-measure fields. (Update a record) |

## Masters — Vessels

### What is this master?
**Vessels** is reference data used across ops and finance. Ship names/IMO for sea bookings.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 174. `GET /masters/vessels`

**Swagger summary:** list vessels

| | |
|-|-|
| **Why it exists** | Reference data (vessels) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List vessels for dropdowns and admin screens. (list vessels) |

### 175. `POST /masters/vessels`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (vessels) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new vessels reference record. (Create a record) |

### 176. `DELETE /masters/vessels/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (vessels) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete vessels (keeps history; hides from active lists). (Soft-delete a record) |

### 177. `GET /masters/vessels/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (vessels) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one vessels record by id. (Get a record by id) |

### 178. `PATCH /masters/vessels/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (vessels) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update vessels fields. (Update a record) |

## Masters — Warehouses

### What is this master?
**Warehouses** is reference data used across ops and finance. Storage locations for WMS later.

Standard pattern: list → get by id → create → update → soft-delete. Requires `masters.view|create|update|delete` permissions.

### 179. `GET /masters/warehouses`

**Swagger summary:** list warehouses

| | |
|-|-|
| **Why it exists** | Reference data (warehouses) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | List warehouses for dropdowns and admin screens. (list warehouses) |

### 180. `POST /masters/warehouses`

**Swagger summary:** Create a record

| | |
|-|-|
| **Why it exists** | Reference data (warehouses) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Create a new warehouses reference record. (Create a record) |

### 181. `DELETE /masters/warehouses/{id}`

**Swagger summary:** Soft-delete a record

| | |
|-|-|
| **Why it exists** | Reference data (warehouses) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Soft-delete warehouses (keeps history; hides from active lists). (Soft-delete a record) |

### 182. `GET /masters/warehouses/{id}`

**Swagger summary:** Get a record by id

| | |
|-|-|
| **Why it exists** | Reference data (warehouses) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Fetch one warehouses record by id. (Get a record by id) |

### 183. `PATCH /masters/warehouses/{id}`

**Swagger summary:** Update a record

| | |
|-|-|
| **Why it exists** | Reference data (warehouses) is required so jobs/quotes/invoices use consistent codes and names. |
| **What it does** | Update warehouses fields. (Update a record) |

## Organization — Bank Accounts

### What are Bank Accounts?
Tenant bank details printed on invoices / used later in finance (AR collections, reconciliations).

### 184. `GET /organization/bank-accounts`

**Swagger summary:** List this tenant's own bank accounts

| | |
|-|-|
| **Why it exists** | Print bank details on invoices / use in banking later. |
| **What it does** | List this tenant's own bank accounts |

### 185. `POST /organization/bank-accounts`

**Swagger summary:** Add a bank account

| | |
|-|-|
| **Why it exists** | Print bank details on invoices / use in banking later. |
| **What it does** | Add a bank account |

### 186. `DELETE /organization/bank-accounts/{id}`

**Swagger summary:** Soft-delete a bank account

| | |
|-|-|
| **Why it exists** | Print bank details on invoices / use in banking later. |
| **What it does** | Soft-delete a bank account |

### 187. `GET /organization/bank-accounts/{id}`

**Swagger summary:** Get a bank account by id

| | |
|-|-|
| **Why it exists** | Print bank details on invoices / use in banking later. |
| **What it does** | Get a bank account by id |

### 188. `PATCH /organization/bank-accounts/{id}`

**Swagger summary:** Update a bank account

| | |
|-|-|
| **Why it exists** | Print bank details on invoices / use in banking later. |
| **What it does** | Update a bank account |

## Organization — Number Formats

### What are Number Formats?
Rules for auto-generating document numbers (quotation, job, invoice, AWB, voucher). Example: `KFW/AE/07/26/00136`. Without an active format, create APIs for those documents fail.

### 189. `GET /organization/number-formats`

**Swagger summary:** List all configured document number formats (Ch.2.2)

| | |
|-|-|
| **Why it exists** | Document numbers must be unique, branded, and reset by year/month per policy. |
| **What it does** | List all configured document number formats (Ch.2.2) |

### 190. `POST /organization/number-formats`

**Swagger summary:** Configure the number format for a document type

| | |
|-|-|
| **Why it exists** | Document numbers must be unique, branded, and reset by year/month per policy. |
| **What it does** | Configure the number format for a document type |

### 191. `GET /organization/number-formats/{documentType}`

**Swagger summary:** Get the number format for one document type

| | |
|-|-|
| **Why it exists** | Document numbers must be unique, branded, and reset by year/month per policy. |
| **What it does** | Get the number format for one document type |

### 192. `PATCH /organization/number-formats/{documentType}`

**Swagger summary:** Update the number format for a document type

| | |
|-|-|
| **Why it exists** | Document numbers must be unique, branded, and reset by year/month per policy. |
| **What it does** | Update the number format for a document type |

### 193. `GET /organization/number-formats/{documentType}/preview`

**Swagger summary:** Preview the next number for this format without consuming a sequence value

| | |
|-|-|
| **Why it exists** | Show users what the next number will look like before saving. |
| **What it does** | Preview the next number for this format without consuming a sequence value |

## Organization Profile

### What is Organization Profile?
The tenant’s own company profile (name, VAT, IATA cargo agent code, branding). Used on documents and invoices.

### 194. `GET /organization/profile`

**Swagger summary:** Get this tenant's own organization profile

| | |
|-|-|
| **Why it exists** | Tenant self-service organization settings. |
| **What it does** | Get this tenant's own organization profile |

### 195. `PATCH /organization/profile`

**Swagger summary:** Update this tenant's own organization profile (Ch.27.1)

| | |
|-|-|
| **Why it exists** | Tenant self-service organization settings. |
| **What it does** | Update this tenant's own organization profile (Ch.27.1) |

## Parties

### What are Parties?
**Parties** are business partners: customers, shippers, consignees, agents, airlines-as-parties, suppliers. Quotations need a customer; jobs need shipper/consignee; invoices bill a party. Contacts and addresses hang off each party.

### 196. `GET /parties`

**Swagger summary:** List parties (customers, agents, suppliers, carriers, etc.)

| | |
|-|-|
| **Why it exists** | Master data for customers, shippers, agents, and other partners. |
| **What it does** | List parties (customers, agents, suppliers, carriers, etc.) |

### 197. `POST /parties`

**Swagger summary:** Create a party

| | |
|-|-|
| **Why it exists** | Master data for customers, shippers, agents, and other partners. |
| **What it does** | Create a party |

### 198. `DELETE /parties/{id}`

**Swagger summary:** Soft-delete a party

| | |
|-|-|
| **Why it exists** | Master data for customers, shippers, agents, and other partners. |
| **What it does** | Soft-delete a party |

### 199. `GET /parties/{id}`

**Swagger summary:** Get a party with its contacts and addresses

| | |
|-|-|
| **Why it exists** | Master data for customers, shippers, agents, and other partners. |
| **What it does** | Get a party with its contacts and addresses |

### 200. `PATCH /parties/{id}`

**Swagger summary:** Update a party

| | |
|-|-|
| **Why it exists** | Master data for customers, shippers, agents, and other partners. |
| **What it does** | Update a party |

### 201. `POST /parties/{id}/addresses`

**Swagger summary:** Add an address to a party

| | |
|-|-|
| **Why it exists** | Pickup/delivery/billing addresses. |
| **What it does** | Add an address to a party |

### 202. `DELETE /parties/{id}/addresses/{addressId}`

**Swagger summary:** Remove a party's address

| | |
|-|-|
| **Why it exists** | Pickup/delivery/billing addresses. |
| **What it does** | Remove a party's address |

### 203. `PATCH /parties/{id}/addresses/{addressId}`

**Swagger summary:** Update a party's address

| | |
|-|-|
| **Why it exists** | Pickup/delivery/billing addresses. |
| **What it does** | Update a party's address |

### 204. `POST /parties/{id}/contacts`

**Swagger summary:** Add a contact to a party

| | |
|-|-|
| **Why it exists** | Store multiple people (ops, accounts) per party. |
| **What it does** | Add a contact to a party |

### 205. `DELETE /parties/{id}/contacts/{contactId}`

**Swagger summary:** Remove a party's contact

| | |
|-|-|
| **Why it exists** | Store multiple people (ops, accounts) per party. |
| **What it does** | Remove a party's contact |

### 206. `PATCH /parties/{id}/contacts/{contactId}`

**Swagger summary:** Update a party's contact

| | |
|-|-|
| **Why it exists** | Store multiple people (ops, accounts) per party. |
| **What it does** | Update a party's contact |

### 207. `PATCH /parties/{id}/credit-status`

**Swagger summary:** Change credit status (Active / On Hold / Blacklisted)

| | |
|-|-|
| **Why it exists** | Stop quoting/shipping to customers on credit hold or blacklist. |
| **What it does** | Updates credit_status (ACTIVE / ON_HOLD / BLACKLISTED). |

### 208. `POST /parties/import`

**Swagger summary:** Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import.

| | |
|-|-|
| **Why it exists** | Onboard many customers/agents at once. |
| **What it does** | CSV bulk import with per-row errors. |

## Payment Requests

### What is a Payment Request?
An internal/collections request to chase or record payment against an invoice/job. Flow: PENDING → APPROVED → PAID (or REJECTED).

### 209. `GET /payment-requests`

**Swagger summary:** List payment requests

| | |
|-|-|
| **Why it exists** | Track payment collection workflow against invoices/jobs. |
| **What it does** | List payment requests |

### 210. `POST /payment-requests`

**Swagger summary:** Create a payment request

| | |
|-|-|
| **Why it exists** | Track payment collection workflow against invoices/jobs. |
| **What it does** | Create a payment request |

### 211. `DELETE /payment-requests/{id}`

**Swagger summary:** Soft-delete a pending payment request

| | |
|-|-|
| **Why it exists** | Track payment collection workflow against invoices/jobs. |
| **What it does** | Soft-delete a pending payment request |

### 212. `GET /payment-requests/{id}`

**Swagger summary:** Get a payment request

| | |
|-|-|
| **Why it exists** | Track payment collection workflow against invoices/jobs. |
| **What it does** | Get a payment request |

### 213. `PATCH /payment-requests/{id}`

**Swagger summary:** Update a pending payment request

| | |
|-|-|
| **Why it exists** | Track payment collection workflow against invoices/jobs. |
| **What it does** | Update a pending payment request |

### 214. `POST /payment-requests/{id}/approve`

**Swagger summary:** Approve a payment request

| | |
|-|-|
| **Why it exists** | Finance authorizes collection/payment. |
| **What it does** | PENDING → APPROVED. |

### 215. `POST /payment-requests/{id}/mark-paid`

**Swagger summary:** Mark an approved payment request as paid

| | |
|-|-|
| **Why it exists** | Record that money was received/paid. |
| **What it does** | APPROVED → PAID; may update invoice balance. |

### 216. `POST /payment-requests/{id}/reject`

**Swagger summary:** Reject a payment request

| | |
|-|-|
| **Why it exists** | Finance declines the request with a reason. |
| **What it does** | PENDING → REJECTED. |

## Purchase Invoices

### What is a Purchase Invoice?
A **vendor bill** (AP) — what you owe airlines, agents, truckers. Separate from customer invoices.

### 217. `GET /purchase-invoices`

**Swagger summary:** List purchase invoices (vendor bills)

| | |
|-|-|
| **Why it exists** | Record what the company owes vendors (airline/agent bills). |
| **What it does** | List purchase invoices (vendor bills) |

### 218. `POST /purchase-invoices`

**Swagger summary:** Create a draft purchase invoice

| | |
|-|-|
| **Why it exists** | Record what the company owes vendors (airline/agent bills). |
| **What it does** | Create a draft purchase invoice |

### 219. `DELETE /purchase-invoices/{id}`

**Swagger summary:** Soft-delete a draft purchase invoice

| | |
|-|-|
| **Why it exists** | Record what the company owes vendors (airline/agent bills). |
| **What it does** | Soft-delete a draft purchase invoice |

### 220. `GET /purchase-invoices/{id}`

**Swagger summary:** Get a purchase invoice

| | |
|-|-|
| **Why it exists** | Record what the company owes vendors (airline/agent bills). |
| **What it does** | Get a purchase invoice |

### 221. `PATCH /purchase-invoices/{id}`

**Swagger summary:** Update a draft purchase invoice

| | |
|-|-|
| **Why it exists** | Record what the company owes vendors (airline/agent bills). |
| **What it does** | Update a draft purchase invoice |

### 222. `POST /purchase-invoices/{id}/post`

**Swagger summary:** Post a draft purchase invoice

| | |
|-|-|
| **Why it exists** | Lock the invoice for accounting (no more draft edits). |
| **What it does** | DRAFT → POSTED. |

## Quotations

### What is a Quotation?
A **sales quote** for freight (air/sea/land). Lifecycle: DRAFT → SUBMITTED → APPROVED → SENT → WON → CONVERTED (to Job), or LOST/EXPIRED. Charge lines calculate revenue, cost, and GP (gross profit). PDFs and email deliver the quote to the customer.

### 223. `GET /quotations`

**Swagger summary:** List quotations

| | |
|-|-|
| **Why it exists** | Sales quotation lifecycle for freight opportunities. |
| **What it does** | List quotations |

### 224. `POST /quotations`

**Swagger summary:** Create a quotation (DRAFT)

| | |
|-|-|
| **Why it exists** | Sales quotation lifecycle for freight opportunities. |
| **What it does** | Create a quotation (DRAFT) |

### 225. `DELETE /quotations/{id}`

**Swagger summary:** Soft-delete a quotation (DRAFT only)

| | |
|-|-|
| **Why it exists** | Sales quotation lifecycle for freight opportunities. |
| **What it does** | Soft-delete a quotation (DRAFT only) |

### 226. `GET /quotations/{id}`

**Swagger summary:** Get a quotation with its lines, status history, and approvals

| | |
|-|-|
| **Why it exists** | Sales quotation lifecycle for freight opportunities. |
| **What it does** | Get a quotation with its lines, status history, and approvals |

### 227. `PATCH /quotations/{id}`

**Swagger summary:** Update a quotation header (DRAFT or REJECTED only)

| | |
|-|-|
| **Why it exists** | Sales quotation lifecycle for freight opportunities. |
| **What it does** | Update a quotation header (DRAFT or REJECTED only) |

### 228. `POST /quotations/{id}/apply-tariff`

**Swagger summary:** Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane

| | |
|-|-|
| **Why it exists** | Speed up pricing from rate cards. |
| **What it does** | Adds a charge line from the best matching tariff. |

### 229. `POST /quotations/{id}/approve`

**Swagger summary:** SUBMITTED -> APPROVED

| | |
|-|-|
| **Why it exists** | Manager accepts pricing/GP. |
| **What it does** | SUBMITTED → APPROVED. |

### 230. `POST /quotations/{id}/archive`

**Swagger summary:** Archive a closed quotation (soft-delete)

| | |
|-|-|
| **Why it exists** | Hide closed quotes from active lists. |
| **What it does** | Soft-archives a closed quotation. |

### 231. `POST /quotations/{id}/convert-to-job`

**Swagger summary:** WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module.

| | |
|-|-|
| **Why it exists** | When sales wins the deal, operations need a job file with charges carried over. |
| **What it does** | Sets quotation CONVERTED and creates a linked Job. |

### 232. `POST /quotations/{id}/duplicate`

**Swagger summary:** Clone into a new revision (new DRAFT, version+1, linked to the same parent)

| | |
|-|-|
| **Why it exists** | Revise pricing without losing history. |
| **What it does** | Clones into a new DRAFT revision (version+1). |

### 233. `POST /quotations/{id}/expire`

**Swagger summary:** Manually expire a quotation past its valid_until date

| | |
|-|-|
| **Why it exists** | Quotes past valid_until should not stay open. |
| **What it does** | Manually expire a quotation past its valid_until date |

### 234. `POST /quotations/{id}/lines`

**Swagger summary:** Add a charge line — GP recalculates automatically

| | |
|-|-|
| **Why it exists** | Build sell and buy amounts; GP is recalculated live. |
| **What it does** | Add a charge line — GP recalculates automatically |

### 235. `DELETE /quotations/{id}/lines/{lineId}`

**Swagger summary:** Remove a charge line

| | |
|-|-|
| **Why it exists** | Build sell and buy amounts; GP is recalculated live. |
| **What it does** | Remove a charge line |

### 236. `PATCH /quotations/{id}/lines/{lineId}`

**Swagger summary:** Update a charge line

| | |
|-|-|
| **Why it exists** | Build sell and buy amounts; GP is recalculated live. |
| **What it does** | Update a charge line |

### 237. `POST /quotations/{id}/mark-lost`

**Swagger summary:** SENT -> LOST, with a reason code

| | |
|-|-|
| **Why it exists** | Track why sales lost the deal. |
| **What it does** | SENT → LOST with reason code. |

### 238. `POST /quotations/{id}/mark-won`

**Swagger summary:** SENT -> WON

| | |
|-|-|
| **Why it exists** | Customer accepted the quote. |
| **What it does** | SENT → WON. |

### 239. `GET /quotations/{id}/pdf`

**Swagger summary:** Get quotation PDF URLs and recent generation tasks

| | |
|-|-|
| **Why it exists** | Customers need a printable quote; internal staff need a GP version. |
| **What it does** | Get quotation PDF URLs and recent generation tasks Queues/stores PDF (customer or internal mode). |

### 240. `POST /quotations/{id}/pdf`

**Swagger summary:** Queue PDF generation for a quotation (customer or internal mode)

| | |
|-|-|
| **Why it exists** | Customers need a printable quote; internal staff need a GP version. |
| **What it does** | Queue PDF generation for a quotation (customer or internal mode) Queues/stores PDF (customer or internal mode). |

### 241. `GET /quotations/{id}/pdf/status`

**Swagger summary:** List PDF generation task status for a quotation

| | |
|-|-|
| **Why it exists** | Customers need a printable quote; internal staff need a GP version. |
| **What it does** | List PDF generation task status for a quotation Queues/stores PDF (customer or internal mode). |

### 242. `POST /quotations/{id}/reject`

**Swagger summary:** SUBMITTED -> REJECTED (editable again, can be resubmitted)

| | |
|-|-|
| **Why it exists** | Manager sends quote back for edits. |
| **What it does** | SUBMITTED → REJECTED. |

### 243. `GET /quotations/{id}/revisions`

**Swagger summary:** List all revisions in this quotation version chain

| | |
|-|-|
| **Why it exists** | Audit quote version history. |
| **What it does** | List all revisions in this quotation version chain |

### 244. `POST /quotations/{id}/send`

**Swagger summary:** APPROVED -> SENT

| | |
|-|-|
| **Why it exists** | Mark quote as issued to customer (status). |
| **What it does** | APPROVED → SENT. |

### 245. `POST /quotations/{id}/send-email`

**Swagger summary:** Email quotation PDF to customer (generates PDF if not yet available)

| | |
|-|-|
| **Why it exists** | Deliver the quotation PDF to the customer by email. |
| **What it does** | Email quotation PDF to customer (generates PDF if not yet available) |

### 246. `POST /quotations/{id}/submit`

**Swagger summary:** DRAFT/REJECTED -> SUBMITTED, opens the approval cycle

| | |
|-|-|
| **Why it exists** | Start approval workflow. |
| **What it does** | DRAFT/REJECTED → SUBMITTED. |

### 247. `POST /quotations/expire-due`

**Swagger summary:** Batch-expire all quotations past valid_until (intended for daily cron)

| | |
|-|-|
| **Why it exists** | Quotes past valid_until should not stay open. |
| **What it does** | Batch-expire all quotations past valid_until (intended for daily cron) |

### 248. `POST /quotations/online-quote`

**Swagger summary:** Public online quote widget — customer submits cargo details, system auto-calculates from tariff (Ch.7.5)

| | |
|-|-|
| **Why it exists** | Website widget lets prospects request a price without logging in. |
| **What it does** | Public endpoint: accepts cargo details, prices from tariffs, creates a draft quote. |

### 249. `GET /quotations/reports/analytics`

**Swagger summary:** Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)

| | |
|-|-|
| **Why it exists** | Sales management KPIs (volume, conversion, lost reasons). |
| **What it does** | Quotation analytics summary — volume, conversion, GP totals (Ch.7.7) |

### 250. `GET /quotations/reports/analytics/conversion`

**Swagger summary:** Win/loss and quote-to-job conversion rates

| | |
|-|-|
| **Why it exists** | Sales management KPIs (volume, conversion, lost reasons). |
| **What it does** | Win/loss and quote-to-job conversion rates |

### 251. `GET /quotations/reports/analytics/lost-reasons`

**Swagger summary:** Lost quotation breakdown by reason code

| | |
|-|-|
| **Why it exists** | Sales management KPIs (volume, conversion, lost reasons). |
| **What it does** | Lost quotation breakdown by reason code |

### 252. `GET /quotations/reports/analytics/response-time`

**Swagger summary:** Average hours from creation to submit/send

| | |
|-|-|
| **Why it exists** | Sales management KPIs (volume, conversion, lost reasons). |
| **What it does** | Average hours from creation to submit/send |

### 253. `GET /quotations/reports/chargewise`

**Swagger summary:** "All Quotations Chargewise" report — same filters as the list, with each charge line included

| | |
|-|-|
| **Why it exists** | Sales management KPIs (volume, conversion, lost reasons). |
| **What it does** | "All Quotations Chargewise" report — same filters as the list, with each charge line included |

## Quotations — Online Tariff Master

### What are Tariffs?
**Rate cards** (sell/buy rates by lane, mode, weight). Used to auto-price quotations and the public online-quote widget.

### 254. `GET /quotations/tariffs`

**Swagger summary:** List tariff rate cards

| | |
|-|-|
| **Why it exists** | Maintain sell/buy rate cards for auto-quoting. |
| **What it does** | List tariff rate cards |

### 255. `POST /quotations/tariffs`

**Swagger summary:** Create a tariff rate card (sale rate + cost rate per lane/service/container type)

| | |
|-|-|
| **Why it exists** | Maintain sell/buy rate cards for auto-quoting. |
| **What it does** | Create a tariff rate card (sale rate + cost rate per lane/service/container type) |

### 256. `DELETE /quotations/tariffs/{id}`

**Swagger summary:** Soft-delete a tariff

| | |
|-|-|
| **Why it exists** | Maintain sell/buy rate cards for auto-quoting. |
| **What it does** | Soft-delete a tariff |

### 257. `GET /quotations/tariffs/{id}`

**Swagger summary:** Get a tariff by id

| | |
|-|-|
| **Why it exists** | Maintain sell/buy rate cards for auto-quoting. |
| **What it does** | Get a tariff by id |

### 258. `PATCH /quotations/tariffs/{id}`

**Swagger summary:** Update a tariff

| | |
|-|-|
| **Why it exists** | Maintain sell/buy rate cards for auto-quoting. |
| **What it does** | Update a tariff |

## Quotations — Zip Distance Master

### What are Zip Distances?
Distance table between postal codes — used for land/trucking rate calculations.

### 259. `GET /quotations/zip-distances`

**Swagger summary:** List zip-to-zip distances

| | |
|-|-|
| **Why it exists** | Land pricing needs distance between zips. |
| **What it does** | List zip-to-zip distances |

### 260. `POST /quotations/zip-distances`

**Swagger summary:** Record a distance between two zip/location codes

| | |
|-|-|
| **Why it exists** | Land pricing needs distance between zips. |
| **What it does** | Record a distance between two zip/location codes |

### 261. `DELETE /quotations/zip-distances/{id}`

**Swagger summary:** Soft-delete a zip distance record

| | |
|-|-|
| **Why it exists** | Land pricing needs distance between zips. |
| **What it does** | Soft-delete a zip distance record |

### 262. `GET /quotations/zip-distances/{id}`

**Swagger summary:** Get a zip distance record by id

| | |
|-|-|
| **Why it exists** | Land pricing needs distance between zips. |
| **What it does** | Get a zip distance record by id |

### 263. `PATCH /quotations/zip-distances/{id}`

**Swagger summary:** Update a zip distance record

| | |
|-|-|
| **Why it exists** | Land pricing needs distance between zips. |
| **What it does** | Update a zip distance record |

## Search

### What is Global Search?
One search box across jobs, quotations, and parties (job numbers, HAWB/MAWB, customer names, etc.).

### 264. `GET /search`

**Swagger summary:** Global search across jobs, quotations, and parties

| | |
|-|-|
| **Why it exists** | Users need one place to find a shipment, quote, or customer without knowing which module to open. |
| **What it does** | Global search across jobs, quotations, and parties Searches jobs, quotations, and parties by free text (`q`). |

## Tenants (Super Admin)

### What is a Tenant?
A **tenant** is one customer company on the SaaS platform (e.g. “Kingfisher Wings LLC”). All jobs, invoices, and users belong to a tenant. Super Admin creates and suspends tenants; data is isolated by PostgreSQL RLS.

### 265. `GET /tenants`

**Swagger summary:** Get all tenants

| | |
|-|-|
| **Why it exists** | Super Admin onboards and manages SaaS customers (tenants). |
| **What it does** | Read tenant record. Get all tenants |

### 266. `POST /tenants`

**Swagger summary:** Create a new tenant (also provisions its TENANT_ADMIN owner user)

| | |
|-|-|
| **Why it exists** | Super Admin onboards and manages SaaS customers (tenants). |
| **What it does** | Create tenant record. Create a new tenant (also provisions its TENANT_ADMIN owner user) |

### 267. `DELETE /tenants/{id}`

**Swagger summary:** Soft delete tenant

| | |
|-|-|
| **Why it exists** | Super Admin onboards and manages SaaS customers (tenants). |
| **What it does** | Soft-delete tenant record. Soft delete tenant |

### 268. `GET /tenants/{id}`

**Swagger summary:** Get tenant by ID

| | |
|-|-|
| **Why it exists** | Super Admin onboards and manages SaaS customers (tenants). |
| **What it does** | Read tenant record. Get tenant by ID |

### 269. `PATCH /tenants/{id}`

**Swagger summary:** Update tenant

| | |
|-|-|
| **Why it exists** | Super Admin onboards and manages SaaS customers (tenants). |
| **What it does** | Update tenant record. Update tenant |

### 270. `PATCH /tenants/{id}/activate`

**Swagger summary:** Activate tenant

| | |
|-|-|
| **Why it exists** | Suspend or resume a customer’s SaaS access. |
| **What it does** | Activate tenant |

### 271. `PATCH /tenants/{id}/deactivate`

**Swagger summary:** Deactivate tenant

| | |
|-|-|
| **Why it exists** | Suspend or resume a customer’s SaaS access. |
| **What it does** | Deactivate tenant |

### 272. `PATCH /tenants/{id}/restore`

**Swagger summary:** Restore tenant

| | |
|-|-|
| **Why it exists** | Undo a soft-delete. |
| **What it does** | Restore tenant |

### 273. `POST /tenants/{id}/sync-permissions`

**Swagger summary:** Reconcile one tenant against the current permission/role catalog

| | |
|-|-|
| **Why it exists** | After deploying new modules (e.g. invoices), existing tenants need new permission rows seeded. |
| **What it does** | Reconcile one tenant against the current permission/role catalog Reconciles Permission catalog into the tenant DB. |

### 274. `GET /tenants/statistics`

**Swagger summary:** Tenant statistics

| | |
|-|-|
| **Why it exists** | Super Admin dashboard counts. |
| **What it does** | Tenant statistics |

### 275. `POST /tenants/sync-permissions`

**Swagger summary:** Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions.

| | |
|-|-|
| **Why it exists** | After deploying new modules (e.g. invoices), existing tenants need new permission rows seeded. |
| **What it does** | Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions. Reconciles Permission catalog into the tenant DB. |

## Untagged

### Health
Liveness / database connectivity check for monitoring.

### 276. `GET /health`

| | |
|-|-|
| **Why it exists** | Monitoring and load balancers need a cheap check that the API and database are alive. |
| **What it does** | Runs a DB ping and returns health status. (On this deployment it may still require JWT if not marked public.) |

## Users

### What are Users?
**Users** are staff accounts inside a tenant (ops, sales, finance). Each user has a role (e.g. OPERATIONS_MANAGER) and permission codes like `jobs.view`. Admins create users, reset passwords, and force logout.

### 277. `GET /users`

**Swagger summary:** List users for the current tenant (paginated, filterable).

| | |
|-|-|
| **Why it exists** | Manage staff access inside the tenant. |
| **What it does** | List users for the current tenant (paginated, filterable). |

### 278. `POST /users`

**Swagger summary:** Create a user. Returns a system-generated temporary password.

| | |
|-|-|
| **Why it exists** | Manage staff access inside the tenant. |
| **What it does** | Create a user. Returns a system-generated temporary password. |

### 279. `DELETE /users/{id}`

**Swagger summary:** Soft-delete a user.

| | |
|-|-|
| **Why it exists** | Manage staff access inside the tenant. |
| **What it does** | Soft-delete a user. |

### 280. `GET /users/{id}`

**Swagger summary:** Get a single user by id.

| | |
|-|-|
| **Why it exists** | Manage staff access inside the tenant. |
| **What it does** | Get a single user by id. |

### 281. `PATCH /users/{id}`

**Swagger summary:** Update a user.

| | |
|-|-|
| **Why it exists** | Manage staff access inside the tenant. |
| **What it does** | Update a user. |

### 282. `POST /users/{id}/admin-reset-password`

**Swagger summary:** Admin resets a target user's password to a new temporary password.

| | |
|-|-|
| **Why it exists** | Helpdesk unlocks users who forgot passwords. |
| **What it does** | Issues a new temporary password. |

### 283. `POST /users/{id}/force-logout`

**Swagger summary:** Force-logout: revoke a target user's active sessions on all devices.

| | |
|-|-|
| **Why it exists** | Security: kill all sessions for a compromised account. |
| **What it does** | Force-logout: revoke a target user's active sessions on all devices. |

### 284. `POST /users/{id}/restore`

**Swagger summary:** Restore a soft-deleted user.

| | |
|-|-|
| **Why it exists** | Reactivate a soft-deleted user. |
| **What it does** | Restore a soft-deleted user. |

### 285. `PATCH /users/{id}/status`

**Swagger summary:** Change a user's status (activate, suspend, etc).

| | |
|-|-|
| **Why it exists** | Activate, suspend, or lock staff accounts. |
| **What it does** | Change a user's status (activate, suspend, etc). |

### 286. `POST /users/bulk`

**Swagger summary:** Apply an action (activate/deactivate/suspend/delete/restore) to multiple users.

| | |
|-|-|
| **Why it exists** | HR/admin mass updates. |
| **What it does** | Apply an action (activate/deactivate/suspend/delete/restore) to multiple users. |

### 287. `POST /users/me/change-password`

**Swagger summary:** Authenticated user changes their own password.

| | |
|-|-|
| **Why it exists** | Self-service password change. |
| **What it does** | Authenticated user changes their own password. |

## Coverage

- OpenAPI operations: **287**
- Explained in this document: **287**
- Missing: **0**

---

*Related docs: `API_PASS_CASES.md`, `API_FAIL_CASES.md`, `api-complete-testing-guide.md`.*