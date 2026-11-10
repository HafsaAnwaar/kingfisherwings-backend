import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";

/** 1st / 2nd (and further) vessel / flight legs. */
export class JobTrackingLegDto {
  @ApiPropertyOptional({ example: 1, description: "1 = first leg, 2 = second leg" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  leg_no?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  voyage_number?: string;

  @ApiPropertyOptional({ description: "IMO number" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  imo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  pol?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  pod?: string;

  /** Air legs — FE echoes these on save; stored in legs JSON. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  airline_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  arrival_flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mawb_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hawb_number?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  flight_date?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  flight_status?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  etd?: string | null;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  eta?: string | null;
}

/**
 * Port of call row — typically origin + dest (and optional tranship),
 * each with ETA/ATA, ETD/ATD, vessel.
 */
export class JobTrackingPortOfCallDto {
  @ApiPropertyOptional({
    example: "ORIGIN",
    description: "ORIGIN | DEST | TRANSHIP | CALL",
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  port_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  un_locode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  ata?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  atd?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  voyage_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class JobTrackingContainerEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  event_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  occurred_at?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  place?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  container_no?: string;
}

/** Cargo Info → Arrival Report Status table row. */
export class ArrivalReportStatusRowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  status?: string;

  @ApiPropertyOptional({ description: "Sending time" })
  @IsOptional()
  @IsDateString()
  sending_time?: string | null;

  @ApiPropertyOptional({ description: "Receipt time" })
  @IsOptional()
  @IsDateString()
  receipt_time?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  container_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  sub_container_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  voyage_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  imo?: string;
}

/** Cargo Info → Customs Status table row. */
export class CustomsStatusRowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  carrier_operator?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  customs_released?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sub_customs_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  volume?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  customs_declaration_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  customs_inspection_status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  customs_inspection_time?: string | null;
}

/** Pre-manifest → Manifest Status table row. */
export class ManifestStatusRowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sub_customs_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  sending_time?: string | null;

  @ApiPropertyOptional({ description: "Receipt / receiving time" })
  @IsOptional()
  @IsDateString()
  receipt_receiving_time?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  container_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  voyage_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  imo?: string;
}

/** QTY / G.W. / VOL summary (+ optional per-line / per-container). */
export class QtyGwVolDto {
  @ApiPropertyOptional({ description: "Package / piece quantity" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gross_weight?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  net_weight?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  volume?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  chargeable_weight?: number | null;

  @ApiPropertyOptional({ example: "PKG" })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  qty_unit?: string;

  @ApiPropertyOptional({ example: "KG" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  weight_unit?: string;

  @ApiPropertyOptional({ example: "CBM" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  volume_unit?: string;

  @ApiPropertyOptional({ description: "Optional per-container / line breakdown" })
  @IsOptional()
  @IsArray()
  lines?: Record<string, unknown>[];
}

export class UpsertJobTrackingProfileDto {
  @ApiPropertyOptional({ description: "B/L number shown on track header" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  bl_number?: string | null;

  @ApiPropertyOptional({ description: "Origin port display" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin_port?: string | null;

  @ApiPropertyOptional({ description: "Alias of origin_port" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin_label?: string | null;

  @ApiPropertyOptional({ description: "Destination port display" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  dest_port?: string | null;

  @ApiPropertyOptional({ description: "Alias of dest_port" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  dest_label?: string | null;

  @ApiPropertyOptional({ description: "AT BEFORE datetime" })
  @IsOptional()
  @IsDateString()
  at_before?: string | null;

  @ApiPropertyOptional({ description: "Terminal cut-off time" })
  @IsOptional()
  @IsDateString()
  terminal_cutoff_at?: string | null;

  /**
   * Air header fields — FE often PATCHes the full air show/track payload.
   * Persisted into detailed_data so forbidNonWhitelisted does not 400.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  airline_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  flight_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  arrival_flight_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mawb_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hawb_number?: string | null;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  flight_date?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  flight_status?: string | null;

  @ApiPropertyOptional({
    type: [JobTrackingLegDto],
    description: "1st leg = leg_no 1, 2nd leg = leg_no 2",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobTrackingLegDto)
  legs?: JobTrackingLegDto[];

  @ApiPropertyOptional({
    type: [JobTrackingPortOfCallDto],
    description:
      "Port of call rows — include origin + dest with eta/ata, etd/atd, vessel_name",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobTrackingPortOfCallDto)
  port_of_call?: JobTrackingPortOfCallDto[];

  @ApiPropertyOptional({ type: [JobTrackingContainerEventDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobTrackingContainerEventDto)
  container_events?: JobTrackingContainerEventDto[];

  @ApiPropertyOptional({
    type: [ArrivalReportStatusRowDto],
    description: "Cargo Info → Arrival Report Status",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArrivalReportStatusRowDto)
  arrival_report?: ArrivalReportStatusRowDto[];

  @ApiPropertyOptional({
    type: [CustomsStatusRowDto],
    description: "Cargo Info → Customs Status",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomsStatusRowDto)
  customs_status?: CustomsStatusRowDto[];

  @ApiPropertyOptional({
    description:
      "Cargo Info → Detailed Data (job snapshot + staff overrides as key/values)",
  })
  @IsOptional()
  @IsObject()
  detailed_data?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: [ManifestStatusRowDto],
    description: "Pre-manifest → Manifest Status",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManifestStatusRowDto)
  pre_manifest?: ManifestStatusRowDto[];

  @ApiPropertyOptional({ type: QtyGwVolDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => QtyGwVolDto)
  qty_gw_vol?: QtyGwVolDto;
}
