import {
  BadRequestException,
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
import { CurrentVendor } from "./decorators/vendor.decorators";
import { VendorOnboarding } from "./decorators/vendor-onboarding.decorator";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";

@ApiTags("Vendor — Verification")
@ApiBearerAuth()
@Public()
@UseGuards(VendorAuthGuard)
@VendorOnboarding("verification")
@Controller("vendor/verification")
export class VendorVerificationController {
  constructor(private readonly verification: PartyVerificationService) {}

  @Get()
  @ApiOperation({
    summary: "Get party verification status and uploaded documents",
  })
  get(@CurrentVendor() user: CurrentVendorUser) {
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
    @CurrentVendor() user: CurrentVendorUser,
    @Param("kind") kind: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.verification.uploadDocument(
      user.tenantId,
      user.partyId,
      kind,
      file,
      { side: "vendor", userId: user.id },
    );
  }

  @Delete("documents/:documentId")
  @ApiOperation({ summary: "Remove a verification document (not when APPROVED)" })
  remove(
    @CurrentVendor() user: CurrentVendorUser,
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
  submit(@CurrentVendor() user: CurrentVendorUser) {
    return this.verification.submit(user.tenantId, user.partyId);
  }

  @Get("documents/:documentId/download")
  @ApiOperation({ summary: "Download own uploaded verification document" })
  download(
    @CurrentVendor() user: CurrentVendorUser,
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
