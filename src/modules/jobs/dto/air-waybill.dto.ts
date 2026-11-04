import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class UpsertAirWaybillDto {
  @ApiProperty({ enum: ["MAWB", "HAWB"] })
  @IsIn(["MAWB", "HAWB"])
  awb_type!: "MAWB" | "HAWB";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  awb_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  flight_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  flight_status?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  shipper_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  consignee_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  pieces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gross_weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_draft?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_original?: boolean;
}

export class UpdateAirWaybillDto extends PartialType(UpsertAirWaybillDto) {}
