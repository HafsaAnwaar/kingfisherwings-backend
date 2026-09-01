import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { AwbStockBatch, AwbStockStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../../shared/email/email.service";
import {
  AllocateAwbDto,
  AwbStockQueryDto,
  CreateAwbStockBatchDto,
  TransferAwbBatchDto,
  UpdateAwbStockBatchDto,
  VoidAwbAllocationDto,
} from "./dto/awb-stock.dto";

@Injectable()
export class AwbStockService {
  private readonly logger = new Logger(AwbStockService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async listBatches(tenantId: string, query: AwbStockQueryDto) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.awbStockBatch.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          ...(query.airline_id ? { airline_id: query.airline_id } : {}),
          ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        },
        include: {
          airline: { select: { id: true, name: true, iata_code: true } },
          _count: { select: { allocations: true } },
        },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  async getBatch(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const batch = await tx.awbStockBatch.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          airline: { select: { id: true, name: true, iata_code: true } },
          allocations: {
            orderBy: { allocated_at: "desc" },
            take: 50,
            include: { job: { select: { id: true, job_number: true } } },
          },
        },
      });

      if (!batch) {
        throw new NotFoundException("AWB stock batch not found.");
      }

      return {
        ...batch,
        remaining: this.remainingInBatch(batch),
      };
    });
  }

  async createBatch(
    tenantId: string,
    dto: CreateAwbStockBatchDto,
    actorId?: string,
  ) {
    if (dto.range_from > dto.range_to) {
      throw new BadRequestException(
        "range_from must be less than or equal to range_to.",
      );
    }

    const airline = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.airline.findFirst({
        where: { id: dto.airline_id, tenant_id: tenantId, deleted_at: null },
      }),
    );

    if (!airline) {
      throw new NotFoundException("Airline not found.");
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.awbStockBatch.create({
        data: {
          tenant_id: tenantId,
          airline_id: dto.airline_id,
          branch_id: dto.branch_id,
          prefix: dto.prefix,
          range_from: dto.range_from,
          range_to: dto.range_to,
          next_number: dto.range_from,
          low_stock_threshold: dto.low_stock_threshold ?? 10,
          notes: dto.notes,
          created_by: actorId,
          updated_by: actorId,
        },
        include: {
          airline: { select: { id: true, name: true, iata_code: true } },
        },
      }),
    );
  }

  async updateBatch(
    tenantId: string,
    id: string,
    dto: UpdateAwbStockBatchDto,
    actorId?: string,
  ) {
    await this.getBatchOrThrow(tenantId, id);

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.awbStockBatch.update({
        where: { id },
        data: {
          ...(dto.low_stock_threshold !== undefined
            ? { low_stock_threshold: dto.low_stock_threshold }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          updated_by: actorId,
        },
      }),
    );
  }

  async softDeleteBatch(tenantId: string, id: string, actorId?: string) {
    const batch = await this.getBatchOrThrow(tenantId, id);

    const activeAllocations = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.awbStockAllocation.count({
        where: {
          batch_id: id,
          tenant_id: tenantId,
          status: { in: ["ALLOCATED", "AVAILABLE"] },
        },
      }),
    );

    if (activeAllocations > 0) {
      throw new ConflictException(
        "Cannot delete a batch with active allocations.",
      );
    }

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.awbStockBatch.update({
        where: { id: batch.id },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
  }

  async listAllocations(tenantId: string, query: AwbStockQueryDto) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.awbStockAllocation.findMany({
        where: {
          tenant_id: tenantId,
          ...(query.job_id ? { job_id: query.job_id } : {}),
          ...(query.airline_id
            ? { batch: { airline_id: query.airline_id, deleted_at: null } }
            : {}),
        },
        include: {
          batch: { select: { id: true, prefix: true, airline_id: true } },
          job: { select: { id: true, job_number: true } },
        },
        orderBy: { allocated_at: "desc" },
        take: 100,
      }),
    );
  }

  async allocate(
    tenantId: string,
    batchId: string,
    dto: AllocateAwbDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const batch = await tx.awbStockBatch.findFirst({
        where: { id: batchId, tenant_id: tenantId, deleted_at: null },
      });

      if (!batch) {
        throw new NotFoundException("AWB stock batch not found.");
      }

      if (batch.status === "DEPLETED" || batch.next_number > batch.range_to) {
        throw new ConflictException("AWB stock batch is depleted.");
      }

      const job = await tx.job.findFirst({
        where: { id: dto.job_id, tenant_id: tenantId, deleted_at: null },
        include: { air_details: true },
      });

      if (!job) {
        throw new NotFoundException("Job not found.");
      }

      if (job.job_type !== "AIR_EXPORT" && job.job_type !== "AIR_IMPORT") {
        throw new BadRequestException(
          "AWB allocation is only supported for air jobs.",
        );
      }

      const serial = batch.next_number;
      const awbNumber = this.formatAwbNumber(batch.prefix, serial);

      const allocation = await tx.awbStockAllocation.create({
        data: {
          tenant_id: tenantId,
          batch_id: batchId,
          job_id: dto.job_id,
          awb_number: awbNumber,
          status: "ALLOCATED",
          created_by: actorId,
          updated_by: actorId,
        },
      });

      const nextNumber = serial + 1;
      const depleted = nextNumber > batch.range_to;

      await tx.awbStockBatch.update({
        where: { id: batchId },
        data: {
          next_number: nextNumber,
          status: depleted ? "DEPLETED" : batch.status,
          updated_by: actorId,
        },
      });

      if (job.air_details) {
        const awbField =
          job.job_type === "AIR_EXPORT" ? "hawb_number" : "mawb_number";
        await tx.airJobDetail.update({
          where: { id: job.air_details.id },
          data: { [awbField]: awbNumber, updated_by: actorId },
        });
      }

      const remaining = batch.range_to - serial;
      if (remaining <= batch.low_stock_threshold) {
        this.notifyLowStock(tenantId, batch, remaining).catch((err) =>
          this.logger.warn(
            `Low stock alert failed: ${err instanceof Error ? err.message : err}`,
          ),
        );
      }

      return allocation;
    });
  }

  async voidAllocation(
    tenantId: string,
    allocationId: string,
    dto: VoidAwbAllocationDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const allocation = await tx.awbStockAllocation.findFirst({
        where: { id: allocationId, tenant_id: tenantId },
      });

      if (!allocation) {
        throw new NotFoundException("AWB allocation not found.");
      }

      if (allocation.status === "VOIDED") {
        throw new ConflictException("Allocation is already voided.");
      }

      if (allocation.status === "USED") {
        throw new ConflictException("Cannot void a used AWB.");
      }

      return tx.awbStockAllocation.update({
        where: { id: allocationId },
        data: {
          status: "VOIDED",
          void_reason: dto.void_reason,
          voided_at: new Date(),
          updated_by: actorId,
        },
      });
    });
  }

  async markUsed(tenantId: string, allocationId: string, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const allocation = await tx.awbStockAllocation.findFirst({
        where: { id: allocationId, tenant_id: tenantId },
      });

      if (!allocation) {
        throw new NotFoundException("AWB allocation not found.");
      }

      if (allocation.status !== "ALLOCATED") {
        throw new ConflictException(
          "Only allocated AWBs can be marked as used.",
        );
      }

      return tx.awbStockAllocation.update({
        where: { id: allocationId },
        data: { status: "USED", used_at: new Date(), updated_by: actorId },
      });
    });
  }

  async transferBranch(
    tenantId: string,
    batchId: string,
    dto: TransferAwbBatchDto,
    actorId?: string,
  ) {
    await this.getBatchOrThrow(tenantId, batchId);

    const branch = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.branch.findFirst({
        where: { id: dto.branch_id, tenant_id: tenantId, deleted_at: null },
      }),
    );

    if (!branch) {
      throw new NotFoundException("Branch not found.");
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.awbStockBatch.update({
        where: { id: batchId },
        data: { branch_id: dto.branch_id, updated_by: actorId },
      }),
    );
  }

  async getLowStockReport(tenantId: string) {
    const batches = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.awbStockBatch.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          status: { not: "DEPLETED" },
        },
        include: {
          airline: { select: { id: true, name: true, iata_code: true } },
        },
      }),
    );

    return batches
      .map((batch) => ({
        batch_id: batch.id,
        prefix: batch.prefix,
        airline: batch.airline,
        branch_id: batch.branch_id,
        remaining: this.remainingInBatch(batch),
        low_stock_threshold: batch.low_stock_threshold,
        is_low: this.remainingInBatch(batch) <= batch.low_stock_threshold,
      }))
      .filter((b) => b.is_low);
  }

  private remainingInBatch(batch: AwbStockBatch): number {
    return Math.max(0, batch.range_to - batch.next_number + 1);
  }

  private formatAwbNumber(prefix: string, serial: number): string {
    return `${prefix}-${String(serial).padStart(8, "0")}`;
  }

  private async getBatchOrThrow(tenantId: string, id: string) {
    const batch = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.awbStockBatch.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );

    if (!batch) {
      throw new NotFoundException("AWB stock batch not found.");
    }

    return batch;
  }

  private async notifyLowStock(
    tenantId: string,
    batch: AwbStockBatch,
    remaining: number,
  ) {
    const airline = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.airline.findFirst({ where: { id: batch.airline_id } }),
    );

    await this.emailService.send({
      tenantId,
      eventType: "AWB_LOW_STOCK_ALERT",
      to: process.env.OPS_ALERT_EMAIL ?? "ops@kingfisherwings.com",
      subject: `Low AWB stock alert — prefix ${batch.prefix}`,
      body: `<p>AWB stock for ${airline?.name ?? batch.prefix} is low.</p><p>Remaining: <strong>${remaining}</strong> (threshold: ${batch.low_stock_threshold})</p>`,
      createdBy: batch.updated_by ?? undefined,
    });
  }
}
