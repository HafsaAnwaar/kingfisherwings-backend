import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateBankDto {
  @ApiProperty({ example: 'Emirates NBD' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 'ENBD' })
  @IsOptional()
  @IsString()
  short_name?: string;

  @ApiPropertyOptional({ example: 'EBILAEAD' })
  @IsOptional()
  @IsString()
  swift_code?: string;

  @ApiPropertyOptional({ example: 'AE07' })
  @IsOptional()
  @IsString()
  iban_prefix?: string;

  @ApiPropertyOptional({ example: 'AE' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateBankDto extends PartialType(CreateBankDto) {}
