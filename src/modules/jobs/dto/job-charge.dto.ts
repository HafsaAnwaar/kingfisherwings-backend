import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateIf,
} from "class-validator";

export class CreateJobChargeDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  charge_code_id!: string;

  @ApiProperty({ example: "Ocean Freight" })
  @IsString()
  @Length(1, 300)
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ example: 850 })
  @IsNumber()
  @Min(0)
  unit_price!: number;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchange_rate?: number;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  tax_rate_id?: string;

  @ApiPropertyOptional({
    default: false,
    description: "Cost line (to a supplier) if true; revenue line if false.",
  })
  @IsOptional()
  @IsBoolean()
  is_cost?: boolean;

  @ApiPropertyOptional({
    default: false,
    description:
      "Provisional estimate — excluded from confirmed P&L until confirmed.",
  })
  @IsOptional()
  @IsBoolean()
  is_provisional?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_billable?: boolean;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Supplier Party — only meaningful for cost lines.",
  })
  @IsOptional()
  @IsUUID()
  party_id?: string;
}

export class UpdateJobChargeDto extends PartialType(CreateJobChargeDto) {}

export class GetJobChargesDto {
  @ApiPropertyOptional({
    description: "Pull revenue lines from linked quotation (created_from_quote_id)",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  from_quotation?: boolean;

  @ApiPropertyOptional({
    description: "Pull party standard charges for shipper / billing party",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  from_party_standard?: boolean;
}

export class CopyJobChargesDto {
  @ApiPropertyOptional({ format: "uuid", description: "Copy from another job" })
  @ValidateIf((o: CopyJobChargesDto) => !o.from_shipment_id && !o.from_quotation_id)
  @IsUUID()
  from_job_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Copy from a shipment's charge lines",
  })
  @IsOptional()
  @IsUUID()
  from_shipment_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Copy from quotation line items",
  })
  @IsOptional()
  @IsUUID()
  from_quotation_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  copy_sale?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  copy_cost?: boolean;
}
