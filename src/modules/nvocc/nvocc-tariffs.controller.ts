import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { NVOCC_PERMISSIONS } from "./constants/nvocc-permission.constants";
import { NvoccTariffsService } from "./nvocc-tariffs.service";
import {
  CreateNvoccTariffDto,
  NvoccTariffLookupDto,
  NvoccTariffQueryDto,
  UpdateNvoccTariffDto,
} from "./dto/nvocc-tariff.dto";

@ApiTags("NVOCC — Tariffs")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("nvocc/tariffs")
export class NvoccTariffsController {
  constructor(private readonly service: NvoccTariffsService) {}

  @Get()
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List NVOCC trade-lane tariffs" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: NvoccTariffQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get("lookup")
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Find matching tariff for POL/POD/cargo type" })
  lookup(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: NvoccTariffLookupDto,
  ) {
    return this.service.findMatch(tenantId, query);
  }

  @Post()
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Create an NVOCC tariff" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateNvoccTariffDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Get(":id")
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get an NVOCC tariff" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(":id")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Update an NVOCC tariff" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateNvoccTariffDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(":id")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Soft-delete an NVOCC tariff" })
  remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(tenantId, id, actorId);
  }
}
