import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from "@nestjs/swagger";
import { ContainerStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { MASTERS_PERMISSIONS } from "../constants/masters-permission.constants";
import { ContainerInventoryService } from "./container-inventory.service";

class ContainerInventoryQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ enum: ContainerStatus })
  @IsOptional()
  @IsEnum(ContainerStatus)
  status?: ContainerStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}

@ApiTags("Masters — Container Inventory")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("masters/container-inventory")
export class ContainerInventoryController {
  constructor(private readonly service: ContainerInventoryService) {}

  @Get()
  @RequirePermissions(MASTERS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: "List job containers with free-days (read model)",
  })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ContainerInventoryQueryDto,
  ) {
    return this.service.list(tenantId, query);
  }
}
