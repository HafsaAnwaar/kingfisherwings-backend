import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { JobStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class ChangeJobStatusDto {
  @ApiProperty({
    description:
      "Catalog code (system JobStatus or tenant custom status). Custom codes map via maps_to_system_status.",
    example: "IN_PROGRESS",
  })
  @IsString()
  @MaxLength(40)
  status!: string;

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
