import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { QuotationsService } from "./quotations.service";

import { CreateQuotationDto, UpdateQuotationDto } from "./dto/quotation.dto";
import {
  CreateQuotationLineDto,
  UpdateQuotationLineDto,
} from "./dto/quotation-line.dto";
import { QuotationQueryDto } from "./dto/quotation-query.dto";
import { QuotationAnalyticsQueryDto } from "./dto/quotation-analytics-query.dto";
import { CreateOnlineQuoteDto } from "./dto/online-quote.dto";
import { MarkLostDto, ApprovalDecisionDto } from "./dto/quotation-actions.dto";
import {
  GenerateQuotationPdfDto,
  SendQuotationEmailDto,
} from "./dto/quotation-pdf.dto";

import { Public } from "../auth/decorators/public.decorator";
import { CronSecretGuard } from "../../common/guards/cron-secret.guard";

import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { QUOTATIONS_PERMISSIONS } from "./constants/quotations-permission.constants";

@ApiTags("Quotations")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("quotations")
export class QuotationsController {
  constructor(private readonly service: QuotationsService) {}

  @Get()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List quotations" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: QuotationQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get("reports/chargewise")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      '"All Quotations Chargewise" report — same filters as the list, with each charge line included',
  })
  findAllChargewise(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: QuotationQueryDto,
  ) {
    return this.service.findAllChargewise(tenantId, query);
  }

  @Get("reports/analytics")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "Quotation analytics summary — volume, conversion, GP totals (Ch.7.7)",
  })
  getAnalytics(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: QuotationAnalyticsQueryDto,
  ) {
    return this.service.getAnalytics(tenantId, query);
  }

  @Get("reports/analytics/conversion")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Win/loss and quote-to-job conversion rates" })
  getConversionAnalytics(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: QuotationAnalyticsQueryDto,
  ) {
    return this.service.getConversionAnalytics(tenantId, query);
  }

  @Get("reports/analytics/lost-reasons")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Lost quotation breakdown by reason code" })
  getLostReasonAnalytics(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: QuotationAnalyticsQueryDto,
  ) {
    return this.service.getLostReasonAnalytics(tenantId, query);
  }

  @Get("reports/analytics/response-time")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Average hours from creation to submit/send" })
  getResponseTimeAnalytics(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: QuotationAnalyticsQueryDto,
  ) {
    return this.service.getResponseTimeAnalytics(tenantId, query);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("online-quote")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Public online quote widget — no auth required (Ch.7.5)",
    description:
      "Rate-limited. Identify the tenant with tenant_slug. Spam protection via IP throttle.",
  })
  createOnlineQuote(@Body() dto: CreateOnlineQuoteDto) {
    return this.service.createOnlineQuote(dto);
  }

  @Public()
  @UseGuards(CronSecretGuard)
  @Post("expire-due")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Batch-expire quotations past valid_until (cron / internal only)",
    description:
      "Requires header X-Cron-Secret matching env CRON_SECRET. Not callable by normal users.",
  })
  @ApiHeader({ name: "X-Cron-Secret", required: true })
  @ApiSecurity("cron-secret")
  expireDue(@Query("tenant_id") tenantId: string) {
    if (!tenantId) {
      return this.service.expireDueAllTenants();
    }
    return this.service.expireDue(tenantId);
  }

  @Get(":id")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Get a quotation with its lines, status history, and approvals",
  })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Get(":id/revisions")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "List all revisions in this quotation version chain",
  })
  getRevisions(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getRevisions(tenantId, id);
  }

  @Post()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Create a quotation (DRAFT)" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateQuotationDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(":id")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Update a quotation header (DRAFT or REJECTED only)",
  })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(QUOTATIONS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete a quotation (DRAFT only)" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id);
  }

  @Post(":id/lines")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Add a charge line — GP recalculates automatically",
  })
  addLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateQuotationLineDto,
  ) {
    return this.service.addLine(tenantId, id, dto, actorId);
  }

  @Post(":id/apply-tariff")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary:
      "Auto-add a charge line from the best-matching Online Tariff Master rate for this quotation's lane",
  })
  applyTariff(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.applyTariff(tenantId, id, actorId);
  }

  @Patch(":id/lines/:lineId")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a charge line" })
  updateLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateQuotationLineDto,
  ) {
    return this.service.updateLine(tenantId, id, lineId, dto, actorId);
  }

  @Delete(":id/lines/:lineId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a charge line" })
  async removeLine(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
  ) {
    await this.service.removeLine(tenantId, id, lineId);
  }

  @Post(":id/submit")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.SUBMIT)
  @ApiOperation({
    summary: "DRAFT/REJECTED -> SUBMITTED, opens the approval cycle",
  })
  submit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.submit(tenantId, id, actorId);
  }

  @Post(":id/approve")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.APPROVE)
  @ApiOperation({ summary: "SUBMITTED -> APPROVED" })
  approve(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ApprovalDecisionDto,
  ) {
    return this.service.approve(tenantId, id, actorId, dto);
  }

  @Post(":id/reject")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.APPROVE)
  @ApiOperation({
    summary: "SUBMITTED -> REJECTED (editable again, can be resubmitted)",
  })
  reject(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ApprovalDecisionDto,
  ) {
    return this.service.reject(tenantId, id, actorId, dto);
  }

  @Post(":id/send")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.SEND)
  @ApiOperation({ summary: "APPROVED -> SENT" })
  send(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.send(tenantId, id, actorId);
  }

  @Post(":id/mark-won")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CLOSE)
  @ApiOperation({ summary: "SENT -> WON" })
  markWon(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.markWon(tenantId, id, actorId);
  }

  @Post(":id/mark-lost")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CLOSE)
  @ApiOperation({ summary: "SENT -> LOST, with a reason code" })
  markLost(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: MarkLostDto,
  ) {
    return this.service.markLost(tenantId, id, dto, actorId);
  }

  @Post(":id/duplicate")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CREATE)
  @ApiOperation({
    summary:
      "Clone into a new revision (new DRAFT, version+1, linked to the same parent)",
  })
  duplicate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.duplicate(tenantId, id, actorId);
  }

  @Post(":id/convert-to-job")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CLOSE)
  @ApiOperation({
    summary:
      "WON -> CONVERTED. Creates a minimal Job + carries charge lines over. Full job management (milestones, documents) is a separate module.",
  })
  convertToJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.convertToJob(tenantId, id, actorId);
  }

  @Post(":id/archive")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(QUOTATIONS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Archive a closed quotation (soft-delete)" })
  async archive(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.archive(tenantId, id, actorId);
  }

  @Post(":id/expire")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Manually expire a quotation past its valid_until date",
  })
  expire(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.expire(tenantId, id, actorId);
  }

  @Post(":id/pdf")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.SEND)
  @ApiOperation({
    summary: "Queue PDF generation for a quotation (customer or internal mode)",
  })
  generatePdf(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateQuotationPdfDto,
  ) {
    return this.service.generatePdf(tenantId, id, dto, actorId);
  }

  @Get(":id/pdf")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Get quotation PDF URLs and recent generation tasks",
  })
  getPdfInfo(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getPdfInfo(tenantId, id);
  }

  @Get(":id/pdf/status")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List PDF generation task status for a quotation" })
  getPdfStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getPdfStatus(tenantId, id);
  }

  @Post(":id/send-email")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.SEND)
  @ApiOperation({
    summary:
      "Email quotation PDF to customer (generates PDF if not yet available)",
  })
  sendEmail(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendQuotationEmailDto,
  ) {
    return this.service.sendEmail(tenantId, id, dto, actorId);
  }
}
