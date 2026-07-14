import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { JobType } from '@prisma/client';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';

/** Operational sub-job under a parent job (Week 4). */
export class CreateSubJobDto {
  @ApiPropertyOptional({ enum: JobType, description: 'Defaults to the parent job type.' })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  agent_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class SchedulePreAlertDto {
  @ApiProperty({ example: 'consignee@example.com' })
  @IsStrictEmail()
  to_email!: string;

  @ApiProperty({ example: '2026-07-20T10:00:00.000Z' })
  @IsDateString()
  scheduled_at!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class CreatePaymentRequestFromJobDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ example: 'AED' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;
}

export class SendWhatsAppStatusDto {
  @ApiProperty({ example: '+971501234567' })
  @IsString()
  @MinLength(8)
  to_phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
