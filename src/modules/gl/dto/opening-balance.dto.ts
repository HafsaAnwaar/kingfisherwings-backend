import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from "class-validator";

export class PartyOpeningBalanceDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  party_id!: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0.0001)
  amount!: number;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ description: "ISO date for invoice / voucher" })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description:
      "When true, create+post a manual CUSTOMER_INVOICE (AR) or PURCHASE_INVOICE (AP) so statements/open-items work.",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  create_manual_invoice?: boolean;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({
    description:
      "Also bump the AR/AP control account opening_balance and return CoA account id",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  link_coa?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  narration?: string;
}

export class CoaOpeningBalanceDto {
  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ enum: ["DEBIT", "CREDIT"], default: "DEBIT" })
  @IsIn(["DEBIT", "CREDIT"])
  opening_balance_type!: "DEBIT" | "CREDIT";

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description:
      "When true, create+post an OPENING_BALANCE voucher (account vs retained earnings)",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  create_voucher?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  narration?: string;
}
