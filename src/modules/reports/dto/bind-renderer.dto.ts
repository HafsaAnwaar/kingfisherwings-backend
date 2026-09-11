import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";
import { ReportFormat } from "@prisma/client";

export class BindRendererDto {
  @ApiProperty({
    description:
      "Implemented data-pack key (clears pending.*). From GET /reports/templates/renderers.",
    example: "ops.delivered_jobs_period",
  })
  @IsString()
  @Matches(/^(ops|sea)\.[a-z0-9_]+$/, {
    message: "renderer_key must be an implemented ops.* or sea.* pack key",
  })
  renderer_key!: string;

  @ApiPropertyOptional({
    description: "If true, set is_active=true after bind (same as activate).",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  activate?: boolean;

  @ApiPropertyOptional({
    description:
      "Optional formats override (defaults keep existing template formats).",
    enum: ReportFormat,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(ReportFormat, { each: true })
  formats?: ReportFormat[];
}

export class ActivateTemplateDto {
  @ApiPropertyOptional({
    description:
      "If template is still pending.*, bind this implemented renderer_key then activate.",
    example: "ops.delivered_jobs_period",
  })
  @IsOptional()
  @IsString()
  @Matches(/^(ops|sea)\.[a-z0-9_]+$/, {
    message: "renderer_key must be an implemented ops.* or sea.* pack key",
  })
  renderer_key?: string;
}
