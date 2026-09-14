import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { MASTERS_PERMISSIONS } from "../constants/masters-permission.constants";
import { MasterSearchQueryDto } from "../dto/master-search-query.dto";
import { MastersSearchService } from "./masters-search.service";

@ApiTags("Masters — Search")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("masters")
export class MastersSearchController {
  constructor(private readonly search: MastersSearchService) {}

  @Get("address-search")
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Search party addresses" })
  addressSearch(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MasterSearchQueryDto,
  ) {
    return this.search.searchAddresses(tenantId, query);
  }

  @Get("contacts-search")
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Search party contacts" })
  contactsSearch(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MasterSearchQueryDto,
  ) {
    return this.search.searchContacts(tenantId, query);
  }

  @Get("attachments-search")
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Search job document / attachment metadata" })
  attachmentsSearch(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MasterSearchQueryDto,
  ) {
    return this.search.searchAttachments(tenantId, query);
  }
}
