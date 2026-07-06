import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateExchangeRateDto {
  @ApiProperty({ format: 'uuid', description: 'Currency being rated against the base currency.' })
  @IsUUID()
  currency_id!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Length(3, 3)
  base_currency!: string;

  @ApiProperty({ example: 3.6725 })
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiProperty({ example: '2026-07-06' })
  @IsDateString()
  rate_date!: string;

  @ApiPropertyOptional({ default: 'manual', description: 'e.g. "xe.com" or "manual".' })
  @IsOptional()
  @IsString()
  source?: string;
}
