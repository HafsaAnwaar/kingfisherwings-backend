import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { CustomsClearanceStatus, StorageRateBasis } from "@prisma/client";

const AWB_TYPES = ["Direct", "Back-to-Back", "Consol"];
const FREIGHT_TYPES = ["Prepaid", "Collect"];

export class UpdateAirJobDetailDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  airline_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  origin_airport_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  dest_airport_id?: string;

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
  flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  flight_date?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  screened?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  screening_ref?: string;

  @ApiPropertyOptional({ enum: AWB_TYPES })
  @IsOptional()
  @IsIn(AWB_TYPES)
  awb_type?: string;

  @ApiPropertyOptional({ enum: FREIGHT_TYPES })
  @IsOptional()
  @IsIn(FREIGHT_TYPES)
  freight_type?: string;

  @ApiPropertyOptional({
    default: 167,
    description: "kg per CBM; IATA standard is 167.",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  conversion_factor?: number;

  // ── Air Import (Ch.9.1) ───────────────────────────────────────────────────

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mawb_number_from_origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hawb_number_from_origin_agent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  arrival_flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  actual_eta?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  agent_at_origin_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  notify_party_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  delivery_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  final_destination?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  customs_value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dg_details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_handling_notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customs_entry_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  customs_duty_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  customs_tax_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  customs_clearance_date?: string;

  @ApiPropertyOptional({ enum: CustomsClearanceStatus })
  @IsOptional()
  @IsEnum(CustomsClearanceStatus)
  customs_status?: CustomsClearanceStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  customs_broker_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  storage_start_date?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  storage_free_days?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  storage_rate?: number;

  @ApiPropertyOptional({ enum: StorageRateBasis })
  @IsOptional()
  @IsEnum(StorageRateBasis)
  storage_rate_basis?: StorageRateBasis;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  originating_branch_id?: string;
}
