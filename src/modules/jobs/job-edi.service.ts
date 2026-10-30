import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DocumentationEdiType, JobType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { DocumentationEdiService } from "../documentation/documentation-edi.service";
import { GenerateJobEdiDto } from "./dto/job-edi.dto";
import {
  ediTypeLabel,
  eligibleEdiTypes,
} from "./utils/edi-eligibility.util";

@Injectable()
export class JobEdiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly edi: DocumentationEdiService,
  ) {}

  async listTypes(tenantId: string, jobId: string) {
    const job = await this.assertJob(tenantId, jobId);
    const types = this.eligibleTypes(job.job_type, !!job.parent_job_id);
    return {
      success: true,
      data: {
        job_id: jobId,
        job_type: job.job_type,
        is_house: !!job.parent_job_id,
        edi_types: types.map((edi_type) => ({
          edi_type,
          label: ediTypeLabel(edi_type),
        })),
      },
    };
  }

  eligibleTypes(jobType: JobType, isHouse: boolean): DocumentationEdiType[] {
    return eligibleEdiTypes(jobType, isHouse);
  }

  async generate(
    tenantId: string,
    jobId: string,
    dto: GenerateJobEdiDto,
    actorId?: string,
  ) {
    const job = await this.assertJob(tenantId, jobId);
    const allowed = this.eligibleTypes(job.job_type, !!job.parent_job_id);
    if (!allowed.includes(dto.edi_type)) {
      throw new BadRequestException(
        `EDI type ${dto.edi_type} is not eligible for this job (${job.job_type}).`,
      );
    }
    const submission = await this.edi.generate(
      tenantId,
      dto.edi_type,
      jobId,
      actorId,
      "JOB",
      { company_codes: dto.company_codes },
    );
    const isTxt = dto.edi_type === "MANIFEST_CSDP";
    return {
      success: true,
      data: {
        ...submission,
        download: `/jobs/${jobId}/edi/submissions/${submission.id}/download`,
        mime_type: isTxt ? "text/plain" : "application/pdf",
        filename: isTxt
          ? `${dto.edi_type.toLowerCase()}-${jobId.slice(0, 8)}.txt`
          : `${dto.edi_type.toLowerCase()}-${jobId.slice(0, 8)}.pdf`,
      },
    };
  }

  async listSubmissions(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationEdiSubmission.findMany({
        where: {
          tenant_id: tenantId,
          reference_type: "JOB",
          reference_id: jobId,
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
        take: 100,
      }),
    );
    return {
      success: true,
      data: rows.map((row) => ({
        ...row,
        download: `/jobs/${jobId}/edi/submissions/${row.id}/download`,
        mime_type:
          row.edi_type === "MANIFEST_CSDP" ? "text/plain" : "application/pdf",
      })),
    };
  }

  async download(
    tenantId: string,
    jobId: string,
    submissionId: string,
    res: import("express").Response,
  ) {
    await this.assertJob(tenantId, jobId);
    const submission = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationEdiSubmission.findFirst({
        where: {
          id: submissionId,
          tenant_id: tenantId,
          reference_id: jobId,
          deleted_at: null,
        },
      }),
    );
    if (!submission) {
      throw new NotFoundException("EDI submission not found for this job.");
    }
    return this.edi.streamFile(tenantId, submissionId, res);
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, job_type: true, parent_job_id: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }
}
