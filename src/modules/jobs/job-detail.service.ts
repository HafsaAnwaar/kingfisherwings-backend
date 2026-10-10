import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobStatus, JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ShipmentsService } from "../shipments/shipments.service";
import { ChangeJobStatusDto } from "./dto/job-detail.dto";

const DETAIL_TABS = [
  "show_all",
  "info",
  "organization",
  "dimensions",
  "planned_container",
  "actual_container",
  "ex_rate",
  "costing",
  "department",
  "shipping_bill_boe",
  "routing",
  "customs",
  "history",
  "booking_form",
  "shipments",
] as const;

const AIR_JOB_TYPES: JobType[] = ["AIR_EXPORT", "AIR_IMPORT"];

/** Allowed operational status transitions (close/cancel use dedicated endpoints). */
const ALLOWED_TRANSITIONS: Partial<Record<JobStatus, JobStatus[]>> = {
  ENQUIRY: ["QUOTATION", "BOOKING_CONFIRMED", "ON_HOLD", "CANCELLED"],
  QUOTATION: ["BOOKING_CONFIRMED", "ON_HOLD", "CANCELLED"],
  BOOKING_CONFIRMED: [
    "IN_PROGRESS",
    "ON_HOLD",
    "DOCS_PENDING",
    "CANCELLED",
  ],
  IN_PROGRESS: [
    "ON_HOLD",
    "DOCS_PENDING",
    "CUSTOMS_CLEARANCE",
    "DELIVERED",
    "COMPLETED",
  ],
  DOCS_PENDING: [
    "IN_PROGRESS",
    "ON_HOLD",
    "CUSTOMS_CLEARANCE",
    "DELIVERED",
    "COMPLETED",
  ],
  CUSTOMS_CLEARANCE: [
    "IN_PROGRESS",
    "ON_HOLD",
    "DELIVERED",
    "COMPLETED",
  ],
  DELIVERED: ["COMPLETED", "ON_HOLD"],
  ON_HOLD: [
    "BOOKING_CONFIRMED",
    "IN_PROGRESS",
    "DOCS_PENDING",
    "CUSTOMS_CLEARANCE",
    "CANCELLED",
  ],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class JobDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shipments: ShipmentsService,
  ) {}

  async getDetail(tenantId: string, id: string) {
    const job = await this.loadJob(tenantId, id);
    const links = await this.resolveLinks(tenantId, job);
    return {
      success: true,
      data: {
        job: this.headerPayload(job),
        links,
        actions: this.actionFlags(job),
        sections: await this.sectionSummaries(tenantId, job),
        tabs: DETAIL_TABS,
      },
    };
  }

  async getDetailTab(tenantId: string, id: string, tab: string) {
    const normalized = tab.toLowerCase();
    if (!DETAIL_TABS.includes(normalized as (typeof DETAIL_TABS)[number])) {
      throw new BadRequestException(
        `Unknown tab "${tab}". Allowed: ${DETAIL_TABS.join(", ")}`,
      );
    }
    const job = await this.loadJob(tenantId, id);

    if (normalized === "show_all" || normalized === "info") {
      return { success: true, data: this.headerPayload(job) };
    }
    if (normalized === "organization") {
      return {
        success: true,
        data: {
          company_id: job.company_id,
          branch_id: job.branch_id,
          department_id: job.department_id,
          shipper_id: job.shipper_id,
          consignee_id: job.consignee_id,
          billing_party_id: job.billing_party_id,
          salesperson_id: job.salesperson_id,
          agent_id: job.agent_id,
        },
      };
    }
    if (normalized === "dimensions") {
      return {
        success: true,
        data: {
          pieces: job.pieces,
          gross_weight: job.gross_weight,
          chargeable_weight: job.chargeable_weight,
          volume_cbm: job.volume_cbm,
          hs_code: job.hs_code,
          commodity: job.commodity,
          container_type_id: job.container_type_id,
          container_count: job.container_count,
        },
      };
    }
    if (normalized === "costing") {
      return {
        success: true,
        data: {
          revenue_total: job.revenue_total,
          cost_total: job.cost_total,
          gp_amount: job.gp_amount,
          gp_percent: job.gp_percent,
          charges: job.charges,
        },
      };
    }
    if (normalized === "department") {
      return {
        success: true,
        data: {
          branch_id: job.branch_id,
          company_id: job.company_id,
          department_id: job.department_id,
          salesperson_id: job.salesperson_id,
        },
      };
    }
    if (normalized === "planned_container" || normalized === "actual_container") {
      return {
        success: true,
        data: await this.jobContainers(tenantId, id),
      };
    }
    if (normalized === "ex_rate") {
      const currencies = [
        ...new Set(
          job.charges
            .map((c) => c.currency_code)
            .filter((c): c is string => !!c),
        ),
      ];
      return {
        success: true,
        data: currencies.map((currency_code) => {
          const line = job.charges.find((c) => c.currency_code === currency_code);
          return {
            currency_code,
            exchange_rate: line?.exchange_rate ?? 1,
          };
        }),
      };
    }
    if (normalized === "routing") {
      return {
        success: true,
        data: [
          {
            leg_sequence: 1,
            origin_port_id: job.origin_port_id,
            dest_port_id: job.dest_port_id,
            etd: job.etd,
            eta: job.eta,
          },
        ],
      };
    }
    if (normalized === "customs" || normalized === "shipping_bill_boe") {
      return {
        success: true,
        data: {
          notes: "Use /ops/JOB/:id/references for SB/BOE refs; mode details hold BL numbers.",
          sea_fcl: job.sea_fcl_details
            ? {
                hbl_number: job.sea_fcl_details.hbl_number,
                mbl_number: job.sea_fcl_details.mbl_number,
              }
            : null,
        },
      };
    }
    if (normalized === "history") {
      return this.history(tenantId, id);
    }
    if (normalized === "booking_form") {
      return {
        success: true,
        data: {
          job_id: id,
          job_type: job.job_type,
          path_hints: this.bookingFormPathHints(job.job_type, id),
        },
      };
    }
    if (normalized === "shipments") {
      const rows = await this.shipments.listForJob(tenantId, id);
      return { success: true, data: rows };
    }
    return { success: true, data: {} };
  }

  async changeStatus(
    tenantId: string,
    id: string,
    dto: ChangeJobStatusDto,
    actorId?: string,
  ) {
    const job = await this.loadJob(tenantId, id);
    const target = dto.status;
    if (target === job.status) {
      return { success: true, data: job };
    }
    if (target === "COMPLETED") {
      throw new BadRequestException(
        "Use POST /jobs/:id/close to complete a job (checklist enforced).",
      );
    }
    if (target === "CANCELLED") {
      throw new BadRequestException(
        "Use POST /jobs/:id/cancel to cancel a job.",
      );
    }
    const allowed = ALLOWED_TRANSITIONS[job.status] ?? [];
    if (!allowed.includes(target)) {
      throw new BadRequestException(
        `Cannot change job status from ${job.status} to ${target}. Allowed: ${allowed.join(", ") || "none"}.`,
      );
    }

    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.job.update({
        where: { id },
        data: {
          status: target,
          updated_by: actorId,
        },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_STATUS_CHANGE",
          entity: "JOB",
          entity_id: id,
          metadata: {
            from: job.status,
            to: target,
            reason: dto.reason ?? null,
          } as Prisma.InputJsonValue,
        },
      });
      return row;
    });

    return { success: true, data: updated };
  }

  async stop(
    tenantId: string,
    id: string,
    reason?: string,
    actorId?: string,
  ) {
    return this.changeStatus(
      tenantId,
      id,
      { status: "ON_HOLD", reason: reason ?? "Stopped / put on hold" },
      actorId,
    );
  }

  async history(tenantId: string, id: string) {
    await this.loadJob(tenantId, id);
    const entities = ["JOB", "job", "Job", "OpsJOB"];
    const data = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.findMany({
        where: {
          tenant_id: tenantId,
          entity_id: id,
          OR: entities.map((e) => ({
            entity: { equals: e, mode: "insensitive" },
          })),
        },
        orderBy: { created_at: "desc" },
        take: 200,
      }),
    );
    return { success: true, data };
  }

  private async loadJob(tenantId: string, id: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          charges: {
            where: { deleted_at: null },
            orderBy: { created_at: "asc" },
          },
          sea_fcl_details: true,
          air_details: true,
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }

  private headerPayload(job: Awaited<ReturnType<typeof this.loadJob>>) {
    const sea = job.sea_fcl_details;
    return {
      id: job.id,
      job_number: job.job_number,
      status: job.status,
      job_type: job.job_type,
      branch_id: job.branch_id,
      department_id: job.department_id,
      company_id: job.company_id,
      shipper_id: job.shipper_id,
      consignee_id: job.consignee_id,
      origin_port_id: job.origin_port_id,
      dest_port_id: job.dest_port_id,
      etd: job.etd,
      eta: job.eta,
      commodity: job.commodity,
      mbl_number: sea?.mbl_number ?? null,
      hbl_number: sea?.hbl_number ?? null,
      created_from_quote_id: job.created_from_quote_id,
      parent_job_id: job.parent_job_id,
      tracking_token: job.tracking_token,
    };
  }

  private actionFlags(job: Awaited<ReturnType<typeof this.loadJob>>) {
    const closed =
      job.status === "COMPLETED" || job.status === "CANCELLED";
    const isAir = AIR_JOB_TYPES.includes(job.job_type);
    return {
      can_edit: !closed,
      can_delete: !closed,
      can_change_status: !closed,
      can_stop: !closed && job.status !== "ON_HOLD",
      can_close: !closed,
      can_cancel: !closed,
      can_copy: true,
      can_upload_docs: true,
      can_booking_form: true,
      can_switch_bl: true,
      can_edi: true,
      can_kpi: true,
      can_bl_entry: true,
      can_awb: isAir,
      can_track: !!job.tracking_token,
      path_hints: {
        close: `/jobs/${job.id}/close`,
        cancel: `/jobs/${job.id}/cancel`,
        copy: `/jobs/${job.id}/copy`,
        switch_bl: `/jobs/${job.id}/documents/switch-bl`,
        bills_of_lading: `/jobs/${job.id}/bills-of-lading`,
        awb: isAir ? `/jobs/${job.id}/documents/e-awb` : null,
        tracking: job.tracking_token ? `/track/${job.tracking_token}` : null,
        ops_attachments: `/ops/JOB/${job.id}/attachments`,
        ops_history: `/ops/JOB/${job.id}/history`,
        booking_form: this.bookingFormPathHints(job.job_type, job.id),
      },
    };
  }

  private bookingFormPathHints(jobType: JobType, jobId: string) {
    const modeMap: Partial<Record<JobType, string>> = {
      SEA_FCL_EXPORT: "sea-fcl",
      SEA_FCL_IMPORT: "sea-fcl",
      SEA_LCL_EXPORT: "sea-lcl",
      SEA_LCL_IMPORT: "sea-lcl",
      LAND: "land",
      ROAD_FREIGHT: "road-freight",
      COURIER: "courier",
      CUSTOMS_CLEARANCE: "customs-clearance",
      WAREHOUSE: "warehouse",
      AIR_EXPORT: "air",
      AIR_IMPORT: "air",
    };
    const mode = modeMap[jobType];
    if (!mode) return { get: null as string | null };
    if (mode === "air") {
      return {
        get: `/jobs/${jobId}/air/compliance-form`,
        ops: `/jobs/${jobId}/air-booking-form`,
      };
    }
    return {
      get: `/jobs/${jobId}/${mode}/booking-form`,
      put: `/jobs/${jobId}/${mode}/booking-form`,
      complete: `/jobs/${jobId}/${mode}/booking-form/complete`,
    };
  }

  private async sectionSummaries(
    tenantId: string,
    job: Awaited<ReturnType<typeof this.loadJob>>,
  ) {
    const shipmentCount = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.count({
        where: { tenant_id: tenantId, job_id: job.id, deleted_at: null },
      }),
    );
    return {
      costing: { charge_count: job.charges.length },
      shipments: { count: shipmentCount },
      booking_form: this.bookingFormPathHints(job.job_type, job.id),
    };
  }

  private async resolveLinks(
    tenantId: string,
    job: Awaited<ReturnType<typeof this.loadJob>>,
  ) {
    let quotation: {
      id: string;
      quotation_number: string;
      path_hint: string;
    } | null = null;
    if (job.created_from_quote_id) {
      const q = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.quotation.findFirst({
          where: { id: job.created_from_quote_id!, tenant_id: tenantId },
          select: { id: true, quotation_number: true, source_enquiry_id: true },
        }),
      );
      if (q) {
        quotation = {
          id: q.id,
          quotation_number: q.quotation_number,
          path_hint: `/quotations/${q.id}/detail`,
        };
      }
    }

    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { tenant_id: tenantId, job_id: job.id, deleted_at: null },
        select: { id: true, shipment_number: true, enquiry_id: true },
        orderBy: { created_at: "asc" },
      }),
    );

    let enquiry: { id: string; path_hint: string } | null = null;
    const enquiryId =
      shipment?.enquiry_id ??
      (quotation
        ? (
            await this.prisma.runWithTenant(tenantId, (tx) =>
              tx.quotation.findFirst({
                where: { id: quotation!.id },
                select: { source_enquiry_id: true },
              }),
            )
          )?.source_enquiry_id
        : null);
    if (enquiryId) {
      enquiry = {
        id: enquiryId,
        path_hint: `/crm/enquiries/${enquiryId}/detail`,
      };
    }

    return {
      enquiry,
      quotation,
      shipment: shipment
        ? {
            id: shipment.id,
            shipment_number: shipment.shipment_number,
            path_hint: `/shipments/${shipment.id}/detail`,
          }
        : null,
    };
  }

  private async jobContainers(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.seaFclJobDetail.findFirst({
        where: { tenant_id: tenantId, job_id: jobId },
        select: { id: true },
      });
      if (!detail) return [];
      return tx.jobContainer.findMany({
        where: {
          tenant_id: tenantId,
          sea_fcl_detail_id: detail.id,
          deleted_at: null,
        },
        orderBy: { created_at: "asc" },
      });
    });
  }
}
