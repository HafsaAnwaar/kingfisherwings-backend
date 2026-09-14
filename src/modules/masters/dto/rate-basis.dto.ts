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

export class CreateRateBasisDto {
  @ApiProperty({ example: "PER_KG" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Per Kilogram" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateRateBasisDto extends PartialType(CreateRateBasisDto) {}
