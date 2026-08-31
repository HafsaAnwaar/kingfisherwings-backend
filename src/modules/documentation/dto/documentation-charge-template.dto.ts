import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DocumentationDrCr, DocumentationSaleOrCost } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { DocumentationPaginationDto } from './documentation-pagination.dto';

export class ChargeTemplateLineDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  description!: string;

  @ApiPropertyOptional({ enum: DocumentationSaleOrCost })
  @IsOptional()
  @IsEnum(DocumentationSaleOrCost)
  sale_or_cost?: DocumentationSaleOrCost;

  @ApiPropertyOptional({ enum: DocumentationDrCr })
  @IsOptional()
  @IsEnum(DocumentationDrCr)
  dr_cr?: DocumentationDrCr;

  @ApiProperty({ example: 'AED' })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  default_amount?: number;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tax_group_id?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class CreateChargeTemplateDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  job_types?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ type: [ChargeTemplateLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChargeTemplateLineDto)
  lines!: ChargeTemplateLineDto[];
}

export class UpdateChargeTemplateDto extends PartialType(CreateChargeTemplateDto) {}

export class ApplyChargeTemplateDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  job_id!: string;
}

export class ChargeTemplateQueryDto extends DocumentationPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;
}
