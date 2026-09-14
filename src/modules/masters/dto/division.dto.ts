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

export class CreateDivisionDto {
  @ApiProperty({ example: "SEA" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Sea Freight Division" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateDivisionDto extends PartialType(CreateDivisionDto) {}
