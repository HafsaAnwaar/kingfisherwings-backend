import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(
    tx: Prisma.TransactionClient,
    data: Prisma.UserCreateInput,
  ): Promise<User> {
    return tx.user.create({
      data,
    });
  }

  // ============================================================
  // FIND BY ID
  // ============================================================

  async findById(
    tenantId: string,
    id: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });
  }

  // ============================================================
  // FIND BY EMAIL
  // ============================================================

  async findByEmail(
    tenantId: string,
    email: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        tenant_id: tenantId,
        email: email.toLowerCase(),
        deleted_at: null,
      },
    });
  }

  // ============================================================
  // FIND BY INVITE TOKEN
  // ============================================================

  async findByInviteToken(
    token: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        invite_token: token,
        deleted_at: null,
      },
    });
  }

  // ============================================================
  // FIND BY PASSWORD RESET TOKEN
  // ============================================================

  async findByPasswordResetToken(
    token: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        password_reset_token: token,
        deleted_at: null,
      },
    });
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    tx: Prisma.TransactionClient,
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return tx.user.update({
      where: {
        id,
      },
      data,
    });
  }

  // ============================================================
  // DELETE (SOFT DELETE)
  // ============================================================

  async softDelete(
    tx: Prisma.TransactionClient,
    id: string,
    deletedBy?: string,
  ): Promise<User> {
    return tx.user.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
        updated_by: deletedBy,
      },
    });
  }

  // ============================================================
  // RESTORE
  // ============================================================

  async restore(
    tx: Prisma.TransactionClient,
    id: string,
    restoredBy?: string,
  ): Promise<User> {
    return tx.user.update({
      where: {
        id,
      },
      data: {
        deleted_at: null,
        updated_by: restoredBy,
      },
    });
  }

  // ============================================================
  // HARD DELETE
  // ============================================================

  async delete(
    tx: Prisma.TransactionClient,
    id: string,
  ): Promise<User> {
    return tx.user.delete({
      where: {
        id,
      },
    });
  }

  // ============================================================
  // EXISTS
  // ============================================================

  async exists(
    tenantId: string,
    id: string,
  ): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    return count > 0;
  }

    // ============================================================
  // LIST USERS
  // ============================================================

  async findMany(
    tenantId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      role?: string;
      status?: string;
      branch_id?: string;
      department_id?: string;
      is_active?: boolean;
      sortBy?: string;
      order?: 'asc' | 'desc';
    },
  ) {

    const {
      page,
      limit,
      search,
      role,
      status,
      branch_id,
      department_id,
      is_active,
      sortBy = 'created_at',
      order = 'desc',
    } = options;

    const where: Prisma.UserWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    // ------------------------------------------------------------
    // Search
    // ------------------------------------------------------------

    if (search) {
      where.OR = [
        {
          first_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          last_name: {
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
        {
          phone: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // ------------------------------------------------------------
    // Filters
    // ------------------------------------------------------------

    if (role) {
      where.role = role as any;
    }

    if (status) {
      where.status = status as any;
    }

    if (branch_id) {
      where.branch_id = branch_id;
    }

    if (department_id) {
      where.department_id = department_id;
    }

    if (typeof is_active === 'boolean') {
      where.status = is_active
        ? {
            not: 'DISABLED' as any,
          }
        : 'DISABLED' as any;
    }

    // ------------------------------------------------------------
    // Execute
    // ------------------------------------------------------------

    const [users, total] =
      await this.prisma.$transaction([

        this.prisma.user.findMany({

          where,

          skip: (page - 1) * limit,

          take: limit,

          orderBy: {
            [sortBy]: order,
          },

        }),

        this.prisma.user.count({
          where,
        }),

      ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================
  // COUNT
  // ============================================================

  async count(
    tenantId: string,
  ): Promise<number> {

    return this.prisma.user.count({

      where: {

        tenant_id: tenantId,

        deleted_at: null,

      },

    });

  }

  // ============================================================
  // COUNT ACTIVE
  // ============================================================

  async countActive(
    tenantId: string,
  ): Promise<number> {

    return this.prisma.user.count({

      where: {

        tenant_id: tenantId,

        deleted_at: null,

        status: 'ACTIVE',

      },

    });

  }

  // ============================================================
  // COUNT BY ROLE
  // ============================================================

  async countByRole(
    tenantId: string,
    role: string,
  ): Promise<number> {

    return this.prisma.user.count({

      where: {

        tenant_id: tenantId,

        role: role as any,

        deleted_at: null,

      },

    });

  }

  // ============================================================
  // UPDATE LOGIN INFO
  // ============================================================

  async updateLoginInformation(
    tx: Prisma.TransactionClient,

    userId: string,

    ip?: string,
  ) {

    return tx.user.update({

      where: {

        id: userId,

      },

      data: {

        last_login_at: new Date(),

        last_login_ip: ip,

        failed_login_count: 0,

      },

    });

  }

  // ============================================================
  // INCREMENT FAILED LOGIN
  // ============================================================

  async incrementFailedLogin(
    tx: Prisma.TransactionClient,

    userId: string,
  ) {

    return tx.user.update({

      where: {

        id: userId,

      },

      data: {

        failed_login_count: {

          increment: 1,

        },

      },

    });

  }

  // ============================================================
  // RESET FAILED LOGIN
  // ============================================================

  async resetFailedLogin(
    tx: Prisma.TransactionClient,

    userId: string,
  ) {

    return tx.user.update({

      where: {

        id: userId,

      },

      data: {

        failed_login_count: 0,

      },

    });

  }

  // ============================================================
  // LOCK ACCOUNT
  // ============================================================

  async lockAccount(
    tx: Prisma.TransactionClient,

    userId: string,

    until: Date,
  ) {

    return tx.user.update({

      where: {

        id: userId,

      },

      data: {

        locked_until: until,

      },

    });

  }

  // ============================================================
  // UNLOCK ACCOUNT
  // ============================================================

  async unlockAccount(
    tx: Prisma.TransactionClient,

    userId: string,
  ) {

    return tx.user.update({

      where: {

        id: userId,

      },

      data: {

        locked_until: null,

        failed_login_count: 0,

      },

    });

  }
  
}
