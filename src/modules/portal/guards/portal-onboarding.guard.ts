import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PartyVerificationStatus } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import {
  PORTAL_ONBOARDING_KEY,
  PortalOnboardingLevel,
} from "../decorators/portal-onboarding.decorator";
import { CurrentPortalUser } from "../interfaces/portal-auth.interfaces";

@Injectable()
export class PortalOnboardingGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const level =
      this.reflector.getAllAndOverride<PortalOnboardingLevel>(
        PORTAL_ONBOARDING_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? "full";

    const request = context.switchToHttp().getRequest<{
      portalUser?: CurrentPortalUser;
    }>();
    const user = request.portalUser;
    if (!user) return true;

    const row = await this.prisma.portalUser.findFirst({
      where: { id: user.id, deleted_at: null },
      select: {
        must_change_password: true,
        party: {
          select: {
            verification: { select: { status: true } },
          },
        },
      },
    });
    if (!row) return true;

    if (row.must_change_password) {
      if (level === "auth") return true;
      throw new ForbiddenException({
        statusCode: 403,
        message:
          "Password change required before continuing. Call POST /portal/auth/change-password.",
        code: "must_change_password",
      });
    }

    const status =
      row.party.verification?.status ?? PartyVerificationStatus.NOT_STARTED;
    if (status === PartyVerificationStatus.APPROVED) return true;

    if (level === "auth" || level === "verification") return true;

    const code =
      status === PartyVerificationStatus.PENDING_REVIEW
        ? "verification_pending_approval"
        : "verification_required";
    throw new ForbiddenException({
      statusCode: 403,
      message:
        status === PartyVerificationStatus.PENDING_REVIEW
          ? "Business verification is pending Tenant Admin approval."
          : "Upload required business documents (VAT certificate and license) before using the portal.",
      code,
      verification_status: status,
    });
  }
}
