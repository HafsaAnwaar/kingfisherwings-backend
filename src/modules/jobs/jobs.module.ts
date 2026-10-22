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
import { PdfModule } from "../../shared/pdf/pdf.module";
import { JobsController } from "./jobs.controller";
import { JobLookupsController } from "./job-lookups.controller";
import { JobOpsAttachmentsController } from "./job-ops-attachments.controller";
import { JobLookupsService } from "./job-lookups.service";
import { OpsSectionAttachmentsService } from "./ops-section-attachments.service";
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
import { JobEdiService } from "./job-edi.service";
import { JobTabPanelsService } from "./job-tab-panels.service";
import { JobDocumentUploadService } from "./job-document-upload.service";
import { JobDateService } from "./job-date.service";
import { DocumentationEdiService } from "../documentation/documentation-edi.service";
import { OpsActivityModule } from "../ops-activity/ops-activity.module";
import { SeaFclImportService } from "./sea-fcl-import.service";
import { AirImportService } from "./air-import.service";
import { SeaLclService } from "./sea-lcl.service";
import { SeaLclImportService } from "./sea-lcl-import.service";
import { LandService } from "./land.service";
import { RoadFreightService } from "./road-freight.service";
import { CourierService } from "./courier.service";
import { TransportModule } from "../transport/transport.module";
import { VendorModule } from "../vendor/vendor.module";
import { MastersModule } from "../masters/masters.module";
import { ShipmentsModule } from "../shipments/shipments.module";
import { QuotationsModule } from "../quotations/quotations.module";
import { TrackModule } from "../track/track.module";
import { JobsDashboardService } from "./jobs-dashboard.service";
import { AirBookingFormService } from "./air-booking-form.service";
import { AirComplianceBookingFormService } from "./air-compliance-booking-form.service";
import { AirWorkflowService } from "./air-workflow.service";
import { AirWorkflowActionsService } from "./air-workflow-actions.service";
import { AirWorkflowController } from "./air-workflow.controller";
import { ModeBookingFormService } from "./booking-forms/mode-booking-form.service";
import { ModeBookingFormsController } from "./booking-forms/mode-booking-forms.controller";
import { BookingFormEntityService } from "./booking-forms/booking-form-entity.service";
import { QuotationBookingFormService } from "./booking-forms/quotation-booking-form.service";
import { BlDraftFromBookingService } from "./bl-draft-from-booking.service";
import { CustomsClearanceService } from "./customs-clearance/customs-clearance.service";
import { CustomsClearanceController } from "./customs-clearance/customs-clearance.controller";
import { CustomsClearanceQueueController } from "./customs-clearance/customs-clearance-queue.controller";
import { DeliveryAcknowledgementService } from "./delivery-acknowledgement.service";

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
    PdfModule,
    OpsActivityModule,
    TransportModule,
    forwardRef(() => VendorModule),
    MastersModule,
    forwardRef(() => ShipmentsModule),
    forwardRef(() => QuotationsModule),
    TrackModule,
  ],
  controllers: [
    CustomsClearanceQueueController,
    JobLookupsController,
    JobOpsAttachmentsController,
    JobsController,
    JobsSeaScansController,
    SeaKpiReportController,
    AirWorkflowController,
    ModeBookingFormsController,
    CustomsClearanceController,
  ],
  providers: [
    JobsService,
    JobDetailService,
    JobStatusCatalogService,
    JobGpumService,
    JobLookupsService,
    OpsSectionAttachmentsService,
    JobChargeAttachmentService,
    JobContainerStorageCostingService,
    JobOrganizationService,
    JobDimensionService,
    JobContainerTabService,
    JobCostingService,
    JobProfitShareService,
    JobEdiService,
    /** Avoid DocumentationModule cycle (it imports JobsModule). */
    DocumentationEdiService,
    JobTabPanelsService,
    JobDocumentUploadService,
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
    QuotationBookingFormService,
    BlDraftFromBookingService,
    BookingFormEntityService,
    CourierService,
    CustomsClearanceService,
    DeliveryAcknowledgementService,
  ],
  exports: [
    JobsService,
    JobCostingService,
    JobOrganizationService,
    JobDimensionService,
    JobContainerTabService,
    JobTabPanelsService,
    JobDocumentUploadService,
    JobLookupsService,
    OpsSectionAttachmentsService,
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
    QuotationBookingFormService,
    BlDraftFromBookingService,
    BookingFormEntityService,
    CourierService,
    CustomsClearanceService,
    DeliveryAcknowledgementService,
  ],
})
export class JobsModule {}
