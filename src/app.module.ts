import './load-env';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';
import { RedisThrottlerStorage } from './shared/redis/redis-throttler.storage';
import { HealthModule } from './health/health.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersModule } from './modules/users';
import { AuthModule } from './modules/auth/auth.module';
import { MastersModule } from './modules/masters/masters.module';
import { PartiesModule } from './modules/parties/parties.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { AwbStockModule } from './modules/awb-stock/awb-stock.module';
import { SearchModule } from './modules/search/search.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { FilesModule } from './files/files.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { GlModule } from './modules/gl/gl.module';
import { PortalModule } from './modules/portal/portal.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { CrmModule } from './modules/crm/crm.module';
import { TrackModule } from './modules/track/track.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

import redisConfig from './config/redis.config';
import smtpConfig from './config/smtp.config';
import storageConfig from './config/storage.config';

import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { LocaleModule } from './common/locale/locale.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, smtpConfig, storageConfig],
    }),
    RedisModule,
    ThrottlerModule.forRootAsync({
      imports: [RedisModule, ConfigModule],
      inject: [ConfigService, RedisThrottlerStorage],
      useFactory: (config: ConfigService, storage: RedisThrottlerStorage) => ({
        throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
        ...(config.get<boolean>('redis.enabled') !== false ? { storage } : {}),
      }),
    }),
    LocaleModule,
    PrismaModule,
    HealthModule,
    TenantsModule,
    CompaniesModule,
    UsersModule,
    AuthModule,
    MastersModule,
    PartiesModule,
    OrganizationModule,
    QuotationsModule,
    JobsModule,
    AwbStockModule,
    SearchModule,
    SchedulerModule,
    FilesModule,
    InvoicesModule,
    GlModule,
    PortalModule,
    VendorModule,
    CrmModule,
    TrackModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
