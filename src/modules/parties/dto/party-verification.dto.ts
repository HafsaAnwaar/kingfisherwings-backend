import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartyVerificationDocKind } from "@prisma/client";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class RejectPartyVerificationDto {
  @ApiProperty({ example: "VAT certificate is expired or illegible." })
  @IsString()
  @MaxLength(2000)
  reason!: string;
}

export class ApprovePartyVerificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export { PartyVerificationDocKind };
