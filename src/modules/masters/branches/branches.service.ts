import { Injectable, NotFoundException } from "@nestjs/common";
import { Branch } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class BranchesService extends BaseMasterService<Branch> {
  protected readonly modelName = "branch";
  protected readonly searchFields = ["name", "code", "city"];
  protected readonly uniqueKeyLabel = "branch code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(
    tenantId: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Branch> {
    await this.assertCompanyExists(
      tenantId,
      data.company_id as string | undefined,
    );
    return super.create(tenantId, data, actorId);
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Branch> {
    if (data.company_id !== undefined) {
      await this.assertCompanyExists(
        tenantId,
        data.company_id as string | undefined,
      );
    }
    return super.update(tenantId, id, data, actorId);
  }

  private async assertCompanyExists(
    tenantId: string,
    companyId?: string,
  ): Promise<void> {
    if (!companyId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.company.findFirst({
        where: { id: companyId, tenant_id: tenantId, deleted_at: null },
      }),
    );

    if (!exists) {
      throw new NotFoundException("Company not found.");
    }
  }
}
