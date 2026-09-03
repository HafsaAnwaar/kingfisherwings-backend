import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
} from "class-validator";

/**
 * Dimensions in metres are preferred. CBM is always
 * Length(m) × Width(m) × Height(m) × pieces (never taken from the client).
 * Centimetres are accepted and converted (÷ 100).
 */
export class CargoPackageDto {
  @ApiPropertyOptional({ example: 1.2, description: "Length in metres" })
  @ValidateIf((o: CargoPackageDto) => o.length_cm == null)
  @IsNumber()
  @Min(0.001)
  length_m?: number;

  @ApiPropertyOptional({ example: 0.8, description: "Width in metres" })
  @ValidateIf((o: CargoPackageDto) => o.width_cm == null)
  @IsNumber()
  @Min(0.001)
  width_m?: number;

  @ApiPropertyOptional({ example: 1.0, description: "Height in metres" })
  @ValidateIf((o: CargoPackageDto) => o.height_cm == null)
  @IsNumber()
  @Min(0.001)
  height_m?: number;

  @ApiPropertyOptional({ example: 120, description: "Length in centimetres (alternative to metres)" })
  @ValidateIf((o: CargoPackageDto) => o.length_m == null)
  @IsNumber()
  @Min(0.01)
  length_cm?: number;

  @ApiPropertyOptional({ example: 80 })
  @ValidateIf((o: CargoPackageDto) => o.width_m == null)
  @IsNumber()
  @Min(0.01)
  width_cm?: number;

  @ApiPropertyOptional({ example: 100 })
  @ValidateIf((o: CargoPackageDto) => o.height_m == null)
  @IsNumber()
  @Min(0.01)
  height_cm?: number;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(0)
  gross_weight_kg!: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pieces?: number = 1;
}
