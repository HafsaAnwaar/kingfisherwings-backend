import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

const SERVICE_TYPES = ["EXPRESS", "STANDARD", "ECONOMY"];
const LABEL_FORMATS = ["A4_4UP", "A4_6UP", "A4_8UP", "THERMAL"];

export class UpdateCourierJobDetailDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  courier_vendor_id?: string;

  @ApiPropertyOptional({ enum: SERVICE_TYPES })
  @IsOptional()
  @IsIn(SERVICE_TYPES)
  service_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  tracking_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  barcode_value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  length_cm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  width_cm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  height_cm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pickup_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  delivery_address?: string;

  @ApiPropertyOptional({ enum: LABEL_FORMATS })
  @IsOptional()
  @IsIn(LABEL_FORMATS)
  label_format?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  linked_export_job_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  linked_import_job_id?: string;
}

export class ConfirmCourierBookingDto {
  @ApiPropertyOptional({ description: "Override generated tracking number" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  tracking_number?: string;

  @ApiPropertyOptional({ enum: SERVICE_TYPES })
  @IsOptional()
  @IsIn(SERVICE_TYPES)
  service_type?: string;

  @ApiPropertyOptional({ enum: LABEL_FORMATS })
  @IsOptional()
  @IsIn(LABEL_FORMATS)
  label_format?: string;
}

export class ScanCourierCheckpointDto {
  @ApiProperty({
    enum: [
      "PICKED_UP",
      "IN_TRANSIT",
      "AT_DESTINATION_FACILITY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ],
  })
  @IsIn([
    "PICKED_UP",
    "IN_TRANSIT",
    "AT_DESTINATION_FACILITY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ])
  checkpoint!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  barcode_scanned?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scanned_at?: string;
}

export class LinkCourierJobDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  linked_job_id!: string;
}

export class CreateCourierPodDto {
  @ApiProperty()
  @IsDateString()
  actual_delivery_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  delivered_by?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  received_by?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signature_image_path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
