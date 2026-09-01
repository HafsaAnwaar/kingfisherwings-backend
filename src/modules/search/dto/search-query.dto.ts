import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from "class-validator";

const SEARCH_TYPES = ["jobs", "quotations", "parties", "invoices"] as const;
export type SearchEntityType = (typeof SEARCH_TYPES)[number];

/**
 * Global search (Week 6) — free-text plus optional structured filters
 * covering the common freight lookup params (ref / party / dates / type / status / ports…).
 */
export class SearchQueryDto {
  @ApiProperty({
    example: "KFW/AE",
    description: "Free-text search across jobs, quotations, parties, invoices",
  })
  @IsString()
  @MinLength(2)
  q!: string;

  @ApiPropertyOptional({
    example: "jobs,quotations,parties,invoices",
    description: "Comma-separated entity types (default: all)",
  })
  @IsOptional()
  @IsString()
  types?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // Structured filters (optional)
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  job_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hawb_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mawb_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hbl_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mbl_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  booking_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  container_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quotation_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  created_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  created_to?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hs_code?: string;
}

export function parseSearchTypes(types?: string): SearchEntityType[] {
  if (!types) {
    return [...SEARCH_TYPES];
  }

  const requested = types.split(",").map((t) => t.trim().toLowerCase());
  return SEARCH_TYPES.filter((t) => requested.includes(t));
}
