import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
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
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule {}
