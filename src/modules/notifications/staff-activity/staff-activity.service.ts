import { Injectable, Logger, Optional } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Prisma } from "@prisma/client";
import type { Queue } from "bull";
import { PrismaService } from "../../../prisma/prisma.service";
import { EmailService } from "../../../shared/email/email.service";
import { STAFF_ACTIVITY_QUEUE } from "./staff-activity.rules";

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
 * Each captured activity is written once to the existing `audit_logs`
 * table (the activity log), then delivered by the existing EmailService
 * through a Bull job when Redis is available (in-process otherwise). The
 * originating request never waits on, or fails because of, email.
 * Recipients are resolved inside the activity's own tenant only: the
 * tenant's registered sign-up email plus its active TENANT_ADMIN users —
 * including an admin who performed the action themselves.
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
        // jobId = audit log id → a job can never be enqueued twice.
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
    const { log, tenant, actor, admins } = await this.prisma.runWithTenant(
      job.tenantId,
      async (tx) => {
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
        return { log, tenant, actor, admins };
      },
    );
    if (!log || !tenant) return;

    const recipients = [
      ...new Set(
        [tenant.email, ...admins.map((a) => a.email)]
          .filter((e): e is string => Boolean(e))
          .map((e) => e.toLowerCase()),
      ),
    ];
    if (!recipients.length) return;

    const meta = (log.metadata ?? {}) as Record<string, string | null>;
    const status =
      (log.new_values as { status?: string } | null)?.status ?? null;
    const company = tenant.display_name ?? tenant.name;
    const actorName = actor
      ? `${actor.first_name} ${actor.last_name}`.trim()
      : "A staff member";
    const role = actor ? roleLabel(actor.role) : "";
    const when = new Date(meta.occurred_at ?? log.created_at);
    const base = (process.env.FRONTEND_URL ?? "").trim().replace(/\/$/, "");
    const link = base && meta.link_path ? `${base}${meta.link_path}` : null;
    const app = process.env.APP_NAME?.replace(/"/g, "") || "Kingfisher";

    const rows: Array<[string, string | null]> = [
      ["Company", company],
      ["Performed by", role ? `${actorName} (${role})` : actorName],
      ["Action", log.action],
      [log.entity, meta.reference ?? null],
      ["Status", status],
      ["Amount", meta.amount ?? null],
      ["Date", `${when.toUTCString()}`],
    ];
    const body =
      `<p>A staff member performed an activity in <strong>${esc(company)}</strong>.</p>` +
      `<table cellpadding="6" style="border-collapse:collapse">` +
      rows
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<tr><td style="color:#6b7280">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`,
        )
        .join("") +
      `</table>` +
      (link
        ? `<p><a href="${esc(link)}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#1a56db;color:#fff;text-decoration:none;font-weight:600">Open in ${esc(app)}</a></p>`
        : "") +
      `<p style="color:#6b7280;font-size:12px">You receive this because you are an administrator of ${esc(company)}.</p>`;

    for (const to of recipients) {
      // Per-recipient isolation: a failure is logged (email_logs + logger)
      // and never re-thrown, so a queue retry can't re-send to the others.
      try {
        await this.email.send({
          tenantId: job.tenantId,
          eventType: "STAFF_ACTIVITY",
          to,
          subject: `[${app}] Staff Activity: ${log.action}`,
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
