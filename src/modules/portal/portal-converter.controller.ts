import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { ConverterService } from "../tools/converter.service";
import { ConverterCbmDto } from "../tools/dto/converter-cbm.dto";
import { ConverterLengthDto } from "../tools/dto/converter-length.dto";
import { ConverterLiquidDto } from "../tools/dto/converter-liquid.dto";
import { ConverterVolumeDto } from "../tools/dto/converter-volume.dto";
import { ConverterWeightDto } from "../tools/dto/converter-weight.dto";
import { PortalAuthGuard } from "./guards/portal-auth.guard";

@ApiTags("Portal Tools")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/tools/converter")
export class PortalConverterController {
  constructor(private readonly converter: ConverterService) {}

  @Post("length")
  @ApiOperation({ summary: "Fresa-parity length converter (portal)" })
  length(@Body() dto: ConverterLengthDto) {
    return this.converter.convertLength(dto);
  }

  @Post("cbm")
  @ApiOperation({ summary: "Cubic meter and volume weight (portal)" })
  cbm(@Body() dto: ConverterCbmDto) {
    return this.converter.convertCbm(dto);
  }

  @Post("weight")
  @ApiOperation({ summary: "Weight converter (portal)" })
  weight(@Body() dto: ConverterWeightDto) {
    return this.converter.convertWeight(dto);
  }

  @Post("liquid")
  @ApiOperation({ summary: "Liquid volume converter (portal)" })
  liquid(@Body() dto: ConverterLiquidDto) {
    return this.converter.convertLiquid(dto);
  }

  @Post("volume")
  @ApiOperation({ summary: "Cubic volume unit converter (portal)" })
  volume(@Body() dto: ConverterVolumeDto) {
    return this.converter.convertVolume(dto);
  }
}
