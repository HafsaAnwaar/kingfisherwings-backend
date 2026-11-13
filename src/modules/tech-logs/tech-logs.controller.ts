import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { AllowSuperAdmin } from "../../common/decorators/allow-super-admin.decorator";
import { SuperAdminGuard } from "../auth/guards/super-admin.guard";
import { CurrentSuperAdminUser } from "../auth/decorators/current-super-admin.decorator";
import {
  ReportClientErrorDto,
  TechIssuesListQueryDto,
  TechLogsListQueryDto,
  UpdateTechIssueDto,
} from "./dto/tech-logs.dto";
import { TechLogsService } from "./tech-logs.service";
import { clientIp, resolveTechLogActor } from "./tech-logs-actor.util";

@ApiTags("Tech Logs (Super Admin)")
@ApiBearerAuth()
@Controller("super-admin/tech-logs")
export class TechLogsController {
  constructor(private readonly techLogs: TechLogsService) {}

  @Get("summary")
  @AllowSuperAdmin()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: "Tech logs dashboard counters for Super Admin" })
  summary() {
    return this.techLogs.summary();
  }

  @Get("activity")
  @AllowSuperAdmin()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({
    summary:
      "Activity tab — all user API actions across tenants (with user name)",
  })
  listActivity(@Query() query: TechLogsListQueryDto) {
    return this.techLogs.listActivity(query);
  }

  @Get("issues")
  @AllowSuperAdmin()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({
    summary:
      "Issues tab — errors faced by users (with user name) for triage",
  })
  listIssues(@Query() query: TechIssuesListQueryDto) {
    return this.techLogs.listIssues(query);
  }

  @Get("issues/:id")
  @AllowSuperAdmin()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: "Tech issue detail" })
  getIssue(@Param("id", ParseUUIDPipe) id: string) {
    return this.techLogs.getIssue(id);
  }

  @Patch("issues/:id")
  @AllowSuperAdmin()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({
    summary: "Update issue status / resolution notes (OPEN → RESOLVED, etc.)",
  })
  updateIssue(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechIssueDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.techLogs.updateIssue(id, dto, superAdminId);
  }

  /**
   * Staff SPA can POST client-side errors into Issues (Bearer staff JWT).
   * API errors are also captured automatically by TechLogsInterceptor.
   */
  @Post("client-errors")
  @ApiOperation({
    summary:
      "Ingest a client/FE error into Issues (staff JWT; attributed to that user)",
  })
  reportClientError(@Req() req: Request, @Body() dto: ReportClientErrorDto) {
    const actor = resolveTechLogActor(req as never);
    return this.techLogs.reportClientError(
      actor,
      dto,
      clientIp(req),
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : null,
    );
  }
}
