import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { REPORTS_PERMISSIONS } from "./constants/reports-permission.constants";
import { ReportsJobsService } from "./reports-jobs.service";

@ApiTags("Reports — Catalog")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("reports/jobs")
export class ReportsJobsController {
  constructor(private readonly service: ReportsJobsService) {}

  @Get(":jobId")
  @RequirePermissions(REPORTS_PERMISSIONS.READ)
  @ApiOperation({ summary: "Poll report job status" })
  status(
    @CurrentUser("tenantId") tenantId: string,
    @Param("jobId") jobId: string,
  ) {
    return this.service.getStatus(tenantId, jobId);
  }

  @Get(":jobId/download")
  @RequirePermissions(REPORTS_PERMISSIONS.READ)
  @ApiOperation({ summary: "Download generated report binary" })
  @ApiProduces(
    "application/pdf",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  async download(
    @CurrentUser("tenantId") tenantId: string,
    @Param("jobId") jobId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.service.download(tenantId, jobId);
    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
    });
    return new StreamableFile(file.buffer);
  }
}
