import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

/**
 * Simple create payload: label is enough.
 * Frontend may also send `code`, `maps_to_system_status`, or `is_active`
 * (forbidNonWhitelisted); extras are accepted and safely defaulted.
 */
export class CreateStatusCatalogDto {
  @ApiProperty({
    example: "Customs hold",
    description: "Display label shown in status dropdowns",
  })
  @IsString()
  @MaxLength(120)
  label!: string;

  @ApiPropertyOptional({
    description:
      "Optional catalog code. Auto-generated from label when omitted (e.g. CUSTOMS_HOLD).",
    example: "CUSTOMS_HOLD",
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  code?: string;

  @ApiPropertyOptional({
    description:
      "Optional system status for workflow gates. Defaults to IN_PROGRESS (jobs/shipments) or SUBMITTED (quotations). Not required for the UI.",
    example: "IN_PROGRESS",
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  maps_to_system_status?: string;

  @ApiPropertyOptional({
    description: "Ignored on create — new statuses are always active and listed.",
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_terminal?: boolean;

  @ApiPropertyOptional({ default: 200 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}

export class UpdateStatusCatalogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  maps_to_system_status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_terminal?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ChangeStatusByCodeDto {
  @ApiProperty({
    description: "Catalog code (system or custom)",
    example: "CUSTOMS_HOLD",
  })
  @IsString()
  @MaxLength(40)
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
