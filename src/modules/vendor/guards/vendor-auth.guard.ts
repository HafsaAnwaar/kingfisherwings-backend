import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { resolveVendorAccessSecret } from "../../../common/utils/jwt-secrets.util";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../../prisma/prisma.service";
import {
  CurrentVendorUser,
  VendorJwtPayload,
} from "../interfaces/vendor-auth.interfaces";

@Injectable()
export class VendorAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      vendorUser?: CurrentVendorUser;
    }>();

    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing vendor access token.");
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new UnauthorizedException("Missing vendor access token.");
    }

    let payload: VendorJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<VendorJwtPayload>(token, {
        secret: this.vendorAccessSecret(),
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired vendor token.");
    }

    if (payload.principal !== "vendor" || payload.type !== "access") {
      throw new UnauthorizedException("Invalid vendor token.");
    }

    const session = await this.prisma.vendorSession.findUnique({
      where: { jti: payload.sessionId },
      include: {
        vendor_user: {
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
                vendor_portal_access: true,
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
      throw new UnauthorizedException("Vendor session is no longer valid.");
    }

    const user = session.vendor_user;
    if (
      !user ||
      user.deleted_at ||
      user.status !== "ACTIVE" ||
      !user.party.vendor_portal_access ||
      user.party.deleted_at ||
      !user.party.is_active
    ) {
      throw new UnauthorizedException("Vendor account is not active.");
    }

    if (user.id !== payload.sub || user.tenant_id !== payload.tenantId) {
      throw new UnauthorizedException("Vendor token mismatch.");
    }

    request.vendorUser = {
      id: user.id,
      tenantId: user.tenant_id,
      partyId: user.party_id,
      email: user.email,
      fullName: user.full_name,
      sessionId: session.jti,
    };

    return true;
  }

  private vendorAccessSecret(): string {
    return resolveVendorAccessSecret(this.config);
  }
}
