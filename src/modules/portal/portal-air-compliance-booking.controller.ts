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
import { PortalAirComplianceBookingService } from "./portal-air-compliance-booking.service";
import {
  SubmitAirComplianceFormDto,
  UpsertAirComplianceBookingFormDto,
} from "../jobs/booking-forms/dto/air-compliance-booking-form.dto";

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

@ApiTags("Portal — Air Compliance Booking Form")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/shipments")
export class PortalAirComplianceBookingController {
  constructor(private readonly compliance: PortalAirComplianceBookingService) {}

  @Post(":id/accept")
  @ApiOperation({
    summary:
      "Accept air quote → CUSTOMER_ACCEPTED (unlocks compliance form). Air jobs only.",
  })
  accept(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.compliance.acceptQuote(user, id);
  }

  @Get(":id/compliance-form")
  @ApiOperation({
    summary: "Get air compliance booking form (same 8-step fields as NVOCC)",
  })
  get(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.compliance.get(user, id);
  }

  @Put(":id/compliance-form")
  @ApiOperation({ summary: "Save air compliance form draft (partial OK)" })
  saveDraft(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertAirComplianceBookingFormDto,
  ) {
    return this.compliance.saveDraft(user, id, dto);
  }

  @Post(":id/compliance-form/submit")
  @ApiOperation({
    summary:
      "Submit air compliance form → BOOKING_FORM_COMPLETE (same validation as NVOCC)",
  })
  submit(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SubmitAirComplianceFormDto,
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
