import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { JobReopenRequestStatus, JobStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateJobReopenRequestDto {
  @ApiProperty({
    description: "Why the job should be reopened",
    example: "Need to correct container numbers after customer update",
  })
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  reason!: string;

  @ApiPropertyOptional({
    enum: JobStatus,
    description: "Target status after approve (default IN_PROGRESS)",
  })
  @IsOptional()
  @IsEnum(JobStatus)
  target_status?: JobStatus;
}

export class ReviewJobReopenRequestDto {
  @ApiPropertyOptional({ description: "Admin notes on approve/reject" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  @ApiPropertyOptional({
    description: "Required when rejecting",
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  reason?: string;
}

export class ListJobReopenRequestsQueryDto {
  @ApiPropertyOptional({ enum: JobReopenRequestStatus })
  @IsOptional()
  @IsEnum(JobReopenRequestStatus)
  status?: JobReopenRequestStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit?: number = 50;
}
