import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePortalPreferencesDto } from './dto/portal-preferences.dto';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';

const DEFAULT_PREFS = {
  milestone_alerts_enabled: false,
  document_alerts_enabled: true,
  default_shipment_filters: null as Record<string, unknown> | null,
  default_invoice_filters: null as Record<string, unknown> | null,
};

@Injectable()
export class PortalPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async get(user: CurrentPortalUser) {
    const prefs = await this.ensure(user);
    return { success: true, data: this.toDto(prefs) };
  }

  async update(user: CurrentPortalUser, dto: UpdatePortalPreferencesDto) {
    await this.ensure(user);

    const data: Prisma.PortalUserPreferenceUpdateInput = {};
    if (dto.milestone_alerts_enabled !== undefined) {
      data.milestone_alerts_enabled = dto.milestone_alerts_enabled;
    }
    if (dto.document_alerts_enabled !== undefined) {
      data.document_alerts_enabled = dto.document_alerts_enabled;
    }
    if (dto.default_shipment_filters !== undefined) {
      data.default_shipment_filters =
        dto.default_shipment_filters === null
          ? Prisma.DbNull
          : (dto.default_shipment_filters as Prisma.InputJsonValue);
    }
    if (dto.default_invoice_filters !== undefined) {
      data.default_invoice_filters =
        dto.default_invoice_filters === null
          ? Prisma.DbNull
          : (dto.default_invoice_filters as Prisma.InputJsonValue);
    }

    const prefs = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.portalUserPreference.update({
        where: { portal_user_id: user.id },
        data,
      }),
    );

    return { success: true, data: this.toDto(prefs) };
  }

  /** Ensure a preferences row exists (lazy create with plan defaults). */
  async ensure(user: CurrentPortalUser) {
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const existing = await tx.portalUserPreference.findUnique({
        where: { portal_user_id: user.id },
      });
      if (existing) return existing;

      return tx.portalUserPreference.create({
        data: {
          tenant_id: user.tenantId,
          portal_user_id: user.id,
          milestone_alerts_enabled: DEFAULT_PREFS.milestone_alerts_enabled,
          document_alerts_enabled: DEFAULT_PREFS.document_alerts_enabled,
        },
      });
    });
  }

  toDto(prefs: {
    milestone_alerts_enabled: boolean;
    document_alerts_enabled: boolean;
    default_shipment_filters: Prisma.JsonValue;
    default_invoice_filters: Prisma.JsonValue;
  }) {
    return {
      milestone_alerts_enabled: prefs.milestone_alerts_enabled,
      document_alerts_enabled: prefs.document_alerts_enabled,
      default_shipment_filters: (prefs.default_shipment_filters as Record<string, unknown> | null) ?? null,
      default_invoice_filters: (prefs.default_invoice_filters as Record<string, unknown> | null) ?? null,
    };
  }

  defaults() {
    return { ...DEFAULT_PREFS };
  }
}
