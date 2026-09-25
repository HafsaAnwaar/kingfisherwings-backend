import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  NvoccActivitySector,
  NvoccBookingPartyKind,
  PartyEntityKind,
  ServiceScope,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { AirPalletLineDto } from "../../dto/air-workflow.dto";

export class AirCompliancePartyDto {
  @ApiProperty({ enum: NvoccBookingPartyKind })
  @IsEnum(NvoccBookingPartyKind)
  party_kind!: NvoccBookingPartyKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  full_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ enum: PartyEntityKind })
  @IsOptional()
  @IsEnum(PartyEntityKind)
  entity_kind?: PartyEntityKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  other_details?: string;
}

/** Air-specific customer compliance booking form (not sea/NVOCC shaped). */
export class UpsertAirComplianceBookingFormDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_of_request?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voyage_ref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  client_booking_no?: string;

  @ApiPropertyOptional({ enum: ServiceScope })
  @IsOptional()
  @IsEnum(ServiceScope)
  service_scope?: ServiceScope;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  origin_door_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dest_door_address?: string;

  @ApiPropertyOptional({ example: "DWC" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  origin_airport_code?: string;

  @ApiPropertyOptional({ example: "RUH" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dest_airport_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  pieces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gross_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  net_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  chargeable_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  volume_cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  pallet_count?: number;

  @ApiPropertyOptional({ type: [AirPalletLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirPalletLineDto)
  pallets?: AirPalletLineDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_dg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  final_use?: string;

  @ApiPropertyOptional({ enum: NvoccActivitySector })
  @IsOptional()
  @IsEnum(NvoccActivitySector)
  activity_sector?: NvoccActivitySector;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insurance_details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lc_bank_details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_commercial_invoice?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_correspondence?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_cod_form?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_licence?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  booking_agent_line?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  agent_requester_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sq_bl_booking_reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  request_details?: string;

  @ApiPropertyOptional({ type: [AirCompliancePartyDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirCompliancePartyDto)
  parties?: AirCompliancePartyDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mark_complete?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consent_accepted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  admin_override?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stage_override_reason?: string;
}

export class SubmitAirComplianceFormDto extends UpsertAirComplianceBookingFormDto {
  @ApiProperty()
  @IsBoolean()
  consent_accepted!: boolean;
}

export const COMPLIANCE_DOC_KINDS = [
  "commercial_invoice",
  "correspondence",
  "cod_form",
  "licence",
] as const;

export type ComplianceDocKind = (typeof COMPLIANCE_DOC_KINDS)[number];
