import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsDateString, IsInt, IsOptional } from "class-validator";

export class CalculateStorageChargesDto {
  @ApiProperty({ description: "Storage Upto Date" })
  @IsDateString()
  storage_upto_date!: string;
}

export class ConfirmStorageChargesDto extends CalculateStorageChargesDto {
  @ApiPropertyOptional({
    description: "Indexes of calculated lines to post (default: all)",
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  line_keys?: number[];
}
