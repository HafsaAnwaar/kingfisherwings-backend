import { Injectable, NotFoundException } from '@nestjs/common';
import { Vessel } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';

@Injectable()
export class VesselsService extends BaseMasterService<Vessel> {
  protected readonly modelName = 'vessel';
  protected readonly searchFields = ['name', 'imo_number'];
  protected readonly uniqueKeyLabel = 'vessel';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<Vessel> {
    await this.assertShippingLineExists(tenantId, data.shipping_line_id as string | undefined);
    return super.create(tenantId, data, actorId);
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<Vessel> {
    await this.assertShippingLineExists(tenantId, data.shipping_line_id as string | undefined);
    return super.update(tenantId, id, data, actorId);
  }

  private async assertShippingLineExists(tenantId: string, shippingLineId?: string): Promise<void> {
    if (!shippingLineId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shippingLine.findFirst({
        where: { id: shippingLineId, tenant_id: tenantId, deleted_at: null },
      }),
    );

    if (!exists) {
      throw new NotFoundException('Shipping line not found.');
    }
  }
}
