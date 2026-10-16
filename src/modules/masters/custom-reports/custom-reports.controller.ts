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
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { MASTERS_PERMISSIONS } from "../constants/masters-permission.constants";
import { MasterQueryDto } from "../dto/master-query.dto";
import {
  CreateCustomReportMasterDto,
  UpdateCustomReportMasterDto,
} from "../dto/custom-report-master.dto";
import { CustomReportMastersService } from "./custom-reports.service";
import {
  favouriteActions,
  favouriteTarget,
} from "../../favourites/favourite-actions";

@ApiTags("Masters — Custom Reports")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("masters/custom-reports")
export class CustomReportMastersController {
  constructor(private readonly service: CustomReportMastersService) {}

  @Get()
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "list custom report masters" })
  async findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MasterQueryDto,
  ) {
    const result = await this.service.findAll(tenantId, query);
    return {
      ...result,
      data: result.data.map((row) => this.withFavourite(row)),
    };
  }

  @Get(":id")
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get a record by id" })
  async findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const row = await this.service.findOne(tenantId, id);
    return this.withFavourite(row);
  }

  @Post()
  @RequirePermissions(MASTERS_PERMISSIONS.CREATE)
  @ApiOperation({ summary: "Create a record" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateCustomReportMasterDto,
  ) {
    return this.service.create(tenantId, { ...dto }, actorId);
  }

  @Patch(":id")
  @RequirePermissions(MASTERS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a record" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomReportMasterDto,
  ) {
    return this.service.update(tenantId, id, { ...dto }, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(MASTERS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: "Soft-delete a record" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  private withFavourite(row: {
    id: string;
    code?: string | null;
    name?: string | null;
  }) {
    const fav = favouriteActions(
      "custom_report",
      favouriteTarget("custom_report", row.id),
      row.name ?? row.code ?? null,
    );
    return {
      ...row,
      actions: {
        can_edit: true,
        can_delete: true,
        ...fav,
      },
      favourite: fav.favourite,
      path_hints: fav.path_hints,
    };
  }
}
