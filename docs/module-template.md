# Module Template — Reusable Blueprint

This document provides copy-paste-ready templates for creating new modules in the Kingfisher Logistics ERP backend. Choose the appropriate pattern based on your entity complexity.

---

## Decision Guide

| Entity Type | Pattern | Example |
|-------------|---------|---------|
| Flat reference data, tenant-unique keys | **A: BaseMasterService** | Countries, Ports, Banks |
| Flat data with custom business rules | **B: BaseMasterService + overrides** | Companies |
| Domain aggregate with relations | **C: Custom Service** | Parties, Quotations |
| Complex aggregate, many queries | **D: Service + Repository** | Users |

---

## Folder Structure

### Pattern A/B/C (standard)

```
src/modules/<module-name>/
├── <module-name>.module.ts
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── dto/
│   ├── <entity>.dto.ts
│   └── <entity>-query.dto.ts
└── constants/
    └── <module>-permission.constants.ts
```

### Pattern D (with repository)

```
src/modules/<module-name>/
├── <module-name>.module.ts
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.repository.ts
├── dto/
│   ├── <entity>.dto.ts
│   └── <entity>-query.dto.ts
├── constants/
│   └── <module>-permission.constants.ts
├── mappers/
│   └── <entity>.mapper.ts
└── responses/
    └── <entity>.response.ts
```

---

## Step-by-Step Checklist

- [ ] 1. Add Prisma model to `prisma/schema.prisma`
- [ ] 2. Run `npm run prisma:migrate:dev -- --name add_<entity>`
- [ ] 3. Create module folder with files from templates below
- [ ] 4. Create permission constants
- [ ] 5. Register permissions in `src/common/constants/permission-catalog.ts`
- [ ] 6. Assign permissions to roles in `src/common/constants/role-catalog.ts`
- [ ] 7. Register module in `src/app.module.ts`
- [ ] 8. Verify Swagger at `/docs`

---

## Prisma Model Template

Add to `prisma/schema.prisma`:

```prisma
model Widget {
  id         String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  tenant_id  String    @db.Uuid
  tenant     Tenant    @relation(fields: [tenant_id], references: [id])

  // Business fields
  code       String    @db.VarChar(30)
  name       String    @db.VarChar(200)
  is_active  Boolean   @default(true)

  // Audit
  created_by String?   @db.Uuid
  updated_by String?   @db.Uuid
  created_at DateTime  @default(now()) @db.Timestamptz
  updated_at DateTime  @updatedAt @db.Timestamptz
  deleted_at DateTime? @db.Timestamptz

  @@unique([tenant_id, code])
  @@index([tenant_id, deleted_at])
  @@map("widgets")
}
```

Add relation to `Tenant` model:

```prisma
model Tenant {
  // ...existing fields...
  widgets Widget[]
}
```

After RLS migration exists, add RLS for the new table in a migration:

```sql
SELECT enable_rls_for_table('widgets');
```

---

## Permission Constants Template

`src/modules/<module>/constants/<module>-permission.constants.ts`:

```typescript
export const WIDGETS_PERMISSION_CONSTANTS = {
  MODULE: 'widgets',
  ACTIONS: {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
  },
} as const;

export const WIDGETS_PERMISSIONS = {
  VIEW: `${WIDGETS_PERMISSION_CONSTANTS.MODULE}.${WIDGETS_PERMISSION_CONSTANTS.ACTIONS.VIEW}`,
  CREATE: `${WIDGETS_PERMISSION_CONSTANTS.MODULE}.${WIDGETS_PERMISSION_CONSTANTS.ACTIONS.CREATE}`,
  UPDATE: `${WIDGETS_PERMISSION_CONSTANTS.MODULE}.${WIDGETS_PERMISSION_CONSTANTS.ACTIONS.UPDATE}`,
  DELETE: `${WIDGETS_PERMISSION_CONSTANTS.MODULE}.${WIDGETS_PERMISSION_CONSTANTS.ACTIONS.DELETE}`,
} as const;
```

Register in `src/common/constants/permission-catalog.ts`:

```typescript
import { WIDGETS_PERMISSION_CONSTANTS } from '../../modules/widgets/constants/widgets-permission.constants';

// Add to PERMISSION_CATALOG array:
...Object.values(WIDGETS_PERMISSION_CONSTANTS.ACTIONS).map((action) => ({
  module: WIDGETS_PERMISSION_CONSTANTS.MODULE,
  action,
  description: `${WIDGETS_PERMISSION_CONSTANTS.MODULE}.${action}`,
})),
```

Assign to roles in `src/common/constants/role-catalog.ts`:

```typescript
import { WIDGETS_PERMISSIONS } from '../../modules/widgets/constants/widgets-permission.constants';

// Add to TENANT_ADMIN permissions:
...Object.values(WIDGETS_PERMISSIONS),

// Add to other roles as appropriate:
WIDGETS_PERMISSIONS.VIEW,
```

---

## DTO Templates

### Create / Update DTO

`src/modules/<module>/dto/<entity>.dto.ts`:

```typescript
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateWidgetDto {
  @ApiProperty({ example: 'WDG-001' })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: 'Standard Widget' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateWidgetDto extends PartialType(CreateWidgetDto) {}
```

### Query DTO (Pagination + Filters)

`src/modules/<module>/dto/<entity>-query.dto.ts`:

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class WidgetQueryDto {
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

  @ApiPropertyOptional({ description: 'Matches name, code.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';
}
```

For domain-specific filters, extend with enum/UUID fields (see `PartyQueryDto`).

---

## Module Template

`src/modules/<module>/<module>.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WidgetsController } from './widgets.controller';
import { WidgetsService } from './widgets.service';

@Module({
  imports: [PrismaModule],
  controllers: [WidgetsController],
  providers: [WidgetsService],
  exports: [WidgetsService],
})
export class WidgetsModule {}
```

Register in `src/app.module.ts`:

```typescript
import { WidgetsModule } from './modules/widgets/widgets.module';

@Module({
  imports: [
    // ...existing...
    WidgetsModule,
  ],
})
export class AppModule {}
```

---

## Service Templates

### Pattern A: BaseMasterService

`src/modules/<module>/<entity>.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { Widget } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseMasterService } from '../masters/base-master.service';

@Injectable()
export class WidgetsService extends BaseMasterService<Widget> {
  protected readonly modelName = 'widget';
  protected readonly searchFields = ['name', 'code'];
  protected readonly uniqueKeyLabel = 'widget code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
```

### Pattern B: BaseMasterService with Overrides

```typescript
import { BadRequestException, Injectable } from '@nestjs/common';
import { Widget } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseMasterService } from '../masters/base-master.service';

@Injectable()
export class WidgetsService extends BaseMasterService<Widget> {
  protected readonly modelName = 'widget';
  protected readonly searchFields = ['name', 'code'];
  protected readonly uniqueKeyLabel = 'widget code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async softDelete(tenantId: string, id: string, actorId?: string): Promise<void> {
    const widget = await this.findOne(tenantId, id);

    if (widget.some_protected_flag) {
      throw new BadRequestException('Cannot delete a protected widget.');
    }

    await super.softDelete(tenantId, id, actorId);
  }
}
```

### Pattern C: Custom Service

```typescript
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WidgetQueryDto } from './dto/widget-query.dto';

@Injectable()
export class WidgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: Record<string, unknown>, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      try {
        return await tx.widget.create({
          data: {
            ...data,
            tenant_id: tenantId,
            created_by: actorId,
            updated_by: actorId,
          },
        });
      } catch (error: any) {
        if (error?.code === 'P2002') {
          throw new ConflictException('A widget with this code already exists.');
        }
        throw error;
      }
    });
  }

  async findAll(tenantId: string, query: WidgetQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.WidgetWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
      };

      if (query.is_active !== undefined) {
        where.is_active = query.is_active;
      }

      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        tx.widget.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: query.order },
        }),
        tx.widget.count({ where }),
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
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const record = await tx.widget.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });

      if (!record) {
        throw new NotFoundException('Widget not found.');
      }

      return record;
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.widget.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });

      if (!existing) {
        throw new NotFoundException('Widget not found.');
      }

      try {
        return await tx.widget.update({
          where: { id },
          data: { ...data, updated_by: actorId },
        });
      } catch (error: any) {
        if (error?.code === 'P2002') {
          throw new ConflictException('A widget with this code already exists.');
        }
        throw error;
      }
    });
  }

  async softDelete(tenantId: string, id: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.widget.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });

      if (!existing) {
        throw new NotFoundException('Widget not found.');
      }

      await tx.widget.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }
}
```

### Pattern D: Repository Template

`src/modules/<module>/<module>.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { Prisma, Widget } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WidgetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tx: Prisma.TransactionClient, data: Prisma.WidgetCreateInput): Promise<Widget> {
    return tx.widget.create({ data });
  }

  async findById(tx: Prisma.TransactionClient, tenantId: string, id: string): Promise<Widget | null> {
    return tx.widget.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
    });
  }

  async findMany(
    tx: Prisma.TransactionClient,
    tenantId: string,
    filters: { search?: string; is_active?: boolean },
    pagination: { skip: number; take: number; order: 'asc' | 'desc' },
  ): Promise<Widget[]> {
    const where: Prisma.WidgetWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return tx.widget.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { created_at: pagination.order },
    });
  }

  async count(tx: Prisma.TransactionClient, tenantId: string, filters: { search?: string; is_active?: boolean }): Promise<number> {
    const where: Prisma.WidgetWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return tx.widget.count({ where });
  }

  async update(tx: Prisma.TransactionClient, id: string, data: Prisma.WidgetUpdateInput): Promise<Widget> {
    return tx.widget.update({ where: { id }, data });
  }

  async softDelete(tx: Prisma.TransactionClient, id: string, deletedBy?: string): Promise<Widget> {
    return tx.widget.update({
      where: { id },
      data: { deleted_at: new Date(), updated_by: deletedBy },
    });
  }
}
```

Service using repository:

```typescript
@Injectable()
export class WidgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: WidgetsRepository,
  ) {}

  async findAll(tenantId: string, query: WidgetQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [data, total] = await Promise.all([
        this.repository.findMany(tx, tenantId, { search: query.search, is_active: query.is_active }, {
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          order: query.order,
        }),
        this.repository.count(tx, tenantId, { search: query.search, is_active: query.is_active }),
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
    });
  }
}
```

---

## Controller Template

`src/modules/<module>/<entity>.controller.ts`:

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { WidgetsService } from './widgets.service';
import { CreateWidgetDto, UpdateWidgetDto } from './dto/widget.dto';
import { WidgetQueryDto } from './dto/widget-query.dto';

import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { WIDGETS_PERMISSIONS } from './constants/widgets-permission.constants';

@ApiTags('Widgets')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('widgets')
export class WidgetsController {
  constructor(private readonly service: WidgetsService) {}

  @Get()
  @RequirePermissions(WIDGETS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List widgets' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: WidgetQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(WIDGETS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get a widget by id' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(WIDGETS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a widget' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.service.create(tenantId, { ...dto }, actorId);
  }

  @Patch(':id')
  @RequirePermissions(WIDGETS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a widget' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.service.update(tenantId, id, { ...dto }, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(WIDGETS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a widget' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }
}
```

### Master Entity Controller Variant

For entities under `/masters/`:

```typescript
@ApiTags('Masters — Widgets')
@Controller('masters/widgets')
```

---

## Swagger Template

Controller-level:

```typescript
@ApiTags('Widgets')           // Human-readable module name
@ApiBearerAuth()              // All protected routes
```

Per-endpoint:

```typescript
@ApiOperation({ summary: 'List widgets' })
@ApiResponse({ status: HttpStatus.OK, description: 'Paginated widget list' })  // optional
```

DTO-level:

```typescript
@ApiProperty({ example: 'WDG-001', description: 'Unique widget code within tenant' })
@ApiPropertyOptional({ enum: WidgetStatus, default: WidgetStatus.ACTIVE })
@ApiPropertyOptional({ format: 'uuid' })
```

---

## Pagination Template

Reuse `MasterQueryDto` for simple entities:

```typescript
import { MasterQueryDto } from '../masters/dto/master-query.dto';
// Use directly in controller: @Query() query: MasterQueryDto
```

For entities with extra filters, create a dedicated query DTO extending the pagination fields (see `PartyQueryDto`).

Standard service implementation:

```typescript
const skip = (query.page - 1) * query.limit;

const [data, total] = await Promise.all([
  tx.entity.findMany({ where, skip, take: query.limit, orderBy }),
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

## Search and Filter Template

```typescript
const where: Prisma.EntityWhereInput = {
  tenant_id: tenantId,
  deleted_at: null,
};

// Boolean filter
if (query.is_active !== undefined) {
  where.is_active = query.is_active;
}

// Enum filter
if (query.status) {
  where.status = query.status;
}

// UUID filter
if (query.company_id) {
  where.company_id = query.company_id;
}

// Free-text search
if (query.search) {
  where.OR = ['name', 'code'].map((field) => ({
    [field]: { contains: query.search, mode: 'insensitive' },
  }));
}
```

---

## Error Handling Template

```typescript
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

// Not found
if (!record) {
  throw new NotFoundException('Widget not found.');
}

// Business rule violation
if (record.is_protected) {
  throw new BadRequestException('Cannot delete a protected widget.');
}

// Unique constraint (Prisma P2002)
try {
  return await tx.widget.create({ data });
} catch (error: any) {
  if (error?.code === 'P2002') {
    throw new ConflictException('A widget with this code already exists.');
  }
  throw error;
}
```

### Standard Error Messages

| Situation | Message Pattern |
|-----------|----------------|
| Not found | `'Record not found.'` or `'Widget not found.'` |
| Duplicate key | `'A record with this {uniqueKeyLabel} already exists.'` |
| Business rule | Descriptive sentence explaining why the action is blocked |
| Missing auth | `'Authentication required.'` (guards) |
| Missing permission | `'Missing required permission(s): {codes}.'` (guards) |

---

## Validation Template

DTO field validation by type:

```typescript
// Required string
@IsString()
@Length(1, 200)
name!: string;

// Optional string
@IsOptional()
@IsString()
description?: string;

// Email
@IsEmail()
email!: string;

// UUID
@IsUUID()
company_id!: string;

// Enum (from Prisma)
@IsEnum(WidgetStatus)
status!: WidgetStatus;

// Boolean with query-string coercion
@Transform(({ value }) => value === 'true' || value === true)
@IsBoolean()
is_active?: boolean;

// Integer with query-string coercion
@Transform(({ value }) => Number(value))
@IsInt()
@Min(1)
page: number = 1;

// Array
@IsArray()
@ArrayUnique()
@IsString({ each: true })
tags!: string[];
```

---

## Response Mapper Template (Optional)

For modules returning sensitive data, create explicit mappers:

`src/modules/<module>/responses/<entity>.response.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class WidgetResponse {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty() created_at!: Date;
}
```

`src/modules/<module>/mappers/<entity>.mapper.ts`:

```typescript
import { Widget } from '@prisma/client';
import { WidgetResponse } from '../responses/widget.response';

export class WidgetMapper {
  static toResponse(widget: Widget): WidgetResponse {
    return {
      id: widget.id,
      code: widget.code,
      name: widget.name,
      is_active: widget.is_active,
      created_at: widget.created_at,
    };
  }
}
```

---

## Masters Submodule Template

To add a new master entity to the existing `MastersModule`:

1. Create `src/modules/masters/<entities>/<entities>.service.ts` extending `BaseMasterService`
2. Create `src/modules/masters/<entities>/<entities>.controller.ts`
3. Create `src/modules/masters/dto/<entity>.dto.ts`
4. Add to `CONTROLLERS` and `SERVICES` arrays in `masters.module.ts`

No separate module file needed — all masters share one `MastersModule`.

---

## Related Documentation

- [Backend Overview](./backend-overview.md)
- [Backend Patterns](./backend-patterns.md)
- [Authentication Flow](./authentication-flow.md)
- [Authorization Flow](./authorization-flow.md)
- [API Response Standard](./api-response-standard.md)
