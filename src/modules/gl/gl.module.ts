import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { EmailModule } from "../../shared/email/email.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { OrganizationModule } from "../organization/organization.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { GlDocumentShareService } from "./gl-document-share.service";
import { ChartOfAccountsController } from "./chart-of-accounts.controller";
import { ChartOfAccountsService } from "./chart-of-accounts.service";
import { VouchersController } from "./vouchers.controller";
import { VouchersService } from "./vouchers.service";
import { VoucherAttachmentService } from "./voucher-attachment.service";
import { GlAutoPostService } from "./gl-auto-post.service";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { ArApController } from "./ar-ap.controller";
import { ArApService } from "./ar-ap.service";
import { OpeningBalanceService } from "./opening-balance.service";
import { ChequesController } from "./cheques.controller";
import { ChequesService } from "./cheques.service";
import { BankReconciliationController } from "./bank-reconciliation.controller";
import { BankReconciliationService } from "./bank-reconciliation.service";
import { FinancialReportsController } from "./financial-reports.controller";
import { FinancialReportsService } from "./financial-reports.service";
import { MisController } from "./mis.controller";
import { MisService } from "./mis.service";
import { SavedReportsController } from "./saved-reports.controller";
import { SavedReportsService } from "./saved-reports.service";

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    NotificationsModule,
    EmailModule,
    StorageModule,
  ],
  controllers: [
    ChartOfAccountsController,
    VouchersController,
    PaymentsController,
    ArApController,
    ChequesController,
    BankReconciliationController,
    FinancialReportsController,
    MisController,
    SavedReportsController,
  ],
  providers: [
    ChartOfAccountsService,
    VouchersService,
    VoucherAttachmentService,
    GlAutoPostService,
    PaymentsService,
    ArApService,
    OpeningBalanceService,
    ChequesService,
    BankReconciliationService,
    FinancialReportsService,
    MisService,
    SavedReportsService,
    GlDocumentShareService,
  ],
  exports: [
    ChartOfAccountsService,
    VouchersService,
    VoucherAttachmentService,
    GlAutoPostService,
    PaymentsService,
    ArApService,
    OpeningBalanceService,
    ChequesService,
    BankReconciliationService,
    FinancialReportsService,
    MisService,
    SavedReportsService,
    GlDocumentShareService,
  ],
})
export class GlModule {}
