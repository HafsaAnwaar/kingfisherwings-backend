import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { JobStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class ChangeJobStatusDto {
  @ApiProperty({
    enum: JobStatus,
    description: "Operational status (e.g. IN_PROGRESS, ON_HOLD, DOCS_PENDING)",
  })
  @IsEnum(JobStatus)
  status!: JobStatus;

  @ApiPropertyOptional({ description: "Audit reason for the status change" })
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
