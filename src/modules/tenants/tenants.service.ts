// src/modules/tenants/tenants.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { Prisma, Tenant, TenantStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { PERMISSION_CATALOG } from '../../common/constants/permission-catalog';
import { ROLE_CATALOG } from '../../common/constants/role-catalog';
import { setTenantContextQuery } from '../../common/utils/rls.util';

import { UserMapper } from '../users/mappers/user.mapper';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';
import { CountryLocaleService } from '../../common/locale/country-locale.service';

const OWNER_ROLE_CODE = 'TENANT_ADMIN';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locale: CountryLocaleService,
  ) {}

  // =====================================================
  // CREATE TENANT (+ its own login password, + an
  // auto-provisioned TENANT_ADMIN owner user so
  // POST /auth/tenant-login has something to issue a
  // real session for)
  // =====================================================

  async create(createTenantDto: CreateTenantDto, createdBySuperAdminId?: string) {
    await this.validateUniqueFields(createTenantDto);

    const {
      password,
      admin_first_name,
      admin_last_name,
      company_code,
      company_name,
      company_legal_name,
      company_registration_number,
      ...tenantData
    } = createTenantDto;

    // Country is optional. Only when provided do we suggest currency/timezone.
    if (tenantData.country_code) {
      const localeDefaults = this.locale.getLocaleDefaults(tenantData.country_code);
      tenantData.country_code = localeDefaults.countryCode ?? tenantData.country_code;
      if (!tenantData.base_currency && localeDefaults.baseCurrency) {
        tenantData.base_currency = localeDefaults.baseCurrency;
      }
      if (!tenantData.timezone && localeDefaults.timezone) {
        tenantData.timezone = localeDefaults.timezone;
      }
    }

    const passwordHash = await PasswordUtil.hash(password);

    const result = await this.prisma.$transaction(
      async (tx) => {
      const tenantCreateData: Prisma.TenantUncheckedCreateInput = {
        ...tenantData,
        password_hash: passwordHash,
        created_by_super_admin_id: createdBySuperAdminId,
      };

      const tenant = await tx.tenant.create({
        data: tenantCreateData,
      });

      // `tenants` itself has no RLS policy, but every write below this
      // point (permissions, roles, the owner user) touches tables that
      // do — set the context on THIS transaction now that the tenant
      // (and its id) exists.
      await tx.$executeRaw(setTenantContextQuery(tenant.id));

      // The default Company for this tenant — SuperAdmin can register
      // it explicitly (company_code/company_name), or it falls back to
      // the tenant's own code/name. Every tenant has exactly one
      // default company from creation onward; additional companies for
      // multi-entity groups are added later via POST /companies.
      const defaultCompany = await tx.company.create({
        data: {
          tenant_id: tenant.id,
          code: company_code ?? tenant.code,
          name: company_name ?? tenant.name,
          legal_name: company_legal_name,
          registration_number: company_registration_number,
          vat_number: tenant.vat_number,
          address: tenant.address,
          city: tenant.city,
          country_code: tenant.country_code,
          phone: tenant.phone,
          email: tenant.email,
          is_default: true,
          created_by: createdBySuperAdminId,
          updated_by: createdBySuperAdminId,
        },
      });

      // Permission is tenant-scoped (@@unique([tenant_id, module, action])),
      // so every new tenant needs its own copy of the catalog.
      const permissions = await Promise.all(
        PERMISSION_CATALOG.map((entry) =>
          tx.permission.create({
            data: {
              tenant_id: tenant.id,
              module: entry.module,
              action: entry.action,
              description: entry.description,
            },
          }),
        ),
      );

      // Seed every named role from the spec (all 10 tenant-scoped ones —
      // SUPER_ADMIN is the separate SuperAdmin table/principal, never a
      // Role row here) with its permission subset.
      const permissionsByCode = new Map(
        permissions.map((permission) => [`${permission.module}.${permission.action}`, permission]),
      );

      const rolesByCode = new Map<string, { id: string }>();

      for (const roleEntry of ROLE_CATALOG) {
        const role = await tx.role.create({
          data: {
            tenant_id: tenant.id,
            code: roleEntry.code,
            name: roleEntry.name,
            is_system: true,
            is_default: roleEntry.isDefault ?? false,
            is_active: true,
          },
        });

        rolesByCode.set(roleEntry.code, role);

        if (roleEntry.permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: roleEntry.permissions.map((code) => ({
              tenant_id: tenant.id,
              role_id: role.id,
              permission_id: permissionsByCode.get(code)!.id,
            })),
          });
        }
      }

      const ownerRole = rolesByCode.get(OWNER_ROLE_CODE)!;

      // The owner user POST /auth/tenant-login issues a session for.
      // Its own password_hash mirrors the tenant's (same plaintext was
      // just entered once) purely so it's also usable via the regular
      // POST /auth/login flow if ever needed — tenant-login itself only
      // ever checks Tenant.password_hash, never this field.
      const owner = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          company_id: defaultCompany.id,
          email: tenantData.email.toLowerCase(),
          password_hash: passwordHash,
          password_changed_at: new Date(),
          must_change_password: false,
          first_name: admin_first_name ?? 'Tenant',
          last_name: admin_last_name ?? 'Admin',
          role: 'TENANT_ADMIN',
          status: 'ACTIVE',
          email_verified: true,
          email_verified_at: new Date(),
          created_by_tenant_id: tenant.id,
        },
      });

      await tx.userRoleAssignment.create({
        data: { tenant_id: tenant.id, user_id: owner.id, role_id: ownerRole.id },
      });

      await tx.passwordHistory.create({
        data: {
          tenant_id: tenant.id,
          user_id: owner.id,
          password_hash: passwordHash,
          changed_by: createdBySuperAdminId,
          reason: 'INITIAL_PASSWORD',
        },
      });

      return { tenant, owner, company: defaultCompany };
    },
      { maxWait: 20_000, timeout: 60_000 },
    );

    return {
      success: true,
      message: 'Tenant created successfully. Log in at POST /auth/tenant-login with the password you set.',
      data: {
        tenant: this.sanitizeTenant(result.tenant),
        company: result.company,
        owner: UserMapper.toResponse(result.owner),
      },
    };
  }

  // =====================================================
  // SYNC PERMISSIONS
  //
  // Permission/RolePermission rows are seeded ONCE, at tenant
  // creation, from whatever PERMISSION_CATALOG/ROLE_CATALOG contained
  // at that moment. A tenant created before a later module (e.g.
  // Quotations, Companies) added new permission codes has no rows for
  // them at all — not "denied", genuinely absent — so every check
  // against those permissions fails. This reconciles a tenant's
  // permission set up to the current catalog without touching
  // anything it already has.
  // =====================================================

  async syncPermissions(tenantId: string) {
    const tenant = await this.ensureTenantExists(tenantId);

    const summary = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw(setTenantContextQuery(tenant.id));

      const existingPermissions = await tx.permission.findMany({ where: { tenant_id: tenantId } });
      const existingByCode = new Map(existingPermissions.map((p) => [`${p.module}.${p.action}`, p]));

      const missingCatalogEntries = PERMISSION_CATALOG.filter(
        (entry) => !existingByCode.has(`${entry.module}.${entry.action}`),
      );

      const createdPermissions = await Promise.all(
        missingCatalogEntries.map((entry) =>
          tx.permission.create({
            data: { tenant_id: tenantId, module: entry.module, action: entry.action, description: entry.description },
          }),
        ),
      );

      const permissionsByCode = new Map([
        ...existingByCode,
        ...createdPermissions.map((p) => [`${p.module}.${p.action}`, p] as const),
      ]);

      const roles = await tx.role.findMany({ where: { tenant_id: tenantId } });
      const roleByCode = new Map(roles.map((r) => [r.code, r]));

      let grantsAdded = 0;

      for (const roleEntry of ROLE_CATALOG) {
        let role = roleByCode.get(roleEntry.code);

        if (!role) {
          role = await tx.role.create({
            data: {
              tenant_id: tenantId,
              code: roleEntry.code,
              name: roleEntry.name,
              is_system: true,
              is_default: roleEntry.isDefault ?? false,
            },
          });
          roleByCode.set(roleEntry.code, role);
        }

        const existingGrants = await tx.rolePermission.findMany({ where: { tenant_id: tenantId, role_id: role.id } });
        const grantedIds = new Set(existingGrants.map((g) => g.permission_id));

        const toGrant = roleEntry.permissions
          .map((code) => permissionsByCode.get(code))
          .filter((p): p is NonNullable<typeof p> => !!p && !grantedIds.has(p.id));

        if (toGrant.length > 0) {
          await tx.rolePermission.createMany({
            data: toGrant.map((p) => ({ tenant_id: tenantId, role_id: role.id, permission_id: p.id })),
          });
          grantsAdded += toGrant.length;
        }
      }

      const missingRoles = ROLE_CATALOG.filter((r) => !roleByCode.has(r.code)).map((r) => r.code);

      return {
        permissionsCreated: createdPermissions.length,
        roleGrantsAdded: grantsAdded,
        rolesMissingEntirely: missingRoles,
      };
    });

    return {
      success: true,
      message:
        summary.permissionsCreated === 0 && summary.roleGrantsAdded === 0
          ? 'Already up to date — nothing to sync.'
          : `Synced: ${summary.permissionsCreated} new permission(s) created, ${summary.roleGrantsAdded} new role grant(s) added.`,
      data: summary,
    };
  }

  /** Same reconciliation across every tenant — for a catalog change that affects everyone, not just one test tenant. */
  async syncPermissionsForAllTenants() {
    const tenants = await this.prisma.tenant.findMany({ where: { deleted_at: null }, select: { id: true, code: true } });

    const results = [];

    for (const tenant of tenants) {
      const result = await this.syncPermissions(tenant.id);
      results.push({ tenantId: tenant.id, tenantCode: tenant.code, ...result.data });
    }

    return {
      success: true,
      message: `Synced permissions for ${tenants.length} tenant(s).`,
      data: results,
    };
  }

  // =====================================================
  // GET ALL TENANTS
  // =====================================================

  async findAll(query: TenantQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      order = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.TenantWhereInput = {
      deleted_at: null,
    };

    if (search) {
      where.OR = [
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          display_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [tenants, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
      }),

      this.prisma.tenant.count({
        where,
      }),
    ]);

    return {
      success: true,

      data: tenants.map((tenant) => this.sanitizeTenant(tenant)),

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
    // =====================================================
  // GET TENANT BY ID
  // =====================================================

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant with ID '${id}' was not found.`,
      );
    }

    return {
      success: true,
      data: this.sanitizeTenant(tenant),
    };
  }

  // =====================================================
  // UPDATE TENANT
  // =====================================================

  async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
  ) {
    const existingTenant = await this.prisma.tenant.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!existingTenant) {
      throw new NotFoundException(
        `Tenant with ID '${id}' was not found.`,
      );
    }

    // -----------------------------
    // Duplicate Code Check
    // -----------------------------

    if (
      updateTenantDto.code &&
      updateTenantDto.code !== existingTenant.code
    ) {
      const duplicate = await this.prisma.tenant.findFirst({
        where: {
          code: updateTenantDto.code,
          id: {
            not: id,
          },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'Tenant code already exists.',
        );
      }
    }

    // -----------------------------
    // Duplicate Slug Check
    // -----------------------------

    if (
      updateTenantDto.slug &&
      updateTenantDto.slug !== existingTenant.slug
    ) {
      const duplicate = await this.prisma.tenant.findFirst({
        where: {
          slug: updateTenantDto.slug,
          id: {
            not: id,
          },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'Tenant slug already exists.',
        );
      }
    }

    // -----------------------------
    // Duplicate Domain Check
    // -----------------------------

    if (
      updateTenantDto.domain &&
      updateTenantDto.domain !== existingTenant.domain
    ) {
      const duplicate = await this.prisma.tenant.findFirst({
        where: {
          domain: updateTenantDto.domain,
          id: {
            not: id,
          },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'Tenant domain already exists.',
        );
      }
    }

    // -----------------------------
    // Duplicate Email Check
    // -----------------------------

    if (
      updateTenantDto.email &&
      updateTenantDto.email !== existingTenant.email
    ) {
      const duplicate = await this.prisma.tenant.findFirst({
        where: {
          email: updateTenantDto.email,
          id: {
            not: id,
          },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'Tenant email already exists.',
        );
      }
    }

    if ('password' in updateTenantDto) {
      throw new BadRequestException(
        'Tenant password cannot be changed via PATCH /tenants/:id.',
      );
    }

    const patch: UpdateTenantDto = { ...updateTenantDto };
    // Optional country: only auto-align currency/timezone when country is newly set.
    if (patch.country_code) {
      const defaults = this.locale.getLocaleDefaults(patch.country_code);
      patch.country_code = defaults.countryCode ?? patch.country_code;
      if (patch.base_currency === undefined && defaults.baseCurrency) {
        patch.base_currency = defaults.baseCurrency;
      }
      if (patch.timezone === undefined && defaults.timezone) {
        patch.timezone = defaults.timezone;
      }
    }

    const updatedTenant = await this.prisma.$transaction(
      async (tx) => {
        return tx.tenant.update({
          where: {
            id,
          },
          data: {
            ...patch,
          },
        });
      },
    );

    return {
      success: true,
      message: 'Tenant updated successfully.',
      data: this.sanitizeTenant(updatedTenant),
    };
  }

  // =====================================================
  // SOFT DELETE TENANT
  // =====================================================

  async remove(id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant with ID '${id}' was not found.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: {
          id,
        },
        data: {
          deleted_at: new Date(),
          is_active: false,
          status: TenantStatus.ARCHIVED,
        },
      });
    });

    return {
      success: true,
      message: 'Tenant deleted successfully.',
    };
  }
    // =====================================================
  // RESTORE TENANT
  // =====================================================

  async restore(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant with ID '${id}' was not found.`,
      );
    }

    if (!tenant.deleted_at) {
      throw new BadRequestException(
        'Tenant is already active.',
      );
    }

    const restored = await this.prisma.tenant.update({
      where: { id },
      data: {
        deleted_at: null,
        is_active: true,
        status: TenantStatus.ACTIVE,
      },
    });

    return {
      success: true,
      message: 'Tenant restored successfully.',
      data: this.sanitizeTenant(restored),
    };
  }

  // =====================================================
  // ACTIVATE TENANT
  // =====================================================

  async activate(id: string) {
    await this.ensureTenantExists(id);

    const tenant = await this.prisma.tenant.update({
      where: {
        id,
      },
      data: {
        is_active: true,
        status: TenantStatus.ACTIVE,
      },
    });

    return {
      success: true,
      message: 'Tenant activated successfully.',
      data: this.sanitizeTenant(tenant),
    };
  }

  // =====================================================
  // DEACTIVATE TENANT
  // =====================================================

  async deactivate(id: string) {
    await this.ensureTenantExists(id);

    const tenant = await this.prisma.tenant.update({
      where: {
        id,
      },
      data: {
        is_active: false,
        status: TenantStatus.SUSPENDED,
      },
    });

    return {
      success: true,
      message: 'Tenant deactivated successfully.',
      data: this.sanitizeTenant(tenant),
    };
  }

  // =====================================================
  // TENANT STATISTICS
  // =====================================================

  async statistics() {
    const [
      total,
      active,
      inactive,
      trial,
      expired,
      archived,
    ] = await Promise.all([
      this.prisma.tenant.count(),

      this.prisma.tenant.count({
        where: {
          status: TenantStatus.ACTIVE,
        },
      }),

      this.prisma.tenant.count({
        where: {
          is_active: false,
        },
      }),

      this.prisma.tenant.count({
        where: {
          status: TenantStatus.TRIAL,
        },
      }),

      this.prisma.tenant.count({
        where: {
          status: TenantStatus.EXPIRED,
        },
      }),

      this.prisma.tenant.count({
        where: {
          status: TenantStatus.ARCHIVED,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        inactive,
        trial,
        expired,
        archived,
      },
    };
  }

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  /** Never return password_hash — applied to every response that includes a tenant. */
  private sanitizeTenant(tenant: Tenant): Omit<Tenant, 'password_hash'> {
    const { password_hash, ...safe } = tenant;
    return safe;
  }

  private async validateUniqueFields(
    dto: CreateTenantDto,
  ): Promise<void> {
    const existing = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          {
            code: dto.code,
          },
          {
            slug: dto.slug,
          },
          ...(dto.domain
            ? [
                {
                  domain: dto.domain,
                },
              ]
            : []),
          ...(dto.email
            ? [
                {
                  email: dto.email,
                },
              ]
            : []),
        ],
      },
    });

    if (!existing) {
      return;
    }

    if (existing.code === dto.code) {
      throw new ConflictException(
        'Tenant code already exists.',
      );
    }

    if (existing.slug === dto.slug) {
      throw new ConflictException(
        'Tenant slug already exists.',
      );
    }

    if (
      dto.domain &&
      existing.domain === dto.domain
    ) {
      throw new ConflictException(
        'Tenant domain already exists.',
      );
    }

    if (
      dto.email &&
      existing.email === dto.email
    ) {
      throw new ConflictException(
        'Tenant email already exists.',
      );
    }
  }

  private async ensureTenantExists(
    id: string,
  ) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant with ID '${id}' was not found.`,
      );
    }

    return tenant;
  }
}