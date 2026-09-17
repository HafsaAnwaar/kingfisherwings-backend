import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional } from "class-validator";
import { FRESA_CBM_UNITS, FresaCbmUnit } from "../../../common/utils/fresa-converter.util";

export class ConverterCbmDto {
  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  length!: number;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  width!: number;

  @ApiProperty({ example: 40 })
  @Type(() => Number)
  @IsNumber()
  height!: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  quantity!: number;

  @ApiPropertyOptional({ enum: FRESA_CBM_UNITS, default: "C" })
  @IsOptional()
  @IsIn([...FRESA_CBM_UNITS])
  unit?: FresaCbmUnit;
}
