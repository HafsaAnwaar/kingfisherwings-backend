import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { ReportContext, ReportFamily } from "@prisma/client";

export class ReportTemplatesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiPropertyOptional({
    description:
      "Whitespace-split tokens AND-matched across name, code, and description (case-insensitive contains)",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ReportFamily })
  @IsOptional()
  @IsEnum(ReportFamily)
  family?: ReportFamily;

  @ApiPropertyOptional({ enum: ReportContext })
  @IsOptional()
  @IsEnum(ReportContext)
  context?: ReportContext;

  @ApiPropertyOptional({
    description: "Include inactive templates (admin)",
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_inactive?: boolean;
}
