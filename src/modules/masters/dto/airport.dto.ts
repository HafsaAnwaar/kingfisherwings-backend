import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsLatitude, IsLongitude, IsOptional, IsString, Length } from 'class-validator';

export class CreateAirportDto {
  @ApiProperty({ example: 'DXB', description: 'IATA code' })
  @IsString()
  @Length(3, 3)
  iata_code!: string;

  @ApiPropertyOptional({ example: 'OMDB', description: 'ICAO code' })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  icao_code?: string;

  @ApiProperty({ example: 'Dubai International Airport' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 'Dubai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'AE' })
  @IsString()
  @Length(2, 2)
  country_code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Asia/Dubai' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAirportDto extends PartialType(CreateAirportDto) {}
