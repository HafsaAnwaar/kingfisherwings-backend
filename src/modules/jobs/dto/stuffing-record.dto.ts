import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateStuffingRecordDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  container_id?: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  supervisor_name!: string;

  @ApiProperty({ description: 'ISO datetime of stuffing' })
  @IsDateString()
  stuffing_date!: string;

  @ApiPropertyOptional({ description: 'Warehouse / CY location' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  goods_condition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStuffingRecordDto extends PartialType(CreateStuffingRecordDto) {}
