import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  JobChargeAttachmentPurpose,
  JobChargeAttachmentSide,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { CreateJobChargeAttachmentDto } from "./dto/job-charge-attachment.dto";
import { JobCostingService } from "./job-costing.service";

@Injectable()
export class JobChargeAttachmentService {
  private readonly logger = new Logger(JobChargeAttachmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly costing: JobCostingService,
  ) {}

  async list(
    tenantId: string,
    jobId: string,
    chargeId: string,
    side?: JobChargeAttachmentSide,
  ) {
    await this.assertCharge(tenantId, jobId, chargeId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobChargeAttachment.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          job_charge_id: chargeId,
          deleted_at: null,
          ...(side ? { side } : {}),
        },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data: rows };
  }

  async create(
    tenantId: string,
    jobId: string,
    chargeId: string,
    dto: CreateJobChargeAttachmentDto,
    actorId?: string,
    file?: Express.Multer.File,
  ) {
    await this.assertCharge(tenantId, jobId, chargeId);

    const side = dto.side ?? JobChargeAttachmentSide.CHARGE;
    const purpose = dto.purpose ?? JobChargeAttachmentPurpose.GENERAL;

    let fileName = dto.file_name?.trim();
    let fileUrl = dto.file_url?.trim();
    let s3Key = dto.s3_key;
    let fileSize = dto.file_size;
    let mimeType = dto.mime_type;

    if (file?.buffer?.length) {
      const stored = await this.storage.saveBuffer(
        tenantId,
        file.buffer,
        file.originalname || fileName || `charge-attach-${Date.now()}`,
        file.mimetype || mimeType || "application/octet-stream",
      );
      fileName = file.originalname || fileName || stored.s3Key;
      fileUrl = stored.fileUrl;
      s3Key = stored.s3Key ?? s3Key;
      fileSize = stored.fileSize ?? file.size ?? fileSize;
      mimeType = stored.mimeType ?? file.mimetype ?? mimeType;
    }

    if (!fileName || !fileUrl) {
      throw new BadRequestException(
        "Provide multipart field 'file' or file_name + file_url.",
      );
    }

    if (
      purpose === JobChargeAttachmentPurpose.PAYMENT_PROOF &&
      !file?.buffer?.length
    ) {
      throw new BadRequestException({
        statusCode: 400,
        message: [
          "PAYMENT_PROOF requires multipart field 'file' (cannot use metadata-only URL).",
        ],
        error: "Bad Request",
        code: "PROOF_FILE_REQUIRED",
      });
    }

    const defaults = this.defaultVisibility(side);
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobChargeAttachment.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          job_charge_id: chargeId,
          side,
          purpose,
          file_name: fileName!,
          file_url: fileUrl!,
          s3_key: s3Key,
          file_size: fileSize,
          mime_type: mimeType,
          visible_to_customer:
            dto.visible_to_customer ?? defaults.visible_to_customer,
          visible_to_vendor:
            dto.visible_to_vendor ?? defaults.visible_to_vendor,
          downloadable_by_customer:
            dto.downloadable_by_customer ?? defaults.downloadable_by_customer,
          downloadable_by_vendor:
            dto.downloadable_by_vendor ?? defaults.downloadable_by_vendor,
          uploaded_by: actorId,
        },
      }),
    );

    let marked_paid: boolean | null = null;
    let mark_paid: unknown = null;
    let mark_paid_warning: string | null = null;

    if (purpose === JobChargeAttachmentPurpose.PAYMENT_PROOF && file) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { costing_payment_proof_auto_mark_paid: true },
      });
      const auto =
        tenant?.costing_payment_proof_auto_mark_paid !== false;

      if (!auto) {
        marked_paid = false;
        mark_paid_warning =
          "Tenant setting costing_payment_proof_auto_mark_paid is off; attachment saved only.";
      } else if (
        side !== JobChargeAttachmentSide.SALE &&
        side !== JobChargeAttachmentSide.COST
      ) {
        marked_paid = false;
        mark_paid_warning =
          "PAYMENT_PROOF auto mark-paid requires side=SALE or side=COST.";
      } else {
        try {
          mark_paid = await this.costing.markChargePaidWithProof(
            tenantId,
            jobId,
            chargeId,
            {
              side,
              amount_claimed: dto.amount_claimed,
              payment_date: dto.payment_date,
              reference_number: dto.reference_number,
              notes: dto.notes,
            },
            file,
            actorId ?? "system",
          );
          marked_paid = true;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Mark paid failed.";
          this.logger.warn(
            `PAYMENT_PROOF attachment saved but mark-paid failed for charge ${chargeId}: ${message}`,
          );
          marked_paid = false;
          mark_paid_warning = message;
        }
      }
    }

    return {
      success: true,
      data: row,
      marked_paid,
      mark_paid,
      mark_paid_warning,
    };
  }

  async countsByChargeIds(tenantId: string, chargeIds: string[]) {
    if (!chargeIds.length) return new Map<string, number>();
    const grouped = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobChargeAttachment.groupBy({
        by: ["job_charge_id"],
        where: {
          tenant_id: tenantId,
          job_charge_id: { in: chargeIds },
          deleted_at: null,
        },
        _count: { _all: true },
      }),
    );
    return new Map(grouped.map((g) => [g.job_charge_id, g._count._all]));
  }

  private defaultVisibility(side: JobChargeAttachmentSide) {
    if (side === JobChargeAttachmentSide.SALE) {
      return {
        visible_to_customer: true,
        visible_to_vendor: false,
        downloadable_by_customer: true,
        downloadable_by_vendor: false,
      };
    }
    if (side === JobChargeAttachmentSide.COST) {
      return {
        visible_to_customer: false,
        visible_to_vendor: true,
        downloadable_by_customer: false,
        downloadable_by_vendor: true,
      };
    }
    return {
      visible_to_customer: false,
      visible_to_vendor: false,
      downloadable_by_customer: false,
      downloadable_by_vendor: false,
    };
  }

  private async assertCharge(
    tenantId: string,
    jobId: string,
    chargeId: string,
  ) {
    const charge = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCharge.findFirst({
        where: {
          id: chargeId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      }),
    );
    if (!charge) throw new NotFoundException("Job charge not found.");
  }
}
