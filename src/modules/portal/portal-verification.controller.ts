import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { Response } from "express";
import { Public } from "../../common/decorators/public.decorators";
import { PartyVerificationService } from "../parties/party-verification.service";
import {
  VERIFICATION_DOC_MAX_BYTES,
  VERIFICATION_DOC_MIME,
} from "../parties/party-verification.constants";
import { BadRequestException } from "@nestjs/common";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalOnboarding } from "./decorators/portal-onboarding.decorator";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";

@ApiTags("Portal — Verification")
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@PortalOnboarding("verification")
@Controller("portal/verification")
export class PortalVerificationController {
  constructor(private readonly verification: PartyVerificationService) {}

  @Get()
  @ApiOperation({
    summary: "Get party verification status and uploaded documents",
  })
  get(@CurrentPortal() user: CurrentPortalUser) {
    return this.verification.getStatus(user.tenantId, user.partyId);
  }

  @Post("documents/:kind")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: VERIFICATION_DOC_MAX_BYTES, files: 1 },
      fileFilter: (_req, file, cb) => {
        if (!VERIFICATION_DOC_MIME.has(file.mimetype)) {
          return cb(
            new BadRequestException(
              "Only PDF, JPEG, PNG, or WebP documents are accepted.",
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: "Upload a verification document (VAT_CERTIFICATE, BUSINESS_LICENSE, OTHER)",
  })
  upload(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("kind") kind: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.verification.uploadDocument(
      user.tenantId,
      user.partyId,
      kind,
      file,
      { side: "portal", userId: user.id },
    );
  }

  @Delete("documents/:documentId")
  @ApiOperation({ summary: "Remove a verification document (not when APPROVED)" })
  remove(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("documentId", ParseUUIDPipe) documentId: string,
  ) {
    return this.verification.deleteDocument(
      user.tenantId,
      user.partyId,
      documentId,
    );
  }

  @Post("submit")
  @ApiOperation({
    summary: "Submit for Tenant Admin review (requires VAT + license)",
  })
  submit(@CurrentPortal() user: CurrentPortalUser) {
    return this.verification.submit(user.tenantId, user.partyId);
  }

  @Get("documents/:documentId/download")
  @ApiOperation({ summary: "Download own uploaded verification document" })
  download(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Res() res: Response,
  ) {
    return this.verification.downloadDocument(
      user.tenantId,
      user.partyId,
      documentId,
      res,
    );
  }
}
