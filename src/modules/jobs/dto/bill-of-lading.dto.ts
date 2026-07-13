import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateBillOfLadingDto {
  @ApiProperty({ example: 'HBL', description: 'HBL | MBL | FIATA | SWITCH | PROXY | BACK_TO_BACK | Express Release' })
  @IsString()
  @Length(1, 40)
  bl_type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  bl_number?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  notify_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pol?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pod?: string;

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
  @IsString()
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voyage_number?: string;

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
  description_of_goods?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marks_numbers?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  packages?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  measurement?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  freight_payable_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  freight_terms?: string;

  @ApiPropertyOptional({ default: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  number_of_originals?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bl_conditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rider_terms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  switched_from_bl_number?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  switch_consignee_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  switch_notify_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proxy_forwarder_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proxy_forwarder_address?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  paired_bl_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_draft?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_original?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_surrendered?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_express_release?: boolean;
}

export class UpdateBillOfLadingDto extends PartialType(CreateBillOfLadingDto) {}
