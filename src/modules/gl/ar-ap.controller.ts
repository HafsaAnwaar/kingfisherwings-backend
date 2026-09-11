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
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { DocumentShareEmailDto } from "../../shared/email/dto/document-share-email.dto";
import { GL_PERMISSIONS } from "./constants/gl-permission.constants";
import { ArApService } from "./ar-ap.service";
import { AgingQueryDto } from "./dto/ar-ap.dto";
import { GlDocumentShareService } from "./gl-document-share.service";

@ApiTags("GL — AR / AP Aging")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("gl")
export class ArApController {
  constructor(
    private readonly service: ArApService,
    private readonly share: GlDocumentShareService,
  ) {}

  @Get("ar/aging")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({ summary: "Accounts Receivable aging buckets (Ch.19.1)" })
  arAging(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.service.arAging(tenantId, query);
  }

  @Get("ap/aging")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({ summary: "Accounts Payable aging buckets (Ch.19.2)" })
  apAging(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.service.apAging(tenantId, query);
  }

  @Get("ar/statement/:partyId")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({ summary: "Customer AR statement (invoices + receipts)" })
  arStatement(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.service.partyStatement(tenantId, partyId, query, "AR");
  }

  @Post("ar/statement/:partyId/send-email")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({
    summary: "Email customer AR statement PDF to party / portal contacts",
  })
  sendArStatement(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Query() query: AgingQueryDto,
    @Body() dto: DocumentShareEmailDto,
  ) {
    return this.share.sendArStatement(tenantId, partyId, dto, query, actorId);
  }

  @Get("ap/statement/:partyId")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({
    summary: "Vendor AP statement (purchase invoices + payments)",
  })
  apStatement(
    @CurrentUser("tenantId") tenantId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.service.partyStatement(tenantId, partyId, query, "AP");
  }

  @Post("ap/statement/:partyId/send-email")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({
    summary: "Email vendor AP statement PDF to party / vendor contacts",
  })
  sendApStatement(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Query() query: AgingQueryDto,
    @Body() dto: DocumentShareEmailDto,
  ) {
    return this.share.sendApStatement(tenantId, partyId, dto, query, actorId);
  }

  @Get("ar/open-items")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({
    summary:
      "Customer invoices with outstanding balance (amount paid vs pending)",
  })
  arOpenItems(
    @CurrentUser("tenantId") tenantId: string,
    @Query("party_id") partyId?: string,
    @Query("company_id") companyId?: string,
  ) {
    return this.service.arOpenItems(tenantId, {
      party_id: partyId,
      company_id: companyId,
    });
  }

  @Get("ap/open-items")
  @RequirePermissions(GL_PERMISSIONS.VIEW_AGING)
  @ApiOperation({
    summary:
      "Vendor purchase invoices with outstanding balance (tenant owes vs paid)",
  })
  apOpenItems(
    @CurrentUser("tenantId") tenantId: string,
    @Query("party_id") partyId?: string,
    @Query("company_id") companyId?: string,
  ) {
    return this.service.apOpenItems(tenantId, {
      party_id: partyId,
      company_id: companyId,
    });
  }
}
