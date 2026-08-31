import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginated } from '../documentation/dto/documentation-pagination.dto';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { USERS_PERMISSIONS } from '../users/constants/permission.constants';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyScopeGuard, RequireApiScope } from './api-key-scope.guard';
import {
  StripeBillingService,
  TenantApiKeysService,
  TenantWebhooksService,
} from './public-api.service';
import { WebhookDispatcherService } from './webhook-dispatcher.service';

@ApiTags('Public API v1')
@UseGuards(ApiKeyGuard, ApiKeyScopeGuard)
@Controller('api/v1')
export class PublicApiController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Public API health check' })
  health() {
    return { ok: true, version: 'v1' };
  }

  @Get('jobs')
  @RequireApiScope('jobs.read')
  @ApiOperation({ summary: 'List jobs (tenant API key)' })
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
          orderBy: { created_at: 'desc' },
        }),
        tx.job.count({ where: { tenant_id: tenantId, deleted_at: null } }),
      ]);
      return paginated(items, page, limit, total);
    });
  }

  @Get('jobs/:id')
  @RequireApiScope('jobs.read')
  @ApiOperation({ summary: 'Get job by id' })
  async jobOne(@Req() req: Request & { tenantId: string }, @Param('id', ParseUUIDPipe) id: string) {
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
    if (!job) throw new NotFoundException('Job not found.');
    return job;
  }

  @Get('track/:token')
  @RequireApiScope('track.read')
  @ApiOperation({ summary: 'Track shipment by public token' })
  async track(@Req() req: Request & { tenantId: string }, @Param('token') token: string) {
    const job = await this.prisma.runWithTenant(req.tenantId, (tx) =>
      tx.job.findFirst({
        where: { tenant_id: req.tenantId, tracking_token: token, deleted_at: null },
        select: {
          job_number: true,
          job_type: true,
          status: true,
          etd: true,
          eta: true,
        },
      }),
    );
    if (!job) throw new NotFoundException('Tracking token not found.');
    return job;
  }
}

@ApiTags('Admin — Public API')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('admin')
export class PublicApiAdminController {
  constructor(
    private readonly apiKeys: TenantApiKeysService,
    private readonly webhooks: TenantWebhooksService,
    private readonly billing: StripeBillingService,
    private readonly dispatcher: WebhookDispatcherService,
  ) {}

  @Get('api-keys')
  @RequirePermissions(USERS_PERMISSIONS.VIEW)
  listKeys(@CurrentUser('tenantId') tenantId: string) {
    return this.apiKeys.list(tenantId);
  }

  @Post('api-keys')
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  createKey(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() body: { name: string; scopes?: string[] },
  ) {
    return this.apiKeys.create(tenantId, body.name, body.scopes ?? ['jobs.read'], actorId);
  }

  @Patch('api-keys/:id/revoke')
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  revokeKey(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.apiKeys.revoke(tenantId, id);
  }

  @Get('webhooks')
  @RequirePermissions(USERS_PERMISSIONS.VIEW)
  listWebhooks(@CurrentUser('tenantId') tenantId: string) {
    return this.webhooks.list(tenantId);
  }

  @Post('webhooks')
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  createWebhook(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() body: { url: string; events?: string[] },
  ) {
    return this.webhooks.create(tenantId, body.url, body.events ?? [], actorId);
  }

  @Post('webhooks/test-dispatch')
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  testDispatch(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { event?: string; payload?: Record<string, unknown> },
  ) {
    return this.dispatcher.dispatch(tenantId, body.event ?? 'test.event', body.payload ?? { ok: true });
  }

  @Get('billing/status')
  @RequirePermissions(USERS_PERMISSIONS.VIEW)
  billingStatus() {
    return this.billing.getStatus();
  }

  @Post('billing/checkout-session')
  @RequirePermissions(USERS_PERMISSIONS.CREATE)
  checkoutSession() {
    return this.billing.createCheckoutSession();
  }
}
