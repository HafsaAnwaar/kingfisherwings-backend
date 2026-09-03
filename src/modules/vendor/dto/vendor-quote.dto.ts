import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class VendorQuoteLineDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  line_id?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unit_price!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}

export class SendJobToVendorDto {
  @ApiPropertyOptional({
    format: "uuid",
    description: "Vendor Party id (alias: vendor_id, party_id)",
  })
  @IsOptional()
  @IsUUID()
  vendor_party_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  vendor_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({
    description:
      "Tenant cost offer total. Sets cost_total and seeds a line if lines omitted.",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  proposed_total?: number;

  @ApiPropertyOptional({ type: [VendorQuoteLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorQuoteLineDto)
  lines?: VendorQuoteLineDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  staff_notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @ApiPropertyOptional({ example: "AED" })
  @IsOptional()
  @IsString()
  currency_code?: string;
}

/** Vendor one-shot price OR counter with lines (legacy price endpoint). */
export class PriceVendorQuoteDto {
  @ApiPropertyOptional({ type: [VendorQuoteLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorQuoteLineDto)
  lines?: VendorQuoteLineDto[];

  @ApiPropertyOptional({
    description: "Vendor counter / offered total (jumps cost_total immediately).",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  proposed_total?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  vendor_notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

export class VendorCounterOfferDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  message!: string;

  @ApiProperty({
    description: "Vendor counter-offer total — updates cost_total immediately.",
  })
  @IsNumber()
  @Min(0)
  proposed_total!: number;

  @ApiPropertyOptional({ type: [VendorQuoteLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorQuoteLineDto)
  proposed_lines?: VendorQuoteLineDto[];
}

export class VendorReviseAndSendDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  proposed_total?: number;

  @ApiPropertyOptional({ type: [VendorQuoteLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorQuoteLineDto)
  lines?: VendorQuoteLineDto[];
}

export class VendorNegotiationAcceptDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}

export class VendorNegotiationRejectDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  message!: string;

  @ApiPropertyOptional({
    description: "If true, close as DISAPPROVED; else return to VENDOR_REVIEW.",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  terminal?: boolean;
}

export class VendorQuoteQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
