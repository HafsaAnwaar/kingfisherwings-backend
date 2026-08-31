import {
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
import { DocumentationUploadType } from '@prisma/client';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { DOCUMENTATION_PERMISSIONS } from './constants/documentation-permission.constants';
import { DocumentationUploadService } from './documentation-upload.service';

@ApiTags('Documentation — Uploads')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('documentation/uploads')
export class DocumentationUploadController {
  constructor(private readonly service: DocumentationUploadService) {}

  @Get('templates/:upload_type')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.UPLOAD)
  template(@Param('upload_type') uploadType: DocumentationUploadType) {
    return this.service.getTemplate(uploadType);
  }

  @Get('batches/:id/errors')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.UPLOAD)
  errors(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getBatchErrors(tenantId, id);
  }

  @Post('container-numbers')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.UPLOAD)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  containerNumbers(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.ingest(tenantId, 'CONTAINER_NUMBERS', file, actorId);
  }

  @Post('container-transport')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.UPLOAD)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  containerTransport(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.ingest(tenantId, 'CONTAINER_TRANSPORT', file, actorId);
  }

  @Post('dpworld-tracking')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.UPLOAD)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  dpworld(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.ingest(tenantId, 'DPWORLD_TRACKING', file, actorId);
  }

  @Post('truck-positions')
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.UPLOAD)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  truckPositions(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.ingest(tenantId, 'TRUCK_POSITIONS', file, actorId);
  }
}
