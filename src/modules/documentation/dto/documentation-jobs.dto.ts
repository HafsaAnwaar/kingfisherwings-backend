import { ApiPropertyOptional } from "@nestjs/swagger";
import { JobStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { DocumentationPaginationDto } from "./documentation-pagination.dto";
import { CreateJobDto } from "../../jobs/dto/job.dto";
import { CreateJobChargeDto } from "../../jobs/dto/job-charge.dto";

export class DocumentationJobsQueryDto extends DocumentationPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  billing_party_id?: string;

  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;
}

export class DocumentationCreateJobDto extends CreateJobDto {
  @ApiPropertyOptional({ type: [CreateJobChargeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJobChargeDto)
  initial_charges?: CreateJobChargeDto[];
}
