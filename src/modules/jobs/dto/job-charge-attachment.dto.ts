import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { JobChargeAttachmentSide } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateJobChargeAttachmentDto {
  @ApiProperty()
  @IsString()
  @Length(1, 300)
  file_name!: string;

  @ApiProperty()
  @IsString()
  file_url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  s3_key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  file_size?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  mime_type?: string;

  @ApiPropertyOptional({
    enum: JobChargeAttachmentSide,
    default: JobChargeAttachmentSide.CHARGE,
  })
  @IsOptional()
  @IsEnum(JobChargeAttachmentSide)
  side?: JobChargeAttachmentSide;
}
