import { ApiProperty } from "@nestjs/swagger";
import { JobDateSource } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateJobDateSettingsDto {
  @ApiProperty({ enum: JobDateSource })
  @IsEnum(JobDateSource)
  job_date_source!: JobDateSource;
}
