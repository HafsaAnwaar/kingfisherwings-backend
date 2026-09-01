import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";
import { IsStrongPassword, Match } from "../validators/password.validator";

/**
 * Completes a forgot-password flow using the token issued via
 * UsersService.requestPasswordReset. The Auth module (Phase 1) owns
 * issuing/emailing the token and rate-limiting the request endpoint;
 * this DTO/consumption logic lives in the Users module since it operates
 * directly on the User aggregate.
 */
export class ResetPasswordDto {
  @ApiProperty({ description: "Password reset token received via email." })
  @IsString()
  @MinLength(1)
  token!: string;

  @ApiProperty({
    description: "New password meeting the platform strength policy.",
  })
  @IsString()
  @IsStrongPassword()
  new_password!: string;

  @ApiProperty({ description: "Must match new_password." })
  @IsString()
  @Match("new_password")
  confirm_password!: string;
}
