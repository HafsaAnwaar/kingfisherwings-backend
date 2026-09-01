import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";
import {
  IsKnownCurrencyCode,
  NormalizeCurrencyCode,
} from "../../../common/validators/country-aware.validators";

export class CreateExchangeRateDto {
  @ApiProperty({
    format: "uuid",
    description: "Currency being rated against the base currency.",
  })
  @IsUUID()
  currency_id!: string;

  @ApiProperty({
    example: "AED",
    description:
      "Should match the tenant base currency (from country defaults). Any ISO 4217 accepted; multi-currency freights rate against this base.",
  })
  @NormalizeCurrencyCode()
  @IsKnownCurrencyCode()
  base_currency!: string;

  @ApiProperty({ example: 3.6725 })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  rate!: number;

  @ApiProperty({ example: "2026-07-06" })
  @IsDateString()
  rate_date!: string;

  @ApiPropertyOptional({
    default: "manual",
    description: 'e.g. "xe.com" or "manual".',
  })
  @IsOptional()
  @IsString()
  source?: string;
}
