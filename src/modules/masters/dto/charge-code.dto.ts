import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from "class-validator";
import { ChargeGroup } from "@prisma/client";

export class CreateChargeCodeDto {
  @ApiProperty({ example: "OFT" })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiProperty({ example: "Ocean Freight" })
  @IsString()
  @Length(2, 200)
  description!: string;

  @ApiPropertyOptional({ enum: ChargeGroup, default: ChargeGroup.OTHER })
  @IsOptional()
  @IsEnum(ChargeGroup)
  charge_group?: ChargeGroup;

  @ApiProperty({
    type: [String],
    example: ["SEA", "AIR"],
    description: "ShipmentMode values this charge applies to.",
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  applicable_modes!: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  tax_applicable?: boolean;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  tax_rate_id?: string;

  @ApiPropertyOptional({
    example: "4001",
    description: "Legacy revenue GL code string.",
  })
  @IsOptional()
  @IsString()
  gl_revenue_code?: string;

  @ApiPropertyOptional({
    example: "5001",
    description: "Legacy cost GL code string.",
  })
  @IsOptional()
  @IsString()
  gl_cost_code?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Linked revenue Chart of Account (Ch.17).",
  })
  @IsOptional()
  @IsUUID()
  gl_revenue_account_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Linked cost Chart of Account (Ch.17).",
  })
  @IsOptional()
  @IsUUID()
  gl_cost_account_id?: string;

  @ApiPropertyOptional({ example: "Per Container" })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_mandatory?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateChargeCodeDto extends PartialType(CreateChargeCodeDto) {}
