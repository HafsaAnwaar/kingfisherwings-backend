import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { NVOCC_PERMISSIONS } from "./constants/nvocc-permission.constants";
import { NvoccDocumentsService } from "./nvocc-documents.service";
import {
  GenerateJobDocumentDto,
  RecordNvoccMblReceivedDto,
  SendPreAlertDto,
} from "./dto/nvocc-document.dto";

@ApiTags("NVOCC — Jobs")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("nvocc/jobs")
export class NvoccJobsController {
  constructor(private readonly documentsService: NvoccDocumentsService) {}

  @Get(":id/documents/generation-status")
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List document generation tasks for an NVOCC job" })
  generationStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.documentsService.getGenerationStatus(tenantId, id);
  }

  @Post(":id/documents/hbl-draft")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue NVOCC carrier HBL draft PDF" })
  hblDraft(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateHblDraft(tenantId, id, dto, actorId);
  }

  @Post(":id/documents/hbl-original")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary: "Queue NVOCC carrier HBL original PDF and mark HBL_ISSUED",
  })
  hblOriginal(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateHblOriginal(
      tenantId,
      id,
      dto,
      actorId,
    );
  }

  @Post(":id/documents/hbl-express-release")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue NVOCC HBL express release PDF" })
  hblExpressRelease(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "HBL_EXPRESS_RELEASE",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/surrender-notice")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary: "Queue surrender notice PDF and mark HBL surrendered",
  })
  surrenderNotice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateSurrenderNotice(
      tenantId,
      id,
      dto,
      actorId,
    );
  }

  @Post(":id/documents/mbl")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue MBL PDF for NVOCC job" })
  mbl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "MBL",
      dto,
      actorId,
    );
  }

  @Patch(":id/mbl-received")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary: "Record MBL received and mark MBL_RECEIVED milestone",
  })
  mblReceived(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RecordNvoccMblReceivedDto,
  ) {
    return this.documentsService.recordMblReceived(tenantId, id, dto, actorId);
  }

  @Post(":id/documents/pre-can")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue Pre-CAN PDF" })
  preCan(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "PRE_CAN",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/can")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue CAN PDF and mark CAN_SENT" })
  can(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateImportDocument(
      tenantId,
      id,
      "CAN",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/delivery-order")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue Delivery Order PDF and mark DO_ISSUED" })
  deliveryOrder(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateImportDocument(
      tenantId,
      id,
      "DELIVERY_ORDER",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/pre-alert")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue pre-alert PDF" })
  preAlertPdf(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "PRE_ALERT",
      dto,
      actorId,
    );
  }

  @Post(":id/pre-alert/send")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Send pre-alert email and mark PRE_ALERT_SENT" })
  sendPreAlert(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendPreAlertDto,
  ) {
    return this.documentsService.sendPreAlert(tenantId, id, dto, actorId);
  }

  @Post(":id/documents/booking-confirmation")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue booking confirmation PDF" })
  bookingConfirmation(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "BOOKING_CONFIRMATION",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/stuffing-report")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue stuffing report PDF" })
  stuffingReport(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "STUFFING_REPORT",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/cargo-manifest")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue cargo manifest PDF" })
  cargoManifest(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "CARGO_MANIFEST",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/job-card")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue job card PDF" })
  jobCard(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "JOB_CARD",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/job-pnl")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue job P&L PDF" })
  jobPnl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "JOB_PNL",
      dto,
      actorId,
    );
  }

  @Post(":id/documents/proforma-invoice")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Queue proforma invoice PDF" })
  proformaInvoice(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.documentsService.generateDocument(
      tenantId,
      id,
      "PROFORMA_INVOICE",
      dto,
      actorId,
    );
  }

  @Post(":id/si/submit")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Mark SI submitted milestone" })
  submitSi(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.documentsService.submitSi(tenantId, id, actorId);
  }

  @Post(":id/vgm/submit")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Mark VGM submitted milestone" })
  submitVgm(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.documentsService.submitVgm(tenantId, id, actorId);
  }

  @Post(":id/pod/received")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Mark POD received milestone" })
  podReceived(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.documentsService.recordPodReceived(tenantId, id, actorId);
  }
}
