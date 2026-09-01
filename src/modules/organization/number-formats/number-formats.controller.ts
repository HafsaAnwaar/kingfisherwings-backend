import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DocumentNumberType, UserRole } from "@prisma/client";

import { NumberFormatsService } from "./number-formats.service";
import { NumberGeneratorService } from "./number-generator.service";
import {
  CreateNumberFormatDto,
  UpdateNumberFormatDto,
} from "../dto/number-format.dto";

import { RolesGuard } from "../../users/guards/roles.guard";
import { Roles } from "../../users/decorators/roles.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";

@ApiTags("Organization — Number Formats")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.TENANT_ADMIN)
@Controller("organization/number-formats")
export class NumberFormatsController {
  constructor(
    private readonly service: NumberFormatsService,
    private readonly generator: NumberGeneratorService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "List all configured document number formats (Ch.2.2)",
  })
  findAll(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(":documentType")
  @ApiOperation({ summary: "Get the number format for one document type" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("documentType") documentType: DocumentNumberType,
  ) {
    return this.service.findOne(tenantId, documentType);
  }

  @Get(":documentType/preview")
  @ApiOperation({
    summary:
      "Preview the next number for this format without consuming a sequence value",
  })
  preview(
    @CurrentUser("tenantId") tenantId: string,
    @Param("documentType") documentType: DocumentNumberType,
  ) {
    return this.generator
      .preview(tenantId, documentType)
      .then((example) => ({ example }));
  }

  @Post()
  @ApiOperation({ summary: "Configure the number format for a document type" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateNumberFormatDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(":documentType")
  @ApiOperation({ summary: "Update the number format for a document type" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("documentType") documentType: DocumentNumberType,
    @Body() dto: UpdateNumberFormatDto,
  ) {
    return this.service.update(tenantId, documentType, dto, actorId);
  }
}
