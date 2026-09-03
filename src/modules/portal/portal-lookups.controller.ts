import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { MasterQueryDto } from "../masters/dto/master-query.dto";
import { AirportsService } from "../masters/airports/airports.service";
import { PortsService } from "../masters/ports/ports.service";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";

@ApiTags("Portal Lookups")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/lookups")
export class PortalLookupsController {
  constructor(
    private readonly ports: PortsService,
    private readonly airports: AirportsService,
  ) {}

  @Get("ports")
  @ApiOperation({
    summary: "World sea ports for quote origin/destination (searchable)",
  })
  portsLookup(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: MasterQueryDto,
  ) {
    return this.ports.findAll(user.tenantId, { ...query, is_active: true });
  }

  @Get("airports")
  @ApiOperation({
    summary: "World airports for quote origin/destination (searchable)",
  })
  airportsLookup(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: MasterQueryDto,
  ) {
    return this.airports.findAll(user.tenantId, { ...query, is_active: true });
  }
}
