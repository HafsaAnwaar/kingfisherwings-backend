import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { StorageService } from "../shared/storage/storage.service";
import { RolesGuard } from "../modules/users/guards/roles.guard";
import { CurrentUser } from "../modules/users/decorators/current-user.decorator";
import { isSuperAdminPrincipal } from "../common/utils/principal.util";

function guessMime(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

@ApiTags("Files")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller("files")
export class FilesController {
  constructor(private readonly storage: StorageService) {}

  @Get(":tenantId/:filename")
  @ApiOperation({
    summary: "Download a stored file (local or S3/R2)",
    description:
      "Caller tenant must match URL tenantId. Object key defaults to {tenantId}/{filename}; optional ?s3_key= override.",
  })
  async download(
    @CurrentUser() principal: unknown,
    @CurrentUser("tenantId") userTenantId: string | undefined,
    @Param("tenantId") tenantId: string,
    @Param("filename") filename: string,
    @Query("s3_key") s3Key: string | undefined,
    @Res() res: Response,
  ) {
    if (isSuperAdminPrincipal(principal) || !userTenantId) {
      throw new NotFoundException("File not found.");
    }

    if (userTenantId !== tenantId) {
      throw new NotFoundException("File not found.");
    }

    const decoded = decodeURIComponent(filename);
    // Private R2/S3 objects: default key to tenantId/filename when query omitted
    // (org logos and other durable /files/… refs).
    const resolvedKey =
      s3Key?.trim() ||
      this.storage.deriveObjectKey(`/files/${tenantId}/${decoded}`, tenantId) ||
      `${tenantId}/${decoded}`;

    try {
      const file = await this.storage.readByStoredFile(tenantId, {
        file_name: decoded,
        file_url: `/files/${tenantId}/${encodeURIComponent(decoded)}`,
        s3_key: resolvedKey,
        mime_type: guessMime(decoded),
      });
      res.setHeader("Content-Type", file.mimeType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${file.fileName}"`,
      );
      res.send(file.buffer);
    } catch {
      throw new NotFoundException("File not found.");
    }
  }
}
