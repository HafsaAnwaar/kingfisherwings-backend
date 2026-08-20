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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import 'multer';
import { SkipStaffJwt } from '../../common/decorators/skip-staff-jwt.decorator';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { VENDOR_PERMISSIONS } from './constants/vendor-permission.constants';
import { CurrentVendor } from './decorators/vendor.decorators';
import {
  CreateVendorDisputeDto,
  ReviewVendorDisputeDto,
  StaffVendorDisputeQueryDto,
  VendorDisputeQueryDto,
} from './dto/vendor-ccp.dto';
import { VendorAuthGuard } from './guards/vendor-auth.guard';
import { CurrentVendorUser } from './interfaces/vendor-auth.interfaces';
import { VendorCcpService } from './vendor-ccp.service';

const ATTACHMENT_MIME = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);

@ApiTags('Vendor Disputes')
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller('vendor/disputes')
export class VendorDisputesController {
  constructor(private readonly ccp: VendorCcpService) {}

  @Post()
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!ATTACHMENT_MIME.has(file.mimetype)) {
          return callback(new BadRequestException('Only PDF, JPEG, and PNG files are accepted.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @CurrentVendor() user: CurrentVendorUser,
    @Body() dto: CreateVendorDisputeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachmentPath = await this.ccp.storeOptionalUpload(user.tenantId, file);
    return this.ccp.createDispute(user, dto, attachmentPath);
  }

  @Get()
  @ApiOperation({ summary: 'List my vendor disputes' })
  list(@CurrentVendor() user: CurrentVendorUser, @Query() query: VendorDisputeQueryDto) {
    return this.ccp.listMyDisputes(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Vendor dispute detail' })
  detail(@CurrentVendor() user: CurrentVendorUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.ccp.getMyDispute(user, id);
  }
}

@ApiTags('Admin — Vendor Disputes')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('vendor-admin/disputes')
export class VendorAdminDisputesController {
  constructor(private readonly ccp: VendorCcpService) {}

  @Get()
  @RequirePermissions(VENDOR_PERMISSIONS.MANAGE_DISPUTES)
  @ApiOperation({ summary: 'Staff inbox of vendor invoice disputes' })
  list(@CurrentUser('tenantId') tenantId: string, @Query() query: StaffVendorDisputeQueryDto) {
    return this.ccp.staffList(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(VENDOR_PERMISSIONS.MANAGE_DISPUTES)
  @ApiOperation({ summary: 'Get one vendor invoice dispute' })
  detail(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ccp.staffGet(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions(VENDOR_PERMISSIONS.MANAGE_DISPUTES)
  @ApiOperation({ summary: 'Review / resolve a vendor dispute' })
  review(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewVendorDisputeDto,
  ) {
    return this.ccp.staffReview(tenantId, actorId, id, dto);
  }
}
