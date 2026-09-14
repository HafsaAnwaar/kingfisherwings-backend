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

export class CreateClauseDto {
  @ApiProperty({ example: "DEM-DET" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Demurrage / Detention" })
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiProperty({ example: "Free time and detention terms apply as per carrier tariff." })
  @IsString()
  @MaxLength(10000)
  body!: string;

  @ApiPropertyOptional({ example: "BL" })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  clause_type?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateClauseDto extends PartialType(CreateClauseDto) {}
