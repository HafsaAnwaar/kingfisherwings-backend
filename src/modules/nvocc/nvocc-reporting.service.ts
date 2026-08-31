import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NvoccTradeLaneProfitabilityQueryDto, NvoccUtilizationQueryDto } from './dto/nvocc-report.dto';
import { NvoccVoyagesService } from './nvocc-voyages.service';

@Injectable()
export class NvoccReportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voyagesService: NvoccVoyagesService,
  ) {}

  async getUtilization(tenantId: string, query: NvoccUtilizationQueryDto) {
    const where: Prisma.NvoccVoyageWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(query.voyage_status ? { voyage_status: query.voyage_status } : {}),
      ...(query.from || query.to
        ? {
            etd: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const voyages = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.findMany({
        where,
        include: {
          _count: { select: { bookings: { where: { deleted_at: null } } } },
        },
        orderBy: { etd: 'asc' },
      }),
    );

    const rows = voyages.map((v) => {
      const lclCapacity = v.lcl_capacity_cbm ? Number(v.lcl_capacity_cbm) : null;
      const lclBooked = Number(v.lcl_booked_cbm);
      const fclSlots = v.slot_allocation_containers;
      const fclBooked = v.fcl_booked_containers;

      return {
        voyage_id: v.id,
        voyage_number: v.voyage_number,
        voyage_status: v.voyage_status,
        etd: v.etd,
        fcl_slots_allocated: fclSlots,
        fcl_slots_booked: fclBooked,
        fcl_utilization_percent: fclSlots > 0 ? Number(((fclBooked / fclSlots) * 100).toFixed(1)) : null,
        lcl_capacity_cbm: lclCapacity,
        lcl_booked_cbm: lclBooked,
        lcl_utilization_percent:
          lclCapacity && lclCapacity > 0 ? Number(((lclBooked / lclCapacity) * 100).toFixed(1)) : null,
        booking_count: v._count.bookings,
      };
    });

    const fclPercents = rows.map((r) => r.fcl_utilization_percent).filter((p): p is number => p != null);
    const lclPercents = rows.map((r) => r.lcl_utilization_percent).filter((p): p is number => p != null);

    return {
      summary: {
        voyage_count: rows.length,
        avg_fcl_utilization_percent:
          fclPercents.length > 0
            ? Number((fclPercents.reduce((a, b) => a + b, 0) / fclPercents.length).toFixed(1))
            : null,
        avg_lcl_utilization_percent:
          lclPercents.length > 0
            ? Number((lclPercents.reduce((a, b) => a + b, 0) / lclPercents.length).toFixed(1))
            : null,
      },
      voyages: rows,
    };
  }

  async getTradeLaneProfitability(tenantId: string, query: NvoccTradeLaneProfitabilityQueryDto) {
    const groupBy = query.group_by ?? 'pol_pod';

    const where: Prisma.NvoccVoyageWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(query.from || query.to
        ? {
            etd: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const voyages = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.findMany({
        where,
        include: {
          bookings: {
            where: { deleted_at: null },
            include: { charges: { where: { deleted_at: null } } },
          },
        },
        orderBy: { etd: 'asc' },
      }),
    );

    const portIds = [
      ...new Set(
        voyages.flatMap((v) => [v.pol_id, v.pod_id].filter((id): id is string => !!id)),
      ),
    ];
    const ports = portIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.port.findMany({
            where: { tenant_id: tenantId, id: { in: portIds }, deleted_at: null },
            select: { id: true, un_locode: true, name: true },
          }),
        )
      : [];
    const portMap = new Map(ports.map((p) => [p.id, p]));

    type LaneBucket = {
      key: string;
      label: string;
      revenue: number;
      cost: number;
      gp: number;
      voyage_count: number;
      fcl_containers: number;
      lcl_cbm: number;
    };
    const buckets = new Map<string, LaneBucket>();

    for (const voyage of voyages) {
      const pol = voyage.pol_id ? portMap.get(voyage.pol_id) : undefined;
      const pod = voyage.pod_id ? portMap.get(voyage.pod_id) : undefined;
      const key =
        groupBy === 'tariff_lane'
          ? `${pol?.name ?? 'Unknown'}→${pod?.name ?? 'Unknown'}`
          : `${pol?.un_locode ?? 'UNK'}→${pod?.un_locode ?? 'UNK'}`;
      const label =
        groupBy === 'tariff_lane'
          ? key
          : `${pol?.un_locode ?? 'UNK'} — ${pol?.name ?? 'Unknown'} → ${pod?.un_locode ?? 'UNK'} — ${pod?.name ?? 'Unknown'}`;

      const pnl = await this.voyagesService.getVoyagePnl(tenantId, voyage.id);
      const existing = buckets.get(key) ?? {
        key,
        label,
        revenue: 0,
        cost: 0,
        gp: 0,
        voyage_count: 0,
        fcl_containers: 0,
        lcl_cbm: 0,
      };

      existing.revenue += pnl.totals.revenue;
      existing.cost += pnl.totals.cost;
      existing.gp += pnl.totals.gp;
      existing.voyage_count += 1;
      existing.fcl_containers += voyage.fcl_booked_containers;
      existing.lcl_cbm += Number(voyage.lcl_booked_cbm);
      buckets.set(key, existing);
    }

    const lanes = [...buckets.values()]
      .map((b) => ({
        ...b,
        revenue: Number(b.revenue.toFixed(4)),
        cost: Number(b.cost.toFixed(4)),
        gp: Number(b.gp.toFixed(4)),
        gp_percent: b.revenue > 0 ? Number(((b.gp / b.revenue) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.gp - a.gp);

    return {
      group_by: groupBy,
      from: query.from,
      to: query.to,
      lanes,
    };
  }
}
