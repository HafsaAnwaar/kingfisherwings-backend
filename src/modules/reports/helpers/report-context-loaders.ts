import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import {
  loadDefaultBank,
  loadReportBranding,
} from "./report-branding.helper";
import { ReportBranding } from "../types/report.types";
import { ReportBankDetails } from "./report-branding.helper";

type Params = Record<string, unknown>;

function reqId(
  parameters: Params,
  context: Record<string, unknown> | undefined,
  key: string,
  label: string,
): string {
  const v = String(parameters[key] ?? context?.[key] ?? "").trim();
  if (!v) {
    throw new BadRequestException(`${label} is required`);
  }
  return v;
}

/**
 * Named context loaders for catalogue packs (FE contract names).
 * Strict 4xx — never invent demo company / Fresa sample names.
 */
@Injectable()
export class ReportContextLoaders {
  constructor(private readonly prisma: PrismaService) {}

  async branding(tenantId: string): Promise<{
    branding: ReportBranding;
    bank?: ReportBankDetails;
  }> {
    const [branding, bank] = await Promise.all([
      loadReportBranding(this.prisma, tenantId),
      loadDefaultBank(this.prisma, tenantId),
    ]);
    return { branding, bank };
  }

  async loadInvoiceReportContext(
    tenantId: string,
    parameters: Params,
    context?: Params,
  ) {
    const invoiceId = reqId(parameters, context, "invoice_id", "invoice_id");
    const invoice = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findFirst({
        where: { id: invoiceId, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: {
            where: { deleted_at: null },
            orderBy: { sort_order: "asc" },
          },
          party: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              phone: true,
              email: true,
              vat_number: true,
            },
          },
          job: {
            select: {
              id: true,
              job_number: true,
              job_type: true,
              commodity: true,
            },
          },
        },
      }),
    );
    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }
    const { branding, bank } = await this.branding(tenantId);
    return { invoice, branding, bank };
  }

  async loadQuotationReportContext(
    tenantId: string,
    parameters: Params,
    context?: Params,
  ) {
    const quotationId = reqId(
      parameters,
      context,
      "quotation_id",
      "quotation_id",
    );
    const quotation = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({
        where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: { orderBy: { sort_order: "asc" }, take: 200 },
        },
      }),
    );
    if (!quotation) {
      throw new NotFoundException("Quotation not found");
    }
    const customer = quotation.customer_id
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.party.findFirst({
            where: {
              id: quotation.customer_id,
              tenant_id: tenantId,
              deleted_at: null,
            },
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              phone: true,
              email: true,
              vat_number: true,
            },
          }),
        )
      : null;
    const { branding, bank } = await this.branding(tenantId);
    return { quotation, customer, branding, bank };
  }

  async loadJobDocumentContext(
    tenantId: string,
    parameters: Params,
    context?: Params,
  ) {
    const jobId = reqId(parameters, context, "job_id", "job_id");
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: {
          sea_fcl_details: true,
          sea_lcl_details: true,
          nvocc_details: true,
          air_details: true,
          containers_job: {
            where: { deleted_at: null },
            orderBy: [{ line_no: "asc" }, { created_at: "asc" }],
            take: 50,
          },
          charges: {
            where: { deleted_at: null, is_billable: true },
            orderBy: { created_at: "asc" },
            take: 100,
          },
        },
      }),
    );
    if (!job) {
      throw new NotFoundException("Job not found");
    }

    const partyIds = [
      job.shipper_id,
      job.consignee_id,
      job.billing_party_id,
      job.agent_id,
      job.overseas_agent_id,
    ].filter(Boolean) as string[];

    const parties = partyIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.party.findMany({
            where: {
              tenant_id: tenantId,
              id: { in: partyIds },
              deleted_at: null,
            },
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              phone: true,
              email: true,
              vat_number: true,
            },
          }),
        )
      : [];
    const byId = new Map(parties.map((p) => [p.id, p]));

    const sea = job.sea_fcl_details ?? job.sea_lcl_details;
    const portIds = [
      job.origin_port_id,
      job.dest_port_id,
      sea?.port_of_loading_id,
      sea?.port_of_discharge_id,
    ].filter(Boolean) as string[];
    const ports = portIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.port.findMany({
            where: { id: { in: portIds }, deleted_at: null },
            select: {
              id: true,
              name: true,
              un_locode: true,
              country_code: true,
            },
          }),
        )
      : [];
    const portById = new Map(ports.map((p) => [p.id, p]));

    let vesselName = job.vessel_name ?? null;
    const vesselId = sea?.vessel_id;
    if (!vesselName && vesselId) {
      const vessel = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.vessel.findFirst({
          where: { id: vesselId, tenant_id: tenantId },
          select: { name: true },
        }),
      );
      vesselName = vessel?.name ?? null;
    }

    const { branding, bank } = await this.branding(tenantId);

    const polId = sea?.port_of_loading_id || job.origin_port_id;
    const podId = sea?.port_of_discharge_id || job.dest_port_id;

    const result = {
      job,
      shipper: job.shipper_id ? byId.get(job.shipper_id) ?? null : null,
      consignee: job.consignee_id ? byId.get(job.consignee_id) ?? null : null,
      notify: job.billing_party_id
        ? byId.get(job.billing_party_id) ?? null
        : null,
      agent: job.agent_id ? byId.get(job.agent_id) ?? null : null,
      origin_port: polId ? portById.get(polId) ?? null : null,
      dest_port: podId ? portById.get(podId) ?? null : null,
      hbl_number:
        sea?.hbl_number ??
        job.nvocc_details?.hbl_number ??
        job.air_details?.hawb_number ??
        null,
      mbl_number:
        sea?.mbl_number ??
        job.nvocc_details?.mbl_number ??
        job.air_details?.mawb_number ??
        null,
      hawb_number: job.air_details?.hawb_number ?? null,
      mawb_number: job.air_details?.mawb_number ?? null,
      voyage_number: sea?.voyage_number ?? job.voyage_number ?? null,
      vessel_name: vesselName,
      flight_number: job.air_details?.flight_number ?? null,
      origin_airport: null as {
        id: string;
        iata_code: string;
        name: string;
      } | null,
      dest_airport: null as {
        id: string;
        iata_code: string;
        name: string;
      } | null,
      containers: job.containers_job ?? [],
      charges: job.charges ?? [],
      branding,
      bank,
    };

    const airAirportIds = [
      job.air_details?.origin_airport_id,
      job.air_details?.dest_airport_id,
    ].filter(Boolean) as string[];
    if (airAirportIds.length) {
      const airports = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.airport.findMany({
          where: { id: { in: airAirportIds }, deleted_at: null },
          select: { id: true, iata_code: true, name: true },
        }),
      );
      const airMap = new Map(airports.map((a) => [a.id, a]));
      result.origin_airport = job.air_details?.origin_airport_id
        ? airMap.get(job.air_details.origin_airport_id) ?? null
        : null;
      result.dest_airport = job.air_details?.dest_airport_id
        ? airMap.get(job.air_details.dest_airport_id) ?? null
        : null;
    }
    return result;
  }

  async loadShipmentReportContext(
    tenantId: string,
    parameters: Params,
    context?: Params,
  ) {
    const shipmentId = reqId(
      parameters,
      context,
      "shipment_id",
      "shipment_id",
    );
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, job_id: true, shipment_number: true },
      }),
    );
    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }
    if (!shipment.job_id) {
      throw new BadRequestException(
        "Shipment is not linked to a job — cannot load document context",
      );
    }
    const jobCtx = await this.loadJobDocumentContext(
      tenantId,
      { job_id: shipment.job_id },
      {},
    );
    return { shipment, ...jobCtx };
  }

  /**
   * Ops list filters passthrough — callers still use OpsListDataPackService
   * for rows; this validates date/branch filters and returns branding.
   */
  async runOpsListQueryMeta(tenantId: string, parameters: Params) {
    const { branding } = await this.branding(tenantId);
    return {
      branding,
      filters: {
        from_date: parameters.from_date
          ? String(parameters.from_date)
          : undefined,
        to_date: parameters.to_date ? String(parameters.to_date) : undefined,
        branch_id: parameters.branch_id
          ? String(parameters.branch_id)
          : undefined,
        status: parameters.status ? String(parameters.status) : undefined,
        template_code: parameters.template_code
          ? String(parameters.template_code)
          : undefined,
        title: parameters.title ? String(parameters.title) : undefined,
      },
    };
  }

  /** WMS document + lines — requires one of asn_id / grn_id / gdo_id. */
  async loadWmsDocumentContext(
    tenantId: string,
    parameters: Params,
    context?: Params,
  ) {
    const asnId = String(parameters.asn_id ?? context?.asn_id ?? "").trim();
    const grnId = String(parameters.grn_id ?? context?.grn_id ?? "").trim();
    const gdoId = String(parameters.gdo_id ?? context?.gdo_id ?? "").trim();
    if (!asnId && !grnId && !gdoId) {
      throw new BadRequestException(
        "asn_id, grn_id, or gdo_id is required",
      );
    }
    const { branding, bank } = await this.branding(tenantId);

    if (asnId) {
      const asn = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.wmsAsn.findFirst({
          where: { id: asnId, tenant_id: tenantId, deleted_at: null },
          include: {
            warehouse: { select: { name: true, code: true } },
            lines: {
              take: 200,
              include: { item: { select: { code: true, name: true } } },
            },
          },
        }),
      );
      if (!asn) throw new NotFoundException("ASN not found");
      return { kind: "asn" as const, document: asn, branding, bank };
    }
    if (grnId) {
      const grn = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.wmsGrn.findFirst({
          where: { id: grnId, tenant_id: tenantId, deleted_at: null },
          include: {
            warehouse: { select: { name: true, code: true } },
            lines: {
              take: 200,
              include: { item: { select: { code: true, name: true } } },
            },
          },
        }),
      );
      if (!grn) throw new NotFoundException("GRN not found");
      return { kind: "grn" as const, document: grn, branding, bank };
    }
    const gdo = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.wmsGdo.findFirst({
        where: { id: gdoId, tenant_id: tenantId, deleted_at: null },
        include: {
          warehouse: { select: { name: true, code: true } },
          lines: {
            take: 200,
            include: { item: { select: { code: true, name: true } } },
          },
        },
      }),
    );
    if (!gdo) throw new NotFoundException("GDO not found");
    return { kind: "gdo" as const, document: gdo, branding, bank };
  }

  /** GL / finance voucher context — requires voucher_id. */
  async loadGlVoucherContext(
    tenantId: string,
    parameters: Params,
    context?: Params,
  ) {
    const voucherId = String(
      parameters.voucher_id ?? context?.voucher_id ?? "",
    ).trim();
    if (!voucherId) {
      throw new BadRequestException("voucher_id is required");
    }
    const { branding, bank } = await this.branding(tenantId);
    const voucher = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucher.findFirst({
        where: { id: voucherId, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: {
            where: { deleted_at: null },
            orderBy: { line_no: "asc" },
            take: 200,
          },
        },
      }),
    );
    if (!voucher) throw new NotFoundException("Voucher not found");
    return { document: voucher, branding, bank };
  }
}
