import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Job,
  JobMilestone,
  JobStatus,
  JobType,
  Prisma,
  Shipment,
  ShipmentStatus,
} from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { PortalShipmentQueryDto } from "./dto/portal-shipment-query.dto";
import { PORTAL_CSV_EXPORT_MAX_ROWS, toCsv } from "./helpers/portal-csv.helper";
import {
  portalJobOwnershipWhere,
  portalShipmentOwnershipWhere,
} from "./helpers/portal-ownership.helper";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";

const JOB_DETAIL_INCLUDE = {
  air_details: {
    select: {
      hawb_number: true,
      mawb_number: true,
      flight_number: true,
      flight_date: true,
      airline_id: true,
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
      shipping_line_id: true,
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
} as const;

const JOB_LIST_INCLUDE = {
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
} as const;

type JobDetailSlice = {
  hawb_number: string | null;
  mawb_number: string | null;
  flight_number: string | null;
  flight_date: Date | null;
  airline_id?: string | null;
  origin_airport_id: string | null;
  dest_airport_id: string | null;
  awb_type: string | null;
  freight_type: string | null;
} | null;

type SeaFclSlice = {
  voyage_number: string | null;
  hbl_number: string | null;
  mbl_number: string | null;
  booking_number: string | null;
  vessel_id: string | null;
  shipping_line_id?: string | null;
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

/** Normalized row used for list/detail (Shipment primary or legacy Job). */
type PortalRow = {
  id: string;
  shipment_id: string | null;
  shipment_number: string | null;
  job_id: string | null;
  job_number: string | null;
  job_type: JobType;
  status: string;
  etd: Date | null;
  eta: Date | null;
  commodity: string | null;
  pieces: number | null;
  gross_weight: Prisma.Decimal | null;
  chargeable_weight: Prisma.Decimal | null;
  volume_cbm: Prisma.Decimal | null;
  shipper_id: string | null;
  consignee_id: string | null;
  billing_party_id: string | null;
  origin_port_id: string | null;
  dest_port_id: string | null;
  customer_remarks: string | null;
  incoterms: string | null;
  is_dg: boolean;
  vessel_name: string | null;
  voyage_number: string | null;
  flight_number: string | null;
  hbl_number: string | null;
  container_numbers: string | null;
  created_at: Date;
  updated_at: Date;
  air_details: JobDetailSlice;
  sea_fcl_details: SeaFclSlice;
  milestones?: JobMilestone[];
};

type EnrichedPortalRow = PortalRow & {
  _origin_port: {
    id: string;
    name: string;
    un_locode: string;
    country_code: string;
  } | null;
  _dest_port: {
    id: string;
    name: string;
    un_locode: string;
    country_code: string;
  } | null;
  _origin_airport: {
    id: string;
    name: string;
    iata_code: string;
    country_code: string;
  } | null;
  _dest_airport: {
    id: string;
    name: string;
    iata_code: string;
    country_code: string;
  } | null;
  _shipper: { id: string; name: string; code: string } | null;
  _consignee: { id: string; name: string; code: string } | null;
  _vessel: { id: string; name: string; imo_number: string | null } | null;
  _airline: { id: string; name: string; iata_code: string | null } | null;
  _shipping_line: {
    id: string;
    name: string;
    scac_code: string | null;
  } | null;
};

type LinkedJob = Job & {
  air_details: JobDetailSlice;
  sea_fcl_details: SeaFclSlice;
  milestones?: JobMilestone[];
};

@Injectable()
export class PortalShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: CurrentPortalUser, query: PortalShipmentQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;
    const shipmentWhere = this.buildShipmentWhere(user, query);
    const legacyJobWhere = this.buildLegacyJobWhere(user, query);

    const { rows, total } = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) => {
        const [shipmentCount, legacyCount] = await Promise.all([
          tx.shipment.count({ where: shipmentWhere }),
          tx.job.count({ where: legacyJobWhere }),
        ]);
        const totalCount = shipmentCount + legacyCount;

        let shipmentRows: Array<
          Shipment & { job: LinkedJob | null }
        > = [];
        let legacyJobs: LinkedJob[] = [];

        if (skip < shipmentCount) {
          shipmentRows = (await tx.shipment.findMany({
            where: shipmentWhere,
            skip,
            take,
            orderBy: { created_at: query.order },
            include: { job: { include: JOB_LIST_INCLUDE } },
          })) as Array<Shipment & { job: LinkedJob | null }>;

          const remaining = take - shipmentRows.length;
          if (remaining > 0) {
            legacyJobs = (await tx.job.findMany({
              where: legacyJobWhere,
              skip: 0,
              take: remaining,
              orderBy: { created_at: query.order },
              include: JOB_LIST_INCLUDE,
            })) as LinkedJob[];
          }
        } else {
          legacyJobs = (await tx.job.findMany({
            where: legacyJobWhere,
            skip: skip - shipmentCount,
            take,
            orderBy: { created_at: query.order },
            include: JOB_LIST_INCLUDE,
          })) as LinkedJob[];
        }

        const normalized: PortalRow[] = [
          ...shipmentRows.map((s) => this.fromShipment(s, s.job)),
          ...legacyJobs.map((j) => this.fromLegacyJob(j)),
        ];

        return { rows: normalized, total: totalCount };
      },
    );

    const enriched = await this.attachLocations(user.tenantId, rows);

    return {
      success: true,
      data: enriched.map((row) => this.toListItem(row, user.partyId)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async exportCsv(
    user: CurrentPortalUser,
    query: PortalShipmentQueryDto,
    res: Response,
  ) {
    const shipmentWhere = this.buildShipmentWhere(user, query);
    const legacyJobWhere = this.buildLegacyJobWhere(user, query);

    const rows = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const shipments = (await tx.shipment.findMany({
        where: shipmentWhere,
        take: PORTAL_CSV_EXPORT_MAX_ROWS,
        orderBy: { created_at: query.order },
        include: { job: { include: JOB_LIST_INCLUDE } },
      })) as Array<Shipment & { job: LinkedJob | null }>;

      const remaining = Math.max(
        0,
        PORTAL_CSV_EXPORT_MAX_ROWS - shipments.length,
      );
      const legacy =
        remaining > 0
          ? ((await tx.job.findMany({
              where: legacyJobWhere,
              take: remaining,
              orderBy: { created_at: query.order },
              include: JOB_LIST_INCLUDE,
            })) as LinkedJob[])
          : [];

      return [
        ...shipments.map((s) => this.fromShipment(s, s.job)),
        ...legacy.map((j) => this.fromLegacyJob(j)),
      ];
    });

    const enriched = await this.attachLocations(user.tenantId, rows);
    const items = enriched.map((row) => this.toListItem(row, user.partyId));

    const headers = [
      "shipment_id",
      "shipment_number",
      "job_id",
      "job_number",
      "job_type",
      "status",
      "role",
      "etd",
      "eta",
      "commodity",
      "pieces",
      "gross_weight",
      "chargeable_weight",
      "volume_cbm",
      "origin",
      "destination",
      "hawb_number",
      "mawb_number",
      "hbl_number",
      "mbl_number",
      "booking_number",
      "flight_number",
      "voyage_number",
      "created_at",
      "updated_at",
    ];

    const csvRows = items.map((item) => [
      item.shipment_id,
      item.shipment_number,
      item.job_id,
      item.job_number,
      item.job_type,
      item.status,
      (item.role ?? []).join("|"),
      item.etd,
      item.eta,
      item.commodity,
      item.pieces,
      item.gross_weight,
      item.chargeable_weight,
      item.volume_cbm,
      item.origin?.name ?? item.origin?.code ?? "",
      item.destination?.name ?? item.destination?.code ?? "",
      item.references.hawb_number,
      item.references.mawb_number,
      item.references.hbl_number,
      item.references.mbl_number,
      item.references.booking_number,
      item.references.flight_number,
      item.references.voyage_number,
      item.created_at,
      item.updated_at,
    ]);

    const csv = toCsv(headers, csvRows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="shipments.csv"',
    );
    res.send(csv);
  }

  async summary(
    user: CurrentPortalUser,
    period?: { from: Date; to: Date; period?: string },
  ) {
    const dateFilter = period
      ? { created_at: { gte: period.from, lte: period.to } }
      : {};

    const shipmentBase: Prisma.ShipmentWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...portalShipmentOwnershipWhere(user.partyId),
      ...dateFilter,
    };

    const legacyJobBase: Prisma.JobWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...portalJobOwnershipWhere(user.partyId),
      NOT: { shipments: { some: { deleted_at: null } } },
      ...dateFilter,
    };

    const [shipmentGroups, jobGroups] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.shipment.groupBy({
            by: ["status"],
            where: shipmentBase,
            _count: { _all: true },
          }),
          tx.job.groupBy({
            by: ["status"],
            where: legacyJobBase,
            _count: { _all: true },
          }),
        ]),
    );

    const byStatus = Object.values(JobStatus).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<JobStatus, number>,
    );

    let total = 0;
    for (const row of shipmentGroups) {
      const mapped = this.mapShipmentStatusToJobBucket(row.status);
      byStatus[mapped] += row._count._all;
      total += row._count._all;
    }
    for (const row of jobGroups) {
      byStatus[row.status] += row._count._all;
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
    const inTransit =
      byStatus.IN_PROGRESS + byStatus.DOCS_PENDING + byStatus.CUSTOMS_CLEARANCE;
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

    const shipment = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.shipment.findFirst({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalShipmentOwnershipWhere(user.partyId),
          OR: [
            { shipment_number: { equals: q, mode: "insensitive" } },
            { hbl_number: { equals: q, mode: "insensitive" } },
            {
              job: {
                job_number: { equals: q, mode: "insensitive" },
              },
            },
            {
              job: {
                air_details: {
                  hawb_number: { equals: q, mode: "insensitive" },
                },
              },
            },
            {
              job: {
                air_details: {
                  mawb_number: { equals: q, mode: "insensitive" },
                },
              },
            },
            {
              job: {
                sea_fcl_details: {
                  hbl_number: { equals: q, mode: "insensitive" },
                },
              },
            },
            {
              job: {
                sea_fcl_details: {
                  mbl_number: { equals: q, mode: "insensitive" },
                },
              },
            },
            {
              job: {
                sea_fcl_details: {
                  booking_number: { equals: q, mode: "insensitive" },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          shipment_number: true,
          status: true,
          job_type: true,
          job_id: true,
          job: { select: { id: true, job_number: true, status: true } },
        },
      }),
    );

    if (shipment) {
      return {
        success: true,
        data: {
          id: shipment.id,
          shipment_id: shipment.id,
          shipment_number: shipment.shipment_number,
          job_id: shipment.job_id,
          job_number: shipment.job?.job_number ?? null,
          status: shipment.job?.status ?? shipment.status,
          job_type: shipment.job_type,
        },
      };
    }

    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalJobOwnershipWhere(user.partyId),
          OR: [
            { job_number: { equals: q, mode: "insensitive" } },
            {
              air_details: { hawb_number: { equals: q, mode: "insensitive" } },
            },
            {
              air_details: { mawb_number: { equals: q, mode: "insensitive" } },
            },
            {
              sea_fcl_details: {
                hbl_number: { equals: q, mode: "insensitive" },
              },
            },
            {
              sea_fcl_details: {
                mbl_number: { equals: q, mode: "insensitive" },
              },
            },
            {
              sea_fcl_details: {
                booking_number: { equals: q, mode: "insensitive" },
              },
            },
          ],
        },
        select: { id: true, job_number: true, status: true, job_type: true },
      }),
    );

    if (!job) {
      throw new NotFoundException("Shipment not found.");
    }

    return {
      success: true,
      data: {
        id: job.id,
        shipment_id: null,
        shipment_number: null,
        job_id: job.id,
        job_number: job.job_number,
        status: job.status,
        job_type: job.job_type,
      },
    };
  }

  async findOne(user: CurrentPortalUser, id: string) {
    const row = await this.resolveOwnedRow(user, id, true);
    const [enriched] = await this.attachLocations(user.tenantId, [row]);

    return {
      success: true,
      data: this.toDetail(enriched, user.partyId),
    };
  }

  async getMilestones(user: CurrentPortalUser, id: string) {
    const jobId = await this.resolveTrackingJobId(user, id);
    if (!jobId) {
      return { success: true, data: [] };
    }

    const milestones = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.jobMilestone.findMany({
        where: {
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
        },
        orderBy: { created_at: "asc" },
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

  /**
   * Resolve portal `:id` to a Job id for tracking / docs / workflow.
   * Accepts Shipment id (uses shipment.job_id) or legacy Job id.
   */
  async resolveTrackingJobId(
    user: CurrentPortalUser,
    id: string,
  ): Promise<string | null> {
    const shipment = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.shipment.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalShipmentOwnershipWhere(user.partyId),
        },
        select: { job_id: true },
      }),
    );
    if (shipment) {
      return shipment.job_id;
    }

    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalJobOwnershipWhere(user.partyId),
        },
        select: { id: true },
      }),
    );
    if (!job) {
      throw new NotFoundException("Shipment not found.");
    }
    return job.id;
  }

  // ─── Internals ──────────────────────────────────────────────

  private buildShipmentWhere(
    user: CurrentPortalUser,
    query: PortalShipmentQueryDto,
  ): Prisma.ShipmentWhereInput {
    const where: Prisma.ShipmentWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...portalShipmentOwnershipWhere(user.partyId),
    };

    if (query.job_type) where.job_type = query.job_type;

    if (query.from_date || query.to_date) {
      where.created_at = {
        ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
        ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
      };
    }

    if (query.status) {
      const shipmentStatus = this.mapJobStatusToShipmentStatus(query.status);
      where.AND = [
        ...(Array.isArray(where.AND)
          ? where.AND
          : where.AND
            ? [where.AND]
            : []),
        {
          OR: [
            { job: { status: query.status } },
            ...(shipmentStatus
              ? [{ job_id: null as string | null, status: shipmentStatus }]
              : []),
          ],
        },
      ];
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      const searchOr: Prisma.ShipmentWhereInput[] = [
        { shipment_number: { contains: q, mode: "insensitive" } },
        { commodity: { contains: q, mode: "insensitive" } },
        { hbl_number: { contains: q, mode: "insensitive" } },
        { job: { job_number: { contains: q, mode: "insensitive" } } },
        {
          job: {
            air_details: { hawb_number: { contains: q, mode: "insensitive" } },
          },
        },
        {
          job: {
            air_details: { mawb_number: { contains: q, mode: "insensitive" } },
          },
        },
        {
          job: {
            sea_fcl_details: {
              hbl_number: { contains: q, mode: "insensitive" },
            },
          },
        },
        {
          job: {
            sea_fcl_details: {
              mbl_number: { contains: q, mode: "insensitive" },
            },
          },
        },
        {
          job: {
            sea_fcl_details: {
              booking_number: { contains: q, mode: "insensitive" },
            },
          },
        },
      ];
      where.AND = [
        ...(Array.isArray(where.AND)
          ? where.AND
          : where.AND
            ? [where.AND]
            : []),
        { OR: searchOr },
      ];
    }

    return where;
  }

  private buildLegacyJobWhere(
    user: CurrentPortalUser,
    query: PortalShipmentQueryDto,
  ): Prisma.JobWhereInput {
    const where: Prisma.JobWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...portalJobOwnershipWhere(user.partyId),
      // Dual-read: only jobs that have no linked Shipment row
      NOT: { shipments: { some: { deleted_at: null } } },
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
            { job_number: { contains: q, mode: "insensitive" } },
            { commodity: { contains: q, mode: "insensitive" } },
            {
              air_details: {
                hawb_number: { contains: q, mode: "insensitive" },
              },
            },
            {
              air_details: {
                mawb_number: { contains: q, mode: "insensitive" },
              },
            },
            {
              sea_fcl_details: {
                hbl_number: { contains: q, mode: "insensitive" },
              },
            },
            {
              sea_fcl_details: {
                mbl_number: { contains: q, mode: "insensitive" },
              },
            },
            {
              sea_fcl_details: {
                booking_number: { contains: q, mode: "insensitive" },
              },
            },
          ],
        },
      ];
    }

    return where;
  }

  private async resolveOwnedRow(
    user: CurrentPortalUser,
    id: string,
    withMilestones: boolean,
  ): Promise<PortalRow> {
    const jobInclude = withMilestones
      ? {
          ...JOB_DETAIL_INCLUDE,
          milestones: {
            where: { deleted_at: null },
            orderBy: { created_at: "asc" as const },
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
      : JOB_DETAIL_INCLUDE;

    const shipment = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.shipment.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalShipmentOwnershipWhere(user.partyId),
        },
        include: { job: { include: jobInclude } },
      }),
    );

    if (shipment) {
      return this.fromShipment(
        shipment,
        shipment.job as LinkedJob | null,
      );
    }

    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalJobOwnershipWhere(user.partyId),
        },
        include: jobInclude,
      }),
    );

    if (!job) {
      throw new NotFoundException("Shipment not found.");
    }

    return this.fromLegacyJob(job as LinkedJob);
  }

  private fromShipment(
    shipment: Shipment,
    job: LinkedJob | null,
  ): PortalRow {
    return {
      id: shipment.id,
      shipment_id: shipment.id,
      shipment_number: shipment.shipment_number,
      job_id: shipment.job_id,
      job_number: job?.job_number ?? null,
      job_type: shipment.job_type,
      status: job?.status ?? shipment.status,
      etd: job?.etd ?? shipment.etd,
      eta: job?.eta ?? shipment.eta,
      commodity: job?.commodity ?? shipment.commodity,
      pieces: job?.pieces ?? shipment.pieces,
      gross_weight: job?.gross_weight ?? shipment.gross_weight,
      chargeable_weight:
        job?.chargeable_weight ?? shipment.chargeable_weight,
      volume_cbm: job?.volume_cbm ?? shipment.volume_cbm,
      shipper_id: shipment.shipper_id ?? job?.shipper_id ?? null,
      consignee_id: shipment.consignee_id ?? job?.consignee_id ?? null,
      billing_party_id: job?.billing_party_id ?? shipment.customer_id,
      origin_port_id: shipment.origin_port_id ?? job?.origin_port_id ?? null,
      dest_port_id: shipment.dest_port_id ?? job?.dest_port_id ?? null,
      customer_remarks: job?.customer_remarks ?? shipment.notes,
      incoterms: shipment.incoterms ?? job?.incoterms ?? null,
      is_dg: shipment.is_dg || job?.is_dg || false,
      vessel_name: shipment.vessel_name,
      voyage_number: shipment.voyage_number,
      flight_number: shipment.flight_number,
      hbl_number: shipment.hbl_number,
      container_numbers: shipment.container_numbers,
      created_at: shipment.created_at,
      updated_at: shipment.updated_at,
      air_details: job?.air_details ?? null,
      sea_fcl_details: job?.sea_fcl_details ?? null,
      milestones: job?.milestones,
    };
  }

  private fromLegacyJob(job: LinkedJob): PortalRow {
    return {
      id: job.id,
      shipment_id: null,
      shipment_number: null,
      job_id: job.id,
      job_number: job.job_number,
      job_type: job.job_type,
      status: job.status,
      etd: job.etd,
      eta: job.eta,
      commodity: job.commodity,
      pieces: job.pieces,
      gross_weight: job.gross_weight,
      chargeable_weight: job.chargeable_weight,
      volume_cbm: job.volume_cbm,
      shipper_id: job.shipper_id,
      consignee_id: job.consignee_id,
      billing_party_id: job.billing_party_id,
      origin_port_id: job.origin_port_id,
      dest_port_id: job.dest_port_id,
      customer_remarks: job.customer_remarks,
      incoterms: job.incoterms,
      is_dg: job.is_dg,
      vessel_name: null,
      voyage_number: null,
      flight_number: null,
      hbl_number: null,
      container_numbers: null,
      created_at: job.created_at,
      updated_at: job.updated_at,
      air_details: job.air_details,
      sea_fcl_details: job.sea_fcl_details,
      milestones: job.milestones,
    };
  }

  private mapJobStatusToShipmentStatus(
    status: JobStatus,
  ): ShipmentStatus | null {
    switch (status) {
      case JobStatus.BOOKING_CONFIRMED:
      case JobStatus.ENQUIRY:
      case JobStatus.QUOTATION:
        return ShipmentStatus.BOOKED;
      case JobStatus.IN_PROGRESS:
      case JobStatus.DOCS_PENDING:
      case JobStatus.CUSTOMS_CLEARANCE:
        return ShipmentStatus.IN_PROGRESS;
      case JobStatus.DELIVERED:
      case JobStatus.COMPLETED:
        return ShipmentStatus.COMPLETED;
      case JobStatus.CANCELLED:
        return ShipmentStatus.CANCELLED;
      case JobStatus.ON_HOLD:
        return ShipmentStatus.ON_HOLD;
      default:
        return null;
    }
  }

  private mapShipmentStatusToJobBucket(status: ShipmentStatus): JobStatus {
    switch (status) {
      case ShipmentStatus.BOOKED:
        return JobStatus.BOOKING_CONFIRMED;
      case ShipmentStatus.IN_PROGRESS:
        return JobStatus.IN_PROGRESS;
      case ShipmentStatus.COMPLETED:
        return JobStatus.COMPLETED;
      case ShipmentStatus.CANCELLED:
        return JobStatus.CANCELLED;
      case ShipmentStatus.ON_HOLD:
        return JobStatus.ON_HOLD;
      default:
        return JobStatus.BOOKING_CONFIRMED;
    }
  }

  private async attachLocations(tenantId: string, rows: PortalRow[]) {
    const portIds = new Set<string>();
    const airportIds = new Set<string>();
    const partyIds = new Set<string>();
    const vesselIds = new Set<string>();
    const airlineIds = new Set<string>();
    const shippingLineIds = new Set<string>();

    for (const row of rows) {
      if (row.origin_port_id) portIds.add(row.origin_port_id);
      if (row.dest_port_id) portIds.add(row.dest_port_id);
      if (row.shipper_id) partyIds.add(row.shipper_id);
      if (row.consignee_id) partyIds.add(row.consignee_id);
      if (row.air_details?.origin_airport_id)
        airportIds.add(row.air_details.origin_airport_id);
      if (row.air_details?.dest_airport_id)
        airportIds.add(row.air_details.dest_airport_id);
      if (row.air_details?.airline_id)
        airlineIds.add(row.air_details.airline_id);
      if (row.sea_fcl_details?.vessel_id)
        vesselIds.add(row.sea_fcl_details.vessel_id);
      if (row.sea_fcl_details?.shipping_line_id)
        shippingLineIds.add(row.sea_fcl_details.shipping_line_id);
    }

    const [ports, airports, parties, vessels, airlines, shippingLines] =
      await this.prisma.runWithTenant(tenantId, async (tx) => {
        return Promise.all([
          portIds.size
            ? tx.port.findMany({
                where: {
                  tenant_id: tenantId,
                  id: { in: [...portIds] },
                  deleted_at: null,
                },
                select: {
                  id: true,
                  name: true,
                  un_locode: true,
                  country_code: true,
                },
              })
            : Promise.resolve([]),
          airportIds.size
            ? tx.airport.findMany({
                where: {
                  tenant_id: tenantId,
                  id: { in: [...airportIds] },
                  deleted_at: null,
                },
                select: {
                  id: true,
                  name: true,
                  iata_code: true,
                  country_code: true,
                },
              })
            : Promise.resolve([]),
          partyIds.size
            ? tx.party.findMany({
                where: {
                  tenant_id: tenantId,
                  id: { in: [...partyIds] },
                  deleted_at: null,
                },
                select: { id: true, name: true, code: true },
              })
            : Promise.resolve([]),
          vesselIds.size
            ? tx.vessel.findMany({
                where: {
                  tenant_id: tenantId,
                  id: { in: [...vesselIds] },
                  deleted_at: null,
                },
                select: { id: true, name: true, imo_number: true },
              })
            : Promise.resolve([]),
          airlineIds.size
            ? tx.airline.findMany({
                where: {
                  tenant_id: tenantId,
                  id: { in: [...airlineIds] },
                  deleted_at: null,
                },
                select: { id: true, name: true, iata_code: true },
              })
            : Promise.resolve([]),
          shippingLineIds.size
            ? tx.shippingLine.findMany({
                where: {
                  tenant_id: tenantId,
                  id: { in: [...shippingLineIds] },
                  deleted_at: null,
                },
                select: { id: true, name: true, scac_code: true },
              })
            : Promise.resolve([]),
        ]);
      });

    const portMap = new Map(ports.map((p) => [p.id, p]));
    const airportMap = new Map(airports.map((a) => [a.id, a]));
    const partyMap = new Map(parties.map((p) => [p.id, p]));
    const vesselMap = new Map(vessels.map((v) => [v.id, v]));
    const airlineMap = new Map(airlines.map((a) => [a.id, a]));
    const shippingLineMap = new Map(shippingLines.map((s) => [s.id, s]));

    return rows.map((row) => ({
      ...row,
      _origin_port: row.origin_port_id
        ? (portMap.get(row.origin_port_id) ?? null)
        : null,
      _dest_port: row.dest_port_id
        ? (portMap.get(row.dest_port_id) ?? null)
        : null,
      _origin_airport: row.air_details?.origin_airport_id
        ? (airportMap.get(row.air_details.origin_airport_id) ?? null)
        : null,
      _dest_airport: row.air_details?.dest_airport_id
        ? (airportMap.get(row.air_details.dest_airport_id) ?? null)
        : null,
      _shipper: row.shipper_id ? (partyMap.get(row.shipper_id) ?? null) : null,
      _consignee: row.consignee_id
        ? (partyMap.get(row.consignee_id) ?? null)
        : null,
      _vessel: row.sea_fcl_details?.vessel_id
        ? (vesselMap.get(row.sea_fcl_details.vessel_id) ?? null)
        : null,
      _airline: row.air_details?.airline_id
        ? (airlineMap.get(row.air_details.airline_id) ?? null)
        : null,
      _shipping_line: row.sea_fcl_details?.shipping_line_id
        ? (shippingLineMap.get(row.sea_fcl_details.shipping_line_id) ?? null)
        : null,
    })) as EnrichedPortalRow[];
  }

  private toListItem(row: EnrichedPortalRow, partyId: string) {
    return {
      id: row.id,
      shipment_id: row.shipment_id,
      shipment_number: row.shipment_number,
      job_id: row.job_id,
      job_number: row.job_number,
      job_type: row.job_type,
      status: row.status,
      etd: row.etd ?? row.sea_fcl_details?.etd ?? null,
      eta: row.eta ?? row.sea_fcl_details?.eta ?? null,
      commodity: row.commodity,
      pieces: row.pieces,
      gross_weight: row.gross_weight,
      chargeable_weight: row.chargeable_weight,
      volume_cbm: row.volume_cbm,
      role: this.partyRole(row, partyId),
      origin:
        this.formatPort(row._origin_port) ??
        this.formatAirport(row._origin_airport),
      destination:
        this.formatPort(row._dest_port) ??
        this.formatAirport(row._dest_airport),
      references: {
        hawb_number: row.air_details?.hawb_number ?? null,
        mawb_number: row.air_details?.mawb_number ?? null,
        hbl_number:
          row.sea_fcl_details?.hbl_number ?? row.hbl_number ?? null,
        mbl_number: row.sea_fcl_details?.mbl_number ?? null,
        booking_number: row.sea_fcl_details?.booking_number ?? null,
        flight_number:
          row.air_details?.flight_number ?? row.flight_number ?? null,
        voyage_number:
          row.sea_fcl_details?.voyage_number ?? row.voyage_number ?? null,
      },
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private toDetail(row: EnrichedPortalRow, partyId: string) {
    const list = this.toListItem(row, partyId);
    const originObj = list.origin;
    const destObj = list.destination;
    const containerNumbersFromJob = (row.sea_fcl_details?.containers ?? [])
      .map((c) => c.container_number)
      .filter((n): n is string => Boolean(n));
    const containerNumbers = containerNumbersFromJob.length
      ? containerNumbersFromJob
      : (row.container_numbers ?? "")
          .split(/[,;\s]+/)
          .map((s) => s.trim())
          .filter(Boolean);
    const vesselName = row._vessel?.name ?? row.vessel_name ?? null;
    const voyage =
      row.sea_fcl_details?.voyage_number ?? row.voyage_number ?? null;
    const flight =
      row.air_details?.flight_number ?? row.flight_number ?? null;
    const airlineName = row._airline?.name ?? null;
    const shippingLineName = row._shipping_line?.name ?? null;

    const cargoParts = [
      row.commodity,
      row.pieces != null ? `${row.pieces} pcs` : null,
      row.gross_weight != null ? `${row.gross_weight} kg` : null,
      row.volume_cbm != null ? `${row.volume_cbm} cbm` : null,
    ].filter(Boolean);

    return {
      ...list,
      reference: row.shipment_number ?? row.job_number,
      origin_string: originObj
        ? [originObj.code, originObj.name].filter(Boolean).join(" — ")
        : null,
      destination_string: destObj
        ? [destObj.code, destObj.name].filter(Boolean).join(" — ")
        : null,
      origin_name: originObj?.name ?? null,
      destination_name: destObj?.name ?? null,
      origin_code: originObj?.code ?? null,
      destination_code: destObj?.code ?? null,
      cargo_summary: cargoParts.join(" · ") || null,
      container_numbers: containerNumbers,
      vessel_name: vesselName,
      voyage_number: voyage,
      flight_number: flight,
      vessel_flight: vesselName
        ? voyage
          ? `${vesselName} / ${voyage}`
          : vesselName
        : flight,
      mbl_number: row.sea_fcl_details?.mbl_number ?? null,
      hbl_number: row.sea_fcl_details?.hbl_number ?? row.hbl_number ?? null,
      mawb_number: row.air_details?.mawb_number ?? null,
      hawb_number: row.air_details?.hawb_number ?? null,
      airline_name: airlineName,
      shipping_line_name: shippingLineName,
      customer_remarks: row.customer_remarks,
      incoterms: row.incoterms,
      is_dg: row.is_dg,
      shipper: row._shipper,
      consignee: row._consignee,
      air: row.air_details
        ? {
            hawb_number: row.air_details.hawb_number,
            mawb_number: row.air_details.mawb_number,
            flight_number: row.air_details.flight_number,
            flight_date: row.air_details.flight_date,
            awb_type: row.air_details.awb_type,
            freight_type: row.air_details.freight_type,
            airline_name: airlineName,
            airline_code: row._airline?.iata_code ?? null,
            origin_airport: this.formatAirport(row._origin_airport),
            dest_airport: this.formatAirport(row._dest_airport),
          }
        : null,
      sea_fcl: row.sea_fcl_details
        ? {
            voyage_number: row.sea_fcl_details.voyage_number,
            hbl_number: row.sea_fcl_details.hbl_number,
            mbl_number: row.sea_fcl_details.mbl_number,
            booking_number: row.sea_fcl_details.booking_number,
            etd: row.sea_fcl_details.etd,
            eta: row.sea_fcl_details.eta,
            sailed_at: row.sea_fcl_details.sailed_at,
            place_of_receipt: row.sea_fcl_details.place_of_receipt,
            place_of_delivery: row.sea_fcl_details.place_of_delivery,
            freight_terms: row.sea_fcl_details.freight_terms,
            transhipment_port: row.sea_fcl_details.transhipment_port,
            vessel: row._vessel,
            shipping_line_name: shippingLineName,
            shipping_line_code: row._shipping_line?.scac_code ?? null,
            containers: row.sea_fcl_details.containers.map((c) => ({
              id: c.id,
              container_number: c.container_number,
              seal_number: c.seal_number,
              status: c.status,
              gross_weight: c.gross_weight,
              cbm: c.cbm,
            })),
          }
        : null,
      milestones: (row.milestones ?? []).map((m) => ({
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
    row: {
      shipper_id: string | null;
      consignee_id: string | null;
      billing_party_id: string | null;
    },
    partyId: string,
  ) {
    const roles: string[] = [];
    if (row.shipper_id === partyId) roles.push("SHIPPER");
    if (row.consignee_id === partyId) roles.push("CONSIGNEE");
    if (row.billing_party_id === partyId) roles.push("BILLING");
    return roles;
  }

  private formatPort(
    port:
      | { name: string; un_locode: string; country_code: string }
      | null
      | undefined,
  ) {
    if (!port) return null;
    return {
      name: port.name,
      code: port.un_locode,
      country_code: port.country_code,
    };
  }

  private formatAirport(
    airport:
      | { name: string; iata_code: string; country_code: string }
      | null
      | undefined,
  ) {
    if (!airport) return null;
    return {
      name: airport.name,
      code: airport.iata_code,
      country_code: airport.country_code,
    };
  }
}
