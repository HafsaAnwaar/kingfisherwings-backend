# Backend Patterns

This document catalogs the recurring patterns found across the Kingfisher Logistics ERP backend. Follow these conventions exactly when adding new code.

---

## 1. Module Architecture

### Standard Module Layout

```
src/modules/<module-name>/
├── <module-name>.module.ts
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── dto/
│   ├── <entity>.dto.ts          # CreateXxxDto, UpdateXxxDto
│   └── <entity>-query.dto.ts    # Pagination + filters
├── constants/
│   └── <module>-permission.constants.ts
├── entities/                     # Optional — class-transformer only (Users)
├── mappers/                      # Optional — explicit field mapping (Users)
├── responses/                    # Optional — Swagger response DTOs (Users)
├── guards/                       # Optional — module-specific guards
├── decorators/                   # Optional — module-specific decorators
└── helpers/                      # Optional — pure utility functions
```

### Module Registration Pattern

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [XxxController],
  providers: [XxxService],
  exports: [XxxService],
})
export class XxxModule {}
```

Register new modules in `src/app.module.ts` imports array.

### Aggregated Modules

The `MastersModule` registers 20 sub-entities in a single module file using `CONTROLLERS` and `SERVICES` arrays. New master entities follow the same pattern.

---

## 2. Entity Patterns (Prisma)

Entities are defined in `prisma/schema.prisma`, not as TypeScript classes.

### Standard Tenant-Scoped Model

```prisma
model Country {
  id         String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id  String    @db.Uuid
  tenant     Tenant    @relation(fields: [tenant_id], references: [id])

  // Business fields
  iso_code   String    @db.VarChar(2)
  name       String    @db.VarChar(100)
  is_active  Boolean   @default(true)

  // Audit
  created_by String?   @db.Uuid
  updated_by String?   @db.Uuid
  created_at DateTime  @default(now()) @db.Timestamptz
  updated_at DateTime  @updatedAt @db.Timestamptz
  deleted_at DateTime? @db.Timestamptz

  @@unique([tenant_id, iso_code])
  @@index([tenant_id, deleted_at])
  @@map("countries")
}
```

### Conventions

| Concern | Convention |
|---------|------------|
| Primary key | UUID via `uuid_generate_v4()` |
| Tenant FK | `tenant_id` on every tenant-scoped table |
| Soft delete | `deleted_at DateTime?` — filter `deleted_at: null` in all reads |
| Audit | `created_by`, `updated_by`, `created_at`, `updated_at` |
| Unique constraints | Composite `@@unique([tenant_id, natural_key])` |
| Table name | Plural snake_case via `@@map("table_name")` |
| Column names | snake_case in DB, mapped in Prisma |
| Enums | Defined in schema, imported from `@prisma/client` in DTOs |

### TypeScript Entity Classes (Optional)

Only used in the Users module for `class-transformer` serialization:

```typescript
export class UserEntity {
  @Expose() id!: string;
  @Exclude() password_hash!: string;
}
```

This is **not** an ORM entity. Prisma-generated types (`User`, `Country`, etc.) are used everywhere else.

---

## 3. DTO Patterns

### Create DTO

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'AE', description: 'ISO 3166-1 alpha-2' })
  @IsString()
  @Length(2, 2)
  iso_code!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
```

### Update DTO

```typescript
import { PartialType } from '@nestjs/swagger';

export class UpdateCountryDto extends PartialType(CreateCountryDto) {}
```

Use `PartialType` from `@nestjs/swagger` (not `@nestjs/mapped-types`) so Swagger inherits property metadata.

### Query DTO (Pagination + Filters)

```typescript
export class MasterQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 200 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  limit: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';
}
```

### DTO Conventions

| Rule | Detail |
|------|--------|
| Required fields | Use `!` definite assignment assertion |
| Optional fields | `@IsOptional()` + `?` type modifier |
| Enums | `@IsEnum(PrismaEnum)` + `@ApiProperty({ enum: PrismaEnum })` |
| UUIDs | `@IsUUID()` + `@ApiPropertyOptional({ format: 'uuid' })` |
| Query coercion | `@Transform(({ value }) => Number(value))` for numbers |
| Boolean coercion | `@Transform(({ value }) => value === 'true' \|\| value === true)` |
| Swagger examples | Always provide `@ApiProperty({ example: '...' })` |

---

## 4. Controller Patterns

### Standard CRUD Controller

```typescript
@ApiTags('Masters — Countries')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('masters/countries')
export class CountriesController {
  constructor(private readonly service: CountriesService) {}

  @Get()
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List countries' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: MasterQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  @RequirePermissions(MASTERS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a country' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateCountryDto,
  ) {
    return this.service.create(tenantId, { ...dto }, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(MASTERS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a country' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }
}
```

### Controller Conventions

| Concern | Pattern |
|---------|---------|
| Route params | `@Param('id', ParseUUIDPipe)` for UUID validation |
| Tenant context | `@CurrentUser('tenantId') tenantId: string` |
| Actor for audit | `@CurrentUser('id') actorId: string` |
| Delete responses | `@HttpCode(HttpStatus.NO_CONTENT)` + `void` return |
| Guard order | `JwtAuthGuard` (global) → `RolesGuard` → `PermissionsGuard` |
| Public routes | `@Public()` decorator (auth module only) |
| Swagger tags | `'Module — Entity'` format for masters |

---

## 5. Service Patterns

### Pattern A: BaseMasterService (flat reference data)

```typescript
@Injectable()
export class CountriesService extends BaseMasterService<Country> {
  protected readonly modelName = 'country';
  protected readonly searchFields = ['name', 'iso_code', 'iso3_code'];
  protected readonly uniqueKeyLabel = 'ISO code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
```

`BaseMasterService` provides: `create`, `findAll`, `findOne`, `update`, `softDelete`.

Override methods when custom business logic is needed (see `CompaniesService`).

### Pattern B: Custom Service (domain aggregates)

```typescript
@Injectable()
export class PartiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: PartyQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.PartyWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
      };
      // ... filters, pagination ...
      const [data, total] = await Promise.all([
        tx.party.findMany({ where, skip, take, orderBy }),
        tx.party.count({ where }),
      ]);
      return { data, meta: { page, limit, total, totalPages } };
    });
  }
}
```

### Pattern C: Service + Repository (complex aggregates)

Used by the Users module. Service orchestrates business logic; repository handles all Prisma queries. Repository methods accept `Prisma.TransactionClient` for atomicity.

### Service Conventions

| Rule | Detail |
|------|--------|
| Tenant isolation | Always wrap in `prisma.runWithTenant(tenantId, ...)` |
| Soft delete | Set `deleted_at: new Date()`, never hard delete |
| Audit fields | Pass `actorId` as `created_by` / `updated_by` |
| Unique violations | Catch Prisma `P2002` → `ConflictException` |
| Not found | `NotFoundException('Record not found.')` |
| Business rules | `BadRequestException` with descriptive message |

---

## 6. Repository Patterns

Repositories are used **only** in the Users module. The pattern:

```typescript
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(tx: Prisma.TransactionClient, tenantId: string, id: string): Promise<User | null> {
    return tx.user.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
    });
  }
}
```

### When to Use a Repository

| Use Repository | Use Prisma in Service |
|----------------|----------------------|
| Complex aggregate with 10+ query methods | Simple CRUD (masters via BaseMasterService) |
| Multiple services share data access | Single service owns all queries |
| Bulk operations, password history | Flat reference data |

For new modules, default to **Pattern A or B** unless complexity warrants a repository.

---

## 7. Validation Approach

### Global Pipe (configured in `main.ts`)

```typescript
new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  transform: true,           // Coerce types (query strings → numbers)
  forbidNonWhitelisted: true // Reject requests with extra fields
})
```

### Validation Decorators Used

| Decorator | Usage |
|-----------|-------|
| `@IsString()`, `@IsEmail()`, `@IsUUID()` | Type checks |
| `@Length(min, max)`, `@MinLength()`, `@MaxLength()` | String bounds |
| `@IsInt()`, `@Min()`, `@Max()` | Number bounds |
| `@IsEnum(PrismaEnum)` | Enum validation |
| `@IsOptional()` | Optional fields |
| `@IsBoolean()`, `@IsArray()`, `@ArrayUnique()` | Collections |
| `@Matches(regex)` | Pattern matching |
| `@IsPhoneNumber()`, `@IsTimeZone()` | Domain-specific |
| Custom validators | `validators/password.validator.ts` |

### Custom Validators

Place in `validators/` within the module. Register with `@Validate(MyValidator)`.

---

## 8. Guards and Decorators

### Global Guard

`JwtAuthGuard` registered via `APP_GUARD` in `AuthModule`. Skips routes marked `@Public()`.

### Route-Level Guards

```typescript
@UseGuards(RolesGuard, PermissionsGuard)
```

### Decorators

| Decorator | Module | Purpose |
|-----------|--------|---------|
| `@Public()` | auth, common | Skip JWT authentication |
| `@CurrentUser()` | users, auth | Extract `request.user` |
| `@CurrentUser('tenantId')` | all protected | Extract specific field |
| `@Roles(UserRole.TENANT_ADMIN)` | users | Require specific role(s) |
| `@RequirePermissions('module.action')` | all protected | Require permission(s) |

---

## 9. Exception Handling

No custom exception filters. Use NestJS built-in exceptions:

| Exception | When |
|-----------|------|
| `UnauthorizedException` | Invalid/missing auth, revoked session |
| `ForbiddenException` | Missing role or permission |
| `NotFoundException` | Record not found |
| `ConflictException` | Unique constraint violation (P2002) |
| `BadRequestException` | Business rule violation, invalid input |

Prisma error handling in services:

```typescript
try {
  return await this.delegate(tx).create({ data });
} catch (error: any) {
  if (error?.code === 'P2002') {
    throw new ConflictException(`A record with this ${this.uniqueKeyLabel} already exists.`);
  }
  throw error;
}
```

---

## 10. Swagger Documentation Style

### Controller Level

```typescript
@ApiTags('Parties')
@ApiBearerAuth()
```

### Endpoint Level

```typescript
@ApiOperation({ summary: 'List parties (customers, agents, suppliers, carriers, etc.)' })
@ApiResponse({ status: HttpStatus.OK, type: PaginatedUsersResponse })  // Users module
@ApiConsumes('multipart/form-data')  // File uploads
```

### DTO Level

```typescript
@ApiProperty({ example: 'CUST-001' })
@ApiPropertyOptional({ enum: PartyType })
@ApiPropertyOptional({ format: 'uuid' })
```

Swagger UI available at `/docs` after server start.

---

## 11. Database Migration Approach

### Prisma Migrations (primary)

```bash
# Development: create and apply migration
npm run prisma:migrate:dev

# Production: apply pending migrations
npm run prisma:migrate:deploy

# Regenerate client after schema changes
npm run prisma:generate
```

Migrations live in `prisma/migrations/<timestamp>_<name>/migration.sql`.

### Workflow

1. Edit `prisma/schema.prisma`
2. Run `prisma migrate dev --name descriptive_name`
3. Prisma generates SQL and applies it
4. Commit both `schema.prisma` and migration folder

### RLS Migrations

Row-Level Security is applied via dedicated migrations that create:

- `current_tenant_id()` function
- `set_tenant_context(uuid)` function
- `enable_rls_for_table(text)` helper
- Per-table RLS policies on `tenant_id`

Reference SQL also exists at `src/database/migrations/001_enable_rls.sql`.

---

## 12. Naming Conventions

| Concern | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `party-query.dto.ts` |
| Classes | PascalCase | `PartiesService` |
| DB columns | snake_case | `tenant_id`, `created_at` |
| TS/API fields | camelCase in JWT/DTOs | `tenantId`, `branchId` |
| API routes | kebab-case, plural | `/parties`, `/masters/countries` |
| Permission codes | `module.action` lowercase | `users.create`, `masters.view` |
| Constants | SCREAMING_SNAKE | `USERS_PERMISSIONS.VIEW` |
| Prisma models | PascalCase singular | `Country`, `Party` |
| Prisma delegates | camelCase | `tx.country`, `tx.party` |
| Module permission file | `<module>-permission.constants.ts` | `parties-permission.constants.ts` |

---

## 13. Shared Utilities

### `common/utils/password.util.ts`

- Argon2id hashing and verification
- `generateTemporaryPassword()` for user provisioning

### `common/utils/principal.util.ts`

- `isSuperAdminPrincipal(user)` — structural check (no `tenantId` key)

### `common/utils/rls.util.ts`

- `setTenantContextQuery(tenantId)` — Prisma raw SQL for RLS

### `common/context/tenant-context.storage.ts`

- `AsyncLocalStorage` wrapper: `run(tenantId, callback)`, `getTenantId()`

### `common/constants/permission-catalog.ts`

- Aggregates all module permissions; seeded per tenant on creation

### `common/constants/role-catalog.ts`

- 10 tenant roles with permission subsets; seeded per tenant on creation

### `config/redis.config.ts`

- `registerAs('redis', ...)` — prepared but not imported in AppModule

---

## 14. Permission Constants Pattern

Every module with protected routes defines:

```typescript
// constants/<module>-permission.constants.ts
export const MODULE_PERMISSION_CONSTANTS = {
  MODULE: 'module_name',
  ACTIONS: {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
  },
} as const;

export const MODULE_PERMISSIONS = {
  VIEW: `${MODULE_PERMISSION_CONSTANTS.MODULE}.${MODULE_PERMISSION_CONSTANTS.ACTIONS.VIEW}`,
  CREATE: `${MODULE_PERMISSION_CONSTANTS.MODULE}.${MODULE_PERMISSION_CONSTANTS.ACTIONS.CREATE}`,
  // ...
} as const;
```

Then register actions in `common/constants/permission-catalog.ts` and assign to roles in `role-catalog.ts`.
