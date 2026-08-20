import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { HR_PERMISSIONS } from './constants/hr-permission.constants';
import {
  CreatePayrollRunDto,
  GratuityQueryDto,
  PayrollGlSettingDto,
  PayslipEmailDto,
  SalaryComponentDto,
} from './dto/hr-payroll.dto';
import { HrPayrollService } from './hr-payroll.service';

@ApiTags('HR Payroll')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('hr')
export class HrPayrollController {
  constructor(private readonly payroll: HrPayrollService) {}

  @Get('salary-components')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listComponents(@CurrentUser() user: CurrentUserType) {
    return this.payroll.listSalaryComponents(user);
  }

  @Post('salary-components/seed')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  seedComponents(@CurrentUser() user: CurrentUserType) {
    return this.payroll.seedSalaryComponents(user);
  }

  @Post('salary-components')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  upsertComponent(@CurrentUser() user: CurrentUserType, @Body() dto: SalaryComponentDto) {
    return this.payroll.upsertSalaryComponent(user, dto);
  }

  @Get('payroll-runs')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listRuns(@CurrentUser() user: CurrentUserType) {
    return this.payroll.listPayrollRuns(user);
  }

  @Post('payroll-runs')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  createRun(@CurrentUser() user: CurrentUserType, @Body() dto: CreatePayrollRunDto) {
    return this.payroll.createPayrollRun(user, dto);
  }

  @Get('payroll-runs/:id')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  getRun(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.payroll.getPayrollRun(user, id);
  }

  @Post('payroll-runs/:id/generate-lines')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  generateLines(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.payroll.generateLines(user, id);
  }

  @Post('payroll-runs/:id/generate')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  @ApiOperation({ summary: 'Alias of generate-lines' })
  generateLinesAlias(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.payroll.generateLines(user, id);
  }

  @Post('payroll-runs/:id/finalize')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  finalize(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.payroll.finalizeRun(user, id);
  }

  @Post('payroll-runs/:id/post-gl')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  postGl(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.payroll.postToGl(user, id);
  }

  @Get('payroll-runs/:id/wps-sif')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  wpsSif(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.payroll.generateWpsSif(user, id);
  }

  @Get('payroll-runs/:id/wps-export')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  @ApiOperation({ summary: 'Alias of wps-sif' })
  wpsExport(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.payroll.generateWpsSif(user, id);
  }

  @Post('payroll-runs/:runId/payslips/:employeeId')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  generatePayslip(
    @CurrentUser() user: CurrentUserType,
    @Param('runId', ParseUUIDPipe) runId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.payroll.generatePayslip(user, runId, employeeId);
  }

  @Post('payroll-runs/:runId/payslips/:employeeId/email')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  emailPayslip(
    @CurrentUser() user: CurrentUserType,
    @Param('runId', ParseUUIDPipe) runId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: PayslipEmailDto,
  ) {
    return this.payroll.emailPayslip(user, runId, employeeId, dto);
  }

  @Get('gratuity')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  gratuity(@CurrentUser() user: CurrentUserType, @Query() query: GratuityQueryDto) {
    return this.payroll.calculateGratuity(user, query);
  }

  @Get('employees/:employeeId/gratuity')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  gratuityByEmployee(
    @CurrentUser() user: CurrentUserType,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('as_of') asOf?: string,
  ) {
    return this.payroll.calculateGratuity(user, { employee_id: employeeId, as_of: asOf });
  }

  @Post('payroll-gl-settings')
  @RequirePermissions(HR_PERMISSIONS.MANAGE_PAYROLL)
  upsertGlSettings(@CurrentUser() user: CurrentUserType, @Body() dto: PayrollGlSettingDto) {
    return this.payroll.upsertGlSettings(user, dto);
  }
}
