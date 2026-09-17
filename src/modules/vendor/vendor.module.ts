import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../../prisma/prisma.module";
import { MastersModule } from "../masters/masters.module";
import { EmailModule } from "../../shared/email/email.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { PdfModule } from "../../shared/pdf/pdf.module";
import { InvoicesModule } from "../invoices/invoices.module";
import { GlModule } from "../gl/gl.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { VendorAuthController } from "./vendor-auth.controller";
import {
  PartyVendorUsersController,
  VendorUsersAdminController,
} from "./party-vendor-users.controller";
import { PartyVendorPermissionsController } from "./party-vendor-permissions.controller";
import {
  VendorInvoicesController,
  VendorPaymentsController,
} from "./vendor-finance.controller";
import {
  VendorAdminDisputesController,
  VendorDisputesController,
} from "./vendor-ccp.controller";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { VendorService } from "./vendor.service";
import { VendorPermissionsService } from "./vendor-permissions.service";
import { VendorFinanceService } from "./vendor-finance.service";
import { VendorCcpService } from "./vendor-ccp.service";
import { VendorQuotesService } from "./vendor-quotes.service";
import { VendorQuotesController } from "./vendor-quotes.controller";
import { VendorLookupsController } from "./vendor-lookups.controller";
import { JobOffersController } from "./job-offers.controller";
import { VendorDashboardService } from "./vendor-dashboard.service";
import { VendorDashboardController } from "./vendor-dashboard.controller";
import { VendorDocumentShareService } from "./vendor-document-share.service";
import { VendorConverterController } from "./vendor-converter.controller";
import { ToolsModule } from "../tools/tools.module";

@Module({
  imports: [
    ToolsModule,
    PrismaModule,
    MastersModule,
    EmailModule,
    StorageModule,
    PdfModule,
    InvoicesModule,
    GlModule,
    NotificationsModule,
    JwtModule.register({}),
  ],
  controllers: [
    VendorAuthController,
    PartyVendorUsersController,
    VendorUsersAdminController,
    PartyVendorPermissionsController,
    VendorInvoicesController,
    VendorPaymentsController,
    VendorDisputesController,
    VendorAdminDisputesController,
    VendorQuotesController,
    VendorLookupsController,
    JobOffersController,
    VendorDashboardController,
    VendorConverterController,
  ],
  providers: [
    VendorService,
    VendorPermissionsService,
    VendorFinanceService,
    VendorCcpService,
    VendorQuotesService,
    VendorDashboardService,
    VendorDocumentShareService,
    VendorAuthGuard,
  ],
  exports: [
    VendorService,
    VendorPermissionsService,
    VendorFinanceService,
    VendorCcpService,
    VendorQuotesService,
    VendorDashboardService,
    VendorAuthGuard,
  ],
})
export class VendorModule {}
