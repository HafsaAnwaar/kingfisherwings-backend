import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({ example: 'AE' })
  @IsString()
  @Length(2, 2)
  country_code!: string;

  @ApiProperty({ example: '2026-12-02' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'UAE National Day' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ default: false, description: 'Recurs on the same date every year.' })
  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;
}

export class UpdateHolidayDto extends PartialType(CreateHolidayDto) {}
