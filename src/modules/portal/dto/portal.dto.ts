import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, Length, MinLength } from 'class-validator';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';

export class PortalLoginDto {
  @ApiProperty({ example: 'kingfisher', description: 'Tenant slug — same as online-quote.' })
  @IsString()
  @Length(2, 100)
  tenant_slug!: string;

  @ApiProperty({ example: 'john@acme.com' })
  @IsStrictEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}

export class PortalRefreshDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  refresh_token!: string;
}

export class CreatePortalUserDto {
  @ApiProperty({ format: 'uuid', description: 'Customer Party that will own this portal login.' })
  @IsUUID()
  party_id!: string;

  @ApiProperty({ example: 'john@acme.com' })
  @IsStrictEmail()
  email!: string;

  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @Length(2, 200)
  full_name!: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsString()
  @Length(5, 30)
  phone?: string;

  @ApiPropertyOptional({
    description: 'If omitted, a temporary password is generated and returned once (and emailed when SMTP is configured).',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ description: 'When true (default), send credentials email if SMTP is configured.' })
  @IsOptional()
  @IsBoolean()
  send_email?: boolean;
}

export class UpdatePortalUserStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'DISABLED'] })
  @IsIn(['ACTIVE', 'DISABLED'])
  status!: 'ACTIVE' | 'DISABLED';
}

export class ResetPortalPasswordDto {
  @ApiPropertyOptional({
    description: 'If omitted, a temporary password is generated and returned once.',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ description: 'When true (default), email the new password when SMTP is configured.' })
  @IsOptional()
  @IsBoolean()
  send_email?: boolean;
}

export class PortalUserQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filter by Party.company_id — for company-scoped admin views within a tenant.',
  })
  @IsOptional()
  @IsUUID()
  company_id?: string;
}
