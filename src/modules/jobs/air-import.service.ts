import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentType, JobType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../shared/email/email.service';
import { StorageService } from '../../shared/storage/storage.service';
import { InvoicesService } from '../invoices/invoices.service';
import {
  AirStorageCalculationQueryDto,
  CreateCustomsExaminationDto,
  LinkAirTranshipmentDto,
  SendImportNoticeDto,
} from './dto/air-import.dto';

const AIR_IMPORT_TYPE: JobType = 'AIR_IMPORT';

@Injectable()
export class AirImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService,
    private readonly email: EmailService,
    private readonly storage: StorageService,
  ) {}

  async listCustomsExaminations(tenantId: string, jobId: string) {
    await this.assertAirImportJob(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsExamination.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { examination_date: 'desc' },
      }),
    );
  }

  async createCustomsExamination(
    tenantId: string,
    jobId: string,
    dto: CreateCustomsExaminationDto,
    actorId?: string,
  ) {
    await this.assertAirImportJob(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsExamination.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          examination_date: new Date(dto.examination_date),
          examining_officer: dto.examining_officer,
          items_examined: dto.items_examined,
          result: dto.result,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async calculateStorage(tenantId: string, jobId: string, query: AirStorageCalculationQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getAirDetailOrThrow(tx, tenantId, jobId);
      const job = await tx.job.findFirstOrThrow({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      const start = detail.storage_start_date;
      const rate = Number(detail.storage_rate ?? 0);
      const basis = detail.storage_rate_basis;
      const freeDays = detail.storage_free_days ?? 0;

      if (!start || rate <= 0 || !basis) {
        return {
          job_id: jobId,
          chargeable_days: 0,
          basis_qty: 0,
          storage_rate: rate,
          storage_rate_basis: basis,
          storage_amount: 0,
          message: 'storage_start_date, storage_rate, and storage_rate_basis must be set on air-details.',
        };
      }

      const asOf = query.as_of_date ? new Date(query.as_of_date) : new Date();
      const ms = asOf.getTime() - new Date(start).getTime();
      const elapsedDays = Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 0);
      const chargeableDays = Math.max(elapsedDays - freeDays, 0);
      const basisQty =
        basis === 'KG'
          ? Number(job.chargeable_weight ?? job.gross_weight ?? 0)
          : Number(job.volume_cbm ?? 0);
      const storageAmount = Math.round(chargeableDays * rate * basisQty * 10000) / 10000;

      return {
        job_id: jobId,
        start_date: start,
        as_of_date: asOf.toISOString().slice(0, 10),
        elapsed_days: elapsedDays,
        free_days: freeDays,
        chargeable_days: chargeableDays,
        basis_qty: basisQty,
        storage_rate: rate,
        storage_rate_basis: basis,
        storage_amount: storageAmount,
      };
    });
  }

  async createStorageInvoice(tenantId: string, jobId: string, actorId?: string) {
    const calc = await this.calculateStorage(tenantId, jobId, {});
    if (calc.storage_amount <= 0) {
      throw new BadRequestException(
        calc.message ?? 'Storage amount is zero — configure storage fields and ensure chargeable days > 0.',
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getAirDetailOrThrow(tx, tenantId, jobId);

      if (detail.storage_invoice_id) {
        const existing = await tx.invoice.findFirst({
          where: { id: detail.storage_invoice_id, tenant_id: tenantId, deleted_at: null },
        });
        if (existing) {
          if (existing.status === 'DRAFT') {
            return existing;
          }
          throw new ConflictException('Storage invoice has already been posted for this job.');
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
          description: `Air import storage (${calc.chargeable_days} day(s))`,
          quantity: 1,
          unit_price: calc.storage_amount,
          currency_code: 'AED',
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

      await tx.airJobDetail.update({
        where: { job_id: jobId },
        data: { storage_invoice_id: invoice.id, updated_by: actorId },
      });

      return invoice;
    });
  }

  async linkTranshipment(tenantId: string, jobId: string, dto: LinkAirTranshipmentDto, actorId?: string) {
    if (dto.export_job_id === jobId) {
      throw new BadRequestException('Cannot link a job to itself.');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getAirDetailOrThrow(tx, tenantId, jobId);
      const exportJob = await tx.job.findFirst({
        where: {
          id: dto.export_job_id,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: { in: ['AIR_EXPORT', 'SEA_FCL_EXPORT'] },
        },
      });
      if (!exportJob) {
        throw new NotFoundException('Linked export job not found (must be AIR_EXPORT or SEA_FCL_EXPORT).');
      }

      return tx.airJobDetail.update({
        where: { job_id: jobId },
        data: { linked_export_job_id: dto.export_job_id, updated_by: actorId },
      });
    });
  }

  async sendImportNotice(
    tenantId: string,
    jobId: string,
    documentType: Extract<DocumentType, 'CAN' | 'DELIVERY_ORDER'>,
    dto: SendImportNoticeDto,
    actorId?: string,
  ) {
    const job = await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertAirImportJobInTx(tx, tenantId, jobId);
      return tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      });
    });

    if (!job) throw new NotFoundException('Job not found.');

    let toEmail = dto.to_email;
    if (!toEmail && job.consignee_id) {
      const consignee = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.party.findFirst({
          where: { id: job.consignee_id!, tenant_id: tenantId, deleted_at: null },
          select: { email: true },
        }),
      );
      toEmail = consignee?.email ?? undefined;
    }
    if (!toEmail) {
      throw new BadRequestException('to_email is required when consignee has no email on file.');
    }

    const doc = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobDocument.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          document_type: documentType,
          deleted_at: null,
        },
        orderBy: { created_at: 'desc' },
      }),
    );

    if (!doc?.file_url) {
      throw new BadRequestException(`Generate ${documentType} PDF first before sending.`);
    }

    const subject =
      documentType === 'CAN'
        ? `Cargo Arrival Notice — ${job.job_number}`
        : `Delivery Order — ${job.job_number}`;
    const body =
      dto.message ??
      `<p>Please find attached the ${documentType === 'CAN' ? 'Cargo Arrival Notice' : 'Delivery Order'} for job <strong>${job.job_number}</strong>.</p>`;

    if (dto.schedule_at) {
      const scheduledAt = new Date(dto.schedule_at);
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.emailLog.create({
          data: {
            tenant_id: tenantId,
            event_type: 'JOB_DOCUMENT',
            to_email: toEmail!,
            cc_email: dto.cc,
            subject,
            body,
            status: 'PENDING',
            job_id: jobId,
            job_document_id: doc.id,
            scheduled_at: scheduledAt,
            created_by: actorId,
          },
        }),
      );
      return {
        scheduled: true,
        to_email: toEmail,
        schedule_at: dto.schedule_at,
        document_type: documentType,
      };
    }

    const stored = await this.storage.readByStoredFile(tenantId, doc);

    const emailLog = await this.email.send({
      tenantId,
      eventType: 'JOB_DOCUMENT',
      to: toEmail,
      cc: dto.cc,
      subject,
      body,
      jobId,
      jobDocumentId: doc.id,
      createdBy: actorId,
      attachmentName: stored.fileName,
      attachmentBuffer: stored.buffer,
    });

    return {
      success: emailLog.status === 'SENT',
      email_log_id: emailLog.id,
      status: emailLog.status,
      to_email: toEmail,
      document_type: documentType,
    };
  }

  /** Deliver scheduled CAN/DO emails (EmailLog.scheduled_at). */
  async processScheduledImportNotices(tenantId: string) {
    const due = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.emailLog.findMany({
        where: {
          tenant_id: tenantId,
          event_type: 'JOB_DOCUMENT',
          status: 'PENDING',
          scheduled_at: { lte: new Date() },
          job_id: { not: null },
          job_document_id: { not: null },
        },
        take: 50,
        orderBy: { scheduled_at: 'asc' },
      }),
    );

    let sent = 0;
    for (const log of due) {
      if (!log.job_id || !log.job_document_id || !log.to_email) continue;
      try {
        const doc = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.jobDocument.findFirst({
            where: { id: log.job_document_id!, tenant_id: tenantId, deleted_at: null },
          }),
        );
        if (!doc?.file_url) continue;

        const stored = await this.storage.readByStoredFile(tenantId, doc);
        const emailLog = await this.email.send({
          tenantId,
          eventType: 'JOB_DOCUMENT',
          to: log.to_email,
          cc: log.cc_email ?? undefined,
          subject: log.subject,
          body: log.body ?? '',
          jobId: log.job_id,
          jobDocumentId: doc.id,
          createdBy: log.created_by ?? undefined,
          attachmentName: stored.fileName,
          attachmentBuffer: stored.buffer,
        });

        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.emailLog.update({
            where: { id: log.id },
            data: {
              status: emailLog.status,
              sent_at: emailLog.status === 'SENT' ? new Date() : undefined,
              scheduled_at: null,
            },
          }),
        );
        if (emailLog.status === 'SENT') sent += 1;
      } catch {
        // leave PENDING for retry
      }
    }

    return { sent, checked: due.length };
  }

  async assertAirImportJob(tenantId: string, jobId: string) {
    await this.prisma.runWithTenant(tenantId, (tx) => this.assertAirImportJobInTx(tx, tenantId, jobId));
  }

  private async assertAirImportJobInTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
  ) {
    const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });
    if (!job) throw new NotFoundException('Job not found.');
    if (job.job_type !== AIR_IMPORT_TYPE) {
      throw new BadRequestException('This endpoint requires an AIR_IMPORT job.');
    }
    const detail = await tx.airJobDetail.findFirst({
      where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
    });
    if (!detail) throw new NotFoundException('Air job details not found.');
  }

  private async getAirDetailOrThrow(tx: Prisma.TransactionClient, tenantId: string, jobId: string) {
    await this.assertAirImportJobInTx(tx, tenantId, jobId);
    return tx.airJobDetail.findFirstOrThrow({
      where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
    });
  }
}
