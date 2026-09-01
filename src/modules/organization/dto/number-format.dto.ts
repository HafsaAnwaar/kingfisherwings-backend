import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";
import {
  DocumentNumberType,
  DocumentNumberResetFrequency,
} from "@prisma/client";

export class CreateNumberFormatDto {
  @ApiProperty({ enum: DocumentNumberType })
  @IsEnum(DocumentNumberType)
  document_type!: DocumentNumberType;

  @ApiProperty({ example: "KFW" })
  @IsString()
  @Length(1, 20)
  prefix!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  include_branch_code?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  include_year?: boolean;

  @ApiPropertyOptional({ default: 2, description: "2 or 4 digit year" })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(4)
  year_digits?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  include_month?: boolean;

  @ApiPropertyOptional({ default: 5, minimum: 3, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(10)
  sequence_length?: number;

  @ApiPropertyOptional({ default: "/" })
  @IsOptional()
  @IsString()
  @Length(0, 3)
  separator?: string;

  @ApiPropertyOptional({
    enum: DocumentNumberResetFrequency,
    default: DocumentNumberResetFrequency.YEARLY,
  })
  @IsOptional()
  @IsEnum(DocumentNumberResetFrequency)
  reset_frequency?: DocumentNumberResetFrequency;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateNumberFormatDto extends PartialType(CreateNumberFormatDto) {}
