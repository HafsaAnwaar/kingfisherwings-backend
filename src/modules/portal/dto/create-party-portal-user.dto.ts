import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from "class-validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";

/** Body for Admin create under POST /parties/:partyId/portal-users (party from URL). */
export class CreatePartyPortalUserDto {
  @ApiProperty({ example: "john@acme.com" })
  @IsStrictEmail()
  email!: string;

  @ApiProperty({ example: "John Smith" })
  @IsString()
  @Length(2, 200)
  full_name!: string;

  @ApiPropertyOptional({ example: "+971501234567" })
  @IsOptional()
  @IsString()
  @Length(5, 30)
  phone?: string;

  @ApiPropertyOptional({
    description:
      "If omitted, a temporary password is generated and returned once (unless invite_mode).",
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: "When true (default), send email if SMTP is configured.",
  })
  @IsOptional()
  @IsBoolean()
  send_email?: boolean;

  @ApiPropertyOptional({
    description:
      "When true, create as INVITED and email an accept-invite link instead of a temporary password.",
  })
  @IsOptional()
  @IsBoolean()
  invite_mode?: boolean;
}
