import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsLatitude, IsLongitude, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ShipmentMode } from '@prisma/client';
import { IsCountryCode, IsUnLocode } from '../../../common/validators/input-format.validators';

export class CreatePortDto {
  @ApiProperty({ example: 'AEJEA', description: 'UN/LOCODE' })
  @IsUnLocode()
  un_locode!: string;

  @ApiProperty({ example: 'Jebel Ali' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 'Dubai' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @ApiProperty({ example: 'AE' })
  @IsCountryCode()
  country_code!: string;

  @ApiPropertyOptional({ enum: ShipmentMode, default: ShipmentMode.SEA })
  @IsOptional()
  @IsEnum(ShipmentMode)
  mode?: ShipmentMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePortDto extends PartialType(CreatePortDto) {}
