import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, Length, Matches } from "class-validator";

export class SuperAdminVerifyOtpDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  challenge_id!: string;

  @ApiProperty({ example: "123456", description: "6-digit email OTP" })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  otp!: string;
}

export class SuperAdminResendOtpDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  challenge_id!: string;
}
