import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class CreateTruckerDto {
  @ApiProperty({ example: 'Al Futtaim Logistics' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: 'TRK-001' })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiPropertyOptional({ example: 'AE' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Ahmed Khan' })
  @IsOptional()
  @IsString()
  contact_person?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTruckerDto extends PartialType(CreateTruckerDto) {}
