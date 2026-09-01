import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { LeadStatus, PartyType, Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { PartiesService } from "../parties/parties.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import { salespersonScope } from "./crm-access";
import {
  ConvertLeadDto,
  CreateLeadDto,
  LeadQueryDto,
  UpdateLeadDto,
} from "./dto/crm.dto";

@Injectable()
export class CrmLeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parties: PartiesService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  async create(user: CurrentUser, dto: CreateLeadDto) {
    const assigned = dto.assigned_salesperson_id ?? user.id;
    salespersonScope(user, assigned);

    const lead = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.lead.create({
        data: {
          tenant_id: user.tenantId,
          company_name: dto.company_name.trim(),
          contact_name: dto.contact_name.trim(),
          email: dto.email?.trim().toLowerCase() || null,
          phone: dto.phone?.trim() || null,
          potential_volume: dto.potential_volume ?? null,
          service_requirements: dto.service_requirements ?? null,
          source: dto.source ?? "OTHER",
          status: dto.status ?? "NEW",
          assigned_salesperson_id: assigned,
          priority: dto.priority ?? "MEDIUM",
          tags: dto.tags ?? [],
          notes: dto.notes ?? null,
          created_by: user.id,
          updated_by: user.id,
        },
      }),
    );

    await this.addActivity(
      user.tenantId,
      lead.id,
      "CREATED",
      `Lead created (${lead.status})`,
      user.id,
    );
    if (assigned !== user.id) {
      await this.notifications.notifyStaffUser(user.tenantId, assigned, {
        type: "LEAD_ASSIGNED",
        title: "Lead assigned",
        message: `${lead.company_name} was assigned to you.`,
        entity_type: "lead",
        entity_id: lead.id,
        link_path: `/crm/leads/${lead.id}`,
      });
    }
    return { success: true, data: lead };
  }

  async findAll(user: CurrentUser, query: LeadQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const assigned = salespersonScope(user, query.assigned_salesperson_id);
    const where: Prisma.LeadWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(assigned ? { assigned_salesperson_id: assigned } : {}),
      ...(query.search
        ? {
            OR: [
              { company_name: { contains: query.search, mode: "insensitive" } },
              { contact_name: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.lead.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { updated_at: "desc" },
            include: {
              assigned_salesperson: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
              converted_party: { select: { id: true, code: true, name: true } },
            },
          }),
          tx.lead.count({ where }),
        ]),
    );

    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(user: CurrentUser, id: string) {
    const lead = await this.requireLead(user, id);
    const activities = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.leadActivity.findMany({
        where: { tenant_id: user.tenantId, lead_id: id },
        orderBy: { created_at: "desc" },
        take: 100,
      }),
    );
    return { success: true, data: { ...lead, activities } };
  }

  async update(user: CurrentUser, id: string, dto: UpdateLeadDto) {
    const existing = await this.requireLead(user, id);
    if (dto.assigned_salesperson_id)
      salespersonScope(user, dto.assigned_salesperson_id);

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.lead.update({
        where: { id },
        data: {
          ...(dto.company_name !== undefined
            ? { company_name: dto.company_name.trim() }
            : {}),
          ...(dto.contact_name !== undefined
            ? { contact_name: dto.contact_name.trim() }
            : {}),
          ...(dto.email !== undefined
            ? { email: dto.email?.trim().toLowerCase() || null }
            : {}),
          ...(dto.phone !== undefined
            ? { phone: dto.phone?.trim() || null }
            : {}),
          ...(dto.potential_volume !== undefined
            ? { potential_volume: dto.potential_volume }
            : {}),
          ...(dto.service_requirements !== undefined
            ? { service_requirements: dto.service_requirements }
            : {}),
          ...(dto.source !== undefined ? { source: dto.source } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.assigned_salesperson_id !== undefined
            ? { assigned_salesperson_id: dto.assigned_salesperson_id }
            : {}),
          ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
          ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          ...(dto.lost_reason !== undefined
            ? { lost_reason: dto.lost_reason }
            : {}),
          updated_by: user.id,
        },
      }),
    );

    if (dto.status && dto.status !== existing.status) {
      await this.addActivity(
        user.tenantId,
        id,
        "STATUS",
        `Status ${existing.status} → ${dto.status}`,
        user.id,
      );
    }
    if (
      dto.assigned_salesperson_id &&
      dto.assigned_salesperson_id !== existing.assigned_salesperson_id
    ) {
      await this.addActivity(
        user.tenantId,
        id,
        "ASSIGNED",
        "Salesperson reassigned",
        user.id,
      );
      await this.notifications.notifyStaffUser(
        user.tenantId,
        dto.assigned_salesperson_id,
        {
          type: "LEAD_ASSIGNED",
          title: "Lead assigned",
          message: `${updated.company_name} was assigned to you.`,
          entity_type: "lead",
          entity_id: id,
          link_path: `/crm/leads/${id}`,
        },
      );
    }
    return { success: true, data: updated };
  }

  async remove(user: CurrentUser, id: string) {
    await this.requireLead(user, id);
    await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.lead.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: user.id },
      }),
    );
    return { success: true, message: "Lead deleted." };
  }

  async pipeline(user: CurrentUser, assignedSalespersonId?: string) {
    const assigned = salespersonScope(user, assignedSalespersonId);
    const rows = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.lead.groupBy({
        by: ["status"],
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(assigned ? { assigned_salesperson_id: assigned } : {}),
        },
        _count: { id: true },
      }),
    );
    const statuses = Object.values(LeadStatus);
    return {
      success: true,
      data: statuses.map((status) => ({
        status,
        count: rows.find((r) => r.status === status)?._count.id ?? 0,
      })),
    };
  }

  async convert(user: CurrentUser, id: string, dto: ConvertLeadDto) {
    const lead = await this.requireLead(user, id);
    if (lead.converted_party_id) {
      throw new BadRequestException("Lead is already converted to a customer.");
    }

    const code =
      dto.party_code?.trim() ||
      `CRM-${
        lead.company_name
          .replace(/[^A-Za-z0-9]/g, "")
          .slice(0, 8)
          .toUpperCase() || "LEAD"
      }-${Date.now().toString(36).toUpperCase().slice(-4)}`;

    const party = await this.parties.create(
      user.tenantId,
      {
        party_type: PartyType.CUSTOMER,
        code: code.slice(0, 30),
        name: lead.company_name,
        email: lead.email ?? undefined,
        phone: lead.phone ?? undefined,
        salesperson_id: lead.assigned_salesperson_id ?? user.id,
        notes: `Converted from CRM lead ${lead.id}`,
        tags: lead.tags,
      },
      user.id,
    );

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.lead.update({
        where: { id },
        data: {
          converted_party_id: party.id,
          status: "WON",
          updated_by: user.id,
        },
      }),
    );
    await this.addActivity(
      user.tenantId,
      id,
      "CONVERTED",
      `Converted to customer ${party.code}`,
      user.id,
    );
    return { success: true, data: { lead: updated, party } };
  }

  async importCsv(user: CurrentUser, buffer: Buffer) {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;

    if (records.length > 2000) {
      throw new BadRequestException("CSV import is limited to 2000 rows.");
    }

    let created = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (const [index, row] of records.entries()) {
      try {
        if (!row.company_name || !row.contact_name) {
          throw new Error("company_name and contact_name are required.");
        }
        await this.create(user, {
          company_name: row.company_name,
          contact_name: row.contact_name,
          email: row.email || undefined,
          phone: row.phone || undefined,
          potential_volume: row.potential_volume || undefined,
          service_requirements: row.service_requirements || undefined,
          source: (row.source as CreateLeadDto["source"]) || undefined,
          status: (row.status as CreateLeadDto["status"]) || undefined,
          priority: (row.priority as CreateLeadDto["priority"]) || undefined,
          tags: row.tags
            ? row.tags
                .split("|")
                .map((t) => t.trim())
                .filter(Boolean)
            : undefined,
        });
        created += 1;
      } catch (err) {
        errors.push({
          row: index + 2,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return { success: true, data: { created, failed: errors.length, errors } };
  }

  async requireLead(user: CurrentUser, id: string) {
    const assigned = salespersonScope(user);
    const lead = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.lead.findFirst({
        where: {
          id,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(assigned ? { assigned_salesperson_id: assigned } : {}),
        },
        include: {
          assigned_salesperson: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          converted_party: { select: { id: true, code: true, name: true } },
        },
      }),
    );
    if (!lead) throw new NotFoundException("Lead not found.");
    return lead;
  }

  async addActivity(
    tenantId: string,
    leadId: string,
    kind: string,
    summary: string,
    actorId?: string,
  ) {
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.leadActivity.create({
        data: {
          tenant_id: tenantId,
          lead_id: leadId,
          kind,
          summary,
          created_by: actorId,
        },
      }),
    );
  }
}
