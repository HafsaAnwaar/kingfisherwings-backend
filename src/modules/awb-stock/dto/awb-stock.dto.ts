import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class CreateAwbStockBatchDto {
  @ApiProperty()
  @IsUUID()
  airline_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiProperty({ example: "176", description: "3-digit IATA airline prefix" })
  @IsString()
  @MaxLength(3)
  prefix!: string;

  @ApiProperty({ example: 12345670 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  range_from!: number;

  @ApiProperty({ example: 12345699 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  range_to!: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  low_stock_threshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAwbStockBatchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  low_stock_threshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AllocateAwbDto {
  @ApiProperty()
  @IsUUID()
  job_id!: string;
}

export class VoidAwbAllocationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  void_reason!: string;
}

export class TransferAwbBatchDto {
  @ApiProperty()
  @IsUUID()
  branch_id!: string;
}

export class AwbStockQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  airline_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  job_id?: string;
}
