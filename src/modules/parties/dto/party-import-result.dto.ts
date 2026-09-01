import { ApiProperty } from "@nestjs/swagger";

export class ImportRowError {
  @ApiProperty({
    description: "1-indexed data row number (header row not counted).",
  })
  row!: number;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty()
  message!: string;
}

export class PartyImportResultDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  imported!: number;

  @ApiProperty()
  failed!: number;

  @ApiProperty({ type: [String] })
  createdIds!: string[];

  @ApiProperty({ type: [ImportRowError] })
  errors!: ImportRowError[];
}
