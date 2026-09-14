# Masters — complete POST bodies (every field)

Use with `Authorization: Bearer {{ADMIN_TOKEN}}`. Replace UUIDs with your IDs.

#### POST `/masters/airlines`

_Create a record_

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

#### POST `/masters/airports`

_Create an airport_

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

#### POST `/masters/banks`

_Create a record_

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

#### POST `/masters/branches`

_Create a record_

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

#### POST `/masters/charge-codes`

_Create a record_

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

#### POST `/masters/container-types`

_Create a container type_

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

#### POST `/masters/countries`

_Create a country_

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

#### POST `/masters/currencies`

_Create a currency_

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

#### POST `/masters/departments`

_Create a record_

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations",
  "code": "OPS",
  "parent_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```

#### POST `/masters/designations`

_Create a record_

```json
{
  "company_id": "00000000-0000-4000-8000-000000000001",
  "name": "Operations Executive",
  "department_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```

#### POST `/masters/exchange-rates`

_Record (or correct) an exchange rate for a date — upserts by currency + date_

```json
{
  "currency_id": "00000000-0000-4000-8000-000000000001",
  "base_currency": "AED",
  "rate": 3.6725,
  "rate_date": "2026-07-06",
  "source": "manual"
}
```

#### POST `/masters/holidays`

_Create a record_

```json
{
  "country_code": "AE",
  "date": "2026-12-02",
  "name": "UAE National Day",
  "is_recurring": false
}
```

#### POST `/masters/hs-codes`

_Create an HS code_

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

#### POST `/masters/ports`

_Create a port_

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

#### POST `/masters/shipping-lines`

_Create a record_

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

#### POST `/masters/tax-rates`

_Create a record_

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

#### POST `/masters/truckers`

_Create a record_

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

#### POST `/masters/units-of-measure`

_Create a record_

```json
{
  "code": "CBM",
  "name": "Cubic Meter",
  "category": "Volume",
  "is_active": true
}
```

#### POST `/masters/vessels`

_Create a record_

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

#### POST `/masters/warehouses`

_Create a record_

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


#### POST `/masters/regions`

_Create a region_

```json
{
  "code": "GCC",
  "name": "Gulf Cooperation Council",
  "country_code": "AE",
  "is_active": true
}
```

#### POST `/masters/cities`

_Create a city_

```json
{
  "code": "DXB",
  "name": "Dubai",
  "country_code": "AE",
  "is_active": true
}
```

#### POST `/masters/zones`

_Create a zone_

```json
{
  "code": "JAFZA",
  "name": "Jebel Ali Free Zone",
  "is_active": true
}
```

#### POST `/masters/divisions`

_Create a division_

```json
{
  "code": "SEA",
  "name": "Sea Freight Division",
  "is_active": true
}
```

#### POST `/masters/categories`

_Create a master category_

```json
{
  "code": "SHIPPER",
  "name": "Shipper",
  "category_type": "PARTY",
  "is_active": true
}
```

#### POST `/masters/commodities`

_Create a commodity_

```json
{
  "code": "ELEC",
  "name": "Electronics",
  "hs_code": "8517.12",
  "is_active": true
}
```

#### POST `/masters/packs`

_Create a pack type_

```json
{
  "code": "CTN",
  "name": "Carton",
  "length_cm": 40,
  "width_cm": 30,
  "height_cm": 25,
  "is_active": true
}
```

#### POST `/masters/clauses`

_Create a clause_

```json
{
  "code": "DEM-DET",
  "title": "Demurrage / Detention",
  "body": "Free time and detention terms apply as per carrier tariff.",
  "clause_type": "BL",
  "is_active": true
}
```

#### POST `/masters/port-clause-maps`

_Create a port-clause map_

```json
{
  "port_id": "00000000-0000-4000-8000-000000000001",
  "clause_id": "00000000-0000-4000-8000-000000000001",
  "is_active": true
}
```

#### POST `/masters/rate-bases`

_Create a rate basis_

```json
{
  "code": "PER_KG",
  "name": "Per Kilogram",
  "is_active": true
}
```

#### POST `/masters/voyages`

_Create a voyage master (not NVOCC operational voyage)_

```json
{
  "voyage_code": "VSL-2026-001",
  "etd": "2026-04-01T00:00:00.000Z",
  "eta": "2026-04-15T00:00:00.000Z",
  "is_active": true
}
```

#### POST `/masters/storage-slabs`

_Create a storage slab_

```json
{
  "code": "SLAB-1-7",
  "name": "Days 1-7",
  "from_days": 1,
  "to_days": 7,
  "rate": 25.5,
  "currency_code": "AED",
  "is_active": true
}
```

#### POST `/masters/activities`

_Create an activity type_

```json
{
  "code": "FOLLOW_UP",
  "name": "Follow Up",
  "module": "CRM",
  "is_active": true
}
```

#### POST `/masters/sales-call-activities`

_Create a sales call activity type_

```json
{
  "code": "COLD_CALL",
  "name": "Cold Call",
  "is_active": true
}
```

#### POST `/masters/organization-groups`

_Create an organization group_

```json
{
  "code": "GULF",
  "name": "Gulf Companies",
  "company_ids": ["00000000-0000-4000-8000-000000000001"],
  "is_active": true
}
```

#### POST `/masters/custom-reports`

_Create a custom report master_

```json
{
  "code": "AR_AGING_CUST",
  "name": "Customer AR Aging",
  "report_template_code": "ar_aging",
  "is_active": true
}
```

#### POST `/masters/favorites`

_Add own favorite (auth only)_

```json
{
  "entity_type": "party",
  "entity_id": "00000000-0000-4000-8000-000000000001",
  "label": "Acme Logistics"
}
```

#### POST `/masters/whatsapp-sms-history`

_Append outbound message log_

```json
{
  "channel": "WHATSAPP",
  "to_address": "+971501234567",
  "body_snippet": "Shipment AE123 departed",
  "status": "SENT"
}
```
