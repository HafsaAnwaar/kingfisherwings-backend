import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { NotificationsService } from "../notifications/notifications.service";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalDocumentsService } from "./portal-documents.service";
import { PortalFinanceService } from "./portal-finance.service";
import { PortalQuotationsService } from "./portal-quotations.service";
import { PortalShipmentsService } from "./portal-shipments.service";

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
  ) {}

  @Get()
  @ApiOperation({
    summary: "Customer portal dashboard widgets",
    description:
      "Aggregates shipment, invoice, quotation, document counters and unread notification count.",
  })
  async dashboard(@CurrentPortal() user: CurrentPortalUser) {
    const [shipments, invoices, quotations, documents, unread] =
      await Promise.all([
        this.shipments.summary(user),
        this.finance.invoiceSummary(user),
        this.quotations.summary(user),
        this.documents.summary(user),
        this.notifications.unreadCountForPortal(user.tenantId, user.id),
      ]);

    return {
      success: true,
      data: {
        shipments: shipments.data,
        invoices: invoices.data,
        quotations: quotations.data,
        documents: documents.data,
        unread_notifications: unread.data.unread_count,
      },
    };
  }
}
