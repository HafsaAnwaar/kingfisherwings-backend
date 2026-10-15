import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Allowlisted fields editable on a closed job when actor has
 * jobs.closed_delivery.edit.
 */
export class PatchJobClosedOverridesDto {
  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  cargo_delivered_date?: string;

  @ApiPropertyOptional({ description: "DO status / remarks label" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  do_status?: string;

  @ApiPropertyOptional({ description: "DO remarks" })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  return_to_terminal_date?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  load_onboard_date?: string;

  @ApiPropertyOptional({ description: "Commodity note on job header" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity_note?: string;
}
