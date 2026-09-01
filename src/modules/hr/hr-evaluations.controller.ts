import {
  Body,
  Controller,
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
import { CurrentUser as CurrentUserType } from "../users/interfaces/current-user.interface";
import { HR_PERMISSIONS } from "./constants/hr-permission.constants";
import {
  CycleDto,
  EvaluationDto,
  SubmitScoresDto,
  TemplateDto,
  UpdateTemplateDto,
} from "./dto/hr-evaluation.dto";
import { HrEvaluationsService } from "./hr-evaluations.service";

@ApiTags("HR Evaluations")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("hr")
export class HrEvaluationsController {
  constructor(private readonly evaluations: HrEvaluationsService) {}

  @Get("evaluation-templates")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listTemplates(@CurrentUser() user: CurrentUserType) {
    return this.evaluations.listTemplates(user);
  }

  @Post("evaluation-templates")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EVALUATIONS)
  createTemplate(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: TemplateDto,
  ) {
    return this.evaluations.createTemplate(user, dto);
  }

  @Patch("evaluation-templates/:id")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EVALUATIONS)
  updateTemplate(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.evaluations.updateTemplate(user, id, dto);
  }

  @Get("evaluation-cycles")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listCycles(
    @CurrentUser() user: CurrentUserType,
    @Query("year") year?: number,
  ) {
    return this.evaluations.listCycles(user, year ? Number(year) : undefined);
  }

  @Post("evaluation-cycles")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EVALUATIONS)
  createCycle(@CurrentUser() user: CurrentUserType, @Body() dto: CycleDto) {
    return this.evaluations.createCycle(user, dto);
  }

  @Get("evaluations")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listEvaluations(
    @CurrentUser() user: CurrentUserType,
    @Query("cycle_id") cycleId?: string,
    @Query("employee_id") employeeId?: string,
  ) {
    return this.evaluations.listEvaluations(user, cycleId, employeeId);
  }

  @Post("evaluations")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EVALUATIONS)
  createEvaluation(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: EvaluationDto,
  ) {
    return this.evaluations.createEvaluation(user, dto);
  }

  @Post("evaluations/:id/submit-self")
  @RequirePermissions(HR_PERMISSIONS.VIEW_SELF)
  submitSelf(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitScoresDto,
  ) {
    return this.evaluations.submitSelf(user, id, dto);
  }

  @Post("evaluations/:id/submit-manager")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EVALUATIONS)
  submitManager(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitScoresDto,
  ) {
    return this.evaluations.submitManager(user, id, dto);
  }

  @Post("evaluations/:id/finalize")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EVALUATIONS)
  finalize(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.evaluations.finalize(user, id);
  }
}
