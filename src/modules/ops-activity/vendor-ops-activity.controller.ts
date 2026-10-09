import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { OpsEntityType } from "@prisma/client";
import { Response } from "express";
import "multer";
import { CurrentVendor } from "../vendor/decorators/vendor.decorators";
import { VendorAuthGuard } from "../vendor/guards/vendor-auth.guard";
import { CurrentVendorUser } from "../vendor/interfaces/vendor-auth.interfaces";
import { OpsActivityService } from "./ops-activity.service";

/**
 * Vendor continuum attachments on JOB / SHIPMENT (when linked via vendor quote).
 * Staff uploads with visible_to_vendor appear here; vendor uploads appear on staff /ops.
 */
@ApiTags("Vendor Ops Continuum")
@ApiBearerAuth()
@UseGuards(VendorAuthGuard)
@Controller("vendor/ops")
export class VendorOpsActivityController {
  constructor(private readonly service: OpsActivityService) {}

  @Get(":entityType/:entityId/attachments")
  @ApiOperation({
    summary: "List continuum attachments shared with this vendor",
  })
  async list(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    await this.service.assertAudienceAccess(
      user.tenantId,
      entityType,
      entityId,
      "VENDOR",
      user.partyId,
    );
    return this.service.listAttachments(
      user.tenantId,
      entityType,
      entityId,
      "VENDOR",
    );
  }

  @Post(":entityType/:entityId/attachments/upload")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        notes: { type: "string" },
      },
      required: ["file"],
    },
  })
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }),
  )
  @ApiOperation({
    summary: "Vendor upload continuum attachment (R2) — visible to staff",
  })
  async upload(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { notes?: string },
  ) {
    await this.service.assertAudienceAccess(
      user.tenantId,
      entityType,
      entityId,
      "VENDOR",
      user.partyId,
    );
    return this.service.uploadAttachmentFile(
      user.tenantId,
      entityType,
      entityId,
      file,
      user.id,
      {
        uploader_side: "VENDOR",
        party_id: user.partyId,
        notes: body.notes,
        visible_to_customer: false,
        visible_to_vendor: true,
      },
    );
  }

  @Get(":entityType/:entityId/attachments/:attachmentId/download")
  async download(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
    @Res() res: Response,
  ) {
    await this.service.assertAudienceAccess(
      user.tenantId,
      entityType,
      entityId,
      "VENDOR",
      user.partyId,
    );
    return this.service.downloadAttachment(
      user.tenantId,
      entityType,
      entityId,
      attachmentId,
      res,
      "VENDOR",
    );
  }

  @Get(":entityType/:entityId/attachments/:attachmentId/download-url")
  async downloadUrl(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
  ) {
    await this.service.assertAudienceAccess(
      user.tenantId,
      entityType,
      entityId,
      "VENDOR",
      user.partyId,
    );
    return this.service.getAttachmentDownloadUrl(
      user.tenantId,
      entityType,
      entityId,
      attachmentId,
      "VENDOR",
    );
  }
}
