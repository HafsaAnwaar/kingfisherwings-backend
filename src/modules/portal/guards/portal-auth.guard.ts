import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { PartyVerificationStatus } from "@prisma/client";
import { resolvePortalAccessSecret } from "../../../common/utils/jwt-secrets.util";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../../prisma/prisma.service";
import {
  PORTAL_ONBOARDING_KEY,
  PortalOnboardingLevel,
} from "../decorators/portal-onboarding.decorator";
import {
  CurrentPortalUser,
  PortalJwtPayload,
} from "../interfaces/portal-auth.interfaces";

@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      portalUser?: CurrentPortalUser;
    }>();

    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing portal access token.");
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new UnauthorizedException("Missing portal access token.");
    }

    let payload: PortalJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<PortalJwtPayload>(token, {
        secret: this.portalAccessSecret(),
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired portal token.");
    }

    if (payload.principal !== "portal" || payload.type !== "access") {
      throw new UnauthorizedException("Invalid portal token.");
    }

    const session = await this.prisma.portalSession.findUnique({
      where: { jti: payload.sessionId },
      include: {
        portal_user: {
          select: {
            id: true,
            tenant_id: true,
            party_id: true,
            email: true,
            full_name: true,
            status: true,
            deleted_at: true,
            party: {
              select: {
                portal_access: true,
                deleted_at: true,
                is_active: true,
              },
            },
          },
        },
      },
    });

    if (
      !session ||
      !session.is_active ||
      session.revoked_at ||
      session.expires_at < new Date()
    ) {
      throw new UnauthorizedException("Portal session is no longer valid.");
    }

    const user = session.portal_user;
    if (
      !user ||
      user.deleted_at ||
      user.status !== "ACTIVE" ||
      !user.party.portal_access ||
      user.party.deleted_at ||
      !user.party.is_active
    ) {
      throw new UnauthorizedException("Portal account is not active.");
    }

    if (user.id !== payload.sub || user.tenant_id !== payload.tenantId) {
      throw new UnauthorizedException("Portal token mismatch.");
    }

    request.portalUser = {
      id: user.id,
      tenantId: user.tenant_id,
      partyId: user.party_id,
      email: user.email,
      fullName: user.full_name,
      sessionId: session.jti,
    };

    await this.enforceOnboarding(context, user.id, user.party_id);
    return true;
  }

  private async enforceOnboarding(
    context: ExecutionContext,
    portalUserId: string,
    partyId: string,
  ) {
    const level =
      this.reflector.getAllAndOverride<PortalOnboardingLevel>(
        PORTAL_ONBOARDING_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? "full";

    const row = await this.prisma.portalUser.findFirst({
      where: { id: portalUserId, deleted_at: null },
      select: {
        must_change_password: true,
        party: {
          select: {
            verification: { select: { status: true } },
          },
        },
      },
    });
    if (!row) return;

    if (row.must_change_password) {
      if (level === "auth") return;
      throw new ForbiddenException({
        statusCode: 403,
        message:
          "Password change required before continuing. Call POST /portal/auth/change-password.",
        code: "must_change_password",
      });
    }

    const status =
      row.party.verification?.status ?? PartyVerificationStatus.NOT_STARTED;
    if (status === PartyVerificationStatus.APPROVED) return;
    if (level === "auth" || level === "verification") return;

    throw new ForbiddenException({
      statusCode: 403,
      message:
        status === PartyVerificationStatus.PENDING_REVIEW
          ? "Business verification is pending Tenant Admin approval."
          : "Upload required business documents (VAT certificate and license) before using the portal.",
      code:
        status === PartyVerificationStatus.PENDING_REVIEW
          ? "verification_pending_approval"
          : "verification_required",
      verification_status: status,
      party_id: partyId,
    });
  }

  private portalAccessSecret(): string {
    return resolvePortalAccessSecret(this.config);
  }
}
