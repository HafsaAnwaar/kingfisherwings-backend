import { Injectable } from "@nestjs/common";
import { Prisma, User, UserStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UserSearchFilters } from "./users.types";

/**
 * UsersRepository
 *
 * Data-access layer for the User aggregate. Every read is scoped to
 * `tenant_id` (defense in depth on top of Postgres RLS) and excludes
 * soft-deleted rows unless explicitly stated otherwise. All writes that
 * are part of a business transaction accept a Prisma.TransactionClient
 * so the caller (service layer) controls atomicity.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(
    tx: Prisma.TransactionClient,
    data: Prisma.UserCreateInput,
  ): Promise<User> {
    return tx.user.create({ data });
  }

  // ============================================================
  // READ — SINGLE
  // ============================================================

  async findById(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id: string,
  ): Promise<User | null> {
    return tx.user.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
    });
  }

  async findByIdIncludingDeleted(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id: string,
  ): Promise<User | null> {
    return tx.user.findFirst({
      where: { id, tenant_id: tenantId },
    });
  }

  async findByIdWithRelations(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id: string,
  ) {
    return tx.user.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
      include: {
        tenant: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async findByEmail(
    tx: Prisma.TransactionClient,
    tenantId: string,
    email: string,
  ): Promise<User | null> {
    return tx.user.findFirst({
      where: {
        tenant_id: tenantId,
        email: email.toLowerCase(),
        deleted_at: null,
      },
    });
  }

  async findByEmailIncludingDeleted(
    tx: Prisma.TransactionClient,
    tenantId: string,
    email: string,
  ): Promise<User | null> {
    return tx.user.findFirst({
      where: {
        tenant_id: tenantId,
        email: email.toLowerCase(),
      },
    });
  }

  async findByInviteToken(
    tx: Prisma.TransactionClient,
    token: string,
  ): Promise<User | null> {
    return tx.user.findFirst({
      where: { invite_token: token, deleted_at: null },
    });
  }

  async findByPasswordResetToken(
    tx: Prisma.TransactionClient,
    token: string,
  ): Promise<User | null> {
    return tx.user.findFirst({
      where: { password_reset_token: token, deleted_at: null },
    });
  }

  // ============================================================
  // READ — MANY
  // ============================================================

  async findByIds(
    tx: Prisma.TransactionClient,
    tenantId: string,
    ids: string[],
  ): Promise<User[]> {
    return tx.user.findMany({
      where: {
        tenant_id: tenantId,
        id: { in: ids },
        deleted_at: null,
      },
    });
  }

  async findMany(
    tx: Prisma.TransactionClient,
    tenantId: string,
    options: UserSearchFilters & { sortBy?: string; order?: "asc" | "desc" },
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page,
      limit,
      search,
      role,
      status,
      branchId,
      departmentId,
      sortBy = "created_at",
      order = "desc",
    } = options;

    const where: Prisma.UserWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role as Prisma.EnumUserRoleFilter["equals"];
    }

    if (status) {
      where.status = status as Prisma.EnumUserStatusFilter["equals"];
    }

    if (branchId) {
      where.branch_id = branchId;
    }

    if (departmentId) {
      where.department_id = departmentId;
    }

    const [users, total] = await Promise.all([
      tx.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      tx.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // ============================================================
  // EXISTENCE / COUNTS
  // ============================================================

  async exists(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id: string,
  ): Promise<boolean> {
    const count = await tx.user.count({
      where: { id, tenant_id: tenantId, deleted_at: null },
    });
    return count > 0;
  }

  async existsByEmail(
    tx: Prisma.TransactionClient,
    tenantId: string,
    email: string,
    excludeId?: string,
  ): Promise<boolean> {
    const count = await tx.user.count({
      where: {
        tenant_id: tenantId,
        email: email.toLowerCase(),
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async count(tx: Prisma.TransactionClient, tenantId: string): Promise<number> {
    return tx.user.count({
      where: { tenant_id: tenantId, deleted_at: null },
    });
  }

  async countActive(
    tx: Prisma.TransactionClient,
    tenantId: string,
  ): Promise<number> {
    return tx.user.count({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async countByRole(
    tx: Prisma.TransactionClient,
    tenantId: string,
    role: string,
  ): Promise<number> {
    return tx.user.count({
      where: {
        tenant_id: tenantId,
        role: role as Prisma.EnumUserRoleFilter["equals"],
        deleted_at: null,
      },
    });
  }

  async countByStatus(
    tx: Prisma.TransactionClient,
    tenantId: string,
    status: UserStatus,
  ): Promise<number> {
    return tx.user.count({
      where: { tenant_id: tenantId, status, deleted_at: null },
    });
  }

  // ============================================================
  // UPDATE — GENERAL
  // ============================================================

  async update(
    tx: Prisma.TransactionClient,
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return tx.user.update({ where: { id }, data });
  }

  async updateStatus(
    tx: Prisma.TransactionClient,
    id: string,
    status: UserStatus,
    updatedBy?: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: { status, updated_by: updatedBy },
    });
  }

  async bulkUpdateStatus(
    tx: Prisma.TransactionClient,
    tenantId: string,
    ids: string[],
    status: UserStatus,
    updatedBy?: string,
  ): Promise<Prisma.BatchPayload> {
    return tx.user.updateMany({
      where: { id: { in: ids }, tenant_id: tenantId, deleted_at: null },
      data: { status, updated_by: updatedBy },
    });
  }

  // ============================================================
  // UPDATE — PASSWORD LIFECYCLE
  // ============================================================

  async updatePassword(
    tx: Prisma.TransactionClient,
    id: string,
    passwordHash: string,
    options: {
      updatedBy?: string;
      mustChangePassword?: boolean;
      passwordExpiresAt?: Date | null;
    } = {},
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        password_hash: passwordHash,
        password_changed_at: new Date(),
        password_expires_at: options.passwordExpiresAt ?? null,
        must_change_password: options.mustChangePassword ?? false,
        password_reset_token: null,
        password_reset_expires: null,
        updated_by: options.updatedBy,
      },
    });
  }

  async setPasswordResetToken(
    tx: Prisma.TransactionClient,
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        password_reset_token: token,
        password_reset_expires: expiresAt,
      },
    });
  }

  async clearPasswordResetToken(
    tx: Prisma.TransactionClient,
    id: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        password_reset_token: null,
        password_reset_expires: null,
      },
    });
  }

  async getPasswordHistory(
    tx: Prisma.TransactionClient,
    tenantId: string,
    userId: string,
    limit: number,
  ) {
    return tx.passwordHistory.findMany({
      where: { tenant_id: tenantId, user_id: userId },
      orderBy: { changed_at: "desc" },
      take: limit,
    });
  }

  // ============================================================
  // UPDATE — INVITE / EMAIL VERIFICATION
  // ============================================================

  async setInviteToken(
    tx: Prisma.TransactionClient,
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        invite_token: token,
        invite_expires_at: expiresAt,
      },
    });
  }

  async clearInviteToken(
    tx: Prisma.TransactionClient,
    id: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        invite_token: null,
        invite_expires_at: null,
      },
    });
  }

  async verifyEmail(tx: Prisma.TransactionClient, id: string): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        email_verified: true,
        email_verified_at: new Date(),
      },
    });
  }

  // ============================================================
  // UPDATE — TWO-FACTOR AUTHENTICATION
  // ============================================================

  async enableTwoFactor(
    tx: Prisma.TransactionClient,
    id: string,
    secret: string,
    backupCodes: string[],
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        two_factor_enabled: true,
        two_factor_secret: secret,
        two_factor_backup_codes: backupCodes,
      },
    });
  }

  async disableTwoFactor(
    tx: Prisma.TransactionClient,
    id: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: [],
      },
    });
  }

  async replaceTwoFactorBackupCodes(
    tx: Prisma.TransactionClient,
    id: string,
    backupCodes: string[],
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: { two_factor_backup_codes: backupCodes },
    });
  }

  // ============================================================
  // UPDATE — REFRESH TOKEN (legacy single-token field)
  // ============================================================

  async updateRefreshTokenHash(
    tx: Prisma.TransactionClient,
    id: string,
    hash: string | null,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: { refresh_token_hash: hash },
    });
  }

  // ============================================================
  // UPDATE — LOGIN SECURITY
  // ============================================================

  async updateLoginInformation(
    tx: Prisma.TransactionClient,
    userId: string,
    ip?: string,
    device?: string,
    browser?: string,
    location?: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id: userId },
      data: {
        last_login_at: new Date(),
        last_login_ip: ip,
        last_login_device: device,
        last_login_browser: browser,
        last_login_location: location,
        last_activity_at: new Date(),
        failed_login_count: 0,
      },
    });
  }

  async touchActivity(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id: userId },
      data: { last_activity_at: new Date() },
    });
  }

  async incrementFailedLogin(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id: userId },
      data: {
        failed_login_count: { increment: 1 },
        last_failed_login_at: new Date(),
      },
    });
  }

  async resetFailedLogin(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id: userId },
      data: { failed_login_count: 0 },
    });
  }

  async lockAccount(
    tx: Prisma.TransactionClient,
    userId: string,
    until: Date,
  ): Promise<User> {
    return tx.user.update({
      where: { id: userId },
      data: { locked_until: until, status: UserStatus.LOCKED },
    });
  }

  async unlockAccount(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id: userId },
      data: {
        locked_until: null,
        failed_login_count: 0,
        status: UserStatus.ACTIVE,
      },
    });
  }

  // ============================================================
  // DELETE
  // ============================================================

  async softDelete(
    tx: Prisma.TransactionClient,
    id: string,
    deletedBy?: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_by: deletedBy,
      },
    });
  }

  async bulkSoftDelete(
    tx: Prisma.TransactionClient,
    tenantId: string,
    ids: string[],
    deletedBy?: string,
  ): Promise<Prisma.BatchPayload> {
    return tx.user.updateMany({
      where: { id: { in: ids }, tenant_id: tenantId, deleted_at: null },
      data: { deleted_at: new Date(), updated_by: deletedBy },
    });
  }

  async restore(
    tx: Prisma.TransactionClient,
    id: string,
    restoredBy?: string,
  ): Promise<User> {
    return tx.user.update({
      where: { id },
      data: {
        deleted_at: null,
        updated_by: restoredBy,
      },
    });
  }

  async delete(tx: Prisma.TransactionClient, id: string): Promise<User> {
    return tx.user.delete({ where: { id } });
  }
}
