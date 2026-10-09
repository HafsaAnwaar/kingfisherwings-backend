import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { CreateShipmentDto } from "../../shipments/dto/shipment.dto";

/** Attach existing shipments and/or create one under a master job. */
export class JobShipmentsBodyDto {
  @ApiPropertyOptional({
    type: [String],
    format: "uuid",
    description: "Existing shipment IDs to attach (job_id = this job).",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  shipment_ids?: string[];

  @ApiPropertyOptional({
    type: () => CreateShipmentDto,
    description: "Create a new shipment already linked to this job.",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateShipmentDto)
  create?: CreateShipmentDto;
}

export class AttachJobShipmentsDto {
  @ApiPropertyOptional({ type: [String], format: "uuid" })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  shipment_ids?: string[];
}

export class CopyJobDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  copy_parties?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: "Origin/dest ports and ETD/ETA.",
  })
  @IsOptional()
  @IsBoolean()
  copy_route?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  copy_containers?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  copy_sale?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  copy_cost?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: "Weights, CBM, pieces, container_type/count.",
  })
  @IsOptional()
  @IsBoolean()
  copy_dimensions?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  copy_department?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: "Vessel / voyage on sea FCL/LCL details.",
  })
  @IsOptional()
  @IsBoolean()
  copy_vessel?: boolean;
}

export class CloseJobDto {
  @ApiPropertyOptional({
    default: false,
    description: "When true, close even if checklist has blockers.",
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class ProrateToShipmentsDto {
  @ApiPropertyOptional({
    format: "uuid",
    description: "Master job cost charge_code_id to distribute.",
  })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Specific job charge line to prorate (preferred if set).",
  })
  @IsOptional()
  @IsUUID()
  job_charge_id?: string;
}

export class CancelProrateDto {
  @ApiPropertyOptional({
    format: "uuid",
    description: "Limit cancel to lines prorated from this job charge.",
  })
  @IsOptional()
  @IsUUID()
  job_charge_id?: string;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Limit cancel to charge code matching master cost lines.",
  })
  @IsOptional()
  @IsUUID()
  charge_code_id?: string;
}
