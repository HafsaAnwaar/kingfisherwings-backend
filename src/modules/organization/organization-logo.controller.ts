import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { memoryStorage } from "multer";
import { RolesGuard } from "../users/guards/roles.guard";
import { Roles } from "../users/decorators/roles.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { OrganizationService } from "./organization.service";

@ApiTags("Organization Profile")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
@Controller("organization")
export class OrganizationLogoController {
  constructor(private readonly service: OrganizationService) {}

  @Post("logo")
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
      "Persists Tenant.logo_url; returned by GET /organization/profile.",
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
