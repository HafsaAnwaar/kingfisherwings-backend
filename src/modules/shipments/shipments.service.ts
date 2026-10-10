import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DocumentType, JobType, Prisma, ShipmentStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { DocumentGenerationService } from "../../shared/queue/document-generation.service";
import { mintTrackingToken } from "../jobs/utils/tracking-token.util";
import { seedJobTypeExtras } from "../jobs/utils/job-type-seed.util";
import { assertDocumentAllowedForJobType } from "../jobs/constants/job-document-allowlist";
import { GenerateJobDocumentDto } from "../jobs/dto/generate-job-document.dto";
import {
  ChangeShipmentStatusDto,
  CopyShipmentChargesDto,
  CopyShipmentDto,
  CreateShipmentChargeDto,
  CreateShipmentDto,
  GenerateJobFromShipmentDto,
  GetShipmentChargesDto,
  ShipmentQueryDto,
  UpdateShipmentDto,
} from "./dto/shipment.dto";

const JOB_TYPE_CODE: Record<JobType, string> = {
  AIR_EXPORT: "AE",
  AIR_IMPORT: "AI",
  SEA_FCL_EXPORT: "FE",
  SEA_FCL_IMPORT: "FI",
  SEA_LCL_EXPORT: "LE",
  SEA_LCL_IMPORT: "LI",
  LAND: "LD",
  ROAD_FREIGHT: "RF",
  COURIER: "CR",
  CUSTOMS_CLEARANCE: "CC",
  NVOCC_EXPORT: "NE",
  NVOCC_IMPORT: "NI",
  SERVICE_JOB: "SJ",
  WAREHOUSE: "WH",
};

@Injectable()
export class ShipmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly documentGeneration: DocumentGenerationService,
  ) {}

  async create(tenantId: string, dto: CreateShipmentDto, actorId?: string) {
    const shipmentNumber = await this.numberGenerator.generate(
      tenantId,
      "SHIPMENT",
      { extraSegment: JOB_TYPE_CODE[dto.job_type] },
    );

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          tenant_id: tenantId,
          shipment_number: shipmentNumber,
          job_type: dto.job_type,
          status: "BOOKED",
          customer_id: dto.customer_id,
          quotation_id: dto.quotation_id,
          enquiry_id: dto.enquiry_id,
          company_id: dto.company_id,
          branch_id: dto.branch_id,
          department_id: dto.department_id,
          shipper_id: dto.shipper_id,
          consignee_id: dto.consignee_id,
          notify_party_id: dto.notify_party_id,
          delivery_agent_id: dto.delivery_agent_id,
          carrier_agent_id: dto.carrier_agent_id,
          salesperson_id: dto.salesperson_id,
          carrier_id: dto.carrier_id,
          origin_port_id: dto.origin_port_id,
          dest_port_id: dto.dest_port_id,
          por_port_id: dto.por_port_id,
          pof_port_id: dto.pof_port_id,
          place_of_delivery: dto.place_of_delivery,
          shipment_date: dto.shipment_date
            ? new Date(dto.shipment_date)
            : undefined,
          customer_address: dto.customer_address,
          freight_terms: dto.freight_terms,
          freight_payable_at: dto.freight_payable_at,
          freight_payment_type: dto.freight_payment_type,
          marks_numbers: dto.marks_numbers,
          is_cross_trade: dto.is_cross_trade ?? false,
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          atd: dto.atd ? new Date(dto.atd) : undefined,
          ata: dto.ata ? new Date(dto.ata) : undefined,
          onboard_date: dto.onboard_date
            ? new Date(dto.onboard_date)
            : undefined,
          vessel_name: dto.vessel_name,
          voyage_number: dto.voyage_number,
          flight_number: dto.flight_number,
          commodity: dto.commodity,
          hs_code: dto.hs_code,
          gross_weight: dto.gross_weight,
          chargeable_weight: dto.chargeable_weight,
          volume_cbm: dto.volume_cbm,
          pieces: dto.pieces,
          container_type_id: dto.container_type_id,
          container_count: dto.container_count,
          container_numbers: dto.container_numbers,
          seal_numbers: dto.seal_numbers,
          incoterms: dto.incoterms,
          is_dg: dto.is_dg ?? false,
          dg_class: dto.dg_class,
          notes: dto.notes,
          hbl_number: dto.hbl_number,
          hbl_date: dto.hbl_date ? new Date(dto.hbl_date) : undefined,
          bl_status: dto.bl_status ?? "DRAFT",
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (dto.charges?.length) {
        await this.createChargesTx(tx, tenantId, shipment.id, dto.charges, actorId);
        await this.recalculateTotals(tx, tenantId, shipment.id);
      }

      if (dto.quotation_id) {
        await tx.quotation.updateMany({
          where: {
            id: dto.quotation_id,
            tenant_id: tenantId,
            converted_shipment_id: null,
          },
          data: { converted_shipment_id: shipment.id, updated_by: actorId },
        });
      }

      if (dto.enquiry_id) {
        await tx.enquiry.updateMany({
          where: { id: dto.enquiry_id, tenant_id: tenantId },
          data: {
            shipment_id: shipment.id,
            status: "BOOKED",
            updated_by: actorId,
          },
        });
      }

      return tx.shipment.findFirstOrThrow({
        where: { id: shipment.id },
        include: { charges: { where: { deleted_at: null } } },
      });
    });
  }

  async findAll(tenantId: string, query: ShipmentQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ShipmentWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.job_type ? { job_type: query.job_type } : {}),
      ...(query.customer_id ? { customer_id: query.customer_id } : {}),
      ...(query.job_id ? { job_id: query.job_id } : {}),
      ...(query.quotation_id ? { quotation_id: query.quotation_id } : {}),
      ...(query.search
        ? {
            OR: [
              {
                shipment_number: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              { hbl_number: { contains: query.search, mode: "insensitive" } },
              { commodity: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [data, total] = await Promise.all([
        tx.shipment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            charges: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
          },
        }),
        tx.shipment.count({ where }),
      ]);
      return {
        success: true,
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          charges: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
        },
      }),
    );
    if (!row) throw new NotFoundException("Shipment not found.");
    return row;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateShipmentDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, id);
    const data: Prisma.ShipmentUpdateInput = {
      updated_by: actorId,
      ...(dto.customer_id !== undefined ? { customer_id: dto.customer_id } : {}),
      ...(dto.shipper_id !== undefined ? { shipper_id: dto.shipper_id } : {}),
      ...(dto.consignee_id !== undefined
        ? { consignee_id: dto.consignee_id }
        : {}),
      ...(dto.notify_party_id !== undefined
        ? { notify_party_id: dto.notify_party_id }
        : {}),
      ...(dto.delivery_agent_id !== undefined
        ? { delivery_agent_id: dto.delivery_agent_id }
        : {}),
      ...(dto.carrier_agent_id !== undefined
        ? { carrier_agent_id: dto.carrier_agent_id }
        : {}),
      ...(dto.salesperson_id !== undefined
        ? { salesperson_id: dto.salesperson_id }
        : {}),
      ...(dto.carrier_id !== undefined ? { carrier_id: dto.carrier_id } : {}),
      ...(dto.origin_port_id !== undefined
        ? { origin_port_id: dto.origin_port_id }
        : {}),
      ...(dto.dest_port_id !== undefined
        ? { dest_port_id: dto.dest_port_id }
        : {}),
      ...(dto.por_port_id !== undefined ? { por_port_id: dto.por_port_id } : {}),
      ...(dto.etd !== undefined
        ? { etd: dto.etd ? new Date(dto.etd) : null }
        : {}),
      ...(dto.eta !== undefined
        ? { eta: dto.eta ? new Date(dto.eta) : null }
        : {}),
      ...(dto.atd !== undefined
        ? { atd: dto.atd ? new Date(dto.atd) : null }
        : {}),
      ...(dto.ata !== undefined
        ? { ata: dto.ata ? new Date(dto.ata) : null }
        : {}),
      ...(dto.onboard_date !== undefined
        ? { onboard_date: dto.onboard_date ? new Date(dto.onboard_date) : null }
        : {}),
      ...(dto.vessel_name !== undefined ? { vessel_name: dto.vessel_name } : {}),
      ...(dto.voyage_number !== undefined
        ? { voyage_number: dto.voyage_number }
        : {}),
      ...(dto.flight_number !== undefined
        ? { flight_number: dto.flight_number }
        : {}),
      ...(dto.commodity !== undefined ? { commodity: dto.commodity } : {}),
      ...(dto.hs_code !== undefined ? { hs_code: dto.hs_code } : {}),
      ...(dto.gross_weight !== undefined
        ? { gross_weight: dto.gross_weight }
        : {}),
      ...(dto.chargeable_weight !== undefined
        ? { chargeable_weight: dto.chargeable_weight }
        : {}),
      ...(dto.volume_cbm !== undefined ? { volume_cbm: dto.volume_cbm } : {}),
      ...(dto.pieces !== undefined ? { pieces: dto.pieces } : {}),
      ...(dto.container_type_id !== undefined
        ? { container_type_id: dto.container_type_id }
        : {}),
      ...(dto.container_count !== undefined
        ? { container_count: dto.container_count }
        : {}),
      ...(dto.container_numbers !== undefined
        ? { container_numbers: dto.container_numbers }
        : {}),
      ...(dto.seal_numbers !== undefined
        ? { seal_numbers: dto.seal_numbers }
        : {}),
      ...(dto.incoterms !== undefined ? { incoterms: dto.incoterms } : {}),
      ...(dto.is_dg !== undefined ? { is_dg: dto.is_dg } : {}),
      ...(dto.dg_class !== undefined ? { dg_class: dto.dg_class } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      ...(dto.hbl_number !== undefined ? { hbl_number: dto.hbl_number } : {}),
      ...(dto.hbl_date !== undefined
        ? { hbl_date: dto.hbl_date ? new Date(dto.hbl_date) : null }
        : {}),
      ...(dto.bl_status !== undefined ? { bl_status: dto.bl_status } : {}),
      ...(dto.company_id !== undefined ? { company_id: dto.company_id } : {}),
      ...(dto.branch_id !== undefined ? { branch_id: dto.branch_id } : {}),
      ...(dto.department_id !== undefined
        ? { department_id: dto.department_id }
        : {}),
    };

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.shipment.update({ where: { id }, data });
      return tx.shipment.findFirstOrThrow({
        where: { id },
        include: {
          charges: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
        },
      });
    });
  }

  async changeStatus(
    tenantId: string,
    id: string,
    dto: ChangeShipmentStatusDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.update({
        where: { id },
        data: { status: dto.status, notes: dto.remarks, updated_by: actorId },
      }),
    );
  }

  async generateJob(
    tenantId: string,
    id: string,
    dto: GenerateJobFromShipmentDto,
    actorId?: string,
  ) {
    const mode = dto.mode ?? "DIRECT";
    const shipment = await this.findOne(tenantId, id);
    if (shipment.job_id && mode === "DIRECT") {
      throw new ConflictAlreadyLinked(shipment.job_id);
    }
    if (mode === "HOUSE" && !dto.master_job_id && !shipment.job_id) {
      throw new BadRequestException(
        "master_job_id is required when generating a HOUSE job without an existing master link.",
      );
    }

    const branchCode = await this.resolveBranchCode(
      tenantId,
      shipment.branch_id ?? undefined,
    );
    const jobNumber = await this.numberGenerator.generate(
      tenantId,
      "JOB_NUMBER",
      {
        extraSegment: JOB_TYPE_CODE[shipment.job_type],
        branchCode,
      },
    );

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      let parentJobId: string | null = null;
      if (mode === "HOUSE") {
        parentJobId = dto.master_job_id ?? shipment.job_id;
        if (parentJobId) {
          const master = await tx.job.findFirst({
            where: {
              id: parentJobId,
              tenant_id: tenantId,
              deleted_at: null,
              parent_job_id: null,
            },
          });
          if (!master) {
            throw new BadRequestException("Master job not found.");
          }
        }
      }

      const job = await tx.job.create({
        data: {
          tenant_id: tenantId,
          job_number: jobNumber,
          tracking_token: mintTrackingToken(),
          job_type: shipment.job_type,
          status: "BOOKING_CONFIRMED",
          parent_job_id: parentJobId,
          created_from_quote_id: shipment.quotation_id,
          company_id: shipment.company_id,
          branch_id: shipment.branch_id,
          department_id: shipment.department_id,
          shipper_id: shipment.shipper_id ?? shipment.customer_id,
          consignee_id: shipment.consignee_id,
          salesperson_id: shipment.salesperson_id,
          origin_port_id: shipment.origin_port_id,
          dest_port_id: shipment.dest_port_id,
          commodity: shipment.commodity,
          hs_code: shipment.hs_code,
          gross_weight: shipment.gross_weight,
          chargeable_weight: shipment.chargeable_weight,
          volume_cbm: shipment.volume_cbm,
          pieces: shipment.pieces,
          container_type_id: shipment.container_type_id,
          container_count: shipment.container_count,
          incoterms: shipment.incoterms,
          is_dg: shipment.is_dg,
          dg_class: shipment.dg_class,
          notes: shipment.notes,
          etd: shipment.etd,
          eta: shipment.eta,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      const charges = await tx.shipmentCharge.findMany({
        where: { shipment_id: id, tenant_id: tenantId, deleted_at: null },
      });
      const withCodes = charges.filter((c) => c.charge_code_id);
      if (withCodes.length) {
        await tx.jobCharge.createMany({
          data: withCodes.map((c) => ({
            tenant_id: tenantId,
            job_id: job.id,
            charge_code_id: c.charge_code_id!,
            description: c.description,
            quantity: c.quantity,
            unit_price: c.unit_price,
            currency_code: c.currency_code,
            exchange_rate: c.exchange_rate,
            amount: c.amount,
            amount_base_currency: c.amount_base_currency,
            tax_rate_id: c.tax_rate_id,
            tax_amount: c.tax_amount,
            is_cost: c.is_cost,
            is_provisional: c.is_provisional,
            party_id: c.party_id,
            created_by: actorId,
            updated_by: actorId,
          })),
        });
      }

      await seedJobTypeExtras(
        tx,
        tenantId,
        job.id,
        shipment.job_type,
        actorId,
      );

      const linkJobId =
        mode === "HOUSE" && parentJobId ? parentJobId : job.id;

      await tx.shipment.update({
        where: { id },
        data: {
          job_id: linkJobId,
          status: "IN_PROGRESS" as ShipmentStatus,
          updated_by: actorId,
        },
      });

      // Link converted_job_id for convenience but keep APPROVED until
      // booking-form gate / convert-to-job (portal) or staff close.
      if (shipment.quotation_id) {
        await tx.quotation.updateMany({
          where: {
            id: shipment.quotation_id,
            tenant_id: tenantId,
            status: { not: "CONVERTED" },
            converted_job_id: null,
          },
          data: {
            converted_job_id: job.id,
            updated_by: actorId,
          },
        });
      }

      if (shipment.enquiry_id) {
        await tx.enquiry.updateMany({
          where: { id: shipment.enquiry_id, tenant_id: tenantId },
          data: { job_id: job.id, status: "BOOKED", updated_by: actorId },
        });
      }

      return {
        success: true,
        jobId: job.id,
        jobNumber: job.job_number,
        shipmentId: id,
        mode,
      };
    });
  }

  async copy(
    tenantId: string,
    id: string,
    dto: CopyShipmentDto,
    actorId?: string,
  ) {
    const src = await this.findOne(tenantId, id);
    const createDto: CreateShipmentDto = {
      job_type: src.job_type,
      customer_id: src.customer_id,
      company_id: src.company_id ?? undefined,
      branch_id: src.branch_id ?? undefined,
      department_id: src.department_id ?? undefined,
      shipper_id: dto.copy_parties === false ? undefined : src.shipper_id ?? undefined,
      consignee_id:
        dto.copy_parties === false ? undefined : src.consignee_id ?? undefined,
      notify_party_id:
        dto.copy_parties === false
          ? undefined
          : src.notify_party_id ?? undefined,
      delivery_agent_id:
        dto.copy_parties === false
          ? undefined
          : src.delivery_agent_id ?? undefined,
      carrier_agent_id:
        dto.copy_parties === false
          ? undefined
          : src.carrier_agent_id ?? undefined,
      salesperson_id: src.salesperson_id ?? undefined,
      carrier_id: src.carrier_id ?? undefined,
      origin_port_id: src.origin_port_id ?? undefined,
      dest_port_id: src.dest_port_id ?? undefined,
      por_port_id: src.por_port_id ?? undefined,
      etd: dto.etd ?? undefined,
      commodity: src.commodity ?? undefined,
      hs_code: src.hs_code ?? undefined,
      pieces: dto.pieces ?? src.pieces ?? undefined,
      gross_weight:
        dto.gross_weight ??
        (src.gross_weight != null ? Number(src.gross_weight) : undefined),
      volume_cbm:
        dto.volume_cbm ??
        (src.volume_cbm != null ? Number(src.volume_cbm) : undefined),
      container_type_id:
        dto.copy_containers === false
          ? undefined
          : src.container_type_id ?? undefined,
      container_count:
        dto.copy_containers === false
          ? undefined
          : src.container_count ?? undefined,
      container_numbers:
        dto.copy_containers === false
          ? undefined
          : src.container_numbers ?? undefined,
      seal_numbers:
        dto.copy_containers === false ? undefined : src.seal_numbers ?? undefined,
      vessel_name:
        dto.copy_vessel === false ? undefined : src.vessel_name ?? undefined,
      voyage_number:
        dto.copy_vessel === false ? undefined : src.voyage_number ?? undefined,
      flight_number:
        dto.copy_vessel === false ? undefined : src.flight_number ?? undefined,
      incoterms: src.incoterms ?? undefined,
      is_dg: src.is_dg,
      dg_class: src.dg_class ?? undefined,
      charges: (src.charges ?? [])
        .filter((c) => {
          if (c.is_cost) return dto.copy_cost === true;
          return dto.copy_sale !== false;
        })
        .map((c) => ({
          charge_code_id: c.charge_code_id ?? undefined,
          description: c.description,
          quantity: Number(c.quantity),
          unit_price: Number(c.unit_price),
          currency_code: c.currency_code,
          is_cost: c.is_cost,
          party_id: c.party_id ?? undefined,
        })),
    };
    return this.create(tenantId, createDto, actorId);
  }

  async addCharge(
    tenantId: string,
    shipmentId: string,
    dto: CreateShipmentChargeDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, shipmentId);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const count = await tx.shipmentCharge.count({
        where: { shipment_id: shipmentId, deleted_at: null },
      });
      const qty = dto.quantity ?? 1;
      const amount = qty * dto.unit_price;
      const currency = dto.currency_code ?? "AED";
      const row = await tx.shipmentCharge.create({
        data: {
          tenant_id: tenantId,
          shipment_id: shipmentId,
          charge_code_id: dto.charge_code_id,
          description: dto.description,
          quantity: qty,
          unit_price: dto.unit_price,
          currency_code: currency,
          exchange_rate: 1,
          amount,
          amount_base_currency: amount,
          is_cost: dto.is_cost ?? false,
          party_id: dto.party_id,
          sort_order: count,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      await this.recalculateTotals(tx, tenantId, shipmentId);
      return row;
    });
  }

  async listCharges(tenantId: string, shipmentId: string) {
    await this.findOne(tenantId, shipmentId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipmentCharge.findMany({
        where: { shipment_id: shipmentId, tenant_id: tenantId, deleted_at: null },
        orderBy: { sort_order: "asc" },
      }),
    );
  }

  async getCharges(
    tenantId: string,
    shipmentId: string,
    dto: GetShipmentChargesDto,
    actorId?: string,
  ) {
    const shipment = await this.findOne(tenantId, shipmentId);
    const created: unknown[] = [];

    if (dto.from_quotation !== false && shipment.quotation_id) {
      const lines = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.quotationLine.findMany({
          where: {
            quotation_id: shipment.quotation_id!,
            tenant_id: tenantId,
            is_cost: false,
          },
        }),
      );
      for (const line of lines) {
        created.push(
          await this.addCharge(
            tenantId,
            shipmentId,
            {
              charge_code_id: line.charge_code_id,
              description: line.description,
              quantity: Number(line.quantity),
              unit_price: Number(line.unit_price),
              currency_code: line.currency_code,
              is_cost: false,
            },
            actorId,
          ),
        );
      }
    }

    if (dto.from_party_standard) {
      const standards = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.partyStandardCharge.findMany({
          where: {
            tenant_id: tenantId,
            party_id: shipment.customer_id,
            deleted_at: null,
          },
        }),
      );

      for (const s of standards) {
        created.push(
          await this.addCharge(
            tenantId,
            shipmentId,
            {
              charge_code_id: s.charge_code_id ?? undefined,
              description: s.description ?? "Standard charge",
              quantity: 1,
              unit_price: Number(s.default_amount),
              currency_code: s.currency_code,
              is_cost: s.is_cost,
            },
            actorId,
          ),
        );
      }
    }

    return {
      success: true,
      data: created,
      message: `Added ${created.length} charge(s).`,
    };
  }

  /** Copy charge lines from another shipment, job, or quotation. */
  async copyCharges(
    tenantId: string,
    shipmentId: string,
    dto: CopyShipmentChargesDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, shipmentId);

    const copySale = dto.copy_sale !== false;
    const copyCost = dto.copy_cost === true;
    const created: unknown[] = [];

    type SourceLine = {
      charge_code_id?: string | null;
      description: string;
      quantity: number;
      unit_price: number;
      currency_code: string;
      is_cost: boolean;
      party_id?: string | null;
    };

    let sources: SourceLine[] = [];

    if (dto.from_shipment_id) {
      if (dto.from_shipment_id === shipmentId) {
        throw new BadRequestException(
          "Cannot copy charges from the same shipment.",
        );
      }
      const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.shipmentCharge.findMany({
          where: {
            shipment_id: dto.from_shipment_id!,
            tenant_id: tenantId,
            deleted_at: null,
          },
        }),
      );
      sources = rows.map((r) => ({
        charge_code_id: r.charge_code_id,
        description: r.description,
        quantity: Number(r.quantity),
        unit_price: Number(r.unit_price),
        currency_code: r.currency_code,
        is_cost: r.is_cost,
        party_id: r.party_id,
      }));
    } else if (dto.from_job_id) {
      const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.jobCharge.findMany({
          where: {
            job_id: dto.from_job_id!,
            tenant_id: tenantId,
            deleted_at: null,
          },
        }),
      );
      sources = rows.map((r) => ({
        charge_code_id: r.charge_code_id,
        description: r.description,
        quantity: Number(r.quantity),
        unit_price: Number(r.unit_price),
        currency_code: r.currency_code,
        is_cost: r.is_cost,
        party_id: r.party_id,
      }));
    } else if (dto.from_quotation_id) {
      const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.quotationLine.findMany({
          where: {
            quotation_id: dto.from_quotation_id!,
            tenant_id: tenantId,
          },
        }),
      );
      sources = rows.map((r) => ({
        charge_code_id: r.charge_code_id,
        description: r.description,
        quantity: Number(r.quantity),
        unit_price: Number(r.unit_price),
        currency_code: r.currency_code,
        is_cost: r.is_cost,
      }));
    } else {
      throw new BadRequestException(
        "Provide from_shipment_id, from_job_id, or from_quotation_id.",
      );
    }

    for (const line of sources) {
      if (line.is_cost ? !copyCost : !copySale) continue;
      created.push(
        await this.addCharge(
          tenantId,
          shipmentId,
          {
            charge_code_id: line.charge_code_id ?? undefined,
            description: line.description,
            quantity: line.quantity,
            unit_price: line.unit_price,
            currency_code: line.currency_code,
            is_cost: line.is_cost,
            party_id: line.party_id ?? undefined,
          },
          actorId,
        ),
      );
    }

    return {
      success: true,
      data: created,
      message: `Copied ${created.length} charge(s).`,
    };
  }

  async attachToJob(
    tenantId: string,
    jobId: string,
    shipmentId: string,
    actorId?: string,
  ) {
    await this.findOne(tenantId, shipmentId);
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.update({
        where: { id: shipmentId },
        data: { job_id: jobId, updated_by: actorId },
      }),
    );
  }

  async listForJob(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        include: {
          charges: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
        },
        orderBy: { created_at: "asc" },
      }),
    );
  }

  /**
   * Queue a job document for the shipment's linked Job (booking confirmation, HBL, …).
   * Requires generate-job / attach first.
   */
  async generateLinkedJobDocument(
    tenantId: string,
    shipmentId: string,
    documentType: DocumentType,
    dto: GenerateJobDocumentDto,
    actorId?: string,
  ) {
    const shipment = await this.findOne(tenantId, shipmentId);
    if (!shipment.job_id) {
      throw new BadRequestException(
        "Generate or attach a Job before producing documents for this shipment.",
      );
    }

    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: shipment.job_id!,
          tenant_id: tenantId,
          deleted_at: null,
        },
        select: { id: true, job_type: true },
      }),
    );
    if (!job) {
      throw new NotFoundException("Linked job not found.");
    }

    assertDocumentAllowedForJobType(job.job_type, documentType);

    const options = {
      bl_id: dto.bl_id,
      number_of_originals: dto.number_of_originals,
      rider_terms: dto.rider_terms,
      switched_from_bl_number: dto.switched_from_bl_number,
      switch_consignee_id: dto.switch_consignee_id,
      switch_notify_id: dto.switch_notify_id,
      proxy_forwarder_name: dto.proxy_forwarder_name,
      proxy_forwarder_address: dto.proxy_forwarder_address,
      transhipment_port: dto.transhipment_port,
      is_express_release: documentType === "HBL_EXPRESS_RELEASE",
    };

    const task = await this.documentGeneration.enqueueJobDocument(
      tenantId,
      job.id,
      documentType,
      actorId,
      dto.layout_variant,
      dto.is_original ?? false,
      options,
    );

    return {
      task_id: task.id,
      status: task.status,
      document_type: documentType,
      job_id: job.id,
      shipment_id: shipmentId,
      message: "Document generation queued.",
    };
  }

  async createFromQuotation(
    tenantId: string,
    quotationId: string,
    actorId?: string,
  ) {
    const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: {
          tenant_id: tenantId,
          quotation_id: quotationId,
          deleted_at: null,
        },
        include: {
          charges: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
        },
        orderBy: { created_at: "asc" },
      }),
    );
    if (existing) return existing;

    const quote = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({
        where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
        include: { lines: true },
      }),
    );
    if (!quote) throw new NotFoundException("Quotation not found.");
    if (quote.status !== "APPROVED" && quote.status !== "VERIFIED") {
      throw new BadRequestException(
        "Only VERIFIED or APPROVED quotations can generate a shipment.",
      );
    }
    // Fresa: Approved unlocks generate — treat VERIFIED as needing approve first for staff-strict path
    if (quote.status === "VERIFIED") {
      throw new BadRequestException(
        "Approve the quotation (Approved) before Generate Shipment.",
      );
    }

    const enquiryId = quote.source_enquiry_id ?? undefined;
    const shipment = await this.create(
      tenantId,
      {
        job_type: quote.job_type,
        customer_id: quote.customer_id,
        quotation_id: quote.id,
        enquiry_id: enquiryId,
        company_id: quote.company_id ?? undefined,
        branch_id: quote.branch_id ?? undefined,
        department_id: quote.department_id ?? undefined,
        shipper_id: quote.shipper_id ?? undefined,
        consignee_id: quote.consignee_id ?? undefined,
        salesperson_id: quote.salesperson_id ?? undefined,
        carrier_id: quote.carrier_id ?? undefined,
        origin_port_id: quote.origin_port_id ?? undefined,
        dest_port_id: quote.dest_port_id ?? undefined,
        por_port_id: quote.por_port_id ?? undefined,
        pof_port_id: quote.pof_port_id ?? undefined,
        place_of_delivery: quote.place_of_delivery ?? undefined,
        customer_address: quote.customer_address ?? undefined,
        freight_payment_type: quote.freight_payment_type ?? undefined,
        marks_numbers: quote.marks_numbers ?? undefined,
        shipment_date: new Date().toISOString().slice(0, 10),
        etd: quote.etd?.toISOString().slice(0, 10),
        eta: quote.eta?.toISOString().slice(0, 10),
        vessel_name: quote.vessel_name ?? undefined,
        voyage_number: quote.voyage_number ?? undefined,
        commodity: quote.commodity ?? undefined,
        hs_code: quote.hs_code ?? undefined,
        gross_weight: quote.gross_weight
          ? Number(quote.gross_weight)
          : undefined,
        chargeable_weight: quote.chargeable_weight
          ? Number(quote.chargeable_weight)
          : undefined,
        volume_cbm: quote.volume_cbm ? Number(quote.volume_cbm) : undefined,
        pieces: quote.pieces ?? undefined,
        container_type_id: quote.container_type_id ?? undefined,
        container_count: quote.container_count ?? undefined,
        incoterms: quote.incoterm ?? undefined,
        is_dg: quote.is_dg,
        dg_class: quote.dg_class ?? undefined,
        notes: quote.remarks ?? undefined,
        charges: quote.lines
          .filter((l) => !l.is_cost)
          .map((l) => ({
            charge_code_id: l.charge_code_id,
            description: l.description,
            quantity: Number(l.quantity),
            unit_price: Number(l.unit_price),
            currency_code: l.currency_code,
            is_cost: false,
          })),
      },
      actorId,
    );

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.update({
        where: { id: quotationId },
        data: {
          converted_shipment_id: shipment.id,
          updated_by: actorId,
        },
      }),
    );

    return shipment;
  }

  private async createChargesTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    shipmentId: string,
    charges: CreateShipmentChargeDto[],
    actorId?: string,
  ) {
    await tx.shipmentCharge.createMany({
      data: charges.map((c, i) => {
        const qty = c.quantity ?? 1;
        const amount = qty * c.unit_price;
        return {
          tenant_id: tenantId,
          shipment_id: shipmentId,
          charge_code_id: c.charge_code_id,
          description: c.description,
          quantity: qty,
          unit_price: c.unit_price,
          currency_code: c.currency_code ?? "AED",
          exchange_rate: 1,
          amount,
          amount_base_currency: amount,
          is_cost: c.is_cost ?? false,
          party_id: c.party_id,
          sort_order: i,
          created_by: actorId,
          updated_by: actorId,
        };
      }),
    });
  }

  private async recalculateTotals(
    tx: Prisma.TransactionClient,
    tenantId: string,
    shipmentId: string,
  ) {
    const charges = await tx.shipmentCharge.findMany({
      where: { shipment_id: shipmentId, tenant_id: tenantId, deleted_at: null },
    });
    const revenue = charges
      .filter((c) => !c.is_cost)
      .reduce((s, c) => s + Number(c.amount), 0);
    const cost = charges
      .filter((c) => c.is_cost)
      .reduce((s, c) => s + Number(c.amount), 0);
    const gp = revenue - cost;
    await tx.shipment.update({
      where: { id: shipmentId },
      data: {
        revenue_total: revenue,
        cost_total: cost,
        gp_amount: gp,
        gp_percent: revenue > 0 ? (gp / revenue) * 100 : 0,
      },
    });
  }

  private async resolveBranchCode(tenantId: string, branchId?: string) {
    if (!branchId) return undefined;
    const branch = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.branch.findFirst({
        where: { id: branchId, tenant_id: tenantId },
        select: { code: true },
      }),
    );
    return branch?.code;
  }
}

class ConflictAlreadyLinked extends BadRequestException {
  constructor(jobId: string) {
    super(`Shipment is already linked to job ${jobId}.`);
  }
}
