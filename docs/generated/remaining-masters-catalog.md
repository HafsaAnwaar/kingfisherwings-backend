# Remaining Masters tiles — local catalog (pre-deploy)

These routes are implemented in the backend under `/masters/*`. Regenerate `swagger-live-catalog.*` from live `/docs-json` **after** migrate + deploy so they appear in the full live catalog.

Permissions: `masters.view` / `masters.create` / `masters.update` / `masters.delete`, except **Favorites** mutations (JWT + RolesGuard only).

## Wave 1 — Reference CRUD

| Method | Path | Tag |
|--------|------|-----|
| GET/POST | `/masters/regions` | Masters — Regions |
| GET/PATCH/DELETE | `/masters/regions/:id` | |
| GET/POST | `/masters/cities` | Masters — Cities |
| GET/PATCH/DELETE | `/masters/cities/:id` | |
| GET/POST | `/masters/zones` | Masters — Zones |
| GET/PATCH/DELETE | `/masters/zones/:id` | |
| GET/POST | `/masters/divisions` | Masters — Divisions |
| GET/PATCH/DELETE | `/masters/divisions/:id` | |
| GET/POST | `/masters/categories` | Masters — Categories |
| GET/PATCH/DELETE | `/masters/categories/:id` | |
| GET/POST | `/masters/commodities` | Masters — Commodities |
| GET/PATCH/DELETE | `/masters/commodities/:id` | |
| GET/POST | `/masters/packs` | Masters — Packs |
| GET/PATCH/DELETE | `/masters/packs/:id` | |
| GET/POST | `/masters/clauses` | Masters — Clauses |
| GET/PATCH/DELETE | `/masters/clauses/:id` | |
| GET/POST | `/masters/port-clause-maps` | Masters — Port Clause Maps |
| GET/PATCH/DELETE | `/masters/port-clause-maps/:id` | |
| GET/POST | `/masters/rate-bases` | Masters — Rate Bases |
| GET/PATCH/DELETE | `/masters/rate-bases/:id` | |
| GET/POST | `/masters/voyages` | Masters — Voyages |
| GET/PATCH/DELETE | `/masters/voyages/:id` | |
| GET/POST | `/masters/storage-slabs` | Masters — Storage Slabs |
| GET/PATCH/DELETE | `/masters/storage-slabs/:id` | |
| GET/POST | `/masters/activities` | Masters — Activities |
| GET/PATCH/DELETE | `/masters/activities/:id` | |
| GET/POST | `/masters/sales-call-activities` | Masters — Sales Call Activities |
| GET/PATCH/DELETE | `/masters/sales-call-activities/:id` | |

### Sample create bodies

```json
{ "code": "GCC", "name": "Gulf", "country_code": "AE", "is_active": true }
```

```json
{ "code": "DXB", "name": "Dubai", "country_code": "AE", "is_active": true }
```

```json
{ "code": "SHIPPER", "name": "Shipper", "category_type": "PARTY", "is_active": true }
```

```json
{ "code": "DEM-DET", "title": "Demurrage", "body": "Free time per carrier tariff.", "clause_type": "BL", "is_active": true }
```

```json
{ "voyage_code": "VSL-2026-001", "etd": "2026-04-01T00:00:00.000Z", "eta": "2026-04-15T00:00:00.000Z", "is_active": true }
```

```json
{ "code": "SLAB-1-7", "name": "Days 1-7", "from_days": 1, "to_days": 7, "rate": 25.5, "currency_code": "AED", "is_active": true }
```

## Wave 2 — Search / inventory / history

| Method | Path | Notes |
|--------|------|-------|
| GET | `/masters/address-search?q=` | Party addresses |
| GET | `/masters/contacts-search?q=` | Party contacts |
| GET | `/masters/attachments-search?q=` | Job documents |
| GET | `/masters/container-inventory` | Job containers + free days |
| GET/POST | `/masters/favorites` | Own favorites |
| DELETE | `/masters/favorites/:id` | Soft-delete own |
| GET | `/masters/tracking-users` | Ops/CS/sales staff |
| GET/POST | `/masters/whatsapp-sms-history` | Outbound message log |

## Wave 3 — Aliases / light CRUD

| Method | Path | Notes |
|--------|------|-------|
| GET | `/masters/organization` | Proxy org profile |
| GET/POST | `/masters/organization-groups` | CRUD + `company_ids` |
| GET/PATCH/DELETE | `/masters/organization-groups/:id` | |
| GET | `/masters/notifications` | Proxy staff notifications |
| GET/POST | `/masters/custom-reports` | Template code link |
| GET/PATCH/DELETE | `/masters/custom-reports/:id` | |

### Sample create bodies

```json
{
  "code": "GULF",
  "name": "Gulf Companies",
  "company_ids": ["00000000-0000-4000-8000-000000000001"],
  "is_active": true
}
```

```json
{
  "code": "AR_AGING_CUST",
  "name": "Customer AR Aging",
  "report_template_code": "ar_aging",
  "is_active": true
}
```

```json
{
  "entity_type": "party",
  "entity_id": "00000000-0000-4000-8000-000000000001",
  "label": "Acme Logistics"
}
```

```json
{
  "channel": "WHATSAPP",
  "to_address": "+971501234567",
  "body_snippet": "Shipment AE123 departed",
  "status": "SENT"
}
```
