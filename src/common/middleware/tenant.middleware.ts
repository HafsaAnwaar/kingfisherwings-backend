// src/common/middleware/tenant.middleware.ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

export interface AuthenticatedRequest extends Request {
  user: {
    sub:       string;
    tenantId:  string;
    email:     string;
    role:      string;
    branchId?: string;
    sessionId: string;
  };
  tenantId: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    private readonly jwt:    JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async use(
    req:  AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.slice(7);

    let payload: {
      sub:       string;
      tenantId:  string;
      email:     string;
      role:      string;
      branchId?: string;
      jti:       string;
    };

    try {
      payload = this.jwt.verify(token, {
        secret:   this.config.get<string>('jwt.accessSecret'),
        issuer:   this.config.get<string>('jwt.issuer'),
        audience: this.config.get<string>('jwt.audience'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    if (!payload.tenantId) {
      throw new UnauthorizedException('Token missing tenant context');
    }

    // ── Set PostgreSQL session variable for RLS ──────────────────
    // This is the ONLY place app.tenant_id is set.
    // Every subsequent Prisma query on this request will be
    // automatically scoped by the RLS policy.
    await this.prisma.$executeRawUnsafe(
      `SELECT set_config('app.tenant_id', $1, TRUE)`,
      payload.tenantId,
    );

    // ── Attach to request for downstream use ─────────────────────
    req.user = {
      sub:       payload.sub,
      tenantId:  payload.tenantId,
      email:     payload.email,
      role:      payload.role,
      branchId:  payload.branchId,
      sessionId: payload.jti,
    };
    req.tenantId = payload.tenantId;

    this.logger.debug(
      `Tenant context set: tenant=${payload.tenantId} user=${payload.sub}`,
    );

    next();
  }
}