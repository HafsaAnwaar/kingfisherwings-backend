import { Injectable, NotFoundException } from '@nestjs/common';
import { Tariff } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../../masters/base-master.service';

@Injectable()
export class TariffsService extends BaseMasterService<Tariff> {
  protected readonly modelName = 'tariff';
  protected readonly searchFields: string[] = [];
  protected readonly uniqueKeyLabel = 'tariff';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<Tariff> {
    await this.assertChargeCodeExists(tenantId, data.charge_code_id as string);
    return super.create(tenantId, data, actorId);
  }

  async update(tenantId: string, id: string, data: Record<string, unknown>, actorId?: string): Promise<Tariff> {
    if (data.charge_code_id) {
      await this.assertChargeCodeExists(tenantId, data.charge_code_id as string);
    }
    return super.update(tenantId, id, data, actorId);
  }

  /**
   * Best-matching active tariff for a quote: prefers a customer-specific
   * rate over the general one when both exist for the same lane.
   */
  async findMatch(
    tenantId: string,
    params: {
      serviceType: string;
      originPortId?: string;
      destPortId?: string;
      containerTypeId?: string;
      customerId?: string;
    },
  ): Promise<Tariff | null> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where = {
        tenant_id: tenantId,
        service_type: params.serviceType as any,
        is_active: true,
        deleted_at: null,
        valid_from: { lte: new Date() },
        OR: [{ valid_to: null }, { valid_to: { gte: new Date() } }],
        ...(params.originPortId ? { origin_port_id: params.originPortId } : {}),
        ...(params.destPortId ? { dest_port_id: params.destPortId } : {}),
        ...(params.containerTypeId ? { container_type_id: params.containerTypeId } : {}),
      };

      const customerSpecific = params.customerId
        ? await tx.tariff.findFirst({
            where: { ...where, customer_id: params.customerId },
            orderBy: { created_at: 'desc' },
          })
        : null;

      if (customerSpecific) {
        return customerSpecific;
      }

      return tx.tariff.findFirst({ where: { ...where, customer_id: null }, orderBy: { created_at: 'desc' } });
    });
  }

  private async assertChargeCodeExists(tenantId: string, chargeCodeId: string): Promise<void> {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chargeCode.findFirst({ where: { id: chargeCodeId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Charge code not found.');
    }
  }
}
