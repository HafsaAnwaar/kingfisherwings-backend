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

export class CreateCommodityDto {
  @ApiProperty({ example: "ELEC" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Electronics" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "8517.12" })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  hs_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCommodityDto extends PartialType(CreateCommodityDto) {}
