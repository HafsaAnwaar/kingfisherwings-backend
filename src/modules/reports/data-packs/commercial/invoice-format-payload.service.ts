import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { amountInWords } from "../../../../common/utils/amount-in-words.util";
import {
  loadDefaultBank,
  loadReportBranding,
} from "../../helpers/report-branding.helper";
import { InvoiceFormatPayload } from "./invoice-format-payload.types";

function num(v: unknown): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function d10(v?: Date | null): string | undefined {
  return v ? v.toISOString().slice(0, 10) : undefined;
}

@Injectable()
export class InvoiceFormatPayloadService {
  constructor(private readonly prisma: PrismaService) {}

  async build(
    tenantId: string,
    invoiceId: string,
    options?: { format_key?: string; template_code?: string },
  ): Promise<InvoiceFormatPayload> {
    const format_key =
      options?.format_key ?? "commercial.invoice_tax_india_1";
    const template_code =
      options?.template_code ?? "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA";

    const branding = await loadReportBranding(this.prisma, tenantId);
    const bank = await loadDefaultBank(this.prisma, tenantId);

    const invoice = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findFirst({
        where: { id: invoiceId, tenant_id: tenantId, deleted_at: null },
        include: {
          party: {
            select: {
              name: true,
              vat_number: true,
              phone: true,
              address: true,
              city: true,
              country_code: true,
            },
          },
          company: {
            select: {
              name: true,
              legal_name: true,
              vat_number: true,
              address: true,
              city: true,
              country_code: true,
            },
          },
          lines: {
            where: { deleted_at: null },
            orderBy: { sort_order: "asc" },
            select: {
              description: true,
              quantity: true,
              unit_price: true,
              amount: true,
              tax_rate: true,
              tax_amount: true,
              is_taxable: true,
              charge_code_id: true,
            },
          },
          job: {
            select: {
              job_number: true,
              shipper_id: true,
              consignee_id: true,
              origin_port_id: true,
              dest_port_id: true,
              etd: true,
              eta: true,
              incoterms: true,
              sea_fcl_details: {
                select: {
                  mbl_number: true,
                  hbl_number: true,
                  voyage_number: true,
                  vessel_id: true,
                  port_of_loading_id: true,
                  port_of_discharge_id: true,
                  place_of_receipt: true,
                  place_of_delivery: true,
                  etd: true,
                  eta: true,
                  containers: {
                    where: { deleted_at: null },
                    select: {
                      container_number: true,
                      container_type_id: true,
                      gross_weight: true,
                      cbm: true,
                    },
                  },
                },
              },
              sea_lcl_details: {
                select: {
                  mbl_number: true,
                  hbl_number: true,
                  voyage_number: true,
                  vessel_id: true,
                  port_of_loading_id: true,
                  port_of_discharge_id: true,
                  place_of_receipt: true,
                  place_of_delivery: true,
                  etd: true,
                  eta: true,
                },
              },
              air_details: {
                select: {
                  mawb_number: true,
                  hawb_number: true,
                  flight_number: true,
                  flight_date: true,
                  origin_airport_id: true,
                  dest_airport_id: true,
                },
              },
            },
          },
        },
      }),
    );

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const job = invoice.job;
    const partyIds = [job?.shipper_id, job?.consignee_id].filter(
      Boolean,
    ) as string[];
    const portIds = [
      job?.origin_port_id,
      job?.dest_port_id,
      job?.sea_fcl_details?.port_of_loading_id,
      job?.sea_fcl_details?.port_of_discharge_id,
      job?.sea_lcl_details?.port_of_loading_id,
      job?.sea_lcl_details?.port_of_discharge_id,
    ].filter(Boolean) as string[];
    const vesselIds = [
      job?.sea_fcl_details?.vessel_id,
      job?.sea_lcl_details?.vessel_id,
    ].filter(Boolean) as string[];
    const airportIds = [
      job?.air_details?.origin_airport_id,
      job?.air_details?.dest_airport_id,
    ].filter(Boolean) as string[];
    const containerTypeIds = (
      job?.sea_fcl_details?.containers ?? []
    ).map((c) => c.container_type_id);

    const chargeCodeIds = invoice.lines
      .map((l) => l.charge_code_id)
      .filter(Boolean) as string[];

    const [parties, ports, vessels, airports, containerTypes, chargeCodes] =
      await this.prisma.runWithTenant(tenantId, async (tx) =>
        Promise.all([
          partyIds.length
            ? tx.party.findMany({
                where: { tenant_id: tenantId, id: { in: partyIds } },
                select: { id: true, name: true },
              })
            : [],
          portIds.length
            ? tx.port.findMany({
                where: { tenant_id: tenantId, id: { in: portIds } },
                select: { id: true, un_locode: true },
              })
            : [],
          vesselIds.length
            ? tx.vessel.findMany({
                where: { tenant_id: tenantId, id: { in: vesselIds } },
                select: { id: true, name: true },
              })
            : [],
          airportIds.length
            ? tx.airport.findMany({
                where: { tenant_id: tenantId, id: { in: airportIds } },
                select: { id: true, iata_code: true },
              })
            : [],
          containerTypeIds.length
            ? tx.containerType.findMany({
                where: {
                  tenant_id: tenantId,
                  id: { in: containerTypeIds },
                },
                select: { id: true, code: true },
              })
            : [],
          chargeCodeIds.length
            ? tx.chargeCode.findMany({
                where: { tenant_id: tenantId, id: { in: chargeCodeIds } },
                select: { id: true, code: true },
              })
            : [],
        ]),
      );

    const partyMap = new Map(parties.map((p) => [p.id, p.name]));
    const portMap = new Map(ports.map((p) => [p.id, p.un_locode]));
    const vesselMap = new Map(vessels.map((v) => [v.id, v.name]));
    const airportMap = new Map(airports.map((a) => [a.id, a.iata_code]));
    const ctypeMap = new Map(containerTypes.map((c) => [c.id, c.code]));
    const chargeMap = new Map(chargeCodes.map((c) => [c.id, c.code]));

    const companyName =
      invoice.company?.legal_name ||
      invoice.company?.name ||
      branding.company_name;
    const companyAddress = [
      invoice.company?.address,
      invoice.company?.city,
      invoice.company?.country_code,
    ].filter(Boolean) as string[];
    if (!companyAddress.length && branding.address_lines?.length) {
      companyAddress.push(...branding.address_lines);
    } else if (!companyAddress.length && branding.address) {
      companyAddress.push(branding.address);
    }

    const billAddress = [
      invoice.party?.address,
      invoice.party?.city,
      invoice.party?.country_code,
    ].filter(Boolean) as string[];

    const fx = num(invoice.exchange_rate) || 1;
    const currency = invoice.currency_code;

    // Without party/company state codes we cannot split CGST/SGST reliably.
    // Map single line tax_amount → IGST until line-level GST components exist.
    const lines: InvoiceFormatPayload["lines"] = invoice.lines.map((l) => {
      const qty = num(l.quantity) || 1;
      const unit = num(l.unit_price);
      const amount = num(l.amount);
      const tax = num(l.tax_amount);
      const taxable = l.is_taxable ? amount : 0;
      const nonTax = l.is_taxable ? 0 : amount;
      const rate = num(l.tax_rate);
      const sac =
        (l.charge_code_id ? chargeMap.get(l.charge_code_id) : undefined) ||
        "";
      return {
        description: l.description,
        sac_hsn: sac,
        qty,
        amount_per_qty: round2(unit),
        currency,
        exchange_rate: fx,
        fcy_amount: round2(amount),
        taxable_amount: round2(taxable),
        non_taxable_amount: round2(nonTax),
        sgst_rate: 0,
        sgst_amount: 0,
        cgst_rate: 0,
        cgst_amount: 0,
        igst_rate: rate,
        igst_amount: round2(tax),
        total_inr: round2(amount + tax),
      };
    });

    const taxable = round2(lines.reduce((s, l) => s + l.taxable_amount, 0));
    const non_taxable = round2(
      lines.reduce((s, l) => s + l.non_taxable_amount, 0),
    );
    const sgst = 0;
    const cgst = 0;
    const igst = round2(lines.reduce((s, l) => s + (l.igst_amount ?? 0), 0));
    const grand = round2(num(invoice.total_amount));

    const sea = job?.sea_fcl_details ?? job?.sea_lcl_details;
    const air = job?.air_details;
    const vesselName = sea?.vessel_id
      ? vesselMap.get(sea.vessel_id)
      : undefined;
    const pol =
      (sea?.port_of_loading_id
        ? portMap.get(sea.port_of_loading_id)
        : undefined) ||
      (job?.origin_port_id ? portMap.get(job.origin_port_id) : undefined) ||
      (air?.origin_airport_id
        ? airportMap.get(air.origin_airport_id)
        : undefined) ||
      "";
    const pod =
      (sea?.port_of_discharge_id
        ? portMap.get(sea.port_of_discharge_id)
        : undefined) ||
      (job?.dest_port_id ? portMap.get(job.dest_port_id) : undefined) ||
      (air?.dest_airport_id
        ? airportMap.get(air.dest_airport_id)
        : undefined) ||
      "";

    const containers: InvoiceFormatPayload["containers"] = (
      job?.sea_fcl_details?.containers ?? []
    ).map((c) => ({
      container_no: c.container_number ?? "",
      type: ctypeMap.get(c.container_type_id),
      gross_weight:
        c.gross_weight != null ? String(c.gross_weight) : undefined,
      volume: c.cbm != null ? String(c.cbm) : undefined,
    }));

    const shipment = job
      ? {
          shipper: job.shipper_id
            ? partyMap.get(job.shipper_id)
            : undefined,
          consignee: job.consignee_id
            ? partyMap.get(job.consignee_id)
            : undefined,
          job_no: job.job_number,
          shipment_no: job.job_number,
          mbl_mawb: sea?.mbl_number || air?.mawb_number || undefined,
          hbl_hawb: sea?.hbl_number || air?.hawb_number || undefined,
          place_of_receipt: sea?.place_of_receipt || undefined,
          por: sea?.place_of_receipt || pol,
          pol,
          pod,
          place_of_delivery: sea?.place_of_delivery || pod,
          vessel_voyage: [vesselName, sea?.voyage_number, air?.flight_number]
            .filter(Boolean)
            .join(" / "),
          etd: d10(sea?.etd || job.etd || air?.flight_date),
          eta: d10(sea?.eta || job.eta),
          inco_terms: job.incoterms ?? undefined,
        }
      : undefined;

    return {
      format_key,
      template_code,
      company: {
        name: companyName,
        address_lines: companyAddress,
        logo_url: branding.logo_url ?? undefined,
        website: undefined,
        // FRESA: company GSTIN mapped from vat_number
        gstin:
          invoice.company?.vat_number || branding.vat_number || undefined,
      },
      bill_to: {
        name: invoice.party?.name ?? "",
        address_lines: billAddress,
        phone: invoice.party?.phone ?? undefined,
        // FRESA: party GSTIN mapped from vat_number
        gstin:
          invoice.party_vat_number ||
          invoice.party?.vat_number ||
          undefined,
      },
      invoice: {
        number: invoice.invoice_number,
        invoice_date: invoice.invoice_date.toISOString().slice(0, 10),
        due_date: invoice.due_date?.toISOString().slice(0, 10),
        status: invoice.status,
        currency_code: currency,
        exchange_rate: fx,
        remarks: invoice.remarks ?? undefined,
        narration: invoice.internal_notes ?? undefined,
      },
      shipment,
      containers,
      lines,
      totals: {
        taxable,
        non_taxable,
        sgst,
        cgst,
        igst,
        grand_total: grand,
        amount_in_words: amountInWords(
          grand,
          currency === "INR" ? "Rupees" : currency,
        ),
        tax_buckets: [
          { label: "SGST", amount: sgst },
          { label: "CGST", amount: cgst },
          { label: "IGST (mapped from line tax_amount)", amount: igst },
        ],
      },
      terms: [
        "Payment due as per invoice due date.",
        "Subject to jurisdiction of company registered office.",
        "This is a computer-generated tax invoice.",
      ],
      bank,
      footer: {
        generated_at: new Date().toISOString(),
        timezone: "UTC",
      },
      gst_note:
        "GSTIN mapped from vat_number. Line SAC/HSN uses charge_code when present. SGST/CGST/IGST: single tax_amount is mapped to IGST until line-level GST components are stored.",
    };
  }
}
