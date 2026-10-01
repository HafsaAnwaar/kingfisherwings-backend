import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import redisConfig from "../../../config/redis.config";
import { PrismaModule } from "../../../prisma/prisma.module";
import { EmailModule } from "../../../shared/email/email.module";
import {
  buildBullRedisOptions,
  isRedisEnabledEnv,
} from "../../../shared/redis/redis-options.util";
import { STAFF_ACTIVITY_QUEUE } from "./staff-activity.rules";
import { StaffActivityInterceptor } from "./staff-activity.interceptor";
import { StaffActivityProcessor } from "./staff-activity.processor";
import { StaffActivityService } from "./staff-activity.service";

const redisEnabled = isRedisEnabledEnv();

/**
 * Tenant Admin emails for staff activity. Uses the existing Bull/Redis
 * setup (same registration pattern as shared/queue) when Redis is enabled;
 * otherwise emails are sent in-process after the response.
 * Disable with STAFF_ACTIVITY_EMAILS=false.
 */
@Module({
  imports: [
    PrismaModule,
    EmailModule,
    ...(redisEnabled
      ? [
          BullModule.registerQueueAsync({
            name: STAFF_ACTIVITY_QUEUE,
            imports: [ConfigModule.forFeature(redisConfig)],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              redis: buildBullRedisOptions(config),
            }),
          }),
        ]
      : []),
  ],
  providers: [
    StaffActivityService,
    ...(redisEnabled ? [StaffActivityProcessor] : []),
    { provide: APP_INTERCEPTOR, useClass: StaffActivityInterceptor },
  ],
  exports: [StaffActivityService],
})
export class StaffActivityModule {}
