import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentationBoeStatus, JobType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BoeDashboardQueryDto,
  CreateBoeRecordDto,
  UpdateBoeRecordDto,
} from './dto/documentation-boe.dto';
import { paginated } from './dto/documentation-pagination.dto';

@Injectable()
export class DocumentationBoeService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(tenantId: string, query: BoeDashboardQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.DocumentationBoeRecordWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(query.branch_id ? { branch_id: query.branch_id } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.boe_type ? { boe_type: query.boe_type } : {}),
        ...(query.from_date || query.to_date
          ? {
              boe_date: {
                ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
                ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
              },
            }
          : {}),
      };

      if (query.search) {
        Object.assign(where, await this.buildSearchFilter(tx, tenantId, query.search));
      }

      const [rows, total] = await Promise.all([
        tx.documentationBoeRecord.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { boe_date: query.order ?? 'desc' },
        }),
        tx.documentationBoeRecord.count({ where }),
      ]);

      const jobIds = rows.map((r) => r.job_id).filter((id): id is string => !!id);
      const jobs = jobIds.length
        ? await tx.job.findMany({
            where: { tenant_id: tenantId, id: { in: jobIds }, deleted_at: null },
            select: {
              id: true,
              job_number: true,
              job_type: true,
              status: true,
              branch_id: true,
              consignee_id: true,
            },
          })
        : [];
      const jobMap = new Map(jobs.map((j) => [j.id, j]));
      const items = rows.map((row) => ({
        ...row,
        job: row.job_id ? jobMap.get(row.job_id) ?? null : null,
      }));

      return paginated(items, page, limit, total);
    });
  }

  async getPendingClaims(tenantId: string, query: BoeDashboardQueryDto) {
    return this.getDashboard(tenantId, { ...query, status: DocumentationBoeStatus.CLAIM_PENDING });
  }

  async create(tenantId: string, dto: CreateBoeRecordDto, actorId?: string) {
    const record = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const created = await tx.documentationBoeRecord.create({
        data: {
          tenant_id: tenantId,
          boe_number: dto.boe_number,
          boe_date: dto.boe_date ? new Date(dto.boe_date) : undefined,
          boe_type: dto.boe_type,
          status: dto.status,
          job_id: dto.job_id,
          branch_id: dto.branch_id,
          customs_office: dto.customs_office,
          port_id: dto.port_id,
          party_id: dto.party_id,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (dto.job_id) {
        await this.syncCustomsEntryNumber(tx, tenantId, dto.job_id, dto.boe_number);
      }

      return created;
    });

    return record;
  }

  async update(tenantId: string, id: string, dto: UpdateBoeRecordDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.documentationBoeRecord.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });
      if (!existing) throw new NotFoundException('BOE record not found.');

      const updated = await tx.documentationBoeRecord.update({
        where: { id },
        data: {
          ...(dto.boe_number !== undefined ? { boe_number: dto.boe_number } : {}),
          ...(dto.boe_date !== undefined ? { boe_date: dto.boe_date ? new Date(dto.boe_date) : null } : {}),
          ...(dto.boe_type !== undefined ? { boe_type: dto.boe_type } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.job_id !== undefined ? { job_id: dto.job_id } : {}),
          ...(dto.branch_id !== undefined ? { branch_id: dto.branch_id } : {}),
          ...(dto.customs_office !== undefined ? { customs_office: dto.customs_office } : {}),
          ...(dto.port_id !== undefined ? { port_id: dto.port_id } : {}),
          ...(dto.party_id !== undefined ? { party_id: dto.party_id } : {}),
          updated_by: actorId,
        },
      });

      const jobId = dto.job_id ?? existing.job_id;
      const boeNumber = dto.boe_number ?? existing.boe_number;
      if (jobId) {
        await this.syncCustomsEntryNumber(tx, tenantId, jobId, boeNumber);
      }

      return updated;
    });
  }

  private async syncCustomsEntryNumber(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    boeNumber: string,
  ) {
    const job = await tx.job.findFirst({
      where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      select: { job_type: true },
    });
    if (!job) return;

    const airTypes: JobType[] = ['AIR_EXPORT', 'AIR_IMPORT'];
    const fclTypes: JobType[] = ['SEA_FCL_EXPORT', 'SEA_FCL_IMPORT'];
    const lclTypes: JobType[] = ['SEA_LCL_EXPORT', 'SEA_LCL_IMPORT'];

    if (airTypes.includes(job.job_type)) {
      await tx.airJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: { customs_entry_number: boeNumber },
      });
    } else if (fclTypes.includes(job.job_type)) {
      await tx.seaFclJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: { customs_entry_number: boeNumber },
      });
    } else if (lclTypes.includes(job.job_type)) {
      await tx.seaLclJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: { customs_entry_number: boeNumber },
      });
    }
  }

  private async buildSearchFilter(
    tx: Prisma.TransactionClient,
    tenantId: string,
    search: string,
  ): Promise<Prisma.DocumentationBoeRecordWhereInput> {
    const matchingJobs = await tx.job.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        job_number: { contains: search, mode: 'insensitive' },
      },
      select: { id: true },
      take: 50,
    });

    return {
      OR: [
        { boe_number: { contains: search, mode: 'insensitive' } },
        ...(matchingJobs.length ? [{ job_id: { in: matchingJobs.map((j) => j.id) } }] : []),
      ],
    };
  }
}
