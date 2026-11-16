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
  ApiTags,
} from "@nestjs/swagger";
import "multer";

import { InvoicesService } from "./invoices.service";
import {
  CreateCreditNoteDto,
  CreateInvoiceLineDto,
  InvoiceQueryDto,
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

@ApiTags("Credit Notes")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("credit-notes")
export class CreditNotesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List credit notes" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: InvoiceQueryDto,
  ) {
    return this.service.findAll(tenantId, query, "CREDIT_NOTE");
  }

  @Get(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Get a credit note (includes actions.can_edit / can_download)",
  })
  async findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.assertNoteType(tenantId, id, "CREDIT_NOTE");
  }

  @Post()
  @RequirePermissions(INVOICES_PERMISSIONS.CREATE)
  @ApiOperation({
    summary: "Create a credit note against a posted customer invoice",
  })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateCreditNoteDto,
  ) {
    return this.service.createCreditNote(tenantId, dto, actorId);
  }

  @Patch(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a draft credit note header" })
  async update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    await this.service.assertNoteType(tenantId, id, "CREDIT_NOTE");
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Post(":id/lines")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add a line to a draft credit note" })
  async addLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateInvoiceLineDto,
  ) {
    await this.service.assertNoteType(tenantId, id, "CREDIT_NOTE");
    return this.service.addLine(tenantId, id, dto, actorId);
  }

  @Patch(":id/lines/:lineId")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a draft credit note line" })
  async updateLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateInvoiceLineDto,
  ) {
    await this.service.assertNoteType(tenantId, id, "CREDIT_NOTE");
    return this.service.updateLine(tenantId, id, lineId, dto, actorId);
  }

  @Delete(":id/lines/:lineId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a draft credit note line" })
  async removeLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
  ) {
    await this.service.assertNoteType(tenantId, id, "CREDIT_NOTE");
    await this.service.removeLine(tenantId, id, lineId, actorId);
  }

  @Post(":id/post")
  @RequirePermissions(INVOICES_PERMISSIONS.POST)
  @ApiOperation({ summary: "Post a draft credit note" })
  async post(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.assertNoteType(tenantId, id, "CREDIT_NOTE");
    return this.service.post(tenantId, id, actorId);
  }

  @Post(":id/pdf")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiOperation({
    summary:
      "Download/store credit note PDF (DRAFT, POSTED, SENT, PARTIALLY_PAID, PAID)",
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
    await this.service.assertNoteType(tenantId, id, "CREDIT_NOTE");
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
}
