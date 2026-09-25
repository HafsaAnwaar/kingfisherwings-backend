import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CcDirection, CcWorkflowStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from "class-validator";

export class CcWorkflowOverrideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  admin_override?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  stage_override_reason?: string;
}

export class UpsertCcDetailsDto {
  @ApiPropertyOptional({ enum: CcDirection })
  @IsOptional()
  @IsEnum(CcDirection)
  direction?: CcDirection;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cha_party_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  border_or_port?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  remarks?: string;
}

export class CreateCcCargoLineDto {
  @ApiProperty()
  @IsString()
  @Length(1, 500)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_of_origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  value_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;
}

export class UpdateCcCargoLineDto extends CreateCcCargoLineDto {}

export class ClassifyCcLineDto {
  @ApiProperty()
  @IsString()
  @Length(4, 12)
  hs_code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  permit_notes?: string;
}

export class PatchCcChecklistItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  received?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  job_document_id?: string;
}

export class FileCcEntryDto extends CcWorkflowOverrideDto {
  @ApiPropertyOptional({ example: "BOE" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  entry_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  entry_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shipping_bill_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  filing_date?: string;
}

export class PatchCcFilingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  entry_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  entry_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shipping_bill_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  filing_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assessed_duty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assessed_tax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  duty_currency?: string;
}

export class AssessCcDto extends CcWorkflowOverrideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  assessed_duty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  assessed_tax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  duty_currency?: string;
}

export class CreateCcQueryDto {
  @ApiProperty()
  @IsString()
  @Length(1, 5000)
  query_text!: string;
}

export class PatchCcQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  response_text?: string;
}

export class DutyPaidDto extends CcWorkflowOverrideDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  paid_by_client?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class LinkFreightDto {
  @ApiProperty()
  @IsUUID()
  freight_job_id!: string;
}

export class UpsertCcDeclarationDto {
  @ApiProperty({ description: "BOE/SB workspace payload" })
  @IsObject()
  declaration!: Record<string, unknown>;
}

export class CcQueueQueryDto {
  @ApiPropertyOptional({ enum: ["SALES", "OPS", "ACCOUNTS"] })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional({ enum: CcWorkflowStatus })
  @IsOptional()
  @IsEnum(CcWorkflowStatus)
  status?: CcWorkflowStatus;

  @ApiPropertyOptional({ enum: CcDirection })
  @IsOptional()
  @IsEnum(CcDirection)
  direction?: CcDirection;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class ValidateHsCodeDto {
  @ApiProperty()
  @IsString()
  @Length(4, 12)
  hs_code!: string;
}

export class PortalCcDocumentDto {
  @ApiProperty({ example: "COMMERCIAL_INVOICE" })
  @IsString()
  @Length(1, 40)
  doc_code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  job_document_id?: string;
}
