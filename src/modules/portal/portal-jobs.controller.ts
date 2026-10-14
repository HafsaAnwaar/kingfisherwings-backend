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
import { CurrentPortal } from "./decorators/portal.decorators";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { portalJobOwnershipWhere } from "./helpers/portal-ownership.helper";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";

@ApiTags("Portal — Jobs")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller("portal/jobs")
export class PortalJobsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly costing: JobCostingService,
    private readonly documentUpload: JobDocumentUploadService,
  ) {}

  private async assertOwnedJob(user: CurrentPortalUser, id: string) {
    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalJobOwnershipWhere(user.partyId),
        },
        select: { id: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
  }

  @Get(":id/costing")
  @ApiOperation({
    summary:
      "Job costing tab for portal customer (sale side only; cost stripped)",
  })
  async getCosting(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.assertOwnedJob(user, id);
    return this.costing.getTab(user.tenantId, id, "CUSTOMER");
  }

  @Get(":id/documents")
  @ApiOperation({
    summary: "List job documents visible to this customer",
  })
  async listDocuments(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.assertOwnedJob(user, id);
    const rows = await this.documentUpload.listForAudience(
      user.tenantId,
      id,
      "CUSTOMER",
    );
    return { success: true, data: rows };
  }

  @Post(":id/documents/:documentType/upload")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }),
  )
  @ApiOperation({
    summary: "Upload a typed document on an owned job (visible to staff)",
  })
  async uploadDocument(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("documentType") documentType: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.assertOwnedJob(user, id);
    const doc = await this.documentUpload.uploadForJob(
      user.tenantId,
      id,
      documentType,
      file,
      {
        userId: user.id,
        side: OpsUploaderSide.CUSTOMER,
        partyId: user.partyId,
      },
      { visible_to_customer: true },
    );
    return { success: true, data: doc };
  }

  @Get(":id/documents/:documentId/download")
  @ApiOperation({ summary: "Download a customer-visible job document" })
  async downloadDocument(
    @CurrentPortal() user: CurrentPortalUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Res() res: Response,
  ) {
    await this.assertOwnedJob(user, id);
    return this.documentUpload.download(
      user.tenantId,
      id,
      documentId,
      res,
      "CUSTOMER",
    );
  }
}
