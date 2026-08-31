import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentationMpciStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentationEdiService } from './documentation-edi.service';
import { DocumentationPaginationDto, paginated } from './dto/documentation-pagination.dto';

export class CreateMpciFilingDto {
  job_id?: string;
  filing_type?: string;
  filing_number?: string;
}

export class MpciQueryDto extends DocumentationPaginationDto {
  status?: DocumentationMpciStatus;
  job_id?: string;
}

@Injectable()
export class DocumentationMpciService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ediService: DocumentationEdiService,
  ) {}

  async findAll(tenantId: string, query: MpciQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.DocumentationMpciFilingWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(query.status ? { status: query.status } : {}),
        ...(query.job_id ? { job_id: query.job_id } : {}),
      };

      const [items, total] = await Promise.all([
        tx.documentationMpciFiling.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        tx.documentationMpciFiling.count({ where }),
      ]);

      return paginated(items, page, limit, total);
    });
  }

  async create(tenantId: string, dto: CreateMpciFilingDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationMpciFiling.create({
        data: {
          tenant_id: tenantId,
          job_id: dto.job_id,
          filing_type: dto.filing_type,
          filing_number: dto.filing_number,
          status: 'PREPARED',
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async prepare(tenantId: string, id: string, actorId?: string) {
    const filing = await this.findOne(tenantId, id);
    if (!filing.job_id) throw new BadRequestException('MPCI filing requires a linked job.');

    const submission = await this.ediService.generate(tenantId, 'MPCI', filing.job_id, actorId);

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationMpciFiling.update({
        where: { id },
        data: {
          status: 'PREPARED',
          filing_number: filing.filing_number ?? `MPCI-${id.slice(0, 8).toUpperCase()}`,
          updated_by: actorId,
          response_payload: { submission_id: submission.id },
        },
      }),
    );
  }

  async submit(tenantId: string, id: string, actorId?: string) {
    const filing = await this.findOne(tenantId, id);
    const submissionId = (filing.response_payload as { submission_id?: string } | null)?.submission_id;
    if (!submissionId) throw new BadRequestException('Prepare the filing before submit.');

    await this.ediService.submit(tenantId, submissionId, actorId);

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationMpciFiling.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submitted_at: new Date(),
          uae_customs_ref: `UAE-MPCI-${Date.now()}`,
          updated_by: actorId,
        },
      }),
    );
  }

  async getStatus(tenantId: string, id: string) {
    const filing = await this.findOne(tenantId, id);
    return {
      id: filing.id,
      status: filing.status,
      uae_customs_ref: filing.uae_customs_ref,
      submitted_at: filing.submitted_at,
    };
  }

  private async findOne(tenantId: string, id: string) {
    const filing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationMpciFiling.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!filing) throw new NotFoundException('MPCI filing not found.');
    return filing;
  }
}
