import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateJobContainerDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  container_type_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  container_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  seal_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  tare_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  vgm_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cbm?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_soc?: boolean;
}

export class UpdateJobContainerDto extends PartialType(CreateJobContainerDto) {}
