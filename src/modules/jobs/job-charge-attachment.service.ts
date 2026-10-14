import { Injectable, NotFoundException } from "@nestjs/common";
import { JobChargeAttachmentSide } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateJobChargeAttachmentDto } from "./dto/job-charge-attachment.dto";

@Injectable()
export class JobChargeAttachmentService {
  constructor(private readonly prisma: PrismaService) {}

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
  ) {
    await this.assertCharge(tenantId, jobId, chargeId);
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobChargeAttachment.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          job_charge_id: chargeId,
          side: dto.side ?? JobChargeAttachmentSide.CHARGE,
          file_name: dto.file_name,
          file_url: dto.file_url,
          s3_key: dto.s3_key,
          file_size: dto.file_size,
          mime_type: dto.mime_type,
          uploaded_by: actorId,
        },
      }),
    );
    return { success: true, data: row };
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

  private async assertCharge(tenantId: string, jobId: string, chargeId: string) {
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
