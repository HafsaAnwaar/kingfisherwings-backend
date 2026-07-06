import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateShippingLineDto {
  @ApiProperty({ example: 'MAEU', description: 'SCAC code' })
  @IsString()
  @Length(2, 10)
  scac_code!: string;

  @ApiProperty({ example: 'Maersk Line' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 'Maersk' })
  @IsOptional()
  @IsString()
  short_name?: string;

  @ApiPropertyOptional({ example: 'DK' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiPropertyOptional({ example: 'https://www.maersk.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Container tracking URL template.' })
  @IsOptional()
  @IsString()
  tracking_url?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateShippingLineDto extends PartialType(CreateShippingLineDto) {}
