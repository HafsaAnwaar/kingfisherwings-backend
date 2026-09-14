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

export class CreatePackTypeDto {
  @ApiProperty({ example: "CTN" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Carton" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsNumber()
  length_cm?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  width_cm?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  height_cm?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePackTypeDto extends PartialType(CreatePackTypeDto) {}
