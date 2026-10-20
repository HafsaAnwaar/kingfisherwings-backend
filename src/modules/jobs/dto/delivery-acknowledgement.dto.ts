import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Allow, IsOptional, IsString, MaxLength } from "class-validator";

export class SubmitDeliveryAcknowledgementDto {
  @ApiProperty({ example: "Ahmed Al-Mansoori" })
  @IsString()
  @MaxLength(200)
  receiver_name!: string;

  @ApiPropertyOptional({ example: "Warehouse Supervisor" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  receiver_title?: string;

  @ApiPropertyOptional({
    example: "Good condition",
    description: "Condition of goods on receipt",
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  goods_condition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  remarks?: string;

  /**
   * Frontend may send this; server always stamps `acknowledged_at` on submit.
   * Accepted so forbidNonWhitelisted does not reject the request.
   */
  @ApiPropertyOptional({
    description: "Ignored — server sets acknowledgement timestamp on submit.",
  })
  @Allow()
  @IsOptional()
  acknowledged_at?: unknown;

  /** Common misspelling / alias from clients — also ignored. */
  @ApiPropertyOptional({ deprecated: true })
  @Allow()
  @IsOptional()
  acknowledge_at?: unknown;
}

export class ReceiveDeliveryAcknowledgementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
