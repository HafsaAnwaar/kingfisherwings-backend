import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";

export class SendPreAlertDto {
  @ApiProperty({ example: "consignee@example.com" })
  @IsStrictEmail()
  to_email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
