import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';
import { JobType } from '@prisma/client';

export class CreateTariffDto {
  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  service_type!: JobType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  charge_code_id!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Omit for a general rate applying to all customers.' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({ example: 'Per Container' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 850 })
  @IsNumber()
  @Min(0)
  sale_rate!: number;

  @ApiProperty({ example: 620 })
  @IsNumber()
  @Min(0)
  cost_rate!: number;

  @ApiProperty({ example: 'AED' })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  valid_from!: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  valid_to?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTariffDto extends PartialType(CreateTariffDto) {}
