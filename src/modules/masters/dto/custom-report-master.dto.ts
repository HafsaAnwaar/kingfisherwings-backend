import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  Length,
  MaxLength,
  Min,
} from "class-validator";

export class CreateCustomReportMasterDto {
  @ApiProperty({ example: "AR_AGING_CUST" })
  @IsString()
  @Length(1, 50)
  code!: string;

  @ApiProperty({ example: "Customer AR Aging" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: "ar_aging", description: "Links to report template code" })
  @IsString()
  @Length(1, 100)
  report_template_code!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCustomReportMasterDto extends PartialType(CreateCustomReportMasterDto) {}
