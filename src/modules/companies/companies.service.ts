import { BadRequestException, Injectable } from '@nestjs/common';
import { Company } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseMasterService } from '../masters/base-master.service';

@Injectable()
export class CompaniesService extends BaseMasterService<Company> {
  protected readonly modelName = 'company';
  protected readonly searchFields = ['name', 'code', 'legal_name'];
  protected readonly uniqueKeyLabel = 'company code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<Company> {
    if (data.is_default) {
      await this.clearExistingDefault(tenantId);
    }
    return super.create(tenantId, data, actorId);
  }

  async update(tenantId: string, id: string, data: Record<string, unknown>, actorId?: string): Promise<Company> {
    if (data.is_default) {
      await this.clearExistingDefault(tenantId, id);
    }
    return super.update(tenantId, id, data, actorId);
  }

  async softDelete(tenantId: string, id: string, actorId?: string): Promise<void> {
    const company = await this.findOne(tenantId, id);

    if (company.is_default) {
      const otherCount = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.company.count({ where: { tenant_id: tenantId, deleted_at: null, id: { not: id } } }),
      );

      if (otherCount === 0) {
        throw new BadRequestException(
          'This is the only company on this tenant and cannot be deleted. Create another company first, or deactivate the tenant instead.',
        );
      }

      throw new BadRequestException('Cannot delete the default company — mark another company as default first.');
    }

    await super.softDelete(tenantId, id, actorId);
  }

  private async clearExistingDefault(tenantId: string, excludeId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.company.updateMany({
        where: { tenant_id: tenantId, is_default: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
        data: { is_default: false },
      }),
    );
  }
}
