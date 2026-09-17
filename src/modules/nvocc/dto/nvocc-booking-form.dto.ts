import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartyEntityKind, NvoccBookingPartyKind } from "@prisma/client";
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gross_weight_kg?: number;

  @ApiProperty({ example: "Jebel Ali" })
  @IsString()
  @Length(1, 100)
  pol!: string;

  @ApiProperty({ example: "Karachi" })
  @IsString()
  @Length(1, 100)
  pod!: string;

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

  @ApiProperty()
  @IsString()
  @Length(1, 500)
  commodity!: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  activity_sector?: string;

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

  @ApiProperty({ type: [NvoccBookingFormPartyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NvoccBookingFormPartyDto)
  parties!: NvoccBookingFormPartyDto[];

  @ApiPropertyOptional({
    description: "When true, marks form complete and advances workflow",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  mark_complete?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  admin_override?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stage_override_reason?: string;
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
