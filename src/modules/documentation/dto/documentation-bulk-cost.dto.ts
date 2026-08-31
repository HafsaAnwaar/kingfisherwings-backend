import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentationDrCr, DocumentationSaleOrCost } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class BulkCostLineDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  job_id!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  description!: string;

  @ApiProperty({ example: 'AED' })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchange_rate?: number;

  @ApiProperty()
  @IsNumber()
  fcy_amount!: number;

  @ApiPropertyOptional({ enum: DocumentationSaleOrCost })
  @IsOptional()
  @IsEnum(DocumentationSaleOrCost)
  sale_or_cost?: DocumentationSaleOrCost;

  @ApiPropertyOptional({ enum: DocumentationDrCr })
  @IsOptional()
  @IsEnum(DocumentationDrCr)
  dr_cr?: DocumentationDrCr;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tax_group_id?: string;
}

export class BulkCostBatchDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voyage_number?: string;

  @ApiPropertyOptional({ description: 'e.g. BY_VOLUME, BY_WEIGHT, EQUAL' })
  @IsOptional()
  @IsString()
  prorate_method?: string;

  @ApiProperty({ type: [BulkCostLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkCostLineDto)
  lines!: BulkCostLineDto[];
}
