import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateJobDocumentDto {
  @ApiPropertyOptional({ description: 'Template layout variant identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  layout_variant?: string;

  @ApiPropertyOptional({ default: false, description: 'Generate as ORIGINAL (vs DRAFT watermark)' })
  @IsOptional()
  @IsBoolean()
  is_original?: boolean;
}
