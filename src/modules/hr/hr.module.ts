import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "../../prisma/prisma.module";
import { EmailModule } from "../../shared/email/email.module";
import { PdfModule } from "../../shared/pdf/pdf.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { GlModule } from "../gl/gl.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { OrganizationModule } from "../organization/organization.module";
import { HrEmployeesController } from "./hr-employees.controller";
import { HrEvaluationsController } from "./hr-evaluations.controller";
import { HrLeaveController } from "./hr-leave.controller";
import { HrLettersController } from "./hr-letters.controller";
import { HrLoansController } from "./hr-loans.controller";
import { HrPayrollController } from "./hr-payroll.controller";
import { HrTimesheetsController } from "./hr-timesheets.controller";
import { HrCronService } from "./hr-cron.service";
import { HrEmployeesService } from "./hr-employees.service";
import { HrEvaluationsService } from "./hr-evaluations.service";
import { HrLeaveService } from "./hr-leave.service";
import { HrLettersService } from "./hr-letters.service";
import { HrLoansService } from "./hr-loans.service";
import { HrPayrollService } from "./hr-payroll.service";
import { HrTimesheetsService } from "./hr-timesheets.service";

@Module({
  imports: [
    ScheduleModule,
    PrismaModule,
    OrganizationModule,
    GlModule,
    NotificationsModule,
    PdfModule,
    EmailModule,
    StorageModule,
  ],
  controllers: [
    HrEmployeesController,
    HrLeaveController,
    HrPayrollController,
    HrLoansController,
    HrTimesheetsController,
    HrEvaluationsController,
    HrLettersController,
  ],
  providers: [
    HrEmployeesService,
    HrLeaveService,
    HrPayrollService,
    HrLoansService,
    HrTimesheetsService,
    HrEvaluationsService,
    HrLettersService,
    HrCronService,
  ],
  exports: [HrCronService, HrPayrollService],
})
export class HrModule {}
