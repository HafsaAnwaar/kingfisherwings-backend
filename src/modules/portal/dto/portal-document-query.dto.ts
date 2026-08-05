import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { PortalDocumentType } from '@prisma/client';

export class PortalDocumentQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ enum: ['job', 'invoice'] })
  @IsOptional()
  @IsIn(['job', 'invoice'])
  source?: 'job' | 'invoice';

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter job documents to one shipment.' })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({ enum: PortalDocumentType })
  @IsOptional()
  @IsEnum(PortalDocumentType)
  portal_document_type?: PortalDocumentType;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
