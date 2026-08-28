import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';
import { LclCfsStorageCalculationDto, LinkLclTranshipmentDto, LinkLclWmsStorageDto } from './dto/sea-lcl.dto';

const LCL_IMPORT: JobType = 'SEA_LCL_IMPORT';

@Injectable()
export class SeaLclImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService,
  ) {}

  async calculateCfsStorage(tenantId: string, jobId: string, dto: LclCfsStorageCalculationDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getLclImportDetailOrThrow(tx, tenantId, jobId);

      if (detail.wms_storage_charge_id) {
        const wmsCharge = await tx.wmsStorageCharge.findFirst({
          where: { id: detail.wms_storage_charge_id, tenant_id: tenantId, deleted_at: null },
        });
        if (wmsCharge) {
          return {
            job_id: jobId,
            source: 'WMS',
            wms_storage_charge_id: wmsCharge.id,
            chargeable_days: wmsCharge.chargeable_days,
            basis_qty: Number(wmsCharge.cbm ?? wmsCharge.quantity),
            rate_per_day: Number(wmsCharge.rate_per_day),
            storage_amount: Number(wmsCharge.amount),
            currency_code: wmsCharge.currency_code,
            status: wmsCharge.status,
          };
        }
      }

      const job = await tx.job.findFirstOrThrow({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      const start = detail.cfs_storage_start_date;
      const rate = Number(detail.cfs_storage_rate_per_day ?? 0);
      const freeDays = detail.cfs_storage_free_days ?? 0;
      const basis = detail.storage_rate_basis ?? 'CBM';

      if (!start || rate <= 0) {
        return {
          job_id: jobId,
          source: 'JOB',
          chargeable_days: 0,
          basis_qty: 0,
          rate_per_day: rate,
          storage_rate_basis: basis,
          storage_amount: 0,
          message: 'cfs_storage_start_date and cfs_storage_rate_per_day must be set on sea-lcl-details.',
        };
      }

      const asOf = dto.as_of_date ? new Date(dto.as_of_date) : new Date();
      const ms = asOf.getTime() - new Date(start).getTime();
      const elapsedDays = Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 0);
      const chargeableDays = Math.max(elapsedDays - freeDays, 0);
      const basisQty =
        basis === 'KG'
          ? Number(job.chargeable_weight ?? job.gross_weight ?? 0)
          : Number(job.volume_cbm ?? 0);
      const storageAmount = Math.round(chargeableDays * rate * (basis === 'CBM' ? Math.max(basisQty, 1) : basisQty) * 10000) / 10000;

      return {
        job_id: jobId,
        source: 'JOB',
        start_date: start,
        as_of_date: asOf.toISOString().slice(0, 10),
        elapsed_days: elapsedDays,
        free_days: freeDays,
        chargeable_days: chargeableDays,
        basis_qty: basisQty,
        rate_per_day: rate,
        storage_rate_basis: basis,
        storage_amount: storageAmount,
      };
    });
  }

  async createCfsStorageInvoice(tenantId: string, jobId: string, actorId?: string) {
    const calc = await this.calculateCfsStorage(tenantId, jobId, {});
    if (calc.storage_amount <= 0) {
      throw new BadRequestException(
        calc.message ?? 'Storage amount is zero — configure CFS storage fields or link a WMS storage charge.',
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getLclImportDetailOrThrow(tx, tenantId, jobId);

      if (detail.storage_invoice_id) {
        const existing = await tx.invoice.findFirst({
          where: { id: detail.storage_invoice_id, tenant_id: tenantId, deleted_at: null },
        });
        if (existing) {
          if (existing.status === 'DRAFT') return existing;
          throw new ConflictException('CFS storage invoice has already been posted for this job.');
        }
      }

      const job = await tx.job.findFirstOrThrow({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      const customerId = job.consignee_id ?? job.billing_party_id ?? job.shipper_id;
      if (!customerId) {
        throw new BadRequestException('Job must have consignee, billing party, or shipper to invoice storage.');
      }

      let storageChargeCode = await tx.chargeCode.findFirst({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          code: { equals: 'STORAGE', mode: 'insensitive' },
        },
      });
      if (!storageChargeCode) {
        storageChargeCode = await tx.chargeCode.findFirst({
          where: { tenant_id: tenantId, deleted_at: null, is_active: true },
          orderBy: { created_at: 'asc' },
        });
      }
      if (!storageChargeCode) {
        throw new BadRequestException('No charge code available for storage line.');
      }

      const charge = await tx.jobCharge.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          charge_code_id: storageChargeCode.id,
          description: `LCL CFS storage (${calc.chargeable_days ?? 0} day(s))`,
          quantity: 1,
          unit_price: calc.storage_amount,
          currency_code: calc.currency_code ?? 'AED',
          exchange_rate: 1,
          amount: calc.storage_amount,
          amount_base_currency: calc.storage_amount,
          tax_amount: 0,
          is_cost: false,
          is_billable: true,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      const invoice = await this.invoices.createStorageDraftFromJobCharge(
        tenantId,
        jobId,
        charge.id,
        customerId,
        actorId,
        tx,
      );

      await tx.seaLclJobDetail.update({
        where: { job_id: jobId },
        data: { storage_invoice_id: invoice.id, updated_by: actorId },
      });

      return invoice;
    });
  }

  async linkWmsStorageCharge(tenantId: string, jobId: string, dto: LinkLclWmsStorageDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getLclImportDetailOrThrow(tx, tenantId, jobId);

      const wmsCharge = await tx.wmsStorageCharge.findFirst({
        where: { id: dto.wms_storage_charge_id, tenant_id: tenantId, deleted_at: null },
      });
      if (!wmsCharge) {
        throw new NotFoundException('WMS storage charge not found.');
      }

      return tx.seaLclJobDetail.update({
        where: { job_id: jobId },
        data: { wms_storage_charge_id: dto.wms_storage_charge_id, updated_by: actorId },
      });
    });
  }

  async linkTranshipment(tenantId: string, jobId: string, dto: LinkLclTranshipmentDto, actorId?: string) {
    if (dto.export_job_id === jobId) {
      throw new BadRequestException('Cannot link a job to itself.');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getLclImportDetailOrThrow(tx, tenantId, jobId);
      const exportJob = await tx.job.findFirst({
        where: {
          id: dto.export_job_id,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: { in: ['SEA_LCL_EXPORT', 'SEA_FCL_EXPORT'] },
        },
      });
      if (!exportJob) {
        throw new NotFoundException('Linked export job not found (must be SEA_LCL_EXPORT or SEA_FCL_EXPORT).');
      }

      return tx.seaLclJobDetail.update({
        where: { job_id: jobId },
        data: { linked_export_job_id: dto.export_job_id, updated_by: actorId },
      });
    });
  }

  private async getLclImportDetailOrThrow(tx: Prisma.TransactionClient, tenantId: string, jobId: string) {
    const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });
    if (!job) throw new NotFoundException('Job not found.');
    if (job.job_type !== LCL_IMPORT) {
      throw new BadRequestException('This endpoint requires a SEA_LCL_IMPORT job.');
    }
    const detail = await tx.seaLclJobDetail.findFirst({
      where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
    });
    if (!detail) throw new NotFoundException('Sea LCL details not found for this job.');
    return detail;
  }
}
