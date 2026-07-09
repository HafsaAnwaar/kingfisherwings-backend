import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateJobChargeDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  charge_code_id!: string;

  @ApiProperty({ example: 'Ocean Freight' })
  @IsString()
  @Length(1, 300)
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ example: 850 })
  @IsNumber()
  @Min(0)
  unit_price!: number;

  @ApiProperty({ example: 'AED' })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchange_rate?: number;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tax_rate_id?: string;

  @ApiPropertyOptional({ default: false, description: 'Cost line (to a supplier) if true; revenue line if false.' })
  @IsOptional()
  @IsBoolean()
  is_cost?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_billable?: boolean;

  @ApiPropertyOptional({ format: 'uuid', description: 'Supplier Party — only meaningful for cost lines.' })
  @IsOptional()
  @IsUUID()
  party_id?: string;
}

export class UpdateJobChargeDto extends PartialType(CreateJobChargeDto) {}
