import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, QuotationStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { QuotationsService } from "./quotations.service";
import { quotationActionFlags } from "./quotation-action-flags";
import { ChangeQuotationStatusDto } from "./dto/quotation-detail.dto";

const DETAIL_TABS = ["info", "costing", "organization", "routing"] as const;
export type QuotationDetailTab = (typeof DETAIL_TABS)[number];

type QuotationWithLines = Prisma.QuotationGetPayload<{
  include: { lines: true };
}>;

@Injectable()
export class QuotationDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotations: QuotationsService,
  ) {}

  async getDetail(tenantId: string, id: string) {
    const quote = await this.loadQuotation(tenantId, id);
    const links = await this.resolveLinks(tenantId, quote);
    const flags = quotationActionFlags(quote.status);
    return {
      success: true,
      data: {
        quotation: this.headerPayload(quote),
        links,
        actions: {
          ...flags,
          can_copy: quote.status !== "CONVERTED",
          can_change_status: true,
        },
        sections: this.buildSectionSummaries(quote),
        tabs: DETAIL_TABS,
      },
    };
  }

  async getDetailTab(tenantId: string, id: string, tab: string) {
    const normalized = tab.toLowerCase() as QuotationDetailTab;
    if (!DETAIL_TABS.includes(normalized)) {
      throw new BadRequestException(
        `Unknown tab "${tab}". Allowed: ${DETAIL_TABS.join(", ")}`,
      );
    }
    const quote = await this.loadQuotation(tenantId, id);
    if (normalized === "info") {
      return { success: true, data: this.headerPayload(quote) };
    }
    if (normalized === "costing") {
      return {
        success: true,
        data: {
          currency_code: quote.currency_code,
          exchange_rate: quote.exchange_rate,
          revenue_total: quote.revenue_total,
          cost_total: quote.cost_total,
          gp_amount: quote.gp_amount,
          gp_percent: quote.gp_percent,
          lines: quote.lines,
        },
      };
    }
    if (normalized === "organization") {
      return {
        success: true,
        data: {
          company_id: quote.company_id,
          branch_id: quote.branch_id,
          department_id: quote.department_id,
          customer_id: quote.customer_id,
          customer_address: quote.customer_address,
          salesperson_id: quote.salesperson_id,
          shipper_id: quote.shipper_id,
          consignee_id: quote.consignee_id,
          carrier_id: quote.carrier_id,
        },
      };
    }
    return {
      success: true,
      data: {
        origin_port_id: quote.origin_port_id,
        dest_port_id: quote.dest_port_id,
        por_port_id: quote.por_port_id,
        pof_port_id: quote.pof_port_id,
        place_of_receipt: quote.place_of_receipt,
        place_of_delivery: quote.place_of_delivery,
        etd: quote.etd,
        eta: quote.eta,
        vessel_name: quote.vessel_name,
        voyage_number: quote.voyage_number,
        transit_time_days: quote.transit_time_days,
        routing_notes: quote.routing_notes,
        carrier_preference: quote.carrier_preference,
      },
    };
  }

  async changeStatus(
    tenantId: string,
    id: string,
    dto: ChangeQuotationStatusDto,
    actorId?: string,
  ) {
    const quote = await this.loadQuotation(tenantId, id);
    const target = dto.status;
    if (target === quote.status) {
      return { success: true, data: quote };
    }

    switch (target) {
      case "VERIFIED":
        return {
          success: true,
          data: await this.quotations.verify(
            tenantId,
            id,
            actorId,
            dto.reason,
          ),
        };
      case "APPROVED":
        return {
          success: true,
          data: await this.quotations.markApprovedAfterVerify(
            tenantId,
            id,
            actorId,
            dto.reason,
          ),
        };
      case "SENT":
        return {
          success: true,
          data: await this.quotations.send(tenantId, id, actorId),
        };
      case "INTERNALLY_APPROVED":
        return {
          success: true,
          data: await this.quotations.approve(tenantId, id, actorId, {
            comments: dto.reason,
          }),
        };
      case "SUBMITTED":
        return {
          success: true,
          data: await this.quotations.submit(tenantId, id, actorId),
        };
      default:
        throw new BadRequestException(
          `Transition to ${target} is not supported via change-status from ${quote.status}.`,
        );
    }
  }

  copy(tenantId: string, id: string, actorId?: string) {
    return this.quotations.duplicate(tenantId, id, actorId);
  }

  private async loadQuotation(
    tenantId: string,
    id: string,
  ): Promise<QuotationWithLines> {
    const quote = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: { orderBy: { sort_order: "asc" } },
        },
      }),
    );
    if (!quote) throw new NotFoundException("Quotation not found.");
    return quote;
  }

  private headerPayload(quote: QuotationWithLines) {
    return {
      id: quote.id,
      quotation_number: quote.quotation_number,
      quotation_date: quote.quotation_date,
      status: quote.status,
      job_type: quote.job_type,
      branch_id: quote.branch_id,
      department_id: quote.department_id,
      customer_id: quote.customer_id,
      customer_address: quote.customer_address,
      origin_port_id: quote.origin_port_id,
      dest_port_id: quote.dest_port_id,
      por_port_id: quote.por_port_id,
      pof_port_id: quote.pof_port_id,
      place_of_receipt: quote.place_of_receipt,
      place_of_delivery: quote.place_of_delivery,
      valid_from: quote.valid_from,
      valid_until: quote.valid_until,
      transit_time_days: quote.transit_time_days,
      frequency: quote.frequency,
      carrier_id: quote.carrier_id,
      incoterm: quote.incoterm,
      freight_payment_type: quote.freight_payment_type,
      marks_numbers: quote.marks_numbers,
      internal_notes: quote.internal_notes,
      remarks: quote.remarks,
      etd: quote.etd,
      eta: quote.eta,
      vessel_name: quote.vessel_name,
      voyage_number: quote.voyage_number,
      source_enquiry_id: quote.source_enquiry_id,
      converted_shipment_id: quote.converted_shipment_id,
      converted_job_id: quote.converted_job_id,
    };
  }

  private buildSectionSummaries(quote: QuotationWithLines) {
    return {
      costing: { line_count: quote.lines.length },
      organization: {
        company_id: quote.company_id,
        branch_id: quote.branch_id,
        department_id: quote.department_id,
      },
      routing: {
        por_port_id: quote.por_port_id,
        pof_port_id: quote.pof_port_id,
      },
    };
  }

  private async resolveLinks(
    tenantId: string,
    quote: QuotationWithLines,
  ) {
    let enquiry: {
      id: string;
      enquiry_number: string;
      path_hint: string;
    } | null = null;
    if (quote.source_enquiry_id) {
      const row = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.enquiry.findFirst({
          where: { id: quote.source_enquiry_id!, tenant_id: tenantId },
          select: { id: true },
        }),
      );
      if (row) {
        enquiry = {
          id: row.id,
          enquiry_number: row.id.slice(0, 8).toUpperCase(),
          path_hint: `/crm/enquiries/${row.id}/detail`,
        };
      }
    }

    let shipment: {
      id: string;
      shipment_number: string;
      path_hint: string;
    } | null = null;
    const shipmentId =
      quote.converted_shipment_id ??
      (
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.shipment.findFirst({
            where: {
              tenant_id: tenantId,
              quotation_id: quote.id,
              deleted_at: null,
            },
            select: { id: true, shipment_number: true },
            orderBy: { created_at: "asc" },
          }),
        )
      )?.id;

    if (shipmentId) {
      const row = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.shipment.findFirst({
          where: { id: shipmentId, tenant_id: tenantId },
          select: { id: true, shipment_number: true },
        }),
      );
      if (row) {
        shipment = {
          id: row.id,
          shipment_number: row.shipment_number,
          path_hint: `/shipments/${row.id}/detail`,
        };
      }
    }

    const job = quote.converted_job_id
      ? {
          id: quote.converted_job_id,
          path_hint: `/jobs/${quote.converted_job_id}`,
        }
      : null;

    return { enquiry, shipment, job };
  }
}
