import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrackService {
  constructor(private readonly prisma: PrismaService) {}

  async track(tenantSlug: string, ref: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug: tenantSlug, deleted_at: null, is_active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        display_name: true,
        logo_url: true,
        primary_color: true,
        website: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Shipment not found.');
    }

    const q = ref.trim();
    if (q.length < 2) {
      throw new NotFoundException('Shipment not found.');
    }

    const job = await this.prisma.runWithTenant(tenant.id, (tx) =>
      tx.job.findFirst({
        where: {
          tenant_id: tenant.id,
          deleted_at: null,
          OR: [
            { job_number: { equals: q, mode: 'insensitive' } },
            { air_details: { hawb_number: { equals: q, mode: 'insensitive' } } },
            { air_details: { mawb_number: { equals: q, mode: 'insensitive' } } },
            { sea_fcl_details: { hbl_number: { equals: q, mode: 'insensitive' } } },
            { sea_fcl_details: { mbl_number: { equals: q, mode: 'insensitive' } } },
            { sea_fcl_details: { booking_number: { equals: q, mode: 'insensitive' } } },
          ],
        },
        include: {
          air_details: {
            select: {
              hawb_number: true,
              mawb_number: true,
              flight_number: true,
              flight_date: true,
              origin_airport_id: true,
              dest_airport_id: true,
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
            },
          },
          milestones: {
            where: { deleted_at: null },
            orderBy: { created_at: 'asc' },
            select: {
              milestone: true,
              planned_date: true,
              actual_date: true,
              notes: true,
            },
          },
        },
      }),
    );

    // Same 404 for missing / wrong tenant — do not leak existence
    if (!job) {
      throw new NotFoundException('Shipment not found.');
    }

    const [ports, airports, vessel] = await this.prisma.runWithTenant(tenant.id, async (tx) => {
      const portIds = [job.origin_port_id, job.dest_port_id].filter(Boolean) as string[];
      const airportIds = [
        job.air_details?.origin_airport_id,
        job.air_details?.dest_airport_id,
      ].filter(Boolean) as string[];

      return Promise.all([
        portIds.length
          ? tx.port.findMany({
              where: { tenant_id: tenant.id, id: { in: portIds }, deleted_at: null },
              select: { id: true, name: true, un_locode: true, country_code: true },
            })
          : [],
        airportIds.length
          ? tx.airport.findMany({
              where: { tenant_id: tenant.id, id: { in: airportIds }, deleted_at: null },
              select: { id: true, name: true, iata_code: true, country_code: true },
            })
          : [],
        job.sea_fcl_details?.vessel_id
          ? tx.vessel.findFirst({
              where: {
                tenant_id: tenant.id,
                id: job.sea_fcl_details.vessel_id,
                deleted_at: null,
              },
              select: { name: true, imo_number: true },
            })
          : null,
      ]);
    });

    const portMap = new Map(ports.map((p) => [p.id, p]));
    const airportMap = new Map(airports.map((a) => [a.id, a]));

    const originPort = job.origin_port_id ? portMap.get(job.origin_port_id) : null;
    const destPort = job.dest_port_id ? portMap.get(job.dest_port_id) : null;
    const originAirport = job.air_details?.origin_airport_id
      ? airportMap.get(job.air_details.origin_airport_id)
      : null;
    const destAirport = job.air_details?.dest_airport_id
      ? airportMap.get(job.air_details.dest_airport_id)
      : null;

    return {
      success: true,
      data: {
        branding: {
          tenant_name: tenant.display_name ?? tenant.name,
          logo_url: tenant.logo_url,
          primary_color: tenant.primary_color,
          website: tenant.website,
        },
        shipment: {
          job_number: job.job_number,
          job_type: job.job_type,
          status: job.status,
          etd: job.etd ?? job.sea_fcl_details?.etd ?? null,
          eta: job.eta ?? job.sea_fcl_details?.eta ?? null,
          commodity: job.commodity,
          pieces: job.pieces,
          gross_weight: job.gross_weight,
          origin: originPort
            ? { name: originPort.name, code: originPort.un_locode, country_code: originPort.country_code }
            : originAirport
              ? {
                  name: originAirport.name,
                  code: originAirport.iata_code,
                  country_code: originAirport.country_code,
                }
              : null,
          destination: destPort
            ? { name: destPort.name, code: destPort.un_locode, country_code: destPort.country_code }
            : destAirport
              ? {
                  name: destAirport.name,
                  code: destAirport.iata_code,
                  country_code: destAirport.country_code,
                }
              : null,
          references: {
            hawb_number: job.air_details?.hawb_number ?? null,
            mawb_number: job.air_details?.mawb_number ?? null,
            hbl_number: job.sea_fcl_details?.hbl_number ?? null,
            mbl_number: job.sea_fcl_details?.mbl_number ?? null,
            booking_number: job.sea_fcl_details?.booking_number ?? null,
            flight_number: job.air_details?.flight_number ?? null,
            voyage_number: job.sea_fcl_details?.voyage_number ?? null,
            vessel_name: vessel?.name ?? null,
          },
          // Intentionally omitted: charges, GP, costs, internal notes, party PII
          milestones: job.milestones.map((m) => ({
            milestone: m.milestone,
            planned_date: m.planned_date,
            actual_date: m.actual_date,
            notes: m.notes,
            is_completed: Boolean(m.actual_date),
          })),
        },
      },
    };
  }

  async embedConfig(tenantSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug: tenantSlug, deleted_at: null, is_active: true },
      select: {
        slug: true,
        name: true,
        display_name: true,
        logo_url: true,
        primary_color: true,
        website: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    return {
      success: true,
      data: {
        tenant_slug: tenant.slug,
        tenant_name: tenant.display_name ?? tenant.name,
        logo_url: tenant.logo_url,
        primary_color: tenant.primary_color ?? '#0B3D5C',
        website: tenant.website,
        track_endpoint: '/track',
        placeholder: 'Enter job number, BL, or AWB',
      },
    };
  }
}
