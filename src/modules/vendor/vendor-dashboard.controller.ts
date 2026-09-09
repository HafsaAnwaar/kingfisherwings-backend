import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import {
  DashboardPeriodQueryDto,
  TasksQueryDto,
} from "../../common/dto/dashboard-period-query.dto";
import { CurrentVendor } from "./decorators/vendor.decorators";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";
import { VendorDashboardService } from "./vendor-dashboard.service";

@ApiTags("Vendor Dashboard")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller("vendor")
export class VendorDashboardController {
  constructor(private readonly dashboard: VendorDashboardService) {}

  @Get("dashboard")
  @ApiOperation({
    summary: "Vendor portal dashboard (KPIs + upcoming + tasks preview)",
    description: "Supports period=7d|30d|mtd|custom.",
  })
  getDashboard(
    @CurrentVendor() user: CurrentVendorUser,
    @Query() query: DashboardPeriodQueryDto,
  ) {
    return this.dashboard.dashboard(user, query);
  }

  @Get("tasks")
  @ApiOperation({
    summary: "Computed vendor checklist/todos",
    description:
      "Overdue PIs, open payment requests, open disputes. done is live from status.",
  })
  getTasks(
    @CurrentVendor() user: CurrentVendorUser,
    @Query() query: TasksQueryDto,
  ) {
    return this.dashboard.listTasks(user, query);
  }
}
