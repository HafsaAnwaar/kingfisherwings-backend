import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
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
