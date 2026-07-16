import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContainerStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CalculateCfsStorageDto,
  CreateDamageReportDto,
  CreateJobDepositDto,
  CreatePartDeliveryDto,
  CreateProofOfDeliveryDto,
  LinkTranshipmentDto,
  ReturnContainerDto,
  UpdateCustomsStatusDto,
  UpdateJobDepositDto,
  UpsertContainerFreeDaysDto,
} from './dto/sea-fcl-import.dto';

@Injectable()
export class SeaFclImportService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Free days / demurrage / detention ─────────────────────────────────────

  async listFreeDays(tenantId: string, jobId: string) {
    await this.assertImportJob(tenantId, jobId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerFreeDays.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: 'asc' },
      }),
    );
    return rows.map((r) => this.withTrafficLight(r));
  }

  async upsertFreeDays(tenantId: string, jobId: string, dto: UpsertContainerFreeDaysDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getImportDetailOrThrow(tx, tenantId, jobId);
      await this.assertContainerOnDetail(tx, tenantId, detail.id, dto.container_id);

      const data = {
        free_days_allowed: dto.free_days_allowed ?? 7,
        last_free_day_date: dto.last_free_day_date ? new Date(dto.last_free_day_date) : undefined,
        demurrage_start_date: dto.demurrage_start_date ? new Date(dto.demurrage_start_date) : undefined,
        detention_start_date: dto.detention_start_date ? new Date(dto.detention_start_date) : undefined,
        demurrage_rate_per_day: dto.demurrage_rate_per_day ?? 0,
        detention_rate_per_day: dto.detention_rate_per_day ?? 0,
        updated_by: actorId,
      };

      const existing = await tx.containerFreeDays.findFirst({
        where: { container_id: dto.container_id, tenant_id: tenantId, deleted_at: null },
      });

      const row = existing
        ? await tx.containerFreeDays.update({ where: { id: existing.id }, data })
        : await tx.containerFreeDays.create({
            data: {
              tenant_id: tenantId,
              job_id: jobId,
              container_id: dto.container_id,
              ...data,
              created_by: actorId,
            },
          });

      return this.recalculateOne(tx, row.id);
    });
  }

  async recalculateDemurrage(tenantId: string, jobId: string) {
    await this.assertImportJob(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const rows = await tx.containerFreeDays.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
      });
      const updated = [];
      for (const row of rows) {
        updated.push(await this.recalculateOne(tx, row.id));
      }
      return {
        job_id: jobId,
        containers: updated.map((r) => this.withTrafficLight(r)),
        totals: {
          demurrage_accrued: updated.reduce((s, r) => s + Number(r.demurrage_accrued), 0),
          detention_accrued: updated.reduce((s, r) => s + Number(r.detention_accrued), 0),
        },
      };
    });
  }

  /** Daily cron — recalculate all active free-day rows for a tenant. */
  async recalculateAllForTenant(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const rows = await tx.containerFreeDays.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        select: { id: true },
      });
      let count = 0;
      for (const row of rows) {
        await this.recalculateOne(tx, row.id);
        count += 1;
      }
      return count;
    });
  }

  // ── Deposits ──────────────────────────────────────────────────────────────

  async listDeposits(tenantId: string, jobId: string) {
    await this.assertImportJob(tenantId, jobId);
    const deposits = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobDeposit.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: 'desc' },
      }),
    );
    return deposits.map((d) => ({ ...d, expiry_alert: this.depositExpiryAlert(d.deposit_expiry_date) }));
  }

  async createDeposit(tenantId: string, jobId: string, dto: CreateJobDepositDto, actorId?: string) {
    await this.assertImportJob(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobDeposit.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          deposit_type: dto.deposit_type,
          deposit_amount: dto.deposit_amount,
          currency_code: dto.currency_code ?? 'AED',
          deposit_receipt_number: dto.deposit_receipt_number,
          deposit_expiry_date: dto.deposit_expiry_date ? new Date(dto.deposit_expiry_date) : undefined,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async updateDeposit(
    tenantId: string,
    jobId: string,
    depositId: string,
    dto: UpdateJobDepositDto,
    actorId?: string,
  ) {
    await this.assertImportJob(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobDeposit.findFirst({
        where: { id: depositId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!existing) throw new NotFoundException('Deposit not found.');

      const { deposit_expiry_date, ...rest } = dto;
      return tx.jobDeposit.update({
        where: { id: depositId },
        data: {
          ...rest,
          ...(deposit_expiry_date ? { deposit_expiry_date: new Date(deposit_expiry_date) } : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async removeDeposit(tenantId: string, jobId: string, depositId: string, actorId?: string) {
    await this.assertImportJob(tenantId, jobId);
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobDeposit.findFirst({
        where: { id: depositId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!existing) throw new NotFoundException('Deposit not found.');
      await tx.jobDeposit.update({
        where: { id: depositId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  async listExpiringDeposits(tenantId: string, withinDays = 90) {
    const until = new Date();
    until.setDate(until.getDate() + withinDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const deposits = await tx.jobDeposit.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          deposit_expiry_date: { gte: today, lte: until },
        },
        orderBy: { deposit_expiry_date: 'asc' },
      });
      return deposits.map((d) => ({ ...d, expiry_alert: this.depositExpiryAlert(d.deposit_expiry_date) }));
    });
  }

  // ── Customs status ────────────────────────────────────────────────────────

  async updateCustomsStatus(tenantId: string, jobId: string, dto: UpdateCustomsStatusDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getImportDetailOrThrow(tx, tenantId, jobId);
      const updated = await tx.seaFclJobDetail.update({
        where: { job_id: jobId },
        data: {
          customs_status: dto.customs_status,
          ...(dto.customs_clearance_date
            ? { customs_clearance_date: new Date(dto.customs_clearance_date) }
            : dto.customs_status === 'CLEARED' || dto.customs_status === 'RELEASED'
              ? { customs_clearance_date: new Date() }
              : {}),
          updated_by: actorId,
        },
      });

      if (dto.customs_status === 'FILED') {
        await this.markMilestone(tx, tenantId, jobId, 'CUSTOMS_ENTRY_FILED', actorId);
      }
      if (dto.customs_status === 'CLEARED' || dto.customs_status === 'RELEASED') {
        await this.markMilestone(tx, tenantId, jobId, 'CUSTOMS_CLEARED', actorId);
      }

      return updated;
    });
  }

  // ── Container return ──────────────────────────────────────────────────────

  async returnContainer(
    tenantId: string,
    jobId: string,
    containerId: string,
    dto: ReturnContainerDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getImportDetailOrThrow(tx, tenantId, jobId);
      await this.assertContainerOnDetail(tx, tenantId, detail.id, containerId);

      const returnedAt = dto.returned_at ? new Date(dto.returned_at) : new Date();
      const container = await tx.jobContainer.update({
        where: { id: containerId },
        data: {
          returned_at: returnedAt,
          return_condition: dto.return_condition,
          status: ContainerStatus.RETURNED,
          updated_by: actorId,
        },
      });

      await this.markMilestone(tx, tenantId, jobId, 'CONTAINER_RETURNED_TO_SHIPPING_LINE', actorId, returnedAt);
      return container;
    });
  }

  // ── Part delivery / POD / damage ──────────────────────────────────────────

  async listPartDeliveries(tenantId: string, jobId: string) {
    await this.assertImportJob(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partDelivery.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { delivery_date: 'asc' },
      }),
    );
  }

  async createPartDelivery(tenantId: string, jobId: string, dto: CreatePartDeliveryDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getImportDetailOrThrow(tx, tenantId, jobId);
      const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });
      const previous = await tx.partDelivery.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
      });
      const deliveredSoFar = previous.reduce((s, p) => s + p.packages_delivered, 0) + dto.packages_delivered;
      const totalPackages = job?.pieces ?? null;
      const remaining =
        totalPackages != null ? Math.max(totalPackages - deliveredSoFar, 0) : dto.packages_delivered >= 0 ? null : null;

      return tx.partDelivery.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          container_id: dto.container_id,
          consignee_id: dto.consignee_id,
          delivery_date: new Date(dto.delivery_date),
          packages_delivered: dto.packages_delivered,
          quantity_remaining: totalPackages != null ? remaining : undefined,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async listPods(tenantId: string, jobId: string) {
    await this.assertImportJob(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.proofOfDelivery.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { actual_delivery_date: 'desc' },
      }),
    );
  }

  async createPod(tenantId: string, jobId: string, dto: CreateProofOfDeliveryDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getImportDetailOrThrow(tx, tenantId, jobId);
      const pod = await tx.proofOfDelivery.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          container_id: dto.container_id,
          actual_delivery_date: new Date(dto.actual_delivery_date),
          delivered_by: dto.delivered_by,
          received_by: dto.received_by,
          signature_image_path: dto.signature_image_path,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      await this.markMilestone(
        tx,
        tenantId,
        jobId,
        'CONTAINER_DELIVERED_TO_CONSIGNEE',
        actorId,
        new Date(dto.actual_delivery_date),
      );
      return pod;
    });
  }

  async listDamageReports(tenantId: string, jobId: string) {
    await this.assertImportJob(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.damageReport.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { reported_at: 'desc' },
      }),
    );
  }

  async createDamageReport(tenantId: string, jobId: string, dto: CreateDamageReportDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getImportDetailOrThrow(tx, tenantId, jobId);
      if (dto.container_id) {
        await this.assertContainerOnDetail(tx, tenantId, detail.id, dto.container_id);
      }
      return tx.damageReport.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          container_id: dto.container_id,
          damage_description: dto.damage_description,
          photo_urls: dto.photo_urls ?? [],
          survey_report_number: dto.survey_report_number,
          reported_at: dto.reported_at ? new Date(dto.reported_at) : new Date(),
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  // ── Transhipment link + CFS storage ───────────────────────────────────────

  async linkTranshipment(tenantId: string, jobId: string, dto: LinkTranshipmentDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getImportDetailOrThrow(tx, tenantId, jobId);
      const exportJob = await tx.job.findFirst({
        where: { id: dto.export_job_id, tenant_id: tenantId, deleted_at: null, job_type: 'SEA_FCL_EXPORT' },
      });
      if (!exportJob) {
        throw new NotFoundException('Linked SEA_FCL_EXPORT job not found.');
      }
      return tx.seaFclJobDetail.update({
        where: { job_id: jobId },
        data: { linked_export_job_id: dto.export_job_id, updated_by: actorId },
      });
    });
  }

  async calculateCfsStorage(tenantId: string, jobId: string, dto: CalculateCfsStorageDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getImportDetailOrThrow(tx, tenantId, jobId);
      const rate = Number(detail.cfs_storage_rate_per_day ?? 0);
      const start = detail.cfs_storage_start_date;
      if (!start || rate <= 0) {
        return {
          job_id: jobId,
          days: 0,
          rate_per_day: rate,
          storage_amount: 0,
          message: 'CFS storage start date and rate_per_day must be set on sea-fcl-details.',
        };
      }
      const asOf = dto.as_of_date ? new Date(dto.as_of_date) : new Date();
      const ms = asOf.getTime() - new Date(start).getTime();
      const days = Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 0);
      return {
        job_id: jobId,
        start_date: start,
        as_of_date: asOf.toISOString().slice(0, 10),
        days,
        rate_per_day: rate,
        storage_amount: Math.round(days * rate * 10000) / 10000,
      };
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async recalculateOne(tx: Prisma.TransactionClient, freeDaysId: string) {
    const row = await tx.containerFreeDays.findFirstOrThrow({ where: { id: freeDaysId } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const demurrageDays = this.daysPast(row.demurrage_start_date ?? row.last_free_day_date, today);
    const detentionDays = this.daysPast(row.detention_start_date, today);

    return tx.containerFreeDays.update({
      where: { id: freeDaysId },
      data: {
        demurrage_accrued: demurrageDays * Number(row.demurrage_rate_per_day),
        detention_accrued: detentionDays * Number(row.detention_rate_per_day),
        last_calculated_at: new Date(),
      },
    });
  }

  private daysPast(from: Date | null | undefined, today: Date): number {
    if (!from) return 0;
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }

  private withTrafficLight<T extends { last_free_day_date: Date | null }>(row: T) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!row.last_free_day_date) {
      return { ...row, days_remaining: null as number | null, status: 'NONE' as const };
    }
    const lfd = new Date(row.last_free_day_date);
    lfd.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((lfd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let status: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
    if (daysRemaining <= 0) status = 'RED';
    else if (daysRemaining <= 3) status = 'AMBER';
    return { ...row, days_remaining: daysRemaining, status };
  }

  private depositExpiryAlert(expiry: Date | null) {
    if (!expiry) return { days_remaining: null as number | null, band: 'NONE' as const };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const e = new Date(expiry);
    e.setHours(0, 0, 0, 0);
    const days = Math.ceil((e.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let band: 'OK' | 'D90' | 'D60' | 'D30' | 'D7' | 'EXPIRED' = 'OK';
    if (days < 0) band = 'EXPIRED';
    else if (days <= 7) band = 'D7';
    else if (days <= 30) band = 'D30';
    else if (days <= 60) band = 'D60';
    else if (days <= 90) band = 'D90';
    return { days_remaining: days, band };
  }

  private async assertImportJob(tenantId: string, jobId: string) {
    await this.prisma.runWithTenant(tenantId, (tx) => this.getImportDetailOrThrow(tx, tenantId, jobId));
  }

  private async getImportDetailOrThrow(tx: Prisma.TransactionClient, tenantId: string, jobId: string) {
    const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });
    if (!job) throw new NotFoundException('Job not found.');
    if (job.job_type !== 'SEA_FCL_IMPORT') {
      throw new BadRequestException('This endpoint requires a SEA_FCL_IMPORT job.');
    }
    const detail = await tx.seaFclJobDetail.findFirst({
      where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
    });
    if (!detail) throw new NotFoundException('Sea FCL details not found for this job.');
    return detail;
  }

  private async assertContainerOnDetail(
    tx: Prisma.TransactionClient,
    tenantId: string,
    seaFclDetailId: string,
    containerId: string,
  ) {
    const container = await tx.jobContainer.findFirst({
      where: { id: containerId, sea_fcl_detail_id: seaFclDetailId, tenant_id: tenantId, deleted_at: null },
    });
    if (!container) throw new NotFoundException('Container not found on this job.');
    return container;
  }

  private async markMilestone(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    milestoneName: string,
    actorId?: string,
    actualDate: Date = new Date(),
  ) {
    const milestone = await tx.jobMilestone.findFirst({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: milestoneName,
        deleted_at: null,
        actual_date: null,
      },
    });
    if (!milestone) return;
    await tx.jobMilestone.update({
      where: { id: milestone.id },
      data: { actual_date: actualDate, completed_by: actorId, updated_by: actorId },
    });
  }
}
