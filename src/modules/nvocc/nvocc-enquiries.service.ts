import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { NvoccEnquiry, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { EmailService } from "../../shared/email/email.service";
import { NVOCC_LOSS_REASONS } from "./constants/nvocc-loss-reasons";
import {
  CreateNvoccEnquiryDto,
  MarkNvoccEnquiryLostDto,
  NvoccEnquiryQueryDto,
  SendNvoccRateDto,
  UpdateNvoccEnquiryDto,
} from "./dto/nvocc-enquiry.dto";
import { NvoccBookingsService } from "./nvocc-bookings.service";

@Injectable()
export class NvoccEnquiriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly emailService: EmailService,
    private readonly bookingsService: NvoccBookingsService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateNvoccEnquiryDto,
    actorId?: string,
  ): Promise<NvoccEnquiry> {
    const enquiryNumber = await this.numberGenerator.generate(
      tenantId,
      "NVOCC_ENQUIRY",
    );

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.create({
        data: {
          tenant_id: tenantId,
          enquiry_number: enquiryNumber,
          customer_id: dto.customer_id,
          voyage_id: dto.voyage_id,
          cargo_type: dto.cargo_type,
          container_type_id: dto.container_type_id,
          container_count: dto.container_count,
          cbm: dto.cbm,
          gross_weight: dto.gross_weight,
          pieces: dto.pieces,
          commodity: dto.commodity,
          hs_code: dto.hs_code,
          incoterms: dto.incoterms,
          freight_terms: dto.freight_terms,
          rate_quoted: dto.rate_quoted,
          rate_validity: dto.rate_validity
            ? new Date(dto.rate_validity)
            : undefined,
          salesperson_id: dto.salesperson_id,
          follow_up_date: dto.follow_up_date
            ? new Date(dto.follow_up_date)
            : undefined,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async findAll(tenantId: string, query: NvoccEnquiryQueryDto) {
    const where: Prisma.NvoccEnquiryWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(query.enquiry_status ? { enquiry_status: query.enquiry_status } : {}),
      ...(query.voyage_id ? { voyage_id: query.voyage_id } : {}),
      ...(query.customer_id ? { customer_id: query.customer_id } : {}),
      ...(query.salesperson_id ? { salesperson_id: query.salesperson_id } : {}),
      ...(query.date_from || query.date_to
        ? {
            enquiry_date: {
              ...(query.date_from ? { gte: new Date(query.date_from) } : {}),
              ...(query.date_to ? { lte: new Date(query.date_to) } : {}),
            },
          }
        : {}),
    };

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.findMany({ where, orderBy: { enquiry_date: "desc" } }),
    );
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: { voyage: true, bookings: { where: { deleted_at: null } } },
      }),
    );
    if (!row) throw new NotFoundException("NVOCC enquiry not found.");
    return row;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateNvoccEnquiryDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.update({
        where: { id },
        data: {
          customer_id: dto.customer_id,
          voyage_id: dto.voyage_id,
          cargo_type: dto.cargo_type,
          container_type_id: dto.container_type_id,
          container_count: dto.container_count,
          cbm: dto.cbm,
          gross_weight: dto.gross_weight,
          pieces: dto.pieces,
          commodity: dto.commodity,
          hs_code: dto.hs_code,
          incoterms: dto.incoterms,
          freight_terms: dto.freight_terms,
          rate_quoted: dto.rate_quoted,
          rate_validity: dto.rate_validity
            ? new Date(dto.rate_validity)
            : undefined,
          enquiry_status: dto.enquiry_status,
          salesperson_id: dto.salesperson_id,
          follow_up_date: dto.follow_up_date
            ? new Date(dto.follow_up_date)
            : undefined,
          updated_by: actorId,
        },
      }),
    );
  }

  async sendRate(
    tenantId: string,
    id: string,
    dto: SendNvoccRateDto,
    actorId?: string,
  ) {
    const enquiry = await this.findOne(tenantId, id);
    const subject =
      dto.subject ?? `NVOCC Rate Quotation — ${enquiry.enquiry_number}`;
    const body =
      dto.message ??
      [
        `Dear Customer,`,
        ``,
        `Please find our NVOCC rate for enquiry ${enquiry.enquiry_number}.`,
        enquiry.rate_quoted != null
          ? `Quoted rate: ${enquiry.rate_quoted}`
          : "",
        enquiry.rate_validity
          ? `Valid until: ${enquiry.rate_validity.toISOString().slice(0, 10)}`
          : "",
        enquiry.voyage
          ? `Voyage ETD: ${enquiry.voyage.etd?.toISOString?.() ?? "TBC"}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

    await this.emailService.send({
      tenantId,
      eventType: "OTHER",
      to: dto.to_email,
      cc: dto.cc_email,
      subject,
      body,
      createdBy: actorId,
    });

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.update({
        where: { id },
        data: { enquiry_status: "RATE_SENT", updated_by: actorId },
      }),
    );
  }

  async markLost(
    tenantId: string,
    id: string,
    dto: MarkNvoccEnquiryLostDto,
    actorId?: string,
  ) {
    if (
      !NVOCC_LOSS_REASONS.includes(
        dto.loss_reason as (typeof NVOCC_LOSS_REASONS)[number],
      )
    ) {
      throw new BadRequestException(
        `Invalid loss reason. Allowed: ${NVOCC_LOSS_REASONS.join(", ")}`,
      );
    }
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.update({
        where: { id },
        data: {
          enquiry_status: "LOST",
          loss_reason: dto.loss_reason,
          updated_by: actorId,
        },
      }),
    );
  }

  async convertToBooking(tenantId: string, id: string, actorId?: string) {
    const enquiry = await this.findOne(tenantId, id);
    if (!["NEW", "RATE_SENT", "ACCEPTED"].includes(enquiry.enquiry_status)) {
      throw new BadRequestException(
        "Enquiry cannot be converted in its current status.",
      );
    }
    if (!enquiry.voyage_id || !enquiry.cargo_type) {
      throw new BadRequestException(
        "Enquiry must have voyage and cargo type before conversion.",
      );
    }

    const booking = await this.bookingsService.create(
      tenantId,
      {
        voyage_id: enquiry.voyage_id,
        enquiry_id: enquiry.id,
        shipper_id: enquiry.customer_id ?? undefined,
        cargo_type: enquiry.cargo_type,
        container_type_id: enquiry.container_type_id ?? undefined,
        container_count: enquiry.container_count ?? undefined,
        cbm_allocated: enquiry.cbm != null ? Number(enquiry.cbm) : undefined,
        gross_weight:
          enquiry.gross_weight != null
            ? Number(enquiry.gross_weight)
            : undefined,
        pieces: enquiry.pieces ?? undefined,
        commodity: enquiry.commodity ?? undefined,
        hs_code: enquiry.hs_code ?? undefined,
        incoterms: enquiry.incoterms ?? undefined,
        freight_terms: enquiry.freight_terms ?? undefined,
        apply_tariff: true,
      },
      actorId,
    );

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.update({
        where: { id },
        data: { enquiry_status: "CONVERTED", updated_by: actorId },
      }),
    );

    return booking;
  }

  async analytics(tenantId: string) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.groupBy({
        by: ["enquiry_status"],
        where: { tenant_id: tenantId, deleted_at: null },
        _count: { _all: true },
      }),
    );

    const lossRows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.groupBy({
        by: ["loss_reason"],
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          enquiry_status: "LOST",
          loss_reason: { not: null },
        },
        _count: { _all: true },
      }),
    );

    const total = rows.reduce((sum, r) => sum + r._count._all, 0);
    const converted =
      rows.find((r) => r.enquiry_status === "CONVERTED")?._count._all ?? 0;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    return {
      by_status: rows.map((r) => ({
        status: r.enquiry_status,
        count: r._count._all,
      })),
      loss_reasons: lossRows.map((r) => ({
        reason: r.loss_reason,
        count: r._count._all,
      })),
      conversion_rate_percent: Number(conversionRate.toFixed(2)),
    };
  }

  async remove(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccEnquiry.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          enquiry_status: "CANCELLED",
          updated_by: actorId,
        },
      }),
    );
  }
}
