import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { JobType } from "@prisma/client";
import { DocumentationPaginationDto } from "../../documentation/dto/documentation-pagination.dto";

export class OperationsDateRangeQueryDto extends DocumentationPaginationDto {
  @ApiProperty()
  @IsDateString()
  from_date!: string;

  @ApiProperty()
  @IsDateString()
  to_date!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;
}

export class JobNotInvoicedDoQueryDto extends OperationsDateRangeQueryDto {
  @ApiPropertyOptional({
    enum: ["do_issued", "job_date"],
    default: "do_issued",
  })
  @IsOptional()
  @IsIn(["do_issued", "job_date"])
  date_basis?: "do_issued" | "job_date";
}

export class JobFinanceReportQueryDto extends OperationsDateRangeQueryDto {
  @ApiPropertyOptional({
    enum: ["shipment_date", "job_date"],
    default: "shipment_date",
  })
  @IsOptional()
  @IsIn(["shipment_date", "job_date"])
  date_basis?: "shipment_date" | "job_date";

  @ApiPropertyOptional({
    enum: ["none", "branch", "salesperson", "job_type"],
    default: "none",
  })
  @IsOptional()
  @IsIn(["none", "branch", "salesperson", "job_type"])
  group_by?: "none" | "branch" | "salesperson" | "job_type";
}

export class VoyageJobsShipmentsQueryDto {
  @ApiProperty()
  @IsString()
  voyage_number!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vessel_name?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class ExceptionsQueryDto extends OperationsDateRangeQueryDto {
  @ApiPropertyOptional({
    description:
      "Comma-separated rules: do_uninvoiced,atd_no_bl,ata_missing,atd_no_loading,not_closed_past_eta",
  })
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiPropertyOptional({
    description: "Days past ETA before not_closed_past_eta fires",
    default: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(90)
  eta_grace_days?: number;
}

export class KpiStatusQueryDto extends OperationsDateRangeQueryDto {
  @ApiPropertyOptional({
    enum: ["job_date", "completed_at"],
    default: "job_date",
  })
  @IsOptional()
  @IsIn(["job_date", "completed_at"])
  date_basis?: "job_date" | "completed_at";
}

export class JobListSummaryQueryDto extends OperationsDateRangeQueryDto {
  @ApiPropertyOptional({
    enum: ["job_date", "shipment_date", "voucher_date"],
    default: "job_date",
  })
  @IsOptional()
  @IsIn(["job_date", "shipment_date", "voucher_date"])
  date_basis?: "job_date" | "shipment_date" | "voucher_date";
}
