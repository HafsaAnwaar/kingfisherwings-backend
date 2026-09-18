import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  PartyEntityKind,
  NvoccBookingPartyKind,
  NvoccActivitySector,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from "class-validator";

export class NvoccBookingFormPartyDto {
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

  @ApiPropertyOptional({ description: "Email, phone, website, local IDs" })
  @IsOptional()
  @IsString()
  other_details?: string;
}

export class UpsertNvoccBookingFormDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_of_request?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voyage_ref?: string;

  @ApiPropertyOptional({ description: "Booking No (if known) from client" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  client_booking_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gross_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  net_weight_kg?: number;

  @ApiPropertyOptional({ example: "Jebel Ali" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pol?: string;

  @ApiPropertyOptional({ example: "Karachi" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pod?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  shipper_owned_container?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_dg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  teu_count?: number;

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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  attach_commercial_invoice?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  attach_correspondence?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  attach_cod_form?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  attach_licence?: boolean;

  @ApiPropertyOptional({ example: "KINGFISHER" })
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

  @ApiPropertyOptional({ type: [NvoccBookingFormPartyDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NvoccBookingFormPartyDto)
  parties?: NvoccBookingFormPartyDto[];

  @ApiPropertyOptional({
    description:
      "When true, marks form complete. Staff require admin_override (customer portal uses /submit).",
    default: false,
  })
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

export class SubmitNvoccComplianceFormDto extends UpsertNvoccBookingFormDto {
  @ApiProperty({
    description: "Customer must confirm accuracy before submit",
  })
  @IsBoolean()
  consent_accepted!: boolean;
}

export class WorkflowStageOverrideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  admin_override?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stage_override_reason?: string;
}

export const COMPLIANCE_DOC_KINDS = [
  "commercial_invoice",
  "correspondence",
  "cod_form",
  "licence",
] as const;

export type ComplianceDocKind = (typeof COMPLIANCE_DOC_KINDS)[number];
