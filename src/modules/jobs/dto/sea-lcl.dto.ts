import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID } from "class-validator";

export class AttachLclHouseDto {
  @ApiProperty({
    format: "uuid",
    description: "Existing house SEA_LCL_* job to attach under this master",
  })
  @IsUUID()
  house_job_id: string;
}

export class LinkLclTranshipmentDto {
  @ApiProperty({
    format: "uuid",
    description: "Outbound SEA_LCL_EXPORT or SEA_FCL_EXPORT job",
  })
  @IsUUID()
  export_job_id: string;
}

export class LinkLclWmsStorageDto {
  @ApiProperty({
    format: "uuid",
    description: "Week 17 WMS storage charge row for cargo in tenant warehouse",
  })
  @IsUUID()
  wms_storage_charge_id: string;
}

export class LclCfsStorageCalculationDto {
  @ApiPropertyOptional({
    description: "Calculate storage as of this date (defaults to today)",
  })
  @IsOptional()
  @IsDateString()
  as_of_date?: string;
}
