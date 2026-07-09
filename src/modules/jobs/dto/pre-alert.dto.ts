import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendPreAlertDto {
  @ApiPropertyOptional({ example: 'consignee@example.com' })
  @IsOptional()
  @IsEmail()
  to_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
