// src/modules/tenants/tenants.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { Prisma, TenantStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // CREATE TENANT
  // =====================================================

  async create(createTenantDto: CreateTenantDto) {
    await this.validateUniqueFields(createTenantDto);

    const tenant = await this.prisma.$transaction(async (tx) => {
      return tx.tenant.create({
        data: {
          ...createTenantDto,
        },
      });
    });

    return {
      success: true,
      message: 'Tenant created successfully.',
      data: tenant,
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

      data: tenants,

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
      data: tenant,
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

    const updatedTenant = await this.prisma.$transaction(
      async (tx) => {
        return tx.tenant.update({
          where: {
            id,
          },
          data: {
            ...updateTenantDto,
          },
        });
      },
    );

    return {
      success: true,
      message: 'Tenant updated successfully.',
      data: updatedTenant,
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
      data: restored,
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
      data: tenant,
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
      data: tenant,
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