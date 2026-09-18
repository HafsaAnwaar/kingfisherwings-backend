import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../../prisma/prisma.module";
import { EmailModule } from "../../shared/email/email.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { PdfModule } from "../../shared/pdf/pdf.module";
import { QuotationsModule } from "../quotations/quotations.module";
import { MastersModule } from "../masters/masters.module";
import { InvoicesModule } from "../invoices/invoices.module";
import { GlModule } from "../gl/gl.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { PortalLookupsController } from "./portal-lookups.controller";
import { PortalAuthController } from "./portal-auth.controller";
import {
  PartyPortalUsersController,
  PortalUsersAdminController,
} from "./party-portal-users.controller";
import { PartyPortalPermissionsController } from "./party-portal-permissions.controller";
import { PortalDocumentsController } from "./portal-documents.controller";
import { PortalQuotationsController } from "./portal-quotations.controller";
import { PortalShipmentsController } from "./portal-shipments.controller";
import {
  PortalCreditController,
  PortalCreditNotesController,
  PortalDebitNotesController,
  PortalInvoicesController,
  PortalPaymentsController,
} from "./portal-finance.controller";
import {
  PortalAdminInboxController,
  PortalCreditLimitRequestsController,
  PortalDisputesController,
  PortalMessagesController,
} from "./portal-ccp.controller";
import { PortalNotificationsController } from "./portal-notifications.controller";
import { PortalPreferencesController } from "./portal-preferences.controller";
import { PortalDashboardController } from "./portal-dashboard.controller";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { PortalService } from "./portal.service";
import { PortalDocumentsService } from "./portal-documents.service";
import { PortalPermissionsService } from "./portal-permissions.service";
import { PortalPreferencesService } from "./portal-preferences.service";
import { PortalQuotePricingService } from "./portal-quote-pricing.service";
import { PortalQuotationsService } from "./portal-quotations.service";
import { PortalShipmentsService } from "./portal-shipments.service";
import { PortalFinanceService } from "./portal-finance.service";
import { PortalCcpService } from "./portal-ccp.service";
import { PortalTasksService } from "./portal-tasks.service";
import { PortalTasksController } from "./portal-tasks.controller";
import { PortalNvoccWorkflowService } from "./portal-nvocc-workflow.service";
import { PortalAirWorkflowService } from "./portal-air-workflow.service";
import { PortalConverterController } from "./portal-converter.controller";
import { PortalComplianceBookingController } from "./portal-compliance-booking.controller";
import { PortalComplianceBookingService } from "./portal-compliance-booking.service";
import { ToolsModule } from "../tools/tools.module";
import { NvoccModule } from "../nvocc/nvocc.module";

@Module({
  imports: [
    ToolsModule,
    PrismaModule,
    EmailModule,
    StorageModule,
    PdfModule,
    QuotationsModule,
    MastersModule,
    InvoicesModule,
    GlModule,
    NotificationsModule,
    NvoccModule,
    JwtModule.register({}),
  ],
  controllers: [
    PortalLookupsController,
    PortalAuthController,
    PartyPortalUsersController,
    PortalUsersAdminController,
    PartyPortalPermissionsController,
    PortalShipmentsController,
    PortalDocumentsController,
    PortalQuotationsController,
    PortalInvoicesController,
    PortalCreditNotesController,
    PortalDebitNotesController,
    PortalPaymentsController,
    PortalCreditController,
    PortalMessagesController,
    PortalDisputesController,
    PortalCreditLimitRequestsController,
    PortalAdminInboxController,
    PortalNotificationsController,
    PortalPreferencesController,
    PortalDashboardController,
    PortalTasksController,
    PortalConverterController,
    PortalComplianceBookingController,
  ],
  providers: [
    PortalService,
    PortalShipmentsService,
    PortalQuotationsService,
    PortalQuotePricingService,
    PortalPermissionsService,
    PortalDocumentsService,
    PortalFinanceService,
    PortalCcpService,
    PortalPreferencesService,
    PortalTasksService,
    PortalNvoccWorkflowService,
    PortalAirWorkflowService,
    PortalComplianceBookingService,
    PortalAuthGuard,
  ],
  exports: [
    PortalService,
    PortalShipmentsService,
    PortalQuotationsService,
    PortalQuotePricingService,
    PortalPermissionsService,
    PortalDocumentsService,
    PortalFinanceService,
    PortalCcpService,
    PortalPreferencesService,
    PortalTasksService,
    PortalAuthGuard,
  ],
})
export class PortalModule {}
