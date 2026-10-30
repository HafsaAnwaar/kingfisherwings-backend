import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import "multer";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { DashboardPeriodQueryDto } from "../../common/dto/dashboard-period-query.dto";
import { DeliveryAcknowledgementService } from "../jobs/delivery-acknowledgement.service";
import { SubmitDeliveryAcknowledgementDto } from "../jobs/dto/delivery-acknowledgement.dto";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalShipmentLookupDto } from "./dto/portal-shipment-lookup.dto";
import { PortalShipmentQueryDto } from "./dto/portal-shipment-query.dto";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalDocumentsService } from "./portal-documents.service";
import { PortalShipmentsService } from "./portal-shipments.service";
import { PortalNvoccWorkflowService } from "./portal-nvocc-workflow.service";
import { PortalAirWorkflowService } from "./portal-air-workflow.service";
import { TrackService } from "../track/track.service";
/**
 * Customer Portal — Shipments submodule.
 * All routes require portal JWT. Data is scoped to the caller's Party
 * (shipper OR consignee OR billing party). Financial fields (charges, GP, costs) are never returned.
 */
@ApiTags("Portal Shipments")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/shipments")
export class PortalShipmentsController {
  constructor(
    private readonly shipments: PortalShipmentsService,
    private readonly portalDocuments: PortalDocumentsService,
    private readonly nvoccWorkflow: PortalNvoccWorkflowService,
    private readonly airWorkflow: PortalAirWorkflowService,
    private readonly acknowledgement: DeliveryAcknowledgementService,
    private readonly track: TrackService,
  ) {}

  @Get("summary")
  @ApiOperation({
    summary: "Shipment dashboard counters for the logged-in customer",
    description:
      "Totals by status for dashboard widgets (open / in-transit / completed). Supports period=7d|30d|mtd|custom.",
  })
  summary(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: DashboardPeriodQueryDto,
  ) {
    return this.shipments.summary(user, query.resolve("30d"));
  }

  @Get("lookup")
  @ApiOperation({
    summary: "Find a shipment by reference number",
    description:
      "Matches shipment/job number, HAWB, MAWB, HBL, MBL, booking, courier tracking, vehicle, or container number for this customer only.",
  })
  lookup(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalShipmentLookupDto,
  ) {
    return this.shipments.lookupByRef(user, query.ref);
  }

  @Get("export.csv")
  @ApiOperation({
    summary: "Export my shipments as CSV",
    description: "Same filters as the list endpoint. Capped at 5000 rows.",
  })
  exportCsv(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalShipmentQueryDto,
    @Res() res: Response,
  ) {
    return this.shipments.exportCsv(user, query, res);
  }

  @Get()
  @ApiOperation({
    summary: "List my shipments",
    description:
      "Returns Shipment entities (with linked Job when generated). Legacy jobs without a Shipment row are included for dual-read. Supports status, job_type, search, and date filters.",
  })
  list(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalShipmentQueryDto,
  ) {
    return this.shipments.list(user, query);
  }

  @Get(":id/documents")
  @ApiOperation({
    summary: "List documents for a shipment",
    description:
      "Filtered by forwarder-configured portal_permissions for this customer. Path id may be Shipment or Job.",
  })
  async documents(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const jobId = await this.shipments.resolveTrackingJobId(user, id);
    if (!jobId) {
      return { success: true, data: [] };
    }
    return this.portalDocuments.listForShipment(user, jobId);
  }

  @Get(":id/container-requests")
  @ApiOperation({
    summary: "List portal-visible CRO / container requests",
  })
  async containerRequests(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.nvoccWorkflow.listContainerRequests(user, jobId);
  }

  @Post(":id/containers/:lineId/confirm-pick")
  @ApiOperation({ summary: "Customer confirms yard pickup (Picked)" })
  async confirmPick(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.nvoccWorkflow.confirmPick(user, jobId, lineId);
  }

  @Post(":id/port-token/confirm")
  @ApiOperation({ summary: "Customer confirms port gate token obtained" })
  async confirmPortToken(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.nvoccWorkflow.confirmPortToken(user, jobId);
  }

  @Post(":id/request-draft-bl")
  @ApiOperation({ summary: "Customer requests draft BL from Docs" })
  async requestDraftBl(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.nvoccWorkflow.requestDraftBl(user, jobId);
  }

  @Post(":id/request-draft-hawb")
  @ApiOperation({ summary: "Customer requests draft House Air Waybill" })
  async requestDraftHawb(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.airWorkflow.requestDraftHawb(user, jobId);
  }

  @Post(":id/request-delivery-order")
  @ApiOperation({ summary: "Customer requests Delivery Order (air import)" })
  async requestDeliveryOrder(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.airWorkflow.requestDeliveryOrder(user, jobId);
  }

  @Get(":id/documents/:docId/download")
  @ApiOperation({
    summary: "Download a shipment document",
    description: "Requires can_download permission for the document type.",
  })
  async downloadDocument(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("docId", ParseUUIDPipe) docId: string,
    @Res() res: Response,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.portalDocuments.download(user, jobId, docId, res);
  }

  @Get(":id/acknowledgement")
  @ApiOperation({
    summary: "Load formal delivery acknowledgement template + current status",
  })
  async getAcknowledgement(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.acknowledgement.getForJob(user.tenantId, jobId);
  }

  @Post(":id/acknowledgement")
  @ApiOperation({
    summary: "Submit formal goods receipt acknowledgement",
  })
  async submitAcknowledgement(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitDeliveryAcknowledgementDto,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.acknowledgement.submit(user.tenantId, jobId, dto, {
      userId: user.id,
      partyId: user.partyId,
    });
  }

  @Post(":id/acknowledgement/signature")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  @ApiOperation({ summary: "Upload signature image for acknowledgement" })
  async uploadAcknowledgementSignature(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.acknowledgement.uploadSignature(
      user.tenantId,
      jobId,
      file,
      user.id,
    );
  }

  @Get(":id/acknowledgement/attachments")
  @ApiOperation({ summary: "List delivery acknowledgement attachments" })
  async listAcknowledgementAttachments(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const jobId = await this.requireJobId(user, id);
    const result = await this.acknowledgement.listAttachments(
      user.tenantId,
      jobId,
    );
    return {
      ...result,
      data: (result.data ?? []).map((r: { id: string }) => ({
        ...r,
        download_path: `/portal/shipments/${id}/acknowledgement/attachments/${r.id}/download`,
      })),
    };
  }

  @Post(":id/acknowledgement/attachments")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }),
  )
  @ApiOperation({ summary: "Upload a delivery acknowledgement attachment" })
  async uploadAcknowledgementAttachment(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const jobId = await this.requireJobId(user, id);
    const result = await this.acknowledgement.uploadAttachment(
      user.tenantId,
      jobId,
      file,
      user.id,
    );
    return {
      ...result,
      data: {
        ...result.data,
        download_path: `/portal/shipments/${id}/acknowledgement/attachments/${result.data.id}/download`,
      },
    };
  }

  @Get(":id/acknowledgement/attachments/:attachmentId/download")
  @ApiOperation({ summary: "Download a delivery acknowledgement attachment" })
  async downloadAcknowledgementAttachment(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
    @Res() res: Response,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.acknowledgement.downloadAttachment(
      user.tenantId,
      jobId,
      attachmentId,
      res,
    );
  }

  @Get(":id")
  @ApiOperation({
    summary: "Shipment detail with cargo summary and milestone timeline",
    description:
      "404 if the shipment does not belong to this customer. No charges, costs, or GP.",
  })
  detail(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.shipments.findOne(user, id);
  }

  @Get(":id/tracking")
  @ApiOperation({
    summary:
      "Full track & trace for a portal shipment (current status + complete history)",
  })
  async tracking(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const jobId = await this.requireJobId(user, id);
    return this.track.trackByJobId(user.tenantId, jobId, {
      shipmentId: id,
      includeNotes: false,
    });
  }

  @Get(":id/milestones")
  @ApiOperation({
    summary: "Milestone timeline for a shipment",
    description:
      "Track & Trace style timeline inside the authenticated portal (includes history + summary).",
  })
  milestones(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.shipments.getMilestones(user, id);
  }

  private async requireJobId(user: CurrentPortalUser, id: string) {
    const jobId = await this.shipments.resolveTrackingJobId(user, id);
    if (!jobId) {
      throw new BadRequestException(
        "Shipment has no linked Job yet. Complete booking and Generate Job first.",
      );
    }
    return jobId;
  }
}
