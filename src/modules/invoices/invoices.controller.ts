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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { InvoicesService } from "./invoices.service";
import {
  CreateInvoiceDto,
  CreateInvoiceLineDto,
  InvoiceQueryDto,
  SendInvoiceEmailDto,
  UpdateInvoiceDto,
  UpdateInvoiceLineDto,
} from "./dto/invoice.dto";

import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { INVOICES_PERMISSIONS } from "./constants/invoices-permission.constants";

@ApiTags("Invoices")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("invoices")
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

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
  @ApiOperation({ summary: "Email invoice PDF to customer" })
  send(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SendInvoiceEmailDto,
  ) {
    return this.service.send(tenantId, id, dto, actorId);
  }

  @Post(":id/pdf")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Generate invoice PDF" })
  async generatePdf(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const result = await this.service.generatePdf(tenantId, id, actorId);
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
