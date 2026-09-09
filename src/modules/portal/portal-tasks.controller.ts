import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { TasksQueryDto } from "../../common/dto/dashboard-period-query.dto";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalTasksService } from "./portal-tasks.service";

@ApiTags("Portal Tasks")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/tasks")
export class PortalTasksController {
  constructor(private readonly tasks: PortalTasksService) {}

  @Get()
  @ApiOperation({
    summary: "Computed portal checklist/todos",
    description:
      "Server-derived tasks (overdue invoices, quotes awaiting action, customs/docs). done is live — do not invent client-side todos.",
  })
  list(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: TasksQueryDto,
  ) {
    return this.tasks.listTasks(user, query);
  }
}
