import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";

export class JobTrackingLegDto {
  @ApiPropertyOptional()
  @IsOptional()
  leg_no?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  voyage_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class UpsertJobTrackingProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin_label?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  dest_label?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  at_before?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  terminal_cutoff_at?: string | null;

  @ApiPropertyOptional({ type: [JobTrackingLegDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobTrackingLegDto)
  legs?: JobTrackingLegDto[];

  @ApiPropertyOptional({ description: "Port of call rows" })
  @IsOptional()
  @IsArray()
  port_of_call?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  container_events?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  arrival_report?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  customs_status?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  detailed_data?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  pre_manifest?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  qty_gw_vol?: Record<string, unknown>;
}
