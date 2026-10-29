import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateJobMilestoneDto {
  @ApiPropertyOptional({
    example: "2026-07-15T14:30:00.000Z",
    description:
      "Actual completion date (or date-time). Sets completed_at for customer date+time display.",
  })
  @IsOptional()
  @IsDateString()
  actual_date?: string;

  @ApiPropertyOptional({
    example: "2026-07-15T14:30:00.000Z",
    description:
      "Explicit completion timestamp shown to customers. Defaults to now when marking complete.",
  })
  @IsOptional()
  @IsDateString()
  completed_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  planned_date?: string;

  @ApiPropertyOptional({
    example: "Cargo cleared; awaiting pickup at CFS.",
    description:
      "Customer-visible description shown with every milestone (date & time).",
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @ApiPropertyOptional({
    deprecated: true,
    description: "Alias of description (kept for older clients)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class CreateCustomMilestoneDto {
  @ApiProperty({
    example: "CUSTOMS_QUERY_RAISED",
    description:
      "Free-form milestone name, for anything outside the standard taxonomy.",
  })
  @IsString()
  milestone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  planned_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  actual_date?: string;

  @ApiPropertyOptional({
    example: "Query raised with customs for HS code clarification.",
    description: "Customer-visible description",
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @ApiPropertyOptional({
    deprecated: true,
    description: "Alias of description",
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
