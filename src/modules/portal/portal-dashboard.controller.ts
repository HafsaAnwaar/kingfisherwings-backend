import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { DashboardPeriodQueryDto } from "../../common/dto/dashboard-period-query.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalDocumentsService } from "./portal-documents.service";
import { PortalFinanceService } from "./portal-finance.service";
import { PortalQuotationsService } from "./portal-quotations.service";
import { PortalShipmentsService } from "./portal-shipments.service";
import { PortalTasksService } from "./portal-tasks.service";

@ApiTags("Portal Dashboard")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/dashboard")
export class PortalDashboardController {
  constructor(
    private readonly shipments: PortalShipmentsService,
    private readonly finance: PortalFinanceService,
    private readonly quotations: PortalQuotationsService,
    private readonly documents: PortalDocumentsService,
    private readonly notifications: NotificationsService,
    private readonly tasks: PortalTasksService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Customer portal dashboard widgets (one payload)",
    description:
      "Aggregates shipment/invoice/quotation/document KPIs, on-time %, customs/docs alerts, payments/credit mini, and task preview. Supports period=7d|30d|mtd|custom.",
  })
  async dashboard(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: DashboardPeriodQueryDto,
  ) {
    const resolved = query.resolve("30d");

    const [
      shipments,
      invoices,
      quotations,
      documents,
      unread,
      payments,
      credit,
      alerts,
      on_time,
      tasks_preview,
    ] = await Promise.all([
      this.shipments.summary(user, resolved),
      this.finance.invoiceSummary(user, resolved),
      this.quotations.summary(user, resolved),
      this.documents.summary(user),
      this.notifications.unreadCountForPortal(user.tenantId, user.id),
      this.finance.paymentsSummary(user),
      this.finance.creditSummary(user),
      this.tasks.alertCounts(user),
      this.tasks.onTimeSummary(user, resolved.from, resolved.to),
      this.tasks.preview(user, 5),
    ]);

    return {
      success: true,
      data: {
        period: resolved.period,
        from: resolved.from.toISOString(),
        to: resolved.to.toISOString(),
        shipments: shipments.data,
        invoices: invoices.data,
        quotations: quotations.data,
        documents: documents.data,
        unread_notifications: unread.data.unread_count,
        on_time,
        alerts,
        payments: payments.data,
        credit: {
          credit_limit: credit.data.credit_limit,
          used: credit.data.used,
          available: credit.data.available,
          credit_status: credit.data.credit_status,
          currency_code: credit.data.currency_code,
        },
        tasks_preview,
      },
    };
  }
}
