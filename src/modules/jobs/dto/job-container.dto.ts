import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

const CONTAINER_STATUSES = [
  'EMPTY',
  'STUFFED',
  'GATED_IN',
  'LOADED',
  'IN_TRANSIT',
  'DISCHARGED',
  'RETURNED',
] as const;

export class CreateJobContainerDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  container_type_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  container_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  seal_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  tare_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_payload?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cubic_capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  vgm_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cbm?: number;

  @ApiPropertyOptional({ enum: CONTAINER_STATUSES, default: 'EMPTY' })
  @IsOptional()
  @IsIn(CONTAINER_STATUSES)
  status?: (typeof CONTAINER_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  gate_in_at?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_soc?: boolean;
}

export class UpdateJobContainerDto extends PartialType(CreateJobContainerDto) {}
