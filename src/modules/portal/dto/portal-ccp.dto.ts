import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { CreditLimitRequestStatus, PortalDisputeStatus } from '@prisma/client';

export class CreatePortalMessageDto {
  @ApiProperty({ example: 'Question about shipment' })
  @IsString()
  @Length(3, 200)
  subject!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  body!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  job_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  invoice_id?: string;
}

export class PortalMessageReplyDto {
  @ApiProperty({ example: 'Thanks — we will check and get back to you.' })
  @IsString()
  @MinLength(1)
  body!: string;
}

export class PortalMessageQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class CreatePortalDisputeDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  invoice_id!: string;

  @ApiProperty({ example: 'Incorrect charge amount' })
  @IsString()
  @Length(3, 200)
  reason!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description!: string;
}

export class PortalDisputeQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ enum: PortalDisputeStatus })
  @IsOptional()
  @IsEnum(PortalDisputeStatus)
  status?: PortalDisputeStatus;
}

/** Staff desk list — includes optional party filter (whitelist-safe). */
export class StaffDisputeQueryDto extends PortalDisputeQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  party_id?: string;
}

export class CreateCreditLimitRequestDto {
  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  requested_limit!: number;

  @ApiProperty({ example: 'Expanding monthly volume into Q4.' })
  @IsString()
  @MinLength(10)
  justification!: string;
}

export class ReviewPortalDisputeDto {
  @ApiProperty({ enum: ['UNDER_REVIEW', 'RESOLVED', 'REJECTED'] })
  @IsIn(['UNDER_REVIEW', 'RESOLVED', 'REJECTED'])
  status!: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  staff_notes?: string;
}

export class ReviewCreditLimitRequestDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  review_notes?: string;

  @ApiPropertyOptional({
    description: 'When APPROVED, optionally set a different approved limit (defaults to requested).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  approved_limit?: number;
}

export class StaffPortalInboxQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ description: 'Only unread by staff' })
  @IsOptional()
  @IsString()
  unread_only?: string;
}

export class StaffCreditLimitRequestQueryDto extends StaffPortalInboxQueryDto {
  @ApiPropertyOptional({ enum: CreditLimitRequestStatus })
  @IsOptional()
  @IsEnum(CreditLimitRequestStatus)
  status?: CreditLimitRequestStatus;
}
