import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { StorageService } from '../shared/storage/storage.service';
import { RolesGuard } from '../modules/users/guards/roles.guard';
import { CurrentUser } from '../modules/users/decorators/current-user.decorator';
import { isSuperAdminPrincipal } from '../common/utils/principal.util';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly storage: StorageService) {}

  @Get(':tenantId/:filename')
  @ApiOperation({
    summary: 'Download a stored file (local or S3)',
    description: 'Caller tenant must match URL tenantId. Supports ?s3_key= for S3-backed files.',
  })
  async download(
    @CurrentUser() principal: unknown,
    @CurrentUser('tenantId') userTenantId: string | undefined,
    @Param('tenantId') tenantId: string,
    @Param('filename') filename: string,
    @Query('s3_key') s3Key: string | undefined,
    @Res() res: Response,
  ) {
    if (isSuperAdminPrincipal(principal) || !userTenantId) {
      throw new NotFoundException('File not found.');
    }

    if (userTenantId !== tenantId) {
      throw new NotFoundException('File not found.');
    }

    const decoded = decodeURIComponent(filename);

    try {
      const file = await this.storage.readByStoredFile(tenantId, {
        file_name: decoded,
        file_url: `${tenantId}/${encodeURIComponent(decoded)}`,
        s3_key: s3Key,
        mime_type: 'application/pdf',
      });
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
      res.send(file.buffer);
    } catch {
      throw new NotFoundException('File not found.');
    }
  }
}
