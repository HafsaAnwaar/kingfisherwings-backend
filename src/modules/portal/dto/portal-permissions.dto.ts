import { ApiProperty } from '@nestjs/swagger';
import { PortalDocumentType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsBoolean, IsEnum, ValidateNested } from 'class-validator';
import { DEFAULT_PORTAL_DOCUMENT_TYPES } from '../constants/portal-permission.constants';
export class PortalPermissionEntryDto {
  @ApiProperty({ enum: PortalDocumentType })
  @IsEnum(PortalDocumentType)
  document_type!: PortalDocumentType;

  @ApiProperty({ default: true })
  @IsBoolean()
  can_view!: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  can_download!: boolean;
}

export class UpsertPortalPermissionsDto {
  @ApiProperty({ type: [PortalPermissionEntryDto] })
  @ArrayMinSize(DEFAULT_PORTAL_DOCUMENT_TYPES.length)
  @ValidateNested({ each: true })
  @Type(() => PortalPermissionEntryDto)
  permissions!: PortalPermissionEntryDto[];
}