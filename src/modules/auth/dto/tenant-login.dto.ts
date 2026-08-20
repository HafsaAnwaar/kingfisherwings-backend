import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class TenantLoginDto {
  @ApiProperty({ description: 'The tenant slug (same identifier used in POST /tenants).' })
  @IsString()
  tenant_slug!: string;

  @ApiProperty({ description: "The tenant's own password, set at creation." })
  @IsString()
  @MinLength(1)
  password!: string;

  @IsOptional()
  @IsBoolean()
  remember_me?: boolean;

  @IsOptional()
  @IsString()
  device_name?: string;

  @ApiProperty({ required: false, description: 'TOTP code when two-factor authentication is enabled on the tenant admin account.' })
  @IsOptional()
  @IsString()
  totp_code?: string;

  @ApiProperty({ required: false, description: 'One-time backup code as alternative to TOTP.' })
  @IsOptional()
  @IsString()
  backup_code?: string;
}
