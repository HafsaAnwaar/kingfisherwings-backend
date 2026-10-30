import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { JobStatus } from "@prisma/client";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

/** PATCH /jobs|shipments/:id/detail/show_all — edit header fields by name/code. */
export class PatchShowAllDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  pieces?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume_cbm?: number | null;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  etd?: string | null;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  eta?: string | null;

  @ApiPropertyOptional({
    format: "date",
    description: "Job date (jobs) or shipment_date (shipments)",
  })
  @IsOptional()
  @IsDateString()
  job_date?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mbl_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hbl_number?: string | null;

  @ApiPropertyOptional({ description: "Origin port name (preferred)" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin_port_name?: string | null;

  @ApiPropertyOptional({ description: "Origin port UN/LOCODE" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  origin_port_code?: string | null;

  @ApiPropertyOptional({ description: "Destination port name (preferred)" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  dest_port_name?: string | null;

  @ApiPropertyOptional({ description: "Destination port UN/LOCODE" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dest_port_code?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  shipper_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shipper_code?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  consignee_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  consignee_code?: string | null;

  @ApiPropertyOptional({
    description: "Billing party (jobs) / customer (shipments)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  billing_party_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  billing_party_code?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  agent_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  agent_code?: string | null;

  @ApiPropertyOptional({ description: "Carrier party name (shipments / routing)" })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  carrier_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  carrier_code?: string | null;

  @ApiPropertyOptional({ description: "Customer name (shipments)" })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  customer_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customer_code?: string | null;
}

export class ChangeJobStatusDto {
  @ApiProperty({
    description:
      "Catalog code (system JobStatus or tenant custom status). Custom codes map via maps_to_system_status.",
    example: "IN_PROGRESS",
  })
  @IsString()
  @MaxLength(40)
  status!: string;

  @ApiPropertyOptional({ description: "Audit reason for the status change" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ReopenJobDto {
  @ApiPropertyOptional({
    enum: JobStatus,
    description: "Target status after reopen (default IN_PROGRESS)",
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class StopJobDto {
  @ApiProperty({ description: "Reason for putting the job on hold" })
  @IsString()
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({
    format: "date-time",
    description: "Optional expected release / resume datetime",
  })
  @IsOptional()
  @IsDateString()
  expected_release_at?: string;
}

export class ResumeJobDto {
  @ApiProperty({ description: "Reason for resuming the job from hold" })
  @IsString()
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({
    enum: JobStatus,
    description: "Target status after resume (default IN_PROGRESS)",
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    description:
      "When true (default), clears expected_release_at. Set false to keep it.",
  })
  @IsOptional()
  @IsBoolean()
  clear_expected_release?: boolean;
}
