import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';
import { IsPhoneForCountry } from '../../../common/validators/country-aware.validators';

export class CreatePartyContactDto {
  @ApiProperty({ example: 'Fatima Al Suwaidi' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 'Import Manager' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  designation?: string;

  @ApiPropertyOptional({ example: '+97142223344' })
  @IsOptional()
  @IsPhoneForCountry()
  phone?: string;

  @ApiPropertyOptional({ example: '+971501112233' })
  @IsOptional()
  @IsPhoneForCountry()
  mobile?: string;

  @ApiPropertyOptional({ example: 'fatima@example.com' })
  @IsOptional()
  @IsStrictEmail()
  email?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}

export class UpdatePartyContactDto extends PartialType(CreatePartyContactDto) {}
