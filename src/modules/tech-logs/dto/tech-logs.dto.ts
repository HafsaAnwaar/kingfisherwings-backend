import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  TechIssueSeverity,
  TechIssueStatus,
  TechLogPrincipal,
} from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class TechLogsListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  tenant_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({ description: "Search user name / email / path / message" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: TechLogPrincipal })
  @IsOptional()
  @IsEnum(TechLogPrincipal)
  principal?: TechLogPrincipal;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class TechIssuesListQueryDto extends TechLogsListQueryDto {
  @ApiPropertyOptional({ enum: TechIssueStatus })
  @IsOptional()
  @IsEnum(TechIssueStatus)
  status?: TechIssueStatus;

  @ApiPropertyOptional({ enum: TechIssueSeverity })
  @IsOptional()
  @IsEnum(TechIssueSeverity)
  severity?: TechIssueSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status_code?: number;
}

export class UpdateTechIssueDto {
  @ApiPropertyOptional({ enum: TechIssueStatus })
  @IsOptional()
  @IsEnum(TechIssueStatus)
  status?: TechIssueStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolution_notes?: string | null;
}

export class ReportClientErrorDto {
  @ApiProperty({ example: "TypeError: Cannot read properties of undefined" })
  @IsString()
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  stack?: string;

  @ApiPropertyOptional({ example: "/jobs/abc/detail/show_all" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;

  @ApiPropertyOptional({ enum: TechIssueSeverity, default: TechIssueSeverity.ERROR })
  @IsOptional()
  @IsEnum(TechIssueSeverity)
  severity?: TechIssueSeverity;

  @ApiPropertyOptional({ description: "FE route / screen name" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  screen?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value && typeof value === "object" ? value : undefined,
  )
  metadata?: Record<string, unknown>;
}
