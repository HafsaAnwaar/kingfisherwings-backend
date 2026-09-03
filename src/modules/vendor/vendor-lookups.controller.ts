import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { MasterQueryDto } from "../masters/dto/master-query.dto";
import { AirportsService } from "../masters/airports/airports.service";
import { PortsService } from "../masters/ports/ports.service";
import { CurrentVendor } from "./decorators/vendor.decorators";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";

@ApiTags("Vendor Lookups")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller("vendor/lookups")
export class VendorLookupsController {
  constructor(
    private readonly ports: PortsService,
    private readonly airports: AirportsService,
  ) {}

  @Get("ports")
  @ApiOperation({ summary: "World sea ports (searchable)" })
  portsLookup(
    @CurrentVendor() user: CurrentVendorUser,
    @Query() query: MasterQueryDto,
  ) {
    return this.ports.findAll(user.tenantId, { ...query, is_active: true });
  }

  @Get("airports")
  @ApiOperation({ summary: "World airports (searchable)" })
  airportsLookup(
    @CurrentVendor() user: CurrentVendorUser,
    @Query() query: MasterQueryDto,
  ) {
    return this.airports.findAll(user.tenantId, { ...query, is_active: true });
  }
}
