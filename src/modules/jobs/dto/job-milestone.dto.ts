import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateJobMilestoneDto {
  @ApiPropertyOptional({ example: '2026-07-15', description: 'Actual completion date — set this to mark the milestone complete.' })
  @IsOptional()
  @IsDateString()
  actual_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  planned_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCustomMilestoneDto {
  @ApiProperty({ example: 'CUSTOMS_QUERY_RAISED', description: 'Free-form milestone name, for anything outside the standard taxonomy.' })
  @IsString()
  milestone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  planned_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  actual_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
