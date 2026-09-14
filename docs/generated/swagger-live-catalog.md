# Live Swagger endpoint catalog (auto-generated)

Base: `https://kingfisherwings-backend.onrender.com`

Operations: **441**

> Schema-derived examples — replace UUIDs with IDs from your sequence. Password fields use `Welcome@123`.


## Auth

### POST `/auth/2fa/disable`

_Disable 2FA (password + optional TOTP/backup code)_

**Body**

```json
{
  "password": "Welcome@123",
  "code": "string"
}
```

### POST `/auth/2fa/enable`

_Enable 2FA after verifying a TOTP code from the authenticator app_

**Body**

```json
{
  "code": "123456"
}
```

### POST `/auth/2fa/setup`

_Generate TOTP secret + QR for the current user_

### POST `/auth/accept-invite`

_Accept invite token and set password_

**Body**

```json
{
  "token": "string",
  "password": "Welcome@123",
  "first_name": "string",
  "last_name": "string"
}
```

### POST `/auth/change-password`

_Change the authenticated user password_

**Body**

```json
{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```

### POST `/auth/invite`

_Send invite email with accept token for an INVITED user_

**Body**

```json
{
  "user_id": "00000000-0000-4000-8000-000000000001",
  "email": "string"
}
```

### POST `/auth/login`

_Staff login: tenant slug + email + password_

**Body**

```json
{
  "mac_address": "string",
  "totp_code": "string",
  "backup_code": "string",
  "tenant_slug": "string",
  "email": "string",
  "password": "string",
  "remember_me": true,
  "device_name": "string"
}
```

### POST `/auth/logout`

_Revoke the current session_

### POST `/auth/logout-all`

_Log out of every device (revokes all active sessions)_

### GET `/auth/me`

_Get the authenticated principal (user, tenant owner, or super admin)_

### PATCH `/auth/me`

_Update own profile after login (preferred country, phone, locale)_

**Body**

```json
{
  "preferred_country_code": "AE",
  "phone": "+971501234567",
  "avatar_url": "string",
  "locale": "en"
}
```

### POST `/auth/refresh`

_Exchange a refresh token for a new token pair_

**Body**

```json
{
  "refresh_token": "string"
}
```

### GET `/auth/sessions`

_List the authenticated user's own active sessions_

### POST `/auth/sessions/{sessionId}/revoke`

_Revoke one of the authenticated user's own sessions_

**Params**

```json
[
  {
    "name": "sessionId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/auth/super-admin/login`

_Platform super admin login_

**Body**

```json
{
  "email": "string",
  "password": "string"
}
```

### POST `/auth/super-admin/signup`

_Platform super admin self-registration_

**Body**

```json
{
  "email": "string",
  "password": "Welcome@123",
  "first_name": "string",
  "last_name": "string"
}
```

### POST `/auth/tenant-login`

_Tenant admin login: tenant slug + the tenant's own password_

**Body**

```json
{
  "tenant_slug": "string",
  "password": "Welcome@123",
  "remember_me": true,
  "device_name": "string"
}
```

### POST `/auth/tenant/change-password`

_Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only._

**Body**

```json
{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```


## AWB Stock

### GET `/awb-stock/allocations`

_List AWB allocations_

**Params**

```json
[
  {
    "name": "airline_id",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/awb-stock/allocations/{id}/mark-used`

_Mark an allocated AWB as used (flown/printed)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/awb-stock/allocations/{id}/void`

_Void an allocated (unused) AWB number_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "void_reason": "string"
}
```

### GET `/awb-stock/batches`

_List AWB stock batches_

**Params**

```json
[
  {
    "name": "airline_id",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "branch_id",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "job_id",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/awb-stock/batches`

_Register a new AWB number range for an airline_

**Body**

```json
{
  "airline_id": "string",
  "branch_id": "string",
  "prefix": "176",
  "range_from": 12345670,
  "range_to": 12345699,
  "low_stock_threshold": 10,
  "notes": "string"
}
```

### DELETE `/awb-stock/batches/{id}`

_Soft-delete an empty AWB stock batch_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/awb-stock/batches/{id}`

_Get an AWB stock batch with recent allocations_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/awb-stock/batches/{id}`

_Update batch metadata (threshold, notes)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "low_stock_threshold": 1,
  "notes": "string"
}
```

### POST `/awb-stock/batches/{id}/allocate`

_Allocate the next AWB number from a batch to a job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "job_id": "string"
}
```

### POST `/awb-stock/batches/{id}/transfer-branch`

_Transfer batch ownership to another branch_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "branch_id": "string"
}
```

### GET `/awb-stock/reports/low-stock`

_Batches at or below their low-stock threshold_


## Companies

### GET `/companies`

_List this tenant's companies (usually just the one default, more for multi-entity groups)_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/companies`

_Register an additional company under this tenant (multi-entity groups)_

**Body**

```json
{
  "code": "OCE-DXB",
  "name": "Oceanic Freight Forwarders (Abu Dhabi Branch) LLC",
  "legal_name": "string",
  "registration_number": "string",
  "vat_number": "string",
  "address": "string",
  "city": "string",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "string",
  "is_default": false,
  "is_active": true
}
```

### DELETE `/companies/{id}`

_Soft-delete a company (blocked if it is the only one, or currently default)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/companies/{id}`

_Get a company by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/companies/{id}`

_Update a company_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "code": "OCE-DXB",
  "name": "Oceanic Freight Forwarders (Abu Dhabi Branch) LLC",
  "legal_name": "string",
  "registration_number": "string",
  "vat_number": "string",
  "address": "string",
  "city": "string",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "string",
  "is_default": false,
  "is_active": true
}
```


## Credit Notes

### GET `/credit-notes`

_List credit notes_

**Params**

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
    "example": 20
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
    "example": "string"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/credit-notes`

_Create a credit note against a posted customer invoice_

**Body**

```json
{
  "credited_invoice_id": "00000000-0000-4000-8000-000000000001",
  "remarks": "string",
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

### GET `/credit-notes/{id}`

_Get a credit note_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/credit-notes/{id}/post`

_Post a draft credit note_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```


## Debit Notes

### GET `/debit-notes`

_List debit notes_

**Params**

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
    "example": 20
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
    "example": "string"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/debit-notes`

_Create a debit note against a posted customer invoice (extra charge)_

**Body**

```json
{
  "credited_invoice_id": "00000000-0000-4000-8000-000000000001",
  "remarks": "string",
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

### GET `/debit-notes/{id}`

_Get a debit note_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/debit-notes/{id}/post`

_Post a draft debit note_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```


## Files

### GET `/files/{tenantId}/{filename}`

_Download a locally stored file (PDFs generated by the system)_

**Params**

```json
[
  {
    "name": "tenantId",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "filename",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```


## GL — AR / AP Aging

### GET `/gl/ap/aging`

_Accounts Payable aging buckets (Ch.19.2)_

**Params**

```json
[
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/gl/ap/statement/{partyId}`

_Vendor AP statement (purchase invoices + payments)_

**Params**

```json
[
  {
    "name": "partyId",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/gl/ar/aging`

_Accounts Receivable aging buckets (Ch.19.1)_

**Params**

```json
[
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/gl/ar/statement/{partyId}`

_Customer AR statement (invoices + receipts)_

**Params**

```json
[
  {
    "name": "partyId",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "string"
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


## GL — Bank Reconciliation

### GET `/gl/bank-reconciliations`

_List bank reconciliations_

**Params**

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

### POST `/gl/bank-reconciliations`

_Start a draft bank reconciliation_

**Body**

```json
{
  "gl_account_id": "00000000-0000-4000-8000-000000000001",
  "statement_date": "string",
  "statement_balance": 125000.5,
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "remarks": "string"
}
```

### DELETE `/gl/bank-reconciliations/{id}`

_Cancel / soft-delete a draft reconciliation_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/gl/bank-reconciliations/{id}`

_Get bank reconciliation with lines + summary_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/gl/bank-reconciliations/{id}`

_Update draft bank reconciliation header_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "statement_date": "string",
  "statement_balance": 1,
  "remarks": "string"
}
```

### POST `/gl/bank-reconciliations/{id}/complete`

_Complete bank reconciliation_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/gl/bank-reconciliations/{id}/lines`

_Add a matched / statement line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "voucher_id": "00000000-0000-4000-8000-000000000001",
  "voucher_line_id": "00000000-0000-4000-8000-000000000001",
  "account_id": "00000000-0000-4000-8000-000000000001",
  "txn_date": "string",
  "description": "string",
  "debit_amount": 0,
  "credit_amount": 0,
  "is_matched": true,
  "statement_ref": "string"
}
```

### DELETE `/gl/bank-reconciliations/{id}/lines/{lineId}`

_Remove a recon line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/gl/bank-reconciliations/{id}/lines/{lineId}`

_Update recon line match flags_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "is_matched": true,
  "statement_ref": "string",
  "description": "string"
}
```

### GET `/gl/bank-reconciliations/{id}/unmatched`

_Posted bank GL lines not yet matched on this recon_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/gl/bank-transfers`

_Post a contra bank/cash transfer voucher (Ch.19.3)_

**Body**

```json
{
  "from_account_id": "00000000-0000-4000-8000-000000000001",
  "to_account_id": "00000000-0000-4000-8000-000000000001",
  "amount": 1000,
  "currency_code": "AED",
  "exchange_rate": 1,
  "transfer_date": "string",
  "narration": "string",
  "reference_number": "string",
  "company_id": "00000000-0000-4000-8000-000000000001"
}
```


## GL — Chart of Accounts

### GET `/gl/accounts`

_List chart of accounts (Ch.17)_

**Params**

```json
[
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/gl/accounts`

_Create a GL account_

**Body**

```json
{
  "account_code": "1100",
  "account_name": "Trade Receivables",
  "account_name_ar": "string",
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
  "notes": "string"
}
```

### DELETE `/gl/accounts/{id}`

_Soft-delete a GL account (blocked if used on voucher lines)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/gl/accounts/{id}`

_Get account by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/gl/accounts/{id}`

_Update a GL account_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "account_code": "1100",
  "account_name": "Trade Receivables",
  "account_name_ar": "string",
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
  "notes": "string"
}
```

### GET `/gl/accounts/{id}/ledger`

_GL register for one account (posted vouchers)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### GET `/gl/accounts/reports/trial-balance`

_Trial balance from posted voucher lines + opening balances_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "hide_zero",
    "in": "query",
    "required": false,
    "example": true
  }
]
```

### POST `/gl/accounts/seed-defaults`

_Seed a starter freight COA (only when empty)_

### GET `/gl/accounts/tree`

_Hierarchical chart of accounts tree_


## GL — Cheques / PDC

### GET `/gl/cheques`

_List cheques (receivable / payable / PDC)_

**Params**

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
    "example": "string"
  }
]
```

### POST `/gl/cheques`

_Register a cheque / PDC_

**Body**

```json
{
  "cheque_number": "CHK-1001",
  "cheque_type": "RECEIVABLE",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 5000,
  "currency_code": "AED",
  "cheque_date": "string",
  "due_date": "string",
  "is_pdc": false,
  "company_id": "00000000-0000-4000-8000-000000000001",
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "bank_name": "string",
  "remarks": "string"
}
```

### GET `/gl/cheques/{id}`

_Get cheque by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/gl/cheques/{id}`

_Update a pending cheque_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "cheque_number": "CHK-1001",
  "cheque_type": "RECEIVABLE",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 5000,
  "currency_code": "AED",
  "cheque_date": "string",
  "due_date": "string",
  "is_pdc": false,
  "company_id": "00000000-0000-4000-8000-000000000001",
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "bank_name": "string",
  "remarks": "string"
}
```

### POST `/gl/cheques/{id}/bounce`

_Mark cheque bounced_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "reason": "string"
}
```

### POST `/gl/cheques/{id}/cancel`

_Cancel a cheque_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/gl/cheques/{id}/clear`

_Mark cheque cleared_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/gl/cheques/{id}/deposit`

_Mark cheque deposited_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/gl/cheques/reports/pdc-due`

_PDC due within N days (default 30)_

**Params**

```json
[
  {
    "name": "within_days",
    "in": "query",
    "required": false,
    "example": 1
  }
]
```


## GL — Financial Reports

### GET `/gl/reports/balance-sheet`

_Balance Sheet as of a date (Ch.20.1 / Week 12)_

**Params**

```json
[
  {
    "name": "as_of",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/gl/reports/cash-flow`

_Cash Flow from bank/cash voucher activity (Ch.20.1 / Week 12)_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/gl/reports/profit-and-loss`

_Profit & Loss for a period (Ch.20.1 / Week 12)_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/gl/reports/trial-balance`

_Trial balance (Ch.20.1) — also available at GET /gl/accounts/reports/trial-balance_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "hide_zero",
    "in": "query",
    "required": false,
    "example": true
  }
]
```

### GET `/gl/reports/vat-return`

_UAE VAT return draft from posted invoices (Ch.20.2 / Week 12)_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": true,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": true,
    "example": "string"
  },
  {
    "name": "company_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```


## GL — MIS Dashboard

### GET `/gl/mis/dashboard`

_Management MIS dashboard widgets (Ch.23 / Week 12)_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/gl/mis/operational`

_Operational KPIs — pending PRs, draft invoices, uninvoiced charges_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/gl/mis/profitability`

_Job profitability by shipper / job_type / branch / salesperson (Ch.23)_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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


## GL — My Reports

### GET `/gl/saved-reports`

_List saved / shared report configurations (Ch.23 My Reports)_

**Params**

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

### POST `/gl/saved-reports`

_Save a report configuration (filters + type)_

**Body**

```json
{
  "name": "Monthly P&L — June",
  "report_type": "BALANCE_SHEET",
  "description": "string",
  "filters": {},
  "company_id": "00000000-0000-4000-8000-000000000001",
  "is_shared": false
}
```

### DELETE `/gl/saved-reports/{id}`

_Soft-delete a saved report_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/gl/saved-reports/{id}`

_Get a saved report by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/gl/saved-reports/{id}`

_Update a saved report_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "name": "Monthly P&L — June",
  "report_type": "BALANCE_SHEET",
  "description": "string",
  "filters": {},
  "company_id": "00000000-0000-4000-8000-000000000001",
  "is_shared": false
}
```


## GL — Payments (AR/AP)

### GET `/gl/payments`

_List customer receipts and vendor payments (Ch.19)_

**Params**

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
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/gl/payments`

_Create a draft receipt or vendor payment_

**Body**

```json
{
  "direction": "RECEIPT",
  "payment_method": "CASH",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 1500,
  "currency_code": "AED",
  "exchange_rate": 1,
  "payment_date": "string",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "gl_account_id": "00000000-0000-4000-8000-000000000001",
  "reference_number": "string",
  "narration": "string",
  "allocations": [
    {
      "invoice_id": "00000000-0000-4000-8000-000000000001",
      "amount": 1000
    }
  ],
  "cheque_number": "string",
  "cheque_date": "string",
  "cheque_due_date": "string",
  "cheque_bank_name": "string",
  "is_pdc": false
}
```

### DELETE `/gl/payments/{id}`

_Soft-delete a draft payment_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/gl/payments/{id}`

_Get payment with allocations_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/gl/payments/{id}`

_Update a draft payment header_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "direction": "RECEIPT",
  "payment_method": "CASH",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 1500,
  "currency_code": "AED",
  "exchange_rate": 1,
  "payment_date": "string",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "bank_account_id": "00000000-0000-4000-8000-000000000001",
  "gl_account_id": "00000000-0000-4000-8000-000000000001",
  "reference_number": "string",
  "narration": "string",
  "allocations": [
    {
      "invoice_id": "00000000-0000-4000-8000-000000000001",
      "amount": 1000
    }
  ],
  "cheque_number": "string",
  "cheque_date": "string",
  "cheque_due_date": "string",
  "cheque_bank_name": "string",
  "is_pdc": false
}
```

### POST `/gl/payments/{id}/allocations`

_Allocate payment amount to an open invoice_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "invoice_id": "00000000-0000-4000-8000-000000000001",
  "amount": 1000
}
```

### DELETE `/gl/payments/{id}/allocations/{allocationId}`

_Remove a draft payment allocation_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "allocationId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/gl/payments/{id}/cancel`

_Cancel payment (reverses invoice balances and GL if posted)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/gl/payments/{id}/post`

_Post payment: update invoice balances + create GL voucher_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```


## GL — Vouchers

### GET `/gl/vouchers`

_List vouchers (Ch.17)_

**Params**

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
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/gl/vouchers`

_Create a draft voucher (optionally with lines)_

**Body**

```json
{
  "voucher_type": "JOURNAL",
  "currency_code": "AED",
  "exchange_rate": 1,
  "voucher_date": "string",
  "narration": "string",
  "reference_number": "string",
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
      "currency_code": "string",
      "exchange_rate": 1,
      "narration": "string",
      "party_id": "00000000-0000-4000-8000-000000000001",
      "job_id": "00000000-0000-4000-8000-000000000001",
      "cost_center": "string"
    }
  ]
}
```

### DELETE `/gl/vouchers/{id}`

_Soft-delete a draft voucher_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/gl/vouchers/{id}`

_Get voucher with lines_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/gl/vouchers/{id}`

_Update draft voucher header_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "voucher_type": "JOURNAL",
  "currency_code": "AED",
  "exchange_rate": 1,
  "voucher_date": "string",
  "narration": "string",
  "reference_number": "string",
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
      "currency_code": "string",
      "exchange_rate": 1,
      "narration": "string",
      "party_id": "00000000-0000-4000-8000-000000000001",
      "job_id": "00000000-0000-4000-8000-000000000001",
      "cost_center": "string"
    }
  ]
}
```

### POST `/gl/vouchers/{id}/lines`

_Add a line to a draft voucher_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "account_id": "00000000-0000-4000-8000-000000000001",
  "debit_amount": 0,
  "credit_amount": 0,
  "currency_code": "string",
  "exchange_rate": 1,
  "narration": "string",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "cost_center": "string"
}
```

### DELETE `/gl/vouchers/{id}/lines/{lineId}`

_Remove a line from a draft voucher_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/gl/vouchers/{id}/lines/{lineId}`

_Update a draft voucher line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "account_id": "00000000-0000-4000-8000-000000000001",
  "debit_amount": 0,
  "credit_amount": 0,
  "currency_code": "string",
  "exchange_rate": 1,
  "narration": "string",
  "party_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "cost_center": "string"
}
```

### POST `/gl/vouchers/{id}/post`

_Post a balanced draft voucher to the GL_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/gl/vouchers/{id}/reverse`

_Create an offsetting posted reversal voucher_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```


## Invoices

### GET `/invoices`

_List customer invoices (Ch.18)_

**Params**

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
    "example": 20
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
    "example": "string"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/invoices`

_Create a draft customer invoice_

**Body**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "currency_code": "AED",
  "exchange_rate": 1,
  "vat_rate": 5,
  "invoice_date": "string",
  "due_date": "string",
  "lpo_number": "string",
  "remarks": "string",
  "internal_notes": "string",
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

### DELETE `/invoices/{id}`

_Soft-delete a draft invoice_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/invoices/{id}`

_Get invoice with lines_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/invoices/{id}`

_Update a draft invoice header_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "currency_code": "AED",
  "exchange_rate": 1,
  "vat_rate": 5,
  "invoice_date": "string",
  "due_date": "string",
  "lpo_number": "string",
  "remarks": "string",
  "internal_notes": "string",
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

### POST `/invoices/{id}/cancel`

_Cancel an invoice_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/invoices/{id}/lines`

_Add a line to a draft invoice_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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

### DELETE `/invoices/{id}/lines/{lineId}`

_Remove an invoice line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/invoices/{id}/lines/{lineId}`

_Update an invoice line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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

### GET `/invoices/{id}/pdf`

_Get invoice PDF metadata_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/invoices/{id}/pdf`

_Generate invoice PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/invoices/{id}/post`

_Post a draft invoice (DRAFT -> POSTED)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/invoices/{id}/send`

_Email invoice PDF to customer_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "to_email": "customer@example.com",
  "message": "string"
}
```

### POST `/invoices/from-job/{jobId}`

_Create draft invoice from uninvoiced billable job charges_

**Params**

```json
[
  {
    "name": "jobId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/invoices/reports/overdue`

_Overdue customer invoices past due_date with outstanding balance_


## Jobs

### GET `/jobs`

_List jobs_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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
    "example": true
  },
  {
    "name": "parent_job_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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
    "example": "string"
  },
  {
    "name": "vessel_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "shipping_line_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "voyage_number",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "container_type_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  }
]
```

### POST `/jobs`

_Create a job (booking). AIR_EXPORT auto-seeds 15 milestones; SEA_FCL_EXPORT auto-seeds 16 FCL milestones + sea_fcl_details. Set parent_job_id for a HOUSE job._

**Body**

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
  "commodity": "string",
  "hs_code": "string",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_count": 1,
  "incoterms": "string",
  "is_dg": false,
  "dg_class": "string",
  "notes": "string",
  "customer_remarks": "string",
  "tags": [
    "string"
  ],
  "etd": "string",
  "eta": "string"
}
```

### DELETE `/jobs/{id}`

_Soft-delete a completed or cancelled job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/jobs/{id}`

_Get a job with air details, charges, milestones, and its house jobs (if a master)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}`

_Update a job (not allowed once COMPLETED or CANCELLED)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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
  "commodity": "string",
  "hs_code": "string",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_count": 1,
  "incoterms": "string",
  "is_dg": false,
  "dg_class": "string",
  "notes": "string",
  "customer_remarks": "string",
  "tags": [
    "string"
  ],
  "etd": "string",
  "eta": "string"
}
```

### PATCH `/jobs/{id}/air-details`

_Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "airline_id": "00000000-0000-4000-8000-000000000001",
  "origin_airport_id": "00000000-0000-4000-8000-000000000001",
  "dest_airport_id": "00000000-0000-4000-8000-000000000001",
  "hawb_number": "string",
  "mawb_number": "string",
  "flight_number": "string",
  "flight_date": "string",
  "screened": false,
  "screening_ref": "string",
  "awb_type": "Direct",
  "freight_type": "Prepaid",
  "conversion_factor": 167
}
```

### GET `/jobs/{id}/bills-of-lading`

_List bills of lading on a Sea FCL job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/bills-of-lading`

_Create a bill of lading data record (PDF variants are Week 8)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "bl_type": "HBL",
  "bl_number": "string",
  "shipper_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "notify_id": "00000000-0000-4000-8000-000000000001",
  "pol": "string",
  "pod": "string",
  "place_of_receipt": "string",
  "place_of_delivery": "string",
  "vessel_name": "string",
  "voyage_number": "string",
  "etd": "string",
  "eta": "string",
  "description_of_goods": "string",
  "marks_numbers": "string",
  "packages": 1,
  "gross_weight": 1,
  "measurement": 1,
  "freight_payable_at": "string",
  "freight_terms": "string",
  "number_of_originals": 3,
  "bl_conditions": "string",
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "paired_bl_id": "00000000-0000-4000-8000-000000000001",
  "is_draft": true,
  "is_original": false,
  "is_surrendered": false,
  "is_express_release": false
}
```

### DELETE `/jobs/{id}/bills-of-lading/{blId}`

_Soft-delete a bill of lading_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "blId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/bills-of-lading/{blId}`

_Update a bill of lading (draft → original / surrendered flags)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "blId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "bl_type": "HBL",
  "bl_number": "string",
  "shipper_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "notify_id": "00000000-0000-4000-8000-000000000001",
  "pol": "string",
  "pod": "string",
  "place_of_receipt": "string",
  "place_of_delivery": "string",
  "vessel_name": "string",
  "voyage_number": "string",
  "etd": "string",
  "eta": "string",
  "description_of_goods": "string",
  "marks_numbers": "string",
  "packages": 1,
  "gross_weight": 1,
  "measurement": 1,
  "freight_payable_at": "string",
  "freight_terms": "string",
  "number_of_originals": 3,
  "bl_conditions": "string",
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "paired_bl_id": "00000000-0000-4000-8000-000000000001",
  "is_draft": true,
  "is_original": false,
  "is_surrendered": false,
  "is_express_release": false
}
```

### POST `/jobs/{id}/cancel`

_Cancel a job (status -> CANCELLED)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/jobs/{id}/cargo`

_List FCL cargo lines on a job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/cargo`

_Add an FCL cargo line (optionally assigned to a container)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "string",
  "hs_code": "string",
  "description": "string",
  "marks_numbers": "string",
  "packages": 1,
  "gross_weight": 1,
  "measurement": 1
}
```

### DELETE `/jobs/{id}/cargo/{cargoId}`

_Remove an FCL cargo line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "cargoId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/cargo/{cargoId}`

_Update an FCL cargo line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "cargoId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "string",
  "hs_code": "string",
  "description": "string",
  "marks_numbers": "string",
  "packages": 1,
  "gross_weight": 1,
  "measurement": 1
}
```

### POST `/jobs/{id}/cfs-storage/calculate`

_Calculate CFS storage: days × rate_per_day from sea-fcl-details_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "as_of_date": "string"
}
```

### POST `/jobs/{id}/charges`

_Add a charge line — Job P&L recalculates automatically_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "description": "Ocean Freight",
  "quantity": 1,
  "unit_price": 850,
  "currency_code": "AED",
  "exchange_rate": 1,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_cost": false,
  "is_provisional": false,
  "is_billable": true,
  "party_id": "00000000-0000-4000-8000-000000000001"
}
```

### DELETE `/jobs/{id}/charges/{chargeId}`

_Remove a charge line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "chargeId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/charges/{chargeId}`

_Update a charge line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "chargeId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "description": "Ocean Freight",
  "quantity": 1,
  "unit_price": 850,
  "currency_code": "AED",
  "exchange_rate": 1,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_cost": false,
  "is_provisional": false,
  "is_billable": true,
  "party_id": "00000000-0000-4000-8000-000000000001"
}
```

### POST `/jobs/{id}/close`

_Close a job (status -> COMPLETED)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/jobs/{id}/containers`

_List containers on a Sea FCL job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/containers`

_Add a container to a Sea FCL job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_number": "string",
  "seal_number": "string",
  "tare_weight": 1,
  "max_payload": 1,
  "cubic_capacity": 1,
  "gross_weight": 1,
  "vgm_weight": 1,
  "cbm": 1,
  "status": "EMPTY",
  "gate_in_at": "string",
  "is_soc": false
}
```

### DELETE `/jobs/{id}/containers/{containerId}`

_Remove a container from a Sea FCL job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/containers/{containerId}`

_Update a container on a Sea FCL job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_number": "string",
  "seal_number": "string",
  "tare_weight": 1,
  "max_payload": 1,
  "cubic_capacity": 1,
  "gross_weight": 1,
  "vgm_weight": 1,
  "cbm": 1,
  "status": "EMPTY",
  "gate_in_at": "string",
  "is_soc": false
}
```

### POST `/jobs/{id}/containers/{containerId}/cargo`

_Assign an existing cargo line to a container_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "cargo_id": "00000000-0000-4000-8000-000000000001"
}
```

### GET `/jobs/{id}/containers/{containerId}/fill`

_Container fill indicator for one container_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/containers/{containerId}/return`

_Record container return to shipping line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "returned_at": "string",
  "return_condition": "string"
}
```

### POST `/jobs/{id}/containers/{containerId}/split`

_Split one container across multiple house consignees (co-loading)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "containerId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "portions": [
    {
      "consignee_id": "00000000-0000-4000-8000-000000000001",
      "packages": 1,
      "gross_weight": 1,
      "measurement": 1,
      "commodity": "string",
      "marks_numbers": "string"
    }
  ]
}
```

### GET `/jobs/{id}/containers/fill`

_Container fill indicators — weight % and CBM % for all containers_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/customs-status`

_Update customs clearance workflow (PENDING→FILED→QUERY→CLEARED→RELEASED)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "customs_status": "PENDING",
  "customs_clearance_date": "string"
}
```

### GET `/jobs/{id}/cutoffs`

_SI / VGM / CY cutoff traffic-light status (green / amber ≤24h / red past)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/jobs/{id}/damage-reports`

_List damage reports_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/damage-reports`

_Create a damage report (description + photo URLs + survey #)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "damage_description": "string",
  "photo_urls": [
    "string"
  ],
  "survey_report_number": "string",
  "reported_at": "string"
}
```

### GET `/jobs/{id}/deposits`

_List customs / port deposits with expiry alert bands_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/deposits`

_Create a customs or port deposit record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "deposit_type": "CUSTOMS",
  "deposit_amount": 1,
  "currency_code": "AED",
  "deposit_receipt_number": "string",
  "deposit_expiry_date": "string",
  "remarks": "string"
}
```

### DELETE `/jobs/{id}/deposits/{depositId}`

_Soft-delete a deposit_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "depositId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/deposits/{depositId}`

_Update a deposit_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "depositId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "deposit_type": "CUSTOMS",
  "deposit_amount": 1,
  "currency_code": "AED",
  "deposit_receipt_number": "string",
  "deposit_expiry_date": "string",
  "remarks": "string"
}
```

### GET `/jobs/{id}/documents`

_List documents attached to a job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/documents`

_Register a document on a job (metadata + file URL)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "document_type": "HAWB",
  "file_name": "HAWB-KFW-AE-001.pdf",
  "file_url": "string",
  "reference_number": "string",
  "s3_key": "string",
  "file_size": 1,
  "mime_type": "string"
}
```

### DELETE `/jobs/{id}/documents/{documentId}`

_Remove a draft document_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "documentId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/documents/{documentId}`

_Update a draft document metadata_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "documentId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "document_type": "HAWB",
  "file_name": "HAWB-KFW-AE-001.pdf",
  "file_url": "string",
  "reference_number": "string",
  "s3_key": "string",
  "file_size": 1,
  "mime_type": "string"
}
```

### POST `/jobs/{id}/documents/{documentId}/finalize`

_Finalize a document (DRAFT -> ORIGINAL, locked)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "documentId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "is_finalized": true
}
```

### POST `/jobs/{id}/documents/back-to-back-bl`

_Queue Back-to-Back BL PDF (master + house pair)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/barcode-label`

_Queue barcode label PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/can`

_Queue Cargo Arrival Notice (CAN) PDF and mark CAN_SENT_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/cargo-manifest`

_Queue cargo manifest PDF generation_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/consignee-label`

_Queue consignee label PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/delivery-order`

_Queue Delivery Order PDF and mark DO_ISSUED_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/e-awb`

_Queue E-AWB PDF generation_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/exchange-letter`

_Queue Exchange Letter PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/fiata-bl`

_Queue FIATA FBL PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/freight-certificate`

_Queue freight certificate PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/freight-manifest`

_Queue Freight Manifest PDF (FCL)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### GET `/jobs/{id}/documents/generation-status`

_List async document generation tasks for a job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/documents/hawb`

_Queue HAWB PDF generation (Puppeteer + BullMQ)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/hbl`

_Queue HBL draft/original PDF (layout_variant: STANDARD | LAYOUT_A | LAYOUT_B)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/hbl-express-release`

_Queue Non-Negotiable HBL Express/Telex Release PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/job-card`

_Queue Job Card PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/job-costing`

_Queue job costing sheet PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/job-pnl`

_Queue Job P&L Statement PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/mawb`

_Queue MAWB PDF generation (Puppeteer + BullMQ)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/mbl`

_Queue Master BL / OBL PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/pre-alert`

_Queue pre-alert document PDF generation_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/pre-can`

_Queue Pre-CAN (pre-arrival notice) PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/proforma-invoice`

_Queue Proforma Invoice PDF for the job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/proof-of-delivery`

_Queue Proof of Delivery PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/proxy-bl`

_Queue Proxy BL PDF (proxy_forwarder_name / address)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/rider-bl`

_Queue Rider/Addendum to BL PDF (pass rider_terms)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/sailing-confirmation`

_Queue Sailing Confirmation PDF (uses sailed_at / vessel sailed milestone)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/shipping-advice`

_Queue Shipping Advice PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/si`

_Queue Shipping Instruction (SI) PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/stuffing-report`

_Queue Stuffing Report PDF from stuffing records + containers_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/surrender-notice`

_Queue BL Surrender Notice PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/switch-bl`

_Queue Switch BL PDF (switched_from_bl_number + switch consignee/notify)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/transhipment-confirmation`

_Queue Transhipment Confirmation PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/transport-request`

_Queue Transport Request PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### POST `/jobs/{id}/documents/undertake-letter`

_Queue Undertake Letter PDF_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "layout_variant": "string",
  "is_original": false,
  "bl_id": "string",
  "number_of_originals": 3,
  "rider_terms": "string",
  "switched_from_bl_number": "string",
  "switch_consignee_id": "00000000-0000-4000-8000-000000000001",
  "switch_notify_id": "00000000-0000-4000-8000-000000000001",
  "proxy_forwarder_name": "string",
  "proxy_forwarder_address": "string",
  "transhipment_port": "string"
}
```

### GET `/jobs/{id}/free-days`

_List per-container free days + demurrage/detention accrual (traffic light)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/free-days`

_Upsert free-days / demurrage rates for a container_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "free_days_allowed": 7,
  "last_free_day_date": "string",
  "demurrage_start_date": "string",
  "detention_start_date": "string",
  "demurrage_rate_per_day": 0,
  "detention_rate_per_day": 0
}
```

### POST `/jobs/{id}/free-days/recalculate`

_Recalculate demurrage + detention accruals for all containers on the job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/jobs/{id}/house-jobs`

_List the house jobs consolidated under this master job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/jobs/{id}/milestones`

_List all milestones for a job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/milestones`

_Add a custom milestone outside the standard taxonomy_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "milestone": "CUSTOMS_QUERY_RAISED",
  "planned_date": "string",
  "actual_date": "string",
  "notes": "string"
}
```

### PATCH `/jobs/{id}/milestones/{milestoneId}`

_Update a milestone — set actual_date to mark it complete_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "milestoneId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "actual_date": "2026-07-15",
  "planned_date": "string",
  "notes": "string"
}
```

### GET `/jobs/{id}/notes`

_List notes on a job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/notes`

_Add a note to a job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "note": "string",
  "is_private": false,
  "is_pinned": false
}
```

### DELETE `/jobs/{id}/notes/{noteId}`

_Remove a job note_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "noteId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/notes/{noteId}`

_Update a job note_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "noteId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "note": "string",
  "is_private": false,
  "is_pinned": false
}
```

### GET `/jobs/{id}/part-deliveries`

_List part deliveries_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/part-deliveries`

_Record a part delivery (remaining balance auto-calculated from job pieces)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "delivery_date": "string",
  "packages_delivered": 1,
  "remarks": "string"
}
```

### POST `/jobs/{id}/payment-requests`

_Create a payment request from job totals / parties_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "remarks": "string",
  "amount": 1,
  "currency_code": "AED"
}
```

### GET `/jobs/{id}/pnl`

_Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/jobs/{id}/pods`

_List proofs of delivery_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/pods`

_Record proof of delivery_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "actual_delivery_date": "string",
  "delivered_by": "string",
  "received_by": "string",
  "signature_image_path": "string",
  "remarks": "string"
}
```

### POST `/jobs/{id}/pre-alert/schedule`

_Schedule a pre-alert email for a future UTC time (cron delivers it)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "to_email": "consignee@example.com",
  "scheduled_at": "2026-07-20T10:00:00.000Z",
  "message": "string"
}
```

### POST `/jobs/{id}/pre-alert/send`

_Send pre-alert and mark PRE_ALERT_SENT milestone complete_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "to_email": "consignee@example.com",
  "message": "string"
}
```

### POST `/jobs/{id}/prorate-cost/{chargeCodeId}`

_Distribute a master job's cost line to its house jobs, proportionally by chargeable weight_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "chargeCodeId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/sea-fcl-details`

_Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs, VGM/SI)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "shipping_line_id": "00000000-0000-4000-8000-000000000001",
  "vessel_id": "00000000-0000-4000-8000-000000000001",
  "voyage_number": "string",
  "hbl_number": "string",
  "mbl_number": "string",
  "booking_number": "string",
  "carrier_booking_ref": "string",
  "place_of_receipt": "string",
  "place_of_delivery": "string",
  "etd": "string",
  "eta": "string",
  "incoterms": "string",
  "stuffing_location": "CY",
  "stuffing_date": "string",
  "si_cutoff": "string",
  "vgm_cutoff": "string",
  "cy_cutoff": "string",
  "si_submitted_at": "string",
  "si_version": 1,
  "vgm_submitted_at": "string",
  "vgm_method": "SM1",
  "port_of_loading_id": "00000000-0000-4000-8000-000000000001",
  "port_of_discharge_id": "00000000-0000-4000-8000-000000000001",
  "bl_type": "Original",
  "freight_terms": "Prepaid",
  "transhipment_port": "string",
  "sailed_at": "string",
  "mbl_number_from_line": "string",
  "hbl_number_from_agent": "string",
  "actual_eta": "string",
  "customs_entry_number": "string",
  "customs_examination_details": "string",
  "customs_duty_amount": 1,
  "customs_tax_amount": 1,
  "customs_clearance_date": "string",
  "customs_status": "PENDING",
  "customs_broker_id": "00000000-0000-4000-8000-000000000001",
  "linked_export_job_id": "00000000-0000-4000-8000-000000000001",
  "cfs_storage_rate_per_day": 1,
  "cfs_storage_start_date": "string"
}
```

### POST `/jobs/{id}/sea-fcl-details/si-submission`

_Record SI submission (date + version) and mark SI_SUBMITTED milestone_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "si_submitted_at": "string",
  "si_version": 1
}
```

### POST `/jobs/{id}/sea-fcl-details/vgm-submission`

_Record VGM submission (date + SM1/SM2) and mark VGM_SUBMITTED milestone_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "vgm_submitted_at": "string",
  "vgm_method": "SM1"
}
```

### GET `/jobs/{id}/stuffing-records`

_List stuffing records on a Sea FCL job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/stuffing-records`

_Create a stuffing record and mark STUFFING_COMPLETED_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "supervisor_name": "string",
  "stuffing_date": "string",
  "location": "string",
  "goods_condition": "string",
  "notes": "string"
}
```

### DELETE `/jobs/{id}/stuffing-records/{recordId}`

_Soft-delete a stuffing record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "recordId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/jobs/{id}/stuffing-records/{recordId}`

_Update a stuffing record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "recordId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "container_id": "00000000-0000-4000-8000-000000000001",
  "supervisor_name": "string",
  "stuffing_date": "string",
  "location": "string",
  "goods_condition": "string",
  "notes": "string"
}
```

### GET `/jobs/{id}/sub-jobs`

_List operational sub-jobs under this parent_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/jobs/{id}/sub-jobs`

_Create an operational sub-job under this parent_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "job_type": "AIR_EXPORT",
  "shipper_id": "00000000-0000-4000-8000-000000000001",
  "consignee_id": "00000000-0000-4000-8000-000000000001",
  "agent_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "string",
  "notes": "string"
}
```

### POST `/jobs/{id}/transhipment-link`

_Link this FCL Import job to an outbound SEA_FCL_EXPORT job_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "export_job_id": "00000000-0000-4000-8000-000000000001"
}
```

### POST `/jobs/{id}/whatsapp/status`

_Send WhatsApp status stub (logged until WHATSAPP_ENABLED=true)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "to_phone": "+971501234567",
  "message": "string"
}
```


## Locale

### GET `/locale/{countryCode}`

_Locale suggestions for an ISO country (still optional to use)_

**Params**

```json
[
  {
    "name": "countryCode",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/locale/defaults`

_Optional country → suggested dial / currency / timezone_

**Params**

```json
[
  {
    "name": "country",
    "in": "query",
    "required": true,
    "example": "string"
  }
]
```


## Masters — Airlines

### GET `/masters/airlines`

_list airlines_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/airlines`

_Create a record_

**Body**

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

### DELETE `/masters/airlines/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/airlines/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/airlines/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — Airports

### GET `/masters/airports`

_List airports_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/airports`

_Create an airport_

**Body**

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

### DELETE `/masters/airports/{id}`

_Soft-delete an airport_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/airports/{id}`

_Get an airport by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/airports/{id}`

_Update an airport_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — Banks

### GET `/masters/banks`

_list banks_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/banks`

_Create a record_

**Body**

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

### DELETE `/masters/banks/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/banks/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/banks/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — Branches

### GET `/masters/branches`

_list branches_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/branches`

_Create a record_

**Body**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Dubai Head Office",
  "code": "HO",
  "address": "string",
  "city": "Dubai",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "dubai@example.com",
  "is_head_office": false,
  "is_active": true
}
```

### DELETE `/masters/branches/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/branches/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/branches/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Dubai Head Office",
  "code": "HO",
  "address": "string",
  "city": "Dubai",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "dubai@example.com",
  "is_head_office": false,
  "is_active": true
}
```


## Masters — ChargeCodes

### GET `/masters/charge-codes`

_list chargecodes_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/charge-codes`

_Create a record_

**Body**

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

### DELETE `/masters/charge-codes/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/charge-codes/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/charge-codes/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — ContainerTypes

### GET `/masters/container-types`

_List container types_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/container-types`

_Create a container type_

**Body**

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

### DELETE `/masters/container-types/{id}`

_Soft-delete a container type_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/container-types/{id}`

_Get a container type by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/container-types/{id}`

_Update a container type_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — Countries

### GET `/masters/countries`

_List countries_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/countries`

_Create a country_

**Body**

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

### DELETE `/masters/countries/{id}`

_Soft-delete a country_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/countries/{id}`

_Get a country by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/countries/{id}`

_Update a country_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — Currencies

### GET `/masters/currencies`

_List currencies_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/currencies`

_Create a currency_

**Body**

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

### DELETE `/masters/currencies/{id}`

_Soft-delete a currency_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/currencies/{id}`

_Get a currency by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/currencies/{id}`

_Update a currency_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — Departments

### GET `/masters/departments`

_list departments_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/departments`

_Create a record_

**Body**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations",
  "code": "OPS",
  "parent_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```

### DELETE `/masters/departments/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/departments/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/departments/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations",
  "code": "OPS",
  "parent_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```


## Masters — Designations

### GET `/masters/designations`

_list designations_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/designations`

_Create a record_

**Body**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations Executive",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```

### DELETE `/masters/designations/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/designations/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/designations/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations Executive",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```


## Masters — Exchange Rates

### GET `/masters/exchange-rates`

_List exchange rates, optionally filtered by currency_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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
    "example": "string"
  }
]
```

### POST `/masters/exchange-rates`

_Record (or correct) an exchange rate for a date — upserts by currency + date_

**Body**

```json
{
  "currency_id": "00000000-0000-4000-8000-000000000001",
  "base_currency": "AED",
  "rate": 3.6725,
  "rate_date": "2026-07-06",
  "source": "manual"
}
```

### GET `/masters/exchange-rates/latest/{currencyId}`

_Most recent rate on file for a currency_

**Params**

```json
[
  {
    "name": "currencyId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```


## Masters — Holidays

### GET `/masters/holidays`

_list holidays_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/holidays`

_Create a record_

**Body**

```json
{
  "country_code": "AE",
  "date": "2026-12-02",
  "name": "UAE National Day",
  "is_recurring": false
}
```

### DELETE `/masters/holidays/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/holidays/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/holidays/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "country_code": "AE",
  "date": "2026-12-02",
  "name": "UAE National Day",
  "is_recurring": false
}
```


## Masters — HsCodes

### GET `/masters/hs-codes`

_List HS codes_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/hs-codes`

_Create an HS code_

**Body**

```json
{
  "hs_code": "8517.12",
  "description": "Telephones for cellular networks",
  "import_duty_rate": 1,
  "export_duty_rate": 1,
  "dg_class": "9",
  "un_number": "UN3481",
  "is_prohibited": false,
  "is_restricted": false,
  "notes": "string",
  "is_active": true
}
```

### DELETE `/masters/hs-codes/{id}`

_Soft-delete an HS code_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/hs-codes/{id}`

_Get an HS code by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/hs-codes/{id}`

_Update an HS code_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "hs_code": "8517.12",
  "description": "Telephones for cellular networks",
  "import_duty_rate": 1,
  "export_duty_rate": 1,
  "dg_class": "9",
  "un_number": "UN3481",
  "is_prohibited": false,
  "is_restricted": false,
  "notes": "string",
  "is_active": true
}
```


## Masters — Ports

### GET `/masters/ports`

_List ports_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/ports`

_Create a port_

**Body**

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

### DELETE `/masters/ports/{id}`

_Soft-delete a port_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/ports/{id}`

_Get a port record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/ports/{id}`

_Update a port_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — ShippingLines

### GET `/masters/shipping-lines`

_list shippinglines_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/shipping-lines`

_Create a record_

**Body**

```json
{
  "scac_code": "MAEU",
  "name": "Maersk Line",
  "short_name": "Maersk",
  "country_code": "DK",
  "website": "https://www.maersk.com",
  "tracking_url": "string",
  "is_active": true
}
```

### DELETE `/masters/shipping-lines/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/shipping-lines/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/shipping-lines/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "scac_code": "MAEU",
  "name": "Maersk Line",
  "short_name": "Maersk",
  "country_code": "DK",
  "website": "https://www.maersk.com",
  "tracking_url": "string",
  "is_active": true
}
```


## Masters — TaxRates

### GET `/masters/tax-rates`

_list taxrates_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/tax-rates`

_Create a record_

**Body**

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

### DELETE `/masters/tax-rates/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/tax-rates/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/tax-rates/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — Truckers

### GET `/masters/truckers`

_list truckers_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/truckers`

_Create a record_

**Body**

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

### DELETE `/masters/truckers/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/truckers/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/truckers/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — UnitsOfMeasure

### GET `/masters/units-of-measure`

_list unitsofmeasure_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/units-of-measure`

_Create a record_

**Body**

```json
{
  "code": "CBM",
  "name": "Cubic Meter",
  "category": "Volume",
  "is_active": true
}
```

### DELETE `/masters/units-of-measure/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/units-of-measure/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/units-of-measure/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "code": "CBM",
  "name": "Cubic Meter",
  "category": "Volume",
  "is_active": true
}
```


## Masters — Vessels

### GET `/masters/vessels`

_list vessels_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/vessels`

_Create a record_

**Body**

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

### DELETE `/masters/vessels/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/vessels/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/vessels/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Masters — Warehouses

### GET `/masters/warehouses`

_list warehouses_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/masters/warehouses`

_Create a record_

**Body**

```json
{
  "name": "Jebel Ali Warehouse 3",
  "code": "WH-JA3",
  "address": "string",
  "city": "Dubai",
  "country_code": "AE",
  "capacity_sqm": 1,
  "is_active": true
}
```

### DELETE `/masters/warehouses/{id}`

_Soft-delete a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/masters/warehouses/{id}`

_Get a record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/masters/warehouses/{id}`

_Update a record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "name": "Jebel Ali Warehouse 3",
  "code": "WH-JA3",
  "address": "string",
  "city": "Dubai",
  "country_code": "AE",
  "capacity_sqm": 1,
  "is_active": true
}
```


## Organization — Bank Accounts

### GET `/organization/bank-accounts`

_List this tenant's own bank accounts_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/organization/bank-accounts`

_Add a bank account_

**Body**

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

### DELETE `/organization/bank-accounts/{id}`

_Soft-delete a bank account_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/organization/bank-accounts/{id}`

_Get a bank account by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/organization/bank-accounts/{id}`

_Update a bank account_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Organization — Number Formats

### GET `/organization/number-formats`

_List all configured document number formats (Ch.2.2)_

### POST `/organization/number-formats`

_Configure the number format for a document type_

**Body**

```json
{
  "document_type": "JOB_NUMBER",
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

### GET `/organization/number-formats/{documentType}`

_Get the number format for one document type_

**Params**

```json
[
  {
    "name": "documentType",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/organization/number-formats/{documentType}`

_Update the number format for a document type_

**Params**

```json
[
  {
    "name": "documentType",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "document_type": "JOB_NUMBER",
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

### GET `/organization/number-formats/{documentType}/preview`

_Preview the next number for this format without consuming a sequence value_

**Params**

```json
[
  {
    "name": "documentType",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```


## Organization Profile

### GET `/organization/profile`

_Get this tenant's own organization profile_

### PATCH `/organization/profile`

_Update this tenant's own organization profile (Ch.27.1)_

**Body**

```json
{
  "name": "string",
  "display_name": "string",
  "logo_url": "string",
  "primary_color": "#0A66C2",
  "website": "string",
  "address": "string",
  "city": "string",
  "country_code": "AE",
  "phone": "+971501234567",
  "email": "string",
  "language": "en",
  "base_currency": "AED",
  "timezone": "Asia/Dubai",
  "financial_year_start": 1,
  "vat_number": "string",
  "cr_number": "string",
  "iata_cargo_agent_code": "CGA-12345",
  "customs_code": "string",
  "customs_license_no": "string"
}
```


## Parties

### GET `/parties`

_List parties (customers, agents, suppliers, carriers, etc.)_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/parties`

_Create a party_

**Body**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "short_name": "Al Noor",
  "vat_number": "string",
  "cr_number": "string",
  "country_code": "AE",
  "city": "Dubai",
  "address": "string",
  "phone": "+971501234567",
  "email": "string",
  "credit_limit": 50000,
  "credit_days": 30,
  "currency_code": "AED",
  "salesperson_id": "00000000-0000-4000-8000-000000000001",
  "portal_access": false,
  "marketing_subscription": true,
  "iata_code": "EK",
  "scac_code": "MAEU",
  "tags": [
    "string"
  ],
  "notes": "string",
  "is_active": true
}
```

### DELETE `/parties/{id}`

_Soft-delete a party_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/parties/{id}`

_Get a party with its contacts and addresses_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/parties/{id}`

_Update a party_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "party_type": "CUSTOMER",
  "code": "CUST-001",
  "name": "Al Noor Trading LLC",
  "short_name": "Al Noor",
  "vat_number": "string",
  "cr_number": "string",
  "country_code": "AE",
  "city": "Dubai",
  "address": "string",
  "phone": "+971501234567",
  "email": "string",
  "credit_limit": 50000,
  "credit_days": 30,
  "currency_code": "AED",
  "salesperson_id": "00000000-0000-4000-8000-000000000001",
  "portal_access": false,
  "marketing_subscription": true,
  "iata_code": "EK",
  "scac_code": "MAEU",
  "tags": [
    "string"
  ],
  "notes": "string",
  "is_active": true
}
```

### POST `/parties/{id}/addresses`

_Add an address to a party_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "label": "Warehouse",
  "address_line1": "Plot 45, Jebel Ali Free Zone",
  "address_line2": "string",
  "city": "Dubai",
  "state": "string",
  "postal_code": "00000",
  "country_code": "AE",
  "is_default": false
}
```

### DELETE `/parties/{id}/addresses/{addressId}`

_Remove a party's address_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "addressId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/parties/{id}/addresses/{addressId}`

_Update a party's address_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "addressId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "label": "Warehouse",
  "address_line1": "Plot 45, Jebel Ali Free Zone",
  "address_line2": "string",
  "city": "Dubai",
  "state": "string",
  "postal_code": "00000",
  "country_code": "AE",
  "is_default": false
}
```

### POST `/parties/{id}/contacts`

_Add a contact to a party_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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

### DELETE `/parties/{id}/contacts/{contactId}`

_Remove a party's contact_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "contactId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/parties/{id}/contacts/{contactId}`

_Update a party's contact_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "contactId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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

### PATCH `/parties/{id}/credit-status`

_Change credit status (Active / On Hold / Blacklisted)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "credit_status": "ACTIVE",
  "reason": "string"
}
```

### GET `/parties/{id}/history`

_Party transaction history — jobs, quotations, invoices, payment requests, audit trail_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/parties/export`

_Export parties as CSV_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/parties/import`

_Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import._


## Payment Requests

### GET `/payment-requests`

_List payment requests_

**Params**

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
    "example": 20
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

### POST `/payment-requests`

_Create a payment request_

**Body**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 5000,
  "currency_code": "AED",
  "invoice_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "due_date": "string",
  "remarks": "string"
}
```

### DELETE `/payment-requests/{id}`

_Soft-delete a pending payment request_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/payment-requests/{id}`

_Get a payment request_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/payment-requests/{id}`

_Update a pending payment request_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "amount": 5000,
  "currency_code": "AED",
  "invoice_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "due_date": "string",
  "remarks": "string"
}
```

### POST `/payment-requests/{id}/approve`

_Approve a payment request_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/payment-requests/{id}/mark-paid`

_Mark an approved payment request as paid_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/payment-requests/{id}/reject`

_Reject a payment request_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "rejected_reason": "string"
}
```


## Purchase Invoices

### GET `/purchase-invoices`

_List purchase invoices (vendor bills)_

**Params**

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
    "example": 20
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
    "example": "string"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/purchase-invoices`

_Create a draft purchase invoice_

**Body**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "currency_code": "AED",
  "exchange_rate": 1,
  "vat_rate": 5,
  "invoice_date": "string",
  "due_date": "string",
  "lpo_number": "string",
  "remarks": "string",
  "internal_notes": "string",
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

### DELETE `/purchase-invoices/{id}`

_Soft-delete a draft purchase invoice_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/purchase-invoices/{id}`

_Get a purchase invoice_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/purchase-invoices/{id}`

_Update a draft purchase invoice_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "party_id": "00000000-0000-4000-8000-000000000001",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "currency_code": "AED",
  "exchange_rate": 1,
  "vat_rate": 5,
  "invoice_date": "string",
  "due_date": "string",
  "lpo_number": "string",
  "remarks": "string",
  "internal_notes": "string",
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

### POST `/purchase-invoices/{id}/post`

_Post a draft purchase invoice_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```


## Quotations

### GET `/quotations`

_List quotations_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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
    "example": "AIR_EXPORT"
  },
  {
    "name": "customer_id",
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
    "name": "department_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "carrier_id",
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
    "name": "container_type_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "incoterm",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "created_by",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```

### POST `/quotations`

_Create a quotation (DRAFT)_

**Body**

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
  "commodity": "string",
  "hs_code": "string",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_count": 1,
  "is_dg": false,
  "dg_class": "9",
  "special_requirements": "string",
  "carrier_preference": "string",
  "transit_time_days": 1,
  "routing_notes": "string",
  "remarks": "string",
  "internal_notes": "string",
  "valid_until": "2026-08-31",
  "currency_code": "AED",
  "exchange_rate": 1,
  "discount_percent": 1,
  "discount_amount": 1
}
```

### DELETE `/quotations/{id}`

_Soft-delete a quotation (DRAFT only)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/quotations/{id}`

_Get a quotation with its lines, status history, and approvals_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/quotations/{id}`

_Update a quotation header (DRAFT or REJECTED only)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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
  "commodity": "string",
  "hs_code": "string",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "container_count": 1,
  "is_dg": false,
  "dg_class": "9",
  "special_requirements": "string",
  "carrier_preference": "string",
  "transit_time_days": 1,
  "routing_notes": "string",
  "remarks": "string",
  "internal_notes": "string",
  "valid_until": "2026-08-31",
  "currency_code": "AED",
  "exchange_rate": 1,
  "discount_percent": 1,
  "discount_amount": 1
}
```

### POST `/quotations/{id}/apply-tariff`

_Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/{id}/approve`

_SUBMITTED -> APPROVED_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "comments": "string"
}
```

### POST `/quotations/{id}/archive`

_Archive a closed quotation (soft-delete)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/{id}/convert-to-job`

_WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module._

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/{id}/duplicate`

_Clone into a new revision (new DRAFT, version+1, linked to the same parent)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/{id}/expire`

_Manually expire a quotation past its valid_until date_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/{id}/lines`

_Add a charge line — GP recalculates automatically_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "description": "Ocean Freight",
  "unit": "Per Container",
  "quantity": 1,
  "unit_price": 850,
  "currency_code": "AED",
  "exchange_rate": 1,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_cost": false,
  "supplier_id": "00000000-0000-4000-8000-000000000001",
  "sort_order": 0
}
```

### DELETE `/quotations/{id}/lines/{lineId}`

_Remove a charge line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/quotations/{id}/lines/{lineId}`

_Update a charge line_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "lineId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "charge_code_id": "00000000-0000-4000-8000-000000000001",
  "description": "Ocean Freight",
  "unit": "Per Container",
  "quantity": 1,
  "unit_price": 850,
  "currency_code": "AED",
  "exchange_rate": 1,
  "tax_rate_id": "00000000-0000-4000-8000-000000000001",
  "is_cost": false,
  "supplier_id": "00000000-0000-4000-8000-000000000001",
  "sort_order": 0
}
```

### POST `/quotations/{id}/mark-lost`

_SENT -> LOST, with a reason code_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "reason": "Competitor Rate",
  "notes": "string"
}
```

### POST `/quotations/{id}/mark-won`

_SENT -> WON_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/quotations/{id}/pdf`

_Get quotation PDF URLs and recent generation tasks_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/{id}/pdf`

_Queue PDF generation for a quotation (customer or internal mode)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "mode": "CUSTOMER",
  "layout_variant": "string"
}
```

### GET `/quotations/{id}/pdf/status`

_List PDF generation task status for a quotation_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/{id}/reject`

_SUBMITTED -> REJECTED (editable again, can be resubmitted)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "comments": "string"
}
```

### GET `/quotations/{id}/revisions`

_List all revisions in this quotation version chain_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/{id}/send`

_APPROVED -> SENT_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/{id}/send-email`

_Email quotation PDF to customer (generates PDF if not yet available)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "to_email": "customer@example.com",
  "cc_email": "string",
  "pdf_mode": "CUSTOMER",
  "message": "string"
}
```

### POST `/quotations/{id}/submit`

_DRAFT/REJECTED -> SUBMITTED, opens the approval cycle_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/expire-due`

_Batch-expire quotations past valid_until (cron / internal only)_

**Params**

```json
[
  {
    "name": "tenant_id",
    "in": "query",
    "required": true,
    "example": "string"
  },
  {
    "name": "X-Cron-Secret",
    "in": "header",
    "required": true,
    "example": "string"
  }
]
```

### POST `/quotations/online-quote`

_Public online quote widget — no auth required (Ch.7.5)_

**Body**

```json
{
  "tenant_slug": "kingfisher",
  "job_type": "AIR_EXPORT",
  "customer_id": "00000000-0000-4000-8000-000000000001",
  "contact_email": "john@acme.com",
  "contact_name": "John Smith",
  "origin_port_id": "00000000-0000-4000-8000-000000000001",
  "dest_port_id": "00000000-0000-4000-8000-000000000001",
  "commodity": "string",
  "gross_weight": 1,
  "chargeable_weight": 1,
  "volume_cbm": 1,
  "pieces": 1,
  "container_type_id": "00000000-0000-4000-8000-000000000001",
  "special_requirements": "string",
  "valid_until": "2026-08-31",
  "currency_code": "AED"
}
```

### GET `/quotations/reports/analytics`

_Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/quotations/reports/analytics/conversion`

_Win/loss and quote-to-job conversion rates_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/quotations/reports/analytics/lost-reasons`

_Lost quotation breakdown by reason code_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/quotations/reports/analytics/response-time`

_Average hours from creation to submit/send_

**Params**

```json
[
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
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

### GET `/quotations/reports/chargewise`

_"All Quotations Chargewise" report — same filters as the list, with each charge line included_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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
    "example": "AIR_EXPORT"
  },
  {
    "name": "customer_id",
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
    "name": "department_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "carrier_id",
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
    "name": "container_type_id",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "incoterm",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "created_by",
    "in": "query",
    "required": false,
    "example": "00000000-0000-4000-8000-000000000001"
  },
  {
    "name": "from_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "to_date",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "order",
    "in": "query",
    "required": false,
    "example": "asc"
  }
]
```


## Quotations — Online Tariff Master

### GET `/quotations/tariffs`

_List tariff rate cards_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/quotations/tariffs`

_Create a tariff rate card (sale rate + cost rate per lane/service/container type)_

**Body**

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

### DELETE `/quotations/tariffs/{id}`

_Soft-delete a tariff_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/quotations/tariffs/{id}`

_Get a tariff by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/quotations/tariffs/{id}`

_Update a tariff_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Quotations — Zip Distance Master

### GET `/quotations/zip-distances`

_List zip-to-zip distances_

**Params**

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
    "example": 20
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
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

### POST `/quotations/zip-distances`

_Record a distance between two zip/location codes_

**Body**

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

### DELETE `/quotations/zip-distances/{id}`

_Soft-delete a zip distance record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/quotations/zip-distances/{id}`

_Get a zip distance record by id_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/quotations/zip-distances/{id}`

_Update a zip distance record_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

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


## Search

### GET `/search`

_Global search across jobs, quotations, and parties_

**Params**

```json
[
  {
    "name": "q",
    "in": "query",
    "required": true,
    "example": "KFW/AE"
  },
  {
    "name": "types",
    "in": "query",
    "required": false,
    "example": "jobs,quotations,parties,invoices"
  },
  {
    "name": "limit",
    "in": "query",
    "required": false,
    "example": 20
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
    "example": "string"
  },
  {
    "name": "status",
    "in": "query",
    "required": false,
    "example": "string"
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
    "example": "string"
  },
  {
    "name": "mawb_number",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "hbl_number",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "mbl_number",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "booking_number",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "container_number",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "invoice_number",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "quotation_number",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "etd_from",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "etd_to",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "eta_from",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "eta_to",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "created_from",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "created_to",
    "in": "query",
    "required": false,
    "example": "string"
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
    "example": "string"
  }
]
```


## Tenants (Super Admin)

### GET `/tenants`

_Get all tenants_

**Params**

```json
[
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/tenants`

_Create a new tenant (also provisions its TENANT_ADMIN owner user)_

**Body**

```json
{
  "slug": "kingfisher-wings",
  "code": "string",
  "name": "string",
  "display_name": "string",
  "password": "string",
  "admin_first_name": "string",
  "admin_last_name": "string",
  "domain": "string",
  "website": "string",
  "logo_url": "string",
  "primary_color": "string",
  "language": "string",
  "base_currency": "string",
  "timezone": "string",
  "country_code": "string",
  "financial_year_start": 1,
  "vat_number": "string",
  "cr_number": "string",
  "address": "string",
  "city": "string",
  "phone": "string",
  "email": "string",
  "company_code": "string",
  "company_name": "string",
  "company_legal_name": "string",
  "company_registration_number": "string",
  "subscription_plan": {},
  "status": {},
  "trial_ends": "2026-09-14T10:00:00.000Z",
  "subscription_ends": "2026-09-14T10:00:00.000Z",
  "max_users": 1,
  "max_branches": 1,
  "max_storage_gb": 1,
  "is_active": true
}
```

### DELETE `/tenants/{id}`

_Soft delete tenant_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/tenants/{id}`

_Get tenant by ID_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/tenants/{id}`

_Update tenant_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{}
```

### PATCH `/tenants/{id}/activate`

_Activate tenant_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/tenants/{id}/deactivate`

_Deactivate tenant_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/tenants/{id}/restore`

_Restore tenant_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/tenants/{id}/sync-permissions`

_Reconcile one tenant against the current permission/role catalog_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/tenants/statistics`

_Tenant statistics_

### POST `/tenants/sync-permissions`

_Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions._


## untagged

### GET `/health`


## Users

### GET `/users`

_List users for the current tenant (paginated, filterable)._

**Params**

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
    "example": 10
  },
  {
    "name": "search",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "role",
    "in": "query",
    "required": false,
    "example": "SUPER_ADMIN"
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

### POST `/users`

_Create a user. Returns a system-generated temporary password._

**Body**

```json
{
  "tenant_id": "00000000-0000-4000-8000-000000000001",
  "email": "ahmed@kingfisherwings.com",
  "first_name": "Ahmed",
  "last_name": "Khan",
  "phone": "+971501234567",
  "preferred_country_code": "AE",
  "avatar_url": "string",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "role": "SUPER_ADMIN",
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
    "string"
  ],
  "allowed_mac_addresses": [
    "string"
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

### DELETE `/users/{id}`

_Soft-delete a user._

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### GET `/users/{id}`

_Get a single user by id._

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/users/{id}`

_Update a user._

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "tenant_id": "00000000-0000-4000-8000-000000000001",
  "email": "ahmed@kingfisherwings.com",
  "first_name": "Ahmed",
  "last_name": "Khan",
  "phone": "+971501234567",
  "preferred_country_code": "AE",
  "avatar_url": "string",
  "company_id": "00000000-0000-4000-8000-000000000001",
  "branch_id": "00000000-0000-4000-8000-000000000001",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "role": "SUPER_ADMIN",
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
    "string"
  ],
  "allowed_mac_addresses": [
    "string"
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

### POST `/users/{id}/admin-reset-password`

_Admin resets a target user's password to a new temporary password._

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "require_password_change": true,
  "send_email": false
}
```

### POST `/users/{id}/force-logout`

_Force-logout: revoke a target user's active sessions on all devices._

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### POST `/users/{id}/restore`

_Restore a soft-deleted user._

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/users/{id}/status`

_Change a user's status (activate, suspend, etc)._

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "status": "ACTIVE",
  "reason": "string"
}
```

### POST `/users/bulk`

_Apply an action (activate/deactivate/suspend/delete/restore) to multiple users._

**Body**

```json
{
  "ids": [
    "00000000-0000-4000-8000-000000000001"
  ],
  "action": "ACTIVATE"
}
```

### POST `/users/me/change-password`

_Authenticated user changes their own password._

**Body**

```json
{
  "current_password": "Welcome@123",
  "new_password": "Welcome@123",
  "confirm_password": "Welcome@123"
}
```


## Vessels — Schedules

### GET `/vessels/{id}/schedules`

_List vessel voyage schedules (filter by ETD/ETA)_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "etd_from",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "etd_to",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "eta_from",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "eta_to",
    "in": "query",
    "required": false,
    "example": "string"
  },
  {
    "name": "voyage_number",
    "in": "query",
    "required": false,
    "example": "string"
  }
]
```

### POST `/vessels/{id}/schedules`

_Create a vessel voyage schedule_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "voyage_number": "string",
  "shipping_line_id": "00000000-0000-4000-8000-000000000001",
  "pol_id": "00000000-0000-4000-8000-000000000001",
  "pod_id": "00000000-0000-4000-8000-000000000001",
  "etd": "string",
  "eta": "string",
  "is_active": true,
  "remarks": "string"
}
```

### DELETE `/vessels/{id}/schedules/{scheduleId}`

_Soft-delete a vessel voyage schedule_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "scheduleId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

### PATCH `/vessels/{id}/schedules/{scheduleId}`

_Update a vessel voyage schedule_

**Params**

```json
[
  {
    "name": "id",
    "in": "path",
    "required": true,
    "example": "string"
  },
  {
    "name": "scheduleId",
    "in": "path",
    "required": true,
    "example": "string"
  }
]
```

**Body**

```json
{
  "voyage_number": "string",
  "shipping_line_id": "00000000-0000-4000-8000-000000000001",
  "pol_id": "00000000-0000-4000-8000-000000000001",
  "pod_id": "00000000-0000-4000-8000-000000000001",
  "etd": "string",
  "eta": "string",
  "is_active": true,
  "remarks": "string"
}
```

