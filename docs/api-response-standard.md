# API Response Standard

This document describes the response formats, HTTP status codes, and error shapes used across the Kingfisher Logistics ERP API.

---

## Important: No Global Response Wrapper

The backend does **not** use a global response interceptor or uniform envelope. Response shapes vary by module and endpoint type. This document catalogs the actual patterns in use.

---

## Response Patterns

### Pattern 1: Auth/Tenant Wrapped Envelope

Used by authentication and tenant management endpoints.

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 900,
    "user": { ... }
  }
}
```

**Endpoints:** `POST /auth/login`, `POST /auth/tenant-login`, `POST /auth/refresh`, `POST /auth/logout`, tenant creation.

### Pattern 2: Paginated List

Used by list endpoints across masters, parties, users, and quotations.

```json
{
  "data": [
    { "id": "uuid", "name": "...", ... },
    { "id": "uuid", "name": "...", ... }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

**Endpoints:** `GET /parties`, `GET /masters/countries`, `GET /users`, etc.

### Pattern 3: Single Entity (Raw Prisma Model)

Used by create, get-by-id, and update endpoints in masters, parties, companies.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "iso_code": "AE",
  "name": "United Arab Emirates",
  "is_active": true,
  "created_at": "2026-07-09T10:00:00.000Z",
  "updated_at": "2026-07-09T10:00:00.000Z",
  "deleted_at": null
}
```

Returns the Prisma model directly with snake_case field names.

### Pattern 4: Mapped Response DTO (Users Module)

Used by the Users module for security — sensitive fields are explicitly excluded.

```json
{
  "id": "uuid",
  "email": "ahmed@kingfisherwings.com",
  "first_name": "Hassan",
  "last_name": "Ahmed",
  "role": "TENANT_ADMIN",
  "status": "ACTIVE",
  "branch_id": null,
  "created_at": "2026-07-09T10:00:00.000Z"
}
```

Mapped via `UserMapper.toResponse()` — never returns `password_hash`, tokens, or secrets.

### Pattern 5: Create with Extra Data (Users)

```json
{
  "user": { ... },
  "temporaryPassword": "Xk9#mP2vLq"
}
```

Returned when an admin creates a user with a system-generated temporary password.

### Pattern 6: No Content (Delete)

Delete endpoints return **HTTP 204 No Content** with an empty body.

```typescript
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async remove(...) {
  await this.service.softDelete(tenantId, id, actorId);
}
```

### Pattern 7: Health Check

```json
{
  "success": true,
  "message": "Backend is running",
  "database": "Connected"
}
```

### Pattern 8: Bulk Import Result (Parties)

```json
{
  "imported": 45,
  "skipped": 3,
  "errors": [
    { "row": 12, "code": "CUST-012", "message": "Duplicate code" }
  ]
}
```

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| `200 OK` | Successful GET, PATCH, POST (non-create), login, logout |
| `201 Created` | Successful POST that creates a resource |
| `204 No Content` | Successful DELETE (soft delete) |
| `400 Bad Request` | Validation failure, business rule violation |
| `401 Unauthorized` | Missing/invalid token, revoked session, inactive account |
| `403 Forbidden` | Missing role or permission |
| `404 Not Found` | Resource not found (or soft-deleted) |
| `409 Conflict` | Unique constraint violation (duplicate code, email, etc.) |

---

## Error Response Format

NestJS default exception filter produces:

```json
{
  "statusCode": 400,
  "message": [
    "iso_code must be longer than or equal to 2 characters",
    "name should not be empty"
  ],
  "error": "Bad Request"
}
```

For single-message exceptions:

```json
{
  "statusCode": 404,
  "message": "Record not found.",
  "error": "Not Found"
}
```

For authorization failures:

```json
{
  "statusCode": 403,
  "message": "Missing required permission(s): parties.create.",
  "error": "Forbidden"
}
```

### Validation Errors

When `ValidationPipe` rejects a request (`forbidNonWhitelisted: true`):

```json
{
  "statusCode": 400,
  "message": [
    "property unknown_field should not exist"
  ],
  "error": "Bad Request"
}
```

---

## Pagination Standard

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-based) |
| `limit` | integer | `20` (masters/parties), `10` (users/tenants) | Items per page |
| `search` | string | — | Free-text search (fields vary per entity) |
| `order` | `asc` \| `desc` | `asc` (masters), `desc` (users) | Sort direction |
| `is_active` | boolean | — | Filter by active status (masters) |
| `sortBy` | string | — | Sort field (users, tenants) |

### Meta Object

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;  // Math.ceil(total / limit) || 1
}
```

### Implementation

```typescript
const [data, total] = await Promise.all([
  tx.entity.findMany({
    where,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { created_at: query.order },
  }),
  tx.entity.count({ where }),
]);

return {
  data,
  meta: {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit) || 1,
  },
};
```

---

## Search and Filter Standard

### Free-Text Search

Case-insensitive `contains` across configurable fields:

```typescript
if (query.search && this.searchFields.length > 0) {
  where.OR = this.searchFields.map((field) => ({
    [field]: { contains: query.search, mode: 'insensitive' },
  }));
}
```

### Enum Filters

```typescript
if (query.party_type) {
  where.party_type = query.party_type;
}
```

### Boolean Filters

```typescript
if (query.is_active !== undefined) {
  where.is_active = query.is_active;
}
```

### UUID Filters

```typescript
if (query.company_id) {
  where.company_id = query.company_id;
}
```

---

## Field Naming in Responses

| Context | Convention | Example |
|---------|------------|---------|
| Prisma model responses | snake_case | `tenant_id`, `created_at` |
| User mapped responses | snake_case | `first_name`, `branch_id` |
| JWT payload | camelCase | `tenantId`, `branchId` |
| Auth wrapped `data.user` | snake_case (mapped) | `first_name`, `must_change_password` |

---

## Swagger Response Documentation

The Users module documents response types explicitly:

```typescript
@ApiResponse({ status: HttpStatus.OK, type: PaginatedUsersResponse })
@ApiResponse({ status: HttpStatus.CREATED, type: UserResponse })
```

Other modules rely on inferred types from return values. When adding new endpoints, prefer explicit `@ApiResponse` decorators for complex response shapes.

---

## Recommendations for New Modules

When building new modules, follow these conventions for consistency:

| Endpoint Type | Recommended Response |
|--------------|---------------------|
| List | `{ data: T[], meta: PaginationMeta }` |
| Get by ID | Raw entity or mapped DTO |
| Create | `201` + entity (or mapped DTO) |
| Update | `200` + updated entity |
| Delete | `204 No Content` |
| Action endpoints | `200` + result object |

For sensitive data (passwords, tokens, internal IDs), use explicit mapper classes like `UserMapper` rather than returning Prisma models directly.
