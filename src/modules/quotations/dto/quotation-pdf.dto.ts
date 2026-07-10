import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { QuotationPdfMode } from '@prisma/client';

export class GenerateQuotationPdfDto {
  @ApiProperty({ enum: QuotationPdfMode, default: QuotationPdfMode.CUSTOMER })
  @IsEnum(QuotationPdfMode)
  mode!: QuotationPdfMode;

  @ApiPropertyOptional({ description: 'Template layout variant identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  layout_variant?: string;
}

export class SendQuotationEmailDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  to_email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  cc_email?: string;

  @ApiPropertyOptional({ enum: QuotationPdfMode, default: QuotationPdfMode.CUSTOMER })
  @IsOptional()
  @IsEnum(QuotationPdfMode)
  pdf_mode?: QuotationPdfMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
