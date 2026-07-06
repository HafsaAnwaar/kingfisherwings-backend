import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateAirlineDto {
  @ApiProperty({ example: 'EK', description: 'IATA 2-letter code' })
  @IsString()
  @Length(2, 2)
  iata_code!: string;

  @ApiPropertyOptional({ example: 'UAE', description: 'ICAO 3-letter code' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  icao_code?: string;

  @ApiPropertyOptional({ example: '176', description: '3-digit AWB prefix' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  prefix_code?: string;

  @ApiProperty({ example: 'Emirates' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 'AE' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAirlineDto extends PartialType(CreateAirlineDto) {}
