import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";
import { IsStrongPassword, Match } from "../../users/validators/password.validator";

export class ForgotPasswordDto {
  @ApiProperty({ example: "kingfisher" })
  @IsString()
  @MinLength(2)
  tenant_slug!: string;

  @ApiProperty({ example: "user@acme.com" })
  @IsStrictEmail()
  email!: string;
}

export class PublicResetPasswordDto {
  @ApiProperty({ description: "Password reset token from email." })
  @IsString()
  @MinLength(1)
  token!: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  new_password!: string;

  @ApiProperty()
  @IsString()
  @Match("new_password")
  confirm_password!: string;
}
