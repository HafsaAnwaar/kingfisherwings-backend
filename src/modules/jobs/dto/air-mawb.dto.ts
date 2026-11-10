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
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { AirPalletLineDto } from "./air-workflow.dto";

/**
 * MAWB tab + show_all air fields.
 * Send null or "" to clear a value.
 */
export class UpdateAirMawbDto {
  @ApiPropertyOptional({ description: "Alias: flight_number" })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  @MaxLength(20)
  flight_no?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  @MaxLength(20)
  flight_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  @MaxLength(40)
  flight_status?: string | null;

  @ApiPropertyOptional({
    description: "Flight departure date (YYYY-MM-DD). null/\"\" clears.",
    example: "2026-11-10",
  })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsDateString()
  flight_date?: string | null;

  @ApiPropertyOptional({
    description: "Shipment / cargo date (YYYY-MM-DD). null/\"\" clears.",
    example: "2026-11-09",
  })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsDateString()
  shipment_date?: string | null;

  @ApiPropertyOptional({ description: "Alias: mawb_number" })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  @MaxLength(50)
  mawb_no?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  @MaxLength(50)
  mawb_number?: string | null;

  @ApiPropertyOptional({ description: "Alias: hawb_number" })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  @MaxLength(50)
  hawb_no?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  @MaxLength(50)
  hawb_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  @MaxLength(20)
  arrival_flight_number?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== "")
  @IsString()
  @MaxLength(200)
  airline_name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pallet_count?: number | null;

  @ApiPropertyOptional({ type: [AirPalletLineDto] })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AirPalletLineDto)
  air_pallet?: AirPalletLineDto[] | null;

  @ApiPropertyOptional({ description: "Volume CBM / dimensions. null clears." })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dimensions?: number | null;

  @ApiPropertyOptional({
    description: "Alias for dimensions (volume_cbm)",
  })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume_cbm?: number | null;

  @ApiPropertyOptional({ description: "Gross weight kg. null clears." })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number | null;

  @ApiPropertyOptional({ description: "Alias for weight (gross_weight)" })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  gross_weight?: number | null;
}
