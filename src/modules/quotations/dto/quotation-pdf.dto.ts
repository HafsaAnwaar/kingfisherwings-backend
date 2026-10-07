import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { QuotationPdfMode } from "@prisma/client";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";

export class GenerateQuotationPdfDto {
  @ApiPropertyOptional({
    enum: QuotationPdfMode,
    default: QuotationPdfMode.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(QuotationPdfMode)
  mode?: QuotationPdfMode;

  @ApiPropertyOptional({ description: "Template layout variant identifier" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  layout_variant?: string;

  @ApiPropertyOptional({
    description:
      "Client-rendered KingFisher PDF as base64 (or data:application/pdf;base64,...). Prefer multipart field `file`.",
  })
  @IsOptional()
  @IsString()
  pdf_base64?: string;
}

export class SendQuotationEmailDto {
  @ApiProperty({ example: "customer@example.com" })
  @IsStrictEmail()
  to_email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsStrictEmail()
  cc_email?: string;

  @ApiPropertyOptional({
    enum: QuotationPdfMode,
    default: QuotationPdfMode.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(QuotationPdfMode)
  pdf_mode?: QuotationPdfMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional({
    description:
      "Client PDF as base64. When set (or multipart `file`), that PDF is emailed — server does not regenerate a template.",
  })
  @IsOptional()
  @IsString()
  pdf_base64?: string;
}
