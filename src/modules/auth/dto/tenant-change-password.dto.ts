import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { IsStrongPassword, Match } from '../../users/validators/password.validator';

/**
 * Changes Tenant.password_hash — the credential checked by
 * POST /auth/tenant-login. Distinct from a user's own password
 * (POST /auth/change-password / POST /users/me/change-password),
 * which changes User.password_hash instead. The two are set to the
 * same value at tenant creation but are independent from then on.
 */
export class TenantChangePasswordDto {
  @ApiProperty({ description: "The tenant's current login password." })
  @IsString()
  @MinLength(1)
  current_password!: string;

  @ApiProperty({ description: 'New password meeting the platform strength policy.' })
  @IsString()
  @IsStrongPassword()
  new_password!: string;

  @ApiProperty({ description: 'Must match new_password.' })
  @IsString()
  @Match('new_password')
  confirm_password!: string;
}
