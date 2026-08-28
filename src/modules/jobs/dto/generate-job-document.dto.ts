import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class GenerateJobDocumentDto {
  @ApiPropertyOptional({ description: 'Template layout variant (e.g. STANDARD, LAYOUT_A, LAYOUT_B)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  layout_variant?: string;

  @ApiPropertyOptional({ default: false, description: 'Generate as ORIGINAL (vs DRAFT watermark)' })
  @IsOptional()
  @IsBoolean()
  is_original?: boolean;

  @ApiPropertyOptional({ description: 'Use a specific BillOfLading record; otherwise latest matching type / job defaults' })
  @IsOptional()
  @IsUUID()
  bl_id?: string;

  @ApiPropertyOptional({ default: 3, description: 'Number of original BLs shown on header (1–3)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  number_of_originals?: number;

  @ApiPropertyOptional({ description: 'Rider / addendum terms (RIDER_BL)' })
  @IsOptional()
  @IsString()
  rider_terms?: string;

  @ApiPropertyOptional({ description: 'Original BL number being switched (SWITCH_BL)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  switched_from_bl_number?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Replacement consignee for SWITCH_BL' })
  @IsOptional()
  @IsUUID()
  switch_consignee_id?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Replacement notify party for SWITCH_BL' })
  @IsOptional()
  @IsUUID()
  switch_notify_id?: string;

  @ApiPropertyOptional({ description: 'Proxy forwarder name (PROXY_BL)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  proxy_forwarder_name?: string;

  @ApiPropertyOptional({ description: 'Proxy forwarder address (PROXY_BL)' })
  @IsOptional()
  @IsString()
  proxy_forwarder_address?: string;

  @ApiPropertyOptional({ description: 'Transhipment port name override' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  transhipment_port?: string;
}

/** Options stored on DocumentGenerationTask.options (JSON). */
export type SeaFclDocumentOptions = {
  bl_id?: string;
  number_of_originals?: number;
  rider_terms?: string;
  switched_from_bl_number?: string;
  switch_consignee_id?: string;
  switch_notify_id?: string;
  proxy_forwarder_name?: string;
  proxy_forwarder_address?: string;
  transhipment_port?: string;
  is_express_release?: boolean;
  transport_request_id?: string;
};
