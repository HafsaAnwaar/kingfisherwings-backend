import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HrLetterType } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';

export class GenerateLetterDto {
  @ApiProperty()
  @IsUUID()
  employee_id!: string;

  @ApiProperty({ enum: HrLetterType })
  @IsEnum(HrLetterType)
  letter_type!: HrLetterType;

  @ApiPropertyOptional({ description: 'Template variables / letter-specific payload' })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
