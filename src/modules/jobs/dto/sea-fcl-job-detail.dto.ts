import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

const BL_TYPES = ['Original', 'Seaway', 'Express Release', 'Surrendered'];
const FREIGHT_TERMS = ['Prepaid', 'Collect'];

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

  @ApiPropertyOptional({ enum: FREIGHT_TERMS })
  @IsOptional()
  @IsIn(FREIGHT_TERMS)
  freight_terms?: string;
}
