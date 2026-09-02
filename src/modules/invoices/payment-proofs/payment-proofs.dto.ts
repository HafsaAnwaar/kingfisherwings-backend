import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

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
