import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { DocumentationEdiService } from "./documentation-edi.service";
import { paginated } from "./dto/documentation-pagination.dto";
import {
  CreateMpciFilingDto,
  MpciQueryDto,
} from "./dto/documentation-mpci.dto";

export { CreateMpciFilingDto, MpciQueryDto };

@Injectable()
export class DocumentationMpciService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ediService: DocumentationEdiService,
  ) {}

  async findAll(tenantId: string, query: MpciQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const status = query.filing_status ?? query.status;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      let departmentJobIds: string[] | undefined;
      if (query.department_id) {
        const deptJobs = await tx.job.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            department_id: query.department_id,
          },
          select: { id: true },
        });
        departmentJobIds = deptJobs.map((j) => j.id);
        if (departmentJobIds.length === 0) {
          return paginated([], page, limit, 0);
        }
      }

      let jobIdFilter: string | { in: string[] } | undefined;
      if (query.job_id && departmentJobIds) {
        if (!departmentJobIds.includes(query.job_id)) {
          return paginated([], page, limit, 0);
        }
        jobIdFilter = query.job_id;
      } else if (query.job_id) {
        jobIdFilter = query.job_id;
      } else if (departmentJobIds) {
        jobIdFilter = { in: departmentJobIds };
      }

      const where: Prisma.DocumentationMpciFilingWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(status ? { status } : {}),
        ...(jobIdFilter !== undefined ? { job_id: jobIdFilter } : {}),
        ...(query.search
          ? {
              OR: [
                {
                  filing_number: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
                {
                  filing_type: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        ...(query.from_date || query.to_date
          ? {
              created_at: {
                ...(query.from_date
                  ? { gte: new Date(query.from_date) }
                  : {}),
                ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
              },
            }
          : {}),
      };

      const [items, total] = await Promise.all([
        tx.documentationMpciFiling.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: "desc" },
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
          status: "PREPARED",
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async prepare(tenantId: string, id: string, actorId?: string) {
    const filing = await this.findOne(tenantId, id);
    if (!filing.job_id)
      throw new BadRequestException("MPCI filing requires a linked job.");

    const submission = await this.ediService.generate(
      tenantId,
      "MPCI",
      filing.job_id,
      actorId,
    );

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationMpciFiling.update({
        where: { id },
        data: {
          status: "PREPARED",
          filing_number:
            filing.filing_number ?? `MPCI-${id.slice(0, 8).toUpperCase()}`,
          updated_by: actorId,
          response_payload: { submission_id: submission.id },
        },
      }),
    );
  }

  async submit(tenantId: string, id: string, actorId?: string) {
    const filing = await this.findOne(tenantId, id);
    const submissionId = (
      filing.response_payload as { submission_id?: string } | null
    )?.submission_id;
    if (!submissionId)
      throw new BadRequestException("Prepare the filing before submit.");

    await this.ediService.submit(tenantId, submissionId, actorId);

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationMpciFiling.update({
        where: { id },
        data: {
          status: "SUBMITTED",
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
    if (!filing) throw new NotFoundException("MPCI filing not found.");
    return filing;
  }
}
