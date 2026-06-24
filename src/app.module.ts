// src/app.module.ts
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

import appConfig      from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig    from './config/redis.config';
import jwtConfig      from './config/jwt.config';
import securityConfig from './config/security.config';
import storageConfig  from './config/storage.config';
import mailConfig     from './config/mail.config';

import { DatabaseModule }       from './database/database.module';
import { RedisModule }          from './redis/redis.module';
import { TenantMiddleware }     from './common/middleware/tenant.middleware';
import { HttpExceptionFilter }  from './common/filters/http-exception.filter';
import { ResponseInterceptor }  from './common/interceptors/response.interceptor';
import { AuditInterceptor }     from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        jwtConfig,
        securityConfig,
        storageConfig,
        mailConfig,
      ],
      cache: true,
      expandVariables: true,
    }),

    // ── Rate limiting ────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl:   config.get<number>('app.throttle.ttl',   60) * 1000,
            limit: config.get<number>('app.throttle.limit', 100),
          },
        ],
      }),
    }),

    // ── Event emitter (domain events) ────────────────────────────
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // ── Cron scheduler ───────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── BullMQ queues ────────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host:     config.get<string>('redis.host',     'localhost'),
          port:     config.get<number>('redis.port',     6379),
          password: config.get<string>('redis.password') || undefined,
          db:       config.get<number>('redis.db',       0),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail:     50,
          attempts:         3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),

    // ── Infrastructure ───────────────────────────────────────────
    DatabaseModule,
    RedisModule,

    // ── Feature modules (added week by week) ─────────────────────
    // AuthModule,
    // UsersModule,
    // RolesModule,
    // MastersModule,
    // PartiesModule,
    // QuotationsModule,
    // JobsModule,
    // DocumentsModule,
    // InvoicesModule,
    // AccountingModule,
    // ReportsModule,
  ],

  providers: [
    {
      provide:  APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide:  APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide:  APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'health',       method: RequestMethod.GET },
        { path: 'api/v1/auth/login',   method: RequestMethod.POST },
        { path: 'api/v1/auth/refresh', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}