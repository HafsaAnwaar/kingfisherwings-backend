import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NvoccLoadListCargoStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentGenerationService } from '../../shared/queue/document-generation.service';
import { markJobMilestoneIfPresent } from '../jobs/utils/mark-milestone.util';
import { assertCargoStatusTransition } from './constants/nvocc-cargo-status-transitions';
import {
  AssignLoadListContainerDto,
  UpdateNvoccLoadListItemDto,
} from './dto/nvocc-load-list.dto';
import { NvoccVoyagesService } from './nvocc-voyages.service';

@Injectable()
export class NvoccLoadListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voyagesService: NvoccVoyagesService,
    private readonly documentGeneration: DocumentGenerationService,
  ) {}

  async listForVoyage(tenantId: string, voyageId: string) {
    await this.voyagesService.findOne(tenantId, voyageId);

    const items = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccLoadListItem.findMany({
        where: { tenant_id: tenantId, voyage_id: voyageId, deleted_at: null },
        include: {
          booking: {
            select: {
              booking_number: true,
              shipper_id: true,
              cargo_type: true,
              booking_status: true,
            },
          },
        },
        orderBy: [{ container_number: 'asc' }, { created_at: 'asc' }],
      }),
    );

    const totals = items.reduce(
      (acc, row) => ({
        pieces: acc.pieces + (row.pieces ?? 0),
        gross_weight_kg: acc.gross_weight_kg + Number(row.gross_weight_kg ?? 0),
        cbm: acc.cbm + Number(row.cbm ?? 0),
      }),
      { pieces: 0, gross_weight_kg: 0, cbm: 0 },
    );

    return { items, totals };
  }

  async updateItem(
    tenantId: string,
    voyageId: string,
    itemId: string,
    dto: UpdateNvoccLoadListItemDto,
    actorId?: string,
  ) {
    const item = await this.getItemOrThrow(tenantId, voyageId, itemId);

    if (dto.cargo_status && dto.cargo_status !== item.cargo_status) {
      assertCargoStatusTransition(item.cargo_status, dto.cargo_status);
    }

    if (dto.gross_weight_kg != null && dto.container_type_id) {
      await this.validateContainerPayload(tenantId, dto.container_type_id, dto.gross_weight_kg);
    }

    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.nvoccLoadListItem.update({
        where: { id: itemId },
        data: {
          container_number: dto.container_number,
          seal_number: dto.seal_number,
          container_type_id: dto.container_type_id,
          pieces: dto.pieces,
          gross_weight_kg: dto.gross_weight_kg,
          cbm: dto.cbm,
          commodity: dto.commodity,
          marks_numbers: dto.marks_numbers,
          cargo_status: dto.cargo_status,
          cargo_received_date: dto.cargo_received_date
            ? new Date(dto.cargo_received_date)
            : dto.cargo_status === 'RECEIVED_AT_CFS'
              ? new Date()
              : undefined,
          stuffing_date: dto.stuffing_date
            ? new Date(dto.stuffing_date)
            : dto.cargo_status === 'STUFFED'
              ? new Date()
              : undefined,
          vessel_loaded_date: dto.vessel_loaded_date
            ? new Date(dto.vessel_loaded_date)
            : dto.cargo_status === 'LOADED_ON_VESSEL'
              ? new Date()
              : undefined,
          updated_by: actorId,
        },
        include: { booking: { select: { converted_job_id: true } } },
      });

      if (dto.cargo_status && dto.cargo_status !== item.cargo_status && row.booking?.converted_job_id) {
        const milestone = cargoStatusToMilestone(dto.cargo_status);
        if (milestone) {
          await markJobMilestoneIfPresent(
            tx,
            tenantId,
            row.booking.converted_job_id,
            milestone,
            new Date(),
            actorId,
          );
        }
      }

      return row;
    });

    return updated;
  }

  async assignContainer(
    tenantId: string,
    voyageId: string,
    itemId: string,
    dto: AssignLoadListContainerDto,
    actorId?: string,
  ) {
    await this.getItemOrThrow(tenantId, voyageId, itemId);

    if (dto.container_type_id) {
      const item = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.nvoccLoadListItem.findFirst({ where: { id: itemId } }),
      );
      if (item?.gross_weight_kg) {
        await this.validateContainerPayload(tenantId, dto.container_type_id, Number(item.gross_weight_kg));
      }
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccLoadListItem.update({
        where: { id: itemId },
        data: {
          container_number: dto.container_number,
          seal_number: dto.seal_number,
          container_type_id: dto.container_type_id,
          updated_by: actorId,
        },
      }),
    );
  }

  async containerWeightCheck(tenantId: string, voyageId: string) {
    const { items } = await this.listForVoyage(tenantId, voyageId);
    const byContainer = new Map<string, { weight: number; maxPayload: number | null }>();

    for (const item of items) {
      if (!item.container_number) continue;
      const key = item.container_number;
      const existing = byContainer.get(key) ?? { weight: 0, maxPayload: null };
      existing.weight += Number(item.gross_weight_kg ?? 0);

      if (item.container_type_id) {
        const ct = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.containerType.findFirst({ where: { id: item.container_type_id!, tenant_id: tenantId } }),
        );
        if (ct?.max_payload) existing.maxPayload = Number(ct.max_payload);
      }
      byContainer.set(key, existing);
    }

    return Array.from(byContainer.entries()).map(([container_number, data]) => ({
      container_number,
      total_weight_kg: data.weight,
      max_payload_kg: data.maxPayload,
      utilization_percent:
        data.maxPayload && data.maxPayload > 0
          ? Number(((data.weight / data.maxPayload) * 100).toFixed(1))
          : null,
      over_weight: data.maxPayload != null && data.weight > data.maxPayload,
    }));
  }

  async generateLoadListPdf(tenantId: string, voyageId: string, actorId?: string) {
    const voyage = await this.voyagesService.findOne(tenantId, voyageId);
    const confirmedBooking = voyage.bookings.find((b) => b.booking_status === 'CONFIRMED' || b.booking_status === 'CONVERTED');
    const jobId = confirmedBooking?.converted_job_id;

    if (!jobId) {
      throw new BadRequestException(
        'At least one confirmed booking must be converted to a job before generating load list PDF.',
      );
    }

    return this.documentGeneration.enqueueJobDocument(tenantId, jobId, 'NVOCC_LOAD_LIST', actorId);
  }

  private async getItemOrThrow(tenantId: string, voyageId: string, itemId: string) {
    const item = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccLoadListItem.findFirst({
        where: { id: itemId, tenant_id: tenantId, voyage_id: voyageId, deleted_at: null },
      }),
    );
    if (!item) throw new NotFoundException('Load list item not found.');
    return item;
  }

  private async validateContainerPayload(tenantId: string, containerTypeId: string, weightKg: number) {
    const ct = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.containerType.findFirst({
        where: { id: containerTypeId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (ct?.max_payload && weightKg > Number(ct.max_payload)) {
      throw new BadRequestException(
        `Gross weight ${weightKg} kg exceeds container max payload ${ct.max_payload} kg.`,
      );
    }
  }
}

function cargoStatusToMilestone(status: NvoccLoadListCargoStatus): string | null {
  switch (status) {
    case 'RECEIVED_AT_CFS':
      return 'CARGO_RECEIVED_AT_CFS';
    case 'STUFFED':
      return 'CARGO_STUFFED';
    case 'LOADED_ON_VESSEL':
      return 'VESSEL_LOADED';
    default:
      return null;
  }
}
