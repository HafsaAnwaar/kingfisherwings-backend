// src/modules/auth/auth.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { UserRole } from "@prisma/client";

import { AuthService } from "./auth.service";

import { LoginDto } from "./dto/login.dto";
import { TenantLoginDto } from "./dto/tenant-login.dto";
import { SuperAdminSignupDto } from "./dto/super-admin-signup.dto";
import { SuperAdminLoginDto } from "./dto/super-admin-login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { TenantChangePasswordDto } from "./dto/tenant-change-password.dto";
import { UpdateMyProfileDto } from "./dto/update-my-profile.dto";
import { AcceptInviteDto, InviteUserDto } from "./dto/invite-2fa.dto";
import {
  ForgotPasswordDto,
  PublicResetPasswordDto,
} from "./dto/forgot-password.dto";

import { Public } from "./decorators/public.decorator";
import { AllowSuperAdmin } from "../../common/decorators/allow-super-admin.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AUTH_THROTTLE } from "../../common/constants/auth-throttle.constants";

import { RolesGuard } from "../users/guards/roles.guard";
import { Roles } from "../users/decorators/roles.decorator";

import { RequestWithUser } from "./interfaces/request-with-user.interface";
import { LoginMeta } from "./interfaces/login-meta.interface";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =====================================================
  // USER LOGIN
  // =====================================================

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Staff login: tenant slug + email + password",
    description: "Rate limited: 3 attempts per minute per user (tenant + email).",
  })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, this.extractMeta(req));
  }

  // =====================================================
  // TENANT LOGIN
  // =====================================================

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post("tenant-login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Tenant admin login: tenant slug + the tenant's own password",
    description: "Rate limited: 3 attempts per minute per tenant slug.",
  })
  tenantLogin(@Body() dto: TenantLoginDto, @Req() req: Request) {
    return this.authService.tenantLogin(dto, this.extractMeta(req));
  }

  // =====================================================
  // SUPER ADMIN SIGNUP
  // =====================================================

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("super-admin/signup")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Platform super admin self-registration" })
  superAdminSignup(@Body() dto: SuperAdminSignupDto, @Req() req: Request) {
    return this.authService.superAdminSignup(dto, this.extractMeta(req));
  }

  // =====================================================
  // SUPER ADMIN LOGIN
  // =====================================================

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post("super-admin/login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Platform super admin login",
    description: "Rate limited: 3 attempts per minute per email.",
  })
  superAdminLogin(@Body() dto: SuperAdminLoginDto, @Req() req: Request) {
    return this.authService.superAdminLogin(dto, this.extractMeta(req));
  }

  // =====================================================
  // REFRESH TOKEN (works for all three principal types)
  // =====================================================

  @Public()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Exchange a refresh token for a new token pair" })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  // =====================================================
  // LOGOUT (works for all three principal types)
  // =====================================================

  @ApiBearerAuth()
  @AllowSuperAdmin()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoke the current session" })
  logout(@Req() req: RequestWithUser) {
    return this.authService.logout(req.user);
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  @ApiBearerAuth()
  @AllowSuperAdmin()
  @Get("sessions")
  @ApiOperation({
    summary: "List the authenticated user's own active sessions",
  })
  listSessions(@CurrentUser("id") userId: string) {
    return this.authService.listSessions(userId);
  }

  @ApiBearerAuth()
  @AllowSuperAdmin()
  @Post("sessions/:sessionId/revoke")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Revoke one of the authenticated user's own sessions",
  })
  revokeSession(
    @CurrentUser("id") userId: string,
    @Param("sessionId") sessionId: string,
  ) {
    return this.authService.revokeSession(userId, sessionId);
  }

  @ApiBearerAuth()
  @AllowSuperAdmin()
  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Log out of every device (revokes all active sessions)",
  })
  logoutAll(@CurrentUser("id") userId: string) {
    return this.authService.logoutAll(userId);
  }

  // =====================================================
  // CURRENT PRINCIPAL (works for all three principal types)
  // =====================================================

  @ApiBearerAuth()
  @AllowSuperAdmin()
  @Get("me")
  @ApiOperation({
    summary:
      "Get the authenticated principal (user, tenant owner, or super admin)",
  })
  me(@Req() req: RequestWithUser) {
    return this.authService.me(req.user);
  }

  @ApiBearerAuth()
  @AllowSuperAdmin()
  @Patch("me")
  @ApiOperation({
    summary:
      "Update own profile after login (preferred country, phone, locale)",
    description:
      "Country is optional. Set preferred_country_code anytime after sign-in; send null to clear. SuperAdmin gets first/last name only via this path’s sibling flows — tenant users update preferred country here.",
  })
  updateMe(@Req() req: RequestWithUser, @Body() dto: UpdateMyProfileDto) {
    return this.authService.updateMyProfile(req.user, dto);
  }

  // =====================================================
  // CHANGE PASSWORD (regular users, including tenant owners)
  // =====================================================

  @ApiBearerAuth()
  @Throttle(AUTH_THROTTLE)
  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Change the authenticated user password",
    description: "Rate limited: 3 attempts per minute per user.",
  })
  changePassword(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(tenantId, userId, dto);
  }

  // =====================================================
  // FORGOT / RESET PASSWORD (public token flow)
  // =====================================================

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Request a staff password-reset email",
    description:
      "Rate limited: 3 attempts per minute per user (tenant + email). Always returns success to avoid email enumeration.",
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Complete staff password reset with emailed token",
    description: "Rate limited: 3 attempts per minute per reset token.",
  })
  resetPassword(@Body() dto: PublicResetPasswordDto) {
    return this.authService.resetPasswordWithToken(dto);
  }

  // =====================================================
  // CHANGE TENANT PASSWORD (the tenant's own login credential,
  // distinct from the acting user's own password)
  // =====================================================

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN)
  @Throttle(AUTH_THROTTLE)
  @Post("tenant/change-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Change the tenant's own login password (POST /auth/tenant-login credential). Tenant admins only.",
    description: "Rate limited: 3 attempts per minute.",
  })
  changeTenantPassword(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: TenantChangePasswordDto,
  ) {
    return this.authService.changeTenantPassword(tenantId, dto);
  }

  // =====================================================
  // INVITE + 2FA (Week 1)
  // =====================================================

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN)
  @Post("invite")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Send invite email with accept token for an INVITED user",
  })
  invite(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.authService.inviteUser(tenantId, actorId, dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post("accept-invite")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Accept invite token and set password",
    description: "Rate limited: 3 attempts per minute per invite token.",
  })
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.authService.acceptInvite(dto);
  }

  // POST /auth/2fa/* lives on AuthTwoFactorController — unlinked while AUTH_2FA_LINKED is false.

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  private extractMeta(req: Request): LoginMeta {
    const body = req.body as
      | { mac_address?: string; device_name?: string }
      | undefined;
    return {
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
      mac_address:
        body?.mac_address ??
        (typeof req.headers["x-device-mac"] === "string"
          ? req.headers["x-device-mac"]
          : undefined),
      device_name: body?.device_name,
    };
  }
}
