import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PublicApiAdminController, PublicApiController } from './public-api.controller';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyScopeGuard } from './api-key-scope.guard';
import { StripeBillingService, TenantApiKeysService, TenantWebhooksService } from './public-api.service';
import { WebhookDispatcherService } from './webhook-dispatcher.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicApiController, PublicApiAdminController],
  providers: [
    TenantApiKeysService,
    TenantWebhooksService,
    StripeBillingService,
    WebhookDispatcherService,
    ApiKeyGuard,
    ApiKeyScopeGuard,
  ],
  exports: [TenantApiKeysService, WebhookDispatcherService],
})
export class PublicApiModule {}
