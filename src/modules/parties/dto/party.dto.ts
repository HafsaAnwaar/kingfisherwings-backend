import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PartyType } from '@prisma/client';

export class CreatePartyDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiProperty({ enum: PartyType })
  @IsEnum(PartyType)
  party_type!: PartyType;

  @ApiProperty({ example: 'CUST-001' })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: 'Al Noor Trading LLC' })
  @IsString()
  @Length(2, 300)
  name!: string;

  @ApiPropertyOptional({ example: 'Al Noor' })
  @IsOptional()
  @IsString()
  short_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vat_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cr_number?: string;

  @ApiPropertyOptional({ example: 'AE' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiPropertyOptional({ example: 'Dubai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  credit_limit?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  credit_days?: number;

  @ApiPropertyOptional({ example: 'AED' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'User this party is assigned to.' })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  portal_access?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  marketing_subscription?: boolean;

  @ApiPropertyOptional({ example: 'EK', description: 'For airline-type parties.' })
  @IsOptional()
  @IsString()
  iata_code?: string;

  @ApiPropertyOptional({ example: 'MAEU', description: 'For shipping-line-type parties.' })
  @IsOptional()
  @IsString()
  scac_code?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

/** credit_status is deliberately excluded — see UpdateCreditStatusDto / PATCH /parties/:id/credit-status. */
export class UpdatePartyDto extends PartialType(CreatePartyDto) {}
