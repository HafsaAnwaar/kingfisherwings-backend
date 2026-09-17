import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { TOOLS_PERMISSIONS } from "./constants/tools-permission.constants";
import { ConverterService } from "./converter.service";
import { ConverterCbmDto } from "./dto/converter-cbm.dto";
import { ConverterLengthDto } from "./dto/converter-length.dto";
import { ConverterLiquidDto } from "./dto/converter-liquid.dto";
import { ConverterVolumeDto } from "./dto/converter-volume.dto";
import { ConverterWeightDto } from "./dto/converter-weight.dto";

@ApiTags("Tools")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("tools/converter")
export class ConverterController {
  constructor(private readonly converter: ConverterService) {}

  @Post("length")
  @RequirePermissions(TOOLS_PERMISSIONS.USE)
  @ApiOperation({ summary: "Fresa-parity length converter" })
  length(@Body() dto: ConverterLengthDto) {
    return this.converter.convertLength(dto);
  }

  @Post("cbm")
  @RequirePermissions(TOOLS_PERMISSIONS.USE)
  @ApiOperation({ summary: "Cubic meter and volume weight (CBM × 166.667)" })
  cbm(@Body() dto: ConverterCbmDto) {
    return this.converter.convertCbm(dto);
  }

  @Post("weight")
  @RequirePermissions(TOOLS_PERMISSIONS.USE)
  @ApiOperation({ summary: "Fresa-parity weight converter" })
  weight(@Body() dto: ConverterWeightDto) {
    return this.converter.convertWeight(dto);
  }

  @Post("liquid")
  @RequirePermissions(TOOLS_PERMISSIONS.USE)
  @ApiOperation({ summary: "Fresa-parity liquid volume converter" })
  liquid(@Body() dto: ConverterLiquidDto) {
    return this.converter.convertLiquid(dto);
  }

  @Post("volume")
  @RequirePermissions(TOOLS_PERMISSIONS.USE)
  @ApiOperation({ summary: "Cubic volume unit converter (CM/FT/IN/MT/MM)" })
  volume(@Body() dto: ConverterVolumeDto) {
    return this.converter.convertVolume(dto);
  }
}
