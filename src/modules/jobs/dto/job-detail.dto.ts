import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { JobStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class ChangeJobStatusDto {
  @ApiProperty({
    enum: JobStatus,
    description: "Job status (any active catalog value)",
  })
  @IsEnum(JobStatus)
  status!: JobStatus;

  @ApiPropertyOptional({ description: "Audit reason for the status change" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ReopenJobDto {
  @ApiPropertyOptional({
    enum: JobStatus,
    description: "Target status after reopen (default IN_PROGRESS)",
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class StopJobDto {
  @ApiPropertyOptional({ description: "Reason for putting the job on hold" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
