import { Injectable, Logger, Optional } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Prisma } from "@prisma/client";
import type { Queue } from "bull";
import { PrismaService } from "../../../prisma/prisma.service";
import { EmailService } from "../../../shared/email/email.service";
import { renderBrandedEmail } from "../../../shared/email/branded-email.template";
import { STAFF_ACTIVITY_QUEUE } from "./staff-activity.rules";
import {
  adminEmailDedupeKey,
  claimAdminEmailDedupe,
} from "../tenant-admin-notification-email.util";

export interface StaffActivityEvent {
  tenantId: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId: string | null;
  reference: string | null;
  status: string | null;
  amount: string | null;
  method: string;
  route: string;
  linkPath: string | null;
  /** Extra human detail (status change, document type, …). */
  detail?: string | null;
  occurredAt: string;
}

export interface StaffActivityJob {
  auditLogId: string;
  tenantId: string;
}

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const roleLabel = (role: string) =>
  role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Staff activity → Tenant Admin email.
 *
 * Each captured activity is written once to `audit_logs`, then delivered by
 * EmailService (Bull when Redis is up, otherwise in-process). The originating
 * request never waits on or fails because of email.
 *
 * Recipients (activity tenant only): tenant sign-up email + active TENANT_ADMIN
 * users — including an admin who performed the action themselves.
 *
 * Email body always names the staff member and role, e.g.
 * "Ahmad Khan (Sales Executive) changed status of Job JOB-2024-001".
 */
@Injectable()
export class StaffActivityService {
  private readonly logger = new Logger(StaffActivityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    @Optional()
    @InjectQueue(STAFF_ACTIVITY_QUEUE)
    private readonly queue?: Queue<StaffActivityJob>,
  ) {}

  enabled() {
    return process.env.STAFF_ACTIVITY_EMAILS !== "false";
  }

  /** Records the activity and schedules its email. Never throws. */
  async record(event: StaffActivityEvent) {
    try {
      const log = await this.prisma.runWithTenant(event.tenantId, (tx) =>
        tx.auditLog.create({
          data: {
            tenant_id: event.tenantId,
            user_id: event.actorUserId,
            action: event.action.slice(0, 50),
            entity: event.entity.slice(0, 100),
            entity_id:
              event.entityId && /^[0-9a-f-]{36}$/i.test(event.entityId)
                ? event.entityId
                : null,
            new_values: event.status
              ? ({ status: event.status } as Prisma.InputJsonValue)
              : undefined,
            metadata: {
              source: "staff_activity",
              method: event.method,
              route: event.route,
              reference: event.reference,
              amount: event.amount,
              link_path: event.linkPath,
              detail: event.detail ?? null,
              occurred_at: event.occurredAt,
            } as Prisma.InputJsonValue,
          },
        }),
      );
      const job: StaffActivityJob = {
        auditLogId: log.id,
        tenantId: event.tenantId,
      };
      if (this.queue) {
        await this.queue.add("send", job, {
          jobId: log.id,
          attempts: 3,
          backoff: { type: "exponential", delay: 30_000 },
          removeOnComplete: true,
          removeOnFail: 100,
        });
      } else {
        setImmediate(() => void this.deliver(job).catch(() => undefined));
      }
    } catch (err) {
      this.logger.warn(
        `Staff activity not recorded (${event.action}): ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /** Sends the email for one recorded activity (queue worker / fallback). */
  async deliver(job: StaffActivityJob) {
    const { log, tenant, actor, admins, jobRef } =
      await this.prisma.runWithTenant(job.tenantId, async (tx) => {
        const log = await tx.auditLog.findFirst({
          where: { id: job.auditLogId, tenant_id: job.tenantId },
        });
        const tenant = await tx.tenant.findUnique({
          where: { id: job.tenantId },
          select: { name: true, display_name: true, email: true },
        });
        const actor = log?.user_id
          ? await tx.user.findFirst({
              where: { id: log.user_id, tenant_id: job.tenantId },
              select: {
                first_name: true,
                last_name: true,
                email: true,
                role: true,
              },
            })
          : null;
        const admins = await tx.user.findMany({
          where: {
            tenant_id: job.tenantId,
            role: "TENANT_ADMIN",
            status: "ACTIVE",
            deleted_at: null,
          },
          select: { email: true },
          take: 20,
        });

        // Enrich Job activities with job_number when reference was missing.
        let jobRef: string | null = null;
        const meta = (log?.metadata ?? {}) as Record<string, string | null>;
        if (
          log &&
          !meta.reference &&
          log.entity_id &&
          /job/i.test(log.entity)
        ) {
          const j = await tx.job.findFirst({
            where: {
              id: log.entity_id,
              tenant_id: job.tenantId,
              deleted_at: null,
            },
            select: { job_number: true },
          });
          jobRef = j?.job_number ?? null;
        }

        return { log, tenant, actor, admins, jobRef };
      });
    if (!log || !tenant) return;

    const recipients = [
      ...new Set(
        [tenant.email, ...admins.map((a) => a.email)]
          .filter((e): e is string => Boolean(e))
          .map((e) => e.toLowerCase()),
      ),
    ];
    if (!recipients.length) return;

    // Skip when a Tenant Admin notification email already covered this entity+minute.
    if (
      claimAdminEmailDedupe(
        adminEmailDedupeKey(job.tenantId, log.entity_id, log.action),
      )
    ) {
      return;
    }

    const meta = (log.metadata ?? {}) as Record<string, string | null>;
    const status =
      (log.new_values as { status?: string } | null)?.status ?? null;
    const company = tenant.display_name ?? tenant.name;
    const actorName = actor
      ? `${actor.first_name} ${actor.last_name}`.trim()
      : "A staff member";
    const role = actor ? roleLabel(actor.role) : "";
    const performedBy = role ? `${actorName} (${role})` : actorName;
    const when = new Date(meta.occurred_at ?? log.created_at);
    const base = (process.env.FRONTEND_URL ?? "").trim().replace(/\/$/, "");
    const link = base && meta.link_path ? `${base}${meta.link_path}` : null;
    const app = process.env.APP_NAME?.replace(/"/g, "") || "Kingfisher";
    const reference = meta.reference ?? jobRef;
    const detail = meta.detail;

    // Formal human headline: "Sarah Alami created Quotation Q-…"
    const actionPhrase = log.action.replace(/\bof\b/gi, "").trim();
    const targetLabel = reference
      ? `${log.entity} ${reference}`
      : log.entity;
    const formalHeadline = `${actorName} ${actionPhrase.toLowerCase()} ${targetLabel}`
      .replace(/\s+/g, " ")
      .trim();
    const summaryLine = role
      ? `${formalHeadline} (${role})`
      : formalHeadline;

    const detailRows: Array<{ label: string; value: string }> = [
      { label: "Company", value: company },
      { label: "Performed by", value: performedBy },
      { label: "Action", value: log.action },
      ...(reference
        ? [{ label: log.entity, value: reference }]
        : [{ label: "Record", value: log.entity }]),
      ...(status ? [{ label: "Status", value: status }] : []),
      ...(detail ? [{ label: "Details", value: detail }] : []),
      ...(meta.amount ? [{ label: "Amount", value: meta.amount }] : []),
      { label: "Date", value: when.toUTCString() },
      ...(meta.link_path
        ? [{ label: "Record path", value: meta.link_path }]
        : []),
    ];

    const branded = renderBrandedEmail({
      subject: `[${app}] ${formalHeadline}`,
      headline: formalHeadline,
      recipientName: "Tenant Administrator",
      organizationName: company,
      audience: "STAFF",
      intro: [
        summaryLine,
        `Activity in ${company}.`,
        ...(detail ? [`Details: ${detail}.`] : []),
      ],
      details: detailRows,
      ...(link
        ? { cta: { label: `Open in ${app}`, url: link } }
        : {}),
      closing: [
        `You receive this because you are a Tenant Administrator of ${company}.`,
        "Staff create, update, status change, document upload, and related actions on jobs, quotations, shipments, invoices, and enquiries are emailed to Tenant Admins only.",
      ],
    });

    // Keep legacy plain table strings in the HTML so existing e2e assertions
    // (name, role, reference, record path) still match inside the branded shell.
    const legacyRows: Array<[string, string | null]> = [
      ["Company", company],
      ["Performed by", performedBy],
      ["Action", log.action],
      [log.entity, reference],
      ["Status", status],
      ["Details", detail ?? null],
      ["Amount", meta.amount ?? null],
      ["Date", `${when.toUTCString()}`],
    ];
    const legacyTable =
      `<table cellpadding="6" style="border-collapse:collapse;margin-top:12px">` +
      legacyRows
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<tr><td style="color:#6b7280">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`,
        )
        .join("") +
      `</table>` +
      (meta.link_path
        ? `<p style="font-size:12px;color:#6b7280">${esc(meta.link_path)}</p>`
        : "") +
      (link
        ? `<p><a href="${esc(link)}">Open in ${esc(app)}</a></p>`
        : "");

    const body = `${branded.html}${legacyTable}`;

    for (const to of recipients) {
      try {
        await this.email.send({
          tenantId: job.tenantId,
          eventType: "STAFF_ACTIVITY",
          to,
          subject: branded.subject,
          body,
          createdBy: log.user_id ?? undefined,
          requireDelivery: false,
        });
      } catch (err) {
        this.logger.warn(
          `Staff activity email to ${to} failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }
}
