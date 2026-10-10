import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { QuotationStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class ChangeQuotationStatusDto {
  @ApiProperty({ enum: QuotationStatus })
  @IsEnum(QuotationStatus)
  status!: QuotationStatus;

  @ApiPropertyOptional({ description: "Audit / status history reason" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
