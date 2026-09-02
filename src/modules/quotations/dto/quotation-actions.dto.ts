import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

const LOSS_REASONS = [
  "Competitor Rate",
  "No Space",
  "Cargo Type",
  "No Longer Required",
  "Booked Elsewhere",
  "Price Too High",
  "Other",
];

export class MarkLostDto {
  @ApiProperty({ enum: LOSS_REASONS })
  @IsIn(LOSS_REASONS)
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ApprovalDecisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comments?: string;
}

export class ReviseAndSendDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  message!: string;
}

export class NegotiationRejectDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  message!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  terminal?: boolean;
}
