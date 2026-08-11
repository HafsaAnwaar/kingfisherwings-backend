# Kingfisher Logistics ERP — Backend Overview

> **Project:** KingFisher Wings ERP (package name: `fresa-gold-backend`)
> **Author:** Kingfisher Wings Logistic LLC
> **Stack:** NestJS 10 · TypeScript 5 · PostgreSQL · **Prisma 5** · Passport JWT · class-validator · Swagger

---

## Important Note on ORM

The enterprise brief references TypeORM. The **actual codebase uses Prisma** as its ORM and migration tool. All data access goes through `@prisma/client` via `PrismaService`. There are no TypeORM entities, repositories, or migrations.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Request                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   Global ValidationPipe     │
              │   (whitelist, transform)    │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   JwtAuthGuard (APP_GUARD)  │  ← skips @Public() routes
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │ TenantContextInterceptor    │  ← AsyncLocalStorage tenantId
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │  Controller (route handler) │
              │  + RolesGuard (optional)    │
              │  + PermissionsGuard (opt.)  │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │  Service (business logic)   │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │  PrismaService.runWithTenant│  ← sets Postgres RLS context
              │  or Repository (Users only) │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │  PostgreSQL + RLS policies  │
              └─────────────────────────────┘
```

---

## Directory Structure

```
d:\FreightSaas\
├── prisma/
│   ├── schema.prisma          # Source of truth for all models & enums
│   ├── migrations/            # Timestamped SQL migrations
│   └── seed/                  # Super-admin seed script
│
├── src/
│   ├── main.ts                # Bootstrap, ValidationPipe, Swagger
│   ├── app.module.ts          # Root module, global interceptor
│   │
│   ├── prisma/                # Active Prisma layer (@Global)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts  # runWithTenant() for RLS
│   │
│   ├── common/                # Cross-cutting utilities
│   │   ├── constants/         # permission-catalog, role-catalog
│   │   ├── context/           # TenantContextStorage (AsyncLocalStorage)
│   │   ├── decorators/        # @Public() (health module copy)
│   │   ├── interceptors/      # TenantContextInterceptor
│   │   ├── interfaces/        # AuthenticatedUser
│   │   ├── middleware/        # tenant.middleware (stub)
│   │   └── utils/             # password, principal, rls helpers
│   │
│   ├── config/                # redis.config (prepared, not wired)
│   ├── health/                # Health check module
│   │
│   └── modules/
│       ├── auth/              # JWT auth, sessions, login flows
│       ├── users/             # User CRUD, RBAC guards/decorators
│       ├── tenants/           # Super-admin tenant provisioning
│       ├── companies/         # Multi-entity company management
│       ├── masters/           # 20 reference-data entities
│       ├── parties/           # Customers, agents, suppliers
│       ├── organization/      # Tenant profile, bank accounts, number formats
│       └── quotations/        # Quotations, tariffs, zip distances
│
├── test/                      # E2E tests
└── docs/                      # This documentation set
```

---

## Registered Modules

| Module | Route Prefix | Purpose |
|--------|-------------|---------|
| `HealthModule` | `/health` | Liveness + DB connectivity |
| `AuthModule` | `/auth` | Login, refresh, sessions, password |
| `TenantsModule` | `/tenants` | Super-admin tenant CRUD |
| `CompaniesModule` | `/companies` | Tenant company entities |
| `UsersModule` | `/users` | Staff user management |
| `MastersModule` | `/masters/*` | Reference master data (20 entities) |
| `PartiesModule` | `/parties` | Party CRUD + contacts/addresses |
| `OrganizationModule` | `/organization/*` | Tenant profile, bank accounts, number formats |
| `QuotationsModule` | `/quotations/*` | Quotations, tariffs, zip distances |

---

## Multi-Tenancy Model

The system is a **multi-tenant SaaS** with defense-in-depth isolation:

1. **Application layer** — Every query includes `tenant_id` in the `where` clause.
2. **Database layer** — PostgreSQL Row-Level Security (RLS) policies enforce `tenant_id = current_tenant_id()`.
3. **Transaction context** — `PrismaService.runWithTenant(tenantId, callback)` sets `app.tenant_id` via `set_tenant_context(uuid)` inside a transaction.

The `TenantContextInterceptor` stores `tenantId` in `AsyncLocalStorage` for request-scoped access, but **does not replace** explicit `runWithTenant()` calls in services.

---

## Principal Types

Three authenticated principal types share the JWT machinery:

| Principal | Login Endpoint | Scope |
|-----------|---------------|-------|
| **Staff User** | `POST /auth/login` | Tenant-scoped, has `tenantId`, `role`, `permissions` |
| **Tenant Owner** | `POST /auth/tenant-login` | Auto-provisioned `TENANT_ADMIN` user via tenant password |
| **Super Admin** | `POST /auth/super-admin/login` | Platform-level, no `tenantId` |

---

## Data Model Location

All database models are defined in `prisma/schema.prisma`:

- **Enums:** `UserRole`, `UserStatus`, `PartyType`, `QuotationStatus`, `TenantStatus`, etc.
- **Core tables:** `Tenant`, `User`, `Session`, `SuperAdmin`, `Company`, `Party`, `Quotation`, etc.
- **RBAC tables:** `Permission`, `Role`, `RolePermission`, `UserRoleAssignment`, `UserPermission`
- **Conventions:** UUID primary keys, `tenant_id` FK, `created_at`/`updated_at`, `deleted_at` soft delete, `created_by`/`updated_by` audit fields

There is no separate `entities/` folder for most modules. The Users module has a `UserEntity` class using `class-transformer` for serialization — this is **not** a TypeORM entity.

---

## Global Configuration

### Bootstrap (`src/main.ts`)

- CORS enabled
- Global `ValidationPipe`: `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`
- Swagger at `/docs` with Bearer auth
- Listens on `0.0.0.0` (Render deployment)

### Environment Variables (key)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Access token signing key |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (default `15m`) |
| `JWT_REFRESH_SECRET` | Refresh token signing key |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL |
| `PORT` | HTTP port (default `3000`) |

---

## NPM Scripts

| Script | Command |
|--------|---------|
| `start:dev` | `nest start --watch` |
| `build` | `nest build` |
| `prisma:generate` | `prisma generate` |
| `prisma:migrate:dev` | `prisma migrate dev` |
| `prisma:migrate:deploy` | `prisma migrate deploy` |
| `prisma:seed` | Seed super-admin |
| `test` | Jest unit tests |
| `test:e2e` | E2E tests |

---

## Path Aliases (Jest / tsconfig)

| Alias | Maps to |
|-------|---------|
| `@/*` | `src/*` |
| `@common/*` | `src/common/*` |
| `@config/*` | `src/config/*` |
| `@database/*` | `src/database/*` |
| `@modules/*` | `src/modules/*` |
| `@shared/*` | `src/shared/*` |

---

## Key Design Decisions

1. **Prisma over TypeORM** — Schema-first with generated client; migrations via `prisma migrate`.
2. **Explicit RLS** — `runWithTenant()` instead of transparent middleware/extensions.
3. **BaseMasterService** — DRY CRUD for flat reference data; custom services for domain aggregates.
4. **Repository only for Users** — Complex user aggregate warrants a dedicated repository; other modules use Prisma directly in services.
5. **No global response wrapper** — Controllers return data directly (see `api-response-standard.md`).
6. **No custom exception filters** — Standard NestJS `HttpException` subclasses only.
7. **Permission-based authorization preferred** — `@RequirePermissions()` over `@Roles()` for fine-grained control.

---

## Related Documentation

- [Decision log](./decision.md) — Why we chose libraries, patterns, and week-by-week product rules (Weeks 0–28)
- [System flows](./flow.md) — Entry points, request pipeline, and domain execution paths
- [Backend Patterns](./backend-patterns.md) — Detailed conventions and code patterns
- [Module Template](./module-template.md) — Reusable blueprint for new modules
- [Authentication Flow](./authentication-flow.md) — Login, JWT, sessions
- [Authorization Flow](./authorization-flow.md) — Roles, permissions, guards
- [API Response Standard](./api-response-standard.md) — Response shapes and status codes
