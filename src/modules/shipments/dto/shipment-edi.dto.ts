import { ApiProperty } from "@nestjs/swagger";
import { DocumentationEdiType } from "@prisma/client";
import { IsEnum } from "class-validator";

export class GenerateShipmentEdiDto {
  @ApiProperty({
    enum: DocumentationEdiType,
    description: "EDI type to generate (same picker as Job Generate EDI)",
  })
  @IsEnum(DocumentationEdiType)
  edi_type!: DocumentationEdiType;
}
