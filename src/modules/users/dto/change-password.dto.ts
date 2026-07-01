import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { IsStrongPassword, Match } from '../validators/password.validator';

export class ChangePasswordDto {
  @ApiProperty({ description: "User's current password." })
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
