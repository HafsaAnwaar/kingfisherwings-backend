import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

const BL_TYPES = ['Original', 'Seaway', 'Express Release', 'Surrendered'];
const FREIGHT_TERMS = ['Prepaid', 'Collect', 'Third Party'];
const STUFFING_LOCATIONS = ['CY', 'CFS', 'SHIPPER_PREMISES'];
const VGM_METHODS = ['SM1', 'SM2'];

export class UpdateSeaFclJobDetailDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shipping_line_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voyage_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hbl_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mbl_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  booking_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carrier_booking_ref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  place_of_receipt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  place_of_delivery?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  incoterms?: string;

  @ApiPropertyOptional({ enum: STUFFING_LOCATIONS })
  @IsOptional()
  @IsIn(STUFFING_LOCATIONS)
  stuffing_location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  stuffing_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  si_cutoff?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  vgm_cutoff?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  cy_cutoff?: string;

  @ApiPropertyOptional({ description: 'SI submission datetime' })
  @IsOptional()
  @IsDateString()
  si_submitted_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  si_version?: number;

  @ApiPropertyOptional({ description: 'VGM submission datetime' })
  @IsOptional()
  @IsDateString()
  vgm_submitted_at?: string;

  @ApiPropertyOptional({ enum: VGM_METHODS })
  @IsOptional()
  @IsIn(VGM_METHODS)
  vgm_method?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  port_of_loading_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  port_of_discharge_id?: string;

  @ApiPropertyOptional({ enum: BL_TYPES })
  @IsOptional()
  @IsIn(BL_TYPES)
  bl_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(FREIGHT_TERMS)
  freight_terms?: string;

  @ApiPropertyOptional({ description: 'Transhipment port name' })
  @IsOptional()
  @IsString()
  transhipment_port?: string;

  @ApiPropertyOptional({ description: 'Actual vessel sailed datetime' })
  @IsOptional()
  @IsDateString()
  sailed_at?: string;
}

export class SubmitSiDto {
  @ApiPropertyOptional({ description: 'Defaults to now' })
  @IsOptional()
  @IsDateString()
  si_submitted_at?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  si_version?: number;
}

export class SubmitVgmDto {
  @ApiPropertyOptional({ description: 'Defaults to now' })
  @IsOptional()
  @IsDateString()
  vgm_submitted_at?: string;

  @ApiPropertyOptional({ enum: VGM_METHODS, default: 'SM1' })
  @IsOptional()
  @IsIn(VGM_METHODS)
  vgm_method?: string;
}
