import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsObject, IsOptional } from "class-validator";

export class UpdatePortalPreferencesDto {
  @ApiPropertyOptional({
    description: "Receive JOB_MILESTONE_UPDATED alerts (default false).",
  })
  @IsOptional()
  @IsBoolean()
  milestone_alerts_enabled?: boolean;

  @ApiPropertyOptional({
    description: "Receive DOCUMENT_READY alerts (default true).",
  })
  @IsOptional()
  @IsBoolean()
  document_alerts_enabled?: boolean;

  @ApiPropertyOptional({
    description: "Saved default filters for shipment list UI.",
  })
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  default_shipment_filters?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: "Saved default filters for invoice list UI.",
  })
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  default_invoice_filters?: Record<string, unknown> | null;
}
