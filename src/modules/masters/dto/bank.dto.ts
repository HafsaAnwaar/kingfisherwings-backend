import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';
import { IsCountryCode, IsSwiftCode } from '../../../common/validators/input-format.validators';

export class CreateBankDto {
  @ApiProperty({ example: 'Emirates NBD' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 'ENBD' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  short_name?: string;

  @ApiPropertyOptional({ example: 'EBILAEAD' })
  @IsOptional()
  @IsSwiftCode()
  swift_code?: string;

  @ApiPropertyOptional({ example: 'AE07' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}\d{2}$/, { message: 'iban_prefix must look like AE07' })
  iban_prefix?: string;

  @ApiPropertyOptional({ example: 'AE' })
  @IsOptional()
  @IsCountryCode()
  country_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateBankDto extends PartialType(CreateBankDto) {}
