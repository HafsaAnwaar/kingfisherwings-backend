import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'AED', description: 'ISO 4217' })
  @IsString()
  @Length(3, 3)
  code!: string;

  @ApiProperty({ example: 'UAE Dirham' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ example: 'د.إ' })
  @IsString()
  @Length(1, 10)
  symbol!: string;

  @ApiPropertyOptional({ default: 2, minimum: 0, maximum: 6 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  decimal_places?: number;

  @ApiPropertyOptional({ default: false, description: "This tenant's reporting/base currency." })
  @IsOptional()
  @IsBoolean()
  is_base?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCurrencyDto extends PartialType(CreateCurrencyDto) {}
