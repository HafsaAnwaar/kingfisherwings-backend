import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MaxLength,
} from 'class-validator';
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '../../../common/dto/pagination.dto';

const REQUEST_TYPES = ['PICKUP', 'DELIVERY'];
const VEHICLE_TYPES = ['TRUCK', 'TRAILER', 'VAN'];
const STATUSES = ['CREATED', 'ASSIGNED', 'PICKUP_CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

export class CreateTransportRequestDto {
  @ApiProperty({ enum: REQUEST_TYPES })
  @IsIn(REQUEST_TYPES)
  request_type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pickup_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  delivery_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduled_pickup_datetime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduled_delivery_datetime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo_details?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  zip_distance_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance_km?: number;
}

export class AssignTransportRequestDto {
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

export class TransportTimestampDto {
  @ApiPropertyOptional({ description: 'Defaults to now' })
  @IsOptional()
  @IsDateString()
  at?: string;
}

export class RecordTransportCostDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;

  @ApiPropertyOptional({ default: 'AED' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class TransportRequestQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: PAGINATION_DEFAULT_LIMIT, minimum: 1, maximum: PAGINATION_MAX_LIMIT })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  limit: number = PAGINATION_DEFAULT_LIMIT;

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  trucker_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
