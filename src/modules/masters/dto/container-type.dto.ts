import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { ContainerSize } from '@prisma/client';

export class CreateContainerTypeDto {
  @ApiProperty({ example: '40HC' })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiProperty({ example: '40ft High Cube' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ enum: ContainerSize })
  @IsEnum(ContainerSize)
  size!: ContainerSize;

  @ApiPropertyOptional({ default: 1, description: 'Twenty-foot equivalent units' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  teu?: number;

  @ApiPropertyOptional({ description: 'Max payload in kg' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  max_payload?: number;

  @ApiPropertyOptional({ description: 'Internal volume in CBM' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  volume_cbm?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateContainerTypeDto extends PartialType(CreateContainerTypeDto) {}
