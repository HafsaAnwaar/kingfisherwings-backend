// src/modules/auth/auth.controller.ts

import { Controller, Post, Get, Body, Req, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserRole } from '@prisma/client';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { TenantLoginDto } from './dto/tenant-login.dto';
import { SuperAdminSignupDto } from './dto/super-admin-signup.dto';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TenantChangePasswordDto } from './dto/tenant-change-password.dto';

import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

import { RolesGuard } from '../users/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';

import { RequestWithUser } from './interfaces/request-with-user.interface';
import { LoginMeta } from './interfaces/login-meta.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =====================================================
  // USER LOGIN
  // =====================================================

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff login: tenant slug + email + password' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, this.extractMeta(req));
  }

  // =====================================================
  // TENANT LOGIN
  // =====================================================

  @Public()
  @Post('tenant-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tenant admin login: tenant slug + the tenant's own password" })
  tenantLogin(@Body() dto: TenantLoginDto, @Req() req: Request) {
    return this.authService.tenantLogin(dto, this.extractMeta(req));
  }

  // =====================================================
  // SUPER ADMIN SIGNUP
  // =====================================================

  @Public()
  @Post('super-admin/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Platform super admin self-registration' })
  superAdminSignup(@Body() dto: SuperAdminSignupDto, @Req() req: Request) {
    return this.authService.superAdminSignup(dto, this.extractMeta(req));
  }

  // =====================================================
  // SUPER ADMIN LOGIN
  // =====================================================

  @Public()
  @Post('super-admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Platform super admin login' })
  superAdminLogin(@Body() dto: SuperAdminLoginDto, @Req() req: Request) {
    return this.authService.superAdminLogin(dto, this.extractMeta(req));
  }

  // =====================================================
  // REFRESH TOKEN (works for all three principal types)
  // =====================================================

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  // =====================================================
  // LOGOUT (works for all three principal types)
  // =====================================================

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current session' })
  logout(@Req() req: RequestWithUser) {
    return this.authService.logout(req.user);
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  @ApiBearerAuth()
  @Get('sessions')
  @ApiOperation({ summary: "List the authenticated user's own active sessions" })
  listSessions(@CurrentUser('id') userId: string) {
    return this.authService.listSessions(userId);
  }

  @ApiBearerAuth()
  @Post('sessions/:sessionId/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoke one of the authenticated user's own sessions" })
  revokeSession(@CurrentUser('id') userId: string, @Param('sessionId') sessionId: string) {
    return this.authService.revokeSession(userId, sessionId);
  }

  @ApiBearerAuth()
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out of every device (revokes all active sessions)' })
  logoutAll(@CurrentUser('id') userId: string) {
    return this.authService.logoutAll(userId);
  }

  // =====================================================
  // CURRENT PRINCIPAL (works for all three principal types)
  // =====================================================

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated principal (user, tenant owner, or super admin)' })
  me(@Req() req: RequestWithUser) {
    return this.authService.me(req.user);
  }

  // =====================================================
  // CHANGE PASSWORD (regular users, including tenant owners)
  // =====================================================

  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change the authenticated user password' })
  changePassword(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(tenantId, userId, dto);
  }

  // =====================================================
  // CHANGE TENANT PASSWORD (the tenant's own login credential,
  // distinct from the acting user's own password)
  // =====================================================

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN)
  @Post('tenant/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only.",
  })
  changeTenantPassword(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: TenantChangePasswordDto,
  ) {
    return this.authService.changeTenantPassword(tenantId, dto);
  }

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  private extractMeta(req: Request): LoginMeta {
    return {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    };
  }
}
