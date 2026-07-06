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
  BadRequestException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';

import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermissions } from './decorators/permissions.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from './interfaces/current-user.interface';
import { isSuperAdminPrincipal } from '../../common/utils/principal.util';

import { USERS_PERMISSIONS } from './constants/permission.constants';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { BulkUserDto } from './dto/bulk-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';

import { UserResponse } from './responses/user.response';
import { PaginatedUsersResponse } from './responses/paginated-users.response';
import { UserMapper } from './mappers/user.mapper';

/**
 * All routes below are designed to run after the Auth module's
 * JwtAuthGuard populates request.user (see CurrentUser interface).
 * Add JwtAuthGuard to the @UseGuards chain once Auth Phase 2 lands:
 *   @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
 * Until then, PermissionsGuard fails closed (UnauthorizedException) on
 * every route below because each declares required permissions.
 */
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(USERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List users for the current tenant (paginated, filterable).' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedUsersResponse })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryUserDto,
  ): Promise<PaginatedUsersResponse> {
    return this.usersService.findAll(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(USERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get a single user by id.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponse> {
    return this.usersService.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a user. Returns a system-generated temporary password.' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponse })
  async create(
    @CurrentUser() principal: unknown,
    @Body() dto: CreateUserDto,
  ): Promise<{ user: UserResponse; temporaryPassword: string }> {
    let tenantId: string;
    let creator: { userId?: string; superAdminId?: string };

    if (isSuperAdminPrincipal(principal)) {
      const superAdmin = principal as { id: string };

      if (!dto.tenant_id) {
        throw new BadRequestException(
          'tenant_id is required in the request body when a super admin creates a user.',
        );
      }

      tenantId = dto.tenant_id;
      creator = { superAdminId: superAdmin.id };
    } else {
      const user = principal as CurrentUserType;
      tenantId = user.tenantId;
      creator = { userId: user.id };
    }

    const result = await this.usersService.createUser(tenantId, dto, creator);

    return {
      user: UserMapper.toResponse(result.user),
      temporaryPassword: result.temporaryPassword,
    };
  }

  @Patch(':id')
  @RequirePermissions(USERS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a user.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.usersService.updateUser(tenantId, id, dto, actorId);
  }

  @Patch(':id/status')
  @RequirePermissions(USERS_PERMISSIONS.CHANGE_STATUS)
  @ApiOperation({ summary: 'Change a user\'s status (activate, suspend, etc).' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  async updateStatus(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<UserResponse> {
    return this.usersService.updateStatus(tenantId, id, dto, actorId);
  }

  @Post('bulk')
  @RequirePermissions(USERS_PERMISSIONS.BULK_ACTION)
  @ApiOperation({ summary: 'Apply an action (activate/deactivate/suspend/delete/restore) to multiple users.' })
  async bulkAction(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: BulkUserDto,
  ) {
    return this.usersService.bulkAction(tenantId, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(USERS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a user.' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.usersService.softDeleteUser(tenantId, id, actorId);
  }

  @Post(':id/restore')
  @RequirePermissions(USERS_PERMISSIONS.RESTORE)
  @ApiOperation({ summary: 'Restore a soft-deleted user.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  async restore(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponse> {
    return this.usersService.restoreUser(tenantId, id, actorId);
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Authenticated user changes their own password.' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async changeOwnPassword(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    // No @RequirePermissions on this route (any authenticated user may
    // change their own password), so we assert authentication explicitly.
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required.');
    }

    await this.usersService.changePassword(currentUser.tenantId, currentUser.id, dto);
  }

  @Post(':id/admin-reset-password')
  @RequirePermissions(USERS_PERMISSIONS.RESET_PASSWORD)
  @ApiOperation({ summary: "Admin resets a target user's password to a new temporary password." })
  async adminResetPassword(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminResetPasswordDto,
  ) {
    return this.usersService.adminResetPassword(tenantId, id, dto, actorId);
  }

  @Post(':id/force-logout')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(USERS_PERMISSIONS.FORCE_LOGOUT)
  @ApiOperation({ summary: "Force-logout: revoke a target user's active sessions on all devices." })
  async forceLogout(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.usersService.forceLogout(tenantId, id);
    return { success: true, message: 'User logged out of all devices.' };
  }
}
