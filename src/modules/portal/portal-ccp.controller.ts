import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import 'multer';
import { SkipStaffJwt } from '../../common/decorators/skip-staff-jwt.decorator';
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
  PortalMessageReplyDto,
  ReviewCreditLimitRequestDto,
  ReviewPortalDisputeDto,
  StaffCreditLimitRequestQueryDto,
  StaffDisputeQueryDto,
  StaffPortalInboxQueryDto,
} from './dto/portal-ccp.dto';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { PortalCcpService } from './portal-ccp.service';

const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

function portalAttachmentInterceptor() {
  return FileInterceptor('file', {
    limits: { fileSize: ATTACHMENT_MAX_BYTES },
    fileFilter: (_req, file, callback) => {
      if (!ATTACHMENT_MIME.has(file.mimetype)) {
        return callback(
          new BadRequestException('Only PDF, JPEG, and PNG files are accepted.'),
          false,
        );
      }
      callback(null, true);
    },
  });
}

@ApiTags('Portal Messages')
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller('portal/messages')
export class PortalMessagesController {
  constructor(private readonly ccp: PortalCcpService) {}

  @Post()
  @ApiOperation({ summary: 'Contact the forwarder' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(portalAttachmentInterceptor())
  async create(
    @CurrentPortal() user: CurrentPortalUser,
    @Body() dto: CreatePortalMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachmentPath = await this.ccp.storeOptionalUpload(user.tenantId, file);
    return this.ccp.createMessage(user, dto, attachmentPath);
  }

  @Get()
  @ApiOperation({ summary: 'List party-shared portal messages' })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalMessageQueryDto) {
    return this.ccp.listMyMessages(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Message detail with replies' })
  detail(@CurrentPortal() user: CurrentPortalUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.ccp.getMessageDetail(user, id);
  }

  @Get(':id/attachment')
  @ApiOperation({ summary: 'Download message attachment' })
  downloadAttachment(
    @CurrentPortal() user: CurrentPortalUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return this.ccp.downloadMessageAttachment(user, id, res);
  }

  @Post(':id/replies')
  @ApiOperation({ summary: 'Reply to a portal message thread' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: PortalMessageReplyDto })
  @UseInterceptors(portalAttachmentInterceptor())
  async reply(
    @CurrentPortal() user: CurrentPortalUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PortalMessageReplyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachmentPath = await this.ccp.storeOptionalUpload(user.tenantId, file);
    return this.ccp.customerReplyToMessage(user, id, dto.body, attachmentPath);
  }
}

@ApiTags('Portal Disputes')
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller('portal/disputes')
export class PortalDisputesController {
  constructor(private readonly ccp: PortalCcpService) {}

  @Post()
  @ApiOperation({ summary: 'Raise an invoice dispute' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(portalAttachmentInterceptor())
  async create(
    @CurrentPortal() user: CurrentPortalUser,
    @Body() dto: CreatePortalDisputeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachmentPath = await this.ccp.storeOptionalUpload(user.tenantId, file);
    return this.ccp.createDispute(user, dto, attachmentPath);
  }

  @Get()
  @ApiOperation({ summary: 'List my disputes' })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalDisputeQueryDto) {
    return this.ccp.listMyDisputes(user, query);
  }

  @Get(':id/attachment')
  @ApiOperation({ summary: 'Download dispute attachment' })
  downloadAttachment(
    @CurrentPortal() user: CurrentPortalUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return this.ccp.downloadDisputeAttachment(user, id, res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dispute detail for my party' })
  detail(@CurrentPortal() user: CurrentPortalUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.ccp.getMyDispute(user, id);
  }
}

@ApiTags('Portal Credit Requests')
@ApiBearerAuth()
@SkipStaffJwt()
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

  @Get('messages/:id')
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_MESSAGES)
  @ApiOperation({ summary: 'Staff message detail with replies' })
  messageDetail(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ccp.staffGetMessageDetail(tenantId, id);
  }

  @Post('messages/:id/replies')
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_MESSAGES)
  @ApiOperation({ summary: 'Staff reply to a portal message' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: PortalMessageReplyDto })
  @UseInterceptors(portalAttachmentInterceptor())
  async staffReply(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PortalMessageReplyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachmentPath = await this.ccp.storeOptionalUpload(tenantId, file);
    return this.ccp.staffReplyToMessage(tenantId, actorId, id, dto.body, attachmentPath);
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

  @Get('messages/:id/attachment')
  @RequirePermissions(PORTAL_PERMISSIONS.VIEW_MESSAGES)
  @ApiOperation({ summary: 'Download a portal message attachment (staff)' })
  staffDownloadMessageAttachment(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return this.ccp.staffDownloadMessageAttachment(tenantId, id, res);
  }

  @Get('disputes')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_DISPUTES)
  @ApiOperation({ summary: 'List customer invoice disputes' })
  disputes(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: StaffDisputeQueryDto,
  ) {
    return this.ccp.staffListDisputes(tenantId, query);
  }

  @Get('disputes/:id')
  @RequirePermissions(PORTAL_PERMISSIONS.MANAGE_DISPUTES)
  @ApiOperation({ summary: 'Get one customer invoice dispute' })
  disputeDetail(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ccp.staffGetDispute(tenantId, id);
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
    @Query() query: StaffCreditLimitRequestQueryDto,
  ) {
    return this.ccp.staffListCreditLimitRequests(tenantId, {
      page: query.page,
      limit: query.limit,
      party_id: query.party_id,
      status: query.status,
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
