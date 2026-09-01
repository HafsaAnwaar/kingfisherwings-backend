import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { HrLoanStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from "class-validator";

export class CreateLoanDto {
  @ApiProperty()
  @IsUUID()
  employee_id!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  principal!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  interest_rate?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tenure_months!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 300)
  purpose?: string;
}

export class CreateAdvanceDto {
  @ApiProperty()
  @IsUUID()
  employee_id!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 300)
  reason?: string;
}

export class LoanReviewDto {
  @ApiProperty({ enum: HrLoanStatus })
  @IsEnum(HrLoanStatus)
  status!: HrLoanStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  review_notes?: string;
}
