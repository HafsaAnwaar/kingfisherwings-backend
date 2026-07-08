import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users';
import { AuthModule } from './modules/auth/auth.module';
import { MastersModule } from './modules/masters/masters.module';
import { PartiesModule } from './modules/parties/parties.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { QuotationsModule } from './modules/quotations/quotations.module';

import { TenantContextStorage } from './common/context/tenant-context.storage';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    TenantsModule,
    UsersModule,
    AuthModule,
    MastersModule,
    PartiesModule,
    OrganizationModule,
    QuotationsModule,
  ],
  providers: [
    TenantContextStorage,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
  exports: [TenantContextStorage],
})
export class AppModule {}
