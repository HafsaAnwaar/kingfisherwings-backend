# Authorization Flow

This document describes how authorization (access control) works after authentication.

---

## Overview

Authorization operates on two axes:

1. **Roles** — Coarse-grained, based on `UserRole` enum (`@Roles()`)
2. **Permissions** — Fine-grained, based on `module.action` codes (`@RequirePermissions()`)

**Permissions are preferred** for new endpoints. Roles are used when an entire controller should be restricted to a specific role (e.g., `TENANT_ADMIN` only).

```
Request (authenticated)
    │
    ▼
JwtAuthGuard (global)
    │  Populates request.user
    ▼
RolesGuard (optional, per-controller/route)
    │  Checks user.role against @Roles()
    │  Super admin bypasses
    ▼
PermissionsGuard (optional, per-controller/route)
    │  Checks user.permissions against @RequirePermissions()
    │  Super admin bypasses
    ▼
Controller handler executes
```

---

## Guard Chain

### Execution Order

Guards execute in registration order. The global `JwtAuthGuard` always runs first (registered via `APP_GUARD` in `AuthModule`). Controller-level guards run after:

```typescript
@UseGuards(RolesGuard, PermissionsGuard)  // JwtAuthGuard is implicit (global)
```

### Guard Behavior Summary

| Guard | Scope | Checks | Bypass |
|-------|-------|--------|--------|
| `JwtAuthGuard` | Global | Valid JWT + active session | `@Public()` routes |
| `RolesGuard` | Per route/controller | `user.role` in `@Roles(...)` | Super admin |
| `PermissionsGuard` | Per route/controller | ALL `@RequirePermissions(...)` in `user.permissions` | Super admin |
| `SuperAdminGuard` | Per route | `principal === 'super_admin'` | — |

### Fail-Closed Behavior

All guards throw exceptions rather than silently allowing:

- No `request.user` → `UnauthorizedException('Authentication required.')`
- Missing role → `ForbiddenException('Requires one of the following roles: ...')`
- Missing permission → `ForbiddenException('Missing required permission(s): ...')`
- No `@Roles()` or `@RequirePermissions()` metadata → guard passes (no restriction)

---

## Permission System

### Permission Code Format

```
module.action
```

Examples: `users.view`, `users.create`, `masters.delete`, `parties.manage_credit`

### Module Permission Constants

Each module defines its permissions:

```typescript
// src/modules/parties/constants/parties-permission.constants.ts
export const PARTIES_PERMISSION_CONSTANTS = {
  MODULE: 'parties',
  ACTIONS: {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE_CREDIT: 'manage_credit',
  },
} as const;

export const PARTIES_PERMISSIONS = {
  VIEW: 'parties.view',
  CREATE: 'parties.create',
  UPDATE: 'parties.update',
  DELETE: 'parties.delete',
  MANAGE_CREDIT: 'parties.manage_credit',
} as const;
```

### Central Permission Catalog

All module permissions are aggregated in `src/common/constants/permission-catalog.ts`:

```typescript
export const PERMISSION_CATALOG: PermissionCatalogEntry[] = [
  // users.view, users.create, ...
  // masters.view, masters.create, ...
  // parties.view, parties.create, ...
  // quotations.view, quotations.create, ...
];
```

When a new tenant is created, `TenantsService` seeds a `Permission` row for every catalog entry.

### Using Permissions in Controllers

```typescript
@Get()
@RequirePermissions(PARTIES_PERMISSIONS.VIEW)
findAll(...) { ... }

@Patch(':id/credit-status')
@RequirePermissions(PARTIES_PERMISSIONS.MANAGE_CREDIT)
updateCreditStatus(...) { ... }
```

`@RequirePermissions()` accepts multiple permissions — **ALL** must be present:

```typescript
@RequirePermissions(USERS_PERMISSIONS.VIEW, USERS_PERMISSIONS.UPDATE)
```

---

## Role System

### UserRole Enum

Defined in `prisma/schema.prisma`:

```
SUPER_ADMIN, TENANT_ADMIN, BRANCH_MANAGER, FINANCE_MANAGER,
ACCOUNTANT, SALES_MANAGER, SALES_EXECUTIVE, OPERATIONS_MANAGER,
OPERATIONS_EXECUTIVE, WAREHOUSE_STAFF, HR_MANAGER, CUSTOMER,
AGENT, READ_ONLY, DOCUMENTATION, CUSTOMER_SUPPORT, DRIVER
```

> `SUPER_ADMIN` is a separate `SuperAdmin` table/principal — never a tenant-scoped `Role` row.

### Role Catalog

`src/common/constants/role-catalog.ts` defines 10 tenant roles with permission subsets:

| Role | Typical Permissions |
|------|-------------------|
| `TENANT_ADMIN` | All permissions |
| `BRANCH_MANAGER` | Users CRUD + masters/parties/quotations view+create+update |
| `SALES_MANAGER` | Users view+create, parties CRUD, quotations full |
| `OPERATIONS_MANAGER` | Users view+update, masters/parties/quotations view |
| `FINANCE_MANAGER` | Users view, parties view, quotations view+approve |
| `READ_ONLY` | View-only across modules |

Seeded per tenant on creation via `TenantsService`.

### Using Roles in Controllers

```typescript
// Entire controller restricted to tenant admin
@UseGuards(RolesGuard)
@Roles(UserRole.TENANT_ADMIN)
@Controller('companies')

// Single endpoint restricted
@UseGuards(RolesGuard)
@Roles(UserRole.TENANT_ADMIN)
@Post('tenant/change-password')
```

`@Roles()` accepts multiple roles — user needs **any one** of them.

---

## RBAC Data Model

```
Tenant
  ├── Permission (tenant_id, module, action)     ← seeded from catalog
  ├── Role (tenant_id, code, name)                 ← seeded from catalog
  │     └── RolePermission → Permission
  └── User
        ├── UserRoleAssignment → Role
        └── UserPermission → Permission (direct grants)
```

### Permission Resolution at Login

```
1. Load UserRoleAssignment for user
2. Follow Role → RolePermission → Permission
3. Load direct UserPermission grants
4. Deduplicate into flat string[]: ['users.view', 'masters.create', ...]
5. Embed in JWT access token
```

Permissions are cached in the JWT for the access token lifetime. Session revocation handles immediate logout; permission changes take effect on next login or token refresh.

---

## Super Admin Authorization

Super admins are detected structurally — they have no `tenantId` property:

```typescript
// src/common/utils/principal.util.ts
export function isSuperAdminPrincipal(principal: unknown): boolean {
  return (
    !!principal &&
    typeof principal === 'object' &&
    !('tenantId' in (principal as Record<string, unknown>))
  );
}
```

Super admins:
- Bypass `RolesGuard` and `PermissionsGuard` entirely
- Can create users in any tenant (must provide `tenant_id` in body)
- Access tenant management endpoints via `SuperAdminGuard`

---

## Authorization Patterns by Module

| Module | Authorization Pattern |
|--------|----------------------|
| Masters (all 20) | `RolesGuard` + `PermissionsGuard` + `@RequirePermissions(MASTERS_PERMISSIONS.*)` |
| Parties | `RolesGuard` + `PermissionsGuard` + `@RequirePermissions(PARTIES_PERMISSIONS.*)` |
| Quotations | `RolesGuard` + `PermissionsGuard` + `@RequirePermissions(QUOTATIONS_PERMISSIONS.*)` |
| Users | `RolesGuard` + `PermissionsGuard` + `@RequirePermissions(USERS_PERMISSIONS.*)` |
| Companies | `RolesGuard` + `@Roles(TENANT_ADMIN)` only |
| Tenants | `SuperAdminGuard` for management; `@Public()` for creation |
| Organization | `RolesGuard` + `PermissionsGuard` (varies by endpoint) |
| Auth (password) | `RolesGuard` + `@Roles(TENANT_ADMIN)` for tenant password |

---

## Adding Permissions for a New Module

1. Create `constants/<module>-permission.constants.ts` with `MODULE`, `ACTIONS`, and `<MODULE>_PERMISSIONS`
2. Register actions in `src/common/constants/permission-catalog.ts`
3. Assign permissions to roles in `src/common/constants/role-catalog.ts`
4. Apply `@RequirePermissions()` on controller endpoints
5. Add `@UseGuards(RolesGuard, PermissionsGuard)` on controller

---

## Decorator Reference

| Decorator | Location | Usage |
|-----------|----------|-------|
| `@RequirePermissions(...codes)` | `users/decorators/permissions.decorator.ts` | Fine-grained access |
| `@Roles(...roles)` | `users/decorators/roles.decorator.ts` | Coarse role check |
| `@CurrentUser()` | `users/decorators/current-user.decorator.ts` | Extract authenticated user |
| `@CurrentUser('tenantId')` | Same | Extract specific field |
| `@Public()` | `auth/decorators/public.decorator.ts` | Skip authentication |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/modules/users/guards/roles.guard.ts` | Role-based access control |
| `src/modules/users/guards/permissions.guard.ts` | Permission-based access control |
| `src/modules/auth/guards/super-admin.guard.ts` | Super-admin-only routes |
| `src/common/constants/permission-catalog.ts` | All system permissions |
| `src/common/constants/role-catalog.ts` | Role → permission mappings |
| `src/common/utils/principal.util.ts` | Super admin detection |
| `src/modules/users/interfaces/current-user.interface.ts` | Authenticated user shape |
