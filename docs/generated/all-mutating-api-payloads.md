# Every POST/PUT/PATCH — complete dummy payloads

Operations: **243**


## Auth

### POST `/auth/2fa/disable`

_Disable 2FA (password + optional TOTP/backup code)_

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

**Body (every field)**

```json
{
  "code": "123456"
}
```

---

### POST `/auth/2fa/setup`

_Generate TOTP secret + QR for the current user_

_No body._

---

### POST `/auth/accept-invite`

_Accept invite token and set password_

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

_No body._

---

### POST `/auth/logout-all`

_Log out of every device (revokes all active sessions)_

_No body._

---

### PATCH `/auth/me`

_Update own profile after login (preferred country, phone, locale)_

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

**Body (every field)**

```json
{
  "refresh_token": "dummy-token-replace-me"
}
```

---

### POST `/auth/sessions/{sessionId}/revoke`

_Revoke one of the authenticated user's own sessions_

**Params**

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

_No body._

---

### POST `/auth/super-admin/login`

_Platform super admin login_

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

### POST `/awb-stock/allocations/{id}/mark-used`

_Mark an allocated AWB as used (flown/printed)_

**Params**

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

_No body._

---

### POST `/awb-stock/allocations/{id}/void`

_Void an allocated (unused) AWB number_

**Params**

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

### POST `/awb-stock/batches`

_Register a new AWB number range for an airline_

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

### PATCH `/awb-stock/batches/{id}`

_Update batch metadata (threshold, notes)_

**Params**

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

**Params**

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

**Params**

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


## Companies

### POST `/companies`

_Register an additional company under this tenant (multi-entity groups)_

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

### PATCH `/companies/{id}`

_Update a company_

**Params**

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

### POST `/credit-notes`

_Create a credit note against a posted customer invoice_

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

### POST `/credit-notes/{id}/post`

_Post a draft credit note_

**Params**

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

_No body._

---


## Debit Notes

### POST `/debit-notes`

_Create a debit note against a posted customer invoice (extra charge)_

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

### POST `/debit-notes/{id}/post`

_Post a draft debit note_

**Params**

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

_No body._

---


## GL — Bank Reconciliation

### POST `/gl/bank-reconciliations`

_Start a draft bank reconciliation_

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

### PATCH `/gl/bank-reconciliations/{id}`

_Update draft bank reconciliation header_

**Params**

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

**Params**

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

_No body._

---

### POST `/gl/bank-reconciliations/{id}/lines`

_Add a matched / statement line_

**Params**

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

### PATCH `/gl/bank-reconciliations/{id}/lines/{lineId}`

_Update recon line match flags_

**Params**

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

### POST `/gl/bank-transfers`

_Post a contra bank/cash transfer voucher (Ch.19.3)_

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

### POST `/gl/accounts`

_Create a GL account_

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

### PATCH `/gl/accounts/{id}`

_Update a GL account_

**Params**

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

### POST `/gl/accounts/seed-defaults`

_Seed a starter freight COA (only when empty)_

_No body._

---


## GL — Cheques / PDC

### POST `/gl/cheques`

_Register a cheque / PDC_

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

### PATCH `/gl/cheques/{id}`

_Update a pending cheque_

**Params**

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

**Params**

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

**Params**

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

_No body._

---

### POST `/gl/cheques/{id}/clear`

_Mark cheque cleared_

**Params**

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

_No body._

---

### POST `/gl/cheques/{id}/deposit`

_Mark cheque deposited_

**Params**

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

_No body._

---


## GL — My Reports

### POST `/gl/saved-reports`

_Save a report configuration (filters + type)_

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

### PATCH `/gl/saved-reports/{id}`

_Update a saved report_

**Params**

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

### POST `/gl/payments`

_Create a draft receipt or vendor payment_

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

### PATCH `/gl/payments/{id}`

_Update a draft payment header_

**Params**

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

**Params**

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

### POST `/gl/payments/{id}/cancel`

_Cancel payment (reverses invoice balances and GL if posted)_

**Params**

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

_No body._

---

### POST `/gl/payments/{id}/post`

_Post payment: update invoice balances + create GL voucher_

**Params**

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

_No body._

---


## GL — Vouchers

### POST `/gl/vouchers`

_Create a draft voucher (optionally with lines)_

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

### PATCH `/gl/vouchers/{id}`

_Update draft voucher header_

**Params**

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

**Params**

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

### PATCH `/gl/vouchers/{id}/lines/{lineId}`

_Update a draft voucher line_

**Params**

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

**Params**

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

_No body._

---

### POST `/gl/vouchers/{id}/reverse`

_Create an offsetting posted reversal voucher_

**Params**

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

_No body._

---


## Invoices

### POST `/invoices`

_Create a draft customer invoice_

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

### PATCH `/invoices/{id}`

_Update a draft invoice header_

**Params**

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

**Params**

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

_No body._

---

### POST `/invoices/{id}/lines`

_Add a line to a draft invoice_

**Params**

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

### PATCH `/invoices/{id}/lines/{lineId}`

_Update an invoice line_

**Params**

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

### POST `/invoices/{id}/pdf`

_Generate invoice PDF_

**Params**

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

_No body._

---

### POST `/invoices/{id}/post`

_Post a draft invoice (DRAFT -> POSTED)_

**Params**

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

_No body._

---

### POST `/invoices/{id}/send`

_Email invoice PDF to customer_

**Params**

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

**Params**

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

_No body._

---


## Jobs

### POST `/jobs`

_Create a job (booking). AIR_EXPORT auto-seeds 15 milestones; SEA_FCL_EXPORT auto-seeds 16 FCL milestones + sea_fcl_details. Set parent_job_id for a HOUSE job._

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

### PATCH `/jobs/{id}`

_Update a job (not allowed once COMPLETED or CANCELLED)_

**Params**

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

**Params**

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

### POST `/jobs/{id}/bills-of-lading`

_Create a bill of lading data record (PDF variants are Week 8)_

**Params**

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

### PATCH `/jobs/{id}/bills-of-lading/{blId}`

_Update a bill of lading (draft → original / surrendered flags)_

**Params**

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

**Params**

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

_No body._

---

### POST `/jobs/{id}/cargo`

_Add an FCL cargo line (optionally assigned to a container)_

**Params**

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

### PATCH `/jobs/{id}/cargo/{cargoId}`

_Update an FCL cargo line_

**Params**

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

**Params**

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

**Params**

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

### PATCH `/jobs/{id}/charges/{chargeId}`

_Update a charge line_

**Params**

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

**Params**

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

_No body._

---

### POST `/jobs/{id}/containers`

_Add a container to a Sea FCL job_

**Params**

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

### PATCH `/jobs/{id}/containers/{containerId}`

_Update a container on a Sea FCL job_

**Params**

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

**Params**

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

### POST `/jobs/{id}/containers/{containerId}/return`

_Record container return to shipping line_

**Params**

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

**Params**

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

### PATCH `/jobs/{id}/customs-status`

_Update customs clearance workflow (PENDING→FILED→QUERY→CLEARED→RELEASED)_

**Params**

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

### POST `/jobs/{id}/damage-reports`

_Create a damage report (description + photo URLs + survey #)_

**Params**

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

### POST `/jobs/{id}/deposits`

_Create a customs or port deposit record_

**Params**

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

### PATCH `/jobs/{id}/deposits/{depositId}`

_Update a deposit_

**Params**

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

### POST `/jobs/{id}/documents`

_Register a document on a job (metadata + file URL)_

**Params**

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

### PATCH `/jobs/{id}/documents/{documentId}`

_Update a draft document metadata_

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

### POST `/jobs/{id}/documents/hawb`

_Queue HAWB PDF generation (Puppeteer + BullMQ)_

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

**Params**

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

### POST `/jobs/{id}/free-days`

_Upsert free-days / demurrage rates for a container_

**Params**

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

**Params**

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

_No body._

---

### POST `/jobs/{id}/milestones`

_Add a custom milestone outside the standard taxonomy_

**Params**

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

**Params**

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

### POST `/jobs/{id}/notes`

_Add a note to a job_

**Params**

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

### PATCH `/jobs/{id}/notes/{noteId}`

_Update a job note_

**Params**

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

### POST `/jobs/{id}/part-deliveries`

_Record a part delivery (remaining balance auto-calculated from job pieces)_

**Params**

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

**Params**

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

### POST `/jobs/{id}/pods`

_Record proof of delivery_

**Params**

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

**Params**

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

**Params**

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

**Params**

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

_No body._

---

### PATCH `/jobs/{id}/sea-fcl-details`

_Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs, VGM/SI)_

**Params**

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

**Params**

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

**Params**

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

### POST `/jobs/{id}/stuffing-records`

_Create a stuffing record and mark STUFFING_COMPLETED_

**Params**

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

### PATCH `/jobs/{id}/stuffing-records/{recordId}`

_Update a stuffing record_

**Params**

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

### POST `/jobs/{id}/sub-jobs`

_Create an operational sub-job under this parent_

**Params**

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

**Params**

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

**Params**

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


## Masters — Airlines

### POST `/masters/airlines`

_Create a record_

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

### PATCH `/masters/airlines/{id}`

_Update a record_

**Params**

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

### POST `/masters/airports`

_Create an airport_

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

### PATCH `/masters/airports/{id}`

_Update an airport_

**Params**

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

### POST `/masters/banks`

_Create a record_

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

### PATCH `/masters/banks/{id}`

_Update a record_

**Params**

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

### POST `/masters/branches`

_Create a record_

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

### PATCH `/masters/branches/{id}`

_Update a record_

**Params**

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

### POST `/masters/charge-codes`

_Create a record_

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

### PATCH `/masters/charge-codes/{id}`

_Update a record_

**Params**

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

### POST `/masters/container-types`

_Create a container type_

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

### PATCH `/masters/container-types/{id}`

_Update a container type_

**Params**

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

### POST `/masters/countries`

_Create a country_

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

### PATCH `/masters/countries/{id}`

_Update a country_

**Params**

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

### POST `/masters/currencies`

_Create a currency_

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

### PATCH `/masters/currencies/{id}`

_Update a currency_

**Params**

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

### POST `/masters/departments`

_Create a record_

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

### PATCH `/masters/departments/{id}`

_Update a record_

**Params**

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

### POST `/masters/designations`

_Create a record_

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

### PATCH `/masters/designations/{id}`

_Update a record_

**Params**

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

### POST `/masters/exchange-rates`

_Record (or correct) an exchange rate for a date — upserts by currency + date_

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


## Masters — Holidays

### POST `/masters/holidays`

_Create a record_

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

### PATCH `/masters/holidays/{id}`

_Update a record_

**Params**

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

### POST `/masters/hs-codes`

_Create an HS code_

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

### PATCH `/masters/hs-codes/{id}`

_Update an HS code_

**Params**

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

### POST `/masters/ports`

_Create a port_

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

### PATCH `/masters/ports/{id}`

_Update a port_

**Params**

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

### POST `/masters/shipping-lines`

_Create a record_

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

### PATCH `/masters/shipping-lines/{id}`

_Update a record_

**Params**

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

### POST `/masters/tax-rates`

_Create a record_

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

### PATCH `/masters/tax-rates/{id}`

_Update a record_

**Params**

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

### POST `/masters/truckers`

_Create a record_

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

### PATCH `/masters/truckers/{id}`

_Update a record_

**Params**

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

### POST `/masters/units-of-measure`

_Create a record_

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

### PATCH `/masters/units-of-measure/{id}`

_Update a record_

**Params**

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

### POST `/masters/vessels`

_Create a record_

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

### PATCH `/masters/vessels/{id}`

_Update a record_

**Params**

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

### POST `/masters/warehouses`

_Create a record_

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

### PATCH `/masters/warehouses/{id}`

_Update a record_

**Params**

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

### POST `/organization/bank-accounts`

_Add a bank account_

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

### PATCH `/organization/bank-accounts/{id}`

_Update a bank account_

**Params**

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

### POST `/organization/number-formats`

_Configure the number format for a document type_

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

### PATCH `/organization/number-formats/{documentType}`

_Update the number format for a document type_

**Params**

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


## Organization Profile

### PATCH `/organization/profile`

_Update this tenant's own organization profile (Ch.27.1)_

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

### POST `/parties`

_Create a party_

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

### PATCH `/parties/{id}`

_Update a party_

**Params**

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

**Params**

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

### PATCH `/parties/{id}/addresses/{addressId}`

_Update a party's address_

**Params**

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

**Params**

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

### PATCH `/parties/{id}/contacts/{contactId}`

_Update a party's contact_

**Params**

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

**Params**

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

### POST `/parties/import`

_Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import._

_No body._

---


## Payment Requests

### POST `/payment-requests`

_Create a payment request_

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

### PATCH `/payment-requests/{id}`

_Update a pending payment request_

**Params**

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

**Params**

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

_No body._

---

### POST `/payment-requests/{id}/mark-paid`

_Mark an approved payment request as paid_

**Params**

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

_No body._

---

### POST `/payment-requests/{id}/reject`

_Reject a payment request_

**Params**

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

### POST `/purchase-invoices`

_Create a draft purchase invoice_

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

### PATCH `/purchase-invoices/{id}`

_Update a draft purchase invoice_

**Params**

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

**Params**

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

_No body._

---


## Quotations

### POST `/quotations`

_Create a quotation (DRAFT)_

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

### PATCH `/quotations/{id}`

_Update a quotation header (DRAFT or REJECTED only)_

**Params**

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

**Params**

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

_No body._

---

### POST `/quotations/{id}/approve`

_SUBMITTED -> APPROVED_

**Params**

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

**Params**

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

_No body._

---

### POST `/quotations/{id}/convert-to-job`

_WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module._

**Params**

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

_No body._

---

### POST `/quotations/{id}/duplicate`

_Clone into a new revision (new DRAFT, version+1, linked to the same parent)_

**Params**

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

_No body._

---

### POST `/quotations/{id}/expire`

_Manually expire a quotation past its valid_until date_

**Params**

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

_No body._

---

### POST `/quotations/{id}/lines`

_Add a charge line — GP recalculates automatically_

**Params**

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

### PATCH `/quotations/{id}/lines/{lineId}`

_Update a charge line_

**Params**

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

**Params**

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

**Params**

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

_No body._

---

### POST `/quotations/{id}/pdf`

_Queue PDF generation for a quotation (customer or internal mode)_

**Params**

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

### POST `/quotations/{id}/reject`

_SUBMITTED -> REJECTED (editable again, can be resubmitted)_

**Params**

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

### POST `/quotations/{id}/send`

_APPROVED -> SENT_

**Params**

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

_No body._

---

### POST `/quotations/{id}/send-email`

_Email quotation PDF to customer (generates PDF if not yet available)_

**Params**

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

**Params**

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

_No body._

---

### POST `/quotations/expire-due`

_Batch-expire quotations past valid_until (cron / internal only)_

**Params**

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

_No body._

---

### POST `/quotations/online-quote`

_Public online quote widget — no auth required (Ch.7.5)_

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


## Quotations — Online Tariff Master

### POST `/quotations/tariffs`

_Create a tariff rate card (sale rate + cost rate per lane/service/container type)_

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

### PATCH `/quotations/tariffs/{id}`

_Update a tariff_

**Params**

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

### POST `/quotations/zip-distances`

_Record a distance between two zip/location codes_

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

### PATCH `/quotations/zip-distances/{id}`

_Update a zip distance record_

**Params**

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


## Tenants (Super Admin)

### POST `/tenants`

_Create a new tenant (also provisions its TENANT_ADMIN owner user)_

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

### PATCH `/tenants/{id}`

_Update tenant_

**Params**

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

**Params**

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

_No body._

---

### PATCH `/tenants/{id}/deactivate`

_Deactivate tenant_

**Params**

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

_No body._

---

### PATCH `/tenants/{id}/restore`

_Restore tenant_

**Params**

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

_No body._

---

### POST `/tenants/{id}/sync-permissions`

_Reconcile one tenant against the current permission/role catalog_

**Params**

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

_No body._

---

### POST `/tenants/sync-permissions`

_Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions._

_No body._

---


## Users

### POST `/users`

_Create a user. Returns a system-generated temporary password._

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

### PATCH `/users/{id}`

_Update a user._

**Params**

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

**Params**

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

**Params**

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

_No body._

---

### POST `/users/{id}/restore`

_Restore a soft-deleted user._

**Params**

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

_No body._

---

### PATCH `/users/{id}/status`

_Change a user's status (activate, suspend, etc)._

**Params**

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

### POST `/vessels/{id}/schedules`

_Create a vessel voyage schedule_

**Params**

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

### PATCH `/vessels/{id}/schedules/{scheduleId}`

_Update a vessel voyage schedule_

**Params**

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

