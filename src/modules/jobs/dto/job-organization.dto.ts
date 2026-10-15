import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { JobPartyReferenceType, JobPartyRole } from "@prisma/client";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from "class-validator";

export class UpsertJobPartyReferenceDto {
  @ApiPropertyOptional({ enum: JobPartyRole, default: JobPartyRole.CLIENT })
  @IsOptional()
  @IsEnum(JobPartyRole)
  party_role?: JobPartyRole;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiProperty({ enum: JobPartyReferenceType, example: "PO_NUMBER" })
  @IsEnum(JobPartyReferenceType)
  reference_type!: JobPartyReferenceType;

  @ApiProperty({ description: "Reference No. (e.g. PO Number)" })
  @IsString()
  @Length(1, 100)
  reference_no!: string;
}

export class UpsertTypedJobReferenceDto {
  @ApiProperty({ description: "Reference value (SABER / RA / ISF / etc.)" })
  @IsString()
  @Length(1, 100)
  reference_no!: string;

  @ApiPropertyOptional({ enum: JobPartyRole, default: JobPartyRole.CLIENT })
  @IsOptional()
  @IsEnum(JobPartyRole)
  party_role?: JobPartyRole;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;
}

export class PatchJobDimensionsDto {
  @ApiPropertyOptional({ description: "Commodity description on Dimension tab" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commodity_description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12)
  hs_code?: string;
}
