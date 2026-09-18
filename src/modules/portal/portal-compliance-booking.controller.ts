import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
import { memoryStorage } from "multer";
import "multer";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalComplianceBookingService } from "./portal-compliance-booking.service";
import {
  SubmitNvoccComplianceFormDto,
  UpsertNvoccBookingFormDto,
} from "../nvocc/dto/nvocc-booking-form.dto";

const DOC_MAX_BYTES = 10 * 1024 * 1024;
const DOC_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function complianceDocInterceptor() {
  return FileInterceptor("file", {
    storage: memoryStorage(),
    limits: { fileSize: DOC_MAX_BYTES },
    fileFilter: (_req, file, callback) => {
      if (!DOC_MIME.has(file.mimetype)) {
        return callback(
          new BadRequestException(
            "Only PDF, Word, JPEG, PNG, or WebP files are accepted.",
          ),
          false,
        );
      }
      callback(null, true);
    },
  });
}

@ApiTags("Portal — Compliance Booking Form")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/bookings")
export class PortalComplianceBookingController {
  constructor(private readonly compliance: PortalComplianceBookingService) {}

  @Post(":id/accept")
  @ApiOperation({
    summary: "Accept NVOCC quote → CUSTOMER_ACCEPTED (unlocks compliance form)",
  })
  accept(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.compliance.acceptQuote(user, id);
  }

  @Get(":id/compliance-form")
  @ApiOperation({ summary: "Get compliance booking form (8-step fields)" })
  get(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.compliance.get(user, id);
  }

  @Put(":id/compliance-form")
  @ApiOperation({ summary: "Save compliance form draft (partial OK)" })
  saveDraft(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertNvoccBookingFormDto,
  ) {
    return this.compliance.saveDraft(user, id, dto);
  }

  @Post(":id/compliance-form/submit")
  @ApiOperation({
    summary:
      "Submit compliance form (mandatory fields + consent) → BOOKING_FORM_COMPLETE",
  })
  submit(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitNvoccComplianceFormDto,
  ) {
    return this.compliance.submit(user, id, dto);
  }

  @Post(":id/compliance-form/documents/:kind")
  @UseInterceptors(complianceDocInterceptor())
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"],
    },
  })
  @ApiOperation({
    summary:
      "Upload supporting doc (commercial_invoice|correspondence|cod_form|licence)",
  })
  uploadDoc(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("kind") kind: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "File is required (multipart field name: file).",
      );
    }
    return this.compliance.uploadDocument(user, id, kind, file);
  }
}
