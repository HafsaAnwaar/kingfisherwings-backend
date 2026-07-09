# Authentication Flow

This document describes how authentication works in the Kingfisher Logistics ERP backend.

---

## Overview

Authentication uses **JWT Bearer tokens** with **server-side session tracking**. Three principal types share the same JWT machinery but have different login flows and payload shapes.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Staff Login  │     │ Tenant Login │     │ Super Admin Login│
│ /auth/login  │     │/auth/tenant- │     │/auth/super-admin/│
│              │     │    login     │     │     login        │
└──────┬───────┘     └──────┬───────┘     └────────┬─────────┘
       │                    │                       │
       └────────────────────┼───────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   AuthService   │
                   │  - validate     │
                   │  - create session│
                   │  - resolve RBAC │
                   │  - sign tokens  │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌────▼────┐ ┌──────▼──────┐
        │  Session  │ │  JWT    │ │  Refresh    │
        │  (DB row) │ │  Access │ │  Token      │
        └───────────┘ └─────────┘ └─────────────┘
```

---

## Principal Types

### 1. Staff User (`principal: 'user'`)

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "tenant_slug": "kingfisher",
  "email": "ahmed@kingfisherwings.com",
  "password": "********"
}
```

**Flow:**
1. Resolve tenant by `slug`
2. Find user by `tenant_id` + `email`
3. Verify password (Argon2id)
4. Check account status (`ACTIVE`), lock state, IP/MAC restrictions
5. Resolve RBAC (roles + direct permissions)
6. Create `Session` row with `jti`
7. Sign access + refresh JWT tokens
8. Return wrapped response with user profile

### 2. Tenant Owner (`principal: 'user'`, role: `TENANT_ADMIN`)

**Endpoint:** `POST /auth/tenant-login`

**Request:**
```json
{
  "tenant_slug": "kingfisher",
  "password": "********"
}
```

**Flow:**
1. Resolve tenant by `slug`
2. Verify tenant's own password (separate from user passwords)
3. Find or auto-provision the tenant's `TENANT_ADMIN` user
4. Same session + token flow as staff login

### 3. Super Admin (`principal: 'super_admin'`)

**Endpoints:**
- `POST /auth/super-admin/signup` — self-registration (platform setup)
- `POST /auth/super-admin/login` — login

**Request:**
```json
{
  "email": "admin@kingfisherwings.com",
  "password": "********"
}
```

**Flow:**
1. Find `SuperAdmin` by email
2. Verify password
3. Create `SuperAdminSession` row
4. Sign tokens with `principal: 'super_admin'` (no `tenantId`)

---

## JWT Token Structure

### Access Token Payload (User)

```typescript
interface UserJwtPayload {
  principal: 'user';
  sub: string;           // user id
  tenantId: string;
  branchId: string | null;
  roleId: string | null;
  role: UserRole;
  sessionId: string;     // Session.jti
  email: string;
  permissions: string[]; // ['users.view', 'masters.create', ...]
  type: 'access';
}
```

### Access Token Payload (Super Admin)

```typescript
interface SuperAdminJwtPayload {
  principal: 'super_admin';
  sub: string;           // super admin id
  email: string;
  sessionId: string;     // SuperAdminSession.jti
  type: 'access';
}
```

### Token Configuration

| Setting | Env Variable | Default |
|---------|-------------|---------|
| Access secret | `JWT_ACCESS_SECRET` | — |
| Access TTL | `JWT_ACCESS_EXPIRES_IN` | `15m` |
| Refresh secret | `JWT_REFRESH_SECRET` | — |
| Refresh TTL | `JWT_REFRESH_EXPIRES_IN` | `7d` |

---

## Request Authentication Flow

```
HTTP Request
    │
    ▼
JwtAuthGuard (global APP_GUARD)
    │
    ├─ @Public() route? ──► Allow (skip auth)
    │
    ▼
Extract Bearer token from Authorization header
    │
    ▼
Passport JWT Strategy (jwt.strategy.ts)
    │
    ├─ Validate token signature + expiry
    ├─ Check type === 'access'
    ├─ Lookup session by jti in DB
    ├─ Verify session is active, not revoked, not expired
    ├─ Verify user/account is active, not deleted
    │
    ▼
Populate request.user with CurrentUser or CurrentSuperAdmin
    │
    ▼
TenantContextInterceptor
    │
    └─ Store tenantId in AsyncLocalStorage
```

### Session Revocation

The JWT strategy validates the session on **every request**, not just at token issuance. This means:

- Logout takes effect immediately (session marked revoked)
- Password change revokes all sessions
- Force-logout by admin takes effect immediately
- Access token expiry is a secondary check

---

## Token Refresh

**Endpoint:** `POST /auth/refresh` (`@Public()`)

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Flow:**
1. Verify refresh token signature
2. Check `type === 'refresh'`
3. Validate session still active
4. Issue new access + refresh token pair (rotation)
5. Update session `jti` and expiry

Works for all three principal types.

---

## Session Management

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /auth/sessions` | Bearer | List active sessions for current user |
| `POST /auth/sessions/:sessionId/revoke` | Bearer | Revoke a specific session |
| `POST /auth/logout` | Bearer | Revoke current session |
| `POST /auth/logout-all` | Bearer | Revoke all sessions for current user |

---

## Password Management

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /auth/change-password` | Bearer | User changes own password |
| `POST /auth/tenant/change-password` | Bearer + `TENANT_ADMIN` | Change tenant login password |

Password rules enforced via custom validators in the Users module.

---

## Public Routes

Routes marked `@Public()` skip JWT authentication:

| Route | Module |
|-------|--------|
| `POST /auth/login` | Auth |
| `POST /auth/tenant-login` | Auth |
| `POST /auth/super-admin/signup` | Auth |
| `POST /auth/super-admin/login` | Auth |
| `POST /auth/refresh` | Auth |
| `POST /tenants` | Tenants (tenant creation) |

> **Note:** The active health controller at `/health` does not currently have `@Public()`. It may require authentication unless updated.

---

## RBAC Resolution at Login

When a staff user logs in, `AuthService.resolveRbac()` builds the permissions array:

```
User
  └── UserRoleAssignment → Role
        └── RolePermission → Permission (module.action)
  └── UserPermission (direct grants)
        └── Permission (module.action)

Result: permissions: ['users.view', 'users.create', 'masters.view', ...]
```

This flat array is embedded in the JWT access token and checked by `PermissionsGuard` on each request.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/modules/auth/auth.module.ts` | Module config, global JwtAuthGuard |
| `src/modules/auth/auth.controller.ts` | Login/logout/session endpoints |
| `src/modules/auth/auth.service.ts` | Credential validation, token issuance |
| `src/modules/auth/strategies/jwt.strategy.ts` | Passport JWT validation |
| `src/modules/auth/guards/jwt-auth.guard.ts` | Global guard with @Public() bypass |
| `src/modules/auth/guards/super-admin.guard.ts` | Super-admin-only routes |
| `src/modules/auth/decorators/public.decorator.ts` | @Public() metadata |
| `src/modules/auth/interfaces/jwt-payload.interface.ts` | Token payload types |
| `src/common/utils/password.util.ts` | Argon2id hash/verify |

---

## Login Response Format

Auth endpoints return a wrapped envelope:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 900,
    "must_change_password": false,
    "user": {
      "id": "uuid",
      "email": "ahmed@kingfisherwings.com",
      "first_name": "Ahmed",
      "role": "TENANT_ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

See [API Response Standard](./api-response-standard.md) for full response shape documentation.
