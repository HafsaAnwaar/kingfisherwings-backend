import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, VendorUserStatus } from '@prisma/client';
import { randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { PasswordHelper } from '../users/helpers/password.helper';
import { EmailService } from '../../shared/email/email.service';
import { VENDOR_ELIGIBLE_PARTY_TYPES } from './constants/vendor-permission.constants';
import {
  AcceptVendorInviteDto,
  CreateVendorUserDto,
  ResetVendorPasswordDto,
  UpdateVendorUserStatusDto,
  VendorLoginDto,
  VendorRefreshDto,
  VendorUserQueryDto,
} from './dto/vendor-auth.dto';
import { CurrentVendorUser, VendorJwtPayload } from './interfaces/vendor-auth.interfaces';
import { VendorPermissionsService } from './vendor-permissions.service';

@Injectable()
export class VendorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly vendorPermissions: VendorPermissionsService,
  ) {}

  async login(dto: VendorLoginDto, meta?: { ip?: string; userAgent?: string }) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug: dto.tenant_slug, deleted_at: null, is_active: true },
    });
    if (!tenant) throw new UnauthorizedException('Invalid credentials.');

    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.vendorUser.findFirst({
      where: { tenant_id: tenant.id, email, deleted_at: null },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            vendor_portal_access: true,
            is_active: true,
            deleted_at: true,
          },
        },
      },
    });

    if (!user || user.status === 'DISABLED') throw new UnauthorizedException('Invalid credentials.');
    if (user.status === 'INVITED') {
      throw new UnauthorizedException(
        'Account is invited but not activated. Use the invite link to set your password.',
      );
    }
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Invalid credentials.');
    if (!user.party.vendor_portal_access || !user.party.is_active || user.party.deleted_at) {
      throw new UnauthorizedException('Vendor portal access is not enabled for this party.');
    }

    const passwordValid = await PasswordUtil.verify(user.password_hash, dto.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials.');

    const tokens = await this.issueTokens(user, meta);
    await this.prisma.vendorUser.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return {
      success: true,
      data: {
        ...tokens,
        vendor_user: {
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

  async refresh(dto: VendorRefreshDto) {
    let payload: VendorJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<VendorJwtPayload>(dto.refresh_token, {
        secret: this.refreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
    if (payload.principal !== 'vendor' || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const session = await this.prisma.vendorSession.findUnique({
      where: { jti: payload.sessionId },
      include: {
        vendor_user: {
          include: {
            party: {
              select: { vendor_portal_access: true, is_active: true, deleted_at: true, name: true },
            },
            tenant: { select: { slug: true, is_active: true, deleted_at: true } },
          },
        },
      },
    });

    if (!session || !session.is_active || session.revoked_at || session.expires_at < new Date()) {
      throw new UnauthorizedException('Vendor session is no longer valid.');
    }
    const matches = await PasswordUtil.verify(session.refresh_token_hash, dto.refresh_token);
    if (!matches) throw new UnauthorizedException('Invalid refresh token.');

    const user = session.vendor_user;
    if (
      !user ||
      user.deleted_at ||
      user.status !== 'ACTIVE' ||
      !user.party.vendor_portal_access ||
      !user.party.is_active ||
      user.party.deleted_at ||
      !user.tenant.is_active ||
      user.tenant.deleted_at
    ) {
      throw new UnauthorizedException('Vendor account is not active.');
    }

    await this.prisma.vendorSession.update({
      where: { id: session.id },
      data: { is_active: false, revoked_at: new Date(), revoked_reason: 'ROTATED' },
    });

    const tokens = await this.issueTokens(user);
    return {
      success: true,
      data: {
        ...tokens,
        vendor_user: {
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

  async logout(vendorUser: CurrentVendorUser) {
    await this.prisma.vendorSession.updateMany({
      where: { jti: vendorUser.sessionId, vendor_user_id: vendorUser.id, is_active: true },
      data: { is_active: false, revoked_at: new Date(), revoked_reason: 'LOGOUT' },
    });
    return { success: true, message: 'Logged out successfully.' };
  }

  async me(vendorUser: CurrentVendorUser) {
    const user = await this.prisma.vendorUser.findFirst({
      where: { id: vendorUser.id, deleted_at: null },
      include: {
        party: {
          select: {
            id: true,
            code: true,
            name: true,
            email: true,
            party_type: true,
            vendor_portal_access: true,
          },
        },
        tenant: { select: { id: true, slug: true, name: true, display_name: true } },
      },
    });
    if (!user) throw new NotFoundException('Vendor user not found.');
    return { success: true, data: user };
  }

  async createVendorUser(tenantId: string, actorId: string, dto: CreateVendorUserDto) {
    const email = dto.email.trim().toLowerCase();
    const party = await this.prisma.runWithTenant(tenantId, (tx: Prisma.TransactionClient) =>
      tx.party.findFirst({ where: { id: dto.party_id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!party) throw new NotFoundException('Party not found.');
    if (!party.is_active) throw new BadRequestException('Party is inactive.');
    if (!VENDOR_ELIGIBLE_PARTY_TYPES.includes(party.party_type as (typeof VENDOR_ELIGIBLE_PARTY_TYPES)[number])) {
      throw new BadRequestException(
        `Party type ${party.party_type} cannot use the vendor portal.`,
      );
    }

    const existing = await this.prisma.vendorUser.findFirst({
      where: { tenant_id: tenantId, email, deleted_at: null },
    });
    if (existing) {
      throw new ConflictException('A vendor user with this email already exists for this tenant.');
    }

    const inviteMode = dto.invite_mode === true;
    const plainPassword = inviteMode
      ? PasswordUtil.generateTemporaryPassword()
      : dto.password?.trim() || PasswordUtil.generateTemporaryPassword();
    const passwordHash = await PasswordUtil.hash(plainPassword);
    const generated = inviteMode ? false : !dto.password;
    const inviteToken = inviteMode ? randomBytes(32).toString('hex') : null;
    const inviteExpiresAt = inviteMode ? PasswordHelper.inviteTokenExpiry() : null;

    const created = await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.party.update({
        where: { id: party.id },
        data: { vendor_portal_access: true, updated_by: actorId },
      });
      return tx.vendorUser.create({
        data: {
          tenant_id: tenantId,
          party_id: party.id,
          email,
          password_hash: passwordHash,
          full_name: dto.full_name.trim(),
          phone: dto.phone?.trim() || null,
          status: inviteMode ? VendorUserStatus.INVITED : VendorUserStatus.ACTIVE,
          invite_token: inviteToken,
          invite_expires_at: inviteExpiresAt,
          invited_at: inviteMode ? new Date() : null,
          activated_at: inviteMode ? null : new Date(),
          created_by: actorId,
        },
      });
    });

    await this.vendorPermissions.seedDefaultsIfEmpty(tenantId, party.id, actorId);

    if (dto.send_email !== false) {
      await this.email.send({
        tenantId,
        eventType: inviteMode ? 'VENDOR_INVITE' : 'VENDOR_CREDENTIALS',
        to: email,
        subject: inviteMode ? 'Vendor portal invite' : 'Vendor portal credentials',
        body: inviteMode
          ? `<p>Hello ${created.full_name},</p><p>Accept your vendor portal invite with token: ${inviteToken}</p>`
          : `<p>Hello ${created.full_name},</p><p>Your vendor portal password is: ${plainPassword}</p>`,
        createdBy: actorId,
      });
    }

    return {
      success: true,
      message: inviteMode ? 'Vendor user invited.' : 'Vendor user created.',
      data: {
        id: created.id,
        email: created.email,
        full_name: created.full_name,
        status: created.status,
        party_id: created.party_id,
        invite_mode: inviteMode,
        ...(inviteMode ? {} : { initial_password: plainPassword, password_generated: generated }),
      },
    };
  }

  async acceptInvite(dto: AcceptVendorInviteDto) {
    PasswordHelper.assertStrength(dto.password);
    const user = await this.prisma.vendorUser.findFirst({
      where: { invite_token: dto.token, deleted_at: null },
      include: {
        party: { select: { vendor_portal_access: true, is_active: true, deleted_at: true } },
        tenant: { select: { slug: true } },
      },
    });
    if (
      !user ||
      user.status !== VendorUserStatus.INVITED ||
      !user.invite_expires_at ||
      user.invite_expires_at < new Date()
    ) {
      throw new BadRequestException('Invite token is invalid or expired.');
    }
    if (!user.party.vendor_portal_access || !user.party.is_active || user.party.deleted_at) {
      throw new BadRequestException('Vendor portal access is not enabled.');
    }

    const passwordHash = await PasswordUtil.hash(dto.password);
    const updated = await this.prisma.runWithTenant(user.tenant_id, (tx) =>
      tx.vendorUser.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          status: VendorUserStatus.ACTIVE,
          invite_token: null,
          invite_expires_at: null,
          activated_at: new Date(),
          full_name: dto.full_name?.trim() || user.full_name,
        },
      }),
    );

    return {
      success: true,
      message: 'Invite accepted. You can now log in.',
      data: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
        tenant_slug: user.tenant.slug,
        party_id: updated.party_id,
      },
    };
  }

  async resendInvite(tenantId: string, actorId: string, vendorUserId: string, partyId?: string) {
    const user = await this.requireVendorUser(tenantId, vendorUserId, partyId);
    if (user.status === VendorUserStatus.DISABLED) {
      throw new BadRequestException('Cannot invite a disabled vendor user.');
    }
    const token = randomBytes(32).toString('hex');
    const expiresAt = PasswordHelper.inviteTokenExpiry();
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorUser.update({
        where: { id: user.id },
        data: {
          status: VendorUserStatus.INVITED,
          invite_token: token,
          invite_expires_at: expiresAt,
          invited_at: new Date(),
          updated_by: actorId,
        },
      }),
    );
    await this.email.send({
      tenantId,
      eventType: 'VENDOR_INVITE',
      to: user.email,
      subject: 'Vendor portal invite',
      body: `<p>Accept invite token: ${token}</p>`,
      createdBy: actorId,
    });
    return { success: true, message: 'Invite resent.', data: { id: user.id, expires_at: expiresAt } };
  }

  async listVendorUsers(tenantId: string, query: VendorUserQueryDto) {
    const rows = await this.prisma.vendorUser.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        ...(query.party_id ? { party_id: query.party_id } : {}),
      },
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
        party: { select: { id: true, code: true, name: true, party_type: true, vendor_portal_access: true } },
      },
    });
    return { success: true, data: rows };
  }

  async updateStatus(
    tenantId: string,
    actorId: string,
    vendorUserId: string,
    dto: UpdateVendorUserStatusDto,
    partyId?: string,
  ) {
    const user = await this.requireVendorUser(tenantId, vendorUserId, partyId);
    const updated = await this.prisma.vendorUser.update({
      where: { id: user.id },
      data: { status: dto.status, updated_by: actorId },
    });
    if (dto.status === 'DISABLED') {
      await this.prisma.vendorSession.updateMany({
        where: { vendor_user_id: user.id, is_active: true },
        data: { is_active: false, revoked_at: new Date(), revoked_reason: 'ACCOUNT_DISABLED' },
      });
    }
    return { success: true, data: { id: updated.id, status: updated.status } };
  }

  async resetPassword(
    tenantId: string,
    actorId: string,
    vendorUserId: string,
    dto: ResetVendorPasswordDto,
    partyId?: string,
  ) {
    const user = await this.requireVendorUser(tenantId, vendorUserId, partyId);
    const plainPassword = dto.password?.trim() || PasswordUtil.generateTemporaryPassword();
    await this.prisma.vendorUser.update({
      where: { id: user.id },
      data: {
        password_hash: await PasswordUtil.hash(plainPassword),
        updated_by: actorId,
        status: VendorUserStatus.ACTIVE,
      },
    });
    await this.prisma.vendorSession.updateMany({
      where: { vendor_user_id: user.id, is_active: true },
      data: { is_active: false, revoked_at: new Date(), revoked_reason: 'PASSWORD_RESET' },
    });
    return {
      success: true,
      data: { id: user.id, email: user.email, initial_password: plainPassword },
    };
  }

  private async requireVendorUser(tenantId: string, id: string, partyId?: string) {
    const user = await this.prisma.vendorUser.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null, ...(partyId ? { party_id: partyId } : {}) },
    });
    if (!user) throw new NotFoundException('Vendor user not found.');
    return user;
  }

  private async issueTokens(
    user: { id: string; tenant_id: string; party_id: string; email: string; full_name: string },
    meta?: { ip?: string; userAgent?: string },
  ) {
    const sessionId = randomUUID();
    const accessTtl = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const refreshTtl = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const base = {
      principal: 'vendor' as const,
      sub: user.id,
      tenantId: user.tenant_id,
      partyId: user.party_id,
      email: user.email,
      sessionId,
    };

    const access_token = await this.jwt.signAsync(
      { ...base, type: 'access' },
      { secret: this.accessSecret(), expiresIn: accessTtl },
    );
    const refresh_token = await this.jwt.signAsync(
      { ...base, type: 'refresh' },
      { secret: this.refreshSecret(), expiresIn: refreshTtl },
    );

    const days = Number(String(refreshTtl).replace(/[^0-9]/g, '')) || 7;
    await this.prisma.vendorSession.create({
      data: {
        tenant_id: user.tenant_id,
        vendor_user_id: user.id,
        jti: sessionId,
        refresh_token_hash: await PasswordUtil.hash(refresh_token),
        ip_address: meta?.ip,
        user_agent: meta?.userAgent,
        expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token, refresh_token };
  }

  private accessSecret(): string {
    return (
      this.config.get<string>('VENDOR_JWT_ACCESS_SECRET') ??
      this.config.get<string>('JWT_ACCESS_SECRET') ??
      ''
    );
  }

  private refreshSecret(): string {
    return (
      this.config.get<string>('VENDOR_JWT_REFRESH_SECRET') ??
      this.config.get<string>('JWT_REFRESH_SECRET') ??
      this.accessSecret()
    );
  }
}
