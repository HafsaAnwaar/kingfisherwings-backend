import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Company, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { BaseMasterService } from "../masters/base-master.service";
import { MasterQueryDto } from "../masters/dto/master-query.dto";

@Injectable()
export class CompaniesService extends BaseMasterService<Company> {
  protected readonly modelName = "company";
  protected readonly searchFields = ["name", "code", "legal_name"];
  protected readonly uniqueKeyLabel = "company code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /** Soft-deleted companies still in trash (until permanent delete). */
  async findDeleted(tenantId: string, query: MasterQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 20;
      const where: Prisma.CompanyWhereInput = {
        tenant_id: tenantId,
        deleted_at: { not: null },
      };
      if (query.search) {
        where.OR = this.searchFields.map((field) => ({
          [field]: { contains: query.search, mode: "insensitive" as const },
        }));
      }
      const [data, total] = await Promise.all([
        tx.company.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { deleted_at: "desc" },
        }),
        tx.company.count({ where }),
      ]);
      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    });
  }

  async restore(tenantId: string, id: string, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.company.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: { not: null } },
      });
      if (!existing) {
        throw new NotFoundException("Deleted company not found.");
      }
      return tx.company.update({
        where: { id },
        data: { deleted_at: null, updated_by: actorId },
      });
    });
  }

  /**
   * Hard-delete a soft-deleted company. Returns 409 when still referenced.
   */
  async permanentDelete(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.company.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: { not: null } },
      });
      if (!existing) {
        throw new NotFoundException("Deleted company not found.");
      }
      try {
        await tx.company.delete({ where: { id } });
      } catch (err: unknown) {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: unknown }).code)
            : "";
        if (code === "P2003" || code === "P2014") {
          throw new ConflictException(
            "Cannot permanently delete this company while related records still exist (jobs, invoices, branches, etc.).",
          );
        }
        throw err;
      }
      return { success: true, message: "Company permanently deleted." };
    });
  }

  async create(
    tenantId: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Company> {
    if (data.is_default) {
      await this.clearExistingDefault(tenantId);
    }
    return super.create(tenantId, data, actorId);
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Company> {
    if (data.is_default) {
      await this.clearExistingDefault(tenantId, id);
    }
    return super.update(tenantId, id, data, actorId);
  }

  async softDelete(
    tenantId: string,
    id: string,
    actorId?: string,
  ): Promise<void> {
    const company = await this.findOne(tenantId, id);

    if (company.is_default) {
      const otherCount = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.company.count({
          where: { tenant_id: tenantId, deleted_at: null, id: { not: id } },
        }),
      );

      if (otherCount === 0) {
        throw new BadRequestException(
          "This is the only company on this tenant and cannot be deleted. Create another company first, or deactivate the tenant instead.",
        );
      }

      throw new BadRequestException(
        "Cannot delete the default company — mark another company as default first.",
      );
    }

    await super.softDelete(tenantId, id, actorId);
  }

  private async clearExistingDefault(
    tenantId: string,
    excludeId?: string,
  ): Promise<void> {
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.company.updateMany({
        where: {
          tenant_id: tenantId,
          is_default: true,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        data: { is_default: false },
      }),
    );
  }
}
