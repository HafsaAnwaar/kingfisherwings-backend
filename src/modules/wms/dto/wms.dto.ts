import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { WmsValuationMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpsertWmsSettingsDto {
  @ApiProperty({ enum: WmsValuationMethod })
  @IsEnum(WmsValuationMethod)
  valuation_method!: WmsValuationMethod;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  default_free_days!: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  default_storage_rate!: number;

  @ApiProperty({ example: 'AED' })
  @IsString()
  @Length(3, 3)
  default_currency!: string;
}

export class CreateWmsItemDto {
  @ApiProperty()
  @IsString()
  @Length(1, 40)
  code!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  uom_code?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  low_stock_threshold?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateWmsItemDto extends PartialType(CreateWmsItemDto) {}

export class ItemQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AsnLineDto {
  @ApiProperty()
  @IsUUID()
  item_id!: string;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  quantity!: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cbm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateAsnDto {
  @ApiProperty()
  @IsUUID()
  warehouse_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expected_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ type: [AsnLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AsnLineDto)
  lines!: AsnLineDto[];
}

export class GrnLineDto extends AsnLineDto {
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unit_cost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batch_code?: string;
}

export class CreateGrnDto {
  @ApiProperty()
  @IsUUID()
  warehouse_id!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() party_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() job_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() asn_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() received_at?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;

  @ApiProperty({ type: [GrnLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GrnLineDto)
  lines!: GrnLineDto[];
}

export class GdoLineDto {
  @ApiProperty() @IsUUID() item_id!: string;
  @ApiProperty({ minimum: 0 }) @Type(() => Number) @IsNumber() @Min(0.0001) quantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class CreateGdoDto {
  @ApiProperty() @IsUUID() warehouse_id!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() party_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() job_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() delivered_at?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiProperty({ type: [GdoLineDto] })
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => GdoLineDto)
  lines!: GdoLineDto[];
}

export class TransferLineDto {
  @ApiProperty() @IsUUID() item_id!: string;
  @ApiProperty({ minimum: 0 }) @Type(() => Number) @IsNumber() @Min(0.0001) quantity!: number;
}

export class CreateTransferDto {
  @ApiProperty() @IsUUID() from_warehouse_id!: string;
  @ApiProperty() @IsUUID() to_warehouse_id!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiProperty({ type: [TransferLineDto] })
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => TransferLineDto)
  lines!: TransferLineDto[];
}

export class AdjustStockDto {
  @ApiProperty() @IsUUID() warehouse_id!: string;
  @ApiProperty() @IsUUID() item_id!: string;
  @ApiProperty({ description: 'Signed adjustment quantity' }) @Type(() => Number) @IsNumber() quantity!: number;
  @ApiProperty() @IsString() @IsNotEmpty() remarks!: string;
}

export class CalculateStorageDto {
  @ApiProperty() @IsUUID() warehouse_id!: string;
  @ApiProperty() @IsUUID() party_id!: string;
  @ApiProperty() @IsDateString() period_from!: string;
  @ApiProperty() @IsDateString() period_to!: string;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) free_days?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) rate_per_day?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(3, 3) currency_code?: string;
}

export class InvoiceStorageDto {
  @ApiProperty({ type: [String] })
  @IsArray() @ArrayMinSize(1) @IsUUID('4', { each: true })
  charge_ids!: string[];
}

export class StockQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() warehouse_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() item_id?: string;
}

export class MovementQueryDto extends StockQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string;
}
