import {
  Body,
  Controller,
  Delete,
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
  AttendanceDto,
  CreateTimesheetDto,
  ExportTimesheetPayrollDto,
  MissingTimesheetQueryDto,
  TimesheetQueryDto,
  UpdateTimesheetDto,
} from "./dto/hr-timesheet.dto";
import { HrTimesheetsService } from "./hr-timesheets.service";

@ApiTags("HR Timesheets")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("hr")
export class HrTimesheetsController {
  constructor(private readonly timesheets: HrTimesheetsService) {}

  @Get("timesheets/missing-report")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  missing(
    @CurrentUser() user: CurrentUserType,
    @Query() query: MissingTimesheetQueryDto,
  ) {
    return this.timesheets.missingReport(user, query);
  }

  @Post("timesheets/export-to-payroll")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  exportOtAlias(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: ExportTimesheetPayrollDto,
  ) {
    return this.timesheets.exportOtToPayroll(user, dto);
  }

  @Get("timesheets")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  list(
    @CurrentUser() user: CurrentUserType,
    @Query() query: TimesheetQueryDto,
  ) {
    return this.timesheets.findAll(user, query);
  }

  @Post("timesheets")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_TIMESHEETS)
  create(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateTimesheetDto,
  ) {
    return this.timesheets.create(user, dto);
  }

  @Patch("timesheets/:id")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_TIMESHEETS)
  update(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimesheetDto,
  ) {
    return this.timesheets.update(user, id, dto);
  }

  @Post("timesheets/:id/approve")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_TIMESHEETS)
  approve(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.timesheets.approve(user, id);
  }

  @Delete("timesheets/:id")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_TIMESHEETS)
  remove(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.timesheets.remove(user, id);
  }

  @Get("attendance")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listAttendance(
    @CurrentUser() user: CurrentUserType,
    @Query("employee_id") employeeId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.timesheets.listAttendance(user, employeeId, from, to);
  }

  @Post("attendance/clock-in")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_TIMESHEETS)
  clockIn(@CurrentUser() user: CurrentUserType, @Body() dto: AttendanceDto) {
    return this.timesheets.clockIn(user, dto);
  }

  @Post("attendance/clock-out")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_TIMESHEETS)
  clockOut(@CurrentUser() user: CurrentUserType, @Body() dto: AttendanceDto) {
    return this.timesheets.clockOut(user, dto);
  }

  @Post("timesheets/export-payroll-ot")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  exportOt(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: ExportTimesheetPayrollDto,
  ) {
    return this.timesheets.exportOtToPayroll(user, dto);
  }
}
