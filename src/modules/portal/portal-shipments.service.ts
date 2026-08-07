import { Injectable, NotFoundException } from '@nestjs/common';
import { Job, JobMilestone, JobStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PortalShipmentQueryDto } from './dto/portal-shipment-query.dto';
import { portalJobOwnershipWhere } from './helpers/portal-ownership.helper';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';

type PortalJobRow = Job & {
  air_details: {
    hawb_number: string | null;
    mawb_number: string | null;
    flight_number: string | null;
    flight_date: Date | null;
    origin_airport_id: string | null;
    dest_airport_id: string | null;
    awb_type: string | null;
    freight_type: string | null;
  } | null;
  sea_fcl_details: {
    voyage_number: string | null;
    hbl_number: string | null;
    mbl_number: string | null;
    booking_number: string | null;
    vessel_id: string | null;
    etd: Date | null;
    eta: Date | null;
    sailed_at: Date | null;
    place_of_receipt: string | null;
    place_of_delivery: string | null;
    freight_terms: string | null;
    transhipment_port: string | null;
    containers: Array<{
      id: string;
      container_number: string | null;
      seal_number: string | null;
      status: string;
      gross_weight: Prisma.Decimal | null;
      cbm: Prisma.Decimal | null;
    }>;
  } | null;
  milestones?: JobMilestone[];
};

@Injectable()
export class PortalShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: CurrentPortalUser, query: PortalShipmentQueryDto) {
    const where = this.buildWhere(user, query);

    const [rows, total] = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      return Promise.all([
        tx.job.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: query.order },
          include: {
            air_details: {
              select: {
                hawb_number: true,
                mawb_number: true,
                flight_number: true,
                flight_date: true,
                origin_airport_id: true,
                dest_airport_id: true,
                awb_type: true,
                freight_type: true,
              },
            },
            sea_fcl_details: {
              select: {
                voyage_number: true,
                hbl_number: true,
                mbl_number: true,
                booking_number: true,
                vessel_id: true,
                etd: true,
                eta: true,
                sailed_at: true,
                place_of_receipt: true,
                place_of_delivery: true,
                freight_terms: true,
                transhipment_port: true,
                containers: {
                  where: { deleted_at: null },
                  select: {
                    id: true,
                    container_number: true,
                    seal_number: true,
                    status: true,
                    gross_weight: true,
                    cbm: true,
                  },
                },
              },
            },
          },
        }),
        tx.job.count({ where }),
      ]);
    });

    const enriched = await this.attachLocations(user.tenantId, rows as PortalJobRow[]);

    return {
      success: true,
      data: enriched.map((job) => this.toListItem(job, user.partyId)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async summary(user: CurrentPortalUser) {
    const base: Prisma.JobWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...portalJobOwnershipWhere(user.partyId),
    };

    const groups = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.groupBy({
        by: ['status'],
        where: base,
        _count: { _all: true },
      }),
    );

    const byStatus = Object.values(JobStatus).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<JobStatus, number>,
    );

    let total = 0;
    for (const row of groups) {
      byStatus[row.status] = row._count._all;
      total += row._count._all;
    }

    const openStatuses: JobStatus[] = [
      JobStatus.ENQUIRY,
      JobStatus.QUOTATION,
      JobStatus.BOOKING_CONFIRMED,
      JobStatus.IN_PROGRESS,
      JobStatus.DOCS_PENDING,
      JobStatus.CUSTOMS_CLEARANCE,
      JobStatus.ON_HOLD,
    ];
    const inTransit = byStatus.IN_PROGRESS + byStatus.DOCS_PENDING + byStatus.CUSTOMS_CLEARANCE;
    const open = openStatuses.reduce((sum, s) => sum + byStatus[s], 0);
    const completed = byStatus.DELIVERED + byStatus.COMPLETED;

    return {
      success: true,
      data: {
        total,
        open,
        in_transit: inTransit,
        completed,
        cancelled: byStatus.CANCELLED,
        by_status: byStatus,
      },
    };
  }

  async lookupByRef(user: CurrentPortalUser, ref: string) {
    const q = ref.trim();
    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalJobOwnershipWhere(user.partyId),
          OR: [
            { job_number: { equals: q, mode: 'insensitive' } },
            { air_details: { hawb_number: { equals: q, mode: 'insensitive' } } },
            { air_details: { mawb_number: { equals: q, mode: 'insensitive' } } },
            { sea_fcl_details: { hbl_number: { equals: q, mode: 'insensitive' } } },
            { sea_fcl_details: { mbl_number: { equals: q, mode: 'insensitive' } } },
            { sea_fcl_details: { booking_number: { equals: q, mode: 'insensitive' } } },
          ],
        },
        select: { id: true, job_number: true, status: true, job_type: true },
      }),
    );

    if (!job) {
      throw new NotFoundException('Shipment not found.');
    }

    return {
      success: true,
      data: job,
    };
  }

  async findOne(user: CurrentPortalUser, jobId: string) {
    const job = await this.findOwnedJob(user, jobId, true);
    const [enriched] = await this.attachLocations(user.tenantId, [job]);

    return {
      success: true,
      data: this.toDetail(enriched, user.partyId),
    };
  }

  async getMilestones(user: CurrentPortalUser, jobId: string) {
    await this.findOwnedJob(user, jobId, false);

    const milestones = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.jobMilestone.findMany({
        where: {
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
        },
        orderBy: { created_at: 'asc' },
        select: {
          id: true,
          milestone: true,
          planned_date: true,
          actual_date: true,
          notes: true,
          created_at: true,
          updated_at: true,
        },
      }),
    );

    return {
      success: true,
      data: milestones.map((m) => ({
        id: m.id,
        milestone: m.milestone,
        planned_date: m.planned_date,
        actual_date: m.actual_date,
        notes: m.notes,
        is_completed: Boolean(m.actual_date),
        created_at: m.created_at,
        updated_at: m.updated_at,
      })),
    };
  }

  // ─── Internals ──────────────────────────────────────────────

  private buildWhere(user: CurrentPortalUser, query: PortalShipmentQueryDto): Prisma.JobWhereInput {
    const where: Prisma.JobWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...portalJobOwnershipWhere(user.partyId),
    };

    if (query.status) where.status = query.status;
    if (query.job_type) where.job_type = query.job_type;

    if (query.from_date || query.to_date) {
      where.created_at = {
        ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
        ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
      };
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.AND = [
        {
          OR: [
            { job_number: { contains: q, mode: 'insensitive' } },
            { commodity: { contains: q, mode: 'insensitive' } },
            { air_details: { hawb_number: { contains: q, mode: 'insensitive' } } },
            { air_details: { mawb_number: { contains: q, mode: 'insensitive' } } },
            { sea_fcl_details: { hbl_number: { contains: q, mode: 'insensitive' } } },
            { sea_fcl_details: { mbl_number: { contains: q, mode: 'insensitive' } } },
            { sea_fcl_details: { booking_number: { contains: q, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    return where;
  }

  private async findOwnedJob(user: CurrentPortalUser, jobId: string, withDetails: boolean) {
    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalJobOwnershipWhere(user.partyId),
        },
        include: withDetails
          ? {
              air_details: {
                select: {
                  hawb_number: true,
                  mawb_number: true,
                  flight_number: true,
                  flight_date: true,
                  origin_airport_id: true,
                  dest_airport_id: true,
                  awb_type: true,
                  freight_type: true,
                },
              },
              sea_fcl_details: {
                select: {
                  voyage_number: true,
                  hbl_number: true,
                  mbl_number: true,
                  booking_number: true,
                  vessel_id: true,
                  etd: true,
                  eta: true,
                  sailed_at: true,
                  place_of_receipt: true,
                  place_of_delivery: true,
                  freight_terms: true,
                  transhipment_port: true,
                  containers: {
                    where: { deleted_at: null },
                    select: {
                      id: true,
                      container_number: true,
                      seal_number: true,
                      status: true,
                      gross_weight: true,
                      cbm: true,
                    },
                  },
                },
              },
              milestones: {
                where: { deleted_at: null },
                orderBy: { created_at: 'asc' },
                select: {
                  id: true,
                  milestone: true,
                  planned_date: true,
                  actual_date: true,
                  notes: true,
                  created_at: true,
                  updated_at: true,
                },
              },
            }
          : undefined,
      }),
    );

    if (!job) {
      // 404 — do not reveal whether the job exists for another party
      throw new NotFoundException('Shipment not found.');
    }

    return job as PortalJobRow;
  }

  private async attachLocations(tenantId: string, jobs: PortalJobRow[]) {
    const portIds = new Set<string>();
    const airportIds = new Set<string>();
    const partyIds = new Set<string>();
    const vesselIds = new Set<string>();

    for (const job of jobs) {
      if (job.origin_port_id) portIds.add(job.origin_port_id);
      if (job.dest_port_id) portIds.add(job.dest_port_id);
      if (job.shipper_id) partyIds.add(job.shipper_id);
      if (job.consignee_id) partyIds.add(job.consignee_id);
      if (job.air_details?.origin_airport_id) airportIds.add(job.air_details.origin_airport_id);
      if (job.air_details?.dest_airport_id) airportIds.add(job.air_details.dest_airport_id);
      if (job.sea_fcl_details?.vessel_id) vesselIds.add(job.sea_fcl_details.vessel_id);
    }

    const [ports, airports, parties, vessels] = await this.prisma.runWithTenant(tenantId, async (tx) => {
      return Promise.all([
        portIds.size
          ? tx.port.findMany({
              where: { tenant_id: tenantId, id: { in: [...portIds] }, deleted_at: null },
              select: { id: true, name: true, un_locode: true, country_code: true },
            })
          : Promise.resolve([]),
        airportIds.size
          ? tx.airport.findMany({
              where: { tenant_id: tenantId, id: { in: [...airportIds] }, deleted_at: null },
              select: { id: true, name: true, iata_code: true, country_code: true },
            })
          : Promise.resolve([]),
        partyIds.size
          ? tx.party.findMany({
              where: { tenant_id: tenantId, id: { in: [...partyIds] }, deleted_at: null },
              select: { id: true, name: true, code: true },
            })
          : Promise.resolve([]),
        vesselIds.size
          ? tx.vessel.findMany({
              where: { tenant_id: tenantId, id: { in: [...vesselIds] }, deleted_at: null },
              select: { id: true, name: true, imo_number: true },
            })
          : Promise.resolve([]),
      ]);
    });

    const portMap = new Map(ports.map((p) => [p.id, p]));
    const airportMap = new Map(airports.map((a) => [a.id, a]));
    const partyMap = new Map(parties.map((p) => [p.id, p]));
    const vesselMap = new Map(vessels.map((v) => [v.id, v]));

    return jobs.map((job) => ({
      ...job,
      _origin_port: job.origin_port_id ? portMap.get(job.origin_port_id) ?? null : null,
      _dest_port: job.dest_port_id ? portMap.get(job.dest_port_id) ?? null : null,
      _origin_airport: job.air_details?.origin_airport_id
        ? airportMap.get(job.air_details.origin_airport_id) ?? null
        : null,
      _dest_airport: job.air_details?.dest_airport_id
        ? airportMap.get(job.air_details.dest_airport_id) ?? null
        : null,
      _shipper: job.shipper_id ? partyMap.get(job.shipper_id) ?? null : null,
      _consignee: job.consignee_id ? partyMap.get(job.consignee_id) ?? null : null,
      _vessel: job.sea_fcl_details?.vessel_id
        ? vesselMap.get(job.sea_fcl_details.vessel_id) ?? null
        : null,
    }));
  }

  private toListItem(
    job: Awaited<ReturnType<PortalShipmentsService['attachLocations']>>[number],
    partyId: string,
  ) {
    return {
      id: job.id,
      job_number: job.job_number,
      job_type: job.job_type,
      status: job.status,
      etd: job.etd ?? job.sea_fcl_details?.etd ?? null,
      eta: job.eta ?? job.sea_fcl_details?.eta ?? null,
      commodity: job.commodity,
      pieces: job.pieces,
      gross_weight: job.gross_weight,
      chargeable_weight: job.chargeable_weight,
      volume_cbm: job.volume_cbm,
      role: this.partyRole(job, partyId),
      origin: this.formatPort(job._origin_port) ?? this.formatAirport(job._origin_airport),
      destination: this.formatPort(job._dest_port) ?? this.formatAirport(job._dest_airport),
      references: {
        hawb_number: job.air_details?.hawb_number ?? null,
        mawb_number: job.air_details?.mawb_number ?? null,
        hbl_number: job.sea_fcl_details?.hbl_number ?? null,
        mbl_number: job.sea_fcl_details?.mbl_number ?? null,
        booking_number: job.sea_fcl_details?.booking_number ?? null,
        flight_number: job.air_details?.flight_number ?? null,
        voyage_number: job.sea_fcl_details?.voyage_number ?? null,
      },
      created_at: job.created_at,
      updated_at: job.updated_at,
    };
  }

  private toDetail(
    job: Awaited<ReturnType<PortalShipmentsService['attachLocations']>>[number] & {
      milestones?: Array<{
        id: string;
        milestone: string;
        planned_date: Date | null;
        actual_date: Date | null;
        notes: string | null;
        created_at: Date;
        updated_at: Date;
      }>;
    },
    partyId: string,
  ) {
    const list = this.toListItem(job, partyId);

    return {
      ...list,
      customer_remarks: job.customer_remarks,
      incoterms: job.incoterms,
      is_dg: job.is_dg,
      shipper: job._shipper,
      consignee: job._consignee,
      air: job.air_details
        ? {
            hawb_number: job.air_details.hawb_number,
            mawb_number: job.air_details.mawb_number,
            flight_number: job.air_details.flight_number,
            flight_date: job.air_details.flight_date,
            awb_type: job.air_details.awb_type,
            freight_type: job.air_details.freight_type,
            origin_airport: this.formatAirport(job._origin_airport),
            dest_airport: this.formatAirport(job._dest_airport),
          }
        : null,
      sea_fcl: job.sea_fcl_details
        ? {
            voyage_number: job.sea_fcl_details.voyage_number,
            hbl_number: job.sea_fcl_details.hbl_number,
            mbl_number: job.sea_fcl_details.mbl_number,
            booking_number: job.sea_fcl_details.booking_number,
            etd: job.sea_fcl_details.etd,
            eta: job.sea_fcl_details.eta,
            sailed_at: job.sea_fcl_details.sailed_at,
            place_of_receipt: job.sea_fcl_details.place_of_receipt,
            place_of_delivery: job.sea_fcl_details.place_of_delivery,
            freight_terms: job.sea_fcl_details.freight_terms,
            transhipment_port: job.sea_fcl_details.transhipment_port,
            vessel: job._vessel,
            containers: job.sea_fcl_details.containers.map((c) => ({
              id: c.id,
              container_number: c.container_number,
              seal_number: c.seal_number,
              status: c.status,
              gross_weight: c.gross_weight,
              cbm: c.cbm,
            })),
          }
        : null,
      milestones: (job.milestones ?? []).map((m) => ({
        id: m.id,
        milestone: m.milestone,
        planned_date: m.planned_date,
        actual_date: m.actual_date,
        notes: m.notes,
        is_completed: Boolean(m.actual_date),
        created_at: m.created_at,
        updated_at: m.updated_at,
      })),
    };
  }

  private partyRole(
    job: {
      shipper_id: string | null;
      consignee_id: string | null;
      billing_party_id: string | null;
    },
    partyId: string,
  ) {
    const roles: string[] = [];
    if (job.shipper_id === partyId) roles.push('SHIPPER');
    if (job.consignee_id === partyId) roles.push('CONSIGNEE');
    if (job.billing_party_id === partyId) roles.push('BILLING');
    return roles;
  }

  private formatPort(
    port: { name: string; un_locode: string; country_code: string } | null | undefined,
  ) {
    if (!port) return null;
    return {
      name: port.name,
      code: port.un_locode,
      country_code: port.country_code,
    };
  }

  private formatAirport(
    airport: { name: string; iata_code: string; country_code: string } | null | undefined,
  ) {
    if (!airport) return null;
    return {
      name: airport.name,
      code: airport.iata_code,
      country_code: airport.country_code,
    };
  }
}
