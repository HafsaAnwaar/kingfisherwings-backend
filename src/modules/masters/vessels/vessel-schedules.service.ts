import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVesselScheduleDto, UpdateVesselScheduleDto, VesselScheduleQueryDto } from '../dto/vessel-schedule.dto';

@Injectable()
export class VesselSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, vesselId: string, query: VesselScheduleQueryDto) {
    await this.assertVesselExists(tenantId, vesselId);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.VesselScheduleWhereInput = {
        tenant_id: tenantId,
        vessel_id: vesselId,
        deleted_at: null,
      };

      if (query.voyage_number) {
        where.voyage_number = { contains: query.voyage_number, mode: 'insensitive' };
      }

      if (query.etd_from || query.etd_to) {
        where.etd = {
          ...(query.etd_from ? { gte: new Date(query.etd_from) } : {}),
          ...(query.etd_to ? { lte: new Date(query.etd_to) } : {}),
        };
      }

      if (query.eta_from || query.eta_to) {
        where.eta = {
          ...(query.eta_from ? { gte: new Date(query.eta_from) } : {}),
          ...(query.eta_to ? { lte: new Date(query.eta_to) } : {}),
        };
      }

      return tx.vesselSchedule.findMany({
        where,
        orderBy: [{ etd: 'asc' }, { created_at: 'desc' }],
      });
    });
  }

  async create(tenantId: string, vesselId: string, dto: CreateVesselScheduleDto, actorId?: string) {
    await this.assertVesselExists(tenantId, vesselId);
    if (dto.shipping_line_id) {
      await this.assertShippingLineExists(tenantId, dto.shipping_line_id);
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vesselSchedule.create({
        data: {
          tenant_id: tenantId,
          vessel_id: vesselId,
          voyage_number: dto.voyage_number,
          shipping_line_id: dto.shipping_line_id,
          pol_id: dto.pol_id,
          pod_id: dto.pod_id,
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          is_active: dto.is_active ?? true,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async update(
    tenantId: string,
    vesselId: string,
    scheduleId: string,
    dto: UpdateVesselScheduleDto,
    actorId?: string,
  ) {
    await this.assertVesselExists(tenantId, vesselId);
    if (dto.shipping_line_id) {
      await this.assertShippingLineExists(tenantId, dto.shipping_line_id);
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.vesselSchedule.findFirst({
        where: { id: scheduleId, vessel_id: vesselId, tenant_id: tenantId, deleted_at: null },
      });

      if (!existing) {
        throw new NotFoundException('Vessel schedule not found.');
      }

      const { etd, eta, ...rest } = dto;

      return tx.vesselSchedule.update({
        where: { id: scheduleId },
        data: {
          ...rest,
          ...(etd ? { etd: new Date(etd) } : {}),
          ...(eta ? { eta: new Date(eta) } : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async remove(tenantId: string, vesselId: string, scheduleId: string, actorId?: string): Promise<void> {
    await this.assertVesselExists(tenantId, vesselId);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.vesselSchedule.findFirst({
        where: { id: scheduleId, vessel_id: vesselId, tenant_id: tenantId, deleted_at: null },
      });

      if (!existing) {
        throw new NotFoundException('Vessel schedule not found.');
      }

      await tx.vesselSchedule.update({
        where: { id: scheduleId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  private async assertVesselExists(tenantId: string, vesselId: string) {
    const vessel = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vessel.findFirst({ where: { id: vesselId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!vessel) {
      throw new NotFoundException('Vessel not found.');
    }
  }

  private async assertShippingLineExists(tenantId: string, shippingLineId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shippingLine.findFirst({ where: { id: shippingLineId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Shipping line not found.');
    }
  }
}
