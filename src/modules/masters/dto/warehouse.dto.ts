import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";
import { IsCountryCode } from "../../../common/validators/input-format.validators";

export class CreateWarehouseDto {
  @ApiProperty({ example: "Jebel Ali Warehouse 3" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: "WH-JA3" })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: "Dubai" })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @ApiPropertyOptional({ example: "AE" })
  @IsOptional()
  @IsCountryCode()
  country_code?: string;

  @ApiPropertyOptional({ description: "Square meters" })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  capacity_sqm?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
