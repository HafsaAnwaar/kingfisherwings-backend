import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DocumentationBoeStatus, DocumentationBoeType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { DocumentationPaginationDto } from './documentation-pagination.dto';

export class BoeDashboardQueryDto extends DocumentationPaginationDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ enum: DocumentationBoeStatus })
  @IsOptional()
  @IsEnum(DocumentationBoeStatus)
  status?: DocumentationBoeStatus;

  @ApiPropertyOptional({ enum: DocumentationBoeType })
  @IsOptional()
  @IsEnum(DocumentationBoeType)
  boe_type?: DocumentationBoeType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;
}

export class CreateBoeRecordDto {
  @ApiProperty({ example: 'BOE-2026-001' })
  @IsString()
  @Length(1, 50)
  boe_number!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  boe_date?: string;

  @ApiPropertyOptional({ enum: DocumentationBoeType })
  @IsOptional()
  @IsEnum(DocumentationBoeType)
  boe_type?: DocumentationBoeType;

  @ApiPropertyOptional({ enum: DocumentationBoeStatus })
  @IsOptional()
  @IsEnum(DocumentationBoeStatus)
  status?: DocumentationBoeStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customs_office?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  port_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  party_id?: string;
}

export class UpdateBoeRecordDto extends PartialType(CreateBoeRecordDto) {}
