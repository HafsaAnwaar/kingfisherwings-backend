import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { AirPalletLineDto } from "./air-workflow.dto";

export class UpdateAirMawbDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  flight_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  flight_status?: string;

  @ApiPropertyOptional({
    description: "Flight departure date (YYYY-MM-DD)",
    example: "2026-11-10",
  })
  @IsOptional()
  @IsDateString()
  flight_date?: string | null;

  @ApiPropertyOptional({
    description: "Shipment / cargo date (YYYY-MM-DD)",
    example: "2026-11-09",
  })
  @IsOptional()
  @IsDateString()
  shipment_date?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mawb_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hawb_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  pallet_count?: number;

  @ApiPropertyOptional({ type: [AirPalletLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirPalletLineDto)
  air_pallet?: AirPalletLineDto[];

  @ApiPropertyOptional({ description: "Volume CBM / dimensions" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensions?: number;

  @ApiPropertyOptional({ description: "Gross weight kg" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}
