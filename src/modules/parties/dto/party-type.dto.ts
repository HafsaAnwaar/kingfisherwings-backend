import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length, Matches } from "class-validator";

export class CreatePartyTypeDto {
  @ApiProperty({
    example: "FORWARDER",
    description: "Stable code (letters, numbers, underscore). Stored uppercase.",
  })
  @IsString()
  @Length(2, 60)
  @Matches(/^[A-Za-z][A-Za-z0-9_]*$/, {
    message: "code must start with a letter and use only letters, numbers, underscore",
  })
  code!: string;

  @ApiProperty({ example: "Forwarder" })
  @IsString()
  @Length(2, 120)
  label!: string;
}

export class PartyTypeRowDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  is_system!: boolean;

  @ApiPropertyOptional()
  id?: string;
}
