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
import { MasterCategoryType } from "@prisma/client";

export class CreateMasterCategoryDto {
  @ApiProperty({ example: "SHIPPER" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Shipper" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ enum: ["PARTY", "CARGO", "OTHER"], example: "PARTY" })
  @IsEnum(MasterCategoryType)
  category_type!: MasterCategoryType;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateMasterCategoryDto extends PartialType(CreateMasterCategoryDto) {}
