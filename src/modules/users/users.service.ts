import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { Prisma, User, Tenant, Branch, Department, UserStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { UsersRepository } from './users.repository';

import { PasswordUtil } from '../../common/utils/password.util';
import { PasswordHelper } from './helpers/password.helper';
import { AuditHelper } from './helpers/audit.helper';

import { USERS_CONSTANTS } from './constants/users.constants';
import { PASSWORD_CONSTANTS } from './constants/password.constants';

import {
  AdminResetPasswordResult,
  BulkActionResult,
  CreateUserResponse,
  CreatorContext,
  UserSearchFilters,
} from './users.types';

import { UserMapper } from './mappers/user.mapper';
import { UserResponse } from './responses/user.response';
import { PaginatedUsersResponse } from './responses/paginated-users.response';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { BulkUserDto, BulkUserAction } from './dto/bulk-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: UsersRepository,
  ) {}

  // ============================================================
  // VALIDATION HELPERS
  //
  // All of these except validateTenant() take `tx` and run against
  // tenant-scoped tables, so they must always be called from inside
  // this.prisma.runWithTenant(). validateTenant() itself queries
  // `tenants`, which has no RLS policy (see the migration's note on
  // why: it's the root table, resolved before any tenant context
  // exists), so it's always safe to call first, outside runWithTenant.
  // ============================================================

  private async validateTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, is_active: true, deleted_at: null },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant does not exist.');
    }

    if (tenant.subscription_ends && tenant.subscription_ends < new Date()) {
      throw new ForbiddenException('Tenant subscription has expired.');
    }

    return tenant;
  }

  private async validateEmailAvailable(
    tx: Prisma.TransactionClient,
    tenantId: string,
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const taken = await this.repository.existsByEmail(tx, tenantId, email, excludeId);

    if (taken) {
      throw new ConflictException('Email already exists.');
    }
  }

  private async validateUserLimit(tx: Prisma.TransactionClient, tenant: Tenant): Promise<void> {
    const totalUsers = await this.repository.count(tx, tenant.id);

    if (totalUsers >= tenant.max_users) {
      throw new ForbiddenException('Maximum user limit reached for this tenant.');
    }
  }

  private async validateCompany(
    tx: Prisma.TransactionClient,
    tenantId: string,
    companyId?: string,
  ): Promise<void> {
    if (!companyId) {
      return;
    }

    const company = await tx.company.findFirst({
      where: { id: companyId, tenant_id: tenantId, deleted_at: null },
    });

    if (!company) {
      throw new NotFoundException('Company not found.');
    }
  }

  private async validateBranch(
    tx: Prisma.TransactionClient,
    tenantId: string,
    branchId?: string,
  ): Promise<Branch | null> {
    if (!branchId) {
      return null;
    }

    const branch = await tx.branch.findFirst({
      where: { id: branchId, tenant_id: tenantId, deleted_at: null },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return branch;
  }

  private async validateDepartment(
    tx: Prisma.TransactionClient,
    tenantId: string,
    departmentId?: string,
  ): Promise<Department | null> {
    if (!departmentId) {
      return null;
    }

    const department = await tx.department.findFirst({
      where: { id: departmentId, tenant_id: tenantId, deleted_at: null },
    });

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    return department;
  }

  private async validateRole(tx: Prisma.TransactionClient, tenantId: string, roleId: string) {
    const role = await tx.role.findFirst({
      where: { id: roleId, tenant_id: tenantId, deleted_at: null, is_active: true },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleId} not found.`);
    }

    return role;
  }

  private async validatePermission(
    tx: Prisma.TransactionClient,
    tenantId: string,
    permissionId: string,
  ) {
    const permission = await tx.permission.findFirst({
      where: { id: permissionId, tenant_id: tenantId, deleted_at: null },
    });

    if (!permission) {
      throw new NotFoundException(`Permission ${permissionId} not found.`);
    }

    return permission;
  }

  private async getExistingOrThrow(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id: string,
  ): Promise<User> {
    const user = await this.repository.findById(tx, tenantId, id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  // ============================================================
  // AUDIT / LOGGING
  // ============================================================

  private log(action: string, message: string): void {
    this.logger.log(`[${action}] ${message}`);
  }

  private logError(action: string, error: unknown): void {
    this.logger.error(`[${action}]`, error instanceof Error ? error.stack : String(error));
  }

  // ============================================================
  // ROLE / PERMISSION ASSIGNMENT
  // ============================================================

  private async assignRoles(
    tx: Prisma.TransactionClient,
    tenantId: string,
    userId: string,
    roleIds: string[],
    assignedBy?: string,
  ): Promise<void> {
    for (const roleId of roleIds) {
      await this.validateRole(tx, tenantId, roleId);

      await tx.userRoleAssignment.upsert({
        where: { user_id_role_id: { user_id: userId, role_id: roleId } },
        create: { tenant_id: tenantId, user_id: userId, role_id: roleId, assigned_by: assignedBy },
        update: {},
      });
    }
  }

  private async replaceRoles(
    tx: Prisma.TransactionClient,
    tenantId: string,
    userId: string,
    roleIds: string[],
    assignedBy?: string,
  ): Promise<void> {
    await tx.userRoleAssignment.deleteMany({ where: { tenant_id: tenantId, user_id: userId } });
    await this.assignRoles(tx, tenantId, userId, roleIds, assignedBy);
  }

  private async assignPermissions(
    tx: Prisma.TransactionClient,
    tenantId: string,
    userId: string,
    permissionIds: string[],
    grantedBy?: string,
  ): Promise<void> {
    for (const permissionId of permissionIds) {
      await this.validatePermission(tx, tenantId, permissionId);

      await tx.userPermission.upsert({
        where: {
          tenant_id_user_id_permission_id: {
            tenant_id: tenantId,
            user_id: userId,
            permission_id: permissionId,
          },
        },
        create: {
          tenant_id: tenantId,
          user_id: userId,
          permission_id: permissionId,
          granted: true,
          created_by: grantedBy,
        },
        update: { granted: true },
      });
    }
  }

  private async replacePermissions(
    tx: Prisma.TransactionClient,
    tenantId: string,
    userId: string,
    permissionIds: string[],
    grantedBy?: string,
  ): Promise<void> {
    await tx.userPermission.deleteMany({ where: { tenant_id: tenantId, user_id: userId } });
    await this.assignPermissions(tx, tenantId, userId, permissionIds, grantedBy);
  }

  // ============================================================
  // CREATE
  // ============================================================

  async createUser(
    tenantId: string,
    dto: CreateUserDto,
    creator: CreatorContext = {},
  ): Promise<CreateUserResponse> {
    const creatorLabel = creator.superAdminId
      ? `super admin ${creator.superAdminId}`
      : creator.userId
        ? `user ${creator.userId}`
        : 'system';
    this.log('CREATE_USER', `Creating user ${dto.email} for tenant ${tenantId} (by ${creatorLabel})`);

    const tenant = await this.validateTenant(tenantId);

    const temporaryPassword = PasswordUtil.generateTemporaryPassword(
      PASSWORD_CONSTANTS.TEMP_PASSWORD_LENGTH,
    );
    const passwordHash = await PasswordUtil.hash(temporaryPassword);
    const auditActorId = creator.userId ?? creator.superAdminId;

    try {
      const user = await this.prisma.runWithTenant(tenantId, async (tx) => {
        await this.validateUserLimit(tx, tenant);
        await this.validateEmailAvailable(tx, tenantId, dto.email);
        await this.validateCompany(tx, tenantId, dto.company_id);
        await this.validateBranch(tx, tenantId, dto.branch_id);
        await this.validateDepartment(tx, tenantId, dto.department_id);

        const createdUser = await tx.user.create({
          data: {
            tenant_id: tenantId,
            email: dto.email.toLowerCase(),
            password_hash: passwordHash,
            password_changed_at: new Date(),
            password_expires_at: PasswordHelper.calculateExpiryDate(),
            must_change_password: true,
            first_name: dto.first_name,
            last_name: dto.last_name,
            phone: dto.phone,
            preferred_country_code: dto.preferred_country_code,
            avatar_url: dto.avatar_url,
            role: dto.role,
            status: dto.status ?? UserStatus.INVITED,
            company_id: dto.company_id,
            branch_id: dto.branch_id,
            department_id: dto.department_id,
            is_salesperson: dto.is_salesperson ?? false,
            is_cs_rep: dto.is_cs_rep ?? false,
            is_operations: dto.is_operations ?? false,
            is_finance: dto.is_finance ?? false,
            can_see_sales: dto.can_see_sales ?? false,
            can_see_cost: dto.can_see_cost ?? false,
            can_see_gp: dto.can_see_gp ?? false,
            can_see_invoices: dto.can_see_invoices ?? false,
            can_see_payments: dto.can_see_payments ?? false,
            can_see_bank_balances: dto.can_see_bank_balances ?? false,
            can_see_ar_ap: dto.can_see_ar_ap ?? false,
            can_see_mgmt_reports: dto.can_see_mgmt_reports ?? false,
            can_see_job_pnl: dto.can_see_job_pnl ?? false,
            office_hours_start: dto.office_hours_start,
            office_hours_end: dto.office_hours_end,
            office_hours_timezone: dto.office_hours_timezone,
            allowed_ips: dto.allowed_ips ?? [],
            allowed_mac_addresses: dto.allowed_mac_addresses ?? [],
            max_concurrent_sessions:
              dto.max_concurrent_sessions ?? USERS_CONSTANTS.DEFAULT_MAX_CONCURRENT_SESSIONS,
            two_factor_enabled: false,
            created_by_user_id: creator.userId,
            created_by_super_admin_id: creator.superAdminId,
            updated_by: auditActorId,
          },
        });

        await tx.passwordHistory.create({
          data: {
            tenant_id: tenantId,
            user_id: createdUser.id,
            password_hash: passwordHash,
            changed_by: auditActorId,
            reason: 'INITIAL_PASSWORD',
          },
        });

        const defaultRole = await tx.role.findFirst({
          where: {
            tenant_id: tenantId,
            code: USERS_CONSTANTS.DEFAULT_ROLE_CODE,
            is_active: true,
            deleted_at: null,
          },
        });

        if (defaultRole) {
          await tx.userRoleAssignment.create({
            data: {
              tenant_id: tenantId,
              user_id: createdUser.id,
              role_id: defaultRole.id,
              assigned_by: auditActorId,
            },
          });
        }

        if (dto.role_ids?.length) {
          await this.assignRoles(tx, tenantId, createdUser.id, dto.role_ids, auditActorId);
        }

        if (dto.permission_ids?.length) {
          await this.assignPermissions(tx, tenantId, createdUser.id, dto.permission_ids, auditActorId);
        }

        return createdUser;
      });

      this.log('CREATE_USER', `User ${user.email} created successfully.`);

      return {
        user,
        temporaryPassword,
      };
    } catch (error) {
      this.logError('CREATE_USER', error);
      throw error;
    }
  }

  // ============================================================
  // READ
  // ============================================================

  async findAll(tenantId: string, query: QueryUserDto): Promise<PaginatedUsersResponse> {
    await this.validateTenant(tenantId);

    const filters: UserSearchFilters & { sortBy?: string; order?: 'asc' | 'desc' } = {
      page: query.page,
      limit: Math.min(query.limit, USERS_CONSTANTS.MAX_LIMIT),
      search: query.search,
      role: query.role,
      status: query.status,
      branchId: query.branch_id,
      departmentId: query.department_id,
      sortBy: query.sortBy,
      order: query.order,
    };

    const result = await this.prisma.runWithTenant(tenantId, (tx) =>
      this.repository.findMany(tx, tenantId, filters),
    );

    return UserMapper.toPaginated(result);
  }

  async findOne(tenantId: string, id: string): Promise<UserResponse> {
    await this.validateTenant(tenantId);

    const user = await this.prisma.runWithTenant(tenantId, (tx) =>
      this.getExistingOrThrow(tx, tenantId, id),
    );

    return UserMapper.toResponse(user);
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async updateUser(
    tenantId: string,
    id: string,
    dto: UpdateUserDto,
    updatedBy?: string,
  ): Promise<UserResponse> {
    this.log('UPDATE_USER', `Updating user ${id} for tenant ${tenantId}`);

    await this.validateTenant(tenantId);

    try {
      const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
        await this.getExistingOrThrow(tx, tenantId, id);

        if (dto.email) {
          await this.validateEmailAvailable(tx, tenantId, dto.email, id);
        }

        await this.validateCompany(tx, tenantId, dto.company_id);
        await this.validateBranch(tx, tenantId, dto.branch_id);
        await this.validateDepartment(tx, tenantId, dto.department_id);

        const { role_ids, permission_ids, email, ...rest } = dto;

        const user = await tx.user.update({
          where: { id },
          data: {
            ...rest,
            ...(email ? { email: email.toLowerCase() } : {}),
            ...AuditHelper.buildUpdateAudit(updatedBy),
          },
        });

        if (role_ids) {
          await this.replaceRoles(tx, tenantId, id, role_ids, updatedBy);
        }

        if (permission_ids) {
          await this.replacePermissions(tx, tenantId, id, permission_ids, updatedBy);
        }

        return user;
      });

      this.log('UPDATE_USER', `User ${id} updated successfully.`);

      return UserMapper.toResponse(updated);
    } catch (error) {
      this.logError('UPDATE_USER', error);
      throw error;
    }
  }

  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateStatusDto,
    updatedBy?: string,
  ): Promise<UserResponse> {
    this.log('UPDATE_STATUS', `Setting user ${id} status to ${dto.status}`);

    await this.validateTenant(tenantId);

    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getExistingOrThrow(tx, tenantId, id);
      return this.repository.updateStatus(tx, id, dto.status, updatedBy);
    });

    return UserMapper.toResponse(updated);
  }

  // ============================================================
  // BULK ACTIONS
  // ============================================================

  async bulkAction(
    tenantId: string,
    dto: BulkUserDto,
    actorId?: string,
  ): Promise<BulkActionResult> {
    this.log('BULK_ACTION', `Applying ${dto.action} to ${dto.ids.length} user(s)`);

    await this.validateTenant(tenantId);

    const affected = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await this.repository.findByIds(tx, tenantId, dto.ids);

      if (existing.length === 0) {
        throw new NotFoundException('None of the specified users were found.');
      }

      const eligibleIds = existing.map((user) => user.id);

      switch (dto.action) {
        case BulkUserAction.ACTIVATE: {
          const result = await this.repository.bulkUpdateStatus(
            tx,
            tenantId,
            eligibleIds,
            UserStatus.ACTIVE,
            actorId,
          );
          return result.count;
        }
        case BulkUserAction.DEACTIVATE: {
          const result = await this.repository.bulkUpdateStatus(
            tx,
            tenantId,
            eligibleIds,
            UserStatus.INACTIVE,
            actorId,
          );
          return result.count;
        }
        case BulkUserAction.SUSPEND: {
          const result = await this.repository.bulkUpdateStatus(
            tx,
            tenantId,
            eligibleIds,
            UserStatus.SUSPENDED,
            actorId,
          );
          return result.count;
        }
        case BulkUserAction.DELETE: {
          const result = await this.repository.bulkSoftDelete(tx, tenantId, eligibleIds, actorId);
          return result.count;
        }
        case BulkUserAction.RESTORE: {
          const result = await tx.user.updateMany({
            where: { id: { in: eligibleIds }, tenant_id: tenantId, deleted_at: { not: null } },
            data: { deleted_at: null, updated_by: actorId },
          });
          return result.count;
        }
        default:
          throw new BadRequestException(`Unsupported bulk action: ${dto.action}`);
      }
    });

    this.log('BULK_ACTION', `${dto.action} affected ${affected} of ${dto.ids.length} requested`);

    return { requested: dto.ids.length, affected };
  }

  // ============================================================
  // DELETE / RESTORE
  // ============================================================

  async softDeleteUser(tenantId: string, id: string, deletedBy?: string): Promise<void> {
    this.log('DELETE_USER', `Soft-deleting user ${id}`);

    await this.validateTenant(tenantId);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getExistingOrThrow(tx, tenantId, id);
      return this.repository.softDelete(tx, id, deletedBy);
    });
  }

  async restoreUser(tenantId: string, id: string, restoredBy?: string): Promise<UserResponse> {
    this.log('RESTORE_USER', `Restoring user ${id}`);

    await this.validateTenant(tenantId);

    const restored = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const user = await this.repository.findByIdIncludingDeleted(tx, tenantId, id);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (!user.deleted_at) {
        throw new BadRequestException('User is not deleted.');
      }

      return this.repository.restore(tx, id, restoredBy);
    });

    return UserMapper.toResponse(restored);
  }

  // ============================================================
  // FORCE LOGOUT (Auth spec Phase 7 — admin action)
  // ============================================================

  async forceLogout(tenantId: string, targetUserId: string): Promise<void> {
    this.log('FORCE_LOGOUT', `Force-logging-out user ${targetUserId}`);

    await this.validateTenant(tenantId);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getExistingOrThrow(tx, tenantId, targetUserId);
    });

    // Sessions carry no RLS (see migration note) — scoped here by
    // tenant_id/user_id explicitly at the application layer.
    await this.prisma.session.updateMany({
      where: { user_id: targetUserId, tenant_id: tenantId, is_active: true },
      data: { is_active: false, revoked_at: new Date(), revoked_reason: 'FORCE_LOGOUT_BY_ADMIN' },
    });
  }

  // ============================================================
  // PASSWORD — SELF-SERVICE CHANGE
  // ============================================================

  async changePassword(tenantId: string, userId: string, dto: ChangePasswordDto): Promise<void> {
    this.log('CHANGE_PASSWORD', `User ${userId} changing their own password`);

    await this.validateTenant(tenantId);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const user = await this.getExistingOrThrow(tx, tenantId, userId);

      const currentValid = await PasswordUtil.verify(user.password_hash, dto.current_password);

      if (!currentValid) {
        throw new UnauthorizedException('Current password is incorrect.');
      }

      PasswordHelper.assertStrength(dto.new_password);

      const history = await this.repository.getPasswordHistory(
        tx,
        tenantId,
        userId,
        PASSWORD_CONSTANTS.HISTORY_LIMIT,
      );
      await PasswordHelper.assertNotReused(dto.new_password, history);

      const passwordHash = await PasswordUtil.hash(dto.new_password);

      await this.repository.updatePassword(tx, userId, passwordHash, {
        updatedBy: userId,
        mustChangePassword: false,
        passwordExpiresAt: PasswordHelper.calculateExpiryDate(),
      });

      await tx.passwordHistory.create({
        data: {
          tenant_id: tenantId,
          user_id: userId,
          password_hash: passwordHash,
          changed_by: userId,
          reason: 'SELF_SERVICE_CHANGE',
        },
      });
    });

    this.log('CHANGE_PASSWORD', `Password changed for user ${userId}`);
  }

  // ============================================================
  // PASSWORD — ADMIN RESET
  // ============================================================

  async adminResetPassword(
    tenantId: string,
    targetUserId: string,
    dto: AdminResetPasswordDto,
    adminId?: string,
  ): Promise<AdminResetPasswordResult> {
    this.log('ADMIN_RESET_PASSWORD', `Admin ${adminId} resetting password for ${targetUserId}`);

    await this.validateTenant(tenantId);

    const temporaryPassword = PasswordUtil.generateTemporaryPassword(
      PASSWORD_CONSTANTS.TEMP_PASSWORD_LENGTH,
    );
    const passwordHash = await PasswordUtil.hash(temporaryPassword);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getExistingOrThrow(tx, tenantId, targetUserId);

      await this.repository.updatePassword(tx, targetUserId, passwordHash, {
        updatedBy: adminId,
        mustChangePassword: dto.require_password_change ?? true,
        passwordExpiresAt: PasswordHelper.calculateExpiryDate(),
      });

      await tx.passwordHistory.create({
        data: {
          tenant_id: tenantId,
          user_id: targetUserId,
          password_hash: passwordHash,
          changed_by: adminId,
          reason: 'ADMIN_RESET',
        },
      });
    });

    this.log('ADMIN_RESET_PASSWORD', `Password reset for ${targetUserId} by ${adminId}`);

    return { temporaryPassword };
  }

  // ============================================================
  // PASSWORD — FORGOT / RESET (token flow)
  // ============================================================

  async requestPasswordReset(tenantId: string, email: string): Promise<{ token: string } | null> {
    await this.validateTenant(tenantId);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const user = await this.repository.findByEmail(tx, tenantId, email);

      if (!user) {
        return null;
      }

      const token = PasswordHelper.generateResetToken();
      const expiresAt = PasswordHelper.resetTokenExpiry();

      await this.repository.setPasswordResetToken(tx, user.id, token, expiresAt);

      this.log('REQUEST_PASSWORD_RESET', `Reset token issued for user ${user.id}`);

      return { token };
    });
  }

  /**
   * The reset token is presented with no tenant context (an emailed
   * link, not an authenticated request), so findByPasswordResetToken
   * is intentionally the one lookup NOT wrapped in runWithTenant
   * beforehand — it runs on the base client to discover which tenant
   * the token belongs to, and only then do we open an RLS context for
   * the actual update.
   */
  async resetPassword(tenantId: string, dto: ResetPasswordDto): Promise<void> {
    const user = await this.repository.findByPasswordResetToken(this.prisma, dto.token);

    if (!user || user.tenant_id !== tenantId) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (!user.password_reset_expires || user.password_reset_expires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    PasswordHelper.assertStrength(dto.new_password);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const history = await this.repository.getPasswordHistory(
        tx,
        tenantId,
        user.id,
        PASSWORD_CONSTANTS.HISTORY_LIMIT,
      );
      await PasswordHelper.assertNotReused(dto.new_password, history);

      const passwordHash = await PasswordUtil.hash(dto.new_password);

      await this.repository.updatePassword(tx, user.id, passwordHash, {
        mustChangePassword: false,
        passwordExpiresAt: PasswordHelper.calculateExpiryDate(),
      });

      await tx.passwordHistory.create({
        data: {
          tenant_id: tenantId,
          user_id: user.id,
          password_hash: passwordHash,
          reason: 'FORGOT_PASSWORD_RESET',
        },
      });
    });

    this.log('RESET_PASSWORD', `Password reset via token for user ${user.id}`);
  }
}
