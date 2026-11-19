import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Res,
  StreamableFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Response } from "express";
import { memoryStorage } from "multer";
import { RolesGuard } from "../users/guards/roles.guard";
import { Roles } from "../users/decorators/roles.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { OrganizationService } from "./organization.service";

@ApiTags("Organization Profile")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller("organization")
export class OrganizationLogoController {
  constructor(private readonly service: OrganizationService) {}

  @Get("logo")
  @ApiOperation({
    summary: "Download current organization logo bytes",
    description:
      "Authenticated binary endpoint for sidebar/PDF embed. Always returns the current tenant logo from durable storage (no R2 CORS / expiry).",
  })
  @ApiProduces("image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml")
  async getLogo(
    @CurrentUser("tenantId") tenantId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.service.getLogoBytes(tenantId);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.fileName.replace(/"/g, "")}"`,
    );
    res.setHeader("Cache-Control", "private, max-age=300");
    return new StreamableFile(file.buffer);
  }

  @Post("logo")
  @Roles(UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"],
    },
  })
  @ApiOperation({
    summary: "Upload organization logo (multipart field: file)",
    description:
      "Stores the file and persists a durable logo_url on Tenant (CDN or /files/…). Never stores presigned R2 URLs. Returned by GET /organization/profile.",
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadLogo(
    @CurrentUser("tenantId") tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded — use field name "file".');
    }
    return this.service.uploadLogo(tenantId, file);
  }
}
