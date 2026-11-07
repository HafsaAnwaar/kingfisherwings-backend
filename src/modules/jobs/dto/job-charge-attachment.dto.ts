import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  JobChargeAttachmentPurpose,
  JobChargeAttachmentSide,
} from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";

function optionalBool({ value }: { value: unknown }): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

export class CreateJobChargeAttachmentDto {
  @ApiPropertyOptional({
    description: "Required when no multipart file is sent (metadata-only create)",
  })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  file_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  s3_key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value == null || value === "" ? undefined : Number(value),
  )
  @IsInt()
  @Min(0)
  file_size?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  mime_type?: string;

  @ApiPropertyOptional({
    enum: JobChargeAttachmentSide,
    default: JobChargeAttachmentSide.CHARGE,
  })
  @IsOptional()
  @IsEnum(JobChargeAttachmentSide)
  side?: JobChargeAttachmentSide;

  @ApiPropertyOptional({
    enum: JobChargeAttachmentPurpose,
    default: JobChargeAttachmentPurpose.GENERAL,
    description:
      "GENERAL = supporting doc; PAYMENT_PROOF = may auto-mark party amount paid when tenant config allows",
  })
  @IsOptional()
  @IsEnum(JobChargeAttachmentPurpose)
  purpose?: JobChargeAttachmentPurpose;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(optionalBool)
  @IsBoolean()
  visible_to_customer?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(optionalBool)
  @IsBoolean()
  visible_to_vendor?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(optionalBool)
  @IsBoolean()
  downloadable_by_customer?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(optionalBool)
  @IsBoolean()
  downloadable_by_vendor?: boolean;

  @ApiPropertyOptional({
    description: "Optional amount when purpose=PAYMENT_PROOF (defaults to charge balance)",
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === "") return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  })
  amount_claimed?: number;

  @ApiPropertyOptional({ example: "2026-11-07" })
  @IsOptional()
  @IsString()
  payment_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
