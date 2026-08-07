import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PortalUserStatus, Prisma } from '@prisma/client';
import { randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { PasswordHelper } from '../users/helpers/password.helper';
import { EmailService } from '../../shared/email/email.service';
import {
  AcceptPortalInviteDto,
  CreatePortalUserDto,
  PortalLoginDto,
  PortalRefreshDto,
  PortalUserQueryDto,
  ResetPortalPasswordDto,
  UpdatePortalUserStatusDto,
} from './dto/portal.dto';
import { CurrentPortalUser, PortalJwtPayload } from './interfaces/portal-auth.interfaces';
import { PortalPermissionsService } from './portal-permissions.service';

@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly portalPermissions: PortalPermissionsService,
  ) {}

  // ─── Public portal auth ─────────────────────────────────────

  async login(dto: PortalLoginDto, meta?: { ip?: string; userAgent?: string }) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug: dto.tenant_slug, deleted_at: null, is_active: true },
    });
    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.portalUser.findFirst({
      where: {
        tenant_id: tenant.id,
        email,
        deleted_at: null,
      },
      include: {
        party: { select: { id: true, name: true, portal_access: true, is_active: true, deleted_at: true } },
      },
    });

    if (!user || user.status === 'DISABLED') {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (user.status === 'INVITED') {
      throw new UnauthorizedException(
        'Account is invited but not activated. Use the invite link to set your password.',
      );
    }
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (!user.party.portal_access || !user.party.is_active || user.party.deleted_at) {
      throw new UnauthorizedException('Portal access is not enabled for this customer.');
    }

    const passwordValid = await PasswordUtil.verify(user.password_hash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const tokens = await this.issuePortalTokens(user, meta);

    await this.prisma.portalUser.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return {
      success: true,
      data: {
        ...tokens,
        portal_user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          party_id: user.party_id,
          party_name: user.party.name,
          tenant_id: tenant.id,
          tenant_slug: tenant.slug,
        },
      },
    };
  }

  async refresh(dto: PortalRefreshDto) {
    let payload: PortalJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<PortalJwtPayload>(dto.refresh_token, {
        secret: this.portalRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (payload.principal !== 'portal' || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const session = await this.prisma.portalSession.findUnique({
      where: { jti: payload.sessionId },
      include: {
        portal_user: {
          include: {
            party: { select: { portal_access: true, is_active: true, deleted_at: true, name: true } },
            tenant: { select: { slug: true, is_active: true, deleted_at: true } },
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

    const matches = await PasswordUtil.verify(session.refresh_token_hash, dto.refresh_token);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = session.portal_user;
    if (
      !user ||
      user.deleted_at ||
      user.status !== 'ACTIVE' ||
      !user.party.portal_access ||
      !user.party.is_active ||
      user.party.deleted_at ||
      !user.tenant.is_active ||
      user.tenant.deleted_at
    ) {
      throw new UnauthorizedException('Portal account is not active.');
    }

    await this.prisma.portalSession.update({
      where: { id: session.id },
      data: {
        is_active: false,
        revoked_at: new Date(),
        revoked_reason: 'ROTATED',
      },
    });

    const tokens = await this.issuePortalTokens(user);

    return {
      success: true,
      data: {
        ...tokens,
        portal_user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          party_id: user.party_id,
          party_name: user.party.name,
          tenant_id: user.tenant_id,
          tenant_slug: user.tenant.slug,
        },
      },
    };
  }

  async logout(portalUser: CurrentPortalUser) {
    await this.prisma.portalSession.updateMany({
      where: {
        jti: portalUser.sessionId,
        portal_user_id: portalUser.id,
        is_active: true,
      },
      data: {
        is_active: false,
        revoked_at: new Date(),
        revoked_reason: 'LOGOUT',
      },
    });

    return { success: true, message: 'Logged out successfully.' };
  }

  async me(portalUser: CurrentPortalUser) {
    const user = await this.prisma.portalUser.findFirst({
      where: { id: portalUser.id, deleted_at: null },
      include: {
        party: {
          select: {
            id: true,
            code: true,
            name: true,
            email: true,
            credit_limit: true,
            credit_status: true,
            portal_access: true,
          },
        },
        tenant: { select: { id: true, slug: true, name: true, display_name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Portal user not found.');
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        status: user.status,
        last_login_at: user.last_login_at,
        party: user.party,
        tenant: user.tenant,
      },
    };
  }

  // ─── Staff: provision credentials (after Get a Quote) ───────

  async createPortalUser(tenantId: string, actorId: string, dto: CreatePortalUserDto) {
    const email = dto.email.trim().toLowerCase();
    const party = await this.prisma.runWithTenant(tenantId, (tx: Prisma.TransactionClient) =>
      tx.party.findFirst({
        where: { id: dto.party_id, tenant_id: tenantId, deleted_at: null },
      }),
    );

    if (!party) {
      throw new NotFoundException('Party not found.');
    }
    if (!party.is_active) {
      throw new BadRequestException('Party is inactive.');
    }

    const existing = await this.prisma.portalUser.findFirst({
      where: { tenant_id: tenantId, email, deleted_at: null },
    });
    if (existing) {
      throw new ConflictException('A portal user with this email already exists for this tenant.');
    }

    const inviteMode = dto.invite_mode === true;
    const plainPassword = inviteMode
      ? PasswordUtil.generateTemporaryPassword()
      : dto.password?.trim() || PasswordUtil.generateTemporaryPassword();
    const passwordHash = await PasswordUtil.hash(plainPassword);
    const generated = inviteMode ? false : !dto.password;
    const inviteToken = inviteMode ? randomBytes(32).toString('hex') : null;
    const inviteExpiresAt = inviteMode ? PasswordHelper.inviteTokenExpiry() : null;

    const created = await this.prisma.runWithTenant(tenantId, async (tx: Prisma.TransactionClient) => {
      await tx.party.update({
        where: { id: party.id },
        data: { portal_access: true, updated_by: actorId },
      });

      return tx.portalUser.create({
        data: {
          tenant_id: tenantId,
          party_id: party.id,
          email,
          password_hash: passwordHash,
          full_name: dto.full_name.trim(),
          phone: dto.phone?.trim() || null,
          status: inviteMode ? PortalUserStatus.INVITED : PortalUserStatus.ACTIVE,
          invite_token: inviteToken,
          invite_expires_at: inviteExpiresAt,
          invited_at: inviteMode ? new Date() : null,
          activated_at: inviteMode ? null : new Date(),
          created_by: actorId,
        },
      });
    });

    await this.portalPermissions.seedDefaultsIfEmpty(tenantId, party.id, actorId);

    const shouldEmail = dto.send_email !== false;
    if (shouldEmail) {
      if (inviteMode && inviteToken && inviteExpiresAt) {
        await this.sendInviteEmail(tenantId, {
          to: email,
          fullName: created.full_name,
          partyName: party.name,
          token: inviteToken,
          expiresAt: inviteExpiresAt,
          actorId,
        });
      } else {
        await this.sendCredentialsEmail(tenantId, {
          to: email,
          fullName: created.full_name,
          password: plainPassword,
          partyName: party.name,
          actorId,
        });
      }
    }

    return {
      success: true,
      message: inviteMode
        ? 'Portal user invited. Customer must accept the invite link to set a password.'
        : 'Portal user created. Customer can log in with tenant_slug + email + password.',
      data: {
        id: created.id,
        email: created.email,
        full_name: created.full_name,
        phone: created.phone,
        status: created.status,
        party_id: created.party_id,
        invite_mode: inviteMode,
        invite_expires_at: inviteExpiresAt,
        ...(inviteMode
          ? {}
          : {
              initial_password: plainPassword,
              password_generated: generated,
            }),
      },
    };
  }

  async acceptInvite(dto: AcceptPortalInviteDto) {
    PasswordHelper.assertStrength(dto.password);

    const user = await this.prisma.portalUser.findFirst({
      where: { invite_token: dto.token, deleted_at: null },
      include: {
        party: { select: { portal_access: true, is_active: true, deleted_at: true, name: true } },
        tenant: { select: { slug: true, is_active: true, deleted_at: true } },
      },
    });

    if (
      !user ||
      user.status !== PortalUserStatus.INVITED ||
      !user.invite_expires_at ||
      user.invite_expires_at < new Date()
    ) {
      throw new BadRequestException('Invite token is invalid or expired.');
    }

    if (!user.party.portal_access || !user.party.is_active || user.party.deleted_at) {
      throw new BadRequestException('Portal access is not enabled for this customer.');
    }

    const passwordHash = await PasswordUtil.hash(dto.password);

    const updated = await this.prisma.runWithTenant(user.tenant_id, (tx) =>
      tx.portalUser.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          status: PortalUserStatus.ACTIVE,
          invite_token: null,
          invite_expires_at: null,
          activated_at: new Date(),
          full_name: dto.full_name?.trim() || user.full_name,
          updated_by: user.id,
        },
      }),
    );

    return {
      success: true,
      message: 'Invite accepted. You can now log in.',
      data: {
        id: updated.id,
        email: updated.email,
        full_name: updated.full_name,
        status: updated.status,
        tenant_slug: user.tenant.slug,
        party_id: updated.party_id,
      },
    };
  }

  async resendInvite(tenantId: string, actorId: string, portalUserId: string, partyId?: string) {
    const user = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.portalUser.findFirst({
        where: {
          id: portalUserId,
          tenant_id: tenantId,
          deleted_at: null,
          ...(partyId ? { party_id: partyId } : {}),
        },
        include: { party: { select: { name: true, portal_access: true, is_active: true } } },
      }),
    );

    if (!user) throw new NotFoundException('Portal user not found.');
    if (user.status === PortalUserStatus.DISABLED) {
      throw new BadRequestException('Cannot invite a disabled portal user.');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = PasswordHelper.inviteTokenExpiry();

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.portalUser.update({
        where: { id: user.id },
        data: {
          status: PortalUserStatus.INVITED,
          invite_token: token,
          invite_expires_at: expiresAt,
          invited_at: new Date(),
          updated_by: actorId,
        },
      }),
    );

    await this.sendInviteEmail(tenantId, {
      to: user.email,
      fullName: user.full_name,
      partyName: user.party.name,
      token,
      expiresAt,
      actorId,
    });

    return {
      success: true,
      message: 'Invite resent.',
      data: { id: user.id, email: user.email, expires_at: expiresAt },
    };
  }

  async listPortalUsers(tenantId: string, query: PortalUserQueryDto) {
    const where: Prisma.PortalUserWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(query.party_id ? { party_id: query.party_id } : {}),
      ...(query.company_id
        ? { party: { company_id: query.company_id, tenant_id: tenantId, deleted_at: null } }
        : {}),
    };

    const rows = await this.prisma.portalUser.findMany({
      where,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        status: true,
        party_id: true,
        last_login_at: true,
        created_at: true,
        party: {
          select: {
            id: true,
            code: true,
            name: true,
            portal_access: true,
            company_id: true,
          },
        },
      },
    });

    return { success: true, data: rows };
  }

  async updateStatus(
    tenantId: string,
    actorId: string,
    portalUserId: string,
    dto: UpdatePortalUserStatusDto,
    partyId?: string,
  ) {
    const user = await this.requirePortalUser(tenantId, portalUserId, partyId);

    const updated = await this.prisma.portalUser.update({
      where: { id: user.id },
      data: {
        status: dto.status,
        updated_by: actorId,
      },
    });

    if (dto.status === 'DISABLED') {
      await this.revokeAllSessions(user.id, 'ACCOUNT_DISABLED');
    }

    return {
      success: true,
      message: `Portal user ${dto.status === 'DISABLED' ? 'disabled' : 'activated'}.`,
      data: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
      },
    };
  }

  async resetPassword(
    tenantId: string,
    actorId: string,
    portalUserId: string,
    dto: ResetPortalPasswordDto,
    partyId?: string,
  ) {
    const user = await this.requirePortalUser(tenantId, portalUserId, partyId);
    const plainPassword = dto.password?.trim() || PasswordUtil.generateTemporaryPassword();
    const generated = !dto.password;
    const passwordHash = await PasswordUtil.hash(plainPassword);

    await this.prisma.portalUser.update({
      where: { id: user.id },
      data: { password_hash: passwordHash, updated_by: actorId, status: PortalUserStatus.ACTIVE },
    });

    await this.revokeAllSessions(user.id, 'PASSWORD_RESET');

    const party = await this.prisma.party.findFirst({
      where: { id: user.party_id },
      select: { name: true },
    });

    const shouldEmail = dto.send_email !== false;
    if (shouldEmail) {
      await this.sendCredentialsEmail(tenantId, {
        to: user.email,
        fullName: user.full_name,
        password: plainPassword,
        partyName: party?.name ?? 'Customer',
        actorId,
      });
    }

    return {
      success: true,
      message: 'Portal password reset. Existing sessions were revoked.',
      data: {
        id: user.id,
        email: user.email,
        initial_password: plainPassword,
        password_generated: generated,
      },
    };
  }

  // ─── Internals ──────────────────────────────────────────────

  private async requirePortalUser(tenantId: string, portalUserId: string, partyId?: string) {
    const user = await this.prisma.portalUser.findFirst({
      where: {
        id: portalUserId,
        tenant_id: tenantId,
        deleted_at: null,
        ...(partyId ? { party_id: partyId } : {}),
      },
    });
    if (!user) {
      throw new NotFoundException('Portal user not found.');
    }
    return user;
  }

  private async revokeAllSessions(portalUserId: string, reason: string) {
    await this.prisma.portalSession.updateMany({
      where: { portal_user_id: portalUserId, is_active: true },
      data: {
        is_active: false,
        revoked_at: new Date(),
        revoked_reason: reason,
      },
    });
  }

  private async issuePortalTokens(
    user: { id: string; tenant_id: string; party_id: string; email: string },
    meta?: { ip?: string; userAgent?: string },
  ) {
    const jti = randomUUID();
    const accessExpiresIn = this.config.get<string>('PORTAL_JWT_ACCESS_EXPIRES_IN') ?? '4h';
    const refreshExpiresIn = this.config.get<string>('PORTAL_JWT_REFRESH_EXPIRES_IN') ?? '7d';
    const refreshDays = 7;

    const base = {
      principal: 'portal' as const,
      sub: user.id,
      tenantId: user.tenant_id,
      partyId: user.party_id,
      email: user.email,
      sessionId: jti,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync({ ...base, type: 'access' } satisfies PortalJwtPayload, {
        secret: this.portalAccessSecret(),
        expiresIn: accessExpiresIn,
      }),
      this.jwt.signAsync({ ...base, type: 'refresh' } satisfies PortalJwtPayload, {
        secret: this.portalRefreshSecret(),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    const refreshHash = await PasswordUtil.hash(refresh_token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    await this.prisma.portalSession.create({
      data: {
        tenant_id: user.tenant_id,
        portal_user_id: user.id,
        jti,
        refresh_token_hash: refreshHash,
        ip_address: meta?.ip,
        user_agent: meta?.userAgent,
        expires_at: expiresAt,
      },
    });

    return {
      access_token,
      refresh_token,
      expires_in: accessExpiresIn,
      token_type: 'Bearer',
    };
  }

  private portalAccessSecret(): string {
    const secret =
      this.config.get<string>('PORTAL_JWT_ACCESS_SECRET') ??
      this.config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('PORTAL_JWT_ACCESS_SECRET or JWT_ACCESS_SECRET must be configured.');
    }
    return secret;
  }

  private portalRefreshSecret(): string {
    return (
      this.config.get<string>('PORTAL_JWT_REFRESH_SECRET') ??
      this.config.get<string>('JWT_REFRESH_SECRET') ??
      this.portalAccessSecret()
    );
  }

  private async sendInviteEmail(
    tenantId: string,
    opts: {
      to: string;
      fullName: string;
      partyName: string;
      token: string;
      expiresAt: Date;
      actorId?: string;
    },
  ) {
    const appUrl =
      this.config.get<string>('PORTAL_APP_URL') ??
      this.config.get<string>('APP_URL') ??
      this.config.get<string>('PUBLIC_API_URL') ??
      'http://localhost:3000';
    const link = `${appUrl.replace(/\/$/, '')}/portal/accept-invite?token=${opts.token}`;

    await this.email.send({
      tenantId,
      eventType: 'PORTAL_INVITE',
      to: opts.to,
      subject: `Activate your customer portal — ${opts.partyName}`,
      body: `
        <p>Hello ${opts.fullName},</p>
        <p>You have been invited to the customer portal for <strong>${opts.partyName}</strong>.</p>
        <p><a href="${link}">Set your password and activate your account</a></p>
        <p>This link expires at ${opts.expiresAt.toISOString()}.</p>
      `,
      createdBy: opts.actorId,
    });
  }

  private async sendCredentialsEmail(
    tenantId: string,
    opts: { to: string; fullName: string; password: string; partyName: string; actorId?: string },
  ) {
    const appUrl = this.config.get<string>('APP_URL') ?? this.config.get<string>('PUBLIC_API_URL') ?? '';
    await this.email.send({
      tenantId,
      eventType: 'PORTAL_CREDENTIALS',
      to: opts.to,
      subject: `Your customer portal login — ${opts.partyName}`,
      body: `
        <p>Hello ${opts.fullName},</p>
        <p>Your customer portal account has been created for <strong>${opts.partyName}</strong>.</p>
        <p><strong>Email:</strong> ${opts.to}<br/>
        <strong>Temporary password:</strong> ${opts.password}</p>
        <p>Use your forwarder's website (or portal login API) with this tenant's credentials to sign in.</p>
        ${appUrl ? `<p>API base: ${appUrl}</p>` : ''}
        <p>Please change your password after first login if prompted by your forwarder.</p>
      `,
      createdBy: opts.actorId,
    });
  }
}
