import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  ConfirmStorageChargesDto,
  CalculateStorageChargesDto,
} from "./dto/job-storage-costing.dto";

@Injectable()
export class JobContainerStorageCostingService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(
    tenantId: string,
    jobId: string,
    dto: CalculateStorageChargesDto,
  ) {
    const upto = new Date(dto.storage_upto_date);
    const { baseHint } = await this.loadFclJob(tenantId, jobId);
    const slabs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.storageSlab.findMany({
        where: { tenant_id: tenantId, deleted_at: null, is_active: true },
        orderBy: { from_days: "asc" },
      }),
    );

    const containers = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerFreeDays.findMany({
        where: { tenant_id: tenantId, job_id: jobId },
        include: { container: true },
      }),
    );

    const lines: {
      container_id: string;
      container_number: string | null;
      charge_description: string;
      days: number;
      amount: number;
      slab_code: string;
      currency_code: string;
    }[] = [];

    for (const row of containers) {
      const start =
        row.detention_start_date ??
        row.demurrage_start_date ??
        row.last_free_day_date;
      if (!start) continue;
      const days = Math.max(
        0,
        Math.ceil((upto.getTime() - start.getTime()) / 86400000),
      );
      if (days <= 0) continue;

      let remaining = days;
      let amount = 0;
      let usedSlab = slabs[0];
      for (const slab of slabs) {
        if (remaining <= 0) break;
        const span = Math.max(0, slab.to_days - slab.from_days + 1);
        const slice = Math.min(remaining, span);
        amount += slice * Number(slab.rate);
        remaining -= slice;
        usedSlab = slab;
      }
      if (amount <= 0 && row.detention_accrued) {
        amount = Number(row.detention_accrued);
      }

      lines.push({
        container_id: row.container_id,
        container_number: row.container?.container_number ?? null,
        charge_description:
          usedSlab?.charge_description ??
          usedSlab?.name ??
          "Detention / Storage",
        days,
        amount: Math.round(amount * 10000) / 10000,
        slab_code: usedSlab?.code ?? "MANUAL",
        currency_code: usedSlab?.currency_code ?? baseHint,
      });
    }

    return {
      success: true,
      data: {
        storage_upto_date: dto.storage_upto_date,
        lines,
        total_amount: lines.reduce((s, l) => s + l.amount, 0),
      },
    };
  }

  async confirmToCosting(
    tenantId: string,
    jobId: string,
    dto: ConfirmStorageChargesDto,
    actorId?: string,
  ) {
    const calc = await this.calculate(tenantId, jobId, {
      storage_upto_date: dto.storage_upto_date,
    });
    const selected = new Set(dto.line_keys ?? calc.data.lines.map((_, i) => i));
    const toPost = calc.data.lines.filter((_, i) => selected.has(i));
    if (!toPost.length) {
      throw new BadRequestException("No storage/detention lines selected.");
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const created = [];
      for (const line of toPost) {
        let chargeCode = await tx.chargeCode.findFirst({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            description: { contains: "detention", mode: "insensitive" },
          },
        });
        if (!chargeCode) {
          chargeCode = await tx.chargeCode.findFirst({
            where: { tenant_id: tenantId, deleted_at: null, is_active: true },
          });
        }
        if (!chargeCode) {
          throw new BadRequestException("No charge code configured for storage.");
        }
        const row = await tx.jobCharge.create({
          data: {
            tenant_id: tenantId,
            job_id: jobId,
            charge_code_id: chargeCode.id,
            description: `${line.charge_description} (${line.days}d)`,
            quantity: line.days,
            unit_price: line.amount / Math.max(line.days, 1),
            currency_code: line.currency_code,
            amount: line.amount,
            amount_base_currency: line.amount,
            created_by: actorId,
            updated_by: actorId,
          },
        });
        created.push(row);
      }
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_STORAGE_CONFIRM_COSTING",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            storage_upto_date: dto.storage_upto_date,
            charge_ids: created.map((c) => c.id),
          } as Prisma.InputJsonValue,
        },
      });
      return { success: true, data: { charges: created } };
    });
  }

  private async loadFclJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: { sea_fcl_details: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { base_currency: true },
    });
    return {
      job,
      baseHint: tenant?.base_currency ?? "USD",
    };
  }
}
