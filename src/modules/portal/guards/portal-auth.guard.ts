import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { CurrentPortalUser, PortalJwtPayload } from '../interfaces/portal-auth.interfaces';

@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      portalUser?: CurrentPortalUser;
    }>();

    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing portal access token.');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing portal access token.');
    }

    let payload: PortalJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<PortalJwtPayload>(token, {
        secret: this.portalAccessSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired portal token.');
    }

    if (payload.principal !== 'portal' || payload.type !== 'access') {
      throw new UnauthorizedException('Invalid portal token.');
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
            party: { select: { portal_access: true, deleted_at: true, is_active: true } },
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
      throw new UnauthorizedException('Portal session is no longer valid.');
    }

    const user = session.portal_user;
    if (
      !user ||
      user.deleted_at ||
      user.status !== 'ACTIVE' ||
      !user.party.portal_access ||
      user.party.deleted_at ||
      !user.party.is_active
    ) {
      throw new UnauthorizedException('Portal account is not active.');
    }

    if (user.id !== payload.sub || user.tenant_id !== payload.tenantId) {
      throw new UnauthorizedException('Portal token mismatch.');
    }

    request.portalUser = {
      id: user.id,
      tenantId: user.tenant_id,
      partyId: user.party_id,
      email: user.email,
      fullName: user.full_name,
      sessionId: session.jti,
    };

    return true;
  }

  private portalAccessSecret(): string {
    return (
      this.config.get<string>('PORTAL_JWT_ACCESS_SECRET') ??
      this.config.get<string>('JWT_ACCESS_SECRET') ??
      'portal-dev-secret'
    );
  }
}
