import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "../../prisma/prisma.module";
import { QuotationsModule } from "../quotations/quotations.module";
import { JobsModule } from "../jobs/jobs.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { HrModule } from "../hr/hr.module";
import { QuoteRequestsModule } from "../integrations/quote-requests/quote-requests.module";
import { SchedulerService } from "./scheduler.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    QuotationsModule,
    JobsModule,
    NotificationsModule,
    HrModule,
    QuoteRequestsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
