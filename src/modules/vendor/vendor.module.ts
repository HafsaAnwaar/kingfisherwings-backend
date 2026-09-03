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

@Module({
  imports: [
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
  ],
  providers: [
    VendorService,
    VendorPermissionsService,
    VendorFinanceService,
    VendorCcpService,
    VendorQuotesService,
    VendorAuthGuard,
  ],
  exports: [
    VendorService,
    VendorPermissionsService,
    VendorFinanceService,
    VendorCcpService,
    VendorQuotesService,
    VendorAuthGuard,
  ],
})
export class VendorModule {}
