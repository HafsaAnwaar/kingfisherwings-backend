import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { OnlinePaymentStatus } from "@prisma/client";

export class StartCheckoutDto {
  @ApiPropertyOptional({
    description:
      "Partial amount. Only honoured when the company allows partial payments; " +
      "always validated server-side against the invoice balance. Omit to pay the full balance.",
    example: 250.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;
}

export class CreatePaymentLinkDto {
  @ApiPropertyOptional({ default: 30, minimum: 1, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  expires_in_days?: number;

  @ApiPropertyOptional({
    description:
      "If set, the link is emailed (with the invoice PDF) to this address.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class RefundPaymentDto {
  @ApiPropertyOptional({
    description: "Amount to refund; defaults to the full refundable amount.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class OnlinePaymentQueryDto {
  @ApiPropertyOptional({ enum: OnlinePaymentStatus })
  @IsOptional()
  @IsEnum(OnlinePaymentStatus)
  status?: OnlinePaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  invoice_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
