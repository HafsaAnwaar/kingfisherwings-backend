import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
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
  @IsEnum(PortalDisputeStatus)
  status!: Extract<PortalDisputeStatus, 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED'>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  staff_notes?: string;
}

export class ReviewCreditLimitRequestDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(CreditLimitRequestStatus)
  status!: Extract<CreditLimitRequestStatus, 'APPROVED' | 'REJECTED'>;

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
  unread_only?: string;
}
