import { ApiProperty } from "@nestjs/swagger";
import { DocumentationEdiType } from "@prisma/client";
import { IsEnum } from "class-validator";

export class GenerateJobEdiDto {
  @ApiProperty({
    enum: DocumentationEdiType,
    description: "EDI type to generate for this job",
  })
  @IsEnum(DocumentationEdiType)
  edi_type!: DocumentationEdiType;
}
