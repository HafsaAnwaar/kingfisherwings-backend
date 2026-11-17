import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
} from "../../../common/dto/pagination.dto";

/** GET /jobs/accounts — COMPLETED | DELIVERED | CLOSED aggregate list. */
export class AccountsJobsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    default: PAGINATION_DEFAULT_LIMIT,
    minimum: 1,
    maximum: PAGINATION_MAX_LIMIT,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  limit: number = PAGINATION_DEFAULT_LIMIT;

  @ApiPropertyOptional({ description: "Matches job_number, commodity." })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({
    description: "Filter by job_date / updated_at from (ISO date)",
  })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({
    description: "Filter by job_date / updated_at to (ISO date)",
  })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
