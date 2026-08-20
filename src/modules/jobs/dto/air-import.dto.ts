import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomsExaminationResult } from '@prisma/client';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateCustomsExaminationDto {
  @ApiProperty()
  @IsDateString()
  examination_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  examining_officer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  items_examined?: string;

  @ApiProperty({ enum: CustomsExaminationResult })
  @IsEnum(CustomsExaminationResult)
  result!: CustomsExaminationResult;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class AirStorageCalculationQueryDto {
  @ApiPropertyOptional({ description: 'Calculate storage as of this date (defaults to today)' })
  @IsOptional()
  @IsDateString()
  as_of_date?: string;
}

export class SendImportNoticeDto {
  @ApiPropertyOptional({ description: 'Defaults to consignee email when omitted' })
  @IsOptional()
  @IsEmail()
  to_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  cc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 10000)
  message?: string;

  @ApiPropertyOptional({ description: 'ISO datetime — send later via scheduler when set' })
  @IsOptional()
  @IsDateString()
  schedule_at?: string;
}

export class LinkAirTranshipmentDto {
  @ApiProperty({ format: 'uuid', description: 'Outbound AIR_EXPORT or SEA_FCL_EXPORT job id' })
  @IsUUID()
  export_job_id!: string;
}
