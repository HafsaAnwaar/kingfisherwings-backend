import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { QueueModule } from "../../shared/queue/queue.module";
import { EmailModule } from "../../shared/email/email.module";
import { NvoccVoyagesController } from "./nvocc-voyages.controller";
import { NvoccEnquiriesController } from "./nvocc-enquiries.controller";
import { NvoccBookingsController } from "./nvocc-bookings.controller";
import { NvoccTariffsController } from "./nvocc-tariffs.controller";
import { NvoccJobsController } from "./nvocc-jobs.controller";
import { NvoccReportsController } from "./nvocc-reports.controller";
import { NvoccWorkflowController } from "./nvocc-workflow.controller";
import { NvoccVoyagesService } from "./nvocc-voyages.service";
import { NvoccEnquiriesService } from "./nvocc-enquiries.service";
import { NvoccBookingsService } from "./nvocc-bookings.service";
import { NvoccTariffsService } from "./nvocc-tariffs.service";
import { NvoccLoadListService } from "./nvocc-load-list.service";
import { NvoccCronService } from "./nvocc-cron.service";
import { NvoccDocumentsService } from "./nvocc-documents.service";
import { NvoccReportingService } from "./nvocc-reporting.service";
import { NvoccWorkflowService } from "./nvocc-workflow.service";
import { NvoccWorkflowActionsService } from "./nvocc-workflow-actions.service";
import { NvoccBookingFormService } from "./nvocc-booking-form.service";
import { NvoccContainerRequestService } from "./nvocc-container-request.service";

@Module({
  imports: [PrismaModule, OrganizationModule, QueueModule, EmailModule],
  controllers: [
    NvoccTariffsController,
    NvoccVoyagesController,
    NvoccEnquiriesController,
    NvoccBookingsController,
    NvoccJobsController,
    NvoccReportsController,
    NvoccWorkflowController,
  ],
  providers: [
    NvoccVoyagesService,
    NvoccTariffsService,
    NvoccLoadListService,
    NvoccBookingsService,
    NvoccEnquiriesService,
    NvoccCronService,
    NvoccDocumentsService,
    NvoccReportingService,
    NvoccWorkflowService,
    NvoccWorkflowActionsService,
    NvoccBookingFormService,
    NvoccContainerRequestService,
  ],
  exports: [
    NvoccVoyagesService,
    NvoccBookingsService,
    NvoccTariffsService,
    NvoccWorkflowService,
  ],
})
export class NvoccModule {}
