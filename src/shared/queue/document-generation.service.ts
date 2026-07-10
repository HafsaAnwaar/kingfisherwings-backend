import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DocumentEntityType, DocumentGenerationStatus, DocumentType, QuotationPdfMode } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';
import { DOCUMENT_GENERATION_QUEUE, DocumentGenerationJobPayload } from './queue.constants';

@Injectable()
export class DocumentGenerationService {
  private readonly logger = new Logger(DocumentGenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly storage: StorageService,
    @InjectQueue(DOCUMENT_GENERATION_QUEUE) private readonly queue: Queue<DocumentGenerationJobPayload>,
  ) {}

  async enqueueQuotationPdf(
    tenantId: string,
    quotationId: string,
    mode: QuotationPdfMode,
    requestedBy?: string,
    layoutVariant?: string,
  ) {
    const task = await this.prisma.documentGenerationTask.create({
      data: {
        tenant_id: tenantId,
        entity_type: 'QUOTATION',
        quotation_id: quotationId,
        pdf_mode: mode,
        layout_variant: layoutVariant,
        status: 'PENDING',
        requested_by: requestedBy,
      },
    });

    const bullJob = await this.queue.add({ taskId: task.id, tenantId });
    await this.prisma.documentGenerationTask.update({
      where: { id: task.id },
      data: { bull_job_id: String(bullJob.id) },
    });

    return task;
  }

  async enqueueJobDocument(
    tenantId: string,
    jobId: string,
    documentType: DocumentType,
    requestedBy?: string,
    layoutVariant?: string,
    isOriginal = false,
  ) {
    const task = await this.prisma.documentGenerationTask.create({
      data: {
        tenant_id: tenantId,
        entity_type: 'JOB',
        job_id: jobId,
        document_type: documentType,
        layout_variant: layoutVariant,
        status: 'PENDING',
        requested_by: requestedBy,
      },
    });

    const bullJob = await this.queue.add({
      taskId: task.id,
      tenantId,
      isOriginal,
    });

    await this.prisma.documentGenerationTask.update({
      where: { id: task.id },
      data: { bull_job_id: String(bullJob.id) },
    });

    return task;
  }

  async getTask(tenantId: string, taskId: string) {
    const task = await this.prisma.documentGenerationTask.findFirst({
      where: { id: taskId, tenant_id: tenantId },
    });

    if (!task) {
      throw new NotFoundException('Document generation task not found.');
    }

    return task;
  }

  async listTasks(tenantId: string, filters: { quotationId?: string; jobId?: string; status?: DocumentGenerationStatus }) {
    return this.prisma.documentGenerationTask.findMany({
      where: {
        tenant_id: tenantId,
        ...(filters.quotationId ? { quotation_id: filters.quotationId } : {}),
        ...(filters.jobId ? { job_id: filters.jobId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
  }

  async processTask(taskId: string, tenantId: string, isOriginal = false) {
    await this.prisma.documentGenerationTask.update({
      where: { id: taskId },
      data: { status: 'PROCESSING', started_at: new Date() },
    });

    try {
      const task = await this.prisma.documentGenerationTask.findFirstOrThrow({
        where: { id: taskId, tenant_id: tenantId },
      });

      let buffer: Buffer;
      let filename: string;

      if (task.entity_type === 'QUOTATION' && task.quotation_id && task.pdf_mode) {
        const result = await this.buildQuotationPdf(tenantId, task.quotation_id, task.pdf_mode);
        buffer = result.buffer;
        filename = result.filename;
      } else if (task.entity_type === 'JOB' && task.job_id && task.document_type) {
        const result = await this.buildJobDocumentPdf(tenantId, task.job_id, task.document_type, isOriginal);
        buffer = result.buffer;
        filename = result.filename;
      } else {
        throw new Error('Invalid document generation task configuration.');
      }

      const stored = await this.storage.saveBuffer(tenantId, buffer, filename);

      const completed = await this.prisma.documentGenerationTask.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          file_url: stored.fileUrl,
          s3_key: stored.s3Key,
          file_name: filename,
          file_size: stored.fileSize,
          completed_at: new Date(),
        },
      });

      if (task.entity_type === 'QUOTATION' && task.quotation_id && task.pdf_mode) {
        const pdfData =
          task.pdf_mode === 'CUSTOMER'
            ? {
                customer_pdf_url: stored.fileUrl,
                customer_pdf_s3_key: stored.s3Key,
                customer_pdf_generated_at: new Date(),
              }
            : {
                internal_pdf_url: stored.fileUrl,
                internal_pdf_s3_key: stored.s3Key,
                internal_pdf_generated_at: new Date(),
              };

        await this.prisma.quotation.update({ where: { id: task.quotation_id }, data: pdfData });
      }

      if (task.entity_type === 'JOB' && task.job_id && task.document_type && task.requested_by) {
        await this.prisma.jobDocument.create({
          data: {
            tenant_id: tenantId,
            job_id: task.job_id,
            document_type: task.document_type,
            file_name: filename,
            file_url: stored.fileUrl,
            s3_key: stored.s3Key,
            file_size: stored.fileSize,
            mime_type: 'application/pdf',
            version: 1,
            is_original: isOriginal,
            layout_variant: task.layout_variant,
            generation_status: 'COMPLETED',
            generated_at: new Date(),
            generation_task_id: taskId,
            uploaded_by: task.requested_by,
            created_by: task.requested_by,
            updated_by: task.requested_by,
          },
        });
      }

      return completed;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Document generation failed';
      this.logger.error(`Task ${taskId} failed: ${message}`);

      await this.prisma.documentGenerationTask.update({
        where: { id: taskId },
        data: { status: 'FAILED', error_message: message, completed_at: new Date() },
      });

      throw error;
    }
  }

  private async buildQuotationPdf(tenantId: string, quotationId: string, mode: QuotationPdfMode) {
    const quotation = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({
        where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
        include: { lines: { orderBy: { sort_order: 'asc' } } },
      }),
    );

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    const customer = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({ where: { id: quotation.customer_id, tenant_id: tenantId } }),
    );

    const buffer = await this.pdfService.generateQuotationPdf(
      {
        quotation_number: quotation.quotation_number,
        status: quotation.status,
        job_type: quotation.job_type,
        customer_name: customer?.name,
        commodity: quotation.commodity ?? undefined,
        gross_weight: quotation.gross_weight?.toString(),
        chargeable_weight: quotation.chargeable_weight?.toString(),
        volume_cbm: quotation.volume_cbm?.toString(),
        pieces: quotation.pieces ?? undefined,
        currency_code: quotation.currency_code,
        revenue_total: quotation.revenue_total.toString(),
        cost_total: quotation.cost_total.toString(),
        gp_amount: quotation.gp_amount.toString(),
        gp_percent: quotation.gp_percent.toString(),
        valid_until: quotation.valid_until?.toISOString().slice(0, 10),
        remarks: quotation.remarks ?? undefined,
        lines: quotation.lines.map((l) => ({
          description: l.description,
          quantity: l.quantity.toString(),
          unit_price: l.unit_price.toString(),
          amount: l.amount.toString(),
          is_cost: l.is_cost,
        })),
      },
      mode,
    );

    const filename = `${quotation.quotation_number}-${mode.toLowerCase()}.pdf`;
    return { buffer, filename };
  }

  private async buildJobDocumentPdf(
    tenantId: string,
    jobId: string,
    documentType: DocumentType,
    isOriginal: boolean,
  ) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: { air_details: true },
      }),
    );

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    const [shipper, consignee, originPort, destPort, airline] = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const s = job.shipper_id
        ? await tx.party.findFirst({ where: { id: job.shipper_id, tenant_id: tenantId } })
        : null;
      const c = job.consignee_id
        ? await tx.party.findFirst({ where: { id: job.consignee_id, tenant_id: tenantId } })
        : null;
      const o = job.origin_port_id
        ? await tx.port.findFirst({ where: { id: job.origin_port_id, tenant_id: tenantId } })
        : null;
      const d = job.dest_port_id
        ? await tx.port.findFirst({ where: { id: job.dest_port_id, tenant_id: tenantId } })
        : null;
      const a =
        job.air_details?.airline_id
          ? await tx.airline.findFirst({ where: { id: job.air_details.airline_id, tenant_id: tenantId } })
          : null;
      return [s, c, o, d, a] as const;
    });

    const buffer = await this.pdfService.generateJobDocumentPdf({
      job_number: job.job_number,
      job_type: job.job_type,
      document_type: documentType,
      shipper_name: shipper?.name,
      consignee_name: consignee?.name,
      commodity: job.commodity ?? undefined,
      gross_weight: job.gross_weight?.toString(),
      chargeable_weight: job.chargeable_weight?.toString(),
      pieces: job.pieces ?? undefined,
      hawb_number: job.air_details?.hawb_number ?? undefined,
      mawb_number: job.air_details?.mawb_number ?? undefined,
      flight_number: job.air_details?.flight_number ?? undefined,
      airline_name: airline?.name,
      origin: originPort?.name,
      destination: destPort?.name,
      is_original: isOriginal,
    });

    const filename = `${job.job_number}-${documentType.toLowerCase()}${isOriginal ? '-original' : '-draft'}.pdf`;
    return { buffer, filename };
  }
}
