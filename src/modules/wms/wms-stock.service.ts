import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentNumberType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { AdjustStockDto, CreateTransferDto, MovementQueryDto, StockQueryDto } from './dto/wms.dto';

type LotAllocation = {
  lot: {
    id: string;
    party_id: string | null;
    job_id: string | null;
    batch_code: string | null;
    unit_cost: Prisma.Decimal;
    cbm_per_unit: Prisma.Decimal | null;
    received_at: Date;
  };
  quantity: number;
};

@Injectable()
export class WmsStockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  async onHand(user: CurrentUser, query: StockQueryDto) {
    const lots = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsStockLot.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          qty_remaining: { gt: 0 },
          ...(query.warehouse_id ? { warehouse_id: query.warehouse_id } : {}),
          ...(query.item_id ? { item_id: query.item_id } : {}),
        },
        include: { item: true, warehouse: true },
        orderBy: [{ warehouse_id: 'asc' }, { item_id: 'asc' }, { received_at: 'asc' }],
      }),
    );
    const rows = new Map<string, { warehouse: unknown; item: unknown; quantity: number; value: number; cbm: number }>();
    for (const lot of lots) {
      const key = `${lot.warehouse_id}:${lot.item_id}`;
      const row = rows.get(key) ?? { warehouse: lot.warehouse, item: lot.item, quantity: 0, value: 0, cbm: 0 };
      const quantity = Number(lot.qty_remaining);
      row.quantity += quantity;
      row.value += quantity * Number(lot.unit_cost);
      row.cbm += quantity * Number(lot.cbm_per_unit ?? 0);
      rows.set(key, row);
    }
    return [...rows.values()];
  }

  movements(user: CurrentUser, query: MovementQueryDto) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsStockMovement.findMany({
        where: {
          tenant_id: user.tenantId,
          ...(query.warehouse_id ? { warehouse_id: query.warehouse_id } : {}),
          ...(query.item_id ? { item_id: query.item_id } : {}),
          ...(query.from || query.to
            ? { moved_at: { ...(query.from ? { gte: new Date(query.from) } : {}), ...(query.to ? { lte: new Date(query.to) } : {}) } }
            : {}),
        },
        include: { item: true, warehouse: true, lot: true },
        orderBy: { moved_at: 'desc' },
      }),
    );
  }

  lowStock(user: CurrentUser, query: StockQueryDto) {
    return this.lowStockForTenant(user.tenantId, query);
  }

  async lowStockForTenant(tenantId: string, query: StockQueryDto = {}) {
    const [items, lots] = await this.prisma.runWithTenant(tenantId, (tx) =>
      Promise.all([
        tx.wmsItem.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            is_active: true,
            low_stock_threshold: { not: null },
            ...(query.item_id ? { id: query.item_id } : {}),
          },
        }),
        tx.wmsStockLot.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            qty_remaining: { gt: 0 },
            ...(query.item_id ? { item_id: query.item_id } : {}),
            ...(query.warehouse_id ? { warehouse_id: query.warehouse_id } : {}),
          },
          select: { item_id: true, warehouse_id: true, qty_remaining: true },
        }),
      ]),
    );
    const totals = new Map<string, number>();
    for (const lot of lots) totals.set(lot.item_id, (totals.get(lot.item_id) ?? 0) + Number(lot.qty_remaining));
    return items
      .map((item) => ({ ...item, on_hand: totals.get(item.id) ?? 0 }))
      .filter((item) => item.on_hand <= Number(item.low_stock_threshold));
  }

  lotAging(user: CurrentUser, query: StockQueryDto) {
    const now = Date.now();
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const lots = await tx.wmsStockLot.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          qty_remaining: { gt: 0 },
          ...(query.warehouse_id ? { warehouse_id: query.warehouse_id } : {}),
          ...(query.item_id ? { item_id: query.item_id } : {}),
        },
        include: { item: true, warehouse: true },
        orderBy: { received_at: 'asc' },
      });
      return lots.map((lot) => ({ ...lot, age_days: Math.floor((now - lot.received_at.getTime()) / 86_400_000) }));
    });
  }

  async adjustStock(user: CurrentUser, dto: AdjustStockDto) {
    if (dto.quantity === 0) throw new BadRequestException('Adjustment quantity cannot be zero.');
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      if (dto.quantity > 0) {
        const lot = await tx.wmsStockLot.create({
          data: {
            tenant_id: user.tenantId,
            warehouse_id: dto.warehouse_id,
            item_id: dto.item_id,
            qty_received: dto.quantity,
            qty_remaining: dto.quantity,
            unit_cost: 0,
            received_at: new Date(),
          },
        });
        return tx.wmsStockMovement.create({
          data: {
            tenant_id: user.tenantId,
            warehouse_id: dto.warehouse_id,
            item_id: dto.item_id,
            lot_id: lot.id,
            movement_type: 'ADJUSTMENT',
            quantity: dto.quantity,
            reference_type: 'ADJUSTMENT',
            remarks: dto.remarks,
            created_by: user.id,
          },
        });
      }
      const settings = await tx.wmsSettings.findUnique({ where: { tenant_id: user.tenantId } });
      const allocations = await this.allocateLots(
        tx,
        user.tenantId,
        dto.warehouse_id,
        dto.item_id,
        Math.abs(dto.quantity),
        settings?.valuation_method === 'LIFO' ? 'desc' : 'asc',
      );
      for (const allocation of allocations) {
        await tx.wmsStockMovement.create({
          data: {
            tenant_id: user.tenantId,
            warehouse_id: dto.warehouse_id,
            item_id: dto.item_id,
            lot_id: allocation.lot.id,
            movement_type: 'ADJUSTMENT',
            quantity: -allocation.quantity,
            unit_cost: allocation.lot.unit_cost,
            reference_type: 'ADJUSTMENT',
            remarks: dto.remarks,
            created_by: user.id,
          },
        });
      }
      return { adjusted: dto.quantity };
    });
  }

  async createTransfer(user: CurrentUser, dto: CreateTransferDto) {
    if (dto.from_warehouse_id === dto.to_warehouse_id) throw new BadRequestException('Source and destination warehouses must differ.');
    const transferNumber = await this.numberGenerator.generate(user.tenantId, DocumentNumberType.BOOKING);
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsStockTransfer.create({
        data: {
          tenant_id: user.tenantId,
          transfer_number: transferNumber,
          from_warehouse_id: dto.from_warehouse_id,
          to_warehouse_id: dto.to_warehouse_id,
          remarks: dto.remarks,
          created_by: user.id,
          updated_by: user.id,
          lines: { create: dto.lines.map((line, index) => ({ tenant_id: user.tenantId, ...line, sort_order: index })) },
        },
        include: { from_warehouse: true, to_warehouse: true, lines: { include: { item: true } } },
      }),
    );
  }

  listTransfers(user: CurrentUser) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsStockTransfer.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        include: { from_warehouse: true, to_warehouse: true, lines: { include: { item: true } } },
        orderBy: { created_at: 'desc' },
      }),
    );
  }

  async getTransfer(user: CurrentUser, id: string) {
    const transfer = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsStockTransfer.findFirst({
        where: { id, tenant_id: user.tenantId, deleted_at: null },
        include: { from_warehouse: true, to_warehouse: true, lines: { include: { item: true } } },
      }),
    );
    if (!transfer) throw new NotFoundException('Stock transfer not found.');
    return transfer;
  }

  async cancelTransfer(user: CurrentUser, id: string) {
    await this.getTransfer(user, id);
    const result = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsStockTransfer.updateMany({
        where: { id, tenant_id: user.tenantId, status: 'DRAFT' },
        data: { status: 'CANCELLED', updated_by: user.id },
      }),
    );
    if (!result.count) throw new BadRequestException('Only a draft transfer can be cancelled.');
    return { id, status: 'CANCELLED' };
  }

  async postTransfer(user: CurrentUser, id: string) {
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const transfer = await tx.wmsStockTransfer.findFirst({
        where: { id, tenant_id: user.tenantId, deleted_at: null },
        include: { lines: true },
      });
      if (!transfer) throw new NotFoundException('Stock transfer not found.');
      const claimed = await tx.wmsStockTransfer.updateMany({
        where: { id, tenant_id: user.tenantId, status: 'DRAFT' },
        data: { status: 'POSTED', posted_at: new Date(), updated_by: user.id },
      });
      if (!claimed.count) throw new BadRequestException('Only a draft transfer can be posted.');
      const settings = await tx.wmsSettings.findUnique({ where: { tenant_id: user.tenantId } });
      const order = settings?.valuation_method === 'LIFO' ? 'desc' : 'asc';

      for (const line of transfer.lines) {
        const allocations = await this.allocateLots(
          tx,
          user.tenantId,
          transfer.from_warehouse_id,
          line.item_id,
          Number(line.quantity),
          order,
        );
        for (const allocation of allocations) {
          const destination = await tx.wmsStockLot.create({
            data: {
              tenant_id: user.tenantId,
              warehouse_id: transfer.to_warehouse_id,
              item_id: line.item_id,
              party_id: allocation.lot.party_id,
              job_id: allocation.lot.job_id,
              batch_code: allocation.lot.batch_code,
              qty_received: allocation.quantity,
              qty_remaining: allocation.quantity,
              unit_cost: allocation.lot.unit_cost,
              cbm_per_unit: allocation.lot.cbm_per_unit,
              received_at: allocation.lot.received_at,
            },
          });
          await tx.wmsStockMovement.createMany({
            data: [
              {
                tenant_id: user.tenantId,
                warehouse_id: transfer.from_warehouse_id,
                item_id: line.item_id,
                lot_id: allocation.lot.id,
                movement_type: 'TRANSFER_OUT',
                quantity: -allocation.quantity,
                unit_cost: allocation.lot.unit_cost,
                reference_type: 'TRANSFER',
                reference_id: transfer.id,
                remarks: transfer.remarks,
                created_by: user.id,
              },
              {
                tenant_id: user.tenantId,
                warehouse_id: transfer.to_warehouse_id,
                item_id: line.item_id,
                lot_id: destination.id,
                movement_type: 'TRANSFER_IN',
                quantity: allocation.quantity,
                unit_cost: allocation.lot.unit_cost,
                reference_type: 'TRANSFER',
                reference_id: transfer.id,
                remarks: transfer.remarks,
                created_by: user.id,
              },
            ],
          });
        }
      }
      return tx.wmsStockTransfer.findUniqueOrThrow({ where: { id }, include: { lines: true } });
    });
  }

  private async allocateLots(
    tx: Prisma.TransactionClient,
    tenantId: string,
    warehouseId: string,
    itemId: string,
    requested: number,
    order: Prisma.SortOrder,
  ): Promise<LotAllocation[]> {
    const lots = await tx.wmsStockLot.findMany({
      where: { tenant_id: tenantId, warehouse_id: warehouseId, item_id: itemId, deleted_at: null, qty_remaining: { gt: 0 } },
      orderBy: [{ received_at: order }, { created_at: order }],
    });
    if (lots.reduce((sum, lot) => sum + Number(lot.qty_remaining), 0) < requested) {
      throw new BadRequestException(`Insufficient stock for item ${itemId}.`);
    }
    let remaining = requested;
    const allocations: LotAllocation[] = [];
    for (const lot of lots) {
      if (remaining <= 0) break;
      const quantity = Math.min(remaining, Number(lot.qty_remaining));
      await tx.wmsStockLot.update({ where: { id: lot.id }, data: { qty_remaining: { decrement: quantity } } });
      allocations.push({ lot, quantity });
      remaining -= quantity;
    }
    return allocations;
  }
}
