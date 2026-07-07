import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PartyCreditStatus } from '@prisma/client';

export class UpdateCreditStatusDto {
  @ApiProperty({ enum: PartyCreditStatus })
  @IsEnum(PartyCreditStatus)
  credit_status!: PartyCreditStatus;

  @ApiPropertyOptional({ description: 'Recorded for audit purposes, e.g. "Overdue 90+ days".' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
