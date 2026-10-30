import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentationEdiType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

export class GenerateJobEdiDto {
  @ApiProperty({
    enum: DocumentationEdiType,
    description: "EDI type to generate for this job",
  })
  @IsEnum(DocumentationEdiType)
  edi_type!: DocumentationEdiType;

  @ApiPropertyOptional({
    type: [String],
    example: ["64085", "64086L"],
    description:
      "Company codes for MANIFEST_CSDP — each code emits a VOY/BOL/(CTR/CON) block in one file. Required for MANIFEST_CSDP.",
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Length(1, 40, { each: true })
  @Type(() => String)
  company_codes?: string[];
}
