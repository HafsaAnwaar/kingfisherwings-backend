import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreatePartyAddressDto {
  @ApiProperty({ example: 'Warehouse', description: 'Free-text label, e.g. Billing / Delivery / Warehouse.' })
  @IsString()
  @Length(1, 50)
  label!: string;

  @ApiProperty({ example: 'Plot 45, Jebel Ali Free Zone' })
  @IsString()
  address_line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address_line2?: string;

  @ApiPropertyOptional({ example: 'Dubai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({ example: 'AE' })
  @IsString()
  @Length(2, 2)
  country_code!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdatePartyAddressDto extends PartialType(CreatePartyAddressDto) {}
