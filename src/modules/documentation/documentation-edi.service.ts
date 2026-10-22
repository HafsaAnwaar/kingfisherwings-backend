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
import { PdfService } from "../../shared/pdf/pdf.service";
import { ediTypeLabel } from "../jobs/utils/edi-eligibility.util";
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
    private readonly pdf: PdfService,
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
    const isTxt = ediType === "MANIFEST_CSDP";
    const payload = isTxt
      ? await this.buildManifestCsdpTxt(tenantId, referenceId)
      : await this.buildPayload(tenantId, ediType, referenceId);
    const buffer = Buffer.from(payload, "utf8");
    const hash = createHash("sha256").update(buffer).digest("hex");
    const blHint = isTxt
      ? payload.match(/^"BOL","([^"]+)"/m)?.[1]?.replace(/[^\w-]/g, "") ||
        referenceId.slice(0, 8)
      : referenceId.slice(0, 8);
    const filename = isTxt
      ? `${blHint} MENIFIEST.txt`
      : `${ediType.toLowerCase()}-${referenceId.slice(0, 8)}.xml`;
    const stored = await this.storage.saveBuffer(
      tenantId,
      buffer,
      filename,
      isTxt ? "text/plain" : "application/xml",
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

  /**
   * Stream EDI file (TXT for MANIFEST_CSDP, PDF wrapper for XML types).
   * Do not return S3/presigned URLs — the SPA fetching those hits CORS.
   */
  async streamFile(
    tenantId: string,
    submissionId: string,
    res: import("express").Response,
  ) {
    const submission = await this.findSubmission(tenantId, submissionId);
    if (!submission.file_storage_key) {
      throw new BadRequestException("No file generated for this submission.");
    }
    const storedName =
      submission.file_storage_key.split("/").pop() ?? "edi.bin";
    const isTxt =
      submission.edi_type === "MANIFEST_CSDP" ||
      /\.txt$/i.test(storedName);
    const file = await this.storage.readByStoredFile(tenantId, {
      file_name: storedName,
      file_url: submission.file_storage_key,
      s3_key: submission.file_storage_key,
      mime_type: isTxt ? "text/plain" : "application/xml",
    });

    if (isTxt) {
      const txtName = storedName.endsWith(".txt")
        ? storedName
        : storedName.replace(/\.\w+$/i, ".txt");
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${txtName.replace(/"/g, "")}"`,
      );
      res.setHeader("Cache-Control", "no-store");
      res.send(file.buffer);
      return;
    }

    const xml = file.buffer.toString("utf8");
    const pdfName = storedName.replace(/\.xml$/i, ".pdf");
    const pdfBuffer = await this.pdf.renderHtmlToPdf(
      this.ediXmlToPdfHtml(submission.edi_type, submission.status, xml),
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfName.replace(/"/g, "")}"`,
    );
    res.setHeader("Cache-Control", "no-store");
    res.send(pdfBuffer);
  }

  private ediXmlToPdfHtml(
    ediType: DocumentationEdiType,
    status: string,
    xml: string,
  ) {
    const escaped = xml
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; padding: 24px; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    .meta { color: #555; margin-bottom: 16px; }
    pre { white-space: pre-wrap; word-break: break-word; font-size: 10px;
          background: #f6f6f6; border: 1px solid #ddd; padding: 12px; }
  </style>
</head>
<body>
  <h1>EDI ${ediTypeLabel(ediType)}</h1>
  <div class="meta">${ediType} · Status: ${status}</div>
  <pre>${escaped}</pre>
</body>
</html>`;
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

  /**
   * CSDP/DP World–style sea manifest TXT (VOY / BOL / CTR / CON / END).
   * Field layout matches sample: KFSSKY28MUNJEA ( 2CNTR ) MENIFIEST.txt
   */
  private async buildManifestCsdpTxt(
    tenantId: string,
    jobId: string,
  ): Promise<string> {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: {
          sea_fcl_details: true,
          sea_lcl_details: true,
          nvocc_details: true,
          containers_job: { where: { deleted_at: null }, take: 50 },
          organizations: {
            where: { deleted_at: null },
            include: {
              party: {
                select: {
                  id: true,
                  name: true,
                  country_code: true,
                  city: true,
                  address: true,
                },
              },
            },
          },
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found for EDI generation.");

    const sea = job.sea_fcl_details ?? job.sea_lcl_details;
    const nvocc = job.nvocc_details;
    const q = (v: string | number | null | undefined) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`;

    const fmtDate = (d: Date | string | null | undefined) => {
      if (!d) return "01-Jan-1900";
      const dt = typeof d === "string" ? new Date(d) : d;
      if (Number.isNaN(dt.getTime())) return "01-Jan-1900";
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const dd = String(dt.getUTCDate()).padStart(2, "0");
      return `${dd}-${months[dt.getUTCMonth()]}-${dt.getUTCFullYear()}`;
    };

    const orgByType = (t: string) =>
      job.organizations.find((o) => String(o.org_type) === t)?.party;
    const shipper = orgByType("SHIPPER");
    const consignee = orgByType("CONSIGNEE");
    const notify = orgByType("NOTIFY") ?? consignee;

    const partyPlace = (p: {
      city?: string | null;
      address?: string | null;
      country_code?: string | null;
    } | undefined) =>
      [p?.city, p?.address].filter(Boolean).join(", ") ||
      p?.country_code ||
      "";

    const voyageRaw =
      (sea as { voyage_number?: string | null } | null)?.voyage_number ??
      (nvocc as { voyage_number?: string | null } | null)?.voyage_number ??
      job.job_number.slice(-5);
    const voyage = String(voyageRaw);
    const voyageLeg = voyage.endsWith("L") ? voyage : `${voyage}L`;
    const vessel =
      (sea as { vessel_name?: string | null } | null)?.vessel_name ??
      (nvocc as { vessel_name?: string | null } | null)?.vessel_name ??
      "VESSEL";

    const ports = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.port.findMany({
        where: {
          id: {
            in: [job.origin_port_id, job.dest_port_id].filter(
              Boolean,
            ) as string[],
          },
          deleted_at: null,
        },
        select: { id: true, code: true },
      }),
    );
    const originCode =
      ports.find((p) => p.id === job.origin_port_id)?.code ?? "XXXX";
    const destCode =
      ports.find((p) => p.id === job.dest_port_id)?.code ?? "XXXX";

    const blNo =
      (sea as { hbl_number?: string | null; mbl_number?: string | null } | null)
        ?.hbl_number ??
      (sea as { mbl_number?: string | null } | null)?.mbl_number ??
      (nvocc as { hbl_number?: string | null; mbl_number?: string | null } | null)
        ?.hbl_number ??
      (nvocc as { mbl_number?: string | null } | null)?.mbl_number ??
      job.job_number.replace(/[^A-Z0-9]/gi, "").slice(0, 16);

    const containers = job.containers_job ?? [];
    const ctrSummary = containers
      .map((c, i) => {
        const no = (c.container_number ?? "").replace(/\s/g, "");
        const seal = c.seal_number ?? String(1000 + i);
        return `${no} S/NO: ${seal}`;
      })
      .join(" ");

    const commodity = job.commodity ?? "GENERAL CARGO";
    const hs = job.hs_code ?? "";
    const pieces = job.pieces ?? 0;
    const weight = Number(job.gross_weight ?? 0).toFixed(3);
    const packageType = "PKG";
    const etd =
      (sea as { etd?: Date | null } | null)?.etd ?? job.created_at;

    const lines: string[] = [];
    lines.push(
      [
        q("VOY"),
        q(voyageLeg),
        q(voyage.replace(/L$/, "")),
        q(vessel),
        q(voyage.replace(/L$/, "") || "0000"),
        q(destCode),
        q(fmtDate(etd)),
        q(job.job_number.replace(/\D/g, "").slice(-6) || "000000"),
        q("MFI"),
        q("1"),
        q(String(containers.length).padStart(5, "0")),
      ].join(","),
    );

    lines.push(
      [
        q("BOL"),
        q(blNo),
        q(voyageLeg),
        q(voyage.replace(/L$/, "")),
        q(originCode),
        q(originCode),
        q(destCode),
        q(destCode),
        q("01-Jan-1900"),
        q(""),
        q("I"),
        q(""),
        q(""),
        q(""),
        q("F"),
        q("N"),
        q(""),
        q(String(job.job_type).includes("FCL") ? "FCL" : "FCL/LCL"),
        q((originCode || "XX").slice(0, 2)),
        q(""),
        q(""),
        q(""),
        q(""),
        q(""),
        q(""),
        q(""),
        q(shipper?.name ?? ""),
        q(partyPlace(shipper)),
        q(shipper?.country_code ?? ""),
        q(""),
        q(consignee?.name ?? ""),
        q(partyPlace(consignee)),
        q(""),
        q(notify?.name ?? ""),
        q(partyPlace(notify)),
        q(""),
        q(""),
        q(""),
        q(""),
        q(""),
        q(""),
        q(ctrSummary),
        q(hs),
        q(commodity),
        q(String(pieces)),
        q("BAGS"),
        q(packageType),
        q(""),
        q("0"),
        q(String(containers.length || 1)),
        q("6"),
        q("0"),
        q(String(Math.round(Number(weight)))),
        q(weight),
        q("0.000"),
        q("0"),
        q("0"),
        q("0"),
        q(""),
        q(""),
        q(""),
      ].join(","),
    );

    for (const [i, c] of containers.entries()) {
      const no = (c.container_number ?? `UNK${i}`).replace(/\s/g, "");
      const short = no.length > 10 ? no.slice(0, 10) : no;
      const seal = c.seal_number ?? String(1000 + i);
      lines.push([q("CTR"), q(short), q("9"), q("0"), q(seal)].join(","));
    }

    lines.push(
      [
        q("CON"),
        q("1"),
        q(ctrSummary),
        q(commodity),
        q("N"),
        q(hs),
        q(String(pieces)),
        q("BAGS"),
        q(packageType),
        q("0"),
        q(weight),
        q("0.000"),
        q("N"),
        q(""),
        q(""),
        q("0"),
        q(""),
        q("D"),
        q("N"),
        q(""),
        q(""),
        q(""),
      ].join(","),
    );

    lines.push([q("END"), q("1"), q("0"), q("CSDPAEDI: 1.02")].join(","));
    return lines.join("\n") + "\n";
  }
}
