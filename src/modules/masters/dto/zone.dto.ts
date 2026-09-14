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

export class CreateZoneDto {
  @ApiProperty({ example: "DXB-JAFZA" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Jebel Ali Free Zone" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  region_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  city_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateZoneDto extends PartialType(CreateZoneDto) {}
