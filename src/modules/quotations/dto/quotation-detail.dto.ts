import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { QuotationStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class ChangeQuotationStatusDto {
  @ApiProperty({
    description: "Catalog code (system or custom). Custom maps via maps_to_system_status.",
  })
  @IsString()
  @MaxLength(40)
  status!: string;

  @ApiPropertyOptional({ description: "Audit / status history reason" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
