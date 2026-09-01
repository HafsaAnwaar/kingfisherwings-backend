import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../../../prisma/prisma.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { RequestPrincipal } from "../interfaces/request-with-user.interface";
import { CurrentUser } from "../../users/interfaces/current-user.interface";
import { CurrentSuperAdmin } from "../interfaces/current-super-admin.interface";
import { SessionCacheService } from "../session-cache.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sessionCache: SessionCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validate(
    payload: JwtPayload & { principal?: string },
  ): Promise<RequestPrincipal> {
    if (payload.type !== "access") {
      throw new UnauthorizedException("Invalid token type.");
    }

    if ((payload as { principal?: string }).principal === "portal") {
      throw new UnauthorizedException(
        "Portal tokens cannot access staff APIs.",
      );
    }
    if ((payload as { principal?: string }).principal === "vendor") {
      throw new UnauthorizedException(
        "Vendor tokens cannot access staff APIs.",
      );
    }

    if (payload.principal === "super_admin") {
      return this.validateSuperAdmin(payload);
    }

    return this.validateUser(payload);
  }

  private async validateUser(
    payload: Extract<JwtPayload, { principal: "user" }>,
  ): Promise<CurrentUser> {
    const cached = await this.sessionCache.getStaffSession(payload.sessionId);
    if (
      cached &&
      cached.userId === payload.sub &&
      cached.tenantId === payload.tenantId
    ) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: cached.tenantId },
        select: {
          is_active: true,
          status: true,
          deleted_at: true,
          country_code: true,
          base_currency: true,
          timezone: true,
        },
      });
      const activeTenantStatuses = ["ACTIVE", "TRIAL"];
      if (
        !tenant ||
        tenant.deleted_at ||
        !tenant.is_active ||
        !activeTenantStatuses.includes(tenant.status)
      ) {
        throw new UnauthorizedException("This account is not active.");
      }
      return {
        id: payload.sub,
        tenantId: payload.tenantId,
        countryCode: tenant.country_code,
        preferredCountryCode: null,
        baseCurrency: tenant.base_currency,
        timezone: tenant.timezone,
        branchId: payload.branchId,
        roleId: payload.roleId,
        role: payload.role,
        sessionId: payload.sessionId,
        email: payload.email,
        permissions: payload.permissions,
      };
    }

    const session = await this.prisma.session.findUnique({
      where: { jti: payload.sessionId },
      include: { user: true },
    });

    if (
      !session ||
      !session.is_active ||
      session.revoked_at ||
      session.expires_at < new Date()
    ) {
      throw new UnauthorizedException("Session is no longer valid.");
    }

    if (
      !session.user ||
      session.user.deleted_at ||
      session.user.status !== "ACTIVE"
    ) {
      throw new UnauthorizedException("Account is no longer active.");
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: session.tenant_id },
      select: {
        is_active: true,
        status: true,
        deleted_at: true,
        country_code: true,
        base_currency: true,
        timezone: true,
      },
    });

    const activeTenantStatuses = ["ACTIVE", "TRIAL"];

    if (
      !tenant ||
      tenant.deleted_at ||
      !tenant.is_active ||
      !activeTenantStatuses.includes(tenant.status)
    ) {
      throw new UnauthorizedException("This account is not active.");
    }

    await this.sessionCache.setStaffSession(payload.sessionId, {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      twoFactorEnabled: session.user.two_factor_enabled,
    });

    return {
      id: payload.sub,
      tenantId: payload.tenantId,
      countryCode: tenant.country_code,
      preferredCountryCode: session.user.preferred_country_code,
      baseCurrency: tenant.base_currency,
      timezone: tenant.timezone,
      branchId: payload.branchId,
      roleId: payload.roleId,
      role: payload.role,
      sessionId: payload.sessionId,
      email: payload.email,
      permissions: payload.permissions,
    };
  }

  private async validateSuperAdmin(
    payload: Extract<JwtPayload, { principal: "super_admin" }>,
  ): Promise<CurrentSuperAdmin> {
    const cached = await this.sessionCache.getSuperAdminSession(
      payload.sessionId,
    );
    if (cached && cached.superAdminId === payload.sub) {
      return {
        principal: "super_admin",
        id: payload.sub,
        email: payload.email,
        sessionId: payload.sessionId,
      };
    }

    const session = await this.prisma.superAdminSession.findUnique({
      where: { jti: payload.sessionId },
      include: { super_admin: true },
    });

    if (
      !session ||
      !session.is_active ||
      session.revoked_at ||
      session.expires_at < new Date()
    ) {
      throw new UnauthorizedException("Session is no longer valid.");
    }

    if (
      !session.super_admin ||
      session.super_admin.deleted_at ||
      !session.super_admin.is_active
    ) {
      throw new UnauthorizedException("Account is no longer active.");
    }

    await this.sessionCache.setSuperAdminSession(payload.sessionId, {
      superAdminId: payload.sub,
      twoFactorEnabled: session.super_admin.two_factor_enabled ?? false,
    });

    return {
      principal: "super_admin",
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sessionId,
    };
  }
}
