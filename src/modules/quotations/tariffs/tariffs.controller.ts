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
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { TariffsService } from "./tariffs.service";
import { CreateTariffDto, UpdateTariffDto } from "../dto/tariff.dto";
import { MasterQueryDto } from "../../masters/dto/master-query.dto";

import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { QUOTATIONS_PERMISSIONS } from "../constants/quotations-permission.constants";

@ApiTags("Quotations — Online Tariff Master")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("quotations/tariffs")
export class TariffsController {
  constructor(private readonly service: TariffsService) {}

  @Get()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List tariff rate cards" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MasterQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get(":id")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get a tariff by id" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(QUOTATIONS_PERMISSIONS.CREATE)
  @ApiOperation({
    summary:
      "Create a tariff rate card (sale rate + cost rate per lane/service/container type)",
  })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateTariffDto,
  ) {
    return this.service.create(tenantId, { ...dto }, actorId);
  }

  @Patch(":id")
  @RequirePermissions(QUOTATIONS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a tariff" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTariffDto,
  ) {
    return this.service.update(tenantId, id, { ...dto }, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(QUOTATIONS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete a tariff" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }
}
