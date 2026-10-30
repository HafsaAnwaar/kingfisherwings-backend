import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from "class-validator";

export class PatchJobDepartmentDto {
  @ApiPropertyOptional({ description: "Branch name or code (preferred)" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  branch_name?: string | null;

  @ApiPropertyOptional({ format: "uuid", deprecated: true })
  @IsOptional()
  @IsUUID()
  branch_id?: string | null;

  @ApiPropertyOptional({ description: "Company name or code (preferred)" })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  company_name?: string | null;

  @ApiPropertyOptional({ format: "uuid", deprecated: true })
  @IsOptional()
  @IsUUID()
  company_id?: string | null;

  @ApiPropertyOptional({ description: "Department name or code (preferred)" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department_name?: string | null;

  @ApiPropertyOptional({ format: "uuid", deprecated: true })
  @IsOptional()
  @IsUUID()
  department_id?: string | null;

  @ApiPropertyOptional({
    description: "Salesperson full name or email (preferred)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  salesperson_name?: string | null;

  @ApiPropertyOptional({ format: "uuid", deprecated: true })
  @IsOptional()
  @IsUUID()
  salesperson_id?: string | null;
}

export class UpsertJobExchangeRateDto {
  @ApiProperty({ example: "USD" })
  @IsString()
  @Length(3, 3)
  currency_code!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  exchange_rate!: number;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  effective_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @ApiPropertyOptional({
    description: "When true, update matching job charge exchange rates",
  })
  @IsOptional()
  @IsBoolean()
  apply_to_charges?: boolean;
}

export class UpsertJobRoutingLegDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  leg_sequence?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  transport_mode?: string;

  @ApiPropertyOptional({ format: "uuid", description: "Via / call port" })
  @IsOptional()
  @IsUUID()
  port_id?: string;

  @ApiPropertyOptional({ description: "Via / call port name (preferred)" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  port_name?: string;

  @ApiPropertyOptional({ description: "Via / call port UN/LOCODE" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  port_code?: string;

  @ApiPropertyOptional({ format: "uuid", deprecated: true })
  @IsOptional()
  @IsUUID()
  origin_port_id?: string;

  @ApiPropertyOptional({ description: "Origin port name (preferred)" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin_port_name?: string;

  @ApiPropertyOptional({ description: "Origin port UN/LOCODE" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  origin_port_code?: string;

  @ApiPropertyOptional({ format: "uuid", deprecated: true })
  @IsOptional()
  @IsUUID()
  dest_port_id?: string;

  @ApiPropertyOptional({ description: "Destination port name (preferred)" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  dest_port_name?: string;

  @ApiPropertyOptional({ description: "Destination port UN/LOCODE" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dest_port_code?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional({ format: "uuid", deprecated: true })
  @IsOptional()
  @IsUUID()
  carrier_id?: string;

  @ApiPropertyOptional({ description: "Carrier party name or code (preferred)" })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  carrier_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  voyage_number?: string;
}

export class PushRoutingToSubJobsDto {
  @ApiPropertyOptional({
    description: "Replace existing child legs before copy. Default true.",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  replace_all?: boolean;

  @ApiPropertyOptional({
    description: "Include house jobs (all parent_job_id children). Default true.",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  include_houses?: boolean;

  @ApiPropertyOptional({
    description: "Only push to is_sub_job children",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_sub_job_only?: boolean;

  @ApiPropertyOptional({
    description: "Sync child job header ports/ETD/ETA from leg 1",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  sync_header?: boolean;
}

export class UpsertJobCustomsRefDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sb_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  boe_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customs_house?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  customs_status?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  filed_at?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  cleared_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
