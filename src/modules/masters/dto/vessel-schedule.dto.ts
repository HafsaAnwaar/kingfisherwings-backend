import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateVesselScheduleDto {
  @ApiProperty()
  @IsString()
  @Length(1, 50)
  voyage_number!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shipping_line_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  pol_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  pod_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  remarks?: string;
}

export class UpdateVesselScheduleDto extends PartialType(CreateVesselScheduleDto) {}

export class VesselScheduleQueryDto {
  @ApiPropertyOptional({ description: 'Filter schedules with ETD on/after this date' })
  @IsOptional()
  @IsDateString()
  etd_from?: string;

  @ApiPropertyOptional({ description: 'Filter schedules with ETD on/before this date' })
  @IsOptional()
  @IsDateString()
  etd_to?: string;

  @ApiPropertyOptional({ description: 'Filter schedules with ETA on/after this date' })
  @IsOptional()
  @IsDateString()
  eta_from?: string;

  @ApiPropertyOptional({ description: 'Filter schedules with ETA on/before this date' })
  @IsOptional()
  @IsDateString()
  eta_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voyage_number?: string;
}
