import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
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
import { RolesGuard } from "../users/guards/roles.guard";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import {
  CreateOpsAttachmentMetaDto,
  CreateOpsComplaintDto,
  CreateOpsFollowUpDto,
  CreateOpsLinkDto,
  CreateOpsReferenceDto,
  CreateOpsTagDto,
  PatchOpsComplaintDto,
} from "./dto/ops-activity.dto";
import { OpsActivityService } from "./ops-activity.service";

/**
 * Shared continuum side panels for Enquiry → Quotation → Shipment → Job.
 * Paths: `/ops/:entityType/:entityId/...` where entityType is ENQUIRY|QUOTATION|SHIPMENT|JOB.
 */
@ApiTags("Ops Activity Continuum")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller("ops")
export class OpsActivityController {
  constructor(private readonly service: OpsActivityService) {}

  @Get(":entityType/:entityId/follow-ups")
  @ApiOperation({ summary: "List follow-ups on enquiry/quote/shipment/job" })
  listFollowUps(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    return this.service.listFollowUps(tenantId, entityType, entityId);
  }

  @Post(":entityType/:entityId/follow-ups")
  createFollowUp(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Body() dto: CreateOpsFollowUpDto,
  ) {
    return this.service.createFollowUp(
      tenantId,
      entityType,
      entityId,
      dto,
      actorId,
    );
  }

  @Get(":entityType/:entityId/attachments")
  listAttachments(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    return this.service.listAttachments(tenantId, entityType, entityId);
  }

  @Post(":entityType/:entityId/attachments")
  @ApiOperation({
    summary:
      "Register attachment metadata (already on R2) — prefer multipart /attachments/upload",
  })
  addAttachment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Body() dto: CreateOpsAttachmentMetaDto,
  ) {
    return this.service.addAttachment(
      tenantId,
      entityType,
      entityId,
      dto,
      actorId,
      { uploader_side: "STAFF" },
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
        visible_to_customer: { type: "boolean", default: true },
        visible_to_vendor: { type: "boolean", default: true },
      },
      required: ["file"],
    },
  })
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }))
  @ApiOperation({
    summary:
      "Staff upload continuum attachment to R2 — visible to customer/vendor when flags allow",
  })
  uploadAttachment(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      notes?: string;
      visible_to_customer?: string | boolean;
      visible_to_vendor?: string | boolean;
    },
  ) {
    const toBool = (v: string | boolean | undefined, def: boolean) => {
      if (v === undefined || v === null || v === "") return def;
      if (typeof v === "boolean") return v;
      return v === "true" || v === "1";
    };
    return this.service.uploadAttachmentFile(
      tenantId,
      entityType,
      entityId,
      file,
      actorId,
      {
        uploader_side: "STAFF",
        notes: body.notes,
        visible_to_customer: toBool(body.visible_to_customer, true),
        visible_to_vendor: toBool(body.visible_to_vendor, true),
      },
    );
  }

  @Get(":entityType/:entityId/attachments/:attachmentId/download")
  @ApiOperation({ summary: "Download continuum attachment (binary from R2)" })
  downloadAttachment(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
    @Res() res: Response,
  ) {
    return this.service.downloadAttachment(
      tenantId,
      entityType,
      entityId,
      attachmentId,
      res,
      "STAFF",
    );
  }

  @Get(":entityType/:entityId/attachments/:attachmentId/download-url")
  @ApiOperation({ summary: "Presigned R2 download URL for continuum attachment" })
  downloadUrl(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
  ) {
    return this.service.getAttachmentDownloadUrl(
      tenantId,
      entityType,
      entityId,
      attachmentId,
      "STAFF",
    );
  }

  @Get(":entityType/:entityId/references")
  listReferences(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    return this.service.listReferences(tenantId, entityType, entityId);
  }

  @Post(":entityType/:entityId/references")
  addReference(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Body() dto: CreateOpsReferenceDto,
  ) {
    return this.service.addReference(
      tenantId,
      entityType,
      entityId,
      dto,
      actorId,
    );
  }

  @Get(":entityType/:entityId/tags")
  listTags(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    return this.service.listTags(tenantId, entityType, entityId);
  }

  @Post(":entityType/:entityId/tags")
  addTag(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Body() dto: CreateOpsTagDto,
  ) {
    return this.service.addTag(tenantId, entityType, entityId, dto, actorId);
  }

  @Delete(":entityType/:entityId/tags/:tagId")
  removeTag(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Param("tagId", ParseUUIDPipe) tagId: string,
  ) {
    return this.service.removeTag(
      tenantId,
      entityType,
      entityId,
      tagId,
      actorId,
    );
  }

  @Get(":entityType/:entityId/links")
  listLinks(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    return this.service.listLinks(tenantId, entityType, entityId);
  }

  @Post(":entityType/:entityId/links")
  addLink(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Body() dto: CreateOpsLinkDto,
  ) {
    return this.service.addLink(tenantId, entityType, entityId, dto, actorId);
  }

  @Get(":entityType/:entityId/likes")
  listLikes(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    return this.service.listLikes(tenantId, entityType, entityId);
  }

  @Post(":entityType/:entityId/likes/toggle")
  toggleLike(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    return this.service.toggleLike(tenantId, entityType, entityId, userId);
  }

  @Get(":entityType/:entityId/complaints")
  listComplaints(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    return this.service.listComplaints(tenantId, entityType, entityId);
  }

  @Post(":entityType/:entityId/complaints")
  addComplaint(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Body() dto: CreateOpsComplaintDto,
  ) {
    return this.service.addComplaint(
      tenantId,
      entityType,
      entityId,
      dto,
      actorId,
    );
  }

  @Patch(":entityType/:entityId/complaints/:complaintId")
  patchComplaint(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
    @Param("complaintId", ParseUUIDPipe) complaintId: string,
    @Body() dto: PatchOpsComplaintDto,
  ) {
    return this.service.patchComplaint(
      tenantId,
      entityType,
      entityId,
      complaintId,
      dto,
      actorId,
    );
  }

  @Get(":entityType/:entityId/history")
  @ApiOperation({
    summary:
      "Change / activity history (AuditLog) for this enquiry/quote/shipment/job",
  })
  listHistory(
    @CurrentUser("tenantId") tenantId: string,
    @Param("entityType", new ParseEnumPipe(OpsEntityType))
    entityType: OpsEntityType,
    @Param("entityId", ParseUUIDPipe) entityId: string,
  ) {
    return this.service.listHistory(tenantId, entityType, entityId);
  }
}
