import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { JobPartyRole, PartyType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { CreatePartyDto } from "../../parties/dto/party.dto";

export const JOB_ORGANIZATION_TYPES: JobPartyRole[] = [
  JobPartyRole.CLIENT,
  JobPartyRole.SHIPPER,
  JobPartyRole.CONSIGNEE,
  JobPartyRole.NOTIFY,
  JobPartyRole.BILLING_PARTY,
  JobPartyRole.AGENT,
  JobPartyRole.OVERSEAS_AGENT,
  JobPartyRole.VENDOR,
];

/** Party types allowed for OVERSEAS_AGENT org role. */
export const OVERSEAS_AGENT_PARTY_TYPES: PartyType[] = [
  PartyType.OVERSEAS_AGENT,
  PartyType.AGENT,
];

/** Inline party create for Organization Add flow (subset of CreatePartyDto). */
export class InlineCreatePartyDto {
  @ApiProperty({ enum: PartyType })
  @IsEnum(PartyType)
  party_type!: PartyType;

  @ApiProperty({ example: "CUST-001" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Al Noor Trading LLC" })
  @IsString()
  @Length(2, 300)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  short_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vat_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}

export class AddJobOrganizationDto {
  @ApiProperty({ enum: JobPartyRole, example: "CLIENT" })
  @IsEnum(JobPartyRole)
  org_type!: JobPartyRole;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Existing party — required unless create_party is set",
  })
  @ValidateIf((o: AddJobOrganizationDto) => !o.create_party)
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({
    type: InlineCreatePartyDto,
    description: "Create a new party and link it",
  })
  @ValidateIf((o: AddJobOrganizationDto) => !o.party_id)
  @ValidateNested()
  @Type(() => InlineCreatePartyDto)
  create_party?: InlineCreatePartyDto;

  @ApiPropertyOptional({
    description: "Mark as primary customer (default true for CLIENT)",
  })
  @IsOptional()
  @IsBoolean()
  is_primary_customer?: boolean;
}

export class ReplaceJobOrganizationDto {
  @ApiPropertyOptional({ format: "uuid" })
  @ValidateIf((o: ReplaceJobOrganizationDto) => !o.create_party)
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ type: InlineCreatePartyDto })
  @ValidateIf((o: ReplaceJobOrganizationDto) => !o.party_id)
  @ValidateNested()
  @Type(() => InlineCreatePartyDto)
  create_party?: InlineCreatePartyDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_primary_customer?: boolean;
}

export class CopyJobOrganizationsDto {
  @ApiPropertyOptional({
    format: "uuid",
    description: "Source job (default: parent_job_id)",
  })
  @IsOptional()
  @IsUUID()
  source_job_id?: string;

  @ApiPropertyOptional({
    default: false,
    description: "Overwrite existing org types on target",
  })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}

export class RefreshOrgPartySnapshotDto {
  @ApiPropertyOptional({
    description: "Refresh all org types when omitted",
    enum: JobPartyRole,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(JobPartyRole, { each: true })
  org_types?: JobPartyRole[];
}

/** Re-export for controllers that need CreatePartyDto shape. */
export type { CreatePartyDto };
