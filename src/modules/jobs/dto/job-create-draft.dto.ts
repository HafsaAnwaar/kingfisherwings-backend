import { ApiPropertyOptional } from "@nestjs/swagger";
import { JobType } from "@prisma/client";
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from "class-validator";

export class UpsertJobCreateDraftDto {
  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ example: "parties" })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  step?: string;

  @ApiPropertyOptional({
    description: "Opaque wizard payload (FE shape). Max ~512KB when serialized.",
  })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class JobCreateDraftQueryDto {
  @ApiPropertyOptional({ description: "When true, only the latest draft" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  current?: string;
}
