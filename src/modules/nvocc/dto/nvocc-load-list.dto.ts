import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NvoccLoadListCargoStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateNvoccLoadListItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  container_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  seal_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pieces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gross_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marks_numbers?: string;

  @ApiPropertyOptional({ enum: NvoccLoadListCargoStatus })
  @IsOptional()
  @IsEnum(NvoccLoadListCargoStatus)
  cargo_status?: NvoccLoadListCargoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  cargo_received_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  stuffing_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  vessel_loaded_date?: string;
}

export class AssignLoadListContainerDto {
  @ApiProperty()
  @IsString()
  @MaxLength(20)
  container_number: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  seal_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  container_type_id?: string;
}
