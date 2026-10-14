import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { OpsUploaderSide } from "@prisma/client";
import { Response } from "express";
import "multer";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import { JobCostingService } from "../jobs/job-costing.service";
import { JobDocumentUploadService } from "../jobs/job-document-upload.service";
import { CurrentVendor } from "./decorators/vendor.decorators";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";

@ApiTags("Vendor — Jobs")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller("vendor/jobs")
export class VendorJobsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly costing: JobCostingService,
    private readonly documentUpload: JobDocumentUploadService,
  ) {}

  private async assertVendorJobAccess(
    user: CurrentVendorUser,
    jobId: string,
  ): Promise<void> {
    const allowed = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const quote = await tx.vendorQuote.findFirst({
        where: {
          tenant_id: user.tenantId,
          job_id: jobId,
          vendor_party_id: user.partyId,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (quote) return true;
      const costLine = await tx.jobCharge.findFirst({
        where: {
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
          OR: [
            { cost_party_id: user.partyId },
            { party_id: user.partyId, is_cost: true },
          ],
        },
        select: { id: true },
      });
      return !!costLine;
    });
    if (!allowed) throw new NotFoundException("Job not found.");
  }

  @Get(":id/costing")
  @ApiOperation({
    summary:
      "Job costing for vendor (cost side only; sale stripped). Access via vendor quote or cost_party.",
  })
  async getCosting(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.assertVendorJobAccess(user, id);
    return this.costing.getTab(user.tenantId, id, "VENDOR");
  }

  @Get(":id/documents")
  @ApiOperation({
    summary:
      "List job documents visible to this vendor (visible_to_vendor or self-uploaded)",
  })
  async listDocuments(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.assertVendorJobAccess(user, id);
    const rows = await this.documentUpload.listForAudience(
      user.tenantId,
      id,
      "VENDOR",
    );
    return { success: true, data: rows };
  }

  @Post(":id/documents/:documentType/upload")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }),
  )
  @ApiOperation({
    summary: "Upload a typed document on a linked job (staff can always see)",
  })
  async uploadDocument(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("documentType") documentType: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.assertVendorJobAccess(user, id);
    const doc = await this.documentUpload.uploadForJob(
      user.tenantId,
      id,
      documentType,
      file,
      {
        userId: user.id,
        side: OpsUploaderSide.VENDOR,
        partyId: user.partyId,
      },
      { visible_to_vendor: true, visible_to_customer: false },
    );
    return { success: true, data: doc };
  }

  @Get(":id/documents/:documentId/download")
  @ApiOperation({ summary: "Download a vendor-visible job document" })
  async downloadDocument(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Res() res: Response,
  ) {
    await this.assertVendorJobAccess(user, id);
    return this.documentUpload.download(
      user.tenantId,
      id,
      documentId,
      res,
      "VENDOR",
      { partyId: user.partyId },
    );
  }
}
