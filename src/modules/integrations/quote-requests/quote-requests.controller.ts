import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { CurrentUser as CurrentUserType } from "../../users/interfaces/current-user.interface";
import { QUOTE_REQUESTS_PERMISSIONS } from "./constants/quote-requests-permission.constants";
import {
  PatchQuoteRequestStatusDto,
  QuoteRequestListQueryDto,
  UpsertQuoteRequestConnectionDto,
} from "./dto/quote-requests.dto";
import { QuoteRequestsService } from "./quote-requests.service";

@ApiTags("Admin — Quote Requests Integration")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("admin/integrations/quote-requests")
export class QuoteRequestsController {
  constructor(private readonly service: QuoteRequestsService) {}

  @Get("connection")
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get quote-requests connection (key redacted)" })
  getConnection(@CurrentUser("tenantId") tenantId: string) {
    return this.service.getConnection(tenantId);
  }

  @Put("connection")
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.MANAGE_CONNECTION)
  @ApiOperation({ summary: "Create/update quote-requests connection" })
  upsertConnection(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: UpsertQuoteRequestConnectionDto,
  ) {
    return this.service.upsertConnection(tenantId, actorId, dto);
  }

  @Post("connection/test")
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.MANAGE_CONNECTION)
  @ApiOperation({ summary: "Health-check the configured remote API" })
  test(@CurrentUser("tenantId") tenantId: string) {
    return this.service.testConnection(tenantId);
  }

  @Post("sync")
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.SYNC)
  @ApiOperation({ summary: "Manual pull/sync from remote Quote Requests API" })
  sync(@CurrentUser("tenantId") tenantId: string) {
    return this.service.sync(tenantId, "manual");
  }

  @Get("sync-runs")
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List sync run history" })
  syncRuns(
    @CurrentUser("tenantId") tenantId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.service.listSyncRuns(
      tenantId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get()
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List mirrored website quote requests" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: QuoteRequestListQueryDto,
  ) {
    return this.service.list(tenantId, query);
  }

  @Get(":id")
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get mirrored quote request detail" })
  getOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getOne(tenantId, id);
  }

  @Patch(":id/status")
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.UPDATE_STATUS)
  @ApiOperation({ summary: "Update status locally and push to remote API" })
  patchStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PatchQuoteRequestStatusDto,
  ) {
    return this.service.patchStatus(tenantId, id, dto);
  }

  @Post(":id/link-crm")
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.SYNC)
  @ApiOperation({ summary: "Force-create Lead + Enquiry if missing" })
  linkCrm(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.linkCrm(tenantId, id, actorId);
  }

  @Post(":id/convert-to-quote")
  @RequirePermissions(QUOTE_REQUESTS_PERMISSIONS.SYNC)
  @ApiOperation({
    summary: "Convert linked CRM enquiry to freight quotation",
  })
  convertToQuote(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.convertToQuote(user, id);
  }
}
