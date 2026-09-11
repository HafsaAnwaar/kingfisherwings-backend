import {
  GoneException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ReportJobStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";

@Injectable()
export class ReportsJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getStatus(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.reportJob.findFirst({
        where: { id: jobId, tenant_id: tenantId },
      }),
    );
    if (!job) {
      throw new NotFoundException("Report job not found");
    }

    let status = job.status;
    let error = job.error;
    let downloadUrl = job.download_url;

    if (
      status === ReportJobStatus.ready &&
      job.expires_at &&
      job.expires_at.getTime() < Date.now()
    ) {
      status = ReportJobStatus.failed;
      error = "Report expired. Please generate again.";
      downloadUrl = null;
    }

    return {
      id: job.id,
      status,
      download_url: downloadUrl,
      expires_at: job.expires_at?.toISOString() ?? null,
      format: job.format,
      template_code: job.template_code,
      error,
    };
  }

  async download(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.reportJob.findFirst({
        where: { id: jobId, tenant_id: tenantId },
      }),
    );
    if (!job) {
      throw new NotFoundException("Report job not found");
    }
    if (job.status !== ReportJobStatus.ready) {
      throw new NotFoundException("Report is not ready for download");
    }
    if (job.expires_at && job.expires_at.getTime() < Date.now()) {
      throw new GoneException("Report expired. Please generate again.");
    }
    if (!job.file_name || !job.file_url) {
      throw new NotFoundException("Report file missing");
    }

    const file = await this.storage.readByStoredFile(tenantId, {
      file_name: job.file_name,
      file_url: job.file_url,
      s3_key: job.s3_key,
      mime_type: job.mime_type,
    });

    return file;
  }
}
