import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { ChartOfAccountsController } from "./chart-of-accounts.controller";
import { ChartOfAccountsService } from "./chart-of-accounts.service";
import { VouchersController } from "./vouchers.controller";
import { VouchersService } from "./vouchers.service";
import { GlAutoPostService } from "./gl-auto-post.service";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { ArApController } from "./ar-ap.controller";
import { ArApService } from "./ar-ap.service";
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
  imports: [PrismaModule, OrganizationModule, NotificationsModule],
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
    GlAutoPostService,
    PaymentsService,
    ArApService,
    ChequesService,
    BankReconciliationService,
    FinancialReportsService,
    MisService,
    SavedReportsService,
  ],
  exports: [
    ChartOfAccountsService,
    VouchersService,
    GlAutoPostService,
    PaymentsService,
    ArApService,
    ChequesService,
    BankReconciliationService,
    FinancialReportsService,
    MisService,
    SavedReportsService,
  ],
})
export class GlModule {}
