import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
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
  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  amount_claimed!: number;

  @ApiProperty({ example: "2026-09-30" })
  @IsDateString()
  payment_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
