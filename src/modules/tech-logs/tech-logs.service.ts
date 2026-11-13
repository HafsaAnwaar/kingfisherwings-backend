import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import {
  Prisma,
  TechIssueSeverity,
  TechIssueStatus,
  TechLogPrincipal,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  ReportClientErrorDto,
  TechIssuesListQueryDto,
  TechLogsListQueryDto,
  UpdateTechIssueDto,
} from "./dto/tech-logs.dto";
import { TechLogActor } from "./tech-logs-actor.util";

const SKIP_PATH_PREFIXES = [
  "/health",
  "/docs",
  "/docs-json",
  "/favicon",
  "/super-admin/tech-logs",
];

@Injectable()
export class TechLogsService {
  private readonly logger = new Logger(TechLogsService.name);
  private readonly tenantCache = new Map<
    string,
    { name: string; slug: string; at: number }
  >();
  private readonly userNameCache = new Map<
    string,
    { name: string; at: number }
  >();

  constructor(private readonly prisma: PrismaService) {}

  shouldSkipPath(path: string): boolean {
    const p = (path || "").split("?")[0] || "";
    return SKIP_PATH_PREFIXES.some(
      (prefix) => p === prefix || p.startsWith(`${prefix}/`) || p.startsWith(prefix),
    );
  }

  async recordActivity(input: {
    actor: TechLogActor;
    method: string;
    path: string;
    statusCode?: number | null;
    action?: string | null;
    summary?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    durationMs?: number | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<void> {
    try {
      if (this.shouldSkipPath(input.path)) return;
      const method = (input.method || "GET").toUpperCase();
      // Activity feed focuses on mutating / meaningful ops; still keep 4xx/5xx GETs.
      const status = input.statusCode ?? null;
      const isError = status != null && status >= 400;
      if (method === "GET" && !isError && !input.action) return;
      if (method === "OPTIONS" || method === "HEAD") return;

      const enriched = await this.enrichActor(input.actor);
      await this.prisma.techActivityLog.create({
        data: {
          tenant_id: enriched.tenantId,
          tenant_name: enriched.tenantName,
          tenant_slug: enriched.tenantSlug,
          principal: enriched.principal,
          user_id: enriched.userId,
          user_name: enriched.userName,
          user_email: enriched.userEmail,
          method,
          path: truncate(input.path, 500),
          status_code: status,
          action: input.action ? truncate(input.action, 100) : null,
          summary: input.summary ? truncate(input.summary, 500) : null,
          ip_address: input.ip,
          user_agent: input.userAgent ? truncate(input.userAgent, 2000) : null,
          duration_ms: input.durationMs ?? null,
          metadata: (input.metadata ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
        },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to write tech activity: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  async recordIssue(input: {
    actor: TechLogActor;
    severity?: TechIssueSeverity;
    source?: string;
    method?: string | null;
    path?: string | null;
    statusCode?: number | null;
    errorCode?: string | null;
    message: string;
    stack?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<void> {
    try {
      const path = input.path ? truncate(input.path, 500) : null;
      if (path && this.shouldSkipPath(path)) return;

      const enriched = await this.enrichActor(input.actor);
      const message = truncate(input.message || "Unknown error", 8000);
      const severity =
        input.severity ??
        severityFromStatus(input.statusCode) ??
        TechIssueSeverity.ERROR;

      // Dedup open issues with same fingerprint in a short window.
      const fingerprintWhere: Prisma.TechIssueWhereInput = {
        status: { in: [TechIssueStatus.OPEN, TechIssueStatus.IN_PROGRESS] },
        message,
        path: path ?? null,
        status_code: input.statusCode ?? null,
        user_id: enriched.userId,
        tenant_id: enriched.tenantId,
        last_seen_at: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      };

      const existing = await this.prisma.techIssue.findFirst({
        where: fingerprintWhere,
        orderBy: { last_seen_at: "desc" },
      });

      if (existing) {
        await this.prisma.techIssue.update({
          where: { id: existing.id },
          data: {
            occurrence_count: { increment: 1 },
            last_seen_at: new Date(),
            severity,
            stack: input.stack ? truncate(input.stack, 20000) : existing.stack,
            user_name: enriched.userName ?? existing.user_name,
            user_email: enriched.userEmail ?? existing.user_email,
            tenant_name: enriched.tenantName ?? existing.tenant_name,
            tenant_slug: enriched.tenantSlug ?? existing.tenant_slug,
          },
        });
        return;
      }

      await this.prisma.techIssue.create({
        data: {
          tenant_id: enriched.tenantId,
          tenant_name: enriched.tenantName,
          tenant_slug: enriched.tenantSlug,
          principal: enriched.principal,
          user_id: enriched.userId,
          user_name: enriched.userName,
          user_email: enriched.userEmail,
          severity,
          status: TechIssueStatus.OPEN,
          source: input.source ?? "API",
          method: input.method ? input.method.toUpperCase() : null,
          path,
          status_code: input.statusCode ?? null,
          error_code: input.errorCode
            ? truncate(input.errorCode, 80)
            : null,
          message,
          stack: input.stack ? truncate(input.stack, 20000) : null,
          ip_address: input.ip,
          user_agent: input.userAgent
            ? truncate(input.userAgent, 2000)
            : null,
          metadata: (input.metadata ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
        },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to write tech issue: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  async listActivity(query: TechLogsListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where = this.activityWhere(query);
    const [rows, total] = await Promise.all([
      this.prisma.techActivityLog.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.techActivityLog.count({ where }),
    ]);
    return {
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async listIssues(query: TechIssuesListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where = this.issuesWhere(query);
    const [rows, total, openCount] = await Promise.all([
      this.prisma.techIssue.findMany({
        where,
        orderBy: [{ status: "asc" }, { last_seen_at: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.techIssue.count({ where }),
      this.prisma.techIssue.count({
        where: { status: TechIssueStatus.OPEN },
      }),
    ]);
    return {
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
        open_count: openCount,
      },
    };
  }

  async getIssue(id: string) {
    const row = await this.prisma.techIssue.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Tech issue not found.");
    return { success: true, data: row };
  }

  async updateIssue(
    id: string,
    dto: UpdateTechIssueDto,
    superAdminId: string,
  ) {
    const existing = await this.prisma.techIssue.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Tech issue not found.");

    const nextStatus = dto.status ?? existing.status;
    const resolved =
      nextStatus === TechIssueStatus.RESOLVED ||
      nextStatus === TechIssueStatus.IGNORED;

    const row = await this.prisma.techIssue.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.resolution_notes !== undefined
          ? { resolution_notes: dto.resolution_notes }
          : {}),
        ...(resolved
          ? {
              resolved_at: existing.resolved_at ?? new Date(),
              resolved_by_super_admin_id:
                existing.resolved_by_super_admin_id ?? superAdminId,
            }
          : dto.status === TechIssueStatus.OPEN ||
              dto.status === TechIssueStatus.IN_PROGRESS
            ? {
                resolved_at: null,
                resolved_by_super_admin_id: null,
              }
            : {}),
      },
    });
    return { success: true, data: row };
  }

  async reportClientError(
    actor: TechLogActor,
    dto: ReportClientErrorDto,
    ip?: string | null,
    userAgent?: string | null,
  ) {
    await this.recordIssue({
      actor,
      severity: dto.severity ?? TechIssueSeverity.ERROR,
      source: "CLIENT",
      method: null,
      path: dto.path ?? dto.screen ?? null,
      statusCode: null,
      errorCode: "CLIENT_ERROR",
      message: dto.message,
      stack: dto.stack ?? null,
      ip,
      userAgent,
      metadata: {
        ...(dto.metadata ?? {}),
        screen: dto.screen ?? null,
      },
    });
    return { success: true, data: { recorded: true } };
  }

  async summary() {
    const [activity24h, openIssues, criticalOpen, recentErrors] =
      await Promise.all([
        this.prisma.techActivityLog.count({
          where: {
            created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
        this.prisma.techIssue.count({
          where: { status: TechIssueStatus.OPEN },
        }),
        this.prisma.techIssue.count({
          where: {
            status: TechIssueStatus.OPEN,
            severity: TechIssueSeverity.CRITICAL,
          },
        }),
        this.prisma.techIssue.findMany({
          where: { status: TechIssueStatus.OPEN },
          orderBy: { last_seen_at: "desc" },
          take: 5,
          select: {
            id: true,
            user_name: true,
            user_email: true,
            message: true,
            path: true,
            status_code: true,
            last_seen_at: true,
            occurrence_count: true,
          },
        }),
      ]);
    return {
      success: true,
      data: {
        activity_last_24h: activity24h,
        open_issues: openIssues,
        critical_open: criticalOpen,
        recent_open_issues: recentErrors,
      },
    };
  }

  private activityWhere(
    query: TechLogsListQueryDto,
  ): Prisma.TechActivityLogWhereInput {
    const and: Prisma.TechActivityLogWhereInput[] = [];
    if (query.tenant_id) and.push({ tenant_id: query.tenant_id });
    if (query.user_id) and.push({ user_id: query.user_id });
    if (query.principal) and.push({ principal: query.principal });
    if (query.from || query.to) {
      and.push({
        created_at: {
          ...(query.from ? { gte: new Date(query.from) } : {}),
          ...(query.to ? { lte: new Date(query.to) } : {}),
        },
      });
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      and.push({
        OR: [
          { user_name: { contains: q, mode: "insensitive" } },
          { user_email: { contains: q, mode: "insensitive" } },
          { path: { contains: q, mode: "insensitive" } },
          { summary: { contains: q, mode: "insensitive" } },
          { action: { contains: q, mode: "insensitive" } },
          { tenant_name: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    return and.length ? { AND: and } : {};
  }

  private issuesWhere(
    query: TechIssuesListQueryDto,
  ): Prisma.TechIssueWhereInput {
    const and: Prisma.TechIssueWhereInput[] = [];
    if (query.tenant_id) and.push({ tenant_id: query.tenant_id });
    if (query.user_id) and.push({ user_id: query.user_id });
    if (query.principal) and.push({ principal: query.principal });
    if (query.status) and.push({ status: query.status });
    if (query.severity) and.push({ severity: query.severity });
    if (query.status_code != null) and.push({ status_code: query.status_code });
    if (query.from || query.to) {
      and.push({
        last_seen_at: {
          ...(query.from ? { gte: new Date(query.from) } : {}),
          ...(query.to ? { lte: new Date(query.to) } : {}),
        },
      });
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      and.push({
        OR: [
          { user_name: { contains: q, mode: "insensitive" } },
          { user_email: { contains: q, mode: "insensitive" } },
          { path: { contains: q, mode: "insensitive" } },
          { message: { contains: q, mode: "insensitive" } },
          { tenant_name: { contains: q, mode: "insensitive" } },
          { error_code: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    return and.length ? { AND: and } : {};
  }

  private async enrichActor(actor: TechLogActor): Promise<{
    principal: TechLogPrincipal;
    userId: string | null;
    userEmail: string | null;
    userName: string | null;
    tenantId: string | null;
    tenantName: string | null;
    tenantSlug: string | null;
  }> {
    let userName = actor.userName;
    let tenantName: string | null = null;
    let tenantSlug: string | null = null;

    if (
      actor.principal === TechLogPrincipal.USER &&
      actor.userId &&
      actor.tenantId &&
      !userName
    ) {
      userName = await this.lookupStaffName(actor.tenantId, actor.userId);
    }

    if (actor.tenantId) {
      const t = await this.lookupTenant(actor.tenantId);
      tenantName = t?.name ?? null;
      tenantSlug = t?.slug ?? null;
    }

    return {
      principal: actor.principal,
      userId: actor.userId,
      userEmail: actor.userEmail,
      userName: userName || actor.userEmail,
      tenantId: actor.tenantId,
      tenantName,
      tenantSlug,
    };
  }

  private async lookupStaffName(
    tenantId: string,
    userId: string,
  ): Promise<string | null> {
    const cacheKey = `${tenantId}:${userId}`;
    const cached = this.userNameCache.get(cacheKey);
    if (cached && Date.now() - cached.at < 5 * 60 * 1000) return cached.name;
    try {
      const user = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.user.findFirst({
          where: { id: userId, tenant_id: tenantId, deleted_at: null },
          select: { first_name: true, last_name: true, email: true },
        }),
      );
      if (!user) return null;
      const name =
        [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
        user.email;
      this.userNameCache.set(cacheKey, { name, at: Date.now() });
      return name;
    } catch {
      return null;
    }
  }

  private async lookupTenant(
    tenantId: string,
  ): Promise<{ name: string; slug: string } | null> {
    const cached = this.tenantCache.get(tenantId);
    if (cached && Date.now() - cached.at < 5 * 60 * 1000) {
      return { name: cached.name, slug: cached.slug };
    }
    try {
      const tenant = await this.prisma.tenant.findFirst({
        where: { id: tenantId },
        select: { name: true, slug: true },
      });
      if (!tenant) return null;
      this.tenantCache.set(tenantId, {
        name: tenant.name,
        slug: tenant.slug,
        at: Date.now(),
      });
      return { name: tenant.name, slug: tenant.slug };
    } catch {
      return null;
    }
  }
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function severityFromStatus(
  status?: number | null,
): TechIssueSeverity | undefined {
  if (status == null) return undefined;
  if (status >= 500) return TechIssueSeverity.ERROR;
  if (status === 401 || status === 403) return TechIssueSeverity.WARN;
  if (status >= 400) return TechIssueSeverity.WARN;
  return undefined;
}
