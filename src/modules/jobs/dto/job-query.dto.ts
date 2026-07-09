import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { JobStatus, JobType } from '@prisma/client';

export class JobQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 200 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  limit: number = 20;

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
}
