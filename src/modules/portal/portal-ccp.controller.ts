import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorators';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { PORTAL_PERMISSIONS } from './constants/portal-permission.constants';
import { CurrentPortal } from './decorators/portal.decorators';
import {
  CreateCreditLimitRequestDto,
  CreatePortalDisputeDto,
  CreatePortalMessageDto,
  PortalDisputeQueryDto,
  PortalMessageQueryDto,
  ReviewCreditLimitRequestDto,
  ReviewPortalDisputeDto,
  StaffPortalInboxQueryDto,
} from './dto/portal-ccp.dto';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { PortalCcpService } from './portal-ccp.service';

@ApiTags('Portal Messages')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/messages')
export class PortalMessagesController {
  constructor(private readonly ccp: PortalCcpService) {}

  @Post()
  @ApiOperation({ summary: 'Contact the forwarder' })
  create(@CurrentPortal() user: CurrentPortalUser, @Body() dto: CreatePortalMessageDto) {
    return this.ccp.createMessage(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List messages I sent' })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalMessageQueryDto) {
    return this.ccp.listMyMessages(user, query);
  }
}

@ApiTags('Portal Disputes')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/disputes')
export class PortalDisputesController {
  constructor(private readonly ccp: PortalCcpService) {}

  @Post()
  @ApiOperation({ summary: 'Raise an invoice dispute' })
  create(@CurrentPortal() user: CurrentPortalUser, @Body() dto: CreatePortalDisputeDto) {
    return this.ccp.createDispute(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my disputes' })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalDisputeQueryDto) {
    return this.ccp.listMyDisputes(user, query);
  }
}

@ApiTags('Portal Credit Requests')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/credit/limit-requests')
export class PortalCreditLimitRequestsController {
  constructor(private readonly ccp: PortalCcpService) {}

  @Post()
  @ApiOperation({ summary: 'Request a higher credit limit' })
  create(@CurrentPortal() user: CurrentPortalUser, @Body() dto: CreateCreditLimitRequestDto) {
    return this.ccp.createCreditLimitRequest(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my credit limit requests' })
  list(@CurrentPortal() user: CurrentPortalUser) {
    return this.ccp.listMyCreditLimitRequests(user);
  }
}

@ApiTags('Admin — Customer Portal Inbox')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('portal-admin')
export class PortalAdminInboxController {
  constructor(private readonly ccp: PortalCcpService) {}

  @Get('messages')
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_MESSAGES)
  @ApiOperation({ summary: 'Staff inbox of customer portal messages' })
  messages(@CurrentUser('tenantId') tenantId: string, @Query() query: StaffPortalInboxQueryDto) {
    return this.ccp.staffListMessages(tenantId, query);
  }

  @Post('messages/:id/read')
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_MESSAGES)
  @ApiOperation({ summary: 'Mark a portal message as read by staff' })
  markMessageRead(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ccp.staffMarkMessageRead(tenantId, id);
  }

  @Get('disputes')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_DISPUTES)
  @ApiOperation({ summary: 'List customer invoice disputes' })
  disputes(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: PortalDisputeQueryDto & { party_id?: string },
  ) {
    return this.ccp.staffListDisputes(tenantId, query);
  }

  @Patch('disputes/:id')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_DISPUTES)
  @ApiOperation({ summary: 'Review / resolve a dispute' })
  reviewDispute(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewPortalDisputeDto,
  ) {
    return this.ccp.staffReviewDispute(tenantId, actorId, id, dto);
  }

  @Get('credit-limit-requests')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_CREDIT)
  @ApiOperation({ summary: 'List credit limit increase requests' })
  creditRequests(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: StaffPortalInboxQueryDto & { status?: string },
  ) {
    return this.ccp.staffListCreditLimitRequests(tenantId, {
      page: query.page,
      limit: query.limit,
      party_id: query.party_id,
      status: query.status as never,
    });
  }

  @Patch('credit-limit-requests/:id')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_CREDIT)
  @ApiOperation({ summary: 'Approve or reject a credit limit request' })
  reviewCreditRequest(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewCreditLimitRequestDto,
  ) {
    return this.ccp.staffReviewCreditLimitRequest(tenantId, actorId, id, dto);
  }
}
