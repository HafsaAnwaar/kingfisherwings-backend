import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { parse } from 'csv-parse/sync';
import { DocumentationUploadBatchStatus, DocumentationUploadType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';
import { isRedisEnabledEnv } from '../../shared/redis/redis-options.util';
import {
  DOCUMENTATION_UPLOAD_QUEUE,
  DocumentationUploadJobPayload,
} from '../../shared/queue/queue.constants';
import { assertDocumentationUploadFile } from '../../common/utils/upload-file.util';

@Injectable()
export class DocumentationUploadService {
  private readonly redisEnabled = isRedisEnabledEnv();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    @InjectQueue(DOCUMENTATION_UPLOAD_QUEUE) private readonly uploadQueue: Queue,
  ) {}

  getTemplate(uploadType: DocumentationUploadType) {
    const templates: Record<DocumentationUploadType, { headers: string[]; sample: string[][] }> = {
      CONTAINER_NUMBERS: {
        headers: ['job_number', 'container_number', 'seal_number'],
        sample: [['JOB-001', 'MSCU1234567', 'SEAL001']],
      },
      CONTAINER_TRANSPORT: {
        headers: ['job_number', 'container_number', 'charge_description', 'amount', 'currency_code'],
        sample: [['JOB-001', 'MSCU1234567', 'Transport', '500', 'AED']],
      },
      DPWORLD_TRACKING: {
        headers: ['job_number', 'container_number', 'milestone', 'event_time', 'remarks'],
        sample: [['JOB-001', 'MSCU1234567', 'GATE_IN', '2026-01-01T10:00:00Z', '']],
      },
      TRUCK_POSITIONS: {
        headers: ['job_number', 'vehicle_number', 'latitude', 'longitude', 'recorded_at'],
        sample: [['JOB-001', 'DXB-1234', '25.2048', '55.2708', '2026-01-01T10:00:00Z']],
      },
    };

    const template = templates[uploadType];
    const lines = [template.headers.join(','), ...template.sample.map((r) => r.join(','))];
    return {
      upload_type: uploadType,
      content_type: 'text/csv',
      data: lines.join('\n'),
    };
  }

  async ingest(
    tenantId: string,
    uploadType: DocumentationUploadType,
    file: Express.Multer.File,
    actorId?: string,
  ) {
    assertDocumentationUploadFile(file);

    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype || 'text/csv',
    );

    const batch = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationUploadBatch.create({
        data: {
          tenant_id: tenantId,
          upload_type: uploadType,
          file_name: file.originalname,
          file_storage_key: stored.s3Key,
          status: 'PENDING',
          created_by: actorId,
        },
      }),
    );

    if (this.redisEnabled) {
      await this.uploadQueue.add({ tenantId, batchId: batch.id } satisfies DocumentationUploadJobPayload);
    } else {
      await this.processBatch(tenantId, batch.id);
    }

    return this.getBatch(tenantId, batch.id);
  }

  async getBatch(tenantId: string, id: string) {
    const batch = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationUploadBatch.findFirst({ where: { id, tenant_id: tenantId } }),
    );
    if (!batch) throw new NotFoundException('Upload batch not found.');
    return batch;
  }

  async getBatchErrors(tenantId: string, id: string) {
    const batch = await this.getBatch(tenantId, id);
    return {
      batch_id: batch.id,
      status: batch.status,
      errors: batch.errors ?? [],
    };
  }

  async processBatch(tenantId: string, batchId: string) {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const batch = await tx.documentationUploadBatch.findFirst({
        where: { id: batchId, tenant_id: tenantId },
      });
      if (!batch?.file_storage_key) return;

      await tx.documentationUploadBatch.update({
        where: { id: batchId },
        data: { status: 'PROCESSING' },
      });

      let buffer: Buffer;
      try {
        const filename = batch.file_storage_key.split('/').pop() ?? batch.file_name;
        buffer = await this.storage.readBuffer(tenantId, filename);
      } catch {
        await tx.documentationUploadBatch.update({
          where: { id: batchId },
          data: { status: 'FAILED', errors: [{ row: 0, message: 'Could not read uploaded file.' }] },
        });
        return;
      }

      const rows = await this.parseUploadRows(buffer, batch.file_name);

      const errors: Array<{ row: number; message: string }> = [];
      let success = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          await this.applyRow(tenantId, batch.upload_type, row);
          success++;
        } catch (err) {
          errors.push({
            row: i + 2,
            message: err instanceof Error ? err.message : 'Row processing failed.',
          });
        }
      }

      const status: DocumentationUploadBatchStatus =
        errors.length === rows.length ? 'FAILED' : 'COMPLETED';

      await tx.documentationUploadBatch.update({
        where: { id: batchId },
        data: {
          status,
          total_rows: rows.length,
          success_rows: success,
          error_rows: errors.length,
          errors: errors.length ? errors : undefined,
          processed_at: new Date(),
        },
      });
    });
  }

  private async applyRow(
    tenantId: string,
    uploadType: DocumentationUploadType,
    row: Record<string, string>,
  ) {
    const jobNumber = row.job_number?.trim();
    if (!jobNumber) throw new BadRequestException('job_number is required.');

    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { tenant_id: tenantId, job_number: jobNumber, deleted_at: null },
        include: { sea_fcl_details: true, land_details: true },
      }),
    );
    if (!job) throw new BadRequestException(`Job ${jobNumber} not found.`);

    switch (uploadType) {
      case 'CONTAINER_NUMBERS':
        if (!job.sea_fcl_details) throw new BadRequestException('Job has no FCL details.');
        if (!job.container_type_id) throw new BadRequestException('Job has no container type.');
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.jobContainer.create({
            data: {
              tenant_id: tenantId,
              sea_fcl_detail_id: job.sea_fcl_details!.id,
              container_number: row.container_number,
              seal_number: row.seal_number || undefined,
              container_type_id: job.container_type_id!,
            },
          }),
        );
        break;
      case 'CONTAINER_TRANSPORT':
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.jobMilestone.create({
            data: {
              tenant_id: tenantId,
              job_id: job.id,
              milestone: 'TRANSPORT_CHARGE_UPLOAD',
              notes: `${row.charge_description ?? 'Transport'}: ${row.amount ?? ''} ${row.currency_code ?? ''}`.trim(),
              actual_date: new Date(),
            },
          }),
        );
        break;
      case 'DPWORLD_TRACKING':
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.jobMilestone.create({
            data: {
              tenant_id: tenantId,
              job_id: job.id,
              milestone: row.milestone ?? 'DPWORLD_EVENT',
              notes: row.remarks,
              actual_date: row.event_time ? new Date(row.event_time) : new Date(),
            },
          }),
        );
        break;
      case 'TRUCK_POSITIONS':
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.jobMilestone.create({
            data: {
              tenant_id: tenantId,
              job_id: job.id,
              milestone: 'TRUCK_POSITION',
              notes: `Vehicle ${row.vehicle_number ?? ''} @ ${row.latitude},${row.longitude}`,
              actual_date: row.recorded_at ? new Date(row.recorded_at) : new Date(),
            },
          }),
        );
        break;
      default:
        throw new BadRequestException('Unsupported upload type.');
    }
  }

  private async parseUploadRows(buffer: Buffer, fileName: string): Promise<Record<string, string>[]> {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ExcelJS = require('exceljs') as typeof import('exceljs');
      const workbook = new ExcelJS.Workbook();
      // ExcelJS typings expect Node Buffer; runtime accepts Uint8Array.
      await workbook.xlsx.load(buffer as never);
      const sheet = workbook.worksheets[0];
      if (!sheet) return [];
      const headerRow = sheet.getRow(1);
      const headers: string[] = [];
      headerRow.eachCell((cell, col) => {
        headers[col - 1] = String(cell.value ?? '').trim();
      });
      const rows: Record<string, string>[] = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const record: Record<string, string> = {};
        let hasValue = false;
        headers.forEach((header, idx) => {
          if (!header) return;
          const val = row.getCell(idx + 1).value;
          const text = val == null ? '' : String(val).trim();
          if (text) hasValue = true;
          record[header] = text;
        });
        if (hasValue) rows.push(record);
      });
      return rows;
    }

    return parse(buffer, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
  }
}
