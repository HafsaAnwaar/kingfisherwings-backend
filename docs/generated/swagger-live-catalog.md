# Live Swagger — complete dummy payloads (every API)

Base: `https://kingfisherwings-backend.onrender.com`

Operations: **441**

Password everywhere: `Welcome@123`

Replace UUID placeholders `00000000-0000-4000-8000-000000000001` with IDs from your run sequence (`{{COMPANY_ID}}`, `{{CUSTOMER_ID}}`, etc.).

---


## Auth

### POST `/auth/2fa/disable`

_Disable 2FA (password + optional TOTP/backup code)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "password": "Welcome@123",
  "code": "KFWD-001"
}
```

---

### POST `/auth/2fa/enable`

_Enable 2FA after verifying a TOTP code from the authenticator app_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "code": "123456"
}
```

---

### POST `/auth/2fa/setup`

_Generate TOTP secret + QR for the current user_

_No path/query params._

_No request body._

---

### POST `/auth/accept-invite`

_Accept invite token and set password_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "token": "invite-or-reset-token-hex",
  "password": "Welcome@123",
  "first_name": "Ahmed",
  "last_name": "Khan"
}
```

---

### POST `/auth/change-password`

_Change the authenticated user password_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

---

### POST `/auth/invite`

_Send invite email with accept token for an INVITED user_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "user_id": "00000000-0000-4000-8000-000000000001",
  "email": "demo@kfw-demo.com"
}
```

---

### POST `/auth/login`

_Staff login: tenant slug + email + password_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "mac_address": "00:1A:2B:3C:4D:5E",
  "totp_code": "123456",
  "backup_code": "ABCD-EFGH",
  "tenant_slug": "kfw-demo",
  "email": "demo@kfw-demo.com",
  "password": "Welcome@123",
  "remember_me": true,
  "device_name": "Swagger-Chrome"
}
```

---

### POST `/auth/logout`

_Revoke the current session_

_No path/query params._

_No request body._

---

### POST `/auth/logout-all`

_Log out of every device (revokes all active sessions)_

_No path/query params._

_No request body._

---

### GET `/auth/me`

_Get the authenticated principal (user, tenant owner, or super admin)_

_No path/query params._

_No request body._

---

### PATCH `/auth/me`

_Update own profile after login (preferred country, phone, locale)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "preferred_country_code": "AE",
  "phone": "+971501234567",
  "avatar_url": "https://kingfisherwings.com/avatar.png",
  "locale": "en"
}
```

---

### POST `/auth/refresh`

_Exchange a refresh token for a new token pair_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "refresh_token": "dummy-token-replace-me"
}
```

---

### GET `/auth/sessions`

_List the authenticated user's own active sessions_

_No path/query params._

_No request body._

---

### POST `/auth/sessions/{sessionId}/revoke`

_Revoke one of the authenticated user's own sessions_

**Params (every field)**

```json
[
  {
    "name": "sessionId",
    "in": "path",
    "required": true,
    "example": "demo-sessionid"
  }
]
```

_No request body._

---

### POST `/auth/super-admin/login`

_Platform super admin login_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "email": "demo@kfw-demo.com",
  "password": "Welcome@123"
}
```

---

### POST `/auth/super-admin/signup`

_Platform super admin self-registration_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "email": "demo@kfw-demo.com",
  "password": "Welcome@123",
  "first_name": "Ahmed",
  "last_name": "Khan"
}
```

---

### POST `/auth/tenant-login`

_Tenant admin login: tenant slug + the tenant's own password_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "tenant_slug": "kfw-demo",
  "password": "Welcome@123",
  "remember_me": true,
  "device_name": "Swagger-Chrome"
}
```

---

### POST `/auth/tenant/change-password`

_Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only._

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

---


## AWB Stock

### GET `/awb-stock/allocations`

_List AWB allocations_

**Params (every field)**

```json
[
  {
    "name": "airline_id",
    "in": "query",
    "required": false,
    "example": "demo-airline_id"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "demo-branch_id"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "demo-job_id"
  }
]
```

_No request body._

---

### POST `/awb-stock/allocations/{id}/mark-used`

_Mark an allocated AWB as used (flown/printed)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/awb-stock/allocations/{id}/void`

_Void an allocated (unused) AWB number_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "void_reason": "demo-void_reason"
}
```

---

### GET `/awb-stock/batches`

_List AWB stock batches_

**Params (every field)**

```json
[
  {
    "name": "airline_id",
    "in": "query",
    "required": false,
    "example": "demo-airline_id"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "demo-branch_id"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "demo-job_id"
  }
]
```

_No request body._

---

### POST `/awb-stock/batches`

_Register a new AWB number range for an airline_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "airline_id": "demo-airline_id",
  "branch_id": "demo-branch_id",
  "prefix": "176",
  "range_from": 12345670,
  "range_to": 12345699,
  "low_stock_threshold": 10,
  "notes": "Swagger dummy test note"
}
```

---

### DELETE `/awb-stock/batches/{id}`

_Soft-delete an empty AWB stock batch_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/awb-stock/batches/{id}`

_Get an AWB stock batch with recent allocations_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/awb-stock/batches/{id}`

_Update batch metadata (threshold, notes)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "low_stock_threshold": 1,
  "notes": "Swagger dummy test note"
}
```

---

### POST `/awb-stock/batches/{id}/allocate`

_Allocate the next AWB number from a batch to a job_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "job_id": "demo-job_id"
}
```

---

### POST `/awb-stock/batches/{id}/transfer-branch`

_Transfer batch ownership to another branch_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "branch_id": "demo-branch_id"
}
```

---

### GET `/awb-stock/reports/low-stock`

_Batches at or below their low-stock threshold_

_No path/query params._

_No request body._

---


## Companies

### GET `/companies`

_List this tenant's companies (usually just the one default, more for multi-entity groups)_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/companies`

_Register an additional company under this tenant (multi-entity groups)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "code": "OCE-DXB",
  "name": "Oceanic Freight Forwarders (Abu Dhabi Branch) LLC",
  "legal_name": "Demo Name",
  "registration_number": "demo-registration_number",
  "vat_number": "100000000000003",
  "address": "Office 1201, Business Bay, Dubai",
  "city": "Dubai",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "demo@kfw-demo.com",
  "is_default": false,
  "is_active": true
}
```

---

### DELETE `/companies/{id}`

_Soft-delete a company (blocked if it is the only one, or currently default)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/companies/{id}`

_Get a company by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/companies/{id}`

_Update a company_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "code": "OCE-DXB",
  "name": "Oceanic Freight Forwarders (Abu Dhabi Branch) LLC",
  "legal_name": "Demo Name",
  "registration_number": "demo-registration_number",
  "vat_number": "100000000000003",
  "address": "Office 1201, Business Bay, Dubai",
  "city": "Dubai",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "demo@kfw-demo.com",
  "is_default": false,
  "is_active": true
}
```

---


## Credit Notes

### GET `/credit-notes`

_List credit notes_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "DRAFT"
  },
  {
    "name": "invoice_type",
    "in": "query",
    "required": false,
    "example": "CUSTOMER_INVOICE"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  }
]
```

_No request body._

---

### POST `/credit-notes`

_Create a credit note against a posted customer invoice_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "credited_invoice_id": "00000000-0000-4000-8000-000000000001",
  "remarks": "Swagger dummy note",
  "lines": [
    {
      "description": "Ocean Freight",
      "quantity": 1,
      "unit_price": 1500,
      "charge_code_id": "00000000-0000-4000-8000-000000000001",
      "tax_rate_id": "00000000-0000-4000-8000-000000000001",
      "is_taxable": true,
      "sort_order": 0
    }
  ]
}
```

---

### GET `/credit-notes/{id}`

_Get a credit note_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/credit-notes/{id}/post`

_Post a draft credit note_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---


## Debit Notes

### GET `/debit-notes`

_List debit notes_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "DRAFT"
  },
  {
    "name": "invoice_type",
    "in": "query",
    "required": false,
    "example": "CUSTOMER_INVOICE"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  }
]
```

_No request body._

---

### POST `/debit-notes`

_Create a debit note against a posted customer invoice (extra charge)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "credited_invoice_id": "00000000-0000-4000-8000-000000000001",
  "remarks": "Swagger dummy note",
  "lines": [
    {
      "description": "Ocean Freight",
      "quantity": 1,
      "unit_price": 1500,
      "charge_code_id": "00000000-0000-4000-8000-000000000001",
      "tax_rate_id": "00000000-0000-4000-8000-000000000001",
      "is_taxable": true,
      "sort_order": 0
    }
  ]
}
```

---

### GET `/debit-notes/{id}`

_Get a debit note_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/debit-notes/{id}/post`

_Post a draft debit note_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---


## Files

### GET `/files/{tenantId}/{filename}`

_Download a locally stored file (PDFs generated by the system)_

**Params (every field)**

```json
[
  {
    "name": "tenantId",
    "in": "path",
    "required": true,
    "example": "demo-tenantid"
  },
  {
    "name": "filename",
    "in": "path",
    "required": true,
    "example": "Demo Name"
  }
]
```

_No request body._

---


## GL — AR / AP Aging

### GET `/gl/ap/aging`

_Accounts Payable aging buckets (Ch.19.2)_

**Params (every field)**

```json
[
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "demo-as_of",
    "description": "As-of date (default today)"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---

### GET `/gl/ap/statement/{partyId}`

_Vendor AP statement (purchase invoices + payments)_

**Params (every field)**

```json
[
  {
    "name": "partyId",
    "in": "path",
    "required": true,
    "example": "demo-partyid"
  },
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "demo-as_of",
    "description": "As-of date (default today)"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---

### GET `/gl/ar/aging`

_Accounts Receivable aging buckets (Ch.19.1)_

**Params (every field)**

```json
[
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "demo-as_of",
    "description": "As-of date (default today)"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---

### GET `/gl/ar/statement/{partyId}`

_Customer AR statement (invoices + receipts)_

**Params (every field)**

```json
[
  {
    "name": "partyId",
    "in": "path",
    "required": true,
    "example": "demo-partyid"
  },
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "demo-as_of",
    "description": "As-of date (default today)"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---


## GL — Bank Reconciliation

### GET `/gl/bank-reconciliations`

_List bank reconciliations_

**Params (every field)**

```json
[
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "DRAFT"
  },
  {
    "name": "gl_account_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---

### POST `/gl/bank-reconciliations`

_Start a draft bank reconciliation_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "gl_account_id": "00000000-0000-4000-8000-000000000001",
  "statement_date": "demo-statement_date",
  "statement_balance": 125000.5,
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "remarks": "Swagger dummy note"
}
```

---

### DELETE `/gl/bank-reconciliations/{id}`

_Cancel / soft-delete a draft reconciliation_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/gl/bank-reconciliations/{id}`

_Get bank reconciliation with lines + summary_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/gl/bank-reconciliations/{id}`

_Update draft bank reconciliation header_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "statement_date": "demo-statement_date",
  "statement_balance": 1,
  "remarks": "Swagger dummy note"
}
```

---

### POST `/gl/bank-reconciliations/{id}/complete`

_Complete bank reconciliation_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/gl/bank-reconciliations/{id}/lines`

_Add a matched / statement line_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "voucher_id": "00000000-0000-4000-8000-000000000001",
  "voucher_line_id": "00000000-0000-4000-8000-000000000001",
  "account_id": "00000000-0000-4000-8000-000000000001",
  "txn_date": "demo-txn_date",
  "description": "Swagger dummy description",
  "debit_amount": 0,
  "credit_amount": 0,
  "is_matched": true,
  "statement_ref": "demo-statement_ref"
}
```

---

### DELETE `/gl/bank-reconciliations/{id}/lines/{lineId}`

_Remove a recon line_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "demo-lineid"
  }
]
```

_No request body._

---

### PATCH `/gl/bank-reconciliations/{id}/lines/{lineId}`

_Update recon line match flags_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "demo-lineid"
  }
]
```

**Body (every field)**

```json
{
  "is_matched": true,
  "statement_ref": "demo-statement_ref",
  "description": "Swagger dummy description"
}
```

---

### GET `/gl/bank-reconciliations/{id}/unmatched`

_Posted bank GL lines not yet matched on this recon_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/gl/bank-transfers`

_Post a contra bank/cash transfer voucher (Ch.19.3)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "from_account_id": "00000000-0000-4000-8000-000000000001",
  "to_account_id": "00000000-0000-4000-8000-000000000001",
  "amount": 1000,
  "currency_code": "AED",
  "exchange_rate": 5,
  "transfer_date": "demo-transfer_date",
  "narration": "demo-narration",
  "reference_number": "demo-reference_number",
  "company_id": "00000000-0000-4000-8000-000000000001"
}
```

---


## GL — Chart of Accounts

### GET `/gl/accounts`

_List chart of accounts (Ch.17)_

**Params (every field)**

```json
[
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor"
  },
  {
    "name": "account_group",
    "in": "query",
    "required": false,
    "example": "ASSETS"
  },
  {
    "name": "account_type",
    "in": "query",
    "required": false,
    "example": "CURRENT_ASSET"
  },
  {
    "name": "is_postable",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  }
]
```

_No request body._

---

### POST `/gl/accounts`

_Create a GL account_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "account_code": "1100",
  "account_name": "Trade Receivables",
  "account_name_ar": "Demo Name",
  "account_group": "ASSETS",
  "account_type": "CURRENT_ASSET",
  "account_sub_type": "BANK",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "parent_id": "00000000-0000-4000-8000-000000000001",
  "is_header": false,
  "is_postable": true,
  "is_bank_account": false,
  "is_cash_account": false,
  "currency_code": "AED",
  "opening_balance": 0,
  "opening_balance_type": "DEBIT",
  "allow_manual_entry": true,
  "is_active": true,
  "sort_order": 0,
  "notes": "Swagger dummy test note"
}
```

---

### DELETE `/gl/accounts/{id}`

_Soft-delete a GL account (blocked if used on voucher lines)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/gl/accounts/{id}`

_Get account by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/gl/accounts/{id}`

_Update a GL account_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "account_code": "1100",
  "account_name": "Trade Receivables",
  "account_name_ar": "Demo Name",
  "account_group": "ASSETS",
  "account_type": "CURRENT_ASSET",
  "account_sub_type": "BANK",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "parent_id": "00000000-0000-4000-8000-000000000001",
  "is_header": false,
  "is_postable": true,
  "is_bank_account": false,
  "is_cash_account": false,
  "currency_code": "AED",
  "opening_balance": 0,
  "opening_balance_type": "DEBIT",
  "allow_manual_entry": true,
  "is_active": true,
  "sort_order": 0,
  "notes": "Swagger dummy test note"
}
```

---

### GET `/gl/accounts/{id}/ledger`

_GL register for one account (posted vouchers)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  }
]
```

_No request body._

---

### GET `/gl/accounts/reports/trial-balance`

_Trial balance from posted voucher lines + opening balances_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date",
    "description": "Inclusive period start (defaults to open)"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date",
    "description": "Inclusive period end (defaults to today)"
  },
  {
    "name": "hide_zero",
    "in": "query",
    "required": false,
    "example": true,
    "description": "Hide zero-balance accounts"
  }
]
```

_No request body._

---

### POST `/gl/accounts/seed-defaults`

_Seed a starter freight COA (only when empty)_

_No path/query params._

_No request body._

---

### GET `/gl/accounts/tree`

_Hierarchical chart of accounts tree_

_No path/query params._

_No request body._

---


## GL — Cheques / PDC

### GET `/gl/cheques`

_List cheques (receivable / payable / PDC)_

**Params (every field)**

```json
[
  {
    "name": "cheque_type",
    "in": "query",
    "required": false,
    "example": "RECEIVABLE"
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "PENDING"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "is_pdc",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "due_before",
    "in": "query",
    "required": false,
    "example": "demo-due_before"
  }
]
```

_No request body._

---

### POST `/gl/cheques`

_Register a cheque / PDC_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "cheque_number": "CHK-1001",
  "cheque_type": "RECEIVABLE",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 5000,
  "currency_code": "AED",
  "cheque_date": "demo-cheque_date",
  "due_date": "demo-due_date",
  "is_pdc": false,
  "company_id": "00000000-0000-4000-8000-000000000001",
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "bank_name": "Demo Name",
  "remarks": "Swagger dummy note"
}
```

---

### GET `/gl/cheques/{id}`

_Get cheque by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/gl/cheques/{id}`

_Update a pending cheque_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "cheque_number": "CHK-1001",
  "cheque_type": "RECEIVABLE",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 5000,
  "currency_code": "AED",
  "cheque_date": "demo-cheque_date",
  "due_date": "demo-due_date",
  "is_pdc": false,
  "company_id": "00000000-0000-4000-8000-000000000001",
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "bank_name": "Demo Name",
  "remarks": "Swagger dummy note"
}
```

---

### POST `/gl/cheques/{id}/bounce`

_Mark cheque bounced_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "reason": "demo-reason"
}
```

---

### POST `/gl/cheques/{id}/cancel`

_Cancel a cheque_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/gl/cheques/{id}/clear`

_Mark cheque cleared_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/gl/cheques/{id}/deposit`

_Mark cheque deposited_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/gl/cheques/reports/pdc-due`

_PDC due within N days (default 30)_

**Params (every field)**

```json
[
  {
    "name": "within_days",
    "in": "query",
    "required": false,
    "example": 30
  }
]
```

_No request body._

---


## GL — Financial Reports

### GET `/gl/reports/balance-sheet`

_Balance Sheet as of a date (Ch.20.1 / Week 12)_

**Params (every field)**

```json
[
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "demo-as_of",
    "description": "As-of date (YYYY-MM-DD). Defaults to today."
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "hide_zero",
    "in": "query",
    "required": false,
    "example": true
  }
]
```

_No request body._

---

### GET `/gl/reports/cash-flow`

_Cash Flow from bank/cash voucher activity (Ch.20.1 / Week 12)_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date",
    "description": "Period start (YYYY-MM-DD). Defaults to start of year or omit."
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date",
    "description": "Period end / as-of date (YYYY-MM-DD). Defaults to today."
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "hide_zero",
    "in": "query",
    "required": false,
    "example": true
  }
]
```

_No request body._

---

### GET `/gl/reports/profit-and-loss`

_Profit & Loss for a period (Ch.20.1 / Week 12)_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date",
    "description": "Period start (YYYY-MM-DD). Defaults to start of year or omit."
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date",
    "description": "Period end / as-of date (YYYY-MM-DD). Defaults to today."
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "hide_zero",
    "in": "query",
    "required": false,
    "example": true
  }
]
```

_No request body._

---

### GET `/gl/reports/trial-balance`

_Trial balance (Ch.20.1) — also available at GET /gl/accounts/reports/trial-balance_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date",
    "description": "Inclusive period start (defaults to open)"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date",
    "description": "Inclusive period end (defaults to today)"
  },
  {
    "name": "hide_zero",
    "in": "query",
    "required": false,
    "example": true,
    "description": "Hide zero-balance accounts"
  }
]
```

_No request body._

---

### GET `/gl/reports/vat-return`

_UAE VAT return draft from posted invoices (Ch.20.2 / Week 12)_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": true,
    "example": "demo-from_date",
    "description": "VAT period start"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": true,
    "example": "demo-to_date",
    "description": "VAT period end"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---


## GL — MIS Dashboard

### GET `/gl/mis/dashboard`

_Management MIS dashboard widgets (Ch.23 / Week 12)_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---

### GET `/gl/mis/operational`

_Operational KPIs — pending PRs, draft invoices, uninvoiced charges_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---

### GET `/gl/mis/profitability`

_Job profitability by shipper / job_type / branch / salesperson (Ch.23)_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "group_by",
    "in": "query",
    "required": false,
    "example": "customer"
  }
]
```

_No request body._

---


## GL — My Reports

### GET `/gl/saved-reports`

_List saved / shared report configurations (Ch.23 My Reports)_

**Params (every field)**

```json
[
  {
    "name": "report_type",
    "in": "query",
    "required": false,
    "example": "BALANCE_SHEET"
  },
  {
    "name": "shared_only",
    "in": "query",
    "required": false,
    "example": true
  }
]
```

_No request body._

---

### POST `/gl/saved-reports`

_Save a report configuration (filters + type)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "name": "Monthly P&L — June",
  "report_type": "BALANCE_SHEET",
  "description": "Swagger dummy description",
  "filters": {},
  "company_id": "00000000-0000-4000-8000-000000000001",
  "is_shared": false
}
```

---

### DELETE `/gl/saved-reports/{id}`

_Soft-delete a saved report_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/gl/saved-reports/{id}`

_Get a saved report by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/gl/saved-reports/{id}`

_Update a saved report_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "name": "Monthly P&L — June",
  "report_type": "BALANCE_SHEET",
  "description": "Swagger dummy description",
  "filters": {},
  "company_id": "00000000-0000-4000-8000-000000000001",
  "is_shared": false
}
```

---


## GL — Payments (AR/AP)

### GET `/gl/payments`

_List customer receipts and vendor payments (Ch.19)_

**Params (every field)**

```json
[
  {
    "name": "direction",
    "in": "query",
    "required": false,
    "example": "RECEIPT"
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "DRAFT"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor"
  }
]
```

_No request body._

---

### POST `/gl/payments`

_Create a draft receipt or vendor payment_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "direction": "RECEIPT",
  "payment_method": "CASH",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 1500,
  "currency_code": "AED",
  "exchange_rate": 5,
  "payment_date": "demo-payment_date",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "gl_account_id": "00000000-0000-4000-8000-000000000001",
  "reference_number": "demo-reference_number",
  "narration": "demo-narration",
  "allocations": [
    {
      "invoice_id": "00000000-0000-4000-8000-000000000001",
      "amount": 1000
    }
  ],
  "cheque_number": "demo-cheque_number",
  "cheque_date": "demo-cheque_date",
  "cheque_due_date": "demo-cheque_due_date",
  "cheque_bank_name": "Demo Name",
  "is_pdc": false
}
```

---

### DELETE `/gl/payments/{id}`

_Soft-delete a draft payment_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/gl/payments/{id}`

_Get payment with allocations_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/gl/payments/{id}`

_Update a draft payment header_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "direction": "RECEIPT",
  "payment_method": "CASH",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 1500,
  "currency_code": "AED",
  "exchange_rate": 5,
  "payment_date": "demo-payment_date",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "gl_account_id": "00000000-0000-4000-8000-000000000001",
  "reference_number": "demo-reference_number",
  "narration": "demo-narration",
  "allocations": [
    {
      "invoice_id": "00000000-0000-4000-8000-000000000001",
      "amount": 1000
    }
  ],
  "cheque_number": "demo-cheque_number",
  "cheque_date": "demo-cheque_date",
  "cheque_due_date": "demo-cheque_due_date",
  "cheque_bank_name": "Demo Name",
  "is_pdc": false
}
```

---

### POST `/gl/payments/{id}/allocations`

_Allocate payment amount to an open invoice_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "invoice_id": "00000000-0000-4000-8000-000000000001",
  "amount": 1000
}
```

---

### DELETE `/gl/payments/{id}/allocations/{allocationId}`

_Remove a draft payment allocation_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "allocationId",
    "in": "path",
    "required": true,
    "example": "demo-allocationid"
  }
]
```

_No request body._

---

### POST `/gl/payments/{id}/cancel`

_Cancel payment (reverses invoice balances and GL if posted)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/gl/payments/{id}/post`

_Post payment: update invoice balances + create GL voucher_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---


## GL — Vouchers

### GET `/gl/vouchers`

_List vouchers (Ch.17)_

**Params (every field)**

```json
[
  {
    "name": "voucher_type",
    "in": "query",
    "required": false,
    "example": "JOURNAL"
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "DRAFT"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor"
  }
]
```

_No request body._

---

### POST `/gl/vouchers`

_Create a draft voucher (optionally with lines)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "voucher_type": "JOURNAL",
  "currency_code": "AED",
  "exchange_rate": 5,
  "voucher_date": "demo-voucher_date",
  "narration": "demo-narration",
  "reference_number": "demo-reference_number",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "invoice_id": "00000000-0000-4000-8000-000000000001",
  "lines": [
    {
      "account_id": "00000000-0000-4000-8000-000000000001",
      "debit_amount": 0,
      "credit_amount": 0,
      "currency_code": "AED",
      "exchange_rate": 5,
      "narration": "demo-narration",
      "party_id": "00000000-0000-4000-8000-000000000001",
      "job_id": "00000000-0000-4000-8000-000000000001",
      "cost_center": "demo-cost_center"
    }
  ]
}
```

---

### DELETE `/gl/vouchers/{id}`

_Soft-delete a draft voucher_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/gl/vouchers/{id}`

_Get voucher with lines_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/gl/vouchers/{id}`

_Update draft voucher header_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "voucher_type": "JOURNAL",
  "currency_code": "AED",
  "exchange_rate": 5,
  "voucher_date": "demo-voucher_date",
  "narration": "demo-narration",
  "reference_number": "demo-reference_number",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "invoice_id": "00000000-0000-4000-8000-000000000001",
  "lines": [
    {
      "account_id": "00000000-0000-4000-8000-000000000001",
      "debit_amount": 0,
      "credit_amount": 0,
      "currency_code": "AED",
      "exchange_rate": 5,
      "narration": "demo-narration",
      "party_id": "00000000-0000-4000-8000-000000000001",
      "job_id": "00000000-0000-4000-8000-000000000001",
      "cost_center": "demo-cost_center"
    }
  ]
}
```

---

### POST `/gl/vouchers/{id}/lines`

_Add a line to a draft voucher_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "account_id": "00000000-0000-4000-8000-000000000001",
  "debit_amount": 0,
  "credit_amount": 0,
  "currency_code": "AED",
  "exchange_rate": 5,
  "narration": "demo-narration",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "cost_center": "demo-cost_center"
}
```

---

### DELETE `/gl/vouchers/{id}/lines/{lineId}`

_Remove a line from a draft voucher_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "demo-lineid"
  }
]
```

_No request body._

---

### PATCH `/gl/vouchers/{id}/lines/{lineId}`

_Update a draft voucher line_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "demo-lineid"
  }
]
```

**Body (every field)**

```json
{
  "account_id": "00000000-0000-4000-8000-000000000001",
  "debit_amount": 0,
  "credit_amount": 0,
  "currency_code": "AED",
  "exchange_rate": 5,
  "narration": "demo-narration",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "cost_center": "demo-cost_center"
}
```

---

### POST `/gl/vouchers/{id}/post`

_Post a balanced draft voucher to the GL_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/gl/vouchers/{id}/reverse`

_Create an offsetting posted reversal voucher_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---


## Invoices

### GET `/invoices`

_List customer invoices (Ch.18)_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "DRAFT"
  },
  {
    "name": "invoice_type",
    "in": "query",
    "required": false,
    "example": "CUSTOMER_INVOICE"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  }
]
```

_No request body._

---

### POST `/invoices`

_Create a draft customer invoice_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "currency_code": "AED",
  "exchange_rate": 5,
  "vat_rate": 5,
  "invoice_date": "demo-invoice_date",
  "due_date": "demo-due_date",
  "lpo_number": "demo-lpo_number",
  "remarks": "Swagger dummy note",
  "internal_notes": "Swagger dummy note",
  "lines": [
    {
      "description": "Ocean Freight",
      "quantity": 1,
      "unit_price": 1500,
      "charge_code_id": "00000000-0000-4000-8000-000000000001",
      "tax_rate_id": "00000000-0000-4000-8000-000000000001",
      "is_taxable": true,
      "sort_order": 0
    }
  ]
}
```

---

### DELETE `/invoices/{id}`

_Soft-delete a draft invoice_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/invoices/{id}`

_Get invoice with lines_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/invoices/{id}`

_Update a draft invoice header_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "currency_code": "AED",
  "exchange_rate": 5,
  "vat_rate": 5,
  "invoice_date": "demo-invoice_date",
  "due_date": "demo-due_date",
  "lpo_number": "demo-lpo_number",
  "remarks": "Swagger dummy note",
  "internal_notes": "Swagger dummy note",
  "lines": [
    {
      "description": "Ocean Freight",
      "quantity": 1,
      "unit_price": 1500,
      "charge_code_id": "00000000-0000-4000-8000-000000000001",
      "tax_rate_id": "00000000-0000-4000-8000-000000000001",
      "is_taxable": true,
      "sort_order": 0
    }
  ]
}
```

---

### POST `/invoices/{id}/cancel`

_Cancel an invoice_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/invoices/{id}/lines`

_Add a line to a draft invoice_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "description": "Ocean Freight",
  "quantity": 1,
  "unit_price": 1500,
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_taxable": true,
  "sort_order": 0
}
```

---

### DELETE `/invoices/{id}/lines/{lineId}`

_Remove an invoice line_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "demo-lineid"
  }
]
```

_No request body._

---

### PATCH `/invoices/{id}/lines/{lineId}`

_Update an invoice line_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "demo-lineid"
  }
]
```

**Body (every field)**

```json
{
  "description": "Ocean Freight",
  "quantity": 1,
  "unit_price": 1500,
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_taxable": true,
  "sort_order": 0
}
```

---

### GET `/invoices/{id}/pdf`

_Get invoice PDF metadata_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/invoices/{id}/pdf`

_Generate invoice PDF_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/invoices/{id}/post`

_Post a draft invoice (DRAFT -> POSTED)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/invoices/{id}/send`

_Email invoice PDF to customer_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "to_email": "customer@example.com",
  "message": "demo-message"
}
```

---

### POST `/invoices/from-job/{jobId}`

_Create draft invoice from uninvoiced billable job charges_

**Params (every field)**

```json
[
  {
    "name": "jobId",
    "in": "path",
    "required": true,
    "example": "demo-jobid"
  }
]
```

_No request body._

---

### GET `/invoices/reports/overdue`

_Overdue customer invoices past due_date with outstanding balance_

_No path/query params._

_No request body._

---


## Jobs

### GET `/jobs`

_List jobs_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Matches job_number, commodity."
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "ENQUIRY"
  },
  {
    "name": "job_type",
    "in": "query",
    "required": false,
    "example": "AIR_EXPORT"
  },
  {
    "name": "shipper_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "salesperson_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "origin_port_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "dest_port_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "masters_only",
    "in": "query",
    "required": false,
    "example": true,
    "description": "Master jobs only (no parent_job_id)."
  },
  {
    "name": "parent_job_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "House jobs under this master."
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  },
  {
    "name": "container_number",
    "in": "query",
    "required": false,
    "example": "demo-container_number",
    "description": "Filter FCL jobs by container number"
  },
  {
    "name": "vessel_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "Filter FCL jobs by vessel"
  },
  {
    "name": "shipping_line_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "Filter FCL jobs by shipping line"
  },
  {
    "name": "voyage_number",
    "in": "query",
    "required": false,
    "example": "demo-voyage_number",
    "description": "Filter FCL jobs by voyage number"
  },
  {
    "name": "container_type_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "Filter FCL jobs by container type on assigned containers"
  }
]
```

_No request body._

---

### POST `/jobs`

_Create a job (booking). AIR_EXPORT auto-seeds 15 milestones; SEA_FCL_EXPORT auto-seeds 16 FCL milestones + sea_fcl_details. Set parent_job_id for a HOUSE job._

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "job_type": "AIR_EXPORT",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "parent_job_id": "00000000-0000-4000-8000-000000000001",
  "shipper_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "agent_id": "00000000-0000-4000-8000-000000000001",
  "salesperson_id": "00000000-0000-4000-8000-000000000001",
  "ops_user_id": "00000000-0000-4000-8000-000000000001",
  "origin_port_id": "00000000-0000-4000-8000-000000000001",
  "dest_port_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "demo-commodity",
  "hs_code": "KFWD-001",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_count": 1,
  "incoterms": "demo-incoterms",
  "is_dg": false,
  "dg_class": "demo-dg_class",
  "notes": "Swagger dummy test note",
  "customer_remarks": "Swagger dummy note",
  "tags": [
    "demo-tags"
  ],
  "etd": "demo-etd",
  "eta": "demo-eta"
}
```

---

### DELETE `/jobs/{id}`

_Soft-delete a completed or cancelled job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/jobs/{id}`

_Get a job with air details, charges, milestones, and its house jobs (if a master)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}`

_Update a job (not allowed once COMPLETED or CANCELLED)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "job_type": "AIR_EXPORT",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "parent_job_id": "00000000-0000-4000-8000-000000000001",
  "shipper_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "agent_id": "00000000-0000-4000-8000-000000000001",
  "salesperson_id": "00000000-0000-4000-8000-000000000001",
  "ops_user_id": "00000000-0000-4000-8000-000000000001",
  "origin_port_id": "00000000-0000-4000-8000-000000000001",
  "dest_port_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "demo-commodity",
  "hs_code": "KFWD-001",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_count": 1,
  "incoterms": "demo-incoterms",
  "is_dg": false,
  "dg_class": "demo-dg_class",
  "notes": "Swagger dummy test note",
  "customer_remarks": "Swagger dummy note",
  "tags": [
    "demo-tags"
  ],
  "etd": "demo-etd",
  "eta": "demo-eta"
}
```

---

### PATCH `/jobs/{id}/air-details`

_Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "airline_id": "00000000-0000-4000-8000-000000000001",
  "origin_airport_id": "00000000-0000-4000-8000-000000000001",
  "dest_airport_id": "00000000-0000-4000-8000-000000000001",
  "hawb_number": "demo-hawb_number",
  "mawb_number": "demo-mawb_number",
  "flight_number": "demo-flight_number",
  "flight_date": "demo-flight_date",
  "screened": false,
  "screening_ref": "demo-screening_ref",
  "awb_type": "Direct",
  "freight_type": "Prepaid",
  "conversion_factor": 167
}
```

---

### GET `/jobs/{id}/bills-of-lading`

_List bills of lading on a Sea FCL job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/bills-of-lading`

_Create a bill of lading data record (PDF variants are Week 8)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "bl_type": "HBL",
  "bl_number": "demo-bl_number",
  "shipper_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "notify_id": "00000000-0000-4000-8000-000000000001",
  "pol": "demo-pol",
  "pod": "demo-pod",
  "place_of_receipt": "demo-place_of_receipt",
  "place_of_delivery": "demo-place_of_delivery",
  "vessel_name": "Demo Name",
  "voyage_number": "demo-voyage_number",
  "etd": "demo-etd",
  "eta": "demo-eta",
  "description_of_goods": "demo-description_of_goods",
  "marks_numbers": "demo-marks_numbers",
  "packages": 1,
  "gross_weight": 1,
  "measurement": 1,
  "freight_payable_at": "demo-freight_payable_at",
  "freight_terms": "demo-freight_terms",
  "number_of_originals": 3,
  "bl_conditions": "demo-bl_conditions",
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "paired_bl_id": "00000000-0000-4000-8000-000000000001",
  "is_draft": true,
  "is_original": false,
  "is_surrendered": false,
  "is_express_release": false
}
```

---

### DELETE `/jobs/{id}/bills-of-lading/{blId}`

_Soft-delete a bill of lading_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "blId",
    "in": "path",
    "required": true,
    "example": "demo-blid"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/bills-of-lading/{blId}`

_Update a bill of lading (draft → original / surrendered flags)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "blId",
    "in": "path",
    "required": true,
    "example": "demo-blid"
  }
]
```

**Body (every field)**

```json
{
  "bl_type": "HBL",
  "bl_number": "demo-bl_number",
  "shipper_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "notify_id": "00000000-0000-4000-8000-000000000001",
  "pol": "demo-pol",
  "pod": "demo-pod",
  "place_of_receipt": "demo-place_of_receipt",
  "place_of_delivery": "demo-place_of_delivery",
  "vessel_name": "Demo Name",
  "voyage_number": "demo-voyage_number",
  "etd": "demo-etd",
  "eta": "demo-eta",
  "description_of_goods": "demo-description_of_goods",
  "marks_numbers": "demo-marks_numbers",
  "packages": 1,
  "gross_weight": 1,
  "measurement": 1,
  "freight_payable_at": "demo-freight_payable_at",
  "freight_terms": "demo-freight_terms",
  "number_of_originals": 3,
  "bl_conditions": "demo-bl_conditions",
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "paired_bl_id": "00000000-0000-4000-8000-000000000001",
  "is_draft": true,
  "is_original": false,
  "is_surrendered": false,
  "is_express_release": false
}
```

---

### POST `/jobs/{id}/cancel`

_Cancel a job (status -> CANCELLED)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/jobs/{id}/cargo`

_List FCL cargo lines on a job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/cargo`

_Add an FCL cargo line (optionally assigned to a container)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "demo-commodity",
  "hs_code": "KFWD-001",
  "description": "Swagger dummy description",
  "marks_numbers": "demo-marks_numbers",
  "packages": 1,
  "gross_weight": 1,
  "measurement": 1
}
```

---

### DELETE `/jobs/{id}/cargo/{cargoId}`

_Remove an FCL cargo line_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "cargoId",
    "in": "path",
    "required": true,
    "example": "demo-cargoid"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/cargo/{cargoId}`

_Update an FCL cargo line_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "cargoId",
    "in": "path",
    "required": true,
    "example": "demo-cargoid"
  }
]
```

**Body (every field)**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "demo-commodity",
  "hs_code": "KFWD-001",
  "description": "Swagger dummy description",
  "marks_numbers": "demo-marks_numbers",
  "packages": 1,
  "gross_weight": 1,
  "measurement": 1
}
```

---

### POST `/jobs/{id}/cfs-storage/calculate`

_Calculate CFS storage: days × rate_per_day from sea-fcl-details_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "as_of_date": "demo-as_of_date"
}
```

---

### POST `/jobs/{id}/charges`

_Add a charge line — Job P&L recalculates automatically_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "description": "Ocean Freight",
  "quantity": 1,
  "unit_price": 850,
  "currency_code": "AED",
  "exchange_rate": 5,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_cost": false,
  "is_provisional": false,
  "is_billable": true,
  "party_id": "00000000-0000-4000-8000-000000000001"
}
```

---

### DELETE `/jobs/{id}/charges/{chargeId}`

_Remove a charge line_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "chargeId",
    "in": "path",
    "required": true,
    "example": "demo-chargeid"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/charges/{chargeId}`

_Update a charge line_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "chargeId",
    "in": "path",
    "required": true,
    "example": "demo-chargeid"
  }
]
```

**Body (every field)**

```json
{
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "description": "Ocean Freight",
  "quantity": 1,
  "unit_price": 850,
  "currency_code": "AED",
  "exchange_rate": 5,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_cost": false,
  "is_provisional": false,
  "is_billable": true,
  "party_id": "00000000-0000-4000-8000-000000000001"
}
```

---

### POST `/jobs/{id}/close`

_Close a job (status -> COMPLETED)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/jobs/{id}/containers`

_List containers on a Sea FCL job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/containers`

_Add a container to a Sea FCL job_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_number": "demo-container_number",
  "seal_number": "demo-seal_number",
  "tare_weight": 1,
  "max_payload": 1,
  "cubic_capacity": 1,
  "gross_weight": 1,
  "vgm_weight": 1,
  "cbm": 1,
  "status": "EMPTY",
  "gate_in_at": "demo-gate_in_at",
  "is_soc": false
}
```

---

### DELETE `/jobs/{id}/containers/{containerId}`

_Remove a container from a Sea FCL job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "demo-containerid"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/containers/{containerId}`

_Update a container on a Sea FCL job_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "demo-containerid"
  }
]
```

**Body (every field)**

```json
{
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_number": "demo-container_number",
  "seal_number": "demo-seal_number",
  "tare_weight": 1,
  "max_payload": 1,
  "cubic_capacity": 1,
  "gross_weight": 1,
  "vgm_weight": 1,
  "cbm": 1,
  "status": "EMPTY",
  "gate_in_at": "demo-gate_in_at",
  "is_soc": false
}
```

---

### POST `/jobs/{id}/containers/{containerId}/cargo`

_Assign an existing cargo line to a container_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "demo-containerid"
  }
]
```

**Body (every field)**

```json
{
  "cargo_id": "00000000-0000-4000-8000-000000000001"
}
```

---

### GET `/jobs/{id}/containers/{containerId}/fill`

_Container fill indicator for one container_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "demo-containerid"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/containers/{containerId}/return`

_Record container return to shipping line_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "demo-containerid"
  }
]
```

**Body (every field)**

```json
{
  "returned_at": "demo-returned_at",
  "return_condition": "demo-return_condition"
}
```

---

### POST `/jobs/{id}/containers/{containerId}/split`

_Split one container across multiple house consignees (co-loading)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "demo-containerid"
  }
]
```

**Body (every field)**

```json
{
  "portions": [
    {
      "consignee_id": "00000000-0000-4000-8000-000000000001",
      "packages": 1,
      "gross_weight": 1,
      "measurement": 1,
      "commodity": "demo-commodity",
      "marks_numbers": "demo-marks_numbers"
    }
  ]
}
```

---

### GET `/jobs/{id}/containers/fill`

_Container fill indicators — weight % and CBM % for all containers_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/customs-status`

_Update customs clearance workflow (PENDING→FILED→QUERY→CLEARED→RELEASED)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "customs_status": "PENDING",
  "customs_clearance_date": "demo-customs_clearance_date"
}
```

---

### GET `/jobs/{id}/cutoffs`

_SI / VGM / CY cutoff traffic-light status (green / amber ≤24h / red past)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/jobs/{id}/damage-reports`

_List damage reports_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/damage-reports`

_Create a damage report (description + photo URLs + survey #)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "damage_description": "demo-damage_description",
  "photo_urls": [
    "demo-photo_urls"
  ],
  "survey_report_number": "demo-survey_report_number",
  "reported_at": "demo-reported_at"
}
```

---

### GET `/jobs/{id}/deposits`

_List customs / port deposits with expiry alert bands_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/deposits`

_Create a customs or port deposit record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "deposit_type": "CUSTOMS",
  "deposit_amount": 1,
  "currency_code": "AED",
  "deposit_receipt_number": "demo-deposit_receipt_number",
  "deposit_expiry_date": "demo-deposit_expiry_date",
  "remarks": "Swagger dummy note"
}
```

---

### DELETE `/jobs/{id}/deposits/{depositId}`

_Soft-delete a deposit_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "depositId",
    "in": "path",
    "required": true,
    "example": "demo-depositid"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/deposits/{depositId}`

_Update a deposit_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "depositId",
    "in": "path",
    "required": true,
    "example": "demo-depositid"
  }
]
```

**Body (every field)**

```json
{
  "deposit_type": "CUSTOMS",
  "deposit_amount": 1,
  "currency_code": "AED",
  "deposit_receipt_number": "demo-deposit_receipt_number",
  "deposit_expiry_date": "demo-deposit_expiry_date",
  "remarks": "Swagger dummy note"
}
```

---

### GET `/jobs/{id}/documents`

_List documents attached to a job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/documents`

_Register a document on a job (metadata + file URL)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "document_type": "HAWB",
  "file_name": "HAWB-KFW-AE-001.pdf",
  "file_url": "https://kingfisherwings.com/asset.png",
  "reference_number": "demo-reference_number",
  "s3_key": "demo-s3_key",
  "file_size": 1,
  "mime_type": "demo-mime_type"
}
```

---

### DELETE `/jobs/{id}/documents/{documentId}`

_Remove a draft document_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "documentId",
    "in": "path",
    "required": true,
    "example": "demo-documentid"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/documents/{documentId}`

_Update a draft document metadata_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "documentId",
    "in": "path",
    "required": true,
    "example": "demo-documentid"
  }
]
```

**Body (every field)**

```json
{
  "document_type": "HAWB",
  "file_name": "HAWB-KFW-AE-001.pdf",
  "file_url": "https://kingfisherwings.com/asset.png",
  "reference_number": "demo-reference_number",
  "s3_key": "demo-s3_key",
  "file_size": 1,
  "mime_type": "demo-mime_type"
}
```

---

### POST `/jobs/{id}/documents/{documentId}/finalize`

_Finalize a document (DRAFT -> ORIGINAL, locked)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "documentId",
    "in": "path",
    "required": true,
    "example": "demo-documentid"
  }
]
```

**Body (every field)**

```json
{
  "is_finalized": true
}
```

---

### POST `/jobs/{id}/documents/back-to-back-bl`

_Queue Back-to-Back BL PDF (master + house pair)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/barcode-label`

_Queue barcode label PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/can`

_Queue Cargo Arrival Notice (CAN) PDF and mark CAN_SENT_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/cargo-manifest`

_Queue cargo manifest PDF generation_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/consignee-label`

_Queue consignee label PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/delivery-order`

_Queue Delivery Order PDF and mark DO_ISSUED_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/e-awb`

_Queue E-AWB PDF generation_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/exchange-letter`

_Queue Exchange Letter PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/fiata-bl`

_Queue FIATA FBL PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/freight-certificate`

_Queue freight certificate PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/freight-manifest`

_Queue Freight Manifest PDF (FCL)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### GET `/jobs/{id}/documents/generation-status`

_List async document generation tasks for a job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/documents/hawb`

_Queue HAWB PDF generation (Puppeteer + BullMQ)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/hbl`

_Queue HBL draft/original PDF (layout_variant: STANDARD | LAYOUT_A | LAYOUT_B)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/hbl-express-release`

_Queue Non-Negotiable HBL Express/Telex Release PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/job-card`

_Queue Job Card PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/job-costing`

_Queue job costing sheet PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/job-pnl`

_Queue Job P&L Statement PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/mawb`

_Queue MAWB PDF generation (Puppeteer + BullMQ)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/mbl`

_Queue Master BL / OBL PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/pre-alert`

_Queue pre-alert document PDF generation_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/pre-can`

_Queue Pre-CAN (pre-arrival notice) PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/proforma-invoice`

_Queue Proforma Invoice PDF for the job_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/proof-of-delivery`

_Queue Proof of Delivery PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/proxy-bl`

_Queue Proxy BL PDF (proxy_forwarder_name / address)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/rider-bl`

_Queue Rider/Addendum to BL PDF (pass rider_terms)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/sailing-confirmation`

_Queue Sailing Confirmation PDF (uses sailed_at / vessel sailed milestone)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/shipping-advice`

_Queue Shipping Advice PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/si`

_Queue Shipping Instruction (SI) PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/stuffing-report`

_Queue Stuffing Report PDF from stuffing records + containers_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/surrender-notice`

_Queue BL Surrender Notice PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/switch-bl`

_Queue Switch BL PDF (switched_from_bl_number + switch consignee/notify)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/transhipment-confirmation`

_Queue Transhipment Confirmation PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/transport-request`

_Queue Transport Request PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### POST `/jobs/{id}/documents/undertake-letter`

_Queue Undertake Letter PDF_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "layout_variant": "demo-layout_variant",
  "is_original": false,
  "bl_id": "demo-bl_id",
  "number_of_originals": 3,
  "rider_terms": "demo-rider_terms",
  "switched_from_bl_number": "demo-switched_from_bl_number",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "Demo Name",
  "proxy_forwarder_address": "Business Bay, Dubai",
  "transhipment_port": "demo-transhipment_port"
}
```

---

### GET `/jobs/{id}/free-days`

_List per-container free days + demurrage/detention accrual (traffic light)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/free-days`

_Upsert free-days / demurrage rates for a container_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "free_days_allowed": 30,
  "last_free_day_date": "demo-last_free_day_date",
  "demurrage_start_date": "demo-demurrage_start_date",
  "detention_start_date": "demo-detention_start_date",
  "demurrage_rate_per_day": 5,
  "detention_rate_per_day": 5
}
```

---

### POST `/jobs/{id}/free-days/recalculate`

_Recalculate demurrage + detention accruals for all containers on the job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/jobs/{id}/house-jobs`

_List the house jobs consolidated under this master job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/jobs/{id}/milestones`

_List all milestones for a job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/milestones`

_Add a custom milestone outside the standard taxonomy_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "milestone": "CUSTOMS_QUERY_RAISED",
  "planned_date": "demo-planned_date",
  "actual_date": "demo-actual_date",
  "notes": "Swagger dummy test note"
}
```

---

### PATCH `/jobs/{id}/milestones/{milestoneId}`

_Update a milestone — set actual_date to mark it complete_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "milestoneId",
    "in": "path",
    "required": true,
    "example": "demo-milestoneid"
  }
]
```

**Body (every field)**

```json
{
  "actual_date": "2026-07-15",
  "planned_date": "demo-planned_date",
  "notes": "Swagger dummy test note"
}
```

---

### GET `/jobs/{id}/notes`

_List notes on a job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/notes`

_Add a note to a job_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "note": "Swagger dummy note",
  "is_private": false,
  "is_pinned": false
}
```

---

### DELETE `/jobs/{id}/notes/{noteId}`

_Remove a job note_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "noteId",
    "in": "path",
    "required": true,
    "example": "Swagger dummy note"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/notes/{noteId}`

_Update a job note_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "noteId",
    "in": "path",
    "required": true,
    "example": "Swagger dummy note"
  }
]
```

**Body (every field)**

```json
{
  "note": "Swagger dummy note",
  "is_private": false,
  "is_pinned": false
}
```

---

### GET `/jobs/{id}/part-deliveries`

_List part deliveries_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/part-deliveries`

_Record a part delivery (remaining balance auto-calculated from job pieces)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "delivery_date": "demo-delivery_date",
  "packages_delivered": 1,
  "remarks": "Swagger dummy note"
}
```

---

### POST `/jobs/{id}/payment-requests`

_Create a payment request from job totals / parties_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "remarks": "Swagger dummy note",
  "amount": 1,
  "currency_code": "AED"
}
```

---

### GET `/jobs/{id}/pnl`

_Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/jobs/{id}/pods`

_List proofs of delivery_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/pods`

_Record proof of delivery_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "actual_delivery_date": "demo-actual_delivery_date",
  "delivered_by": "demo-delivered_by",
  "received_by": "demo-received_by",
  "signature_image_path": "demo-signature_image_path",
  "remarks": "Swagger dummy note"
}
```

---

### POST `/jobs/{id}/pre-alert/schedule`

_Schedule a pre-alert email for a future UTC time (cron delivers it)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "to_email": "consignee@example.com",
  "scheduled_at": "2026-07-20T10:00:00.000Z",
  "message": "demo-message"
}
```

---

### POST `/jobs/{id}/pre-alert/send`

_Send pre-alert and mark PRE_ALERT_SENT milestone complete_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "to_email": "consignee@example.com",
  "message": "demo-message"
}
```

---

### POST `/jobs/{id}/prorate-cost/{chargeCodeId}`

_Distribute a master job's cost line to its house jobs, proportionally by chargeable weight_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "chargeCodeId",
    "in": "path",
    "required": true,
    "example": "demo-chargecodeid"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/sea-fcl-details`

_Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs, VGM/SI)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "shipping_line_id": "00000000-0000-4000-8000-000000000001",
  "vessel_id": "00000000-0000-4000-8000-000000000001",
  "voyage_number": "demo-voyage_number",
  "hbl_number": "demo-hbl_number",
  "mbl_number": "demo-mbl_number",
  "booking_number": "demo-booking_number",
  "carrier_booking_ref": "demo-carrier_booking_ref",
  "place_of_receipt": "demo-place_of_receipt",
  "place_of_delivery": "demo-place_of_delivery",
  "etd": "demo-etd",
  "eta": "demo-eta",
  "incoterms": "demo-incoterms",
  "stuffing_location": "CY",
  "stuffing_date": "demo-stuffing_date",
  "si_cutoff": "demo-si_cutoff",
  "vgm_cutoff": "demo-vgm_cutoff",
  "cy_cutoff": "demo-cy_cutoff",
  "si_submitted_at": "demo-si_submitted_at",
  "si_version": 1,
  "vgm_submitted_at": "demo-vgm_submitted_at",
  "vgm_method": "SM1",
  "port_of_loading_id": "00000000-0000-4000-8000-000000000001",
  "port_of_discharge_id": "00000000-0000-4000-8000-000000000001",
  "bl_type": "Original",
  "freight_terms": "Prepaid",
  "transhipment_port": "demo-transhipment_port",
  "sailed_at": "demo-sailed_at",
  "mbl_number_from_line": "demo-mbl_number_from_line",
  "hbl_number_from_agent": "demo-hbl_number_from_agent",
  "actual_eta": "demo-actual_eta",
  "customs_entry_number": "demo-customs_entry_number",
  "customs_examination_details": "demo-customs_examination_details",
  "customs_duty_amount": 1,
  "customs_tax_amount": 1,
  "customs_clearance_date": "demo-customs_clearance_date",
  "customs_status": "PENDING",
  "customs_broker_id": "00000000-0000-4000-8000-000000000001",
  "linked_export_job_id": "00000000-0000-4000-8000-000000000001",
  "cfs_storage_rate_per_day": 5,
  "cfs_storage_start_date": "demo-cfs_storage_start_date"
}
```

---

### POST `/jobs/{id}/sea-fcl-details/si-submission`

_Record SI submission (date + version) and mark SI_SUBMITTED milestone_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "si_submitted_at": "demo-si_submitted_at",
  "si_version": 1
}
```

---

### POST `/jobs/{id}/sea-fcl-details/vgm-submission`

_Record VGM submission (date + SM1/SM2) and mark VGM_SUBMITTED milestone_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "vgm_submitted_at": "demo-vgm_submitted_at",
  "vgm_method": "SM1"
}
```

---

### GET `/jobs/{id}/stuffing-records`

_List stuffing records on a Sea FCL job_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/stuffing-records`

_Create a stuffing record and mark STUFFING_COMPLETED_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "supervisor_name": "Demo Name",
  "stuffing_date": "demo-stuffing_date",
  "location": "demo-location",
  "goods_condition": "demo-goods_condition",
  "notes": "Swagger dummy test note"
}
```

---

### DELETE `/jobs/{id}/stuffing-records/{recordId}`

_Soft-delete a stuffing record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "recordId",
    "in": "path",
    "required": true,
    "example": "demo-recordid"
  }
]
```

_No request body._

---

### PATCH `/jobs/{id}/stuffing-records/{recordId}`

_Update a stuffing record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "recordId",
    "in": "path",
    "required": true,
    "example": "demo-recordid"
  }
]
```

**Body (every field)**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "supervisor_name": "Demo Name",
  "stuffing_date": "demo-stuffing_date",
  "location": "demo-location",
  "goods_condition": "demo-goods_condition",
  "notes": "Swagger dummy test note"
}
```

---

### GET `/jobs/{id}/sub-jobs`

_List operational sub-jobs under this parent_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/jobs/{id}/sub-jobs`

_Create an operational sub-job under this parent_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "job_type": "AIR_EXPORT",
  "shipper_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "agent_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "demo-commodity",
  "notes": "Swagger dummy test note"
}
```

---

### POST `/jobs/{id}/transhipment-link`

_Link this FCL Import job to an outbound SEA_FCL_EXPORT job_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "export_job_id": "00000000-0000-4000-8000-000000000001"
}
```

---

### POST `/jobs/{id}/whatsapp/status`

_Send WhatsApp status stub (logged until WHATSAPP_ENABLED=true)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "to_phone": "+971501234567",
  "message": "demo-message"
}
```

---


## Locale

### GET `/locale/{countryCode}`

_Locale suggestions for an ISO country (still optional to use)_

**Params (every field)**

```json
[
  {
    "name": "countryCode",
    "in": "path",
    "required": true,
    "example": "AE"
  }
]
```

_No request body._

---

### GET `/locale/defaults`

_Optional country → suggested dial / currency / timezone_

**Params (every field)**

```json
[
  {
    "name": "country",
    "in": "query",
    "required": true,
    "example": "AE"
  }
]
```

_No request body._

---


## Masters — Airlines

### GET `/masters/airlines`

_list airlines_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/airlines`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "iata_code": "EK",
  "icao_code": "UAE",
  "prefix_code": "176",
  "name": "Emirates",
  "country_code": "AE",
  "is_active": true
}
```

---

### DELETE `/masters/airlines/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/airlines/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/airlines/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "iata_code": "EK",
  "icao_code": "UAE",
  "prefix_code": "176",
  "name": "Emirates",
  "country_code": "AE",
  "is_active": true
}
```

---


## Masters — Airports

### GET `/masters/airports`

_List airports_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/airports`

_Create an airport_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "iata_code": "DXB",
  "icao_code": "OMDB",
  "name": "Dubai International Airport",
  "city": "Dubai",
  "country_code": "AE",
  "latitude": 1,
  "longitude": 1,
  "timezone": "Asia/Dubai",
  "is_active": true
}
```

---

### DELETE `/masters/airports/{id}`

_Soft-delete an airport_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/airports/{id}`

_Get an airport by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/airports/{id}`

_Update an airport_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "iata_code": "DXB",
  "icao_code": "OMDB",
  "name": "Dubai International Airport",
  "city": "Dubai",
  "country_code": "AE",
  "latitude": 1,
  "longitude": 1,
  "timezone": "Asia/Dubai",
  "is_active": true
}
```

---


## Masters — Banks

### GET `/masters/banks`

_list banks_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/banks`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "name": "Emirates NBD",
  "short_name": "ENBD",
  "swift_code": "EBILAEAD",
  "iban_prefix": "AE07",
  "country_code": "AE",
  "is_active": true
}
```

---

### DELETE `/masters/banks/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/banks/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/banks/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "name": "Emirates NBD",
  "short_name": "ENBD",
  "swift_code": "EBILAEAD",
  "iban_prefix": "AE07",
  "country_code": "AE",
  "is_active": true
}
```

---


## Masters — Branches

### GET `/masters/branches`

_list branches_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/branches`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Dubai Head Office",
  "code": "HO",
  "address": "Office 1201, Business Bay, Dubai",
  "city": "Dubai",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "dubai@example.com",
  "is_head_office": false,
  "is_active": true
}
```

---

### DELETE `/masters/branches/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/branches/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/branches/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Dubai Head Office",
  "code": "HO",
  "address": "Office 1201, Business Bay, Dubai",
  "city": "Dubai",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "dubai@example.com",
  "is_head_office": false,
  "is_active": true
}
```

---


## Masters — ChargeCodes

### GET `/masters/charge-codes`

_list chargecodes_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/charge-codes`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "code": "OFT",
  "description": "Ocean Freight",
  "charge_group": "FREIGHT",
  "applicable_modes": [
    "SEA",
    "AIR"
  ],
  "tax_applicable": false,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "gl_revenue_code": "4001",
  "gl_cost_code": "5001",
  "gl_revenue_account_id": "00000000-0000-4000-8000-000000000001",
  "gl_cost_account_id": "00000000-0000-4000-8000-000000000001",
  "unit": "Per Container",
  "is_mandatory": false,
  "is_active": true
}
```

---

### DELETE `/masters/charge-codes/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/charge-codes/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/charge-codes/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "code": "OFT",
  "description": "Ocean Freight",
  "charge_group": "FREIGHT",
  "applicable_modes": [
    "SEA",
    "AIR"
  ],
  "tax_applicable": false,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "gl_revenue_code": "4001",
  "gl_cost_code": "5001",
  "gl_revenue_account_id": "00000000-0000-4000-8000-000000000001",
  "gl_cost_account_id": "00000000-0000-4000-8000-000000000001",
  "unit": "Per Container",
  "is_mandatory": false,
  "is_active": true
}
```

---


## Masters — ContainerTypes

### GET `/masters/container-types`

_List container types_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/container-types`

_Create a container type_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "code": "40HC",
  "name": "40ft High Cube",
  "size": "SIZE_20GP",
  "teu": 1,
  "max_payload": 1,
  "volume_cbm": 1,
  "is_active": true
}
```

---

### DELETE `/masters/container-types/{id}`

_Soft-delete a container type_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/container-types/{id}`

_Get a container type by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/container-types/{id}`

_Update a container type_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "code": "40HC",
  "name": "40ft High Cube",
  "size": "SIZE_20GP",
  "teu": 1,
  "max_payload": 1,
  "volume_cbm": 1,
  "is_active": true
}
```

---


## Masters — Countries

### GET `/masters/countries`

_List countries_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/countries`

_Create a country_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "iso_code": "AE",
  "iso3_code": "ARE",
  "name": "United Arab Emirates",
  "dial_code": "+971",
  "region": "Middle East",
  "is_active": true
}
```

---

### DELETE `/masters/countries/{id}`

_Soft-delete a country_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/countries/{id}`

_Get a country by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/countries/{id}`

_Update a country_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "iso_code": "AE",
  "iso3_code": "ARE",
  "name": "United Arab Emirates",
  "dial_code": "+971",
  "region": "Middle East",
  "is_active": true
}
```

---


## Masters — Currencies

### GET `/masters/currencies`

_List currencies_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/currencies`

_Create a currency_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "code": "AED",
  "name": "UAE Dirham",
  "symbol": "د.إ",
  "decimal_places": 2,
  "is_base": false,
  "is_active": true
}
```

---

### DELETE `/masters/currencies/{id}`

_Soft-delete a currency_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/currencies/{id}`

_Get a currency by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/currencies/{id}`

_Update a currency_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "code": "AED",
  "name": "UAE Dirham",
  "symbol": "د.إ",
  "decimal_places": 2,
  "is_base": false,
  "is_active": true
}
```

---


## Masters — Departments

### GET `/masters/departments`

_list departments_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/departments`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations",
  "code": "OPS",
  "parent_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```

---

### DELETE `/masters/departments/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/departments/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/departments/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations",
  "code": "OPS",
  "parent_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```

---


## Masters — Designations

### GET `/masters/designations`

_list designations_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/designations`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations Executive",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```

---

### DELETE `/masters/designations/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/designations/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/designations/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations Executive",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```

---


## Masters — Exchange Rates

### GET `/masters/exchange-rates`

_List exchange rates, optionally filtered by currency_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  },
  {
    "name": "currency_id",
    "in": "query",
    "required": true,
    "example": "AED"
  }
]
```

_No request body._

---

### POST `/masters/exchange-rates`

_Record (or correct) an exchange rate for a date — upserts by currency + date_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "currency_id": "00000000-0000-4000-8000-000000000001",
  "base_currency": "AED",
  "rate": 3.6725,
  "rate_date": "2026-07-06",
  "source": "manual"
}
```

---

### GET `/masters/exchange-rates/latest/{currencyId}`

_Most recent rate on file for a currency_

**Params (every field)**

```json
[
  {
    "name": "currencyId",
    "in": "path",
    "required": true,
    "example": "AED"
  }
]
```

_No request body._

---


## Masters — Holidays

### GET `/masters/holidays`

_list holidays_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/holidays`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "country_code": "AE",
  "date": "2026-12-02",
  "name": "UAE National Day",
  "is_recurring": false
}
```

---

### DELETE `/masters/holidays/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/holidays/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/holidays/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "country_code": "AE",
  "date": "2026-12-02",
  "name": "UAE National Day",
  "is_recurring": false
}
```

---


## Masters — HsCodes

### GET `/masters/hs-codes`

_List HS codes_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/hs-codes`

_Create an HS code_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "hs_code": "8517.12",
  "description": "Telephones for cellular networks",
  "import_duty_rate": 5,
  "export_duty_rate": 5,
  "dg_class": "9",
  "un_number": "UN3481",
  "is_prohibited": false,
  "is_restricted": false,
  "notes": "Swagger dummy test note",
  "is_active": true
}
```

---

### DELETE `/masters/hs-codes/{id}`

_Soft-delete an HS code_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/hs-codes/{id}`

_Get an HS code by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/hs-codes/{id}`

_Update an HS code_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "hs_code": "8517.12",
  "description": "Telephones for cellular networks",
  "import_duty_rate": 5,
  "export_duty_rate": 5,
  "dg_class": "9",
  "un_number": "UN3481",
  "is_prohibited": false,
  "is_restricted": false,
  "notes": "Swagger dummy test note",
  "is_active": true
}
```

---


## Masters — Ports

### GET `/masters/ports`

_List ports_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/ports`

_Create a port_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "un_locode": "AEJEA",
  "name": "Jebel Ali",
  "city": "Dubai",
  "country_code": "AE",
  "mode": "AIR",
  "latitude": 1,
  "longitude": 1,
  "is_active": true
}
```

---

### DELETE `/masters/ports/{id}`

_Soft-delete a port_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/ports/{id}`

_Get a port record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/ports/{id}`

_Update a port_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "un_locode": "AEJEA",
  "name": "Jebel Ali",
  "city": "Dubai",
  "country_code": "AE",
  "mode": "AIR",
  "latitude": 1,
  "longitude": 1,
  "is_active": true
}
```

---


## Masters — ShippingLines

### GET `/masters/shipping-lines`

_list shippinglines_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/shipping-lines`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "scac_code": "MAEU",
  "name": "Maersk Line",
  "short_name": "Maersk",
  "country_code": "DK",
  "website": "https://www.maersk.com",
  "tracking_url": "https://kingfisherwings.com/asset.png",
  "is_active": true
}
```

---

### DELETE `/masters/shipping-lines/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/shipping-lines/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/shipping-lines/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "scac_code": "MAEU",
  "name": "Maersk Line",
  "short_name": "Maersk",
  "country_code": "DK",
  "website": "https://www.maersk.com",
  "tracking_url": "https://kingfisherwings.com/asset.png",
  "is_active": true
}
```

---


## Masters — TaxRates

### GET `/masters/tax-rates`

_list taxrates_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/tax-rates`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "name": "UAE VAT Standard",
  "code": "VAT5",
  "tax_type": "VAT",
  "rate": 5,
  "country_code": "AE",
  "effective_from": "2018-01-01",
  "effective_to": "2030-12-31",
  "is_default": false,
  "is_active": true
}
```

---

### DELETE `/masters/tax-rates/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/tax-rates/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/tax-rates/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "name": "UAE VAT Standard",
  "code": "VAT5",
  "tax_type": "VAT",
  "rate": 5,
  "country_code": "AE",
  "effective_from": "2018-01-01",
  "effective_to": "2030-12-31",
  "is_default": false,
  "is_active": true
}
```

---


## Masters — Truckers

### GET `/masters/truckers`

_list truckers_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/truckers`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "name": "Al Futtaim Logistics",
  "code": "TRK-001",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "ops@truckers.ae",
  "contact_person": "Ahmed Khan",
  "is_active": true
}
```

---

### DELETE `/masters/truckers/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/truckers/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/truckers/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "name": "Al Futtaim Logistics",
  "code": "TRK-001",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "ops@truckers.ae",
  "contact_person": "Ahmed Khan",
  "is_active": true
}
```

---


## Masters — UnitsOfMeasure

### GET `/masters/units-of-measure`

_list unitsofmeasure_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/units-of-measure`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "code": "CBM",
  "name": "Cubic Meter",
  "category": "Volume",
  "is_active": true
}
```

---

### DELETE `/masters/units-of-measure/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/units-of-measure/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/units-of-measure/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "code": "CBM",
  "name": "Cubic Meter",
  "category": "Volume",
  "is_active": true
}
```

---


## Masters — Vessels

### GET `/masters/vessels`

_list vessels_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/vessels`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "name": "MSC GULSUN",
  "imo_number": "9839430",
  "flag_country": "PA",
  "shipping_line_id": "00000000-0000-4000-8000-000000000001",
  "vessel_type": "Container Ship",
  "year_built": 2019,
  "gross_tonnage": 1,
  "is_active": true
}
```

---

### DELETE `/masters/vessels/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/vessels/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/vessels/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "name": "MSC GULSUN",
  "imo_number": "9839430",
  "flag_country": "PA",
  "shipping_line_id": "00000000-0000-4000-8000-000000000001",
  "vessel_type": "Container Ship",
  "year_built": 2019,
  "gross_tonnage": 1,
  "is_active": true
}
```

---


## Masters — Warehouses

### GET `/masters/warehouses`

_list warehouses_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/masters/warehouses`

_Create a record_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "name": "Jebel Ali Warehouse 3",
  "code": "WH-JA3",
  "address": "Office 1201, Business Bay, Dubai",
  "city": "Dubai",
  "country_code": "AE",
  "capacity_sqm": 1,
  "is_active": true
}
```

---

### DELETE `/masters/warehouses/{id}`

_Soft-delete a record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/masters/warehouses/{id}`

_Get a record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/masters/warehouses/{id}`

_Update a record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "name": "Jebel Ali Warehouse 3",
  "code": "WH-JA3",
  "address": "Office 1201, Business Bay, Dubai",
  "city": "Dubai",
  "country_code": "AE",
  "capacity_sqm": 1,
  "is_active": true
}
```

---


## Organization — Bank Accounts

### GET `/organization/bank-accounts`

_List this tenant's own bank accounts_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/organization/bank-accounts`

_Add a bank account_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "bank_name": "Emirates NBD",
  "account_name": "Oceanic Freight Forwarders LLC",
  "account_number": "1234567890123",
  "iban": "AE070331234567890123456",
  "swift_code": "EBILAEAD",
  "currency_code": "AED",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "gl_account_id": "00000000-0000-4000-8000-000000000001",
  "is_default": false,
  "is_active": true
}
```

---

### DELETE `/organization/bank-accounts/{id}`

_Soft-delete a bank account_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/organization/bank-accounts/{id}`

_Get a bank account by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/organization/bank-accounts/{id}`

_Update a bank account_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "bank_name": "Emirates NBD",
  "account_name": "Oceanic Freight Forwarders LLC",
  "account_number": "1234567890123",
  "iban": "AE070331234567890123456",
  "swift_code": "EBILAEAD",
  "currency_code": "AED",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "gl_account_id": "00000000-0000-4000-8000-000000000001",
  "is_default": false,
  "is_active": true
}
```

---


## Organization — Number Formats

### GET `/organization/number-formats`

_List all configured document number formats (Ch.2.2)_

_No path/query params._

_No request body._

---

### POST `/organization/number-formats`

_Configure the number format for a document type_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "document_type": "QUOTATION",
  "prefix": "KFWD",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": true,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "YEARLY",
  "is_active": true
}
```

---

### GET `/organization/number-formats/{documentType}`

_Get the number format for one document type_

**Params (every field)**

```json
[
  {
    "name": "documentType",
    "in": "path",
    "required": true,
    "example": "demo-documenttype"
  }
]
```

_No request body._

---

### PATCH `/organization/number-formats/{documentType}`

_Update the number format for a document type_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "documentType",
    "in": "path",
    "required": true,
    "example": "demo-documenttype"
  }
]
```

**Body (every field)**

```json
{
  "document_type": "QUOTATION",
  "prefix": "KFW",
  "include_branch_code": false,
  "include_year": true,
  "year_digits": 2,
  "include_month": false,
  "sequence_length": 5,
  "separator": "/",
  "reset_frequency": "NEVER",
  "is_active": true
}
```

---

### GET `/organization/number-formats/{documentType}/preview`

_Preview the next number for this format without consuming a sequence value_

**Params (every field)**

```json
[
  {
    "name": "documentType",
    "in": "path",
    "required": true,
    "example": "demo-documenttype"
  }
]
```

_No request body._

---


## Organization Profile

### GET `/organization/profile`

_Get this tenant's own organization profile_

_No path/query params._

_No request body._

---

### PATCH `/organization/profile`

_Update this tenant's own organization profile (Ch.27.1)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "name": "Kingfisher Demo Entity",
  "display_name": "Kingfisher Demo",
  "logo_url": "https://kingfisherwings.com/logo.png",
  "primary_color": "#0A66C2",
  "website": "https://kingfisherwings.com",
  "address": "Office 1201, Business Bay, Dubai",
  "city": "Dubai",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "demo@kfw-demo.com",
  "language": "en",
  "base_currency": "AED",
  "timezone": "Asia/Dubai",
  "financial_year_start": 1,
  "vat_number": "100000000000003",
  "cr_number": "CR-1234567",
  "iata_cargo_agent_code": "CGA-12345",
  "customs_code": "KFWD-001",
  "customs_license_no": "demo-customs_license_no"
}
```

---


## Parties

### GET `/parties`

_List parties (customers, agents, suppliers, carriers, etc.)_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Matches name, short_name, code, email."
  },
  {
    "name": "party_type",
    "in": "query",
    "required": false,
    "example": "CUSTOMER"
  },
  {
    "name": "credit_status",
    "in": "query",
    "required": false,
    "example": "ACTIVE"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/parties`

_Create a party_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "short_name": "Al Noor",
  "vat_number": "100000000000003",
  "cr_number": "CR-1234567",
  "country_code": "AE",
  "city": "Dubai",
  "address": "Office 1201, Business Bay, Dubai",
  "phone": "+971501234567",
  "email": "ops@alnoor.ae",
  "credit_limit": 50000,
  "credit_days": 30,
  "currency_code": "AED",
  "salesperson_id": "00000000-0000-4000-8000-000000000001",
  "portal_access": false,
  "marketing_subscription": true,
  "iata_code": "EK",
  "scac_code": "MAEU",
  "tags": [
    "demo-tags"
  ],
  "notes": "Swagger dummy test note",
  "is_active": true
}
```

---

### DELETE `/parties/{id}`

_Soft-delete a party_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/parties/{id}`

_Get a party with its contacts and addresses_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/parties/{id}`

_Update a party_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "short_name": "Al Noor",
  "vat_number": "100000000000003",
  "cr_number": "CR-1234567",
  "country_code": "AE",
  "city": "Dubai",
  "address": "Office 1201, Business Bay, Dubai",
  "phone": "+971501234567",
  "email": "demo@kfw-demo.com",
  "credit_limit": 50000,
  "credit_days": 30,
  "currency_code": "AED",
  "salesperson_id": "00000000-0000-4000-8000-000000000001",
  "portal_access": false,
  "marketing_subscription": true,
  "iata_code": "EK",
  "scac_code": "MAEU",
  "tags": [
    "demo-tags"
  ],
  "notes": "Swagger dummy test note",
  "is_active": true
}
```

---

### POST `/parties/{id}/addresses`

_Add an address to a party_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "label": "Warehouse",
  "address_line1": "Plot 45, Jebel Ali Free Zone",
  "address_line2": "Business Bay, Dubai",
  "city": "Dubai",
  "state": "demo-state",
  "postal_code": "00000",
  "country_code": "AE",
  "is_default": false
}
```

---

### DELETE `/parties/{id}/addresses/{addressId}`

_Remove a party's address_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "addressId",
    "in": "path",
    "required": true,
    "example": "Business Bay, Dubai"
  }
]
```

_No request body._

---

### PATCH `/parties/{id}/addresses/{addressId}`

_Update a party's address_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "addressId",
    "in": "path",
    "required": true,
    "example": "Business Bay, Dubai"
  }
]
```

**Body (every field)**

```json
{
  "label": "Warehouse",
  "address_line1": "Plot 45, Jebel Ali Free Zone",
  "address_line2": "Business Bay, Dubai",
  "city": "Dubai",
  "state": "demo-state",
  "postal_code": "00000",
  "country_code": "AE",
  "is_default": false
}
```

---

### POST `/parties/{id}/contacts`

_Add a contact to a party_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "name": "Fatima Al Suwaidi",
  "designation": "Import Manager",
  "phone": "+97142223344",
  "mobile": "+971501112233",
  "email": "fatima@example.com",
  "is_primary": false
}
```

---

### DELETE `/parties/{id}/contacts/{contactId}`

_Remove a party's contact_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "contactId",
    "in": "path",
    "required": true,
    "example": "demo-contactid"
  }
]
```

_No request body._

---

### PATCH `/parties/{id}/contacts/{contactId}`

_Update a party's contact_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "contactId",
    "in": "path",
    "required": true,
    "example": "demo-contactid"
  }
]
```

**Body (every field)**

```json
{
  "name": "Fatima Al Suwaidi",
  "designation": "Import Manager",
  "phone": "+97142223344",
  "mobile": "+971501112233",
  "email": "fatima@example.com",
  "is_primary": false
}
```

---

### PATCH `/parties/{id}/credit-status`

_Change credit status (Active / On Hold / Blacklisted)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "credit_status": "ACTIVE",
  "reason": "demo-reason"
}
```

---

### GET `/parties/{id}/history`

_Party transaction history — jobs, quotations, invoices, payment requests, audit trail_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/parties/export`

_Export parties as CSV_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Matches name, short_name, code, email."
  },
  {
    "name": "party_type",
    "in": "query",
    "required": false,
    "example": "CUSTOMER"
  },
  {
    "name": "credit_status",
    "in": "query",
    "required": false,
    "example": "ACTIVE"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/parties/import`

_Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import._

_No path/query params._

_No request body._

---


## Payment Requests

### GET `/payment-requests`

_List payment requests_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "PENDING"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---

### POST `/payment-requests`

_Create a payment request_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 5000,
  "currency_code": "AED",
  "invoice_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "due_date": "demo-due_date",
  "remarks": "Swagger dummy note"
}
```

---

### DELETE `/payment-requests/{id}`

_Soft-delete a pending payment request_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/payment-requests/{id}`

_Get a payment request_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/payment-requests/{id}`

_Update a pending payment request_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 5000,
  "currency_code": "AED",
  "invoice_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "due_date": "demo-due_date",
  "remarks": "Swagger dummy note"
}
```

---

### POST `/payment-requests/{id}/approve`

_Approve a payment request_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/payment-requests/{id}/mark-paid`

_Mark an approved payment request as paid_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/payment-requests/{id}/reject`

_Reject a payment request_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "rejected_reason": "demo-rejected_reason"
}
```

---


## Purchase Invoices

### GET `/purchase-invoices`

_List purchase invoices (vendor bills)_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "DRAFT"
  },
  {
    "name": "invoice_type",
    "in": "query",
    "required": false,
    "example": "CUSTOMER_INVOICE"
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  }
]
```

_No request body._

---

### POST `/purchase-invoices`

_Create a draft purchase invoice_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "currency_code": "AED",
  "exchange_rate": 5,
  "vat_rate": 5,
  "invoice_date": "demo-invoice_date",
  "due_date": "demo-due_date",
  "lpo_number": "demo-lpo_number",
  "remarks": "Swagger dummy note",
  "internal_notes": "Swagger dummy note",
  "lines": [
    {
      "description": "Ocean Freight",
      "quantity": 1,
      "unit_price": 1500,
      "charge_code_id": "00000000-0000-4000-8000-000000000001",
      "tax_rate_id": "00000000-0000-4000-8000-000000000001",
      "is_taxable": true,
      "sort_order": 0
    }
  ]
}
```

---

### DELETE `/purchase-invoices/{id}`

_Soft-delete a draft purchase invoice_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/purchase-invoices/{id}`

_Get a purchase invoice_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/purchase-invoices/{id}`

_Update a draft purchase invoice_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "currency_code": "AED",
  "exchange_rate": 5,
  "vat_rate": 5,
  "invoice_date": "demo-invoice_date",
  "due_date": "demo-due_date",
  "lpo_number": "demo-lpo_number",
  "remarks": "Swagger dummy note",
  "internal_notes": "Swagger dummy note",
  "lines": [
    {
      "description": "Ocean Freight",
      "quantity": 1,
      "unit_price": 1500,
      "charge_code_id": "00000000-0000-4000-8000-000000000001",
      "tax_rate_id": "00000000-0000-4000-8000-000000000001",
      "is_taxable": true,
      "sort_order": 0
    }
  ]
}
```

---

### POST `/purchase-invoices/{id}/post`

_Post a draft purchase invoice_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---


## Quotations

### GET `/quotations`

_List quotations_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Matches quotation_number, commodity."
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "DRAFT"
  },
  {
    "name": "job_type",
    "in": "query",
    "required": false,
    "example": "AIR_EXPORT",
    "description": "Service type — Air Export, FCL Export, NVOCC Export, etc."
  },
  {
    "name": "customer_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "Client / customer."
  },
  {
    "name": "salesperson_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "department_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "carrier_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "The quoted carrier (Party)."
  },
  {
    "name": "origin_port_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "dest_port_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "container_type_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "incoterm",
    "in": "query",
    "required": false,
    "example": "demo-incoterm",
    "description": "e.g. FOB, CIF, EXW."
  },
  {
    "name": "created_by",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "Filter by who created the quotation."
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/quotations`

_Create a quotation (DRAFT)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_type": "AIR_EXPORT",
  "customer_id": "00000000-0000-4000-8000-000000000001",
  "salesperson_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "carrier_id": "00000000-0000-4000-8000-000000000001",
  "origin_port_id": "00000000-0000-4000-8000-000000000001",
  "dest_port_id": "00000000-0000-4000-8000-000000000001",
  "incoterm": "EXW",
  "commodity": "demo-commodity",
  "hs_code": "KFWD-001",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_count": 1,
  "is_dg": false,
  "dg_class": "9",
  "special_requirements": "demo-special_requirements",
  "carrier_preference": "demo-carrier_preference",
  "transit_time_days": 30,
  "routing_notes": "Swagger dummy note",
  "remarks": "Swagger dummy note",
  "internal_notes": "Swagger dummy note",
  "valid_until": "2026-08-31",
  "currency_code": "AED",
  "exchange_rate": 5,
  "discount_percent": 1,
  "discount_amount": 1
}
```

---

### DELETE `/quotations/{id}`

_Soft-delete a quotation (DRAFT only)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/quotations/{id}`

_Get a quotation with its lines, status history, and approvals_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/quotations/{id}`

_Update a quotation header (DRAFT or REJECTED only)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_type": "AIR_EXPORT",
  "customer_id": "00000000-0000-4000-8000-000000000001",
  "salesperson_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "carrier_id": "00000000-0000-4000-8000-000000000001",
  "origin_port_id": "00000000-0000-4000-8000-000000000001",
  "dest_port_id": "00000000-0000-4000-8000-000000000001",
  "incoterm": "EXW",
  "commodity": "demo-commodity",
  "hs_code": "KFWD-001",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_count": 1,
  "is_dg": false,
  "dg_class": "9",
  "special_requirements": "demo-special_requirements",
  "carrier_preference": "demo-carrier_preference",
  "transit_time_days": 30,
  "routing_notes": "Swagger dummy note",
  "remarks": "Swagger dummy note",
  "internal_notes": "Swagger dummy note",
  "valid_until": "2026-08-31",
  "currency_code": "AED",
  "exchange_rate": 5,
  "discount_percent": 1,
  "discount_amount": 1
}
```

---

### POST `/quotations/{id}/apply-tariff`

_Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/{id}/approve`

_SUBMITTED -> APPROVED_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "comments": "Swagger dummy note"
}
```

---

### POST `/quotations/{id}/archive`

_Archive a closed quotation (soft-delete)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/{id}/convert-to-job`

_WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module._

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/{id}/duplicate`

_Clone into a new revision (new DRAFT, version+1, linked to the same parent)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/{id}/expire`

_Manually expire a quotation past its valid_until date_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/{id}/lines`

_Add a charge line — GP recalculates automatically_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "description": "Ocean Freight",
  "unit": "Per Container",
  "quantity": 1,
  "unit_price": 850,
  "currency_code": "AED",
  "exchange_rate": 5,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_cost": false,
  "supplier_id": "00000000-0000-4000-8000-000000000001",
  "sort_order": 0
}
```

---

### DELETE `/quotations/{id}/lines/{lineId}`

_Remove a charge line_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "demo-lineid"
  }
]
```

_No request body._

---

### PATCH `/quotations/{id}/lines/{lineId}`

_Update a charge line_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "demo-lineid"
  }
]
```

**Body (every field)**

```json
{
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "description": "Ocean Freight",
  "unit": "Per Container",
  "quantity": 1,
  "unit_price": 850,
  "currency_code": "AED",
  "exchange_rate": 5,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_cost": false,
  "supplier_id": "00000000-0000-4000-8000-000000000001",
  "sort_order": 0
}
```

---

### POST `/quotations/{id}/mark-lost`

_SENT -> LOST, with a reason code_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "reason": "Competitor Rate",
  "notes": "Swagger dummy test note"
}
```

---

### POST `/quotations/{id}/mark-won`

_SENT -> WON_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/quotations/{id}/pdf`

_Get quotation PDF URLs and recent generation tasks_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/{id}/pdf`

_Queue PDF generation for a quotation (customer or internal mode)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "mode": "CUSTOMER",
  "layout_variant": "demo-layout_variant"
}
```

---

### GET `/quotations/{id}/pdf/status`

_List PDF generation task status for a quotation_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/{id}/reject`

_SUBMITTED -> REJECTED (editable again, can be resubmitted)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "comments": "Swagger dummy note"
}
```

---

### GET `/quotations/{id}/revisions`

_List all revisions in this quotation version chain_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/{id}/send`

_APPROVED -> SENT_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/{id}/send-email`

_Email quotation PDF to customer (generates PDF if not yet available)_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "to_email": "customer@example.com",
  "cc_email": "demo@kfw-demo.com",
  "pdf_mode": "CUSTOMER",
  "message": "demo-message"
}
```

---

### POST `/quotations/{id}/submit`

_DRAFT/REJECTED -> SUBMITTED, opens the approval cycle_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/quotations/expire-due`

_Batch-expire quotations past valid_until (cron / internal only)_

**Params (every field)**

```json
[
  {
    "name": "tenant_id",
    "in": "query",
    "required": true,
    "example": "demo-tenant_id"
  },
  {
    "name": "X-Cron-Secret",
    "in": "header",
    "required": true,
    "example": "Welcome@123"
  }
]
```

_No request body._

---

### POST `/quotations/online-quote`

_Public online quote widget — no auth required (Ch.7.5)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "tenant_slug": "kingfisher",
  "job_type": "AIR_EXPORT",
  "customer_id": "00000000-0000-4000-8000-000000000001",
  "contact_email": "john@acme.com",
  "contact_name": "John Smith",
  "origin_port_id": "00000000-0000-4000-8000-000000000001",
  "dest_port_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "demo-commodity",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "special_requirements": "demo-special_requirements",
  "valid_until": "2026-08-31",
  "currency_code": "AED"
}
```

---

### GET `/quotations/reports/analytics`

_Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "salesperson_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "customer_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_type",
    "in": "query",
    "required": false,
    "example": "AIR_EXPORT"
  }
]
```

_No request body._

---

### GET `/quotations/reports/analytics/conversion`

_Win/loss and quote-to-job conversion rates_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "salesperson_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "customer_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_type",
    "in": "query",
    "required": false,
    "example": "AIR_EXPORT"
  }
]
```

_No request body._

---

### GET `/quotations/reports/analytics/lost-reasons`

_Lost quotation breakdown by reason code_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "salesperson_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "customer_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_type",
    "in": "query",
    "required": false,
    "example": "AIR_EXPORT"
  }
]
```

_No request body._

---

### GET `/quotations/reports/analytics/response-time`

_Average hours from creation to submit/send_

**Params (every field)**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "salesperson_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "customer_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_type",
    "in": "query",
    "required": false,
    "example": "AIR_EXPORT"
  }
]
```

_No request body._

---

### GET `/quotations/reports/chargewise`

_"All Quotations Chargewise" report — same filters as the list, with each charge line included_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Matches quotation_number, commodity."
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "DRAFT"
  },
  {
    "name": "job_type",
    "in": "query",
    "required": false,
    "example": "AIR_EXPORT",
    "description": "Service type — Air Export, FCL Export, NVOCC Export, etc."
  },
  {
    "name": "customer_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "Client / customer."
  },
  {
    "name": "salesperson_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "department_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "carrier_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "The quoted carrier (Party)."
  },
  {
    "name": "origin_port_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "dest_port_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "container_type_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "incoterm",
    "in": "query",
    "required": false,
    "example": "demo-incoterm",
    "description": "e.g. FOB, CIF, EXW."
  },
  {
    "name": "created_by",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001",
    "description": "Filter by who created the quotation."
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "demo-from_date"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "demo-to_date"
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---


## Quotations — Online Tariff Master

### GET `/quotations/tariffs`

_List tariff rate cards_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/quotations/tariffs`

_Create a tariff rate card (sale rate + cost rate per lane/service/container type)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "service_type": "AIR_EXPORT",
  "origin_port_id": "00000000-0000-4000-8000-000000000001",
  "dest_port_id": "00000000-0000-4000-8000-000000000001",
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "customer_id": "00000000-0000-4000-8000-000000000001",
  "unit": "Per Container",
  "sale_rate": 850,
  "cost_rate": 620,
  "currency_code": "AED",
  "valid_from": "2026-01-01",
  "valid_to": "2026-12-31",
  "is_active": true
}
```

---

### DELETE `/quotations/tariffs/{id}`

_Soft-delete a tariff_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/quotations/tariffs/{id}`

_Get a tariff by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/quotations/tariffs/{id}`

_Update a tariff_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "service_type": "AIR_EXPORT",
  "origin_port_id": "00000000-0000-4000-8000-000000000001",
  "dest_port_id": "00000000-0000-4000-8000-000000000001",
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "customer_id": "00000000-0000-4000-8000-000000000001",
  "unit": "Per Container",
  "sale_rate": 850,
  "cost_rate": 620,
  "currency_code": "AED",
  "valid_from": "2026-01-01",
  "valid_to": "2026-12-31",
  "is_active": true
}
```

---


## Quotations — Zip Distance Master

### GET `/quotations/zip-distances`

_List zip-to-zip distances_

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Free-text search — matched fields vary per entity."
  },
  {
    "name": "is_active",
    "in": "query",
    "required": false,
    "example": true
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

_No request body._

---

### POST `/quotations/zip-distances`

_Record a distance between two zip/location codes_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

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

---

### DELETE `/quotations/zip-distances/{id}`

_Soft-delete a zip distance record_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/quotations/zip-distances/{id}`

_Get a zip distance record by id_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/quotations/zip-distances/{id}`

_Update a zip distance record_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

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

---


## Search

### GET `/search`

_Global search across jobs, quotations, and parties_

**Params (every field)**

```json
[
  {
    "name": "q",
    "in": "query",
    "required": true,
    "example": "KFW/AE",
    "description": "Free-text search across jobs, quotations, parties, invoices"
  },
  {
    "name": "types",
    "in": "query",
    "required": false,
    "example": "jobs,quotations,parties,invoices",
    "description": "Comma-separated entity types (default: all)"
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "party_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "customer_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "shipper_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "consignee_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "job_type",
    "in": "query",
    "required": false,
    "example": "demo-job_type"
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "demo-status"
  },
  {
    "name": "origin_port_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "dest_port_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "hawb_number",
    "in": "query",
    "required": false,
    "example": "demo-hawb_number"
  },
  {
    "name": "mawb_number",
    "in": "query",
    "required": false,
    "example": "demo-mawb_number"
  },
  {
    "name": "hbl_number",
    "in": "query",
    "required": false,
    "example": "demo-hbl_number"
  },
  {
    "name": "mbl_number",
    "in": "query",
    "required": false,
    "example": "demo-mbl_number"
  },
  {
    "name": "booking_number",
    "in": "query",
    "required": false,
    "example": "demo-booking_number"
  },
  {
    "name": "container_number",
    "in": "query",
    "required": false,
    "example": "demo-container_number"
  },
  {
    "name": "invoice_number",
    "in": "query",
    "required": false,
    "example": "demo-invoice_number"
  },
  {
    "name": "quotation_number",
    "in": "query",
    "required": false,
    "example": "demo-quotation_number"
  },
  {
    "name": "etd_from",
    "in": "query",
    "required": false,
    "example": "demo-etd_from"
  },
  {
    "name": "etd_to",
    "in": "query",
    "required": false,
    "example": "demo-etd_to"
  },
  {
    "name": "eta_from",
    "in": "query",
    "required": false,
    "example": "demo-eta_from"
  },
  {
    "name": "eta_to",
    "in": "query",
    "required": false,
    "example": "demo-eta_to"
  },
  {
    "name": "created_from",
    "in": "query",
    "required": false,
    "example": "demo-created_from"
  },
  {
    "name": "created_to",
    "in": "query",
    "required": false,
    "example": "demo-created_to"
  },
  {
    "name": "salesperson_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "hs_code",
    "in": "query",
    "required": false,
    "example": "KFWD-001"
  }
]
```

_No request body._

---


## Tenants (Super Admin)

### GET `/tenants`

_Get all tenants_

**Params (every field)**

```json
[
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor"
  }
]
```

_No request body._

---

### POST `/tenants`

_Create a new tenant (also provisions its TENANT_ADMIN owner user)_

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "slug": "kfw-demo",
  "code": "KFWD",
  "name": "Kingfisher Demo Freight LLC",
  "display_name": "Kingfisher Demo",
  "password": "Welcome@123",
  "admin_first_name": "Tenant",
  "admin_last_name": "Admin",
  "domain": "demo.kingfisherwings.com",
  "website": "https://kingfisherwings.com",
  "logo_url": "https://kingfisherwings.com/logo.png",
  "primary_color": "#0B3D5C",
  "language": "en",
  "base_currency": "AED",
  "timezone": "Asia/Dubai",
  "country_code": "AE",
  "financial_year_start": 1,
  "vat_number": "100000000000003",
  "cr_number": "CR-1234567",
  "address": "Office 1201, Business Bay, Dubai",
  "city": "Dubai",
  "phone": "+971501234567",
  "email": "admin@kfw-demo.com",
  "company_code": "KFWD",
  "company_name": "Kingfisher Demo Freight LLC",
  "company_legal_name": "Kingfisher Demo Freight LLC",
  "company_registration_number": "REG-998877",
  "subscription_plan": "TRIAL",
  "status": "ACTIVE",
  "trial_ends": "2026-09-14T10:00:00.000Z",
  "subscription_ends": "2026-09-14T10:00:00.000Z",
  "max_users": 1,
  "max_branches": 1,
  "max_storage_gb": 1,
  "is_active": true
}
```

---

### DELETE `/tenants/{id}`

_Soft delete tenant_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/tenants/{id}`

_Get tenant by ID_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/tenants/{id}`

_Update tenant_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{}
```

---

### PATCH `/tenants/{id}/activate`

_Activate tenant_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/tenants/{id}/deactivate`

_Deactivate tenant_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/tenants/{id}/restore`

_Restore tenant_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/tenants/{id}/sync-permissions`

_Reconcile one tenant against the current permission/role catalog_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/tenants/statistics`

_Tenant statistics_

_No path/query params._

_No request body._

---

### POST `/tenants/sync-permissions`

_Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions._

_No path/query params._

_No request body._

---


## untagged

### GET `/health`

_No path/query params._

_No request body._

---


## Users

### GET `/users`

_List users for the current tenant (paginated, filterable)._

**Params (every field)**

```json
[
  {
    "name": "page",
    "in": "query",
    "required": false,
    "example": 1
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 50
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "al noor",
    "description": "Matches first name, last name, email, or phone."
  },
  {
    "name": "role",
    "in": "query",
    "required": false,
    "example": "WAREHOUSE_STAFF"
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "ACTIVE"
  },
  {
    "name": "sortBy",
    "in": "query",
    "required": false,
    "example": "created_at"
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "department_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

_No request body._

---

### POST `/users`

_Create a user. Returns a system-generated temporary password._

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "tenant_id": "00000000-0000-4000-8000-000000000001",
  "email": "ahmed@kingfisherwings.com",
  "first_name": "Ahmed",
  "last_name": "Khan",
  "phone": "+971501234567",
  "preferred_country_code": "AE",
  "avatar_url": "https://kingfisherwings.com/avatar.png",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "role": "WAREHOUSE_STAFF",
  "status": "ACTIVE",
  "is_salesperson": false,
  "is_cs_rep": false,
  "is_operations": false,
  "is_finance": false,
  "can_see_sales": false,
  "can_see_cost": false,
  "can_see_gp": false,
  "can_see_invoices": false,
  "can_see_payments": false,
  "can_see_bank_balances": false,
  "can_see_ar_ap": false,
  "can_see_mgmt_reports": false,
  "can_see_job_pnl": false,
  "allowed_ips": [
    "demo-allowed_ips"
  ],
  "allowed_mac_addresses": [
    "Business Bay, Dubai"
  ],
  "office_hours_start": "09:00",
  "office_hours_end": "18:00",
  "office_hours_timezone": "Asia/Dubai",
  "two_factor_enabled": false,
  "max_concurrent_sessions": 3,
  "role_ids": [
    "00000000-0000-4000-8000-000000000001"
  ],
  "permission_ids": [
    "00000000-0000-4000-8000-000000000001"
  ]
}
```

---

### DELETE `/users/{id}`

_Soft-delete a user._

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### GET `/users/{id}`

_Get a single user by id._

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/users/{id}`

_Update a user._

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "tenant_id": "00000000-0000-4000-8000-000000000001",
  "email": "ahmed@kingfisherwings.com",
  "first_name": "Ahmed",
  "last_name": "Khan",
  "phone": "+971501234567",
  "preferred_country_code": "AE",
  "avatar_url": "https://kingfisherwings.com/avatar.png",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "role": "WAREHOUSE_STAFF",
  "status": "ACTIVE",
  "is_salesperson": false,
  "is_cs_rep": false,
  "is_operations": false,
  "is_finance": false,
  "can_see_sales": false,
  "can_see_cost": false,
  "can_see_gp": false,
  "can_see_invoices": false,
  "can_see_payments": false,
  "can_see_bank_balances": false,
  "can_see_ar_ap": false,
  "can_see_mgmt_reports": false,
  "can_see_job_pnl": false,
  "allowed_ips": [
    "demo-allowed_ips"
  ],
  "allowed_mac_addresses": [
    "Business Bay, Dubai"
  ],
  "office_hours_start": "09:00",
  "office_hours_end": "18:00",
  "office_hours_timezone": "Asia/Dubai",
  "two_factor_enabled": false,
  "max_concurrent_sessions": 3,
  "role_ids": [
    "00000000-0000-4000-8000-000000000001"
  ],
  "permission_ids": [
    "00000000-0000-4000-8000-000000000001"
  ],
  "single_device_login": true,
  "single_device_policy": "TERMINATE_OLDEST"
}
```

---

### POST `/users/{id}/admin-reset-password`

_Admin resets a target user's password to a new temporary password._

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "require_password_change": true,
  "send_email": false
}
```

---

### POST `/users/{id}/force-logout`

_Force-logout: revoke a target user's active sessions on all devices._

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### POST `/users/{id}/restore`

_Restore a soft-deleted user._

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

_No request body._

---

### PATCH `/users/{id}/status`

_Change a user's status (activate, suspend, etc)._

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "status": "ACTIVE",
  "reason": "demo-reason"
}
```

---

### POST `/users/bulk`

_Apply an action (activate/deactivate/suspend/delete/restore) to multiple users._

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "ids": [
    "00000000-0000-4000-8000-000000000001"
  ],
  "action": "ACTIVATE"
}
```

---

### POST `/users/me/change-password`

_Authenticated user changes their own password._

Content-Type: `application/json`

_No path/query params._

**Body (every field)**

```json
{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

---


## Vessels — Schedules

### GET `/vessels/{id}/schedules`

_List vessel voyage schedules (filter by ETD/ETA)_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "etd_from",
    "in": "query",
    "required": false,
    "example": "demo-etd_from",
    "description": "Filter schedules with ETD on/after this date"
  },
  {
    "name": "etd_to",
    "in": "query",
    "required": false,
    "example": "demo-etd_to",
    "description": "Filter schedules with ETD on/before this date"
  },
  {
    "name": "eta_from",
    "in": "query",
    "required": false,
    "example": "demo-eta_from",
    "description": "Filter schedules with ETA on/after this date"
  },
  {
    "name": "eta_to",
    "in": "query",
    "required": false,
    "example": "demo-eta_to",
    "description": "Filter schedules with ETA on/before this date"
  },
  {
    "name": "voyage_number",
    "in": "query",
    "required": false,
    "example": "demo-voyage_number"
  }
]
```

_No request body._

---

### POST `/vessels/{id}/schedules`

_Create a vessel voyage schedule_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  }
]
```

**Body (every field)**

```json
{
  "voyage_number": "demo-voyage_number",
  "shipping_line_id": "00000000-0000-4000-8000-000000000001",
  "pol_id": "00000000-0000-4000-8000-000000000001",
  "pod_id": "00000000-0000-4000-8000-000000000001",
  "etd": "demo-etd",
  "eta": "demo-eta",
  "is_active": true,
  "remarks": "Swagger dummy note"
}
```

---

### DELETE `/vessels/{id}/schedules/{scheduleId}`

_Soft-delete a vessel voyage schedule_

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "scheduleId",
    "in": "path",
    "required": true,
    "example": "demo-scheduleid"
  }
]
```

_No request body._

---

### PATCH `/vessels/{id}/schedules/{scheduleId}`

_Update a vessel voyage schedule_

Content-Type: `application/json`

**Params (every field)**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "demo-id"
  },
  {
    "name": "scheduleId",
    "in": "path",
    "required": true,
    "example": "demo-scheduleid"
  }
]
```

**Body (every field)**

```json
{
  "voyage_number": "demo-voyage_number",
  "shipping_line_id": "00000000-0000-4000-8000-000000000001",
  "pol_id": "00000000-0000-4000-8000-000000000001",
  "pod_id": "00000000-0000-4000-8000-000000000001",
  "etd": "demo-etd",
  "eta": "demo-eta",
  "is_active": true,
  "remarks": "Swagger dummy note"
}
```

---

