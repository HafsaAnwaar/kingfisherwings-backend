import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { VENDOR_ELIGIBLE_PARTY_TYPES } from "./constants/vendor-permission.constants";
import {
  PriceVendorQuoteDto,
  SendJobToVendorDto,
  VendorQuoteQueryDto,
} from "./dto/vendor-quote.dto";

@Injectable()
export class VendorQuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  async sendJobToVendor(
    tenantId: string,
    jobId: string,
    dto: SendJobToVendorDto,
    actorId?: string,
  ) {
    const vendorPartyId = this.resolveVendorPartyId(dto);
    const notes = dto.staff_notes ?? dto.notes;

    const created = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!job) throw new NotFoundException("Job not found.");

      const party = await tx.party.findFirst({
        where: {
          id: vendorPartyId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });
      if (!party) throw new NotFoundException("Vendor party not found.");
      if (
        !VENDOR_ELIGIBLE_PARTY_TYPES.includes(
          party.party_type as (typeof VENDOR_ELIGIBLE_PARTY_TYPES)[number],
        )
      ) {
        throw new BadRequestException(
          `Party type ${party.party_type} cannot receive vendor job offers.`,
        );
      }

      const existing = await tx.vendorQuote.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          vendor_party_id: vendorPartyId,
          deleted_at: null,
          status: { in: ["SENT", "PRICED"] },
        },
      });
      if (existing) {
        throw new BadRequestException(
          "An open vendor offer already exists for this job and vendor.",
        );
      }

      return tx.vendorQuote.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          vendor_party_id: vendorPartyId,
          status: "SENT",
          currency_code: dto.currency_code ?? "AED",
          staff_notes: notes,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });

    await this.notifications.notifyPartyVendorUsers(tenantId, vendorPartyId, {
      type: "VENDOR_QUOTE_SENT",
      title: "New job offer",
      message:
        "A job was sent to you for pricing. Customer rates are not included.",
      entity_type: "VendorQuote",
      entity_id: created.id,
      link_path: `/vendor/job-offers/${created.id}`,
    });

    return { success: true, data: created };
  }

  async listForTenant(tenantId: string, query: VendorQuoteQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.VendorQuoteWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
      };
      const [data, total] = await Promise.all([
        tx.vendorQuote.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: "desc" },
          include: {
            lines: { orderBy: { sort_order: "asc" } },
            job: {
              select: {
                id: true,
                job_number: true,
                job_type: true,
                status: true,
              },
            },
          },
        }),
        tx.vendorQuote.count({ where }),
      ]);
      return {
        success: true,
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 1,
        },
      };
    });
  }

  resolveVendorPartyId(dto: SendJobToVendorDto): string {
    const id = dto.vendor_party_id ?? dto.vendor_id ?? dto.party_id;
    if (!id) {
      throw new BadRequestException(
        "vendor_party_id (or vendor_id / party_id) is required.",
      );
    }
    return id;
  }

  async listForJob(tenantId: string, jobId: string) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorQuote.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        include: { lines: { orderBy: { sort_order: "asc" } } },
        orderBy: { created_at: "desc" },
      }),
    );
    return { success: true, data: rows };
  }

  async decide(
    tenantId: string,
    quoteId: string,
    approve: boolean,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quote = await tx.vendorQuote.findFirst({
        where: { id: quoteId, tenant_id: tenantId, deleted_at: null },
      });
      if (!quote) throw new NotFoundException("Vendor quote not found.");
      if (quote.status !== "PRICED") {
        throw new BadRequestException(
          "Only a priced vendor quote can be approved or disapproved.",
        );
      }

      return tx.vendorQuote.update({
        where: { id: quoteId },
        data: {
          status: approve ? "APPROVED" : "DISAPPROVED",
          decided_at: new Date(),
          decided_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async listForVendor(
    tenantId: string,
    vendorPartyId: string,
    query: VendorQuoteQueryDto,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.VendorQuoteWhereInput = {
        tenant_id: tenantId,
        vendor_party_id: vendorPartyId,
        deleted_at: null,
      };

      const [data, total] = await Promise.all([
        tx.vendorQuote.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: "desc" },
          include: {
            job: {
              select: {
                id: true,
                job_number: true,
                job_type: true,
                status: true,
                commodity: true,
                hs_code: true,
                gross_weight: true,
                chargeable_weight: true,
                volume_cbm: true,
                pieces: true,
                etd: true,
                eta: true,
                origin_port_id: true,
                dest_port_id: true,
                incoterms: true,
                is_dg: true,
              },
            },
            lines: { orderBy: { sort_order: "asc" } },
          },
        }),
        tx.vendorQuote.count({ where }),
      ]);

      return {
        success: true,
        data: data.map((row) => this.toVendorView(row)),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 1,
        },
      };
    });
  }

  async getForVendor(tenantId: string, vendorPartyId: string, quoteId: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorQuote.findFirst({
        where: {
          id: quoteId,
          tenant_id: tenantId,
          vendor_party_id: vendorPartyId,
          deleted_at: null,
        },
        include: {
          job: {
            select: {
              id: true,
              job_number: true,
              job_type: true,
              status: true,
              commodity: true,
              hs_code: true,
              gross_weight: true,
              chargeable_weight: true,
              volume_cbm: true,
              pieces: true,
              etd: true,
              eta: true,
              origin_port_id: true,
              dest_port_id: true,
              incoterms: true,
              is_dg: true,
            },
          },
          lines: { orderBy: { sort_order: "asc" } },
        },
      }),
    );
    if (!row) throw new NotFoundException("Vendor quote not found.");
    return { success: true, data: this.toVendorView(row) };
  }

  async priceAsVendor(
    tenantId: string,
    vendorPartyId: string,
    quoteId: string,
    dto: PriceVendorQuoteDto,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const quote = await tx.vendorQuote.findFirst({
        where: {
          id: quoteId,
          tenant_id: tenantId,
          vendor_party_id: vendorPartyId,
          deleted_at: null,
        },
      });
      if (!quote) throw new NotFoundException("Vendor quote not found.");
      if (quote.status !== "SENT" && quote.status !== "PRICED") {
        throw new ForbiddenException(
          "This vendor quote can no longer be priced.",
        );
      }

      await tx.vendorQuoteLine.deleteMany({
        where: { vendor_quote_id: quoteId, tenant_id: tenantId },
      });

      const lines = dto.lines.map((line, index) => {
        const quantity = line.quantity ?? 1;
        const amount = quantity * line.unit_price;
        return {
          tenant_id: tenantId,
          vendor_quote_id: quoteId,
          description: line.description,
          quantity,
          unit_price: line.unit_price,
          amount,
          sort_order: index,
        };
      });

      await tx.vendorQuoteLine.createMany({ data: lines });
      const costTotal = lines.reduce((sum, line) => sum + line.amount, 0);

      const updated = await tx.vendorQuote.update({
        where: { id: quoteId },
        data: {
          status: "PRICED",
          cost_total: costTotal,
          vendor_notes: dto.vendor_notes,
          priced_at: new Date(),
        },
        include: { lines: { orderBy: { sort_order: "asc" } } },
      });

      return { success: true, data: updated };
    });
  }

  private toVendorView(row: {
    job: Record<string, unknown> | null;
    [key: string]: unknown;
  }) {
    const { job, ...quote } = row;
    return {
      ...quote,
      job,
    };
  }
}
