import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from "class-validator";

export class TemplateDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiProperty({ description: "KPI definitions as JSON array" })
  @IsArray()
  kpis!: Record<string, unknown>[];
}

export class UpdateTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  kpis?: Record<string, unknown>[];
}

export class CycleDto {
  @ApiProperty()
  @IsUUID()
  template_id!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year!: number;

  @ApiProperty()
  @IsDateString()
  start_date!: string;

  @ApiProperty()
  @IsDateString()
  end_date!: string;
}

export class EvaluationDto {
  @ApiProperty()
  @IsUUID()
  cycle_id!: string;

  @ApiProperty()
  @IsUUID()
  employee_id!: string;
}

export class SubmitScoresDto {
  @ApiProperty({ description: "KPI id → score map" })
  @IsObject()
  scores!: Record<string, number>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  promotion_recommended?: boolean;
}
