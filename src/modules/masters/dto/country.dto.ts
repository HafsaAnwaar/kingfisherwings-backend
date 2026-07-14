import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';
import {
  IsDialCodeForCountry,
  NormalizeCountryCode,
} from '../../../common/validators/country-aware.validators';

export class CreateCountryDto {
  @ApiProperty({ example: 'AE', description: 'ISO 3166-1 alpha-2' })
  @NormalizeCountryCode()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'iso_code must be 2 uppercase letters (e.g. AE)' })
  iso_code!: string;

  @ApiProperty({ example: 'ARE', description: 'ISO 3166-1 alpha-3' })
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'iso3_code must be 3 uppercase letters (e.g. ARE)' })
  iso3_code!: string;

  @ApiProperty({ example: 'United Arab Emirates' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiPropertyOptional({ example: '+971', description: 'Must match iso_code dialing prefix.' })
  @IsOptional()
  @IsDialCodeForCountry({ countryField: 'iso_code', useTenantCountry: false })
  dial_code?: string;

  @ApiPropertyOptional({ example: 'Middle East' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  region?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCountryDto extends PartialType(CreateCountryDto) {}
