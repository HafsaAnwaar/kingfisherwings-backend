import { ApiPropertyOptional } from "@nestjs/swagger";
import { NvoccVoyageStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsUUID } from "class-validator";

export class NvoccUtilizationQueryDto {
  @ApiPropertyOptional({ enum: NvoccVoyageStatus })
  @IsOptional()
  @IsEnum(NvoccVoyageStatus)
  voyage_status?: NvoccVoyageStatus;

  @ApiPropertyOptional({
    description: "Filter voyages with ETD on or after this date",
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: "Filter voyages with ETD on or before this date",
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;
}

export class NvoccTradeLaneProfitabilityQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: ["pol_pod", "tariff_lane"], default: "pol_pod" })
  @IsOptional()
  @IsEnum(["pol_pod", "tariff_lane"])
  group_by?: "pol_pod" | "tariff_lane";
}
