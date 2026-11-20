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
  CreateDebitNoteDto,
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

@ApiTags("Debit Notes")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("debit-notes")
export class DebitNotesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List debit notes" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Query() query: InvoiceQueryDto,
  ) {
    return this.service.findAll(tenantId, query, "DEBIT_NOTE", permissions, {
      userId,
      role,
      permissions,
    });
  }

  @Get(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Get a debit note (includes actions.can_edit / can_download)",
  })
  async findOne(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.assertNoteType(tenantId, id, "DEBIT_NOTE", permissions, {
      userId,
      role,
      permissions,
    });
  }

  @Post()
  @RequirePermissions(INVOICES_PERMISSIONS.CREATE)
  @ApiOperation({
    summary:
      "Create a debit note against a posted customer invoice (extra charge)",
  })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() dto: CreateDebitNoteDto,
  ) {
    return this.service.createDebitNote(tenantId, dto, actorId, {
      userId: actorId,
      role,
      permissions,
    });
  }

  @Patch(":id")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a draft debit note header" })
  async update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    const actor = { userId: actorId, role, permissions };
    await this.service.assertNoteType(
      tenantId,
      id,
      "DEBIT_NOTE",
      permissions,
      actor,
    );
    return this.service.update(tenantId, id, dto, actorId, actor);
  }

  @Post(":id/lines")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Add a line to a draft debit note" })
  async addLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateInvoiceLineDto,
  ) {
    const actor = { userId: actorId, role, permissions };
    await this.service.assertNoteType(
      tenantId,
      id,
      "DEBIT_NOTE",
      permissions,
      actor,
    );
    return this.service.addLine(tenantId, id, dto, actorId, actor);
  }

  @Patch(":id/lines/:lineId")
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a draft debit note line" })
  async updateLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateInvoiceLineDto,
  ) {
    const actor = { userId: actorId, role, permissions };
    await this.service.assertNoteType(
      tenantId,
      id,
      "DEBIT_NOTE",
      permissions,
      actor,
    );
    return this.service.updateLine(tenantId, id, lineId, dto, actorId, actor);
  }

  @Delete(":id/lines/:lineId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(INVOICES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a draft debit note line" })
  async removeLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
  ) {
    const actor = { userId: actorId, role, permissions };
    await this.service.assertNoteType(
      tenantId,
      id,
      "DEBIT_NOTE",
      permissions,
      actor,
    );
    await this.service.removeLine(tenantId, id, lineId, actorId, actor);
  }

  @Post(":id/post")
  @RequirePermissions(INVOICES_PERMISSIONS.POST)
  @ApiOperation({ summary: "Post a draft debit note" })
  async post(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const actor = { userId: actorId, role, permissions };
    await this.service.assertNoteType(
      tenantId,
      id,
      "DEBIT_NOTE",
      permissions,
      actor,
    );
    return this.service.post(tenantId, id, actorId, actor);
  }

  @Post(":id/pdf")
  @RequirePermissions(INVOICES_PERMISSIONS.VIEW)
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiOperation({
    summary:
      "Download/store debit note PDF (DRAFT, POSTED, SENT, PARTIALLY_PAID, PAID)",
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
    @CurrentUser("role") role: string,
    @CurrentUser("permissions") permissions: string[],
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: StoreInvoicePdfDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const actor = { userId: actorId, role, permissions };
    await this.service.assertNoteType(
      tenantId,
      id,
      "DEBIT_NOTE",
      permissions,
      actor,
    );
    const result = await this.service.generatePdf(
      tenantId,
      id,
      actorId,
      file,
      dto,
      actor,
    );
    return {
      file_url: result.fileUrl,
      file_name: result.filename,
      file_size: result.fileSize,
    };
  }
}
