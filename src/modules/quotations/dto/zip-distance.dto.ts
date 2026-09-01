import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";

export class CreateZipDistanceDto {
  @ApiProperty({ example: "00000" })
  @IsString()
  @Length(1, 20)
  from_zip!: string;

  @ApiPropertyOptional({ example: "Dubai" })
  @IsOptional()
  @IsString()
  from_city?: string;

  @ApiProperty({ example: "11111" })
  @IsString()
  @Length(1, 20)
  to_zip!: string;

  @ApiPropertyOptional({ example: "Abu Dhabi" })
  @IsOptional()
  @IsString()
  to_city?: string;

  @ApiProperty({ example: 140 })
  @IsNumber()
  @Min(0)
  distance!: number;

  @ApiPropertyOptional({ default: "KM" })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateZipDistanceDto extends PartialType(CreateZipDistanceDto) {}
