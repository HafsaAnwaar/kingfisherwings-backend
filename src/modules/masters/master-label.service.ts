import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export type PlaceLabel = {
  id: string;
  code: string;
  name: string;
  country_code?: string | null;
};

export type NamedLabel = {
  id: string;
  code?: string | null;
  name: string;
};

export type PartyBillTo = {
  id: string;
  name: string;
  code?: string | null;
  vat_number?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  primary_contact?: {
    name: string;
    phone?: string | null;
    email?: string | null;
  } | null;
};

export type ShipmentSummary = {
  bl_awb: string | null;
  vessel_flight: string | null;
  pol: PlaceLabel | null;
  pod: PlaceLabel | null;
  container_numbers: string[];
  etd: string | Date | null;
  eta: string | Date | null;
  commodity: string | null;
  gross_weight: number | null;
  volume_cbm: number | null;
  mbl_number?: string | null;
  hbl_number?: string | null;
  mawb_number?: string | null;
  hawb_number?: string | null;
  vessel_name?: string | null;
  voyage_number?: string | null;
  flight_number?: string | null;
};

function uniq(ids: Array<string | null | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function toMap<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row]));
}

@Injectable()
export class MasterLabelService {
  constructor(private readonly prisma: PrismaService) {}

  async resolvePorts(
    tenantId: string,
    ids: Array<string | null | undefined>,
    tx?: Prisma.TransactionClient,
  ): Promise<Map<string, PlaceLabel>> {
    const unique = uniq(ids);
    if (!unique.length) return new Map();
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.port.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: {
          id: true,
          un_locode: true,
          name: true,
          country_code: true,
        },
      });
      return new Map(
        rows.map((row) => [
          row.id,
          {
            id: row.id,
            code: row.un_locode,
            name: row.name,
            country_code: row.country_code,
          },
        ]),
      );
    };
    return tx ? run(tx) : this.prisma.runWithTenant(tenantId, run);
  }

  async resolveAirports(
    tenantId: string,
    ids: Array<string | null | undefined>,
    tx?: Prisma.TransactionClient,
  ): Promise<Map<string, PlaceLabel>> {
    const unique = uniq(ids);
    if (!unique.length) return new Map();
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.airport.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: {
          id: true,
          iata_code: true,
          name: true,
          country_code: true,
        },
      });
      return new Map(
        rows.map((row) => [
          row.id,
          {
            id: row.id,
            code: row.iata_code,
            name: row.name,
            country_code: row.country_code,
          },
        ]),
      );
    };
    return tx ? run(tx) : this.prisma.runWithTenant(tenantId, run);
  }

  async resolveVessels(
    tenantId: string,
    ids: Array<string | null | undefined>,
    tx?: Prisma.TransactionClient,
  ): Promise<Map<string, NamedLabel>> {
    const unique = uniq(ids);
    if (!unique.length) return new Map();
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.vessel.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: { id: true, name: true, imo_number: true },
      });
      return new Map(
        rows.map((row) => [
          row.id,
          { id: row.id, name: row.name, code: row.imo_number },
        ]),
      );
    };
    return tx ? run(tx) : this.prisma.runWithTenant(tenantId, run);
  }

  async resolveShippingLines(
    tenantId: string,
    ids: Array<string | null | undefined>,
    tx?: Prisma.TransactionClient,
  ): Promise<Map<string, NamedLabel>> {
    const unique = uniq(ids);
    if (!unique.length) return new Map();
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.shippingLine.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: { id: true, name: true, scac_code: true },
      });
      return new Map(
        rows.map((row) => [
          row.id,
          { id: row.id, name: row.name, code: row.scac_code },
        ]),
      );
    };
    return tx ? run(tx) : this.prisma.runWithTenant(tenantId, run);
  }

  async resolveAirlines(
    tenantId: string,
    ids: Array<string | null | undefined>,
    tx?: Prisma.TransactionClient,
  ): Promise<Map<string, NamedLabel>> {
    const unique = uniq(ids);
    if (!unique.length) return new Map();
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.airline.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: { id: true, name: true, iata_code: true },
      });
      return new Map(
        rows.map((row) => [
          row.id,
          { id: row.id, name: row.name, code: row.iata_code },
        ]),
      );
    };
    return tx ? run(tx) : this.prisma.runWithTenant(tenantId, run);
  }

  async resolveContainerTypes(
    tenantId: string,
    ids: Array<string | null | undefined>,
    tx?: Prisma.TransactionClient,
  ): Promise<Map<string, NamedLabel>> {
    const unique = uniq(ids);
    if (!unique.length) return new Map();
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.containerType.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: { id: true, code: true, name: true },
      });
      return new Map(
        rows.map((row) => [
          row.id,
          { id: row.id, code: row.code, name: row.name },
        ]),
      );
    };
    return tx ? run(tx) : this.prisma.runWithTenant(tenantId, run);
  }

  async resolveChargeCodes(
    tenantId: string,
    ids: Array<string | null | undefined>,
    tx?: Prisma.TransactionClient,
  ): Promise<Map<string, NamedLabel & { unit?: string | null }>> {
    const unique = uniq(ids);
    if (!unique.length) return new Map();
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.chargeCode.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: { id: true, code: true, description: true, unit: true },
      });
      return new Map(
        rows.map((row) => [
          row.id,
          {
            id: row.id,
            code: row.code,
            name: row.description,
            unit: row.unit,
          },
        ]),
      );
    };
    return tx ? run(tx) : this.prisma.runWithTenant(tenantId, run);
  }

  async resolveTaxRates(
    tenantId: string,
    ids: Array<string | null | undefined>,
    tx?: Prisma.TransactionClient,
  ): Promise<Map<string, { id: string; code: string; rate: number }>> {
    const unique = uniq(ids);
    if (!unique.length) return new Map();
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.taxRate.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: { id: true, code: true, rate: true },
      });
      return new Map(
        rows.map((row) => [
          row.id,
          { id: row.id, code: row.code, rate: Number(row.rate) },
        ]),
      );
    };
    return tx ? run(tx) : this.prisma.runWithTenant(tenantId, run);
  }

  async resolvePartiesWithPrimaryContact(
    tenantId: string,
    ids: Array<string | null | undefined>,
    tx?: Prisma.TransactionClient,
  ): Promise<Map<string, PartyBillTo>> {
    const unique = uniq(ids);
    if (!unique.length) return new Map();
    const run = async (client: Prisma.TransactionClient) => {
      const rows = await client.party.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: {
          id: true,
          name: true,
          code: true,
          vat_number: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          contacts: {
            where: { deleted_at: null },
            orderBy: [{ is_primary: "desc" }, { created_at: "asc" }],
            take: 1,
            select: {
              name: true,
              phone: true,
              mobile: true,
              email: true,
            },
          },
        },
      });
      return new Map(
        rows.map((row) => {
          const contact = row.contacts[0];
          const address = [row.address, row.city].filter(Boolean).join(", ");
          return [
            row.id,
            {
              id: row.id,
              name: row.name,
              code: row.code,
              vat_number: row.vat_number,
              phone: row.phone,
              email: row.email,
              address: address || row.address || null,
              primary_contact: contact
                ? {
                    name: contact.name,
                    phone: contact.phone ?? contact.mobile ?? null,
                    email: contact.email ?? null,
                  }
                : null,
            },
          ];
        }),
      );
    };
    return tx ? run(tx) : this.prisma.runWithTenant(tenantId, run);
  }

  /**
   * Build PDF shipment summary from a job row that already includes
   * air_details / sea_fcl_details(+containers) / sea_lcl_details.
   */
  async buildJobShipmentSummary(
    tenantId: string,
    job: {
      origin_port_id?: string | null;
      dest_port_id?: string | null;
      commodity?: string | null;
      gross_weight?: unknown;
      volume_cbm?: unknown;
      etd?: Date | string | null;
      eta?: Date | string | null;
      air_details?: {
        airline_id?: string | null;
        origin_airport_id?: string | null;
        dest_airport_id?: string | null;
        mawb_number?: string | null;
        hawb_number?: string | null;
        flight_number?: string | null;
        flight_date?: Date | string | null;
      } | null;
      sea_fcl_details?: {
        shipping_line_id?: string | null;
        vessel_id?: string | null;
        voyage_number?: string | null;
        mbl_number?: string | null;
        hbl_number?: string | null;
        port_of_loading_id?: string | null;
        port_of_discharge_id?: string | null;
        etd?: Date | string | null;
        eta?: Date | string | null;
        containers?: Array<{ container_number?: string | null }>;
      } | null;
      sea_lcl_details?: {
        shipping_line_id?: string | null;
        vessel_id?: string | null;
        voyage_number?: string | null;
        mbl_number?: string | null;
        hbl_number?: string | null;
        port_of_loading_id?: string | null;
        port_of_discharge_id?: string | null;
        etd?: Date | string | null;
        eta?: Date | string | null;
      } | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<ShipmentSummary> {
    const sea = job.sea_fcl_details ?? job.sea_lcl_details ?? null;
    const air = job.air_details ?? null;

    const portIds = [
      job.origin_port_id,
      job.dest_port_id,
      sea?.port_of_loading_id,
      sea?.port_of_discharge_id,
    ];
    const airportIds = [air?.origin_airport_id, air?.dest_airport_id];
    const vesselIds = [sea?.vessel_id];

    const [ports, airports, vessels] = await Promise.all([
      this.resolvePorts(tenantId, portIds, tx),
      this.resolveAirports(tenantId, airportIds, tx),
      this.resolveVessels(tenantId, vesselIds, tx),
    ]);

    const polId = sea?.port_of_loading_id ?? job.origin_port_id ?? null;
    const podId = sea?.port_of_discharge_id ?? job.dest_port_id ?? null;
    const pol =
      (polId && ports.get(polId)) ||
      (air?.origin_airport_id
        ? airports.get(air.origin_airport_id) ?? null
        : null);
    const pod =
      (podId && ports.get(podId)) ||
      (air?.dest_airport_id
        ? airports.get(air.dest_airport_id) ?? null
        : null);

    const vessel = sea?.vessel_id ? vessels.get(sea.vessel_id) : undefined;
    const vesselName = vessel?.name ?? null;
    const voyage = sea?.voyage_number ?? null;
    const flight = air?.flight_number ?? null;

    const vesselFlight = vesselName
      ? voyage
        ? `${vesselName} / ${voyage}`
        : vesselName
      : flight;

    const blAwb =
      sea?.mbl_number ||
      sea?.hbl_number ||
      air?.mawb_number ||
      air?.hawb_number ||
      null;

    const containerNumbers = (job.sea_fcl_details?.containers ?? [])
      .map((c) => c.container_number)
      .filter((n): n is string => Boolean(n));

    return {
      bl_awb: blAwb,
      vessel_flight: vesselFlight ?? null,
      pol: pol ?? null,
      pod: pod ?? null,
      container_numbers: containerNumbers,
      etd: sea?.etd ?? air?.flight_date ?? job.etd ?? null,
      eta: sea?.eta ?? job.eta ?? null,
      commodity: job.commodity ?? null,
      gross_weight:
        job.gross_weight != null ? Number(job.gross_weight) : null,
      volume_cbm: job.volume_cbm != null ? Number(job.volume_cbm) : null,
      mbl_number: sea?.mbl_number ?? null,
      hbl_number: sea?.hbl_number ?? null,
      mawb_number: air?.mawb_number ?? null,
      hawb_number: air?.hawb_number ?? null,
      vessel_name: vesselName,
      voyage_number: voyage,
      flight_number: flight,
    };
  }
}

export function lineTotal(amount: unknown, taxAmount: unknown): number {
  return Number(amount ?? 0) + Number(taxAmount ?? 0);
}

export function sumLineTotals(
  lines: Array<{ amount?: unknown; tax_amount?: unknown; is_cost?: boolean }>,
  revenueOnly = false,
): { subtotal: number; tax_total: number; total_amount: number } {
  const filtered = revenueOnly
    ? lines.filter((line) => !line.is_cost)
    : lines;
  const subtotal = filtered.reduce(
    (sum, line) => sum + Number(line.amount ?? 0),
    0,
  );
  const tax_total = filtered.reduce(
    (sum, line) => sum + Number(line.tax_amount ?? 0),
    0,
  );
  return {
    subtotal,
    tax_total,
    total_amount: subtotal + tax_total,
  };
}

/** Re-export for callers that batch-map by id. */
export { toMap, uniq };
