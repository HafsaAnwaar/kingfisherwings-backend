import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

const AWB_TYPES = ['Direct', 'Back-to-Back', 'Consol'];
const FREIGHT_TYPES = ['Prepaid', 'Collect'];

export class UpdateAirJobDetailDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  airline_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  origin_airport_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  dest_airport_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hawb_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mawb_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  flight_date?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  screened?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  screening_ref?: string;

  @ApiPropertyOptional({ enum: AWB_TYPES })
  @IsOptional()
  @IsIn(AWB_TYPES)
  awb_type?: string;

  @ApiPropertyOptional({ enum: FREIGHT_TYPES })
  @IsOptional()
  @IsIn(FREIGHT_TYPES)
  freight_type?: string;

  @ApiPropertyOptional({ default: 167, description: 'kg per CBM; IATA standard is 167.' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  conversion_factor?: number;
}
