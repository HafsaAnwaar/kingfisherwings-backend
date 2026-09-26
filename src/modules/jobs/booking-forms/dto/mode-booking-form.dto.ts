import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CargoCategory,
  CcDirection,
  JobBookingPartyKind,
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
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class BookingFormPartyDto {
  @ApiProperty({ enum: JobBookingPartyKind })
  @IsEnum(JobBookingPartyKind)
  party_kind!: JobBookingPartyKind;

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

export class ContainerSizeLineDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional({ example: "40HC" })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  iso_size?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  count!: number;
}

export class AirPalletLineDto {
  @ApiProperty({ example: "PMC" })
  @IsString()
  @MaxLength(30)
  pallet_type!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  count!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  length_cm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  width_cm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height_cm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight_kg?: number;
}

/** Shared optional fields for mode booking forms. */
export class ModeBookingFormBaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_of_request?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  client_booking_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voyage_ref?: string;

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

  @ApiPropertyOptional({ enum: CargoCategory })
  @IsOptional()
  @IsEnum(CargoCategory)
  cargo_category?: CargoCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_dg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dg_class?: string;

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
  volume_cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  pieces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insurance_details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  request_details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_commercial_invoice?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_packing_list?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_bl_awb_copy?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_carnet?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_vehicle_title?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_msds?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_dangerous_goods_declaration?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_health_veterinary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attach_fda_moh?: boolean;

  @ApiPropertyOptional({ type: [BookingFormPartyDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingFormPartyDto)
  parties?: BookingFormPartyDto[];

  @ApiPropertyOptional({ description: "When true, validates and marks form complete" })
  @IsOptional()
  @IsBoolean()
  mark_complete?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consent_accepted?: boolean;
}

export class UpsertSeaFclBookingFormDto extends ModeBookingFormBaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pol?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shipper_owned_container?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  teu_count?: number;

  @ApiPropertyOptional({ type: [ContainerSizeLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContainerSizeLineDto)
  containers?: ContainerSizeLineDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  incoterms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  freight_terms?: string;
}

export class UpsertSeaLclBookingFormDto extends ModeBookingFormBaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pol?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  cfs_warehouse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  incoterms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  freight_terms?: string;
}

export class UpsertLandBookingFormDto extends ModeBookingFormBaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin_city_country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  dest_city_country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  vehicle_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  incoterms?: string;
}

export class UpsertRoadFreightBookingFormDto extends UpsertLandBookingFormDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  border_crossing?: string;
}

export class UpsertCourierBookingFormDto extends ModeBookingFormBaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin_city_country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  dest_city_country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tracking_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;
}

export class CcCargoLineInputDto {
  @ApiPropertyOptional({ example: "Cotton apparel" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: "620342" })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  hs_code?: string;

  @ApiPropertyOptional({ example: "CN" })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country_of_origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: "PCS" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  value_amount?: number;

  @ApiPropertyOptional({ example: "USD" })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency_code?: string;
}

/** Customs clearance intake form — broker/customer data for CUSTOMS_CLEARANCE jobs. */
export class UpsertCustomsClearanceBookingFormDto extends ModeBookingFormBaseDto {
  @ApiPropertyOptional({ enum: CcDirection, default: CcDirection.IMPORT })
  @IsOptional()
  @IsEnum(CcDirection)
  direction?: CcDirection;

  @ApiPropertyOptional({ example: "Karachi Port / PICT" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  border_or_port?: string;

  @ApiPropertyOptional({ example: "BOE", description: "Entry / filing type (BOE, SB, …)" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  entry_type?: string;

  @ApiPropertyOptional({ example: "Home consumption" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  declaration_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  port_of_entry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  port_of_exit?: string;

  @ApiPropertyOptional({ example: "CN" })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country_of_origin?: string;

  @ApiPropertyOptional({ example: "PK" })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country_of_destination?: string;

  @ApiPropertyOptional({ example: "CIF" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  incoterms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  invoice_value_amount?: number;

  @ApiPropertyOptional({ example: "USD" })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  invoice_currency?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Optional linked freight job for the same shipment",
  })
  @IsOptional()
  @IsUUID()
  freight_job_id?: string;

  @ApiPropertyOptional({ type: [CcCargoLineInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CcCargoLineInputDto)
  cargo_lines?: CcCargoLineInputDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional({ description: "Certificate of Origin attached" })
  @IsOptional()
  @IsBoolean()
  attach_coo?: boolean;

  @ApiPropertyOptional({ description: "Power of Attorney / CHA authorization attached" })
  @IsOptional()
  @IsBoolean()
  attach_poa?: boolean;

  @ApiPropertyOptional({ description: "Permits / licenses attached" })
  @IsOptional()
  @IsBoolean()
  attach_permit?: boolean;
}
