import { Global, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { PrismaModule } from "../../prisma/prisma.module";
import { TechLogsController } from "./tech-logs.controller";
import { TechLogsInterceptor } from "./tech-logs.interceptor";
import { TechLogsService } from "./tech-logs.service";

/**
 * Platform Tech Logs for Super Admin:
 * - Activity tab: mutating API actions (+ error GETs) with user name
 * - Issues tab: API / client errors for triage
 *
 * Capture is via APP_INTERCEPTOR only (no custom exception filter — decision §2.7).
 * Tables are platform-wide (no RLS) so Super Admin can read across tenants.
 */
@Global()
@Module({
  imports: [PrismaModule],
  controllers: [TechLogsController],
  providers: [
    TechLogsService,
    { provide: APP_INTERCEPTOR, useClass: TechLogsInterceptor },
  ],
  exports: [TechLogsService],
})
export class TechLogsModule {}
