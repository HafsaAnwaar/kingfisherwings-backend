import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  Allow,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { InvoiceStatus, InvoiceType } from "@prisma/client";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";

/** Empty string / null → undefined so optional UUID fields do not 400. */
const emptyToUndef = ({ value }: { value: unknown }) =>
  value === "" || value === null ? undefined : value;

export class CreateInvoiceLineDto {
  @ApiProperty({ example: "Ocean Freight" })
  @IsString()
  @Length(1, 300)
  description!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({
    example: 1500,
    description:
      "Unit price. If omitted, `amount` is accepted as a FE alias (treated as unit_price).",
  })
  @Transform(({ value, obj }) => {
    const raw =
      value !== undefined && value !== null && value !== ""
        ? value
        : (obj as { amount?: unknown })?.amount;
    return raw === undefined || raw === null || raw === ""
      ? raw
      : Number(raw);
  })
  @IsNumber()
  @Min(0)
  unit_price!: number;

  /** FE alias for unit_price — whitelisted so forbidNonWhitelisted does not 400. */
  @ApiPropertyOptional({
    example: 1500,
    description: "Alias for unit_price when quantity is 1",
  })
  @IsOptional()
  @Allow()
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const asUuid = (v: unknown) =>
      typeof v === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        v,
      )
        ? v
        : undefined;
    const fromValue = asUuid(value);
    if (fromValue) return fromValue;
    const cc = (obj as { charge_code?: unknown })?.charge_code;
    if (cc && typeof cc === "object" && cc !== null && "id" in cc) {
      return asUuid((cc as { id: unknown }).id);
    }
    return asUuid(cc);
  })
  @IsUUID()
  charge_code_id?: string;

  /** FE may send nested charge_code / code string — allow through whitelist. */
  @ApiPropertyOptional()
  @IsOptional()
  @Allow()
  charge_code?: unknown;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @Transform(emptyToUndef)
  @IsUUID()
  tax_rate_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true" || value === 1 || value === "1") return true;
    if (value === "false" || value === 0 || value === "0") return false;
    return value;
  })
  @IsBoolean()
  is_taxable?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort_order?: number;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @Transform(emptyToUndef)
  @IsUUID()
  job_charge_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @Transform(emptyToUndef)
  @IsUUID()
  job_id?: string;
}

export class UpdateInvoiceLineDto extends PartialType(CreateInvoiceLineDto) {}

export class CreateInvoiceDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  party_id!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @Transform(emptyToUndef)
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Omit for manual invoices (no linked job)",
  })
  @IsOptional()
  @Transform(emptyToUndef)
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Source vendor job offer when auto-creating a purchase invoice",
  })
  @IsOptional()
  @IsUUID()
  vendor_quote_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiProperty({ example: "AED" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchange_rate?: number;

  @ApiPropertyOptional({ default: 5, description: "UAE VAT default 5%" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vat_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  invoice_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lpo_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internal_notes?: string;

  @ApiPropertyOptional({ type: [CreateInvoiceLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines?: CreateInvoiceLineDto[];
}

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}

export class CreateCreditNoteDto {
  @ApiProperty({
    format: "uuid",
    description: "Original customer invoice being credited",
  })
  @IsUUID()
  credited_invoice_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ type: [CreateInvoiceLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines?: CreateInvoiceLineDto[];
}

/** Extra charge against a posted customer invoice (Ch.18). */
export class CreateDebitNoteDto {
  @ApiProperty({
    format: "uuid",
    description: "Original customer invoice being debited",
  })
  @IsUUID()
  credited_invoice_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ type: [CreateInvoiceLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines?: CreateInvoiceLineDto[];
}

export class CreatePurchaseInvoiceDto extends CreateInvoiceDto {
  @ApiProperty({ format: "uuid", description: "Vendor/supplier party" })
  @IsUUID()
  party_id!: string;
}

export class SendInvoiceEmailDto {
  @ApiProperty({ example: "customer@example.com" })
  @IsStrictEmail()
  to_email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  message?: string;

  @ApiPropertyOptional({
    default: true,
    description:
      "Include a secure Stripe 'Pay Now' link when online payments are enabled and the invoice has a balance.",
  })
  @IsOptional()
  @IsBoolean()
  include_payment_link?: boolean;

  @ApiPropertyOptional({
    description:
      "Client PDF as base64. When set (or multipart `file`), that PDF is emailed — server does not regenerate a template.",
  })
  @IsOptional()
  @IsString()
  pdf_base64?: string;
}

export class StoreInvoicePdfDto {
  @ApiPropertyOptional({
    description:
      "Client-rendered KingFisher PDF as base64. Prefer multipart field `file`.",
  })
  @IsOptional()
  @IsString()
  pdf_base64?: string;
}

export class InvoiceQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ enum: InvoiceType })
  @IsOptional()
  @IsEnum(InvoiceType)
  invoice_type?: InvoiceType;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

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
