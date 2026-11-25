import { ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentationMpciStatus } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { DocumentationPaginationDto } from "./documentation-pagination.dto";

export class CreateMpciFilingDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filing_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filing_number?: string;
}

export class MpciQueryDto extends DocumentationPaginationDto {
  @ApiPropertyOptional({ enum: DocumentationMpciStatus })
  @IsOptional()
  @IsEnum(DocumentationMpciStatus)
  status?: DocumentationMpciStatus;

  /** Alias of `status` (Fresa Filing Status filter). */
  @ApiPropertyOptional({ enum: DocumentationMpciStatus })
  @IsOptional()
  @IsEnum(DocumentationMpciStatus)
  filing_status?: DocumentationMpciStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Filter filings whose linked job is in this department",
  })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional({
    description: "Match filing_number or filing_type (contains)",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
