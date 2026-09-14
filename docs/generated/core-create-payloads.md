# Core APIs — complete dummy bodies (every field)

## GET `/quotations`

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

_No body._

## POST `/quotations`

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

## GET `/jobs`

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

_No body._

## POST `/jobs`

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

## GET `/invoices`

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

_No body._

## POST `/invoices`

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

## GET `/parties`

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

_No body._

## POST `/parties`

_Create a party_

**Body**

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

## GET `/users`

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

_No body._

## POST `/users`

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

## GET `/organization/number-formats`

_List all configured document number formats (Ch.2.2)_

_No body._

## POST `/organization/number-formats`

_Configure the number format for a document type_

**Body**

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

## GET `/companies`

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

_No body._

## POST `/companies`

_Register an additional company under this tenant (multi-entity groups)_

**Body**

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

## POST `/auth/login`

_Staff login: tenant slug + email + password_

**Body**

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

## POST `/auth/tenant-login`

_Tenant admin login: tenant slug + the tenant's own password_

**Body**

```json
{
  "tenant_slug": "kfw-demo",
  "password": "Welcome@123",
  "remember_me": true,
  "device_name": "Swagger-Chrome"
}
```

## POST `/auth/super-admin/login`

_Platform super admin login_

**Body**

```json
{
  "email": "demo@kfw-demo.com",
  "password": "Welcome@123"
}
```

## POST `/auth/super-admin/signup`

_Platform super admin self-registration_

**Body**

```json
{
  "email": "demo@kfw-demo.com",
  "password": "Welcome@123",
  "first_name": "Ahmed",
  "last_name": "Khan"
}
```

## GET `/tenants`

_Get all tenants_

**Params**

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

_No body._

## POST `/tenants`

_Create a new tenant (also provisions its TENANT_ADMIN owner user)_

**Body**

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

