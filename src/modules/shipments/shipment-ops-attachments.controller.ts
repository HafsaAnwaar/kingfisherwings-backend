import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
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
import type { Response } from "express";
import "multer";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { SHIPMENTS_PERMISSIONS } from "./constants/shipments-permission.constants";
import { OpsSectionAttachmentsService } from "../jobs/ops-section-attachments.service";

function optionalBool(v: string | boolean | undefined) {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "boolean") return v;
  return v === "true" || v === "1";
}

@ApiTags("Shipments")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("shipments")
export class ShipmentOpsAttachmentsController {
  constructor(private readonly attachments: OpsSectionAttachmentsService) {}

  @Get(":id/:section/attachments")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({
    summary:
      "List shipment section files (also copied to the linked job Documents tab)",
  })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("section") section: string,
    @Query("record_id") recordId?: string,
  ) {
    return this.attachments.list(tenantId, "SHIPMENT", id, section, recordId);
  }

  @Post(":id/:section/attachments")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.UPDATE)
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: {
        file: { type: "string", format: "binary" },
        record_id: { type: "string" },
        visible_to_customer: { type: "boolean" },
        visible_to_vendor: { type: "boolean" },
      },
    },
  })
  @ApiOperation({ summary: "Upload a file on a shipment ops section" })
  upload(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("section") section: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      record_id?: string;
      visible_to_customer?: string | boolean;
      visible_to_vendor?: string | boolean;
    },
  ) {
    return this.attachments.upload(
      tenantId,
      "SHIPMENT",
      id,
      section,
      file,
      actorId,
      {
        record_id: body.record_id,
        visible_to_customer: optionalBool(body.visible_to_customer),
        visible_to_vendor: optionalBool(body.visible_to_vendor),
      },
    );
  }

  @Get(":id/:section/attachments/:documentId/download")
  @RequirePermissions(SHIPMENTS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Open/download a shipment section attachment" })
  download(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("section") section: string,
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Res() res: Response,
  ) {
    return this.attachments.download(
      tenantId,
      "SHIPMENT",
      id,
      section,
      documentId,
      res,
    );
  }
}
