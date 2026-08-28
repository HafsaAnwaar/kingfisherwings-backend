import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

const BL_TYPES = ['Original', 'Seaway', 'Express Release', 'Surrendered'];
const FREIGHT_TERMS = ['Prepaid', 'Collect', 'Third Party'];
const STORAGE_BASES = ['KG', 'CBM'];

export class UpdateSeaLclJobDetailDto {
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
  @IsDateString()
  sailed_at?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  port_of_loading_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  port_of_discharge_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  incoterms?: string;

  @ApiPropertyOptional({ enum: BL_TYPES })
  @IsOptional()
  @IsIn(BL_TYPES)
  bl_type?: string;

  @ApiPropertyOptional({ enum: FREIGHT_TERMS })
  @IsOptional()
  @IsIn(FREIGHT_TERMS)
  freight_terms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transhipment_port?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'CFS warehouse (masters/warehouses)' })
  @IsOptional()
  @IsUUID()
  cfs_warehouse_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  consolidation_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  si_cutoff?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  si_submitted_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  si_version?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mbl_number_from_line?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hbl_number_from_agent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  actual_eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customs_entry_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customs_examination_details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  customs_duty_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  customs_tax_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  customs_clearance_date?: string;

  @ApiPropertyOptional({ enum: ['PENDING', 'FILED', 'QUERY', 'CLEARED', 'RELEASED'] })
  @IsOptional()
  @IsIn(['PENDING', 'FILED', 'QUERY', 'CLEARED', 'RELEASED'])
  customs_status?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  customs_broker_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  linked_export_job_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cfs_storage_rate_per_day?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  cfs_storage_start_date?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  cfs_storage_free_days?: number;

  @ApiPropertyOptional({ enum: STORAGE_BASES })
  @IsOptional()
  @IsIn(STORAGE_BASES)
  storage_rate_basis?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Link to Week 17 WMS storage charge when cargo is in tenant warehouse' })
  @IsOptional()
  @IsUUID()
  wms_storage_charge_id?: string;
}

export class SubmitLclSiDto {
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
