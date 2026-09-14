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

export class CreateRegionDto {
  @ApiProperty({ example: "GCC" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Gulf Cooperation Council" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "AE" })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateRegionDto extends PartialType(CreateRegionDto) {}
