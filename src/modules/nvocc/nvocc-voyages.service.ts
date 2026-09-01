import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { NvoccVoyage, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { markJobMilestoneIfPresent } from "../jobs/utils/mark-milestone.util";
import { buildVoyagePnlResponse } from "./utils/nvocc-voyage-pnl.util";
import {
  CopyNvoccVoyageDto,
  CreateNvoccVoyageDto,
  NvoccVoyageQueryDto,
  UpdateNvoccVoyageDto,
} from "./dto/nvocc-voyage.dto";

@Injectable()
export class NvoccVoyagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateNvoccVoyageDto,
    actorId?: string,
  ): Promise<NvoccVoyage> {
    const voyageNumber = await this.numberGenerator.generate(
      tenantId,
      "NVOCC_VOYAGE",
    );

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.create({
        data: {
          tenant_id: tenantId,
          voyage_number: voyageNumber,
          vessel_id: dto.vessel_id,
          shipping_line_id: dto.shipping_line_id,
          pol_id: dto.pol_id,
          pod_id: dto.pod_id,
          transshipment_port_id: dto.transshipment_port_id,
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          si_cutoff: dto.si_cutoff ? new Date(dto.si_cutoff) : undefined,
          vgm_cutoff: dto.vgm_cutoff ? new Date(dto.vgm_cutoff) : undefined,
          cy_cutoff: dto.cy_cutoff ? new Date(dto.cy_cutoff) : undefined,
          cargo_cutoff: dto.cargo_cutoff
            ? new Date(dto.cargo_cutoff)
            : undefined,
          slot_allocation_containers: dto.slot_allocation_containers ?? 0,
          lcl_capacity_cbm: dto.lcl_capacity_cbm,
          mbl_number: dto.mbl_number,
          nvocc_freight_rate: dto.nvocc_freight_rate,
          carrier_cost: dto.carrier_cost,
          agent_pol_id: dto.agent_pol_id,
          agent_pod_id: dto.agent_pod_id,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async findAll(tenantId: string, query: NvoccVoyageQueryDto) {
    const where: Prisma.NvoccVoyageWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(query.voyage_status ? { voyage_status: query.voyage_status } : {}),
      ...(query.vessel_id ? { vessel_id: query.vessel_id } : {}),
      ...(query.pol_id ? { pol_id: query.pol_id } : {}),
      ...(query.pod_id ? { pod_id: query.pod_id } : {}),
      ...(query.etd_from || query.etd_to
        ? {
            etd: {
              ...(query.etd_from ? { gte: new Date(query.etd_from) } : {}),
              ...(query.etd_to ? { lte: new Date(query.etd_to) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                voyage_number: { contains: query.search, mode: "insensitive" },
              },
              { mbl_number: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.findMany({ where, orderBy: { etd: "asc" } }),
    );
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          bookings: {
            where: { deleted_at: null },
            orderBy: { booking_date: "desc" },
          },
          load_list: { where: { deleted_at: null } },
        },
      }),
    );
    if (!row) throw new NotFoundException("NVOCC voyage not found.");
    return row;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateNvoccVoyageDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.update({
        where: { id },
        data: {
          vessel_id: dto.vessel_id,
          shipping_line_id: dto.shipping_line_id,
          pol_id: dto.pol_id,
          pod_id: dto.pod_id,
          transshipment_port_id: dto.transshipment_port_id,
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          si_cutoff: dto.si_cutoff ? new Date(dto.si_cutoff) : undefined,
          vgm_cutoff: dto.vgm_cutoff ? new Date(dto.vgm_cutoff) : undefined,
          cy_cutoff: dto.cy_cutoff ? new Date(dto.cy_cutoff) : undefined,
          cargo_cutoff: dto.cargo_cutoff
            ? new Date(dto.cargo_cutoff)
            : undefined,
          slot_allocation_containers: dto.slot_allocation_containers,
          lcl_capacity_cbm: dto.lcl_capacity_cbm,
          voyage_status: dto.voyage_status,
          mbl_number: dto.mbl_number,
          nvocc_freight_rate: dto.nvocc_freight_rate,
          carrier_cost: dto.carrier_cost,
          agent_pol_id: dto.agent_pol_id,
          agent_pod_id: dto.agent_pod_id,
          remarks: dto.remarks,
          updated_by: actorId,
        },
      }),
    );
  }

  async publish(tenantId: string, id: string, actorId?: string) {
    const voyage = await this.findOne(tenantId, id);
    if (voyage.voyage_status === "CANCELLED") {
      throw new BadRequestException("Cannot publish a cancelled voyage.");
    }
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.update({
        where: { id },
        data: { published_at: new Date(), updated_by: actorId },
      }),
    );
  }

  async close(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.update({
        where: { id },
        data: { closed_at: new Date(), updated_by: actorId },
      }),
    );
  }

  async markSailed(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    const sailedAt = new Date();

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.nvoccVoyage.update({
        where: { id },
        data: {
          sailed_at: sailedAt,
          voyage_status: "SAILED",
          updated_by: actorId,
        },
      });

      const jobDetails = await tx.nvoccJobDetail.findMany({
        where: { tenant_id: tenantId, voyage_id: id, deleted_at: null },
        select: { job_id: true },
      });

      for (const detail of jobDetails) {
        await markJobMilestoneIfPresent(
          tx,
          tenantId,
          detail.job_id,
          "VESSEL_SAILED",
          sailedAt,
          actorId,
        );
      }
    });

    return this.findOne(tenantId, id);
  }

  async getVoyagePnl(tenantId: string, voyageId: string) {
    const voyage = await this.findOne(tenantId, voyageId);

    const bookings = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccBooking.findMany({
        where: {
          tenant_id: tenantId,
          voyage_id: voyageId,
          deleted_at: null,
          booking_status: { in: ["CONFIRMED", "CONVERTED"] },
        },
        include: { charges: { where: { deleted_at: null } } },
      }),
    );

    const jobIds = bookings
      .map((b) => b.converted_job_id)
      .filter((id): id is string => !!id);

    const jobs = jobIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.job.findMany({
            where: {
              tenant_id: tenantId,
              id: { in: jobIds },
              deleted_at: null,
            },
            select: {
              id: true,
              job_number: true,
              revenue_total: true,
              cost_total: true,
              gp_amount: true,
              gp_percent: true,
              charges: {
                where: { deleted_at: null },
                select: {
                  description: true,
                  amount_base_currency: true,
                  is_cost: true,
                  is_provisional: true,
                },
              },
            },
          }),
        )
      : [];

    return buildVoyagePnlResponse(voyage, bookings, jobs);
  }

  async copy(
    tenantId: string,
    id: string,
    dto: CopyNvoccVoyageDto,
    actorId?: string,
  ) {
    const source = await this.findOne(tenantId, id);
    const voyageNumber = await this.numberGenerator.generate(
      tenantId,
      "NVOCC_VOYAGE",
    );

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.create({
        data: {
          tenant_id: tenantId,
          voyage_number: voyageNumber,
          vessel_id: source.vessel_id,
          shipping_line_id: source.shipping_line_id,
          pol_id: source.pol_id,
          pod_id: source.pod_id,
          transshipment_port_id: source.transshipment_port_id,
          etd: dto.etd ? new Date(dto.etd) : source.etd,
          eta: dto.eta ? new Date(dto.eta) : source.eta,
          si_cutoff: source.si_cutoff,
          vgm_cutoff: source.vgm_cutoff,
          cy_cutoff: source.cy_cutoff,
          cargo_cutoff: source.cargo_cutoff,
          slot_allocation_containers: source.slot_allocation_containers,
          lcl_capacity_cbm: source.lcl_capacity_cbm,
          nvocc_freight_rate: source.nvocc_freight_rate,
          carrier_cost: source.carrier_cost,
          agent_pol_id: source.agent_pol_id,
          agent_pod_id: source.agent_pod_id,
          remarks: source.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async remove(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccVoyage.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          voyage_status: "CANCELLED",
          updated_by: actorId,
        },
      }),
    );
  }

  getRemainingSpace(voyage: NvoccVoyage) {
    const fclRemaining = Math.max(
      0,
      voyage.slot_allocation_containers - voyage.fcl_booked_containers,
    );
    const lclCapacity = voyage.lcl_capacity_cbm
      ? Number(voyage.lcl_capacity_cbm)
      : null;
    const lclBooked = Number(voyage.lcl_booked_cbm);
    const lclRemaining =
      lclCapacity != null ? Math.max(0, lclCapacity - lclBooked) : null;
    return { fclRemaining, lclRemaining, lclCapacity, lclBooked };
  }
}
