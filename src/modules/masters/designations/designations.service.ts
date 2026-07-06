import { Injectable, NotFoundException } from '@nestjs/common';
import { Designation } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class DesignationsService extends BaseMasterService<Designation> {
  protected readonly modelName = 'designation';
  protected readonly searchFields = ['name'];
  protected readonly uniqueKeyLabel = 'designation';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<Designation> {
    await this.assertDepartmentExists(tenantId, data.department_id as string | undefined);
    return super.create(tenantId, data, actorId);
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Designation> {
    await this.assertDepartmentExists(tenantId, data.department_id as string | undefined);
    return super.update(tenantId, id, data, actorId);
  }

  private async assertDepartmentExists(tenantId: string, departmentId?: string): Promise<void> {
    if (!departmentId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.department.findFirst({ where: { id: departmentId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Department not found.');
    }
  }
}
