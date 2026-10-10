import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BlDocumentStatus } from "@prisma/client";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ArrayMinSize,
} from "class-validator";

export class ChangeShipmentBlStatusDto {
  @ApiProperty({ enum: BlDocumentStatus })
  @IsEnum(BlDocumentStatus)
  bl_status!: BlDocumentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hbl_number?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  hbl_date?: string;
}

export class ChangeShipmentDepartmentDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  department_id!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;
}

export class SplitShipmentDto {
  @ApiPropertyOptional({
    description: "Charge line ids to move to the new shipment; omit to copy all revenue lines",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  charge_ids?: string[];
}

export class MergeShipmentsDto {
  @ApiProperty({ type: [String], format: "uuid" })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  source_shipment_ids!: string[];
}

export class ShipmentEdiActionParam {
  /** e.g. bayan-generate, bayan-submit, ccn-fwb, ccn-submit, eqo-dubai-generate */
  action!: string;
}

export class UpsertShipmentRoutingLegDto {
  @ApiPropertyOptional()
  @IsOptional()
  leg_sequence?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  transport_mode?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  port_id?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voyage_number?: string;
}
