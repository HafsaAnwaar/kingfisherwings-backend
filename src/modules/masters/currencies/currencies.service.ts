import { Injectable } from "@nestjs/common";
import { Currency } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class CurrenciesService extends BaseMasterService<Currency> {
  protected readonly modelName = "currency";
  protected readonly searchFields = ["name", "code"];
  protected readonly uniqueKeyLabel = "currency code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(
    tenantId: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Currency> {
    if (data.is_base) {
      await this.clearExistingBaseCurrency(tenantId);
    }
    return super.create(tenantId, data, actorId);
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Currency> {
    if (data.is_base) {
      await this.clearExistingBaseCurrency(tenantId, id);
    }
    return super.update(tenantId, id, data, actorId);
  }

  private async clearExistingBaseCurrency(
    tenantId: string,
    excludeId?: string,
  ): Promise<void> {
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.currency.updateMany({
        where: {
          tenant_id: tenantId,
          is_base: true,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        data: { is_base: false },
      }),
    );
  }
}
