import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ModeBookingFormService } from "./booking-forms/mode-booking-form.service";
import { AirComplianceBookingFormService } from "./air-compliance-booking-form.service";
import {
  PatchJobDepartmentDto,
  PushRoutingToSubJobsDto,
  UpsertJobCustomsRefDto,
  UpsertJobExchangeRateDto,
  UpsertJobRoutingLegDto,
} from "./dto/job-tab-panels.dto";
import { MasterLabelService } from "../masters/master-label.service";
import { JobLookupsService } from "./job-lookups.service";

type ModeFormKind =
  | "sea_fcl"
  | "sea_lcl"
  | "land"
  | "road_freight"
  | "courier"
  | "customs_clearance"
  | "warehouse";

@Injectable()
export class JobTabPanelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly modeBookingForms: ModeBookingFormService,
    private readonly airCompliance: AirComplianceBookingFormService,
    private readonly labels: MasterLabelService,
    private readonly lookups: JobLookupsService,
  ) {}

  // ─── Department ─────────────────────────────────────────────

  async getDepartmentTab(tenantId: string, jobId: string) {
    const job = await this.assertJob(tenantId, jobId);
    const named = await this.labels.enrichOne(tenantId, {
      branch_id: job.branch_id,
      company_id: job.company_id,
      department_id: job.department_id,
      salesperson_id: job.salesperson_id,
    });
    const dropdowns = await this.lookups.dropdowns(tenantId);
    return {
      success: true,
      data: {
        company_name: named.company_name,
        company: named.company,
        branch_name: named.branch_name,
        branch: named.branch,
        department_name: named.department_name,
        department: named.department,
        salesperson_name: named.salesperson_name,
        salesperson: named.salesperson,
        dropdowns: dropdowns.data,
        actions: { can_patch: true },
        path_hints: {
          patch: `/jobs/${jobId}/department`,
          dropdowns: `/jobs/lookups/dropdowns`,
        },
      },
    };
  }

  async patchDepartment(
    tenantId: string,
    jobId: string,
    dto: PatchJobDepartmentDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    if (
      dto.branch_id === undefined &&
      dto.company_id === undefined &&
      dto.department_id === undefined &&
      dto.salesperson_id === undefined &&
      dto.branch_name === undefined &&
      dto.company_name === undefined &&
      dto.department_name === undefined &&
      dto.salesperson_name === undefined
    ) {
      throw new BadRequestException(
        "Provide at least one name (company_name, branch_name, department_name, salesperson_name).",
      );
    }

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const companyId = await this.lookups.resolveCompany(
        tx,
        tenantId,
        dto.company_id,
        dto.company_name,
      );
      const branchId = await this.lookups.resolveBranch(
        tx,
        tenantId,
        dto.branch_id,
        dto.branch_name,
      );
      const departmentId = await this.lookups.resolveDepartment(
        tx,
        tenantId,
        dto.department_id,
        dto.department_name,
      );
      const salespersonId = await this.lookups.resolveUser(
        tx,
        tenantId,
        dto.salesperson_id,
        dto.salesperson_name,
      );

      const before = await tx.job.findFirst({ where: { id: jobId } });
      const updated = await tx.job.update({
        where: { id: jobId },
        data: {
          ...(branchId !== undefined ? { branch_id: branchId } : {}),
          ...(companyId !== undefined ? { company_id: companyId } : {}),
          ...(departmentId !== undefined
            ? { department_id: departmentId }
            : {}),
          ...(salespersonId !== undefined
            ? { salesperson_id: salespersonId }
            : {}),
          updated_by: actorId,
        },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_DEPARTMENT_PATCH",
          entity: "JOB",
          entity_id: jobId,
          old_values: {
            branch_id: before?.branch_id,
            company_id: before?.company_id,
            department_id: before?.department_id,
            salesperson_id: before?.salesperson_id,
          } as Prisma.InputJsonValue,
          new_values: {
            branch_id: updated.branch_id,
            company_id: updated.company_id,
            department_id: updated.department_id,
            salesperson_id: updated.salesperson_id,
          } as Prisma.InputJsonValue,
        },
      });
      return updated;
    });

    return this.getDepartmentTab(tenantId, jobId);
  }

  // ─── Exchange rates ─────────────────────────────────────────

  async getExRateTab(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobExchangeRate.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { currency_code: "asc" },
      }),
    );

    // Merge charge-derived currencies not yet persisted
    const chargeRates = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCharge.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        select: {
          currency_code: true,
          exchange_rate: true,
          sale_currency: true,
          sale_ex_rate: true,
          cost_currency: true,
          cost_ex_rate: true,
        },
      }),
    );
    const known = new Set(rows.map((r) => r.currency_code));
    const derived: Array<Record<string, unknown>> = rows.map((r) => ({
      id: r.id,
      currency_code: r.currency_code,
      exchange_rate: r.exchange_rate,
      effective_date: r.effective_date,
      source: r.source,
      persisted: true,
    }));
    for (const c of chargeRates) {
      const pairs: [string | null | undefined, unknown][] = [
        [c.currency_code, c.exchange_rate],
        [c.sale_currency, c.sale_ex_rate],
        [c.cost_currency, c.cost_ex_rate],
      ];
      for (const [code, rate] of pairs) {
        if (code && !known.has(code)) {
          known.add(code);
          derived.push({
            currency_code: code,
            exchange_rate: rate ?? 1,
            source: "from_charges",
            persisted: false,
          });
        }
      }
    }

    return {
      success: true,
      data: {
        rates: derived,
        actions: {
          upsert: true,
          apply_to_charges: true,
          delete: true,
        },
        path_hints: {
          upsert: `/jobs/${jobId}/exchange-rates`,
        },
      },
    };
  }

  async upsertExchangeRate(
    tenantId: string,
    jobId: string,
    dto: UpsertJobExchangeRateDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const currency = dto.currency_code.toUpperCase();

    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobExchangeRate.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          currency_code: currency,
          deleted_at: null,
        },
      });
      const data = {
        exchange_rate: dto.exchange_rate,
        effective_date: dto.effective_date
          ? new Date(dto.effective_date)
          : null,
        source: dto.source ?? "manual",
      };
      const saved = existing
        ? await tx.jobExchangeRate.update({
            where: { id: existing.id },
            data,
          })
        : await tx.jobExchangeRate.create({
            data: {
              tenant_id: tenantId,
              job_id: jobId,
              currency_code: currency,
              ...data,
            },
          });

      if (dto.apply_to_charges) {
        await tx.jobCharge.updateMany({
          where: {
            tenant_id: tenantId,
            job_id: jobId,
            deleted_at: null,
            OR: [
              { currency_code: currency },
              { sale_currency: currency },
              { cost_currency: currency },
            ],
          },
          data: {
            exchange_rate: dto.exchange_rate,
            sale_ex_rate: dto.exchange_rate,
            cost_ex_rate: dto.exchange_rate,
            updated_by: actorId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: existing ? "JOB_EX_RATE_UPDATE" : "JOB_EX_RATE_CREATE",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            currency_code: currency,
            exchange_rate: dto.exchange_rate,
            apply_to_charges: !!dto.apply_to_charges,
          } as Prisma.InputJsonValue,
        },
      });
      return saved;
    });

    return { success: true, data: row };
  }

  async deleteExchangeRate(
    tenantId: string,
    jobId: string,
    rateId: string,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.jobExchangeRate.findFirst({
        where: {
          id: rateId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });
      if (!row) throw new NotFoundException("Exchange rate not found.");
      await tx.jobExchangeRate.update({
        where: { id: rateId },
        data: { deleted_at: new Date() },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_EX_RATE_DELETE",
          entity: "JOB",
          entity_id: jobId,
          metadata: { rate_id: rateId, currency_code: row.currency_code },
        },
      });
    });
  }

  // ─── Routing ────────────────────────────────────────────────

  async getRoutingTab(tenantId: string, jobId: string) {
    const job = await this.assertJob(tenantId, jobId);
    let legs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobRoutingLeg.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { leg_sequence: "asc" },
      }),
    );

    if (!legs.length && (job.origin_port_id || job.dest_port_id)) {
      const seeded = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.jobRoutingLeg.create({
          data: {
            tenant_id: tenantId,
            job_id: jobId,
            leg_sequence: 1,
            origin_port_id: job.origin_port_id,
            dest_port_id: job.dest_port_id,
            etd: job.etd,
            eta: job.eta,
          },
        }),
      );
      legs = [seeded];
    }

    const isMaster = !job.parent_job_id;
    const namedLegs = await this.labels.enrichRows(tenantId, legs);
    return {
      success: true,
      data: {
        legs: namedLegs,
        actions: {
          add: true,
          update: true,
          delete: true,
          push_to_subjobs: isMaster,
        },
        path_hints: {
          add: `/jobs/${jobId}/routing-legs`,
          push_to_subjobs: `/jobs/${jobId}/routing-legs/push-to-subjobs`,
        },
      },
    };
  }

  /**
   * Fresa "Update Sub Job Details" for routing: copy master legs onto houses.
   */
  async pushRoutingToSubJobs(
    tenantId: string,
    jobId: string,
    dto: PushRoutingToSubJobsDto,
    actorId?: string,
  ) {
    const job = await this.assertJob(tenantId, jobId);
    if (job.parent_job_id) {
      throw new BadRequestException(
        "Routing push is only allowed from a master (root) job.",
      );
    }

    const replaceAll = dto.replace_all !== false;
    const includeHouses = dto.include_houses !== false;
    const isSubJobOnly = dto.is_sub_job_only === true;
    const syncHeader = dto.sync_header !== false;

    if (!includeHouses && !isSubJobOnly) {
      throw new BadRequestException(
        "Select include_houses and/or is_sub_job_only.",
      );
    }

    const result = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const masterLegs = await tx.jobRoutingLeg.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { leg_sequence: "asc" },
      });
      if (!masterLegs.length) {
        throw new BadRequestException("Master job has no routing legs to push.");
      }

      const childWhere: Prisma.JobWhereInput = {
        tenant_id: tenantId,
        parent_job_id: jobId,
        deleted_at: null,
      };
      if (isSubJobOnly) {
        childWhere.is_sub_job = true;
      }

      const children = await tx.job.findMany({
        where: childWhere,
        select: { id: true, job_number: true, is_sub_job: true },
      });

      let legsCopied = 0;
      let skipped = 0;
      const targets: string[] = [];

      for (const child of children) {
        if (!includeHouses && !child.is_sub_job) {
          skipped += 1;
          continue;
        }

        if (replaceAll) {
          await tx.jobRoutingLeg.updateMany({
            where: {
              tenant_id: tenantId,
              job_id: child.id,
              deleted_at: null,
            },
            data: { deleted_at: new Date() },
          });
        }

        for (const leg of masterLegs) {
          const created = await tx.jobRoutingLeg.create({
            data: {
              tenant_id: tenantId,
              job_id: child.id,
              leg_sequence: leg.leg_sequence,
              transport_mode: leg.transport_mode,
              port_id: leg.port_id,
              origin_port_id: leg.origin_port_id,
              dest_port_id: leg.dest_port_id,
              etd: leg.etd,
              eta: leg.eta,
              carrier_id: leg.carrier_id,
              vessel_name: leg.vessel_name,
              voyage_number: leg.voyage_number,
            },
          });
          if (syncHeader && created.leg_sequence === 1) {
            await this.maybeSyncJobRoute(tx, child.id, created);
          }
          legsCopied += 1;
        }
        targets.push(child.id);
      }

      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_ROUTING_PUSH_TO_SUBJOBS",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            targets: targets.length,
            legs_copied: legsCopied,
            skipped,
          } as Prisma.InputJsonValue,
        },
      });

      return { targets: targets.length, legs_copied: legsCopied, skipped };
    });

    return { success: true, data: result };
  }

  async createRoutingLeg(
    tenantId: string,
    jobId: string,
    dto: UpsertJobRoutingLegDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const refs = await this.resolveRoutingRefs(tx, tenantId, dto);
      const max = await tx.jobRoutingLeg.aggregate({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        _max: { leg_sequence: true },
      });
      const created = await tx.jobRoutingLeg.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          leg_sequence: dto.leg_sequence ?? (max._max.leg_sequence ?? 0) + 1,
          transport_mode: dto.transport_mode,
          port_id: refs.port_id,
          origin_port_id: refs.origin_port_id,
          dest_port_id: refs.dest_port_id,
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          carrier_id: refs.carrier_id,
          vessel_name: dto.vessel_name,
          voyage_number: dto.voyage_number,
        },
      });
      await this.maybeSyncJobRoute(tx, jobId, created);
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_ROUTING_LEG_CREATE",
          entity: "JOB",
          entity_id: jobId,
          metadata: { leg_id: created.id } as Prisma.InputJsonValue,
        },
      });
      return created;
    });
    return {
      success: true,
      data: await this.labels.enrichOne(tenantId, row),
    };
  }

  async updateRoutingLeg(
    tenantId: string,
    jobId: string,
    legId: string,
    dto: UpsertJobRoutingLegDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const leg = await tx.jobRoutingLeg.findFirst({
        where: {
          id: legId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });
      if (!leg) throw new NotFoundException("Routing leg not found.");
      const refs = await this.resolveRoutingRefs(tx, tenantId, dto);
      const updated = await tx.jobRoutingLeg.update({
        where: { id: legId },
        data: {
          ...(dto.leg_sequence !== undefined
            ? { leg_sequence: dto.leg_sequence }
            : {}),
          ...(dto.transport_mode !== undefined
            ? { transport_mode: dto.transport_mode }
            : {}),
          ...(refs.port_id !== undefined ? { port_id: refs.port_id } : {}),
          ...(refs.origin_port_id !== undefined
            ? { origin_port_id: refs.origin_port_id }
            : {}),
          ...(refs.dest_port_id !== undefined
            ? { dest_port_id: refs.dest_port_id }
            : {}),
          ...(dto.etd !== undefined
            ? { etd: dto.etd ? new Date(dto.etd) : null }
            : {}),
          ...(dto.eta !== undefined
            ? { eta: dto.eta ? new Date(dto.eta) : null }
            : {}),
          ...(refs.carrier_id !== undefined
            ? { carrier_id: refs.carrier_id }
            : {}),
          ...(dto.vessel_name !== undefined
            ? { vessel_name: dto.vessel_name }
            : {}),
          ...(dto.voyage_number !== undefined
            ? { voyage_number: dto.voyage_number }
            : {}),
        },
      });
      if (updated.leg_sequence === 1) {
        await this.maybeSyncJobRoute(tx, jobId, updated);
      }
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_ROUTING_LEG_UPDATE",
          entity: "JOB",
          entity_id: jobId,
          metadata: { leg_id: legId } as Prisma.InputJsonValue,
        },
      });
      return updated;
    });
    return {
      success: true,
      data: await this.labels.enrichOne(tenantId, row),
    };
  }

  private async resolveRoutingRefs(
    tx: Prisma.TransactionClient,
    tenantId: string,
    dto: UpsertJobRoutingLegDto,
  ) {
    const port_id = await this.lookups.resolvePort(tx, tenantId, {
      id: dto.port_id,
      name: dto.port_name,
      code: dto.port_code,
    });
    const origin_port_id = await this.lookups.resolvePort(tx, tenantId, {
      id: dto.origin_port_id,
      name: dto.origin_port_name,
      code: dto.origin_port_code,
    });
    const dest_port_id = await this.lookups.resolvePort(tx, tenantId, {
      id: dto.dest_port_id,
      name: dto.dest_port_name,
      code: dto.dest_port_code,
    });
    const carrier_id = await this.lookups.resolveParty(tx, tenantId, {
      id: dto.carrier_id,
      name: dto.carrier_name,
      label: "carrier",
    });
    return { port_id, origin_port_id, dest_port_id, carrier_id };
  }

  async deleteRoutingLeg(
    tenantId: string,
    jobId: string,
    legId: string,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const leg = await tx.jobRoutingLeg.findFirst({
        where: {
          id: legId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });
      if (!leg) throw new NotFoundException("Routing leg not found.");
      await tx.jobRoutingLeg.update({
        where: { id: legId },
        data: { deleted_at: new Date() },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_ROUTING_LEG_DELETE",
          entity: "JOB",
          entity_id: jobId,
          metadata: { leg_id: legId },
        },
      });
    });
  }

  // ─── Customs / SB-BOE ───────────────────────────────────────

  async getCustomsTab(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    const [refs, seaFcl] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) => {
        const customs = await tx.jobCustomsRef.findMany({
          where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          orderBy: { created_at: "desc" },
        });
        const fcl = await tx.seaFclJobDetail.findFirst({
          where: { job_id: jobId, tenant_id: tenantId },
          select: { hbl_number: true, mbl_number: true },
        });
        return [customs, fcl] as const;
      },
    );
    return {
      success: true,
      data: {
        refs,
        sea_fcl: seaFcl ?? null,
        actions: { add: true, update: true, delete: true },
        path_hints: {
          add: `/jobs/${jobId}/customs-refs`,
          ops_references: `/ops/JOB/${jobId}/references`,
        },
      },
    };
  }

  async createCustomsRef(
    tenantId: string,
    jobId: string,
    dto: UpsertJobCustomsRefDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const created = await tx.jobCustomsRef.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          sb_number: dto.sb_number,
          boe_number: dto.boe_number,
          customs_house: dto.customs_house,
          customs_status: dto.customs_status,
          filed_at: dto.filed_at ? new Date(dto.filed_at) : undefined,
          cleared_at: dto.cleared_at ? new Date(dto.cleared_at) : undefined,
          remarks: dto.remarks,
        },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_CUSTOMS_REF_CREATE",
          entity: "JOB",
          entity_id: jobId,
          metadata: { ref_id: created.id } as Prisma.InputJsonValue,
        },
      });
      return created;
    });
    return { success: true, data: row };
  }

  async updateCustomsRef(
    tenantId: string,
    jobId: string,
    refId: string,
    dto: UpsertJobCustomsRefDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobCustomsRef.findFirst({
        where: {
          id: refId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException("Customs ref not found.");
      const updated = await tx.jobCustomsRef.update({
        where: { id: refId },
        data: {
          ...(dto.sb_number !== undefined ? { sb_number: dto.sb_number } : {}),
          ...(dto.boe_number !== undefined
            ? { boe_number: dto.boe_number }
            : {}),
          ...(dto.customs_house !== undefined
            ? { customs_house: dto.customs_house }
            : {}),
          ...(dto.customs_status !== undefined
            ? { customs_status: dto.customs_status }
            : {}),
          ...(dto.filed_at !== undefined
            ? { filed_at: dto.filed_at ? new Date(dto.filed_at) : null }
            : {}),
          ...(dto.cleared_at !== undefined
            ? { cleared_at: dto.cleared_at ? new Date(dto.cleared_at) : null }
            : {}),
          ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
        },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_CUSTOMS_REF_UPDATE",
          entity: "JOB",
          entity_id: jobId,
          metadata: { ref_id: refId } as Prisma.InputJsonValue,
        },
      });
      return updated;
    });
    return { success: true, data: row };
  }

  async deleteCustomsRef(
    tenantId: string,
    jobId: string,
    refId: string,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobCustomsRef.findFirst({
        where: {
          id: refId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException("Customs ref not found.");
      await tx.jobCustomsRef.update({
        where: { id: refId },
        data: { deleted_at: new Date() },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_CUSTOMS_REF_DELETE",
          entity: "JOB",
          entity_id: jobId,
          metadata: { ref_id: refId },
        },
      });
    });
  }

  // ─── Booking form tab summary ───────────────────────────────

  async getBookingFormTab(tenantId: string, jobId: string) {
    const job = await this.assertJob(tenantId, jobId);
    const pathHints = this.bookingFormPathHints(job.job_type, jobId);
    const mode = this.modeKindForJobType(job.job_type);

    let form: Record<string, unknown> | null = null;
    let isComplete = false;
    let formSource: string | null = null;

    try {
      if (job.job_type === "AIR_EXPORT" || job.job_type === "AIR_IMPORT") {
        const air = await this.airCompliance.get(tenantId, jobId);
        form = air as unknown as Record<string, unknown>;
        isComplete = !!(air as { is_complete?: boolean })?.is_complete;
        formSource = "air_compliance";
      } else if (mode) {
        const modeForm = await this.modeBookingForms.get(mode, tenantId, jobId);
        form = modeForm as unknown as Record<string, unknown>;
        isComplete = !!(modeForm as { is_complete?: boolean })?.is_complete;
        formSource = mode;
      }
    } catch {
      form = null;
      isComplete = false;
    }

    return {
      success: true,
      data: {
        job_id: jobId,
        job_type: job.job_type,
        form_source: formSource,
        is_complete: isComplete,
        form: form
          ? {
              id: form.id,
              is_complete: isComplete,
              documents: form.documents ?? null,
              updated_at: form.updated_at ?? null,
            }
          : null,
        path_hints: pathHints,
        actions: {
          open_form: !!pathHints.get,
          can_complete: !!form && !isComplete,
        },
      },
    };
  }

  // ─── helpers ────────────────────────────────────────────────

  private async maybeSyncJobRoute(
    tx: Prisma.TransactionClient,
    jobId: string,
    leg: {
      leg_sequence: number;
      origin_port_id: string | null;
      dest_port_id: string | null;
      etd: Date | null;
      eta: Date | null;
    },
  ) {
    if (leg.leg_sequence !== 1) return;
    await tx.job.update({
      where: { id: jobId },
      data: {
        ...(leg.origin_port_id
          ? { origin_port_id: leg.origin_port_id }
          : {}),
        ...(leg.dest_port_id ? { dest_port_id: leg.dest_port_id } : {}),
        ...(leg.etd ? { etd: leg.etd } : {}),
        ...(leg.eta ? { eta: leg.eta } : {}),
      },
    });
  }

  private modeKindForJobType(jobType: JobType): ModeFormKind | null {
    const map: Partial<Record<JobType, ModeFormKind>> = {
      SEA_FCL_EXPORT: "sea_fcl",
      SEA_FCL_IMPORT: "sea_fcl",
      SEA_LCL_EXPORT: "sea_lcl",
      SEA_LCL_IMPORT: "sea_lcl",
      LAND: "land",
      ROAD_FREIGHT: "road_freight",
      COURIER: "courier",
      CUSTOMS_CLEARANCE: "customs_clearance",
      WAREHOUSE: "warehouse",
    };
    return map[jobType] ?? null;
  }

  private bookingFormPathHints(jobType: JobType, jobId: string) {
    if (jobType === "AIR_EXPORT" || jobType === "AIR_IMPORT") {
      return {
        get: `/jobs/${jobId}/air/compliance-form`,
        ops: `/jobs/${jobId}/air-booking-form`,
      };
    }
    const mode = this.modeKindForJobType(jobType);
    if (!mode) return { get: null as string | null };
    return {
      get: `/jobs/${jobId}/${mode.replaceAll("_", "-")}/booking-form`,
    };
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }
}
