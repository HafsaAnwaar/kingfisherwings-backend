import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  Length,
  MaxLength,
  Min,
} from "class-validator";

export class CreateStorageSlabDto {
  @ApiProperty({ example: "SLAB-1-7" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Days 1-7" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  from_days!: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(0)
  to_days!: number;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  rate!: number;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  rate_basis_id?: string;

  @ApiPropertyOptional({ example: "AED" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateStorageSlabDto extends PartialType(CreateStorageSlabDto) {}
