import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { ReportFormat } from "@prisma/client";

export class ReportGenerateContextDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  quotation_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  invoice_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  party_id?: string;
}

export class ReportGenerateDto {
  @ApiPropertyOptional({ description: "Template UUID (or use code)" })
  @ValidateIf((o: ReportGenerateDto) => !o.code)
  @IsUUID()
  template_id?: string;

  @ApiPropertyOptional({ description: "Stable template code (or use template_id)" })
  @ValidateIf((o: ReportGenerateDto) => !o.template_id)
  @IsString()
  code?: string;

  @ApiProperty({ enum: ReportFormat })
  @IsEnum(ReportFormat)
  format!: ReportFormat;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @ApiPropertyOptional({ type: ReportGenerateContextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReportGenerateContextDto)
  context?: ReportGenerateContextDto;
}
