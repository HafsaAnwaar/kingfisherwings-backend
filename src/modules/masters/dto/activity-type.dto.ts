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

export class CreateActivityTypeDto {
  @ApiProperty({ example: "FOLLOW_UP" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Follow Up" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: "CRM", description: "Module flag e.g. CRM, OPS" })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  module?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateActivityTypeDto extends PartialType(CreateActivityTypeDto) {}
