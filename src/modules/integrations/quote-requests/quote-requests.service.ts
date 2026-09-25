import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  ExternalQuoteRequestProvider,
  JobType,
  LeadSource,
  LeadStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { CrmActivityService } from "../../crm/crm-activity.service";
import { CurrentUser } from "../../users/interfaces/current-user.interface";
import { KfppWpConnector } from "./connectors/kfpp-wp.connector";
import { NormalizedQuoteRequest } from "./connectors/quote-request-connector.interface";
import {
  PatchQuoteRequestStatusDto,
  QuoteRequestListQueryDto,
  UpsertQuoteRequestConnectionDto,
} from "./dto/quote-requests.dto";
import {
  decryptSecret,
  encryptSecret,
  secretPrefix,
} from "./utils/integration-secrets.util";

@Injectable()
export class QuoteRequestsService {
  private readonly logger = new Logger(QuoteRequestsService.name);
  private readonly syncLocks = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly crmActivity: CrmActivityService,
  ) {}

  async assertBridgeEnabled(tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
      select: { quote_requests_bridge_enabled: true, base_currency: true },
    });
    if (!tenant?.quote_requests_bridge_enabled) {
      throw new NotFoundException();
    }
    return tenant;
  }

  async getConnection(tenantId: string) {
    await this.assertBridgeEnabled(tenantId);
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.externalQuoteRequestConnection.findUnique({
        where: { tenant_id: tenantId },
      }),
    );
    if (!row) {
      return {
        success: true,
        data: null,
        message: "No quote-requests connection configured.",
      };
    }
    return { success: true, data: this.sanitizeConnection(row) };
  }

  async upsertConnection(
    tenantId: string,
    actorId: string,
    dto: UpsertQuoteRequestConnectionDto,
  ) {
    await this.assertBridgeEnabled(tenantId);
    const ciphertext = encryptSecret(dto.api_key);
    const prefix = secretPrefix(dto.api_key);
    const data = {
      provider: dto.provider ?? ExternalQuoteRequestProvider.KFPP_WP,
      base_url: dto.base_url.trim().replace(/\/+$/, ""),
      api_key_ciphertext: ciphertext,
      api_key_prefix: prefix,
      auth_header_name: dto.auth_header_name?.trim() || "X-KFPP-Api-Key",
      status_map: dto.status_map ?? Prisma.JsonNull,
      is_active: dto.is_active ?? true,
      updated_by: actorId,
    };

    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.externalQuoteRequestConnection.upsert({
        where: { tenant_id: tenantId },
        create: {
          tenant_id: tenantId,
          ...data,
          created_by: actorId,
        },
        update: data,
      }),
    );
    return {
      success: true,
      message: "Quote-requests connection saved.",
      data: this.sanitizeConnection(row),
    };
  }

  async testConnection(tenantId: string) {
    await this.assertBridgeEnabled(tenantId);
    const connector = await this.buildConnector(tenantId);
    const health = await connector.health();
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.externalQuoteRequestConnection.update({
        where: { tenant_id: tenantId },
        data: {
          last_health_at: new Date(),
          last_health_ok: health.ok,
          last_health_error: health.ok ? null : health.message ?? "Health failed",
        },
      }),
    );
    return { success: health.ok, data: health };
  }

  async sync(tenantId: string, trigger: "manual" | "cron" = "manual") {
    await this.assertBridgeEnabled(tenantId);
    if (this.syncLocks.has(tenantId)) {
      throw new BadRequestException("A sync is already running for this tenant.");
    }
    this.syncLocks.add(tenantId);

    const run = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.externalQuoteRequestSyncRun.create({
        data: { tenant_id: tenantId, trigger },
      }),
    );

    let fetched = 0;
    let upserted = 0;
    let failed = 0;
    let errorSummary: string | null = null;

    try {
      const conn = await this.requireConnectionRow(tenantId);
      if (!conn.is_active) {
        throw new BadRequestException("Quote-requests connection is inactive.");
      }
      const connector = await this.buildConnector(tenantId);
      const list = await connector.list();
      fetched = list.items.length;

      const tenant = await this.prisma.tenant.findFirst({
        where: { id: tenantId },
        select: { base_currency: true },
      });
      const currency = (tenant?.base_currency || "USD").slice(0, 3);

      for (const item of list.items) {
        try {
          await this.upsertMirroredItem(tenantId, item, currency);
          upserted += 1;
        } catch (err) {
          failed += 1;
          this.logger.warn(
            `Quote request sync item ${item.external_id} failed: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      }

      await this.retryPendingStatusPushes(tenantId, connector);

      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.externalQuoteRequestConnection.update({
          where: { tenant_id: tenantId },
          data: {
            last_sync_at: new Date(),
            last_health_at: new Date(),
            last_health_ok: true,
            last_health_error: null,
          },
        }),
      );
    } catch (err) {
      errorSummary = err instanceof Error ? err.message : String(err);
      failed += 1;
      try {
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.externalQuoteRequestConnection.updateMany({
            where: { tenant_id: tenantId },
            data: {
              last_health_at: new Date(),
              last_health_ok: false,
              last_health_error: errorSummary,
            },
          }),
        );
      } catch {
        /* connection may not exist yet */
      }
    } finally {
      this.syncLocks.delete(tenantId);
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.externalQuoteRequestSyncRun.update({
          where: { id: run.id },
          data: {
            finished_at: new Date(),
            fetched,
            upserted,
            failed,
            error_summary: errorSummary,
          },
        }),
      );
    }

    return {
      success: !errorSummary,
      data: { run_id: run.id, fetched, upserted, failed, error_summary: errorSummary },
    };
  }

  async listSyncRuns(tenantId: string, page = 1, limit = 20) {
    await this.assertBridgeEnabled(tenantId);
    const where = { tenant_id: tenantId };
    const [data, total] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) =>
        Promise.all([
          tx.externalQuoteRequestSyncRun.findMany({
            where,
            orderBy: { started_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
          }),
          tx.externalQuoteRequestSyncRun.count({ where }),
        ]),
    );
    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async list(tenantId: string, query: QuoteRequestListQueryDto) {
    await this.assertBridgeEnabled(tenantId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ExternalQuoteRequestWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { contact_email: { contains: query.search, mode: "insensitive" } },
              { contact_name: { contains: query.search, mode: "insensitive" } },
              { company_name: { contains: query.search, mode: "insensitive" } },
              { external_id: { contains: query.search } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) =>
        Promise.all([
          tx.externalQuoteRequest.findMany({
            where,
            orderBy: [{ submitted_at: "desc" }, { created_at: "desc" }],
            skip: (page - 1) * limit,
            take: limit,
          }),
          tx.externalQuoteRequest.count({ where }),
        ]),
    );
    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async getOne(tenantId: string, id: string) {
    await this.assertBridgeEnabled(tenantId);
    const row = await this.requireMirror(tenantId, id);
    return { success: true, data: row };
  }

  async patchStatus(
    tenantId: string,
    id: string,
    dto: PatchQuoteRequestStatusDto,
  ) {
    await this.assertBridgeEnabled(tenantId);
    const row = await this.requireMirror(tenantId, id);
    const mapped = await this.mapStatusOutbound(tenantId, dto.status);

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.externalQuoteRequest.update({
        where: { id: row.id },
        data: {
          status: dto.status,
          pending_status_push: true,
          sync_error: null,
        },
      }),
    );

    try {
      const connector = await this.buildConnector(tenantId);
      await connector.updateStatus(row.external_id, mapped);
      const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.externalQuoteRequest.update({
          where: { id: row.id },
          data: {
            pending_status_push: false,
            status_pushed_at: new Date(),
            sync_error: null,
          },
        }),
      );
      return {
        success: true,
        message: "Status updated locally and pushed remotely.",
        data: updated,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.externalQuoteRequest.update({
          where: { id: row.id },
          data: {
            pending_status_push: true,
            sync_error: message,
          },
        }),
      );
      return {
        success: false,
        message: "Local status saved; remote push failed and will retry.",
        data: updated,
      };
    }
  }

  async linkCrm(tenantId: string, id: string, actorId?: string) {
    await this.assertBridgeEnabled(tenantId);
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId },
      select: { base_currency: true },
    });
    const currency = (tenant?.base_currency || "USD").slice(0, 3);
    const row = await this.requireMirror(tenantId, id);
    const normalized: NormalizedQuoteRequest = {
      external_id: row.external_id,
      status: row.status,
      contact_name: row.contact_name,
      contact_email: row.contact_email,
      contact_phone: row.contact_phone,
      company_name: row.company_name,
      message: row.message,
      commodity: row.commodity,
      submitted_at: row.submitted_at,
      raw: (row.raw_json as Record<string, unknown>) ?? {},
    };
    const updated = await this.upsertMirroredItem(
      tenantId,
      normalized,
      currency,
      actorId,
      true,
    );
    return { success: true, data: updated };
  }

  async convertToQuote(user: CurrentUser, id: string) {
    await this.assertBridgeEnabled(user.tenantId);
    const row = await this.requireMirror(user.tenantId, id);
    if (!row.enquiry_id) {
      throw new BadRequestException(
        "Link CRM first (POST .../link-crm) before converting to a quotation.",
      );
    }
    return this.crmActivity.convertToQuote(user, row.enquiry_id);
  }

  /** Cron entry: sync all enabled + active connections. */
  async syncAllEnabledTenants() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        deleted_at: null,
        is_active: true,
        quote_requests_bridge_enabled: true,
      },
      select: { id: true },
    });
    const results: Array<{ tenant_id: string; ok: boolean; error?: string }> =
      [];
    for (const t of tenants) {
      const conn = await this.prisma.externalQuoteRequestConnection.findUnique({
        where: { tenant_id: t.id },
        select: { is_active: true },
      });
      if (!conn?.is_active) continue;
      try {
        const res = await this.sync(t.id, "cron");
        results.push({ tenant_id: t.id, ok: res.success });
      } catch (err) {
        results.push({
          tenant_id: t.id,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return results;
  }

  async setFeatureFlag(tenantId: string, enabled: boolean) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
    });
    if (!tenant) throw new NotFoundException("Tenant not found.");
    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { quote_requests_bridge_enabled: enabled },
    });
    if (!enabled) {
      await this.prisma.externalQuoteRequestConnection.updateMany({
        where: { tenant_id: tenantId },
        data: { is_active: false },
      });
    }
    return {
      success: true,
      data: {
        id: updated.id,
        slug: updated.slug,
        quote_requests_bridge_enabled: updated.quote_requests_bridge_enabled,
      },
    };
  }

  // ── internals ────────────────────────────────────────────────────────────

  private sanitizeConnection(row: {
    id: string;
    tenant_id: string;
    provider: ExternalQuoteRequestProvider;
    base_url: string;
    api_key_prefix: string;
    auth_header_name: string;
    status_map: Prisma.JsonValue | null;
    is_active: boolean;
    last_health_at: Date | null;
    last_health_ok: boolean | null;
    last_health_error: string | null;
    last_sync_at: Date | null;
    sync_cursor: string | null;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: row.id,
      tenant_id: row.tenant_id,
      provider: row.provider,
      base_url: row.base_url,
      api_key_prefix: row.api_key_prefix,
      auth_header_name: row.auth_header_name,
      status_map: row.status_map,
      is_active: row.is_active,
      last_health_at: row.last_health_at,
      last_health_ok: row.last_health_ok,
      last_health_error: row.last_health_error,
      last_sync_at: row.last_sync_at,
      sync_cursor: row.sync_cursor,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async requireConnectionRow(tenantId: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.externalQuoteRequestConnection.findUnique({
        where: { tenant_id: tenantId },
      }),
    );
    if (!row) {
      throw new BadRequestException(
        "Configure the quote-requests connection first.",
      );
    }
    return row;
  }

  private async buildConnector(tenantId: string) {
    const row = await this.requireConnectionRow(tenantId);
    const apiKey = decryptSecret(row.api_key_ciphertext);
    if (row.provider === ExternalQuoteRequestProvider.GENERIC_REST) {
      // v1: same REST shape as KFPP
      return new KfppWpConnector({
        baseUrl: row.base_url,
        apiKey,
        authHeaderName: row.auth_header_name,
      });
    }
    return new KfppWpConnector({
      baseUrl: row.base_url,
      apiKey,
      authHeaderName: row.auth_header_name,
    });
  }

  private async requireMirror(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.externalQuoteRequest.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!row) throw new NotFoundException("Quote request not found.");
    return row;
  }

  private async mapStatusOutbound(tenantId: string, status: string) {
    const conn = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.externalQuoteRequestConnection.findUnique({
        where: { tenant_id: tenantId },
        select: { status_map: true },
      }),
    );
    const map = conn?.status_map as Record<string, string> | null;
    if (map && typeof map[status] === "string") return map[status];
    return status;
  }

  private async retryPendingStatusPushes(
    tenantId: string,
    connector: KfppWpConnector,
  ) {
    const pending = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.externalQuoteRequest.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          pending_status_push: true,
          status: { not: null },
        },
        take: 50,
      }),
    );
    for (const row of pending) {
      if (!row.status) continue;
      try {
        const mapped = await this.mapStatusOutbound(tenantId, row.status);
        await connector.updateStatus(row.external_id, mapped);
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.externalQuoteRequest.update({
            where: { id: row.id },
            data: {
              pending_status_push: false,
              status_pushed_at: new Date(),
              sync_error: null,
            },
          }),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.externalQuoteRequest.update({
            where: { id: row.id },
            data: { sync_error: message },
          }),
        );
      }
    }
  }

  private async upsertMirroredItem(
    tenantId: string,
    item: NormalizedQuoteRequest,
    currency: string,
    actorId?: string,
    forceCrm = false,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.externalQuoteRequest.findUnique({
        where: {
          tenant_id_external_id: {
            tenant_id: tenantId,
            external_id: item.external_id,
          },
        },
      });

      let partyId = existing?.party_id ?? null;
      if (item.contact_email) {
        const party = await tx.party.findFirst({
          where: {
            tenant_id: tenantId,
            email: item.contact_email,
            deleted_at: null,
          },
        });
        if (party) {
          partyId = party.id;
        } else {
          const phone = item.contact_phone?.slice(0, 30) ?? null;
          const created = await tx.party.create({
            data: {
              tenant_id: tenantId,
              party_type: "CUSTOMER",
              code: `QR-${Date.now()}`.slice(0, 40),
              name:
                item.company_name ||
                item.contact_name ||
                item.contact_email,
              email: item.contact_email,
              phone,
              is_active: true,
              portal_access: false,
            },
          });
          partyId = created.id;
        }
      }

      let leadId = existing?.lead_id ?? null;
      let enquiryId = existing?.enquiry_id ?? null;
      const needCrm = forceCrm || !leadId || !enquiryId;

      if (needCrm && !leadId) {
        const lead = await tx.lead.create({
          data: {
            tenant_id: tenantId,
            company_name:
              item.company_name ||
              item.contact_name ||
              item.contact_email ||
              `Website request ${item.external_id}`,
            contact_name:
              item.contact_name ||
              item.company_name ||
              item.contact_email ||
              "Website contact",
            email: item.contact_email,
            phone: item.contact_phone?.slice(0, 30) ?? null,
            source: LeadSource.WEBSITE,
            status: LeadStatus.NEW,
            notes: [
              item.message,
              item.commodity ? `Commodity: ${item.commodity}` : null,
              `External quote request #${item.external_id}`,
            ]
              .filter(Boolean)
              .join("\n"),
            converted_party_id: partyId,
            created_by: actorId,
            updated_by: actorId,
          },
        });
        leadId = lead.id;
      }

      if (needCrm && !enquiryId && leadId) {
        const enquiry = await tx.enquiry.create({
          data: {
            tenant_id: tenantId,
            lead_id: leadId,
            party_id: partyId,
            service_type: JobType.SERVICE_JOB,
            cargo_details: item.commodity || item.message,
            special_requirements: [
              item.message,
              `Synced from external quote request #${item.external_id}`,
            ]
              .filter(Boolean)
              .join("\n"),
            currency_code: currency,
            created_by: actorId,
            updated_by: actorId,
          },
        });
        enquiryId = enquiry.id;
      } else if (enquiryId && item.message) {
        await tx.enquiry.update({
          where: { id: enquiryId },
          data: {
            cargo_details: item.commodity || item.message,
            special_requirements: [
              item.message,
              `Synced from external quote request #${item.external_id}`,
            ]
              .filter(Boolean)
              .join("\n"),
            updated_by: actorId,
          },
        });
      }

      const remoteStatus = item.status;
      const conflictNote =
        existing?.status &&
        existing.remote_status_at_pull &&
        remoteStatus &&
        existing.remote_status_at_pull !== remoteStatus &&
        existing.status !== remoteStatus
          ? `Remote status changed ${existing.remote_status_at_pull} → ${remoteStatus} (local was ${existing.status})`
          : null;

      return tx.externalQuoteRequest.upsert({
        where: {
          tenant_id_external_id: {
            tenant_id: tenantId,
            external_id: item.external_id,
          },
        },
        create: {
          tenant_id: tenantId,
          external_id: item.external_id,
          status: item.status,
          contact_name: item.contact_name,
          contact_email: item.contact_email,
          contact_phone: item.contact_phone,
          company_name: item.company_name,
          message: item.message,
          commodity: item.commodity,
          submitted_at: item.submitted_at,
          party_id: partyId,
          lead_id: leadId,
          enquiry_id: enquiryId,
          raw_json: item.raw as Prisma.InputJsonValue,
          last_synced_at: new Date(),
          remote_status_at_pull: item.status,
        },
        update: {
          status: item.status ?? undefined,
          contact_name: item.contact_name,
          contact_email: item.contact_email,
          contact_phone: item.contact_phone,
          company_name: item.company_name,
          message: item.message,
          commodity: item.commodity,
          submitted_at: item.submitted_at,
          party_id: partyId,
          lead_id: leadId,
          enquiry_id: enquiryId,
          raw_json: item.raw as Prisma.InputJsonValue,
          last_synced_at: new Date(),
          remote_status_at_pull: item.status,
          sync_error: conflictNote,
        },
      });
    });
  }
}
