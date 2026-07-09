import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { JobType } from '@prisma/client';

export class QuotationAnalyticsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;
}
