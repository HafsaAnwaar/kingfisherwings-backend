import { BadRequestException, Injectable } from "@nestjs/common";
import {
  convertCbm,
  convertLength,
  convertLiquid,
  convertVolume,
  convertWeight,
} from "../../common/utils/fresa-converter.util";
import { ConverterCbmDto } from "./dto/converter-cbm.dto";
import { ConverterLengthDto } from "./dto/converter-length.dto";
import { ConverterLiquidDto } from "./dto/converter-liquid.dto";
import { ConverterVolumeDto } from "./dto/converter-volume.dto";
import { ConverterWeightDto } from "./dto/converter-weight.dto";

@Injectable()
export class ConverterService {
  convertLength(dto: ConverterLengthDto) {
    const data = convertLength(dto);
    if (data.message) {
      throw new BadRequestException(data.message);
    }
    return { success: true, data };
  }

  convertCbm(dto: ConverterCbmDto) {
    const data = convertCbm(dto);
    if (data.message) {
      throw new BadRequestException(data.message);
    }
    return { success: true, data };
  }

  convertWeight(dto: ConverterWeightDto) {
    const data = convertWeight(dto);
    if (data.message) {
      throw new BadRequestException(data.message);
    }
    return { success: true, data };
  }

  convertLiquid(dto: ConverterLiquidDto) {
    const data = convertLiquid(dto);
    if (data.message) {
      throw new BadRequestException(data.message);
    }
    return { success: true, data };
  }

  convertVolume(dto: ConverterVolumeDto) {
    const data = convertVolume(dto);
    if (data.message) {
      throw new BadRequestException(data.message);
    }
    return { success: true, data };
  }
}
