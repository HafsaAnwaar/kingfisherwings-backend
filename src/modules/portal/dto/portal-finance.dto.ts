import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { InvoiceStatus, InvoiceType } from "@prisma/client";

export class PortalInvoiceQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;
}

export class PortalPaymentQueryDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class PortalCreditAgingQueryDto {
  @ApiPropertyOptional({ description: "As-of date YYYY-MM-DD" })
  @IsOptional()
  @IsDateString()
  as_of?: string;
}

/** Multipart body for POST /portal/invoices/:id/payment-proofs */
export class UploadPortalPaymentProofDto {
  @ApiProperty({
    description: "Claimed payment amount (multipart fields arrive as strings)",
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

  @ApiProperty({ description: "Payment date YYYY-MM-DD", example: "2026-09-14" })
  @IsDateString({}, { message: "payment_date must be a valid ISO date" })
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

/** Re-export for internal filtering — portal never exposes PURCHASE_INVOICE. */
export const PORTAL_CUSTOMER_INVOICE_TYPES: InvoiceType[] = [
  InvoiceType.CUSTOMER_INVOICE,
  InvoiceType.DEBIT_NOTE,
];

export const PORTAL_VISIBLE_INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.POSTED,
  InvoiceStatus.SENT,
  InvoiceStatus.PARTIALLY_PAID,
  InvoiceStatus.PAID,
];
