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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HrLoanStatus } from '@prisma/client';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { HR_PERMISSIONS } from './constants/hr-permission.constants';
import { CreateAdvanceDto, CreateLoanDto, LoanReviewDto } from './dto/hr-loan.dto';
import { HrLoansService } from './hr-loans.service';

@ApiTags('HR Loans')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('hr')
export class HrLoansController {
  constructor(private readonly loans: HrLoansService) {}

  @Get('loans')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listLoans(
    @CurrentUser() user: CurrentUserType,
    @Query('employee_id') employeeId?: string,
    @Query('status') status?: HrLoanStatus,
  ) {
    return this.loans.listLoans(user, employeeId, status);
  }

  @Post('loans')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LOANS)
  createLoan(@CurrentUser() user: CurrentUserType, @Body() dto: CreateLoanDto) {
    return this.loans.createLoan(user, dto);
  }

  @Get('loans/outstanding-report')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  outstanding(@CurrentUser() user: CurrentUserType) {
    return this.loans.outstandingReport(user);
  }

  @Get('loans/:id/schedule')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  schedule(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.loans.getSchedule(user, id);
  }

  @Patch('loans/:id/review')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LOANS)
  reviewLoan(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LoanReviewDto,
  ) {
    return this.loans.reviewLoan(user, id, dto);
  }

  @Patch('loans/:id/approve')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LOANS)
  approveLoan(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.loans.reviewLoan(user, id, { status: 'APPROVED' });
  }

  @Patch('loans/:id/reject')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LOANS)
  rejectLoan(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.loans.reviewLoan(user, id, { status: 'REJECTED' });
  }

  @Get('advances')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listAdvances(@CurrentUser() user: CurrentUserType, @Query('employee_id') employeeId?: string) {
    return this.loans.listAdvances(user, employeeId);
  }

  @Post('advances')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LOANS)
  createAdvance(@CurrentUser() user: CurrentUserType, @Body() dto: CreateAdvanceDto) {
    return this.loans.createAdvance(user, dto);
  }

  @Patch('advances/:id/close')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_LOANS)
  closeAdvance(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.loans.closeAdvance(user, id);
  }
}
