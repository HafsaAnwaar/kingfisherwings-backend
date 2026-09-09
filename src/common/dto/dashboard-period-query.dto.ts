import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import {
  DashboardPeriodPreset,
  resolveDashboardPeriod,
} from "../utils/dashboard-period.util";

export class DashboardPeriodQueryDto {
  @ApiPropertyOptional({
    enum: ["7d", "30d", "mtd", "custom"],
    description: "Preset window. Use custom with from_date/to_date.",
    example: "30d",
  })
  @IsOptional()
  @IsIn(["7d", "30d", "mtd", "custom"])
  period?: DashboardPeriodPreset;

  @ApiPropertyOptional({ example: "2026-09-01" })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ example: "2026-09-09" })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  /** Optional free-form alias some FE clients send as `from` / `to`. */
  @ApiPropertyOptional({ deprecated: true })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ deprecated: true })
  @IsOptional()
  @IsString()
  to?: string;

  resolve(defaultPeriod: DashboardPeriodPreset = "30d") {
    return resolveDashboardPeriod(
      {
        period: this.period,
        from_date: this.from_date ?? this.from,
        to_date: this.to_date ?? this.to,
      },
      defaultPeriod,
    );
  }
}

export class JobsDashboardQueryDto extends DashboardPeriodQueryDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsString()
  branch_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  job_type?: string;
}

export class TasksQueryDto extends DashboardPeriodQueryDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true" || value === "1")
  include_done?: boolean = false;
}
