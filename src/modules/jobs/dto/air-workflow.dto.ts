import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NvoccBookingPartyKind, PartyEntityKind } from "@prisma/client";
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
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class AirWorkflowOverrideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  admin_override?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stage_override_reason?: string;
}

export class AirBookingFormPartyDto {
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

export class UpsertAirBookingFormDto extends AirWorkflowOverrideDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  air_pallet_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  pieces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  chargeable_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_handling?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_dg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  flight_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  origin_airport_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dest_airport_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  arrival_flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mawb_from_origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  agent_at_origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  delivery_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  customs_value?: number;

  @ApiPropertyOptional({ type: [AirBookingFormPartyDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirBookingFormPartyDto)
  parties?: AirBookingFormPartyDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  mark_complete?: boolean;
}

export class MarkAirInvoiceSentDto extends AirWorkflowOverrideDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  invoice_id?: string;
}

export class CreateAirUldRequestDto extends AirWorkflowOverrideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  airline_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  flight_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  warehouse_cfs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  cutoff_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  uld_count?: number;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  air_pallet_type_id?: string;
}

export class AllocateUldDto extends AirWorkflowOverrideDto {
  @ApiPropertyOptional({
    description: "Override count; defaults to request uld_count",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;
}
