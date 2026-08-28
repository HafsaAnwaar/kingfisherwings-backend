import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

const VEHICLE_TYPES = ['TRUCK', 'TRAILER', 'VAN'];
const FREIGHT_TERMS = ['Prepaid', 'Collect', 'Third Party'];

export class UpdateLandJobDetailDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  trucker_id?: string;

  @ApiPropertyOptional({ enum: VEHICLE_TYPES })
  @IsOptional()
  @IsIn(VEHICLE_TYPES)
  vehicle_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  vehicle_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  driver_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  driver_license?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin_city_country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  destination_city_country?: string;

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
  @MaxLength(10)
  incoterms?: string;

  @ApiPropertyOptional({ enum: FREIGHT_TERMS })
  @IsOptional()
  @IsIn(FREIGHT_TERMS)
  freight_terms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  cross_border_docs_required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  border_origin_country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  border_destination_country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  border_declaration_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  border_commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  border_hs_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  border_declared_value?: number;
}

export class AssignLandTruckerDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  trucker_id!: string;

  @ApiPropertyOptional({ enum: VEHICLE_TYPES })
  @IsOptional()
  @IsIn(VEHICLE_TYPES)
  vehicle_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  vehicle_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  driver_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  driver_license?: string;
}

export class RecordLandPickupDto {
  @ApiPropertyOptional({ description: 'Defaults to now' })
  @IsOptional()
  @IsDateString()
  picked_up_at?: string;
}

export class RecordLandBorderCrossingDto {
  @ApiPropertyOptional({ enum: ['AT_BORDER', 'CUSTOMS_CLEARED_BORDER'], default: 'AT_BORDER' })
  @IsOptional()
  @IsIn(['AT_BORDER', 'CUSTOMS_CLEARED_BORDER'])
  milestone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  crossed_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  border_declaration_number?: string;
}

export class CreateLandPodDto {
  @ApiProperty()
  @IsDateString()
  actual_delivery_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  delivered_by?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  received_by?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signature_image_path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
