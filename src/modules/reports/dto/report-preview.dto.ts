import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsObject, IsOptional, ValidateNested } from "class-validator";
import { ReportGenerateContextDto } from "./report-generate.dto";

/**
 * Payload-only preview for Hybrid Option C HTML pilots.
 * Same filters/context as generate — never trust companyId from body.
 */
export class ReportPreviewDto {
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
