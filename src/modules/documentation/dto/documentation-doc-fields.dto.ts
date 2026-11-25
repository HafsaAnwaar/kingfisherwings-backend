import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from "class-validator";

export class PatchJobDocFieldsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  portnet_ref_no?: string | null;

  @ApiPropertyOptional({ description: "Upserts JobPartyReference SABER" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  saber_certificate_no?: string | null;

  @ApiPropertyOptional({ description: "Upserts JobPartyReference RA_CODE" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ra_code?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @ValidateIf(
    (o: PatchJobDocFieldsDto) =>
      o.overseas_agent_party_id !== null &&
      o.overseas_agent_party_id !== undefined,
  )
  @IsUUID()
  overseas_agent_party_id?: string | null;

  @ApiPropertyOptional({
    format: "date",
    description: "Maps to sea FCL/LCL detail vgm_cutoff",
  })
  @IsOptional()
  @IsDateString()
  vgm_cutoff_date?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voyage_number?: string | null;
}
