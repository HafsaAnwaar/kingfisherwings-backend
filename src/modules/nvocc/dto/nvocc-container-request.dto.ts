import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { WorkflowStageOverrideDto } from "./nvocc-booking-form.dto";

export class CreateNvoccContainerRequestDto extends WorkflowStageOverrideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line_agent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  agent_reference_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  delivery_release_terminal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  request_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @ApiPropertyOptional({ description: "Optional external DPW reference text only" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dpw_reference_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vessel_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  in_voyage_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  out_voyage_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rotation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  load_cut_off_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  instruction_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  stuffing_location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  port_cfs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  receive_to_port_location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  move_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  destination_port?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  next_port_of_discharge?: string;

  @ApiPropertyOptional({ example: "GP[HC]-40" })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  iso_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  imco_code?: string;

  @ApiPropertyOptional({ example: "Storage-Empty" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiProperty({ example: 6 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  container_count!: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_oog?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_dry?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  temperature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  ventilation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  consignee_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  haulier_name?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;
}

export class UpdateNvoccContainerRequestDto extends PartialType(
  CreateNvoccContainerRequestDto,
) {}

export class AllocateContainersDto extends WorkflowStageOverrideDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  container_type_id?: string;
}
