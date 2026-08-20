import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HrTimesheetStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { HrPaginationQueryDto } from './hr-employee.dto';

export class CreateTimesheetDto {
  @ApiProperty()
  @IsUUID()
  employee_id!: string;

  @ApiProperty()
  @IsDateString()
  work_date!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(24)
  hours!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  overtime_hours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: HrTimesheetStatus })
  @IsOptional()
  @IsEnum(HrTimesheetStatus)
  status?: HrTimesheetStatus;
}

export class UpdateTimesheetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(24)
  hours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  overtime_hours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: HrTimesheetStatus })
  @IsOptional()
  @IsEnum(HrTimesheetStatus)
  status?: HrTimesheetStatus;
}

export class AttendanceDto {
  @ApiProperty()
  @IsUUID()
  employee_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  work_date?: string;
}

export class ExportTimesheetPayrollDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  payroll_year!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  payroll_month!: number;
}

export class TimesheetQueryDto extends HrPaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: HrTimesheetStatus })
  @IsOptional()
  @IsEnum(HrTimesheetStatus)
  status?: HrTimesheetStatus;
}

export class MissingTimesheetQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;
}
