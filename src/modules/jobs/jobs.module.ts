import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { PartiesModule } from "../parties/parties.module";
import { QueueModule } from "../../shared/queue/queue.module";
import { EmailModule } from "../../shared/email/email.module";
import { WhatsAppModule } from "../../shared/whatsapp/whatsapp.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { InvoicesModule } from "../invoices/invoices.module";
import { GlModule } from "../gl/gl.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { JobsController } from "./jobs.controller";
import {
  JobsSeaScansController,
  SeaKpiReportController,
} from "./jobs-sea-scans.controller";
import { JobsService } from "./jobs.service";
import { JobDetailService } from "./job-detail.service";
import { JobStatusCatalogService } from "./job-status-catalog.service";
import { JobGpumService } from "./job-gpum.service";
import { JobChargeAttachmentService } from "./job-charge-attachment.service";
import { JobContainerStorageCostingService } from "./job-container-storage-costing.service";
import { JobOrganizationService } from "./job-organization.service";
import { JobDimensionService } from "./job-dimension.service";
import { JobContainerTabService } from "./job-container-tab.service";
import { JobCostingService } from "./job-costing.service";
import { JobProfitShareService } from "./job-profit-share.service";
import { JobTabPanelsService } from "./job-tab-panels.service";
import { JobDateService } from "./job-date.service";
import { SeaFclImportService } from "./sea-fcl-import.service";
import { AirImportService } from "./air-import.service";
import { SeaLclService } from "./sea-lcl.service";
import { SeaLclImportService } from "./sea-lcl-import.service";
import { LandService } from "./land.service";
import { RoadFreightService } from "./road-freight.service";
import { CourierService } from "./courier.service";
import { TransportModule } from "../transport/transport.module";
import { VendorModule } from "../vendor/vendor.module";
import { VendorJobsController } from "../vendor/vendor-jobs.controller";
import { MastersModule } from "../masters/masters.module";
import { ShipmentsModule } from "../shipments/shipments.module";
import { QuotationsModule } from "../quotations/quotations.module";
import { JobsDashboardService } from "./jobs-dashboard.service";
import { AirBookingFormService } from "./air-booking-form.service";
import { AirComplianceBookingFormService } from "./air-compliance-booking-form.service";
import { AirWorkflowService } from "./air-workflow.service";
import { AirWorkflowActionsService } from "./air-workflow-actions.service";
import { AirWorkflowController } from "./air-workflow.controller";
import { ModeBookingFormService } from "./booking-forms/mode-booking-form.service";
import { ModeBookingFormsController } from "./booking-forms/mode-booking-forms.controller";
import { BookingFormEntityService } from "./booking-forms/booking-form-entity.service";
import { CustomsClearanceService } from "./customs-clearance/customs-clearance.service";
import { CustomsClearanceController } from "./customs-clearance/customs-clearance.controller";
import { CustomsClearanceQueueController } from "./customs-clearance/customs-clearance-queue.controller";

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    PartiesModule,
    QueueModule,
    EmailModule,
    WhatsAppModule,
    NotificationsModule,
    InvoicesModule,
    GlModule,
    StorageModule,
    TransportModule,
    VendorModule,
    MastersModule,
    forwardRef(() => ShipmentsModule),
    forwardRef(() => QuotationsModule),
  ],
  controllers: [
    CustomsClearanceQueueController,
    JobsController,
    JobsSeaScansController,
    SeaKpiReportController,
    AirWorkflowController,
    ModeBookingFormsController,
    CustomsClearanceController,
    VendorJobsController,
  ],
  providers: [
    JobsService,
    JobDetailService,
    JobStatusCatalogService,
    JobGpumService,
    JobChargeAttachmentService,
    JobContainerStorageCostingService,
    JobOrganizationService,
    JobDimensionService,
    JobContainerTabService,
    JobCostingService,
    JobProfitShareService,
    JobTabPanelsService,
    JobDateService,
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
    RoadFreightService,
    ModeBookingFormService,
    BookingFormEntityService,
    CourierService,
    CustomsClearanceService,
  ],
  exports: [
    JobsService,
    JobCostingService,
    JobDateService,
    JobsDashboardService,
    SeaFclImportService,
    AirImportService,
    AirBookingFormService,
    AirComplianceBookingFormService,
    AirWorkflowService,
    SeaLclService,
    SeaLclImportService,
    LandService,
    RoadFreightService,
    ModeBookingFormService,
    BookingFormEntityService,
    CourierService,
    CustomsClearanceService,
  ],
})
export class JobsModule {}
