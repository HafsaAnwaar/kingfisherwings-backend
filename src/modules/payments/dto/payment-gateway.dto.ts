import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from "class-validator";

export class UpdatePaymentGatewaySettingsDto {
  @ApiPropertyOptional({ description: "Turn online (Stripe) payments on/off." })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;

  @ApiPropertyOptional({
    description:
      "Collect through the platform's Stripe account instead of the company's own. " +
      "Super Admin only (PUT /platform/tenants/:tenantId/payment-gateway); tenants get 403.",
  })
  @IsOptional()
  @IsBoolean()
  use_platform_account?: boolean;

  @ApiPropertyOptional({
    description:
      "Stripe secret or restricted key (sk_/rk_). Write-only; stored encrypted.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  secret_key?: string;

  @ApiPropertyOptional({ description: "Stripe publishable key (pk_)." })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  publishable_key?: string;

  @ApiPropertyOptional({
    description:
      "Webhook signing secret (whsec_). Write-only; stored encrypted.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  webhook_secret?: string;

  @ApiPropertyOptional({
    description: "Allow payers to pay less than the full balance due.",
  })
  @IsOptional()
  @IsBoolean()
  allow_partial_payments?: boolean;

  @ApiPropertyOptional({
    description:
      "Bank account (with linked GL account) that Stripe receipts post to.",
  })
  @IsOptional()
  @IsUUID()
  bank_account_id?: string;

  @ApiPropertyOptional({
    description:
      "Expense GL account for Stripe processing fees. When set, each Stripe receipt gets a journal " +
      "(Dr fees / Cr bank) so the bank account nets to what Stripe pays out.",
  })
  @IsOptional()
  @IsUUID()
  fee_gl_account_id?: string;

  @ApiPropertyOptional({
    default: true,
    description:
      "Stripe Connect: automatically pay approved vendor payment requests to the vendor's connected account.",
  })
  @IsOptional()
  @IsBoolean()
  auto_vendor_payouts?: boolean;

  @ApiPropertyOptional({
    description:
      "Signing secret (whsec_) of this company's Stripe Connect webhook endpoint. Write-only; stored encrypted.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  connect_webhook_secret?: string;

  @ApiPropertyOptional({ maxLength: 22 })
  @IsOptional()
  @IsString()
  @MaxLength(22)
  @Matches(/^[^<>\\'"*]*$/, {
    message: "statement_descriptor has invalid characters.",
  })
  statement_descriptor?: string;
}
