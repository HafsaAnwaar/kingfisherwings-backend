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
import { HrLeaveRequestStatus } from "@prisma/client";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { CurrentUser as CurrentUserType } from "../users/interfaces/current-user.interface";
import { HR_PERMISSIONS } from "./constants/hr-permission.constants";
import {
  AbsentReportQueryDto,
  DocumentExpiryQueryDto,
  LeaveCalendarQueryDto,
  LeaveEncashmentDto,
  LeavePolicyDto,
  LeaveRequestDto,
  LeaveReviewDto,
  UpdateLeavePolicyDto,
} from "./dto/hr-leave.dto";
import { HrLeaveService } from "./hr-leave.service";

@ApiTags("HR Leave")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("hr")
export class HrLeaveController {
  constructor(private readonly leave: HrLeaveService) {}

  @Get("leave-policies")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listPolicies(@CurrentUser() user: CurrentUserType) {
    return this.leave.listPolicies(user);
  }

  @Post("leave-policies")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LEAVE)
  createPolicy(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: LeavePolicyDto,
  ) {
    return this.leave.createPolicy(user, dto);
  }

  @Patch("leave-policies/:id")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LEAVE)
  updatePolicy(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeavePolicyDto,
  ) {
    return this.leave.updatePolicy(user, id, dto);
  }

  @Delete("leave-policies/:id")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LEAVE)
  deletePolicy(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.leave.deletePolicy(user, id);
  }

  @Get("leave-requests")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listRequests(
    @CurrentUser() user: CurrentUserType,
    @Query("employee_id") employeeId?: string,
    @Query("status") status?: HrLeaveRequestStatus,
  ) {
    return this.leave.listRequests(user, employeeId, status);
  }

  @Post("leave-requests")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LEAVE)
  createRequest(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: LeaveRequestDto,
  ) {
    return this.leave.createRequest(user, dto);
  }

  @Patch("leave-requests/:id/review")
  @RequirePermissions(HR_PERMISSIONS.APPROVE_LEAVE)
  reviewRequest(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LeaveReviewDto,
  ) {
    return this.leave.reviewRequest(user, id, dto);
  }

  @Patch("leave-requests/:id/approve")
  @RequirePermissions(HR_PERMISSIONS.APPROVE_LEAVE)
  approveRequest(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.leave.reviewRequest(user, id, { status: "APPROVED" });
  }

  @Patch("leave-requests/:id/reject")
  @RequirePermissions(HR_PERMISSIONS.APPROVE_LEAVE)
  rejectRequest(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto?: { review_notes?: string },
  ) {
    return this.leave.reviewRequest(user, id, {
      status: "REJECTED",
      review_notes: dto?.review_notes,
    });
  }

  @Patch("leave-requests/:id/return")
  @RequirePermissions(HR_PERMISSIONS.APPROVE_LEAVE)
  returnRequest(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto?: { review_notes?: string },
  ) {
    return this.leave.reviewRequest(user, id, {
      status: "RETURNED",
      review_notes: dto?.review_notes,
    });
  }

  @Get("leave-calendar")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  calendar(
    @CurrentUser() user: CurrentUserType,
    @Query() query: LeaveCalendarQueryDto,
  ) {
    return this.leave.leaveCalendar(user, query);
  }

  @Get("absent-report")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  absentReport(
    @CurrentUser() user: CurrentUserType,
    @Query() query: AbsentReportQueryDto,
  ) {
    return this.leave.absentReport(user, query);
  }

  @Get("document-expiry/report")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  documentExpiry(
    @CurrentUser() user: CurrentUserType,
    @Query() query: DocumentExpiryQueryDto,
  ) {
    return this.leave.documentExpiryReport(user, query);
  }

  @Get("employees/:employeeId/leave-balances")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  balances(
    @CurrentUser() user: CurrentUserType,
    @Param("employeeId", ParseUUIDPipe) employeeId: string,
    @Query("year") year?: number,
  ) {
    return this.leave.getBalances(
      user,
      employeeId,
      year ? Number(year) : undefined,
    );
  }

  @Post("employees/:employeeId/leave-encashment")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LEAVE)
  encashment(
    @CurrentUser() user: CurrentUserType,
    @Param("employeeId", ParseUUIDPipe) employeeId: string,
    @Body() dto: Omit<LeaveEncashmentDto, "employee_id">,
  ) {
    return this.leave.leaveEncashment(user, {
      ...dto,
      employee_id: employeeId,
    });
  }
}
