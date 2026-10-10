import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EnquiryStatus, FollowUpStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { JobsService } from "../jobs/jobs.service";
import { QuotationsService } from "../quotations/quotations.service";
import { ShipmentsService } from "../shipments/shipments.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import { isCrmManager, salespersonScope } from "./crm-access";
import { CrmLeadsService } from "./crm-leads.service";
import {
  CallLogQueryDto,
  CancelEnquiryDto,
  CreateCallLogDto,
  CreateEnquiryDto,
  CreateFollowUpDto,
  EnquiryQueryDto,
  FollowUpQueryDto,
  PatchFollowUpDto,
  UpdateEnquiryDto,
} from "./dto/crm.dto";

@Injectable()
export class CrmActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotations: QuotationsService,
    private readonly shipments: ShipmentsService,
    private readonly jobs: JobsService,
    private readonly leads: CrmLeadsService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  async createCallLog(
    user: CurrentUser,
    dto: CreateCallLogDto,
    attachmentPath?: string,
  ) {
    if (!dto.lead_id && !dto.party_id) {
      throw new BadRequestException("Provide either lead_id or party_id.");
    }
    if (dto.lead_id && dto.party_id) {
      throw new BadRequestException("Provide lead_id or party_id, not both.");
    }
    if (dto.lead_id) await this.leads.requireLead(user, dto.lead_id);

    const log = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.callLog.create({
        data: {
          tenant_id: user.tenantId,
          owner_id: user.id,
          lead_id: dto.lead_id ?? null,
          party_id: dto.party_id ?? null,
          date_time: new Date(dto.date_time),
          contact_person: dto.contact_person.trim(),
          call_type: dto.call_type,
          purpose: dto.purpose,
          discussion_summary: dto.discussion_summary.trim(),
          outcome: dto.outcome,
          next_action: dto.next_action ?? null,
          next_followup_date: dto.next_followup_date
            ? new Date(dto.next_followup_date)
            : null,
          gps_latitude: dto.gps_latitude ?? null,
          gps_longitude: dto.gps_longitude ?? null,
          duration_minutes: dto.duration_minutes ?? null,
          attachment_path: attachmentPath ?? null,
          created_by: user.id,
        },
      }),
    );

    if (dto.next_followup_date) {
      await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.followUp.create({
          data: {
            tenant_id: user.tenantId,
            owner_id: user.id,
            lead_id: dto.lead_id ?? null,
            party_id: dto.party_id ?? null,
            due_date: new Date(dto.next_followup_date!),
            subject: dto.next_action || `Follow-up after ${dto.call_type} call`,
            notes: dto.discussion_summary,
            created_by: user.id,
          },
        }),
      );
    }

    if (dto.lead_id) {
      await this.leads.addActivity(
        user.tenantId,
        dto.lead_id,
        "CALL",
        `${dto.call_type} call — ${dto.outcome}`,
        user.id,
      );
    }

    return { success: true, data: log };
  }

  async listCallLogs(user: CurrentUser, query: CallLogQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const ownerId = salespersonScope(user, query.salesperson_id);
    const where: Prisma.CallLogWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(ownerId ? { owner_id: ownerId } : {}),
      ...(query.lead_id ? { lead_id: query.lead_id } : {}),
      ...(query.party_id ? { party_id: query.party_id } : {}),
      ...(query.date
        ? {
            date_time: {
              gte: new Date(`${query.date}T00:00:00.000Z`),
              lt: new Date(`${query.date}T23:59:59.999Z`),
            },
          }
        : {}),
    };
    const [data, total] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.callLog.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { date_time: "desc" },
          }),
          tx.callLog.count({ where }),
        ]),
    );
    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async dailySheet(user: CurrentUser, date: string, salespersonId?: string) {
    const ownerId = salespersonScope(user, salespersonId);
    const day = date || new Date().toISOString().slice(0, 10);
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.callLog.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(ownerId ? { owner_id: ownerId } : {}),
          date_time: {
            gte: new Date(`${day}T00:00:00.000Z`),
            lt: new Date(`${day}T23:59:59.999Z`),
          },
        },
        orderBy: { date_time: "asc" },
      }),
    );
    return {
      success: true,
      data: { date: day, count: rows.length, calls: rows },
    };
  }

  async createFollowUp(user: CurrentUser, dto: CreateFollowUpDto) {
    const ownerId = dto.owner_id ?? user.id;
    salespersonScope(user, ownerId);
    const followUp = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.followUp.create({
        data: {
          tenant_id: user.tenantId,
          owner_id: ownerId,
          lead_id: dto.lead_id ?? null,
          party_id: dto.party_id ?? null,
          enquiry_id: dto.enquiry_id ?? null,
          due_date: new Date(dto.due_date),
          subject: dto.subject.trim(),
          notes: dto.notes ?? null,
          created_by: user.id,
        },
      }),
    );
    if (dto.lead_id) {
      await this.leads.addActivity(
        user.tenantId,
        dto.lead_id,
        "FOLLOW_UP",
        dto.subject,
        user.id,
      );
    }
    return { success: true, data: followUp };
  }

  async listFollowUps(user: CurrentUser, query: FollowUpQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const team = query.team === true && isCrmManager(user);
    const ownerId = team
      ? query.owner_id
      : salespersonScope(user, query.owner_id);
    const where: Prisma.FollowUpWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(ownerId ? { owner_id: ownerId } : {}),
      ...(query.from || query.to
        ? {
            due_date: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };
    const [data, total] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.followUp.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { due_date: "asc" },
          }),
          tx.followUp.count({ where }),
        ]),
    );
    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async calendar(user: CurrentUser, from?: string, to?: string) {
    const ownerId = salespersonScope(user);
    const start = from ? new Date(from) : new Date();
    const end = to
      ? new Date(to)
      : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.followUp.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          status: "PENDING",
          ...(ownerId ? { owner_id: ownerId } : {}),
          due_date: { gte: start, lte: end },
        },
        orderBy: { due_date: "asc" },
      }),
    );
    return { success: true, data: rows };
  }

  async patchFollowUp(user: CurrentUser, id: string, dto: PatchFollowUpDto) {
    const ownerId = salespersonScope(user);
    const existing = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.followUp.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(ownerId ? { owner_id: ownerId } : {}),
        },
      }),
    );
    if (!existing) throw new NotFoundException("Follow-up not found.");

    const completed = dto.status === FollowUpStatus.COMPLETED;
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.followUp.update({
        where: { id },
        data: {
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.due_date ? { due_date: new Date(dto.due_date) } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          ...(completed ? { completed_at: new Date() } : {}),
        },
      }),
    );
    return { success: true, data: updated };
  }

  async createEnquiry(user: CurrentUser, dto: CreateEnquiryDto) {
    const salespersonId = dto.salesperson_id ?? user.id;
    salespersonScope(user, salespersonId);
    if (dto.lead_id) await this.leads.requireLead(user, dto.lead_id);

    const enquiry = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const created = await tx.enquiry.create({
        data: {
          tenant_id: user.tenantId,
          lead_id: dto.lead_id ?? null,
          party_id: dto.party_id ?? null,
          salesperson_id: salespersonId,
          sales_coordinator_id: dto.sales_coordinator_id ?? null,
          price_coordinator_id: dto.price_coordinator_id ?? null,
          company_id: dto.company_id ?? null,
          branch_id: dto.branch_id ?? null,
          department_id: dto.department_id ?? null,
          service_type: dto.service_type,
          enquiry_date: dto.enquiry_date
            ? new Date(dto.enquiry_date)
            : new Date(),
          shipper_id: dto.shipper_id ?? null,
          consignee_id: dto.consignee_id ?? null,
          shipper_address: dto.shipper_address ?? null,
          consignee_address: dto.consignee_address ?? null,
          customer_address: dto.customer_address ?? null,
          origin_port_id: dto.origin_port_id ?? null,
          dest_port_id: dto.dest_port_id ?? null,
          por_port_id: dto.por_port_id ?? null,
          etd: dto.etd ? new Date(dto.etd) : null,
          eta: dto.eta ? new Date(dto.eta) : null,
          payable_at: dto.payable_at ?? null,
          dispatch_at: dto.dispatch_at ?? null,
          carrier_id: dto.carrier_id ?? null,
          voyage_number: dto.voyage_number ?? null,
          vessel_name: dto.vessel_name ?? null,
          unit_price: dto.unit_price ?? null,
          gross_weight: dto.gross_weight ?? null,
          chargeable_weight: dto.chargeable_weight ?? null,
          net_weight: dto.net_weight ?? null,
          weight_unit: dto.weight_unit ?? null,
          volume_cbm: dto.volume_cbm ?? null,
          cbm_unit: dto.cbm_unit ?? null,
          hs_code: dto.hs_code ?? null,
          pieces: dto.pieces ?? null,
          container_type_id: dto.container_type_id ?? null,
          container_count: dto.container_count ?? null,
          cargo_details: dto.cargo_details ?? null,
          commodity: dto.commodity ?? null,
          incoterms: dto.incoterms ?? null,
          special_requirements: dto.special_requirements ?? null,
          standard_charges_snapshot:
            (dto.standard_charges_snapshot as Prisma.InputJsonValue) ??
            undefined,
          currency_code: dto.currency_code,
          created_by: user.id,
          updated_by: user.id,
        },
      });

      if (dto.charges?.length) {
        await tx.enquiryCharge.createMany({
          data: dto.charges.map((c, i) => ({
            tenant_id: user.tenantId,
            enquiry_id: created.id,
            party_id: c.party_id ?? dto.party_id ?? null,
            department_id: c.department_id ?? dto.department_id ?? null,
            charge_code_id: c.charge_code_id ?? null,
            description: c.description,
            quantity: c.quantity ?? 1,
            unit_price: c.unit_price ?? 0,
            amount: c.amount,
            currency_code: c.currency_code ?? dto.currency_code,
            is_cost: c.is_cost ?? false,
            sort_order: i,
            created_by: user.id,
            updated_by: user.id,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          tenant_id: user.tenantId,
          user_id: user.id,
          action: "CREATE",
          entity: "ENQUIRY",
          entity_id: created.id,
          new_values: { status: created.status, service_type: created.service_type },
        },
      });

      return tx.enquiry.findFirstOrThrow({
        where: { id: created.id },
        include: {
          charges: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
        },
      });
    });
    return { success: true, data: enquiry };
  }

  async listEnquiries(user: CurrentUser, query: EnquiryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const salespersonId = salespersonScope(user, query.salesperson_id);
    const where: Prisma.EnquiryWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(salespersonId ? { salesperson_id: salespersonId } : {}),
      ...(query.department_id ? { department_id: query.department_id } : {}),
      ...(query.search
        ? {
            OR: [
              {
                commodity: { contains: query.search, mode: "insensitive" },
              },
              {
                cargo_details: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                cancel_reason: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.enquiry.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { created_at: "desc" },
          }),
          tx.enquiry.count({ where }),
        ]),
    );
    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async getEnquiry(user: CurrentUser, id: string) {
    const salespersonId = salespersonScope(user);
    const enquiry = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.enquiry.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(salespersonId ? { salesperson_id: salespersonId } : {}),
        },
        include: {
          charges: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
        },
      }),
    );
    if (!enquiry) throw new NotFoundException("Enquiry not found.");
    return { success: true, data: enquiry };
  }

  /** Detail tabs: organization, dimensions, planned consignee, costing, department. */
  async getEnquiryDetailSections(user: CurrentUser, id: string) {
    const { data: enquiry } = await this.getEnquiry(user, id);
    return {
      success: true,
      data: {
        enquiry,
        actions: {
          can_edit: enquiry.status !== "CANCELLED",
          can_report: true,
          can_copy: true,
          can_generate_quotation: !enquiry.quotation_id && enquiry.status !== "CANCELLED",
          can_generate_shipment: enquiry.status !== "CANCELLED",
          can_generate_job: enquiry.status !== "CANCELLED",
        },
        sections: {
          organization: {
            company_id: enquiry.company_id,
            branch_id: enquiry.branch_id,
            department_id: enquiry.department_id,
            party_id: enquiry.party_id,
            customer_address: enquiry.customer_address,
            enquiry_date: enquiry.enquiry_date,
            service_type: enquiry.service_type,
            currency_code: enquiry.currency_code,
          },
          port_details: {
            branch_id: enquiry.branch_id,
            department_id: enquiry.department_id,
            enquiry_date: enquiry.enquiry_date,
            customer_id: enquiry.party_id,
            shipper_id: enquiry.shipper_id,
            consignee_id: enquiry.consignee_id,
            shipper_address: enquiry.shipper_address,
            consignee_address: enquiry.consignee_address,
            customer_address: enquiry.customer_address,
            origin_port_id: enquiry.origin_port_id,
            dest_port_id: enquiry.dest_port_id,
            por_port_id: enquiry.por_port_id,
            incoterms: enquiry.incoterms,
            service_type: enquiry.service_type,
            etd: enquiry.etd,
            eta: enquiry.eta,
            payable_at: enquiry.payable_at,
            dispatch_at: enquiry.dispatch_at,
          },
          dimensions: {
            pieces: enquiry.pieces,
            unit_price: enquiry.unit_price,
            gross_weight: enquiry.gross_weight,
            chargeable_weight: enquiry.chargeable_weight,
            net_weight: enquiry.net_weight,
            weight_unit: enquiry.weight_unit,
            volume_cbm: enquiry.volume_cbm,
            cbm_unit: enquiry.cbm_unit,
            hs_code: enquiry.hs_code,
            commodity: enquiry.commodity,
            container_type_id: enquiry.container_type_id,
            container_count: enquiry.container_count,
            cargo_details: enquiry.cargo_details,
          },
          planned_consignee: {
            customer_id: enquiry.party_id,
            department_id: enquiry.department_id,
            sales_coordinator_id: enquiry.sales_coordinator_id,
            salesperson_id: enquiry.salesperson_id,
            price_coordinator_id: enquiry.price_coordinator_id,
            carrier_id: enquiry.carrier_id,
            voyage_number: enquiry.voyage_number,
            vessel_name: enquiry.vessel_name,
            consignee_id: enquiry.consignee_id,
            consignee_address: enquiry.consignee_address,
            shipper_id: enquiry.shipper_id,
            shipper_address: enquiry.shipper_address,
          },
          costing: {
            currency_code: enquiry.currency_code,
            charges: enquiry.charges,
            standard_charges_snapshot: enquiry.standard_charges_snapshot,
          },
          department: {
            department_id: enquiry.department_id,
            branch_id: enquiry.branch_id,
            company_id: enquiry.company_id,
          },
        },
      },
    };
  }

  async copyEnquiry(user: CurrentUser, id: string) {
    const { data: src } = await this.getEnquiry(user, id);
    const copyDto: CreateEnquiryDto = {
      lead_id: src.lead_id ?? undefined,
      party_id: src.party_id ?? undefined,
      salesperson_id: src.salesperson_id ?? user.id,
      sales_coordinator_id: src.sales_coordinator_id ?? undefined,
      price_coordinator_id: src.price_coordinator_id ?? undefined,
      company_id: src.company_id ?? undefined,
      branch_id: src.branch_id ?? undefined,
      department_id: src.department_id ?? undefined,
      service_type: src.service_type,
      enquiry_date: new Date().toISOString().slice(0, 10),
      shipper_id: src.shipper_id ?? undefined,
      consignee_id: src.consignee_id ?? undefined,
      shipper_address: src.shipper_address ?? undefined,
      consignee_address: src.consignee_address ?? undefined,
      customer_address: src.customer_address ?? undefined,
      origin_port_id: src.origin_port_id ?? undefined,
      dest_port_id: src.dest_port_id ?? undefined,
      por_port_id: src.por_port_id ?? undefined,
      etd: src.etd?.toISOString().slice(0, 10),
      eta: src.eta?.toISOString().slice(0, 10),
      payable_at: src.payable_at ?? undefined,
      dispatch_at: src.dispatch_at ?? undefined,
      carrier_id: src.carrier_id ?? undefined,
      voyage_number: src.voyage_number ?? undefined,
      vessel_name: src.vessel_name ?? undefined,
      unit_price: src.unit_price != null ? Number(src.unit_price) : undefined,
      gross_weight: src.gross_weight != null ? Number(src.gross_weight) : undefined,
      chargeable_weight:
        src.chargeable_weight != null ? Number(src.chargeable_weight) : undefined,
      net_weight: src.net_weight != null ? Number(src.net_weight) : undefined,
      weight_unit: src.weight_unit ?? undefined,
      volume_cbm: src.volume_cbm != null ? Number(src.volume_cbm) : undefined,
      cbm_unit: src.cbm_unit ?? undefined,
      hs_code: src.hs_code ?? undefined,
      pieces: src.pieces ?? undefined,
      container_type_id: src.container_type_id ?? undefined,
      container_count: src.container_count ?? undefined,
      cargo_details: src.cargo_details ?? undefined,
      commodity: src.commodity ?? undefined,
      incoterms: src.incoterms ?? undefined,
      special_requirements: src.special_requirements ?? undefined,
      standard_charges_snapshot:
        (src.standard_charges_snapshot as Record<string, unknown>) ?? undefined,
      charges: src.charges?.map((c) => ({
        party_id: c.party_id ?? undefined,
        department_id: c.department_id ?? undefined,
        charge_code_id: c.charge_code_id ?? undefined,
        description: c.description,
        quantity: Number(c.quantity),
        unit_price: Number(c.unit_price),
        amount: Number(c.amount),
        currency_code: c.currency_code,
        is_cost: c.is_cost,
      })),
      currency_code: src.currency_code,
    };
    return this.createEnquiry(user, copyDto);
  }

  async updateEnquiry(user: CurrentUser, id: string, dto: UpdateEnquiryDto) {
    const before = await this.requireEnquiry(user, id);
    if (dto.salesperson_id) salespersonScope(user, dto.salesperson_id);
    const updated = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const row = await tx.enquiry.update({
        where: { id },
        data: {
          ...(dto.party_id !== undefined ? { party_id: dto.party_id } : {}),
          ...(dto.lead_id !== undefined ? { lead_id: dto.lead_id } : {}),
          ...(dto.salesperson_id !== undefined
            ? { salesperson_id: dto.salesperson_id }
            : {}),
          ...(dto.sales_coordinator_id !== undefined
            ? { sales_coordinator_id: dto.sales_coordinator_id }
            : {}),
          ...(dto.price_coordinator_id !== undefined
            ? { price_coordinator_id: dto.price_coordinator_id }
            : {}),
          ...(dto.company_id !== undefined
            ? { company_id: dto.company_id }
            : {}),
          ...(dto.branch_id !== undefined ? { branch_id: dto.branch_id } : {}),
          ...(dto.department_id !== undefined
            ? { department_id: dto.department_id }
            : {}),
          ...(dto.service_type !== undefined
            ? { service_type: dto.service_type }
            : {}),
          ...(dto.enquiry_date !== undefined
            ? {
                enquiry_date: dto.enquiry_date
                  ? new Date(dto.enquiry_date)
                  : null,
              }
            : {}),
          ...(dto.shipper_id !== undefined
            ? { shipper_id: dto.shipper_id }
            : {}),
          ...(dto.consignee_id !== undefined
            ? { consignee_id: dto.consignee_id }
            : {}),
          ...(dto.shipper_address !== undefined
            ? { shipper_address: dto.shipper_address }
            : {}),
          ...(dto.consignee_address !== undefined
            ? { consignee_address: dto.consignee_address }
            : {}),
          ...(dto.customer_address !== undefined
            ? { customer_address: dto.customer_address }
            : {}),
          ...(dto.origin_port_id !== undefined
            ? { origin_port_id: dto.origin_port_id }
            : {}),
          ...(dto.dest_port_id !== undefined
            ? { dest_port_id: dto.dest_port_id }
            : {}),
          ...(dto.por_port_id !== undefined
            ? { por_port_id: dto.por_port_id }
            : {}),
          ...(dto.etd !== undefined
            ? { etd: dto.etd ? new Date(dto.etd) : null }
            : {}),
          ...(dto.eta !== undefined
            ? { eta: dto.eta ? new Date(dto.eta) : null }
            : {}),
          ...(dto.payable_at !== undefined
            ? { payable_at: dto.payable_at }
            : {}),
          ...(dto.dispatch_at !== undefined
            ? { dispatch_at: dto.dispatch_at }
            : {}),
          ...(dto.carrier_id !== undefined
            ? { carrier_id: dto.carrier_id }
            : {}),
          ...(dto.voyage_number !== undefined
            ? { voyage_number: dto.voyage_number }
            : {}),
          ...(dto.vessel_name !== undefined
            ? { vessel_name: dto.vessel_name }
            : {}),
          ...(dto.unit_price !== undefined
            ? { unit_price: dto.unit_price }
            : {}),
          ...(dto.gross_weight !== undefined
            ? { gross_weight: dto.gross_weight }
            : {}),
          ...(dto.chargeable_weight !== undefined
            ? { chargeable_weight: dto.chargeable_weight }
            : {}),
          ...(dto.net_weight !== undefined
            ? { net_weight: dto.net_weight }
            : {}),
          ...(dto.weight_unit !== undefined
            ? { weight_unit: dto.weight_unit }
            : {}),
          ...(dto.volume_cbm !== undefined
            ? { volume_cbm: dto.volume_cbm }
            : {}),
          ...(dto.cbm_unit !== undefined ? { cbm_unit: dto.cbm_unit } : {}),
          ...(dto.hs_code !== undefined ? { hs_code: dto.hs_code } : {}),
          ...(dto.pieces !== undefined ? { pieces: dto.pieces } : {}),
          ...(dto.container_type_id !== undefined
            ? { container_type_id: dto.container_type_id }
            : {}),
          ...(dto.container_count !== undefined
            ? { container_count: dto.container_count }
            : {}),
          ...(dto.cargo_details !== undefined
            ? { cargo_details: dto.cargo_details }
            : {}),
          ...(dto.commodity !== undefined ? { commodity: dto.commodity } : {}),
          ...(dto.incoterms !== undefined ? { incoterms: dto.incoterms } : {}),
          ...(dto.special_requirements !== undefined
            ? { special_requirements: dto.special_requirements }
            : {}),
          ...(dto.standard_charges_snapshot !== undefined
            ? {
                standard_charges_snapshot:
                  dto.standard_charges_snapshot as Prisma.InputJsonValue,
              }
            : {}),
          ...(dto.currency_code !== undefined
            ? { currency_code: dto.currency_code }
            : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          updated_by: user.id,
        },
      });

      if (dto.charges) {
        await tx.enquiryCharge.updateMany({
          where: { enquiry_id: id, tenant_id: user.tenantId, deleted_at: null },
          data: { deleted_at: new Date() },
        });
        if (dto.charges.length) {
          await tx.enquiryCharge.createMany({
            data: dto.charges.map((c, i) => ({
              tenant_id: user.tenantId,
              enquiry_id: id,
              party_id: c.party_id ?? dto.party_id ?? row.party_id,
              department_id:
                c.department_id ?? dto.department_id ?? row.department_id,
              charge_code_id: c.charge_code_id ?? null,
              description: c.description,
              quantity: c.quantity ?? 1,
              unit_price: c.unit_price ?? 0,
              amount: c.amount,
              currency_code: c.currency_code ?? row.currency_code,
              is_cost: c.is_cost ?? false,
              sort_order: i,
              created_by: user.id,
              updated_by: user.id,
            })),
          });
        }
      }

      await tx.auditLog.create({
        data: {
          tenant_id: user.tenantId,
          user_id: user.id,
          action: "UPDATE",
          entity: "ENQUIRY",
          entity_id: id,
          old_values: { status: before.status },
          new_values: { status: row.status },
        },
      });

      return tx.enquiry.findFirstOrThrow({
        where: { id },
        include: {
          charges: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
        },
      });
    });
    return { success: true, data: updated };
  }

  async cancelEnquiry(user: CurrentUser, id: string, dto: CancelEnquiryDto) {
    const enquiry = await this.requireEnquiry(user, id);
    if (enquiry.status === "CANCELLED") {
      throw new BadRequestException("Enquiry is already cancelled.");
    }
    if (enquiry.status === "BOOKED") {
      throw new BadRequestException("Booked enquiries cannot be cancelled.");
    }

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.enquiry.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancel_reason: dto.cancel_reason.trim(),
          cancelled_at: new Date(),
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async convertToQuote(user: CurrentUser, id: string) {
    return this.generateQuotation(user, id);
  }

  async generateQuotation(user: CurrentUser, id: string) {
    const { data: enquiry } = await this.getEnquiry(user, id);
    if (enquiry.status === "CANCELLED") {
      throw new BadRequestException("Cancelled enquiry cannot be quoted.");
    }
    if (enquiry.quotation_id) {
      throw new BadRequestException(
        "Enquiry already converted to a quotation.",
      );
    }

    const customerId = await this.resolveCustomerId(user, enquiry);
    const today = new Date().toISOString().slice(0, 10);
    const quote = await this.quotations.create(
      user.tenantId,
      {
        job_type: enquiry.service_type,
        customer_id: customerId,
        company_id: enquiry.company_id ?? undefined,
        branch_id: enquiry.branch_id ?? undefined,
        department_id: enquiry.department_id ?? undefined,
        salesperson_id: enquiry.salesperson_id ?? user.id,
        carrier_id: enquiry.carrier_id ?? undefined,
        origin_port_id: enquiry.origin_port_id ?? undefined,
        dest_port_id: enquiry.dest_port_id ?? undefined,
        por_port_id: enquiry.por_port_id ?? undefined,
        customer_address: enquiry.customer_address ?? undefined,
        shipper_id: enquiry.shipper_id ?? undefined,
        consignee_id: enquiry.consignee_id ?? undefined,
        etd: enquiry.etd?.toISOString().slice(0, 10),
        eta: enquiry.eta?.toISOString().slice(0, 10),
        vessel_name: enquiry.vessel_name ?? undefined,
        voyage_number: enquiry.voyage_number ?? undefined,
        quotation_date: today,
        source_enquiry_id: enquiry.id,
        gross_weight: enquiry.gross_weight
          ? Number(enquiry.gross_weight)
          : undefined,
        chargeable_weight: enquiry.chargeable_weight
          ? Number(enquiry.chargeable_weight)
          : undefined,
        volume_cbm: enquiry.volume_cbm ? Number(enquiry.volume_cbm) : undefined,
        pieces: enquiry.pieces ?? undefined,
        container_type_id: enquiry.container_type_id ?? undefined,
        container_count: enquiry.container_count ?? undefined,
        incoterm: enquiry.incoterms ?? undefined,
        commodity: enquiry.commodity ?? enquiry.cargo_details ?? undefined,
        hs_code: enquiry.hs_code ?? undefined,
        special_requirements: enquiry.special_requirements ?? undefined,
        currency_code: enquiry.currency_code,
        remarks: `Generated from CRM enquiry ${enquiry.id}`,
      },
      user.id,
    );

    const chargeLines = (enquiry.charges ?? []).filter((c) => c.charge_code_id);
    for (const c of chargeLines) {
      await this.quotations.addLine(user.tenantId, quote.id, {
        charge_code_id: c.charge_code_id!,
        description: c.description,
        quantity: Number(c.quantity),
        unit_price: Number(c.unit_price),
        currency_code: c.currency_code,
        is_cost: c.is_cost,
        sort_order: c.sort_order,
      }, user.id);
    }

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.enquiry.update({
        where: { id },
        data: { quotation_id: quote.id, status: "QUOTED", updated_by: user.id },
      }),
    );
    return { success: true, data: { enquiry: updated, quotation: quote } };
  }

  async generateShipment(user: CurrentUser, id: string) {
    const enquiry = await this.requireEnquiry(user, id);
    if (enquiry.status === "CANCELLED") {
      throw new BadRequestException(
        "Cancelled enquiry cannot generate a shipment.",
      );
    }
    if (enquiry.shipment_id) {
      throw new BadRequestException("Enquiry already has a shipment.");
    }

    const customerId = await this.resolveCustomerId(user, enquiry);
    const shipment = await this.shipments.create(
      user.tenantId,
      {
        job_type: enquiry.service_type,
        customer_id: customerId,
        enquiry_id: enquiry.id,
        quotation_id: enquiry.quotation_id ?? undefined,
        company_id: enquiry.company_id ?? undefined,
        branch_id: enquiry.branch_id ?? undefined,
        department_id: enquiry.department_id ?? undefined,
        shipper_id: enquiry.shipper_id ?? customerId,
        consignee_id: enquiry.consignee_id ?? undefined,
        salesperson_id: enquiry.salesperson_id ?? user.id,
        carrier_id: enquiry.carrier_id ?? undefined,
        origin_port_id: enquiry.origin_port_id ?? undefined,
        dest_port_id: enquiry.dest_port_id ?? undefined,
        por_port_id: enquiry.por_port_id ?? undefined,
        etd: enquiry.etd?.toISOString().slice(0, 10),
        eta: enquiry.eta?.toISOString().slice(0, 10),
        vessel_name: enquiry.vessel_name ?? undefined,
        voyage_number: enquiry.voyage_number ?? undefined,
        commodity: enquiry.commodity ?? enquiry.cargo_details ?? undefined,
        hs_code: enquiry.hs_code ?? undefined,
        gross_weight: enquiry.gross_weight
          ? Number(enquiry.gross_weight)
          : undefined,
        chargeable_weight: enquiry.chargeable_weight
          ? Number(enquiry.chargeable_weight)
          : undefined,
        volume_cbm: enquiry.volume_cbm ? Number(enquiry.volume_cbm) : undefined,
        pieces: enquiry.pieces ?? undefined,
        container_type_id: enquiry.container_type_id ?? undefined,
        container_count: enquiry.container_count ?? undefined,
        incoterms: enquiry.incoterms ?? undefined,
        notes: enquiry.special_requirements ?? undefined,
      },
      user.id,
    );

    const updated = await this.requireEnquiry(user, id);
    return { success: true, data: { enquiry: updated, shipment } };
  }

  async generateJob(user: CurrentUser, id: string) {
    const enquiry = await this.requireEnquiry(user, id);
    if (enquiry.status === "CANCELLED") {
      throw new BadRequestException("Cancelled enquiry cannot generate a job.");
    }
    if (enquiry.job_id) {
      throw new BadRequestException("Enquiry already has a job.");
    }

    const customerId = await this.resolveCustomerId(user, enquiry);
    const job = await this.jobs.create(user.tenantId, {
      job_type: enquiry.service_type,
      company_id: enquiry.company_id ?? undefined,
      branch_id: enquiry.branch_id ?? undefined,
      department_id: enquiry.department_id ?? undefined,
      shipper_id: customerId,
      salesperson_id: enquiry.salesperson_id ?? user.id,
      origin_port_id: enquiry.origin_port_id ?? undefined,
      dest_port_id: enquiry.dest_port_id ?? undefined,
      commodity: enquiry.commodity ?? enquiry.cargo_details ?? undefined,
      gross_weight: enquiry.gross_weight
        ? Number(enquiry.gross_weight)
        : undefined,
      chargeable_weight: enquiry.chargeable_weight
        ? Number(enquiry.chargeable_weight)
        : undefined,
      volume_cbm: enquiry.volume_cbm ? Number(enquiry.volume_cbm) : undefined,
      pieces: enquiry.pieces ?? undefined,
      container_type_id: enquiry.container_type_id ?? undefined,
      container_count: enquiry.container_count ?? undefined,
      incoterms: enquiry.incoterms ?? undefined,
      notes: enquiry.special_requirements ?? undefined,
      etd: enquiry.etd?.toISOString(),
      eta: enquiry.eta?.toISOString(),
    }, user.id);

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.enquiry.update({
        where: { id },
        data: {
          job_id: job.id,
          status: "BOOKED",
          updated_by: user.id,
        },
      }),
    );

    if (enquiry.shipment_id) {
      await this.prisma.runWithTenant(user.tenantId, (tx) =>
        tx.shipment.updateMany({
          where: {
            id: enquiry.shipment_id!,
            tenant_id: user.tenantId,
            job_id: null,
          },
          data: { job_id: job.id, updated_by: user.id },
        }),
      );
    }

    return { success: true, data: { enquiry: updated, job } };
  }

  async openEnquiriesReport(user: CurrentUser, query: EnquiryQueryDto) {
    const openStatuses: EnquiryStatus[] = ["NEW", "QUOTED"];
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const salespersonId = salespersonScope(user, query.salesperson_id);
    const where: Prisma.EnquiryWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      status:
        query.status && openStatuses.includes(query.status)
          ? query.status
          : { in: openStatuses },
      ...(salespersonId ? { salesperson_id: salespersonId } : {}),
      ...(query.department_id ? { department_id: query.department_id } : {}),
    };
    const [data, total] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.enquiry.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { created_at: "desc" },
          }),
          tx.enquiry.count({ where }),
        ]),
    );
    return {
      success: true,
      report: "open_enquiries",
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async enquiryPdfPack(user: CurrentUser, id: string) {
    const enquiry = await this.requireEnquiry(user, id);
    return {
      success: true,
      for_pdf: true,
      template: "crm_enquiry",
      data: enquiry,
    };
  }

  async notifyDueFollowUps() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        status: { in: ["ACTIVE", "TRIAL"] },
        is_active: true,
        deleted_at: null,
      },
      select: { id: true },
    });
    let notified = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const tenant of tenants) {
      const due = await this.prisma.runWithTenant(tenant.id, (tx) =>
        tx.followUp.findMany({
          where: {
            tenant_id: tenant.id,
            deleted_at: null,
            status: "PENDING",
            reminder_sent_at: null,
            due_date: { lte: today },
          },
          take: 200,
        }),
      );
      for (const item of due) {
        const claimed = await this.prisma.runWithTenant(tenant.id, (tx) =>
          tx.followUp.updateMany({
            where: {
              id: item.id,
              tenant_id: tenant.id,
              deleted_at: null,
              status: "PENDING",
              reminder_sent_at: null,
            },
            data: { reminder_sent_at: new Date() },
          }),
        );

        if (claimed.count === 0) {
          continue;
        }

        await this.notifications.notifyStaffUser(tenant.id, item.owner_id, {
          type: "FOLLOW_UP_DUE",
          title: "Follow-up due",
          message: item.subject,
          entity_type: "follow_up",
          entity_id: item.id,
          link_path: `/crm/follow-ups/${item.id}`,
        });
        notified += 1;
      }
    }
    return notified;
  }

  private async resolveCustomerId(
    user: CurrentUser,
    enquiry: { party_id: string | null; lead_id: string | null },
  ) {
    let customerId = enquiry.party_id;
    if (!customerId && enquiry.lead_id) {
      const lead = await this.leads.requireLead(user, enquiry.lead_id);
      customerId = lead.converted_party_id;
    }
    if (!customerId) {
      throw new BadRequestException(
        "Enquiry needs a customer party. Convert the lead first or set party_id.",
      );
    }
    return customerId;
  }

  private async requireEnquiry(user: CurrentUser, id: string) {
    const salespersonId = salespersonScope(user);
    const enquiry = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.enquiry.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(salespersonId ? { salesperson_id: salespersonId } : {}),
        },
      }),
    );
    if (!enquiry) throw new NotFoundException("Enquiry not found.");
    return enquiry;
  }
}
