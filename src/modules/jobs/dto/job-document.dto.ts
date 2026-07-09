import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateJobDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  document_type!: DocumentType;

  @ApiProperty({ example: 'HAWB-KFW-AE-001.pdf' })
  @IsString()
  @Length(1, 300)
  file_name!: string;

  @ApiProperty({ description: 'Public or signed URL where the generated/uploaded file is stored.' })
  @IsString()
  file_url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  reference_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  s3_key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  file_size?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mime_type?: string;
}

export class UpdateJobDocumentDto extends PartialType(CreateJobDocumentDto) {}

export class FinalizeJobDocumentDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_finalized?: boolean;
}
