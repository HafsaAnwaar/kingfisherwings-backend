import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { DOCUMENTATION_PERMISSIONS } from "./constants/documentation-permission.constants";
import { DocumentationJobsService } from "./documentation-jobs.service";
import {
  DocumentationCreateJobDto,
  DocumentationJobsQueryDto,
} from "./dto/documentation-jobs.dto";

@ApiTags("Documentation — All Jobs")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("documentation/jobs")
export class DocumentationJobsController {
  constructor(private readonly service: DocumentationJobsService) {}

  @Get()
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  @ApiOperation({ summary: "All Jobs list (Documentation module)" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: DocumentationJobsQueryDto,
  ) {
    return this.service.listJobs(tenantId, query);
  }

  @Post("create-wizard")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.READ)
  @ApiOperation({ summary: "Create job wizard metadata (5 steps)" })
  createWizard() {
    return this.service.createWizardMetadata();
  }

  @Post("create")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Create job from Documentation wizard" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @CurrentUser("permissions") permissions: string[],
    @Body() dto: DocumentationCreateJobDto,
  ) {
    return this.service.createJob(tenantId, dto, actorId, permissions);
  }
}
