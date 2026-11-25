import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  BlDocumentStatus,
  DocumentationDoStatus,
  JobType,
  ShipmentStatus,
} from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateIf,
} from "class-validator";
import { DocumentationPaginationDto } from "./documentation-pagination.dto";

export class UpdateDeliveryOrderDto {
  @ApiProperty()
  @IsString()
  @Length(1, 50)
  do_number!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  do_date?: string;

  @ApiPropertyOptional({ enum: DocumentationDoStatus })
  @IsOptional()
  @IsEnum(DocumentationDoStatus)
  do_status?: DocumentationDoStatus;
}

export class ClosedJobsQueryDto extends DocumentationPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;
}

export class UpdateShipmentBlStatusDto {
  @ApiPropertyOptional({ enum: ShipmentStatus })
  @ValidateIf((o: UpdateShipmentBlStatusDto) => o.bl_status == null)
  @IsEnum(ShipmentStatus)
  shipment_status?: ShipmentStatus;

  @ApiPropertyOptional({ enum: BlDocumentStatus })
  @ValidateIf((o: UpdateShipmentBlStatusDto) => o.shipment_status == null)
  @IsEnum(BlDocumentStatus)
  bl_status?: BlDocumentStatus;
}
