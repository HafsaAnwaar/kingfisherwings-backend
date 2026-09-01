import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { SearchService } from "./search.service";
import { SearchQueryDto } from "./dto/search-query.dto";

import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { SEARCH_PERMISSIONS } from "./constants/search-permission.constants";

@ApiTags("Search")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("search")
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @RequirePermissions(SEARCH_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "Global search across jobs, quotations, and parties",
  })
  search(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: SearchQueryDto,
  ) {
    return this.service.search(tenantId, query);
  }
}
