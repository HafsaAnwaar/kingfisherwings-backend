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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { InvoicesService } from "./invoices.service";
import {
  CreateInvoiceDto,
  CreateInvoiceLineDto,
  InvoiceQueryDto,
  SendInvoiceEmailDto,
  StoreInvoicePdfDto,
  UpdateInvoiceDto,
  UpdateInvoiceLineDto,
} from "./dto/invoice.dto";
import { optionalPdfUploadInterceptor } from "../../common/utils/client-pdf.util";

import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { INVOICES_PERMISSIONS } from "./constants/invoices-permission.constants";
import { InvoiceFormatPayloadService } from "../reports/data-packs/commercial/invoice-format-payload.service";

@ApiTags("Invoices")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("invoices")
export class InvoicesController {
  constructor(
    private readonly service: InvoicesService,
    private readonly invoiceFormatPayload: InvoiceFormatPayloadService,
  ) {}

  @Get()
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List customer invoices (Ch.18)" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: InvoiceQueryDto,
  ) {
    return this.service.findAll(tenantId, query, "CUSTOMER_INVOICE");
  }

  @Get("reports/overdue")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Overdue customer invoices past due_date with outstanding balance",
  })
  getOverdue(@CurrentUser("tenantId") tenantId: string) {
    return this.service.getOverdueReport(tenantId);
  }

  @Get(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get invoice with lines" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(INVOICES_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Create a draft customer invoice" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.service.create(tenantId, dto, actorId, "CUSTOMER_INVOICE");
  }

  @Post("from-job/:jobId")
  @RequirePermissions(INVOICES_PERMISSIONS.CREATE)
  @ApiOperation({
    summary: "Create draft invoice from uninvoiced billable job charges",
  })
  createFromJob(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    return this.service.createFromJob(tenantId, jobId, actorId);
  }

  @Patch(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a draft invoice header" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(INVOICES_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete a draft invoice" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  @Post(":id/lines")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add a line to a draft invoice" })
  addLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateInvoiceLineDto,
  ) {
    return this.service.addLine(tenantId, id, dto, actorId);
  }

  @Patch(":id/lines/:lineId")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update an invoice line" })
  updateLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateInvoiceLineDto,
  ) {
    return this.service.updateLine(tenantId, id, lineId, dto, actorId);
  }

  @Delete(":id/lines/:lineId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove an invoice line" })
  async removeLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
  ) {
    await this.service.removeLine(tenantId, id, lineId, actorId);
  }

  @Post(":id/post")
  @RequirePermissions(INVOICES_PERMISSIONS.POST)
  @ApiOperation({ summary: "Post a draft invoice (DRAFT -> POSTED)" })
  post(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.post(tenantId, id, actorId);
  }

  @Post(":id/send")
  @RequirePermissions(INVOICES_PERMISSIONS.SEND)
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiOperation({
    summary:
      "Email invoice PDF (attach client multipart/pdf_base64 when provided; otherwise stored or generated PDF)",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["to_email"],
      properties: {
        file: { type: "string", format: "binary" },
        pdf_base64: { type: "string" },
        to_email: { type: "string" },
        message: { type: "string" },
        include_payment_link: { type: "boolean" },
      },
    },
  })
  @UseInterceptors(optionalPdfUploadInterceptor())
  send(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendInvoiceEmailDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.send(tenantId, id, dto, actorId, file);
  }

  @Get(":id/format-payload")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Debug: InvoiceFormatPayload for catalog commercial packs",
    description:
      "Does not change default POST /invoices/:id/pdf. Used to inspect FRESA Format-N payload.",
  })
  @ApiQuery({
    name: "format",
    required: false,
    example: "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
  })
  async formatPayload(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Query("format") format?: string,
  ) {
    const template_code =
      format?.trim() || "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA";
    const format_key =
      template_code.includes("FORMAT_2") || template_code.includes("_2_")
        ? "commercial.invoice_tax_india_2"
        : template_code.includes("SUMMARY")
          ? "commercial.invoice_summary_india"
          : "commercial.invoice_tax_india_1";
    const data = await this.invoiceFormatPayload.build(tenantId, id, {
      format_key,
      template_code,
    });
    return { success: true, data };
  }

  @Post(":id/pdf")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiOperation({
    summary:
      "Store client KingFisher PDF (multipart file / pdf_base64) or generate server PDF",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        pdf_base64: { type: "string" },
      },
    },
  })
  @UseInterceptors(optionalPdfUploadInterceptor())
  async generatePdf(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StoreInvoicePdfDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.service.generatePdf(
      tenantId,
      id,
      actorId,
      file,
      dto,
    );
    return {
      file_url: result.fileUrl,
      file_name: result.filename,
      file_size: result.fileSize,
    };
  }

  @Get(":id/pdf")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get invoice PDF metadata" })
  async getPdfInfo(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const invoice = await this.service.findOne(tenantId, id);
    return {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      pdf_url: invoice.pdf_url,
      pdf_generated_at: invoice.pdf_generated_at,
    };
  }

  @Post(":id/cancel")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Cancel an invoice" })
  cancel(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.cancel(tenantId, id, actorId);
  }
}
