import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

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

export class ReviseAndSendLineDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  line_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}

export class ReviseAndSendDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  message!: string;

  @ApiPropertyOptional({
    description:
      "Revised total offered to the customer. Updates revenue lines on the quotation.",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  proposed_total?: number;

  @ApiPropertyOptional({ type: [ReviseAndSendLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviseAndSendLineDto)
  lines?: ReviseAndSendLineDto[];
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
