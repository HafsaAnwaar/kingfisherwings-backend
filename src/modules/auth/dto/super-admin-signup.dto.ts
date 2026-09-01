import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";
import { IsStrongPassword } from "../../users/validators/password.validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";

export class SuperAdminSignupDto {
  @ApiProperty()
  @IsStrictEmail()
  email!: string;

  @ApiProperty({ description: "Meets the platform password strength policy." })
  @IsString()
  @IsStrongPassword()
  password!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  first_name!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  last_name!: string;
}
