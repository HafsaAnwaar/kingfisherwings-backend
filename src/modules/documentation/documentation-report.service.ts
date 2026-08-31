import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import { JobStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentationPaginationDto, paginated } from './dto/documentation-pagination.dto';

export class DocumentationReportQueryDto extends DocumentationPaginationDto {
  branch_id?: string;
  from_date?: string;
  to_date?: string;
  format?: 'json' | 'csv';
}

@Injectable()
export class DocumentationReportService {
  constructor(private readonly prisma: PrismaService) {}

  listReports() {
    return {
      items: [
        { code: 'eta-followup', name: 'ETA Follow-up' },
        { code: 'etd-followup', name: 'ETD Follow-up' },
        { code: 'jobs-list', name: 'Jobs List' },
        { code: 'manifest-status', name: 'Manifest Status' },
      ],
    };
  }

  async etaFollowup(tenantId: string, query: DocumentationReportQueryDto) {
    return this.dateFollowup(tenantId, 'eta', query);
  }

  async etdFollowup(tenantId: string, query: DocumentationReportQueryDto) {
    return this.dateFollowup(tenantId, 'etd', query);
  }

  async jobsList(tenantId: string, query: DocumentationReportQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
      };

      const [items, total] = await Promise.all([
        tx.job.findMany({
          where,
          select: {
            id: true,
            job_number: true,
            job_type: true,
            status: true,
            etd: true,
            eta: true,
            branch_id: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        tx.job.count({ where }),
      ]);

      const result = paginated(items, page, limit, total);
      return query.format === 'csv' ? this.asCsv(result.items) : result;
    });
  }

  async manifestStatus(tenantId: string, query: DocumentationReportQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.DocumentationEdiSubmissionWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        edi_type: { in: ['BAYAN_MASTER', 'BAYAN_HOUSE', 'CGM'] },
      };

      const [items, total] = await Promise.all([
        tx.documentationEdiSubmission.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        tx.documentationEdiSubmission.count({ where }),
      ]);

      const result = paginated(items, page, limit, total);
      return query.format === 'csv' ? this.asCsv(result.items) : result;
    });
  }

  private async dateFollowup(
    tenantId: string,
    field: 'eta' | 'etd',
    query: DocumentationReportQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const range = {
      ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
      ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
    };

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        status: { not: JobStatus.COMPLETED },
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(Object.keys(range).length ? { [field]: range } : {}),
      };

      const [items, total] = await Promise.all([
        tx.job.findMany({
          where,
          select: {
            id: true,
            job_number: true,
            job_type: true,
            status: true,
            etd: true,
            eta: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [field]: 'asc' },
        }),
        tx.job.count({ where }),
      ]);

      const result = paginated(items, page, limit, total);
      return query.format === 'csv' ? this.asCsv(result.items) : result;
    });
  }

  private asCsv(rows: Record<string, unknown>[]) {
    if (!rows.length) return { content_type: 'text/csv', data: '' };
    const data = stringify(rows, { header: true });
    return { content_type: 'text/csv', data };
  }
}
