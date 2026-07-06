import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsLatitude, IsLongitude, IsOptional, IsString, Length } from 'class-validator';
import { ShipmentMode } from '@prisma/client';

export class CreatePortDto {
  @ApiProperty({ example: 'AEJEA', description: 'UN/LOCODE' })
  @IsString()
  @Length(5, 10)
  un_locode!: string;

  @ApiProperty({ example: 'Jebel Ali' })
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
