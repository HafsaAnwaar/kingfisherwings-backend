import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

/**
 * Admin resets a target user's password immediately (no token flow).
 * A temporary password is generated server-side and returned to the
 * caller (or emailed, if send_email is true — email dispatch is wired
 * once the Notifications module exists).
 */
export class AdminResetPasswordDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  require_password_change?: boolean = true;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  send_email?: boolean = false;
}
