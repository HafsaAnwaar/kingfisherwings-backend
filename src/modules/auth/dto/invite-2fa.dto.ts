import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length, MinLength } from 'class-validator';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';
import { IsStrongPassword } from '../../users/validators/password.validator';

export class InviteUserDto {
  @ApiProperty({ format: 'uuid', description: 'Existing INVITED user to send an invite link for.' })
  @IsUUID()
  user_id!: string;

  @ApiPropertyOptional({ description: 'Override recipient email (defaults to the user record).' })
  @IsOptional()
  @IsStrictEmail()
  email?: string;
}

export class AcceptInviteDto {
  @ApiProperty()
  @IsString()
  @MinLength(20)
  token!: string;

  @ApiProperty({ description: 'New password meeting platform strength policy.' })
  @IsString()
  @IsStrongPassword()
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  last_name?: string;
}

export class TotpVerifyDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 8)
  code!: string;
}

export class DisableTwoFactorDto {
  @ApiProperty({ description: 'Current password confirmation.' })
  @IsString()
  @MinLength(1)
  password!: string;

  @ApiPropertyOptional({ description: 'TOTP or backup code if 2FA is already on.' })
  @IsOptional()
  @IsString()
  code?: string;
}
