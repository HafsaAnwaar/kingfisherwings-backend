import { Injectable, NotFoundException } from "@nestjs/common";
import { OpsEntityType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export type TimelineSource = "AUDIT" | "COSTING" | "STATUS" | "ENTITY";

export interface TimelineActor {
  id: string | null;
  name: string | null;
}

export interface TimelineEvent {
  id: string;
  at: string;
  action: string;
  summary: string;
  source: TimelineSource;
  entity: string;
  entity_id: string;
  actor: TimelineActor;
  old_values?: unknown;
  new_values?: unknown;
  metadata?: unknown;
}

const AUDIT_ENTITY_ALIASES: Record<OpsEntityType, string[]> = {
  JOB: ["JOB", "job", "Job", "OpsJOB"],
  SHIPMENT: ["SHIPMENT", "shipment", "Shipment", "OpsSHIPMENT"],
  QUOTATION: ["QUOTATION", "quotation", "Quotation", "OpsQUOTATION"],
  ENQUIRY: ["ENQUIRY", "enquiry", "Enquiry", "OpsENQUIRY"],
};

@Injectable()
export class EntityTimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getTimeline(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    options?: { limit?: number },
  ) {
    const limit = Math.min(Math.max(options?.limit ?? 300, 1), 500);
    await this.assertExists(tenantId, entityType, entityId);

    const [auditEvents, extraEvents, header] = await Promise.all([
      this.loadAuditEvents(tenantId, entityType, entityId, limit),
      this.loadExtraEvents(tenantId, entityType, entityId, limit),
      this.loadEntityHeader(tenantId, entityType, entityId),
    ]);

    const events: TimelineEvent[] = [...auditEvents, ...extraEvents];

    // Synthetic create if no CREATE / JOB_CREATED / SHIPMENT_CREATED audit
    const hasCreate = events.some((e) =>
      /CREATE|_CREATED$/i.test(e.action),
    );
    if (header && !hasCreate) {
      events.push({
        id: `entity-created-${entityId}`,
        at: header.created_at.toISOString(),
        action: `${entityType}_CREATED`,
        summary: this.summarize(`${entityType}_CREATED`, {
          number: header.number,
        }),
        source: "ENTITY",
        entity: entityType,
        entity_id: entityId,
        actor: { id: header.created_by, name: null },
        metadata: { number: header.number, status: header.status },
      });
    }

    const actorIds = [
      ...new Set(
        events.map((e) => e.actor.id).filter((id): id is string => !!id),
      ),
    ];
    const nameMap = await this.resolveActorNames(tenantId, actorIds);
    for (const e of events) {
      if (e.actor.id && nameMap.has(e.actor.id)) {
        e.actor.name = nameMap.get(e.actor.id)!;
      }
    }

    events.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );

    return {
      success: true,
      data: {
        entity_type: entityType,
        entity_id: entityId,
        events: events.slice(0, limit),
      },
    };
  }

  summarize(action: string, meta?: Record<string, unknown>): string {
    const number = meta?.number != null ? String(meta.number) : null;
    const from =
      meta?.from_status ?? meta?.old_status ?? meta?.from ?? undefined;
    const to =
      meta?.to_status ??
      meta?.new_status ??
      meta?.status ??
      meta?.to ??
      undefined;
    switch (action) {
      case "JOB_CREATED":
      case "SHIPMENT_CREATED":
      case "QUOTATION_CREATED":
      case "ENQUIRY_CREATED":
      case "CREATE":
        return number
          ? `Created ${number}`
          : `Created ${action.replace(/_CREATED$/, "").toLowerCase()}`;
      case "JOB_STATUS_CHANGE":
      case "SHIPMENT_STATUS_CHANGE":
        return from && to
          ? `Status changed ${from} → ${to}`
          : to
            ? `Status changed to ${to}`
            : "Status changed";
      case "JOB_CLOSED":
        return "Job closed";
      case "JOB_CANCELLED":
        return "Job cancelled";
      case "JOB_REOPENED":
        return "Job reopened";
      case "SHIPMENT_BL_STATUS_CHANGE":
        return to ? `BL status changed to ${to}` : "BL status changed";
      case "SHIPMENT_GENERATE_JOB":
        return number
          ? `Generated job ${number}`
          : "Generated job from shipment";
      case "JOB_PROFIT_SHARE_ADDED":
        return "Profit share charge added";
      case "COSTING_CREATE":
        return "Costing line added";
      case "COSTING_PATCH_SALE":
        return "Costing sale side updated";
      case "COSTING_PATCH_COST":
        return "Costing cost side updated";
      case "QUOTATION_STATUS_CHANGE":
        return from && to
          ? `Quotation status ${from} → ${to}`
          : to
            ? `Quotation status → ${to}`
            : "Quotation status changed";
      default:
        if (action.startsWith("FOLLOW_UP")) return "Follow-up updated";
        if (action.startsWith("ATTACHMENT")) return "Attachment updated";
        if (action.startsWith("OPS_COMMENT")) return "Comment updated";
        if (action.startsWith("TAG_")) return "Tag updated";
        if (action.startsWith("LINK_")) return "Link updated";
        if (action.startsWith("COMPLAINT")) return "Complaint updated";
        if (action.startsWith("JOB_"))
          return action.replace(/^JOB_/, "").replace(/_/g, " ").toLowerCase();
        return action.replace(/_/g, " ");
    }
  }

  private async loadAuditEvents(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    limit: number,
  ): Promise<TimelineEvent[]> {
    const aliases = AUDIT_ENTITY_ALIASES[entityType] ?? [entityType];
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.findMany({
        where: {
          tenant_id: tenantId,
          entity_id: entityId,
          OR: aliases.map((e) => ({
            entity: { equals: e, mode: "insensitive" },
          })),
        },
        orderBy: { created_at: "desc" },
        take: limit,
      }),
    );

    return rows.map((r) => {
      const meta =
        r.metadata && typeof r.metadata === "object" && !Array.isArray(r.metadata)
          ? (r.metadata as Record<string, unknown>)
          : {};
      const newVals =
        r.new_values &&
        typeof r.new_values === "object" &&
        !Array.isArray(r.new_values)
          ? (r.new_values as Record<string, unknown>)
          : {};
      return {
        id: r.id,
        at: r.created_at.toISOString(),
        action: r.action,
        summary: this.summarize(r.action, { ...meta, ...newVals }),
        source: "AUDIT" as const,
        entity: r.entity,
        entity_id: r.entity_id ?? entityId,
        actor: { id: r.user_id, name: null },
        old_values: r.old_values ?? undefined,
        new_values: r.new_values ?? undefined,
        metadata: r.metadata ?? undefined,
      };
    });
  }

  private async loadExtraEvents(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
    limit: number,
  ): Promise<TimelineEvent[]> {
    if (entityType === "JOB") {
      return this.loadCostingEvents(tenantId, entityId, limit);
    }
    if (entityType === "QUOTATION") {
      return this.loadQuotationStatusEvents(tenantId, entityId, limit);
    }
    if (entityType === "SHIPMENT") {
      // Include linked-job lifecycle audits that mention this shipment in metadata
      return this.loadLinkedJobHintEvents(tenantId, entityId, limit);
    }
    return [];
  }

  private async loadCostingEvents(
    tenantId: string,
    jobId: string,
    limit: number,
  ): Promise<TimelineEvent[]> {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobChargeRevision.findMany({
        where: { tenant_id: tenantId, job_id: jobId },
        orderBy: { created_at: "desc" },
        take: limit,
      }),
    );
    return rows.map((r) => {
      const action = `COSTING_${r.action}`;
      return {
        id: `costing-${r.id}`,
        at: r.created_at.toISOString(),
        action,
        summary: this.summarize(action),
        source: "COSTING" as const,
        entity: "JOB",
        entity_id: jobId,
        actor: { id: r.actor_id, name: null },
        old_values: r.before_json ?? undefined,
        new_values: r.after_json ?? undefined,
        metadata: { job_charge_id: r.job_charge_id, revision_id: r.id },
      };
    });
  }

  private async loadQuotationStatusEvents(
    tenantId: string,
    quotationId: string,
    limit: number,
  ): Promise<TimelineEvent[]> {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotationStatusHistory.findMany({
        where: { tenant_id: tenantId, quotation_id: quotationId },
        orderBy: { created_at: "desc" },
        take: limit,
      }),
    );
    return rows.map((r) => ({
      id: `qstatus-${r.id}`,
      at: r.created_at.toISOString(),
      action: "QUOTATION_STATUS_CHANGE",
      summary: this.summarize("QUOTATION_STATUS_CHANGE", {
        from_status: r.from_status,
        to_status: r.to_status,
      }),
      source: "STATUS" as const,
      entity: "QUOTATION",
      entity_id: quotationId,
      actor: { id: r.changed_by, name: null },
      old_values: { status: r.from_status },
      new_values: { status: r.to_status },
      metadata: { reason: r.reason },
    }));
  }

  private async loadLinkedJobHintEvents(
    tenantId: string,
    shipmentId: string,
    limit: number,
  ): Promise<TimelineEvent[]> {
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
        select: { job_id: true },
      }),
    );
    if (!shipment?.job_id) return [];

    // Surface job create linked from this shipment if present in job audits
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.findMany({
        where: {
          tenant_id: tenantId,
          entity_id: shipment.job_id!,
          action: { in: ["JOB_CREATED", "CREATE"] },
        },
        orderBy: { created_at: "desc" },
        take: Math.min(limit, 20),
      }),
    );
    return rows.map((r) => ({
      id: `linked-job-${r.id}`,
      at: r.created_at.toISOString(),
      action: r.action,
      summary: this.summarize(r.action, {
        ...(typeof r.metadata === "object" && r.metadata
          ? (r.metadata as Record<string, unknown>)
          : {}),
      }),
      source: "AUDIT" as const,
      entity: "JOB",
      entity_id: shipment.job_id!,
      actor: { id: r.user_id, name: null },
      metadata: {
        ...(typeof r.metadata === "object" && r.metadata
          ? (r.metadata as object)
          : {}),
        linked_from_shipment: shipmentId,
      },
    }));
  }

  private async loadEntityHeader(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ): Promise<{
    created_at: Date;
    created_by: string | null;
    number: string | null;
    status: string | null;
  } | null> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (entityType === "JOB") {
        const row = await tx.job.findFirst({
          where: { id: entityId, tenant_id: tenantId, deleted_at: null },
          select: {
            created_at: true,
            created_by: true,
            job_number: true,
            status: true,
          },
        });
        return row
          ? {
              created_at: row.created_at,
              created_by: row.created_by,
              number: row.job_number,
              status: row.status,
            }
          : null;
      }
      if (entityType === "SHIPMENT") {
        const row = await tx.shipment.findFirst({
          where: { id: entityId, tenant_id: tenantId, deleted_at: null },
          select: {
            created_at: true,
            created_by: true,
            shipment_number: true,
            status: true,
          },
        });
        return row
          ? {
              created_at: row.created_at,
              created_by: row.created_by,
              number: row.shipment_number,
              status: row.status,
            }
          : null;
      }
      if (entityType === "QUOTATION") {
        const row = await tx.quotation.findFirst({
          where: { id: entityId, tenant_id: tenantId, deleted_at: null },
          select: {
            created_at: true,
            created_by: true,
            quotation_number: true,
            status: true,
          },
        });
        return row
          ? {
              created_at: row.created_at,
              created_by: row.created_by,
              number: row.quotation_number,
              status: row.status,
            }
          : null;
      }
      if (entityType === "ENQUIRY") {
        const row = await tx.enquiry.findFirst({
          where: { id: entityId, tenant_id: tenantId, deleted_at: null },
          select: {
            created_at: true,
            created_by: true,
            status: true,
          },
        });
        return row
          ? {
              created_at: row.created_at,
              created_by: row.created_by,
              number: entityId.slice(0, 8),
              status: row.status,
            }
          : null;
      }
      return null;
    });
  }

  private async resolveActorNames(
    tenantId: string,
    userIds: string[],
  ): Promise<Map<string, string>> {
    if (!userIds.length) return new Map();
    const users = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.user.findMany({
        where: { tenant_id: tenantId, id: { in: userIds } },
        select: { id: true, first_name: true, last_name: true, email: true },
      }),
    );
    return new Map(
      users.map((u) => [
        u.id,
        [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
          u.email,
      ]),
    );
  }

  private async assertExists(
    tenantId: string,
    entityType: OpsEntityType,
    entityId: string,
  ) {
    const header = await this.loadEntityHeader(tenantId, entityType, entityId);
    if (!header) {
      throw new NotFoundException(`${entityType} not found.`);
    }
  }
}

/** Helper for services to write consistent lifecycle audit rows. */
export async function writeEntityAudit(
  tx: Prisma.TransactionClient,
  params: {
    tenantId: string;
    userId?: string | null;
    action: string;
    entity: string;
    entityId: string;
    oldValues?: unknown;
    newValues?: unknown;
    metadata?: Record<string, unknown>;
  },
) {
  await tx.auditLog.create({
    data: {
      tenant_id: params.tenantId,
      user_id: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId,
      old_values:
        params.oldValues === undefined
          ? undefined
          : (params.oldValues as Prisma.InputJsonValue),
      new_values:
        params.newValues === undefined
          ? undefined
          : (params.newValues as Prisma.InputJsonValue),
      metadata:
        params.metadata === undefined
          ? undefined
          : (params.metadata as Prisma.InputJsonValue),
    },
  });
}
