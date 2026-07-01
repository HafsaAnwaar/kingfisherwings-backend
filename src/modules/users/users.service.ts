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
    tenantId: string,
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const taken = await this.repository.existsByEmail(tenantId, email, excludeId);

    if (taken) {
      throw new ConflictException('Email already exists.');
    }
  }

  private async validateUserLimit(tenant: Tenant): Promise<void> {
    const totalUsers = await this.repository.count(tenant.id);

    if (totalUsers >= tenant.max_users) {
      throw new ForbiddenException('Maximum user limit reached for this tenant.');
    }
  }

  private async validateBranch(tenantId: string, branchId?: string): Promise<Branch | null> {
    if (!branchId) {
      return null;
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, tenant_id: tenantId, deleted_at: null },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return branch;
  }

  private async validateDepartment(
    tenantId: string,
    departmentId?: string,
  ): Promise<Department | null> {
    if (!departmentId) {
      return null;
    }

    const department = await this.prisma.department.findFirst({
      where: { id: departmentId, tenant_id: tenantId, deleted_at: null },
    });

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    return department;
  }

  private async validateRole(tenantId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenant_id: tenantId, deleted_at: null, is_active: true },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleId} not found.`);
    }

    return role;
  }

  private async validatePermission(tenantId: string, permissionId: string) {
    const permission = await this.prisma.permission.findFirst({
      where: { id: permissionId, tenant_id: tenantId, deleted_at: null },
    });

    if (!permission) {
      throw new NotFoundException(`Permission ${permissionId} not found.`);
    }

    return permission;
  }

  private async getExistingOrThrow(tenantId: string, id: string): Promise<User> {
    const user = await this.repository.findById(tenantId, id);

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
      await this.validateRole(tenantId, roleId);

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
      await this.validatePermission(tenantId, permissionId);

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
    createdBy?: string,
  ): Promise<CreateUserResponse> {
    this.log('CREATE_USER', `Creating user ${dto.email} for tenant ${tenantId}`);

    const tenant = await this.validateTenant(tenantId);
    await this.validateUserLimit(tenant);
    await this.validateEmailAvailable(tenantId, dto.email);
    await this.validateBranch(tenantId, dto.branch_id);
    await this.validateDepartment(tenantId, dto.department_id);

    const temporaryPassword = PasswordUtil.generateTemporaryPassword(
      PASSWORD_CONSTANTS.TEMP_PASSWORD_LENGTH,
    );
    const passwordHash = await PasswordUtil.hash(temporaryPassword);

    try {
      const user = await this.prisma.$transaction(async (tx) => {
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
            avatar_url: dto.avatar_url,
            role: dto.role,
            status: dto.status ?? UserStatus.INVITED,
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
            ...AuditHelper.buildCreateAudit(createdBy),
          },
        });

        await tx.passwordHistory.create({
          data: {
            tenant_id: tenantId,
            user_id: createdUser.id,
            password_hash: passwordHash,
            changed_by: createdBy,
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
              assigned_by: createdBy,
            },
          });
        }

        if (dto.role_ids?.length) {
          await this.assignRoles(tx, tenantId, createdUser.id, dto.role_ids, createdBy);
        }

        if (dto.permission_ids?.length) {
          await this.assignPermissions(tx, tenantId, createdUser.id, dto.permission_ids, createdBy);
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

    const result = await this.repository.findMany(tenantId, filters);

    return UserMapper.toPaginated(result);
  }

  async findOne(tenantId: string, id: string): Promise<UserResponse> {
    await this.validateTenant(tenantId);

    const user = await this.getExistingOrThrow(tenantId, id);

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
    await this.getExistingOrThrow(tenantId, id);

    if (dto.email) {
      await this.validateEmailAvailable(tenantId, dto.email, id);
    }

    await this.validateBranch(tenantId, dto.branch_id);
    await this.validateDepartment(tenantId, dto.department_id);

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
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
    await this.getExistingOrThrow(tenantId, id);

    const updated = await this.prisma.$transaction((tx) =>
      this.repository.updateStatus(tx, id, dto.status, updatedBy),
    );

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

    const existing = await this.repository.findByIds(tenantId, dto.ids);

    if (existing.length === 0) {
      throw new NotFoundException('None of the specified users were found.');
    }

    const eligibleIds = existing.map((user) => user.id);

    const affected = await this.prisma.$transaction(async (tx) => {
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
    await this.getExistingOrThrow(tenantId, id);

    await this.prisma.$transaction((tx) => this.repository.softDelete(tx, id, deletedBy));
  }

  async restoreUser(tenantId: string, id: string, restoredBy?: string): Promise<UserResponse> {
    this.log('RESTORE_USER', `Restoring user ${id}`);

    await this.validateTenant(tenantId);

    const user = await this.repository.findByIdIncludingDeleted(tenantId, id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!user.deleted_at) {
      throw new BadRequestException('User is not deleted.');
    }

    const restored = await this.prisma.$transaction((tx) =>
      this.repository.restore(tx, id, restoredBy),
    );

    return UserMapper.toResponse(restored);
  }

  // ============================================================
  // PASSWORD — SELF-SERVICE CHANGE
  // ============================================================

  async changePassword(tenantId: string, userId: string, dto: ChangePasswordDto): Promise<void> {
    this.log('CHANGE_PASSWORD', `User ${userId} changing their own password`);

    await this.validateTenant(tenantId);

    const user = await this.getExistingOrThrow(tenantId, userId);

    const currentValid = await PasswordUtil.verify(user.password_hash, dto.current_password);

    if (!currentValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    PasswordHelper.assertStrength(dto.new_password);

    const history = await this.repository.getPasswordHistory(
      tenantId,
      userId,
      PASSWORD_CONSTANTS.HISTORY_LIMIT,
    );
    await PasswordHelper.assertNotReused(dto.new_password, history);

    const passwordHash = await PasswordUtil.hash(dto.new_password);

    await this.prisma.$transaction(async (tx) => {
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
    await this.getExistingOrThrow(tenantId, targetUserId);

    const temporaryPassword = PasswordUtil.generateTemporaryPassword(
      PASSWORD_CONSTANTS.TEMP_PASSWORD_LENGTH,
    );
    const passwordHash = await PasswordUtil.hash(temporaryPassword);

    await this.prisma.$transaction(async (tx) => {
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

    // NOTE: dto.send_email is a hook for the Notifications module (future
    // work) to dispatch the temporary password by email instead of
    // returning it in the API response.
    return { temporaryPassword };
  }

  // ============================================================
  // PASSWORD — FORGOT / RESET (token flow)
  //
  // Token issuance/emailing is orchestrated by the Auth module's
  // forgot-password endpoint (Phase 1); these methods operate on the
  // User aggregate and are called by that endpoint.
  // ============================================================

  async requestPasswordReset(tenantId: string, email: string): Promise<{ token: string } | null> {
    await this.validateTenant(tenantId);

    const user = await this.repository.findByEmail(tenantId, email);

    // Do not reveal whether the email exists.
    if (!user) {
      return null;
    }

    const token = PasswordHelper.generateResetToken();
    const expiresAt = PasswordHelper.resetTokenExpiry();

    await this.prisma.$transaction((tx) =>
      this.repository.setPasswordResetToken(tx, user.id, token, expiresAt),
    );

    this.log('REQUEST_PASSWORD_RESET', `Reset token issued for user ${user.id}`);

    return { token };
  }

  async resetPassword(tenantId: string, dto: ResetPasswordDto): Promise<void> {
    const user = await this.repository.findByPasswordResetToken(dto.token);

    if (!user || user.tenant_id !== tenantId) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (!user.password_reset_expires || user.password_reset_expires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    PasswordHelper.assertStrength(dto.new_password);

    const history = await this.repository.getPasswordHistory(
      tenantId,
      user.id,
      PASSWORD_CONSTANTS.HISTORY_LIMIT,
    );
    await PasswordHelper.assertNotReused(dto.new_password, history);

    const passwordHash = await PasswordUtil.hash(dto.new_password);

    await this.prisma.$transaction(async (tx) => {
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
