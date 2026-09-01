import { createHash } from "crypto";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DocumentationEdiStatus,
  DocumentationEdiType,
  JobType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import {
  DocumentationPaginationDto,
  paginated,
} from "./dto/documentation-pagination.dto";

export interface EdiListQueryDto extends DocumentationPaginationDto {
  search?: string;
  status?: DocumentationEdiStatus;
  branch_id?: string;
}

@Injectable()
export class DocumentationEdiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {}

  async listJobsForEdi(
    tenantId: string,
    ediType: DocumentationEdiType,
    query: EdiListQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const exportTypes: JobType[] = [
      "SEA_FCL_EXPORT",
      "SEA_LCL_EXPORT",
      "AIR_EXPORT",
      "NVOCC_EXPORT",
    ];

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        parent_job_id: ediType === "BAYAN_HOUSE" ? { not: null } : null,
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(ediType !== "BAYAN_HOUSE" ? { job_type: { in: exportTypes } } : {}),
        ...(query.search
          ? {
              OR: [
                { job_number: { contains: query.search, mode: "insensitive" } },
                {
                  sea_fcl_details: {
                    mbl_number: { contains: query.search, mode: "insensitive" },
                  },
                },
                {
                  air_details: {
                    mawb_number: {
                      contains: query.search,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),
      };

      const [jobs, total] = await Promise.all([
        tx.job.findMany({
          where,
          include: {
            air_details: { select: { mawb_number: true, hawb_number: true } },
            sea_fcl_details: { select: { mbl_number: true, hbl_number: true } },
            sea_lcl_details: { select: { mbl_number: true, hbl_number: true } },
            nvocc_details: { select: { hbl_number: true, mbl_number: true } },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        tx.job.count({ where }),
      ]);

      const submissions = await tx.documentationEdiSubmission.findMany({
        where: {
          tenant_id: tenantId,
          edi_type: ediType,
          reference_id: { in: jobs.map((j) => j.id) },
          deleted_at: null,
        },
        orderBy: { created_at: "desc" },
      });
      const latestByJob = new Map<string, (typeof submissions)[0]>();
      for (const sub of submissions) {
        if (!latestByJob.has(sub.reference_id))
          latestByJob.set(sub.reference_id, sub);
      }

      const items = jobs.map((job) => ({
        job,
        mbl_number:
          job.sea_fcl_details?.mbl_number ??
          job.sea_lcl_details?.mbl_number ??
          job.nvocc_details?.mbl_number ??
          null,
        hbl_number:
          job.sea_fcl_details?.hbl_number ??
          job.sea_lcl_details?.hbl_number ??
          job.nvocc_details?.hbl_number ??
          null,
        mawb_number: job.air_details?.mawb_number ?? null,
        latest_submission: latestByJob.get(job.id) ?? null,
      }));

      return paginated(items, page, limit, total);
    });
  }

  async generate(
    tenantId: string,
    ediType: DocumentationEdiType,
    referenceId: string,
    actorId?: string,
    referenceType = "JOB",
  ) {
    const payload = await this.buildPayload(tenantId, ediType, referenceId);
    const buffer = Buffer.from(payload, "utf8");
    const hash = createHash("sha256").update(buffer).digest("hex");
    const filename = `${ediType.toLowerCase()}-${referenceId.slice(0, 8)}.xml`;
    const stored = await this.storage.saveBuffer(
      tenantId,
      buffer,
      filename,
      "application/xml",
    );

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationEdiSubmission.create({
        data: {
          tenant_id: tenantId,
          edi_type: ediType,
          reference_type: referenceType,
          reference_id: referenceId,
          status: "GENERATED",
          file_storage_key: stored.s3Key,
          payload_hash: hash,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async submit(tenantId: string, submissionId: string, actorId?: string) {
    const submission = await this.findSubmission(tenantId, submissionId);
    if (!["GENERATED", "DRAFT"].includes(submission.status)) {
      throw new BadRequestException(
        "Only generated submissions can be submitted.",
      );
    }

    const submitEnabled =
      this.config.get<string>("EDI_SUBMIT_ENABLED") === "true";
    let externalRef: string;

    if (submitEnabled && submission.edi_type === "MPCI") {
      externalRef = await this.submitToMpciGateway(tenantId, submission);
    } else {
      externalRef = submitEnabled
        ? `EXT-${submission.edi_type}-${Date.now()}`
        : `STUB-${submission.edi_type}-${submission.id.slice(0, 8)}`;
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationEdiSubmission.update({
        where: { id: submissionId },
        data: {
          status: "SUBMITTED",
          external_ref: externalRef,
          submitted_at: new Date(),
          submitted_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  private async submitToMpciGateway(
    tenantId: string,
    submission: {
      id: string;
      edi_type: DocumentationEdiType;
      file_storage_key: string | null;
    },
  ): Promise<string> {
    const endpoint = this.config.get<string>("MPCI_EDI_ENDPOINT");
    if (!endpoint) {
      throw new BadRequestException("MPCI_EDI_ENDPOINT is not configured.");
    }
    if (!submission.file_storage_key) {
      throw new BadRequestException("No EDI payload file to submit.");
    }

    const filename = submission.file_storage_key.split("/").pop() ?? "edi.xml";
    const payload = await this.storage.readBuffer(tenantId, filename);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        "X-Tenant-Id": tenantId,
        "X-Submission-Id": submission.id,
      },
      body: new Uint8Array(payload),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new BadRequestException(
        `MPCI gateway rejected submission: HTTP ${res.status} ${text.slice(0, 200)}`,
      );
    }

    const body = await res.text();
    const match = body.match(/<ReferenceId>([^<]+)<\/ReferenceId>/i);
    return match?.[1]?.trim() ?? `MPCI-${submission.id.slice(0, 8)}`;
  }

  async amend(tenantId: string, submissionId: string, actorId?: string) {
    const original = await this.findSubmission(tenantId, submissionId);
    const amended = await this.generate(
      tenantId,
      original.edi_type,
      original.reference_id,
      actorId,
      original.reference_type,
    );

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationEdiSubmission.update({
        where: { id: amended.id },
        data: {
          amendment_of_id: submissionId,
          status: "AMENDED",
          updated_by: actorId,
        },
      }),
    );
  }

  async getDownloadUrl(tenantId: string, submissionId: string) {
    const submission = await this.findSubmission(tenantId, submissionId);
    if (!submission.file_storage_key) {
      throw new BadRequestException("No file generated for this submission.");
    }
    try {
      const url = await this.storage.presignedGetUrl(
        submission.file_storage_key,
      );
      return { url, submission_id: submissionId };
    } catch {
      const filename =
        submission.file_storage_key.split("/").pop() ?? "edi.xml";
      const base = this.config.get<string>("storage.publicBaseUrl") ?? "";
      return {
        url: `${base}/${tenantId}/${encodeURIComponent(filename)}`,
        submission_id: submissionId,
      };
    }
  }

  private async findSubmission(tenantId: string, id: string) {
    const submission = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationEdiSubmission.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!submission) throw new NotFoundException("EDI submission not found.");
    return submission;
  }

  private async buildPayload(
    tenantId: string,
    ediType: DocumentationEdiType,
    referenceId: string,
  ): Promise<string> {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: referenceId, tenant_id: tenantId, deleted_at: null },
        include: {
          air_details: true,
          sea_fcl_details: true,
          sea_lcl_details: true,
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found for EDI generation.");

    const partyIds = [job.shipper_id, job.consignee_id].filter(
      Boolean,
    ) as string[];
    const ediCodes = partyIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.partyEdiCode.findMany({
            where: {
              tenant_id: tenantId,
              party_id: { in: partyIds },
              edi_type: ediType,
              is_active: true,
              deleted_at: null,
            },
          }),
        )
      : [];

    const escaped = (value: string | null | undefined) =>
      (value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const partyEdiXml = ediCodes
      .map(
        (c) =>
          `  <PartyEdiCode party_id="${c.party_id}" edi_type="${escaped(c.edi_type)}" code="${escaped(c.edi_code)}" />`,
      )
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<EdiMessage type="${ediType}">
  <JobNumber>${escaped(job.job_number)}</JobNumber>
  <JobType>${job.job_type}</JobType>
  <GeneratedAt>${new Date().toISOString()}</GeneratedAt>
  <MblNumber>${escaped(job.sea_fcl_details?.mbl_number ?? job.sea_lcl_details?.mbl_number)}</MblNumber>
  <MawbNumber>${escaped(job.air_details?.mawb_number)}</MawbNumber>
  <HblNumber>${escaped(job.sea_fcl_details?.hbl_number ?? job.sea_lcl_details?.hbl_number)}</HblNumber>
${partyEdiXml}
</EdiMessage>`;
  }
}
