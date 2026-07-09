import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Department } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class DepartmentsService extends BaseMasterService<Department> {
  protected readonly modelName = 'department';
  protected readonly searchFields = ['name', 'code'];
  protected readonly uniqueKeyLabel = 'department code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<Department> {
    await this.assertParentValid(tenantId, data.parent_id as string | undefined);
    await this.assertCompanyExists(tenantId, data.company_id as string | undefined);
    return super.create(tenantId, data, actorId);
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Department> {
    if (data.parent_id === id) {
      throw new BadRequestException('A department cannot be its own parent.');
    }
    await this.assertParentValid(tenantId, data.parent_id as string | undefined);
    if (data.company_id !== undefined) {
      await this.assertCompanyExists(tenantId, data.company_id as string | undefined);
    }
    return super.update(tenantId, id, data, actorId);
  }

  private async assertParentValid(tenantId: string, parentId?: string): Promise<void> {
    if (!parentId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.department.findFirst({ where: { id: parentId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Parent department not found.');
    }
  }

  private async assertCompanyExists(tenantId: string, companyId?: string): Promise<void> {
    if (!companyId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.company.findFirst({ where: { id: companyId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Company not found.');
    }
  }
}
