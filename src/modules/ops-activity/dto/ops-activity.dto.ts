import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OpsEntityType, OpsUploaderSide } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export const OPS_ENTITY_TYPES = [
  "ENQUIRY",
  "QUOTATION",
  "SHIPMENT",
  "JOB",
] as const;

export class OpsEntityParamDto {
  @ApiProperty({ enum: OpsEntityType })
  @IsEnum(OpsEntityType)
  entityType!: OpsEntityType;
}

export class CreateOpsFollowUpDto {
  @ApiProperty({ example: "2026-10-15" })
  @IsDateString()
  due_date!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  subject!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  owner_id?: string;
}

export class CreateOpsAttachmentMetaDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  file_name!: string;

  @ApiProperty({ description: "R2/storage key after upload (or use multipart upload endpoint)" })
  @IsString()
  @MaxLength(500)
  storage_key!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  file_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  mime_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  size_bytes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: "Share with customer portal (default true)",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  visible_to_customer?: boolean;

  @ApiPropertyOptional({
    description: "Share with vendor portal (default true)",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  visible_to_vendor?: boolean;

  @ApiPropertyOptional({ enum: OpsUploaderSide })
  @IsOptional()
  @IsEnum(OpsUploaderSide)
  uploader_side?: OpsUploaderSide;
}

export class CreateOpsReferenceDto {
  @ApiProperty({ example: "BOOKING_REF" })
  @IsString()
  @MaxLength(80)
  ref_type!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(300)
  ref_value!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOpsTagDto {
  @ApiProperty({ example: "urgent" })
  @IsString()
  @MaxLength(100)
  tag!: string;
}

export class CreateOpsLinkDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  url!: string;
}

export class CreateOpsComplaintDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  subject!: string;

  @ApiProperty()
  @IsString()
  body!: string;
}

export class PatchOpsComplaintDto {
  @ApiPropertyOptional({ enum: ["OPEN", "IN_PROGRESS", "CLOSED"] })
  @IsOptional()
  @IsIn(["OPEN", "IN_PROGRESS", "CLOSED"])
  status?: string;
}
