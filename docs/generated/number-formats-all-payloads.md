# Number formats — complete dummy body for each document_type

`POST /organization/number-formats`  
Authorization: Bearer `{{ADMIN_TOKEN}}`

## QUOTATION

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

## JOB_NUMBER

```json
{
  "document_type": "JOB_NUMBER",
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

## INVOICE

```json
{
  "document_type": "INVOICE",
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

## CREDIT_NOTE

```json
{
  "document_type": "CREDIT_NOTE",
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

## PURCHASE_INVOICE

```json
{
  "document_type": "PURCHASE_INVOICE",
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

## VOUCHER

```json
{
  "document_type": "VOUCHER",
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

