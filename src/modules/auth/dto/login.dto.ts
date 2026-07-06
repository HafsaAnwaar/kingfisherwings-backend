// src/modules/auth/dto/login.dto.ts

import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class LoginDto {

  // ==========================
  // Tenant Resolution
  // ==========================

  @IsString()
  tenant_slug!: string;

  // ==========================
  // Credentials
  // ==========================

  @IsEmail()
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

}