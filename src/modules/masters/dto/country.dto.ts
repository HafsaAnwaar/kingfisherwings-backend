import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'AE', description: 'ISO 3166-1 alpha-2' })
  @IsString()
  @Length(2, 2)
  iso_code!: string;

  @ApiProperty({ example: 'ARE', description: 'ISO 3166-1 alpha-3' })
  @IsString()
  @Length(3, 3)
  iso3_code!: string;

  @ApiProperty({ example: 'United Arab Emirates' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiPropertyOptional({ example: '+971' })
  @IsOptional()
  @IsString()
  dial_code?: string;

  @ApiPropertyOptional({ example: 'Middle East' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCountryDto extends PartialType(CreateCountryDto) {}
