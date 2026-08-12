import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import 'multer';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { CRM_PERMISSIONS } from './constants/crm-permission.constants';
import { CrmActivityService } from './crm-activity.service';
import { CrmDashboardService } from './crm-dashboard.service';
import { CrmEmailService } from './crm-email.service';
import { CrmLeadsService } from './crm-leads.service';
import {
  CallLogQueryDto,
  ConvertLeadDto,
  CreateBudgetDto,
  CreateCallLogDto,
  CreateCampaignDto,
  CreateCampaignTemplateDto,
  CreateEnquiryDto,
  CreateFollowUpDto,
  CreateLeadDto,
  CreateSubscriberDto,
  DashboardQueryDto,
  EnquiryQueryDto,
  FollowUpQueryDto,
  LeadQueryDto,
  PatchFollowUpDto,
  UpdateEnquiryDto,
  UpdateLeadDto,
} from './dto/crm.dto';

@ApiTags('CRM Leads')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('crm/leads')
export class CrmLeadsController {
  constructor(private readonly leads: CrmLeadsService) {}

  @Get('pipeline')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Lead pipeline grouped by status' })
  pipeline(
    @CurrentUser() user: CurrentUserType,
    @Query('assigned_salesperson_id') assigned?: string,
  ) {
    return this.leads.pipeline(user, assigned);
  }

  @Post('import')
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Import leads from CSV' })
  importCsv(@CurrentUser() user: CurrentUserType, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('CSV file is required.');
    return this.leads.importCsv(user, file.buffer);
  }

  @Get()
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  list(@CurrentUser() user: CurrentUserType, @Query() query: LeadQueryDto) {
    return this.leads.findAll(user, query);
  }

  @Post()
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateLeadDto) {
    return this.leads.create(user, dto);
  }

  @Get(':id')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  detail(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.leads.findOne(user, id);
  }

  @Patch(':id')
  @RequirePermissions(CRM_PERMISSIONS.UPDATE)
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leads.update(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(CRM_PERMISSIONS.DELETE)
  remove(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.leads.remove(user, id);
  }

  @Post(':id/convert')
  @RequirePermissions(CRM_PERMISSIONS.UPDATE)
  convert(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConvertLeadDto,
  ) {
    return this.leads.convert(user, id, dto);
  }
}

@ApiTags('CRM Call Logs')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('crm/call-logs')
export class CrmCallLogsController {
  constructor(private readonly activity: CrmActivityService) {}

  @Get('daily')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Daily call sheet' })
  daily(
    @CurrentUser() user: CurrentUserType,
    @Query('date') date?: string,
    @Query('salesperson_id') salespersonId?: string,
  ) {
    return this.activity.dailySheet(user, date ?? new Date().toISOString().slice(0, 10), salespersonId);
  }

  @Get()
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  list(@CurrentUser() user: CurrentUserType, @Query() query: CallLogQueryDto) {
    return this.activity.listCallLogs(user, query);
  }

  @Post()
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async create(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateCallLogDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.activity.createCallLog(user, dto, file ? `inline:${file.originalname}` : undefined);
  }
}

@ApiTags('CRM Follow-ups')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('crm/follow-ups')
export class CrmFollowUpsController {
  constructor(private readonly activity: CrmActivityService) {}

  @Get('calendar')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  calendar(
    @CurrentUser() user: CurrentUserType,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.activity.calendar(user, from, to);
  }

  @Get()
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  list(@CurrentUser() user: CurrentUserType, @Query() query: FollowUpQueryDto) {
    return this.activity.listFollowUps(user, query);
  }

  @Post()
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateFollowUpDto) {
    return this.activity.createFollowUp(user, dto);
  }

  @Patch(':id')
  @RequirePermissions(CRM_PERMISSIONS.UPDATE)
  patch(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PatchFollowUpDto,
  ) {
    return this.activity.patchFollowUp(user, id, dto);
  }
}

@ApiTags('CRM Enquiries')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('crm/enquiries')
export class CrmEnquiriesController {
  constructor(private readonly activity: CrmActivityService) {}

  @Get()
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  list(@CurrentUser() user: CurrentUserType, @Query() query: EnquiryQueryDto) {
    return this.activity.listEnquiries(user, query);
  }

  @Post()
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateEnquiryDto) {
    return this.activity.createEnquiry(user, dto);
  }

  @Get(':id')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  detail(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.activity.getEnquiry(user, id);
  }

  @Patch(':id')
  @RequirePermissions(CRM_PERMISSIONS.UPDATE)
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnquiryDto,
  ) {
    return this.activity.updateEnquiry(user, id, dto);
  }

  @Post(':id/convert-to-quote')
  @RequirePermissions(CRM_PERMISSIONS.UPDATE)
  convert(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.activity.convertToQuote(user, id);
  }
}

@ApiTags('CRM Dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('crm')
export class CrmDashboardController {
  constructor(private readonly dashboard: CrmDashboardService) {}

  @Get('dashboard')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Sales CRM dashboard overview' })
  overview(@CurrentUser() user: CurrentUserType, @Query() query: DashboardQueryDto) {
    return this.dashboard.overview(user, query);
  }

  @Get('reports/:type')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: 'Sales reports',
    description:
      'Types: weekly_sales, monthly_sales, salesman_revenue, customer_revenue, top_customers, top_salesmen, trade_lane, service_type, win_loss, call_log_summary, lead_pipeline, budget_vs_actual, enquiry_conversion, follow_up_overdue',
  })
  report(
    @CurrentUser() user: CurrentUserType,
    @Param('type') type: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboard.report(user, type, query);
  }

  @Get('budgets')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  budgets(
    @CurrentUser() user: CurrentUserType,
    @Query('salesperson_id') salespersonId?: string,
  ) {
    return this.dashboard.listBudgets(user, salespersonId);
  }

  @Post('budgets')
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  createBudget(@CurrentUser() user: CurrentUserType, @Body() dto: CreateBudgetDto) {
    return this.dashboard.createBudget(user, dto);
  }
}

@ApiTags('CRM Email Marketing')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('crm')
export class CrmEmailController {
  constructor(private readonly email: CrmEmailService) {}

  @Get('subscribers')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  subscribers(@CurrentUser() user: CurrentUserType) {
    return this.email.listSubscribers(user);
  }

  @Post('subscribers')
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  createSubscriber(@CurrentUser() user: CurrentUserType, @Body() dto: CreateSubscriberDto) {
    return this.email.createSubscriber(user, dto);
  }

  @Post('subscribers/import')
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  importSubscribers(
    @CurrentUser() user: CurrentUserType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('CSV file is required.');
    return this.email.importSubscribers(user, file.buffer);
  }

  @Post('subscribers/:id/unsubscribe')
  @RequirePermissions(CRM_PERMISSIONS.UPDATE)
  unsubscribe(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.email.unsubscribe(user, id);
  }

  @Get('campaigns')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  campaigns(@CurrentUser() user: CurrentUserType) {
    return this.email.listCampaigns(user);
  }

  @Post('campaigns')
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  createCampaign(@CurrentUser() user: CurrentUserType, @Body() dto: CreateCampaignDto) {
    return this.email.createCampaign(user, dto);
  }

  @Post('campaigns/:id/schedule')
  @RequirePermissions(CRM_PERMISSIONS.UPDATE)
  schedule(
    @CurrentUser() user: CurrentUserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('scheduled_at') scheduledAt: string,
  ) {
    if (!scheduledAt) throw new BadRequestException('scheduled_at is required.');
    return this.email.schedule(user, id, scheduledAt);
  }

  @Post('campaigns/:id/send')
  @RequirePermissions(CRM_PERMISSIONS.UPDATE)
  send(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.email.sendNow(user, id);
  }

  @Get('campaign-templates')
  @RequirePermissions(CRM_PERMISSIONS.VIEW)
  templates(@CurrentUser() user: CurrentUserType) {
    return this.email.listTemplates(user);
  }

  @Post('campaign-templates')
  @RequirePermissions(CRM_PERMISSIONS.CREATE)
  createTemplate(@CurrentUser() user: CurrentUserType, @Body() dto: CreateCampaignTemplateDto) {
    return this.email.createTemplate(user, dto);
  }
}
