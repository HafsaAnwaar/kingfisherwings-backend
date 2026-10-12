import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { RolesGuard } from "../users/guards/roles.guard";
import { Roles } from "../users/decorators/roles.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { UpdateJobDateSettingsDto } from "./dto/job-date-settings.dto";
import { UpdateDimensionSettingsDto } from "./dto/dimension-settings.dto";
import { DEFAULT_VOLUMETRIC_DIVISOR_CM } from "../jobs/utils/job-dimension-calc.util";

@ApiTags("Organization — Settings")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.TENANT_ADMIN)
@Controller("organization/settings")
export class OrganizationSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("job-date")
  @ApiOperation({ summary: "Job date configuration (ETD/ETA/System)" })
  async getJobDate(@CurrentUser("tenantId") tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { job_date_source: true },
    });
    return {
      success: true,
      data: {
        job_date_source: tenant?.job_date_source ?? "SYSTEM_DATE",
        options: ["ETD_ATD", "ETA_ATA", "SYSTEM_DATE"],
      },
    };
  }

  @Patch("job-date")
  @ApiOperation({ summary: "Update job date configuration" })
  async patchJobDate(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: UpdateJobDateSettingsDto,
  ) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { job_date_source: dto.job_date_source },
      select: { job_date_source: true },
    });
    return { success: true, data: tenant };
  }

  @Get("dimensions")
  @ApiOperation({
    summary: "Dimension calculation settings (volumetric divisor)",
  })
  async getDimensions(@CurrentUser("tenantId") tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { volumetric_divisor_cm: true },
    });
    return {
      success: true,
      data: {
        volumetric_divisor_cm:
          tenant?.volumetric_divisor_cm ?? DEFAULT_VOLUMETRIC_DIVISOR_CM,
        defaults: {
          air_iata: 6000,
          sea_common: 1000,
          courier_common: 5000,
        },
        formula: "v_weight_kg = (L_cm × W_cm × H_cm × pcs) / volumetric_divisor_cm",
      },
    };
  }

  @Patch("dimensions")
  @ApiOperation({ summary: "Update volumetric weight divisor (cm → kg)" })
  async patchDimensions(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: UpdateDimensionSettingsDto,
  ) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { volumetric_divisor_cm: dto.volumetric_divisor_cm },
      select: { volumetric_divisor_cm: true },
    });
    return { success: true, data: tenant };
  }
}
