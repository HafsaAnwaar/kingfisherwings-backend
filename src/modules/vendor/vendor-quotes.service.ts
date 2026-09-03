import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  VendorQuoteNegotiationAction,
  VendorQuoteNegotiationActor,
  VendorQuoteStatus,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { VENDOR_ELIGIBLE_PARTY_TYPES } from "./constants/vendor-permission.constants";
import {
  PriceVendorQuoteDto,
  SendJobToVendorDto,
  VendorCounterOfferDto,
  VendorNegotiationAcceptDto,
  VendorNegotiationRejectDto,
  VendorQuoteQueryDto,
  VendorReviseAndSendDto,
} from "./dto/vendor-quote.dto";
import {
  applyTotalToVendorCostLines,
  buildVendorNegotiationPricingView,
  normalizeVendorLines,
} from "./vendor-quote-negotiation-pricing.util";

const VENDOR_ACTIONABLE: VendorQuoteStatus[] = [
  "SENT",
  "VENDOR_REVIEW",
  "NEGOTIATING",
  "PRICED",
];

const TENANT_NEGOTIABLE: VendorQuoteStatus[] = [
  "SENT",
  "NEGOTIATING",
  "VENDOR_REVIEW",
  "PRICED",
];

const JOB_SELECT = {
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
} as const;

@Injectable()
export class VendorQuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  resolveVendorPartyId(dto: SendJobToVendorDto): string {
    const id = dto.vendor_party_id ?? dto.vendor_id ?? dto.party_id;
    if (!id) {
      throw new BadRequestException(
        "vendor_party_id (or vendor_id / party_id) is required.",
      );
    }
    return id;
  }

  async sendJobToVendor(
    tenantId: string,
    jobId: string,
    dto: SendJobToVendorDto,
    actorId?: string,
  ) {
    const vendorPartyId = this.resolveVendorPartyId(dto);
    const notes = dto.staff_notes ?? dto.notes;
    const seedLines = normalizeVendorLines(dto.lines ?? [], dto.proposed_total);
    const costTotal = seedLines.length
      ? seedLines.reduce((sum, line) => sum + line.amount, 0)
      : (dto.proposed_total ?? 0);

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
          status: { in: ["SENT", "PRICED", "NEGOTIATING", "VENDOR_REVIEW"] },
        },
      });
      if (existing) {
        throw new BadRequestException(
          "An open vendor offer already exists for this job and vendor.",
        );
      }

      const quote = await tx.vendorQuote.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          vendor_party_id: vendorPartyId,
          status: "SENT",
          currency_code: dto.currency_code ?? "AED",
          cost_total: costTotal,
          negotiation_round: 1,
          staff_notes: notes,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (seedLines.length) {
        await tx.vendorQuoteLine.createMany({
          data: seedLines.map((line) => ({
            tenant_id: tenantId,
            vendor_quote_id: quote.id,
            ...line,
          })),
        });
      }

      await this.appendEvent(tx, tenantId, {
        quoteId: quote.id,
        round: 1,
        actor: "TENANT",
        action: "SEND",
        message: dto.message ?? notes,
        proposedTotal: costTotal || undefined,
        proposedLines: seedLines.length ? seedLines : undefined,
        createdBy: actorId,
      });

      return tx.vendorQuote.findFirstOrThrow({
        where: { id: quote.id },
        include: {
          lines: { orderBy: { sort_order: "asc" } },
          job: { select: JOB_SELECT },
        },
      });
    });

    await this.notifications.notifyPartyVendorUsers(tenantId, vendorPartyId, {
      type: "VENDOR_QUOTE_SENT",
      title: "New job offer",
      message: costTotal
        ? `A job offer was sent with cost ${costTotal}. You can accept, reject, or counter.`
        : "A job was sent for you to price. Customer rates are not included.",
      entity_type: "VendorQuote",
      entity_id: created.id,
      link_path: `/vendor/job-offers/${created.id}`,
    });

    return {
      success: true,
      data: this.toSharedView(created),
    };
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
            job: { select: JOB_SELECT },
          },
        }),
        tx.vendorQuote.count({ where }),
      ]);
      return {
        success: true,
        data: data.map((row) => this.toSharedView(row)),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 1,
        },
      };
    });
  }

  async listForJob(tenantId: string, jobId: string) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorQuote.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        include: {
          lines: { orderBy: { sort_order: "asc" } },
          job: { select: JOB_SELECT },
        },
        orderBy: { created_at: "desc" },
      }),
    );
    return {
      success: true,
      data: rows.map((row) => this.toSharedView(row)),
    };
  }

  async getForTenant(tenantId: string, quoteId: string) {
    const row = await this.loadQuote(tenantId, quoteId);
    return { success: true, data: this.toSharedView(row) };
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
            job: { select: JOB_SELECT },
            lines: { orderBy: { sort_order: "asc" } },
          },
        }),
        tx.vendorQuote.count({ where }),
      ]);

      return {
        success: true,
        data: data.map((row) => this.toSharedView(row)),
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
    const row = await this.loadQuote(tenantId, quoteId, vendorPartyId);
    return { success: true, data: this.toSharedView(row) };
  }

  /** Tenant revises cost offer and sends back to vendor (like revise-and-send). */
  async reviseAndSend(
    tenantId: string,
    quoteId: string,
    dto: VendorReviseAndSendDto,
    actorId?: string,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quote = await this.getOrThrow(tx, tenantId, quoteId);
      this.assertTenantNegotiable(quote.status);

      if (dto.lines?.length) {
        await tx.vendorQuoteLine.deleteMany({
          where: { vendor_quote_id: quoteId, tenant_id: tenantId },
        });
        const seed = normalizeVendorLines(dto.lines, dto.proposed_total);
        await tx.vendorQuoteLine.createMany({
          data: seed.map((line) => ({
            tenant_id: tenantId,
            vendor_quote_id: quoteId,
            ...line,
          })),
        });
        const total = seed.reduce((sum, line) => sum + line.amount, 0);
        await tx.vendorQuote.update({
          where: { id: quoteId },
          data: { cost_total: total },
        });
      } else if (dto.proposed_total !== undefined) {
        await applyTotalToVendorCostLines(
          tx,
          tenantId,
          quoteId,
          dto.proposed_total,
        );
        await tx.vendorQuote.update({
          where: { id: quoteId },
          data: { cost_total: dto.proposed_total },
        });
      }

      const nextRound = quote.negotiation_round + 1;
      const result = await tx.vendorQuote.update({
        where: { id: quoteId },
        data: {
          status: "VENDOR_REVIEW",
          negotiation_round: nextRound,
          vendor_proposed_total: null,
          vendor_proposed_lines: Prisma.JsonNull,
          vendor_proposed_at: null,
          updated_by: actorId,
        },
        include: {
          lines: { orderBy: { sort_order: "asc" } },
          job: { select: JOB_SELECT },
        },
      });

      await this.appendEvent(tx, tenantId, {
        quoteId,
        round: nextRound,
        actor: "TENANT",
        action: "REVISE",
        message: dto.message,
        proposedTotal: Number(result.cost_total),
        proposedLines: result.lines,
        createdBy: actorId,
      });

      return result;
    });

    await this.notifications.notifyPartyVendorUsers(
      tenantId,
      updated.vendor_party_id,
      {
        type: "VENDOR_QUOTE_SENT",
        title: "Job offer revised",
        message: dto.message,
        entity_type: "VendorQuote",
        entity_id: updated.id,
        link_path: `/vendor/job-offers/${updated.id}`,
      },
    );

    return { success: true, data: this.toSharedView(updated) };
  }

  /** Tenant accepts vendor counter — cost_total already jumped on counter. */
  async tenantAcceptCounter(
    tenantId: string,
    quoteId: string,
    dto: VendorNegotiationAcceptDto,
    actorId?: string,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quote = await this.getOrThrow(tx, tenantId, quoteId);
      if (quote.status !== "NEGOTIATING" && quote.status !== "PRICED") {
        throw new BadRequestException(
          "Only NEGOTIATING / PRICED offers can be accepted from a vendor counter.",
        );
      }

      if (quote.vendor_proposed_total != null) {
        await applyTotalToVendorCostLines(
          tx,
          tenantId,
          quoteId,
          Number(quote.vendor_proposed_total),
        );
      }

      const result = await tx.vendorQuote.update({
        where: { id: quoteId },
        data: {
          status: "APPROVED",
          cost_total:
            quote.vendor_proposed_total != null
              ? quote.vendor_proposed_total
              : quote.cost_total,
          vendor_proposed_total: null,
          vendor_proposed_lines: Prisma.JsonNull,
          vendor_proposed_at: null,
          decided_at: new Date(),
          decided_by: actorId,
          updated_by: actorId,
        },
        include: {
          lines: { orderBy: { sort_order: "asc" } },
          job: { select: JOB_SELECT },
        },
      });

      await this.appendEvent(tx, tenantId, {
        quoteId,
        round: quote.negotiation_round,
        actor: "TENANT",
        action: "ACCEPT",
        message: dto.message ?? dto.comments,
        createdBy: actorId,
      });

      return result;
    });

    await this.notifications.notifyPartyVendorUsers(
      tenantId,
      updated.vendor_party_id,
      {
        type: "VENDOR_QUOTE_SENT",
        title: "Offer accepted",
        message: "Your cost offer was accepted.",
        entity_type: "VendorQuote",
        entity_id: updated.id,
        link_path: `/vendor/job-offers/${updated.id}`,
      },
    );

    return { success: true, data: this.toSharedView(updated) };
  }

  async tenantRejectCounter(
    tenantId: string,
    quoteId: string,
    dto: VendorNegotiationRejectDto,
    actorId?: string,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quote = await this.getOrThrow(tx, tenantId, quoteId);
      if (quote.status !== "NEGOTIATING" && quote.status !== "PRICED") {
        throw new BadRequestException(
          "Only NEGOTIATING / PRICED offers can be rejected.",
        );
      }

      const nextStatus: VendorQuoteStatus = dto.terminal
        ? "DISAPPROVED"
        : "VENDOR_REVIEW";

      const result = await tx.vendorQuote.update({
        where: { id: quoteId },
        data: {
          status: nextStatus,
          ...(dto.terminal
            ? { decided_at: new Date(), decided_by: actorId }
            : {}),
          updated_by: actorId,
        },
        include: {
          lines: { orderBy: { sort_order: "asc" } },
          job: { select: JOB_SELECT },
        },
      });

      await this.appendEvent(tx, tenantId, {
        quoteId,
        round: quote.negotiation_round,
        actor: "TENANT",
        action: "REJECT",
        message: dto.message,
        createdBy: actorId,
      });

      return result;
    });

    await this.notifications.notifyPartyVendorUsers(
      tenantId,
      updated.vendor_party_id,
      {
        type: "VENDOR_QUOTE_SENT",
        title: dto.terminal ? "Offer closed" : "Counter rejected",
        message: dto.message,
        entity_type: "VendorQuote",
        entity_id: updated.id,
        link_path: `/vendor/job-offers/${updated.id}`,
      },
    );

    return { success: true, data: this.toSharedView(updated) };
  }

  /** Legacy approve/disapprove after PRICED — keep working. */
  async decide(
    tenantId: string,
    quoteId: string,
    approve: boolean,
    actorId?: string,
  ) {
    if (approve) {
      return this.tenantAcceptCounter(tenantId, quoteId, {}, actorId);
    }
    return this.tenantRejectCounter(
      tenantId,
      quoteId,
      { message: "Disapproved", terminal: true },
      actorId,
    );
  }

  async vendorAccept(
    tenantId: string,
    vendorPartyId: string,
    quoteId: string,
    dto: VendorNegotiationAcceptDto,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quote = await this.getOrThrow(tx, tenantId, quoteId, vendorPartyId);
      this.assertVendorActionable(quote.status);

      const result = await tx.vendorQuote.update({
        where: { id: quoteId },
        data: {
          status: "APPROVED",
          decided_at: new Date(),
          vendor_proposed_total: null,
          vendor_proposed_lines: Prisma.JsonNull,
          vendor_proposed_at: null,
        },
        include: {
          lines: { orderBy: { sort_order: "asc" } },
          job: { select: JOB_SELECT },
        },
      });

      await this.appendEvent(tx, tenantId, {
        quoteId,
        round: quote.negotiation_round,
        actor: "VENDOR",
        action: "ACCEPT",
        message: dto.message ?? dto.comments,
      });

      return result;
    });

    return { success: true, data: this.toSharedView(updated) };
  }

  async vendorReject(
    tenantId: string,
    vendorPartyId: string,
    quoteId: string,
    dto: VendorNegotiationRejectDto,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quote = await this.getOrThrow(tx, tenantId, quoteId, vendorPartyId);
      this.assertVendorActionable(quote.status);

      const nextStatus: VendorQuoteStatus = dto.terminal
        ? "DISAPPROVED"
        : "NEGOTIATING";

      const result = await tx.vendorQuote.update({
        where: { id: quoteId },
        data: {
          status: nextStatus,
          ...(dto.terminal ? { decided_at: new Date() } : {}),
        },
        include: {
          lines: { orderBy: { sort_order: "asc" } },
          job: { select: JOB_SELECT },
        },
      });

      await this.appendEvent(tx, tenantId, {
        quoteId,
        round: quote.negotiation_round,
        actor: "VENDOR",
        action: "REJECT",
        message: dto.message,
      });

      return result;
    });

    return { success: true, data: this.toSharedView(updated) };
  }

  /**
   * Vendor counter — cost_total jumps immediately (same as customer counter on quotations).
   */
  async vendorCounterOffer(
    tenantId: string,
    vendorPartyId: string,
    quoteId: string,
    dto: VendorCounterOfferDto,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quote = await this.getOrThrow(tx, tenantId, quoteId, vendorPartyId);
      this.assertVendorActionable(quote.status);

      const proposedLines =
        dto.proposed_lines?.length
          ? normalizeVendorLines(dto.proposed_lines, dto.proposed_total)
          : [
              {
                description: "Vendor counter-offer",
                quantity: 1,
                unit_price: dto.proposed_total,
                amount: dto.proposed_total,
                sort_order: 0,
              },
            ];

      const nextRound = quote.negotiation_round + 1;

      await applyTotalToVendorCostLines(
        tx,
        tenantId,
        quoteId,
        dto.proposed_total,
      );

      const result = await tx.vendorQuote.update({
        where: { id: quoteId },
        data: {
          status: "NEGOTIATING",
          negotiation_round: nextRound,
          cost_total: dto.proposed_total,
          vendor_proposed_total: dto.proposed_total,
          vendor_proposed_lines: proposedLines,
          vendor_proposed_at: new Date(),
          priced_at: new Date(),
        },
        include: {
          lines: { orderBy: { sort_order: "asc" } },
          job: { select: JOB_SELECT },
        },
      });

      await this.appendEvent(tx, tenantId, {
        quoteId,
        round: nextRound,
        actor: "VENDOR",
        action: "COUNTER_OFFER",
        message: dto.message,
        proposedTotal: dto.proposed_total,
        proposedLines,
      });

      return result;
    });

    return { success: true, data: this.toSharedView(updated) };
  }

  /** Legacy / one-shot price — also treated as counter if total provided. */
  async priceAsVendor(
    tenantId: string,
    vendorPartyId: string,
    quoteId: string,
    dto: PriceVendorQuoteDto,
  ) {
    if (dto.proposed_total != null && !dto.lines?.length) {
      return this.vendorCounterOffer(tenantId, vendorPartyId, quoteId, {
        message: dto.message ?? dto.vendor_notes ?? "Vendor price submitted",
        proposed_total: dto.proposed_total,
      });
    }

    if (!dto.lines?.length) {
      throw new BadRequestException(
        "lines or proposed_total is required to price this offer.",
      );
    }

    return this.vendorCounterOffer(tenantId, vendorPartyId, quoteId, {
      message: dto.message ?? dto.vendor_notes ?? "Vendor price submitted",
      proposed_total: dto.lines.reduce(
        (sum, line) =>
          sum + (line.amount ?? (line.quantity ?? 1) * line.unit_price),
        0,
      ),
      proposed_lines: dto.lines,
    });
  }

  async getNegotiationTimeline(
    tenantId: string,
    quoteId: string,
    vendorPartyId?: string,
  ) {
    const quote = await this.loadQuote(tenantId, quoteId, vendorPartyId);
    const events = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorQuoteNegotiationEvent.findMany({
        where: { tenant_id: tenantId, vendor_quote_id: quoteId },
        orderBy: { created_at: "asc" },
      }),
    );
    return {
      success: true,
      data: events,
      negotiation_pricing: buildVendorNegotiationPricingView(quote),
      quote: this.toSharedView(quote),
    };
  }

  private async loadQuote(
    tenantId: string,
    quoteId: string,
    vendorPartyId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      return this.getOrThrow(tx, tenantId, quoteId, vendorPartyId, true);
    });
  }

  private async getOrThrow(
    tx: Prisma.TransactionClient,
    tenantId: string,
    quoteId: string,
    vendorPartyId?: string,
    withIncludes = false,
  ) {
    const quote = await tx.vendorQuote.findFirst({
      where: {
        id: quoteId,
        tenant_id: tenantId,
        deleted_at: null,
        ...(vendorPartyId ? { vendor_party_id: vendorPartyId } : {}),
      },
      ...(withIncludes
        ? {
            include: {
              lines: { orderBy: { sort_order: "asc" as const } },
              job: { select: JOB_SELECT },
            },
          }
        : {}),
    });
    if (!quote) throw new NotFoundException("Vendor quote not found.");
    return quote;
  }

  private assertVendorActionable(status: VendorQuoteStatus) {
    if (!VENDOR_ACTIONABLE.includes(status)) {
      throw new ForbiddenException(
        `Offer in ${status} status cannot be acted on by vendor.`,
      );
    }
  }

  private assertTenantNegotiable(status: VendorQuoteStatus) {
    if (!TENANT_NEGOTIABLE.includes(status)) {
      throw new BadRequestException(
        `Offer in ${status} status cannot be revised.`,
      );
    }
  }

  private async appendEvent(
    tx: Prisma.TransactionClient,
    tenantId: string,
    input: {
      quoteId: string;
      round: number;
      actor: VendorQuoteNegotiationActor;
      action: VendorQuoteNegotiationAction;
      message?: string;
      proposedTotal?: number;
      proposedLines?: unknown;
      createdBy?: string;
    },
  ) {
    return tx.vendorQuoteNegotiationEvent.create({
      data: {
        tenant_id: tenantId,
        vendor_quote_id: input.quoteId,
        round: input.round,
        actor: input.actor,
        action: input.action,
        message: input.message,
        proposed_total: input.proposedTotal,
        proposed_lines: input.proposedLines as Prisma.InputJsonValue,
        created_by: input.createdBy,
      },
    });
  }

  private toSharedView(row: {
    lines?: Array<{
      description: string;
      quantity: unknown;
      unit_price: unknown;
      amount: unknown;
    }>;
    cost_total: unknown;
    vendor_proposed_total: unknown;
    vendor_proposed_lines: unknown;
    vendor_proposed_at: Date | null;
    negotiation_round: number;
    job?: Record<string, unknown> | null;
    [key: string]: unknown;
  }) {
    const { job, lines, ...quote } = row;
    return {
      ...quote,
      lines: lines ?? [],
      job: job ?? null,
      negotiation_pricing: buildVendorNegotiationPricingView({
        cost_total: row.cost_total,
        vendor_proposed_total: row.vendor_proposed_total,
        vendor_proposed_lines: row.vendor_proposed_lines,
        vendor_proposed_at: row.vendor_proposed_at,
        negotiation_round: row.negotiation_round,
        lines,
      }),
    };
  }
}
