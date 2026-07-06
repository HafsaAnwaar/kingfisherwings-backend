import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateUnitOfMeasureDto {
  @ApiProperty({ example: 'CBM' })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiProperty({ example: 'Cubic Meter' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ example: 'Volume', description: 'e.g. Weight, Volume, Length, Count' })
  @IsString()
  @Length(2, 50)
  category!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUnitOfMeasureDto extends PartialType(CreateUnitOfMeasureDto) {}
