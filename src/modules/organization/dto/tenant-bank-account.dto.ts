import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateTenantBankAccountDto {
  @ApiProperty({ example: 'Emirates NBD' })
  @IsString()
  @Length(2, 200)
  bank_name!: string;

  @ApiProperty({ example: 'Oceanic Freight Forwarders LLC' })
  @IsString()
  @Length(2, 200)
  account_name!: string;

  @ApiProperty({ example: '1234567890123' })
  @IsString()
  @Length(1, 50)
  account_number!: string;

  @ApiPropertyOptional({ example: 'AE070331234567890123456' })
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional({ example: 'EBILAEAD' })
  @IsOptional()
  @IsString()
  swift_code?: string;

  @ApiPropertyOptional({ default: 'AED' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Linked Chart of Accounts bank ledger account' })
  @IsOptional()
  @IsUUID()
  gl_account_id?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTenantBankAccountDto extends PartialType(CreateTenantBankAccountDto) {}
