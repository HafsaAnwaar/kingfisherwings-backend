import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class ReviewPaymentProofDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  review_notes?: string;
}

export class CreatePaymentProofBodyDto {
  amount_claimed!: number;
  payment_date!: string;
  reference_number?: string;
  notes?: string;
}

export class ApprovePaymentProofDto extends ReviewPaymentProofDto {
  @ApiPropertyOptional({
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({
    description: "Bank account the money was received into / paid from.",
  })
  @IsOptional()
  @IsUUID()
  bank_account_id?: string;
}

export class StaffUploadPaymentProofDto {
  @ApiProperty({
    description:
      "Claimed payment amount. Multipart fields arrive as strings — Transform coerces them (same as portal).",
    example: "100.00",
  })
  @Transform(({ value }) => {
    if (value == null || value === "") return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  })
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: "amount_claimed must be a valid number" },
  )
  @Min(0.0001, { message: "amount_claimed must be positive" })
  amount_claimed!: number;

  @ApiProperty({
    description: "Payment date YYYY-MM-DD",
    example: "2026-09-30",
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsDateString({}, { message: "payment_date must be a valid ISO date" })
  payment_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  @MaxLength(100)
  reference_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
