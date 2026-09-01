import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { GL_PERMISSIONS } from "./constants/gl-permission.constants";
import { FinancialReportsService } from "./financial-reports.service";
import {
  AsOfReportQueryDto,
  ReportPeriodQueryDto,
  VatReturnQueryDto,
} from "./dto/financial-reports.dto";
import { TrialBalanceQueryDto } from "./dto/gl.dto";

@ApiTags("GL — Financial Reports")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("gl/reports")
export class FinancialReportsController {
  constructor(private readonly service: FinancialReportsService) {}

  @Get("trial-balance")
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({
    summary:
      "Trial balance (Ch.20.1) — also available at GET /gl/accounts/reports/trial-balance",
  })
  trialBalance(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: TrialBalanceQueryDto,
  ) {
    return this.service.trialBalance(tenantId, query);
  }

  @Get("balance-sheet")
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: "Balance Sheet as of a date (Ch.20.1 / Week 12)" })
  balanceSheet(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: AsOfReportQueryDto,
  ) {
    return this.service.balanceSheet(tenantId, query);
  }

  @Get("profit-and-loss")
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({ summary: "Profit & Loss for a period (Ch.20.1 / Week 12)" })
  profitAndLoss(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ReportPeriodQueryDto,
  ) {
    return this.service.profitAndLoss(tenantId, query);
  }

  @Get("cash-flow")
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({
    summary: "Cash Flow from bank/cash voucher activity (Ch.20.1 / Week 12)",
  })
  cashFlow(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ReportPeriodQueryDto,
  ) {
    return this.service.cashFlow(tenantId, query);
  }

  @Get("vat-return")
  @RequirePermissions(GL_PERMISSIONS.VIEW_REPORTS)
  @ApiOperation({
    summary: "UAE VAT return draft from posted invoices (Ch.20.2 / Week 12)",
  })
  vatReturn(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: VatReturnQueryDto,
  ) {
    return this.service.vatReturn(tenantId, query);
  }
}
