import { Injectable } from '@nestjs/common';
import { TaxRate } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class TaxRatesService extends BaseMasterService<TaxRate> {
  protected readonly modelName = 'taxRate';
  protected readonly searchFields = ['name', 'code'];
  protected readonly uniqueKeyLabel = 'tax rate code';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<TaxRate> {
    if (data.is_default) {
      await this.clearExistingDefault(tenantId, data.country_code as string);
    }
    return super.create(tenantId, this.coerceDates(data), actorId);
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<TaxRate> {
    if (data.is_default && data.country_code) {
      await this.clearExistingDefault(tenantId, data.country_code as string, id);
    }
    return super.update(tenantId, id, this.coerceDates(data), actorId);
  }

  private coerceDates(data: Record<string, unknown>): Record<string, unknown> {
    const next = { ...data };
    if (typeof next.effective_from === 'string') {
      next.effective_from = new Date(next.effective_from);
    }
    if (typeof next.effective_to === 'string') {
      next.effective_to = new Date(next.effective_to);
    }
    return next;
  }

  private async clearExistingDefault(tenantId: string, countryCode: string, excludeId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.taxRate.updateMany({
        where: {
          tenant_id: tenantId,
          country_code: countryCode,
          is_default: true,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        data: { is_default: false },
      }),
    );
  }
}
