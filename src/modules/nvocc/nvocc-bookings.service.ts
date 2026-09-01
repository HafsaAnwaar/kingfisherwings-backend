import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, NvoccBooking, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { EmailService } from "../../shared/email/email.service";
import { DocumentGenerationService } from "../../shared/queue/document-generation.service";
import { seedJobTypeExtras } from "../jobs/utils/job-type-seed.util";
import { mintTrackingToken } from "../jobs/utils/tracking-token.util";
import {
  ConvertNvoccBookingToJobDto,
  CreateNvoccBookingDto,
  NvoccBookingQueryDto,
  SendCutoffReminderDto,
  UpdateNvoccBookingDto,
} from "./dto/nvocc-booking.dto";
import { NvoccVoyagesService } from "./nvocc-voyages.service";
import { NvoccTariffsService } from "./nvocc-tariffs.service";

const JOB_TYPE_CODE: Record<string, string> = {
  NVOCC_EXPORT: "NE",
  NVOCC_IMPORT: "NI",
};

@Injectable()
export class NvoccBookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly voyagesService: NvoccVoyagesService,
    private readonly tariffsService: NvoccTariffsService,
    private readonly emailService: EmailService,
    private readonly documentGeneration: DocumentGenerationService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateNvoccBookingDto,
    actorId?: string,
  ): Promise<NvoccBooking> {
    const voyage = await this.voyagesService.findOne(tenantId, dto.voyage_id);
    if (voyage.closed_at) {
      throw new BadRequestException("Voyage is closed for new bookings.");
    }

    const bookingNumber = await this.numberGenerator.generate(
      tenantId,
      "NVOCC_BOOKING",
    );

    const booking = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.nvoccBooking.create({
        data: {
          tenant_id: tenantId,
          booking_number: bookingNumber,
          voyage_id: dto.voyage_id,
          enquiry_id: dto.enquiry_id,
          shipper_id: dto.shipper_id,
          consignee_id: dto.consignee_id,
          notify_id: dto.notify_id,
          agent_pol_id: dto.agent_pol_id ?? voyage.agent_pol_id,
          agent_pod_id: dto.agent_pod_id ?? voyage.agent_pod_id,
          cargo_type: dto.cargo_type,
          container_type_id: dto.container_type_id,
          container_count: dto.container_count,
          cbm_allocated: dto.cbm_allocated,
          gross_weight: dto.gross_weight,
          pieces: dto.pieces,
          commodity: dto.commodity,
          hs_code: dto.hs_code,
          is_dg: dto.is_dg ?? false,
          dg_un_number: dto.dg_un_number,
          dg_class: dto.dg_class,
          dg_packing_group: dto.dg_packing_group,
          marks_numbers: dto.marks_numbers,
          incoterms: dto.incoterms,
          freight_terms: dto.freight_terms,
          other_charges_terms: dto.other_charges_terms,
          shipper_ref: dto.shipper_ref,
          job_type: dto.job_type ?? "NVOCC_EXPORT",
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (dto.apply_tariff !== false) {
        await this.applyTariffChargesTx(
          tx,
          tenantId,
          row,
          voyage.pol_id,
          voyage.pod_id,
          actorId,
        );
      }

      return row;
    });

    return booking;
  }

  private async applyTariffChargesTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    booking: NvoccBooking,
    polId: string | null,
    podId: string | null,
    actorId?: string,
  ) {
    const tariff = await this.tariffsService.findMatch(tenantId, {
      origin_port_id: polId ?? undefined,
      dest_port_id: podId ?? undefined,
      cargo_type: booking.cargo_type,
      container_type_id: booking.container_type_id ?? undefined,
      customer_id: booking.shipper_id ?? undefined,
    });

    if (!tariff) return;

    const lines = this.tariffsService.buildChargeLinesFromTariff(
      tariff,
      booking.cargo_type,
      booking.cbm_allocated != null ? Number(booking.cbm_allocated) : undefined,
      booking.container_count ?? undefined,
    );

    if (lines.length === 0) return;

    await tx.nvoccBookingCharge.createMany({
      data: lines.map((line) => ({
        tenant_id: tenantId,
        booking_id: booking.id,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        currency_code: line.currency_code,
        amount: line.amount,
        is_cost: line.is_cost,
        created_by: actorId,
        updated_by: actorId,
      })),
    });
  }

  async findAll(tenantId: string, query: NvoccBookingQueryDto) {
    const where: Prisma.NvoccBookingWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(query.voyage_id ? { voyage_id: query.voyage_id } : {}),
      ...(query.shipper_id ? { shipper_id: query.shipper_id } : {}),
      ...(query.cargo_type ? { cargo_type: query.cargo_type } : {}),
      ...(query.booking_status
        ? {
            booking_status:
              query.booking_status as Prisma.EnumNvoccBookingStatusFilter["equals"],
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                booking_number: { contains: query.search, mode: "insensitive" },
              },
              {
                nvocc_hbl_number: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccBooking.findMany({
        where,
        include: { charges: { where: { deleted_at: null } } },
        orderBy: { booking_date: "desc" },
      }),
    );
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccBooking.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          voyage: true,
          enquiry: true,
          charges: { where: { deleted_at: null } },
          load_list: { where: { deleted_at: null } },
        },
      }),
    );
    if (!row) throw new NotFoundException("NVOCC booking not found.");
    return row;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateNvoccBookingDto,
    actorId?: string,
  ) {
    const booking = await this.findOne(tenantId, id);
    if (booking.booking_status !== "DRAFT") {
      throw new BadRequestException("Only draft bookings can be edited.");
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccBooking.update({
        where: { id },
        data: {
          shipper_id: dto.shipper_id,
          consignee_id: dto.consignee_id,
          notify_id: dto.notify_id,
          agent_pol_id: dto.agent_pol_id,
          agent_pod_id: dto.agent_pod_id,
          cargo_type: dto.cargo_type,
          container_type_id: dto.container_type_id,
          container_count: dto.container_count,
          cbm_allocated: dto.cbm_allocated,
          gross_weight: dto.gross_weight,
          pieces: dto.pieces,
          commodity: dto.commodity,
          hs_code: dto.hs_code,
          is_dg: dto.is_dg,
          dg_un_number: dto.dg_un_number,
          dg_class: dto.dg_class,
          dg_packing_group: dto.dg_packing_group,
          marks_numbers: dto.marks_numbers,
          incoterms: dto.incoterms,
          freight_terms: dto.freight_terms,
          other_charges_terms: dto.other_charges_terms,
          shipper_ref: dto.shipper_ref,
          job_type: dto.job_type,
          updated_by: actorId,
        },
      }),
    );
  }

  async confirm(tenantId: string, id: string, actorId?: string) {
    const booking = await this.findOne(tenantId, id);
    if (booking.booking_status !== "DRAFT") {
      throw new BadRequestException("Only draft bookings can be confirmed.");
    }

    const voyage = await this.voyagesService.findOne(
      tenantId,
      booking.voyage_id,
    );
    this.assertSpaceAvailable(voyage, booking);

    const hblNumber = await this.numberGenerator.generate(tenantId, "HBL");

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const updated = await tx.nvoccBooking.update({
        where: { id },
        data: {
          booking_status: "CONFIRMED",
          nvocc_hbl_number: hblNumber,
          updated_by: actorId,
        },
      });

      await this.deductSpaceTx(tx, booking);

      await tx.nvoccLoadListItem.create({
        data: {
          tenant_id: tenantId,
          voyage_id: booking.voyage_id,
          booking_id: booking.id,
          container_type_id: booking.container_type_id,
          pieces: booking.pieces,
          gross_weight_kg: booking.gross_weight,
          cbm: booking.cbm_allocated,
          commodity: booking.commodity,
          marks_numbers: booking.marks_numbers,
          hbl_number: hblNumber,
          agent_pol_id: booking.agent_pol_id,
          freight_terms: booking.freight_terms,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (booking.enquiry_id) {
        await tx.nvoccEnquiry.updateMany({
          where: {
            id: booking.enquiry_id,
            enquiry_status: { not: "CONVERTED" },
          },
          data: { enquiry_status: "ACCEPTED", updated_by: actorId },
        });
      }

      return updated;
    });
  }

  private assertSpaceAvailable(
    voyage: Awaited<ReturnType<NvoccVoyagesService["findOne"]>>,
    booking: NvoccBooking,
  ) {
    const space = this.voyagesService.getRemainingSpace(voyage);

    if (booking.cargo_type === "FCL") {
      const needed = booking.container_count ?? 1;
      if (
        voyage.slot_allocation_containers > 0 &&
        needed > space.fclRemaining
      ) {
        throw new BadRequestException(
          `Insufficient FCL slots. Requested ${needed}, remaining ${space.fclRemaining}.`,
        );
      }
    }

    if (booking.cargo_type === "LCL") {
      const needed = Number(booking.cbm_allocated ?? 0);
      if (space.lclCapacity != null && needed > (space.lclRemaining ?? 0)) {
        throw new BadRequestException(
          `Insufficient LCL CBM. Requested ${needed}, remaining ${space.lclRemaining}.`,
        );
      }
    }
  }

  private async deductSpaceTx(
    tx: Prisma.TransactionClient,
    booking: NvoccBooking,
  ) {
    if (booking.cargo_type === "FCL" && booking.container_count) {
      await tx.nvoccVoyage.update({
        where: { id: booking.voyage_id },
        data: { fcl_booked_containers: { increment: booking.container_count } },
      });
    }
    if (booking.cargo_type === "LCL" && booking.cbm_allocated) {
      await tx.nvoccVoyage.update({
        where: { id: booking.voyage_id },
        data: { lcl_booked_cbm: { increment: booking.cbm_allocated } },
      });
    }
  }

  private async releaseSpaceTx(
    tx: Prisma.TransactionClient,
    booking: NvoccBooking,
  ) {
    if (booking.cargo_type === "FCL" && booking.container_count) {
      await tx.nvoccVoyage.update({
        where: { id: booking.voyage_id },
        data: { fcl_booked_containers: { decrement: booking.container_count } },
      });
    }
    if (booking.cargo_type === "LCL" && booking.cbm_allocated) {
      await tx.nvoccVoyage.update({
        where: { id: booking.voyage_id },
        data: { lcl_booked_cbm: { decrement: booking.cbm_allocated } },
      });
    }
  }

  async cancel(tenantId: string, id: string, actorId?: string) {
    const booking = await this.findOne(tenantId, id);
    if (booking.booking_status === "CANCELLED") {
      throw new BadRequestException("Booking is already cancelled.");
    }
    if (booking.booking_status === "CONVERTED") {
      throw new BadRequestException(
        "Cannot cancel a booking that has been converted to a job.",
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (booking.booking_status === "CONFIRMED") {
        await this.releaseSpaceTx(tx, booking);
      }

      return tx.nvoccBooking.update({
        where: { id },
        data: { booking_status: "CANCELLED", updated_by: actorId },
      });
    });
  }

  async convertToJob(
    tenantId: string,
    id: string,
    dto: ConvertNvoccBookingToJobDto,
    actorId?: string,
  ): Promise<{ jobId: string; jobNumber: string }> {
    const booking = await this.findOne(tenantId, id);
    if (booking.booking_status !== "CONFIRMED") {
      throw new BadRequestException(
        "Only confirmed bookings can be converted to a job.",
      );
    }
    if (booking.converted_job_id) {
      throw new ConflictException(
        "Booking has already been converted to a job.",
      );
    }

    const voyage = booking.voyage!;
    const jobType = (booking.job_type ?? "NVOCC_EXPORT") as JobType;
    const branchCode = dto.branch_id
      ? (
          await this.prisma.runWithTenant(tenantId, (tx) =>
            tx.branch.findFirst({
              where: {
                id: dto.branch_id,
                tenant_id: tenantId,
                deleted_at: null,
              },
            }),
          )
        )?.code
      : undefined;

    const jobNumber = await this.numberGenerator.generate(
      tenantId,
      "JOB_NUMBER",
      {
        extraSegment: JOB_TYPE_CODE[jobType] ?? "NE",
        branchCode,
      },
    );

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.create({
        data: {
          tenant_id: tenantId,
          company_id: dto.company_id,
          job_number: jobNumber,
          tracking_token: mintTrackingToken(),
          job_type: jobType,
          status: "BOOKING_CONFIRMED",
          branch_id: dto.branch_id,
          department_id: dto.department_id,
          shipper_id: booking.shipper_id,
          consignee_id: booking.consignee_id,
          agent_id: booking.agent_pol_id,
          origin_port_id: voyage.pol_id,
          dest_port_id: voyage.pod_id,
          commodity: booking.commodity,
          hs_code: booking.hs_code,
          gross_weight: booking.gross_weight,
          volume_cbm: booking.cbm_allocated,
          pieces: booking.pieces,
          container_type_id: booking.container_type_id,
          container_count: booking.container_count,
          incoterms: booking.incoterms,
          is_dg: booking.is_dg,
          dg_class: booking.dg_class,
          etd: voyage.etd ? new Date(voyage.etd) : undefined,
          eta: voyage.eta ? new Date(voyage.eta) : undefined,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (booking.charges.length > 0) {
        const fallbackChargeCode = await tx.chargeCode.findFirst({
          where: { tenant_id: tenantId, deleted_at: null, is_active: true },
          orderBy: { code: "asc" },
        });

        const chargeRows = booking.charges
          .map((line) => {
            const chargeCodeId = line.charge_code_id ?? fallbackChargeCode?.id;
            if (!chargeCodeId) return null;
            return {
              tenant_id: tenantId,
              job_id: job.id,
              charge_code_id: chargeCodeId,
              description: line.description,
              quantity: line.quantity,
              unit_price: line.unit_price,
              currency_code: line.currency_code,
              exchange_rate: 1,
              amount: line.amount,
              amount_base_currency: line.amount,
              is_cost: line.is_cost,
              created_by: actorId,
              updated_by: actorId,
            };
          })
          .filter((row): row is NonNullable<typeof row> => row != null);

        if (chargeRows.length > 0) {
          await tx.jobCharge.createMany({ data: chargeRows });
        }
      }

      await tx.nvoccJobDetail.create({
        data: {
          tenant_id: tenantId,
          job_id: job.id,
          voyage_id: booking.voyage_id,
          booking_id: booking.id,
          hbl_number: booking.nvocc_hbl_number,
          mbl_number: voyage.mbl_number,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      await seedJobTypeExtras(tx, tenantId, job.id, jobType, actorId);

      await tx.nvoccBooking.update({
        where: { id },
        data: {
          booking_status: "CONVERTED",
          converted_job_id: job.id,
          updated_by: actorId,
        },
      });

      if (booking.enquiry_id) {
        await tx.nvoccEnquiry.update({
          where: { id: booking.enquiry_id },
          data: { enquiry_status: "CONVERTED", updated_by: actorId },
        });
      }

      return { jobId: job.id, jobNumber };
    });
  }

  async sendCutoffReminder(
    tenantId: string,
    id: string,
    dto: SendCutoffReminderDto,
  ) {
    const booking = await this.findOne(tenantId, id);
    const voyage = booking.voyage!;
    const cutoffs = [
      ["SI", voyage.si_cutoff],
      ["VGM", voyage.vgm_cutoff],
      ["CY", voyage.cy_cutoff],
      ["Cargo", voyage.cargo_cutoff],
    ].filter(([, d]) => d);

    const body = [
      `Booking: ${booking.booking_number}`,
      `HBL: ${booking.nvocc_hbl_number ?? "TBC"}`,
      "",
      "Upcoming cut-offs:",
      ...cutoffs.map(([label, date]) => {
        const d = date instanceof Date ? date : date ? new Date(date) : null;
        return `${label}: ${d?.toISOString() ?? "N/A"}`;
      }),
      "",
      dto.message ??
        "Please ensure all documentation is submitted before the cut-off dates.",
    ].join("\n");

    const to = dto.to_email ?? "ops@example.com";
    await this.emailService.send({
      tenantId,
      eventType: "OTHER",
      to,
      subject: `Cut-off reminder — Booking ${booking.booking_number}`,
      body,
    });

    return { sent: true, to };
  }

  async generateBookingConfirmationPdf(
    tenantId: string,
    id: string,
    actorId?: string,
  ) {
    const booking = await this.findOne(tenantId, id);
    if (!booking.converted_job_id) {
      throw new BadRequestException(
        "Convert booking to a job before generating booking confirmation PDF.",
      );
    }
    return this.documentGeneration.enqueueJobDocument(
      tenantId,
      booking.converted_job_id,
      "BOOKING_CONFIRMATION",
      actorId,
    );
  }

  async remove(tenantId: string, id: string, actorId?: string) {
    const booking = await this.findOne(tenantId, id);
    if (booking.booking_status === "CONFIRMED") {
      throw new BadRequestException("Cancel the booking before deleting.");
    }
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccBooking.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
  }
}
