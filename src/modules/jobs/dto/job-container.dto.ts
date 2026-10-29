import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { JobContainerKind } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

const CONTAINER_STATUSES = [
  "EMPTY",
  "STUFFED",
  "GATED_IN",
  "LOADED",
  "IN_TRANSIT",
  "DISCHARGED",
  "RETURNED",
] as const;

export class CreateJobContainerDto {
  @ApiPropertyOptional({
    format: "uuid",
    deprecated: true,
    description: "Prefer container_type_code (e.g. 20GP). UUID not required.",
  })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiPropertyOptional({
    example: "20GP",
    description: "Container type code or name (preferred over UUID)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  container_type_code?: string;

  @ApiPropertyOptional({
    example: "40HC",
    description: "Alias for container_type_code",
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  iso_size?: string;

  @ApiPropertyOptional({ enum: JobContainerKind, default: "ACTUAL" })
  @IsOptional()
  @IsEnum(JobContainerKind)
  container_kind?: JobContainerKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  line_no?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  container_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  seal_number?: string;

  @ApiPropertyOptional({ description: "Actual seal (defaults to seal_number)" })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  actual_seal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  packages?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  tare_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_payload?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cubic_capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  net_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  vgm_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  chargeable_units?: number;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Attach info shipment",
  })
  @IsOptional()
  @IsUUID()
  shipment_id?: string;

  @ApiPropertyOptional({ enum: CONTAINER_STATUSES, default: "EMPTY" })
  @IsOptional()
  @IsIn(CONTAINER_STATUSES)
  status?: (typeof CONTAINER_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  gate_in_at?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_soc?: boolean;
}

export class UpdateJobContainerDto extends PartialType(CreateJobContainerDto) {}

export class BulkContainerItemDto extends CreateJobContainerDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}

export class BulkJobContainersDto {
  @ApiProperty({ type: [BulkContainerItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkContainerItemDto)
  containers!: BulkContainerItemDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  replace_all?: boolean;
}

export class ConfirmContainerUploadDto {
  @ApiProperty({ type: [CreateJobContainerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateJobContainerDto)
  containers!: CreateJobContainerDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  replace_all?: boolean;
}

export class PasteContainerUploadDto {
  @ApiProperty()
  @IsString()
  @Length(1, 500_000)
  content!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  replace_all?: boolean;
}

export class SyncContainersFromSubJobsDto {
  @ApiPropertyOptional({
    description:
      "If true, only update containers whose container_number matches a sub-job container",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  matching_only?: boolean;

  @ApiPropertyOptional({
    description: "Include house jobs (parent_job_id children). Default true.",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  include_houses?: boolean;

  @ApiPropertyOptional({
    description: "Only children with is_sub_job=true",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_sub_job_only?: boolean;

  @ApiPropertyOptional({
    description:
      "After sync, roll up pieces/gross_weight/volume_cbm onto master job header",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  rollup_header?: boolean;
}

export class PushContainersToSubJobsDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  matching_only?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  include_houses?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_sub_job_only?: boolean;
}

export class UpdateJobDetailsFromContainerTabDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  pieces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume_cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;
}
