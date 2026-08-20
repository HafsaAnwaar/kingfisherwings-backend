import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { JobStatus, JobType } from '@prisma/client';
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '../../../common/dto/pagination.dto';

export class JobQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: PAGINATION_DEFAULT_LIMIT, minimum: 1, maximum: PAGINATION_MAX_LIMIT })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  limit: number = PAGINATION_DEFAULT_LIMIT;

  @ApiPropertyOptional({ description: 'Matches job_number, commodity.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional({ description: 'Master jobs only (no parent_job_id).' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  masters_only?: boolean;

  @ApiPropertyOptional({ format: 'uuid', description: 'House jobs under this master.' })
  @IsOptional()
  @IsUUID()
  parent_job_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';

  /** Sea FCL filters (Week 7 / Ch.5.1) */
  @ApiPropertyOptional({ description: 'Filter FCL jobs by container number' })
  @IsOptional()
  @IsString()
  container_number?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter FCL jobs by vessel' })
  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter FCL jobs by shipping line' })
  @IsOptional()
  @IsUUID()
  shipping_line_id?: string;

  @ApiPropertyOptional({ description: 'Filter FCL jobs by voyage number' })
  @IsOptional()
  @IsString()
  voyage_number?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter FCL jobs by container type on assigned containers' })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;
}
