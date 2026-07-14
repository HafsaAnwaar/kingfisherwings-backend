// src/modules/auth/dto/login.dto.ts

import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';

export class LoginDto {

  // ==========================
  // Tenant Resolution
  // ==========================

  @IsString()
  tenant_slug!: string;

  // ==========================
  // Credentials
  // ==========================

  @IsStrictEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  // ==========================
  // Session Preferences
  // ==========================

  @IsOptional()
  @IsBoolean()
  remember_me?: boolean;

  @IsOptional()
  @IsString()
  device_name?: string;

  @ApiPropertyOptional({ description: 'Client MAC when MAC allow-list is configured for the user.' })
  @IsOptional()
  @IsString()
  mac_address?: string;

  @ApiPropertyOptional({ description: 'TOTP code when two-factor authentication is enabled.' })
  @IsOptional()
  @IsString()
  totp_code?: string;

  @ApiPropertyOptional({ description: 'One-time backup code as alternative to TOTP.' })
  @IsOptional()
  @IsString()
  backup_code?: string;
}