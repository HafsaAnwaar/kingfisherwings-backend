import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { TaxType } from '@prisma/client';

export class CreateTaxRateDto {
  @ApiProperty({ example: 'UAE VAT Standard' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ example: 'VAT5' })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiPropertyOptional({ enum: TaxType, default: TaxType.VAT })
  @IsOptional()
  @IsEnum(TaxType)
  tax_type?: TaxType;

  @ApiProperty({ example: 5, description: 'Percent' })
  @IsNumber()
  @Min(0)
  @Max(100)
  rate!: number;

  @ApiProperty({ example: 'AE' })
  @IsString()
  @Length(2, 2)
  country_code!: string;

  @ApiProperty({ example: '2018-01-01' })
  @IsDateString()
  effective_from!: string;

  @ApiPropertyOptional({ example: '2030-12-31' })
  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @ApiPropertyOptional({ default: false, description: 'Auto-applied rate for this country when none is specified.' })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTaxRateDto extends PartialType(CreateTaxRateDto) {}
