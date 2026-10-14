import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { paginated } from "../documentation/dto/documentation-pagination.dto";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { USERS_PERMISSIONS } from "../users/constants/permission.constants";
import { ApiKeyGuard } from "./api-key.guard";
import { ApiKeyScopeGuard, RequireApiScope } from "./api-key-scope.guard";
import {
  StripeBillingService,
  TenantApiKeysService,
  TenantWebhooksService,
} from "./public-api.service";
import { WebhookDispatcherService } from "./webhook-dispatcher.service";

@ApiTags("Public API v1")
@UseGuards(ApiKeyGuard, ApiKeyScopeGuard)
@Controller("api/v1")
export class PublicApiController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  @ApiOperation({ summary: "Public API health check" })
  health() {
    return { ok: true, version: "v1" };
  }

  @Get("jobs")
  @RequireApiScope("jobs.read")
  @ApiOperation({ summary: "List jobs (tenant API key)" })
  async jobs(@Req() req: Request & { tenantId: string }) {
    const tenantId = req.tenantId;
    const page = 1;
    const limit = 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [items, total] = await Promise.all([
        tx.job.findMany({
          where: { tenant_id: tenantId, deleted_at: null },
          select: {
            id: true,
            job_number: true,
            job_type: true,
            status: true,
            etd: true,
            eta: true,
          },
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        tx.job.count({ where: { tenant_id: tenantId, deleted_at: null } }),
      ]);
      return paginated(items, page, limit, total);
    });
  }

  @Get("jobs/:id")
  @RequireApiScope("jobs.read")
  @ApiOperation({ summary: "Get job by id" })
  async jobOne(
    @Req() req: Request & { tenantId: string },
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const job = await this.prisma.runWithTenant(req.tenantId, (tx) =>
      tx.job.findFirst({
        where: { id, tenant_id: req.tenantId, deleted_at: null },
        select: {
          id: true,
          job_number: true,
          job_type: true,
          status: true,
          etd: true,
          eta: true,
          commodity: true,
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }

  @Get("track/:token")
  @RequireApiScope("track.read")
  @ApiOperation({
    summary: "Track shipment by public token",
    description:
      "Returns job header plus sanitized history (milestones, courier checkpoints, container events).",
  })
  async track(
    @Req() req: Request & { tenantId: string },
    @Param("token") token: string,
  ) {
    const job = await this.prisma.runWithTenant(req.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          tenant_id: req.tenantId,
          tracking_token: token,
          deleted_at: null,
        },
        select: {
          job_number: true,
          job_type: true,
          status: true,
          etd: true,
          eta: true,
          milestones: {
            where: { deleted_at: null },
            orderBy: { created_at: "asc" },
            select: {
              milestone: true,
              planned_date: true,
              actual_date: true,
            },
          },
          courier_checkpoints: {
            where: { deleted_at: null },
            orderBy: { scanned_at: "asc" },
            select: {
              checkpoint: true,
              scanned_at: true,
              location: true,
            },
          },
          containers_job: {
            where: { deleted_at: null },
            orderBy: { created_at: "asc" },
            select: {
              container_number: true,
              status: true,
              gate_in_at: true,
              returned_at: true,
            },
          },
        },
      }),
    );
    if (!job) throw new NotFoundException("Tracking token not found.");

    const history: Array<{
      type: string;
      code: string;
      label: string;
      planned_at: Date | null;
      actual_at: Date | null;
      is_completed: boolean;
      location?: string | null;
      container_number?: string | null;
    }> = [];

    for (const m of job.milestones) {
      history.push({
        type: "MILESTONE",
        code: m.milestone,
        label: m.milestone.replace(/_/g, " "),
        planned_at: m.planned_date,
        actual_at: m.actual_date,
        is_completed: Boolean(m.actual_date),
      });
    }
    for (const cp of job.courier_checkpoints) {
      history.push({
        type: "COURIER_CHECKPOINT",
        code: cp.checkpoint,
        label: cp.checkpoint.replace(/_/g, " "),
        planned_at: null,
        actual_at: cp.scanned_at,
        is_completed: true,
        location: cp.location,
      });
    }
    for (const c of job.containers_job) {
      if (!c.container_number) continue;
      if (c.gate_in_at) {
        history.push({
          type: "CONTAINER",
          code: "GATE_IN",
          label: `Container ${c.container_number} gate in`,
          planned_at: null,
          actual_at: c.gate_in_at,
          is_completed: true,
          container_number: c.container_number,
        });
      }
      if (c.returned_at) {
        history.push({
          type: "CONTAINER",
          code: "RETURNED",
          label: `Container ${c.container_number} returned`,
          planned_at: null,
          actual_at: c.returned_at,
          is_completed: true,
          container_number: c.container_number,
        });
      }
    }

    history.sort((a, b) => {
      const ta =
        (a.actual_at ?? a.planned_at)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const tb =
        (b.actual_at ?? b.planned_at)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return ta - tb;
    });

    return {
      job_number: job.job_number,
      job_type: job.job_type,
      status: job.status,
      etd: job.etd,
      eta: job.eta,
      containers: job.containers_job.map((c) => ({
        container_number: c.container_number,
        status: c.status,
        gate_in_at: c.gate_in_at,
        returned_at: c.returned_at,
      })),
      milestones: job.milestones.map((m) => ({
        milestone: m.milestone,
        planned_date: m.planned_date,
        actual_date: m.actual_date,
        is_completed: Boolean(m.actual_date),
      })),
      history,
    };
  }
}

@ApiTags("Admin — Public API")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("admin")
export class PublicApiAdminController {
  constructor(
    private readonly apiKeys: TenantApiKeysService,
    private readonly webhooks: TenantWebhooksService,
    private readonly billing: StripeBillingService,
    private readonly dispatcher: WebhookDispatcherService,
  ) {}

  @Get("api-keys")
  @RequirePermissions(USERS_PERMISSIONS.VIEW)
  listKeys(@CurrentUser("tenantId") tenantId: string) {
    return this.apiKeys.list(tenantId);
  }

  @Post("api-keys")
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  createKey(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() body: { name: string; scopes?: string[] },
  ) {
    return this.apiKeys.create(
      tenantId,
      body.name,
      body.scopes ?? ["jobs.read"],
      actorId,
    );
  }

  @Patch("api-keys/:id/revoke")
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  revokeKey(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.apiKeys.revoke(tenantId, id);
  }

  @Get("webhooks")
  @RequirePermissions(USERS_PERMISSIONS.VIEW)
  listWebhooks(@CurrentUser("tenantId") tenantId: string) {
    return this.webhooks.list(tenantId);
  }

  @Post("webhooks")
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  createWebhook(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() body: { url: string; events?: string[] },
  ) {
    return this.webhooks.create(tenantId, body.url, body.events ?? [], actorId);
  }

  @Post("webhooks/test-dispatch")
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  testDispatch(
    @CurrentUser("tenantId") tenantId: string,
    @Body() body: { event?: string; payload?: Record<string, unknown> },
  ) {
    return this.dispatcher.dispatch(
      tenantId,
      body.event ?? "test.event",
      body.payload ?? { ok: true },
    );
  }

  @Get("billing/status")
  @RequirePermissions(USERS_PERMISSIONS.VIEW)
  billingStatus() {
    return this.billing.getStatus();
  }

  @Post("billing/checkout-session")
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  checkoutSession(@CurrentUser("tenantId") tenantId: string) {
    return this.billing.createCheckoutSession(tenantId);
  }
}
