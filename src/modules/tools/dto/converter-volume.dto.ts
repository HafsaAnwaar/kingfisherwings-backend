import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNumber } from "class-validator";
import {
  FRESA_VOLUME_UNITS,
  FresaVolumeUnit,
} from "../../../common/utils/fresa-converter.util";

export class ConverterVolumeDto {
  @ApiProperty({ enum: FRESA_VOLUME_UNITS, example: "MT" })
  @IsIn([...FRESA_VOLUME_UNITS])
  input_unit!: FresaVolumeUnit;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  value!: number;

  @ApiProperty({ enum: FRESA_VOLUME_UNITS, example: "CM" })
  @IsIn([...FRESA_VOLUME_UNITS])
  output_unit!: FresaVolumeUnit;
}
