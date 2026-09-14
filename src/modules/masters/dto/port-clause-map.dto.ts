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

export class CreatePortClauseMapDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  port_id!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  clause_id!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePortClauseMapDto extends PartialType(CreatePortClauseMapDto) {}
