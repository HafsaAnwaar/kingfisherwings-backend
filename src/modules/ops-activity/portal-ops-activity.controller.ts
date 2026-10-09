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
import { CurrentPortal } from "../portal/decorators/portal.decorators";
import { PortalAuthGuard } from "../portal/guards/portal-auth.guard";
import { CurrentPortalUser } from "../portal/interfaces/portal-auth.interfaces";
import { OpsActivityService } from "./ops-activity.service";

/**
 * Customer portal continuum attachments — sees staff uploads (visible_to_customer)
 * and can upload docs that staff see on /ops/.../attachments.
 */
@ApiTags("Portal Ops Continuum")
@ApiBearerAuth()
@UseGuards(PortalAuthGuard)
@Controller("portal/ops")
export class PortalOpsActivityController {
  constructor(private readonly service: OpsActivityService) {}

  @Get(":entityType/:entityId/attachments")
  @ApiOperation({
    summary:
      "List continuum attachments shared with customer (staff + own uploads)",
  })
  async list(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    await this.service.assertAudienceAccess(
      user.tenantId,
      entityType,
      entityId,
      "CUSTOMER",
      user.partyId,
    );
    return this.service.listAttachments(
      user.tenantId,
      entityType,
      entityId,
      "CUSTOMER",
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
    summary: "Customer upload continuum attachment (R2) — visible to staff",
  })
  async upload(
    @CurrentPortal() user: CurrentPortalUser,
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
      "CUSTOMER",
      user.partyId,
    );
    return this.service.uploadAttachmentFile(
      user.tenantId,
      entityType,
      entityId,
      file,
      user.id,
      {
        uploader_side: "CUSTOMER",
        party_id: user.partyId,
        notes: body.notes,
        visible_to_customer: true,
        visible_to_vendor: false,
      },
    );
  }

  @Get(":entityType/:entityId/attachments/:attachmentId/download")
  async download(
    @CurrentPortal() user: CurrentPortalUser,
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
      "CUSTOMER",
      user.partyId,
    );
    return this.service.downloadAttachment(
      user.tenantId,
      entityType,
      entityId,
      attachmentId,
      res,
      "CUSTOMER",
    );
  }

  @Get(":entityType/:entityId/attachments/:attachmentId/download-url")
  async downloadUrl(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
  ) {
    await this.service.assertAudienceAccess(
      user.tenantId,
      entityType,
      entityId,
      "CUSTOMER",
      user.partyId,
    );
    return this.service.getAttachmentDownloadUrl(
      user.tenantId,
      entityType,
      entityId,
      attachmentId,
      "CUSTOMER",
    );
  }
}
