import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { QueueModule } from "../../shared/queue/queue.module";
import { EmailModule } from "../../shared/email/email.module";
import { WhatsAppModule } from "../../shared/whatsapp/whatsapp.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { InvoicesModule } from "../invoices/invoices.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { JobsController } from "./jobs.controller";
import {
  JobsSeaScansController,
  SeaKpiReportController,
} from "./jobs-sea-scans.controller";
import { JobsService } from "./jobs.service";
import { SeaFclImportService } from "./sea-fcl-import.service";
import { AirImportService } from "./air-import.service";
import { SeaLclService } from "./sea-lcl.service";
import { SeaLclImportService } from "./sea-lcl-import.service";
import { LandService } from "./land.service";
import { CourierService } from "./courier.service";
import { TransportModule } from "../transport/transport.module";
import { VendorModule } from "../vendor/vendor.module";
import { MastersModule } from "../masters/masters.module";
import { JobsDashboardService } from "./jobs-dashboard.service";
import { AirBookingFormService } from "./air-booking-form.service";
import { AirComplianceBookingFormService } from "./air-compliance-booking-form.service";
import { AirWorkflowService } from "./air-workflow.service";
import { AirWorkflowActionsService } from "./air-workflow-actions.service";
import { AirWorkflowController } from "./air-workflow.controller";

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    QueueModule,
    EmailModule,
    WhatsAppModule,
    NotificationsModule,
    InvoicesModule,
    StorageModule,
    TransportModule,
    VendorModule,
    MastersModule,
  ],
  controllers: [
    JobsController,
    JobsSeaScansController,
    SeaKpiReportController,
    AirWorkflowController,
  ],
  providers: [
    JobsService,
    JobsDashboardService,
    SeaFclImportService,
    AirImportService,
    AirBookingFormService,
    AirComplianceBookingFormService,
    AirWorkflowService,
    AirWorkflowActionsService,
    SeaLclService,
    SeaLclImportService,
    LandService,
    CourierService,
  ],
  exports: [
    JobsService,
    JobsDashboardService,
    SeaFclImportService,
    AirImportService,
    AirBookingFormService,
    AirComplianceBookingFormService,
    AirWorkflowService,
    SeaLclService,
    SeaLclImportService,
    LandService,
    CourierService,
  ],
})
export class JobsModule {}
