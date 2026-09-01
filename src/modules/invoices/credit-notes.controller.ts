import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { InvoicesService } from "./invoices.service";
import { CreateCreditNoteDto, InvoiceQueryDto } from "./dto/invoice.dto";

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
  @ApiOperation({ summary: "Get a credit note" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
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

  @Post(":id/post")
  @RequirePermissions(INVOICES_PERMISSIONS.POST)
  @ApiOperation({ summary: "Post a draft credit note" })
  post(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.post(tenantId, id, actorId);
  }
}
