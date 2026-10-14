import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobStatus, JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ShipmentsService } from "../shipments/shipments.service";
import {
  ChangeJobStatusDto,
  ReopenJobDto,
} from "./dto/job-detail.dto";
import {
  PatchJobDimensionsDto,
  UpsertJobPartyReferenceDto,
} from "./dto/job-organization.dto";
import { JobStatusCatalogService } from "./job-status-catalog.service";
import { JobChargeAttachmentService } from "./job-charge-attachment.service";
import { JobOrganizationService } from "./job-organization.service";
import { JobDimensionService } from "./job-dimension.service";
import { JobContainerTabService } from "./job-container-tab.service";
import { JobCostingService } from "./job-costing.service";
import { JobTabPanelsService } from "./job-tab-panels.service";
import { DEFAULT_REOPEN_STATUS } from "./constants/job-status-catalog.defaults";
import { JOBS_PERMISSIONS } from "./constants/jobs-permission.constants";
import { JobContainerKind } from "@prisma/client";

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

const TERMINAL_STATUSES: JobStatus[] = ["COMPLETED", "CANCELLED"];

@Injectable()
export class JobDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shipments: ShipmentsService,
    private readonly statusCatalog: JobStatusCatalogService,
    private readonly chargeAttachments: JobChargeAttachmentService,
    private readonly organizations: JobOrganizationService,
    private readonly dimensions: JobDimensionService,
    private readonly containerTab: JobContainerTabService,
    private readonly costing: JobCostingService,
    private readonly tabPanels: JobTabPanelsService,
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
      return this.organizations.getTab(tenantId, id);
    }
    if (normalized === "dimensions") {
      return this.dimensions.getTab(tenantId, id);
    }
    if (normalized === "costing") {
      return this.costing.getTab(tenantId, id, "STAFF");
    }
    if (normalized === "department") {
      return this.tabPanels.getDepartmentTab(tenantId, id);
    }
    if (normalized === "planned_container") {
      return this.containerTab.getTab(
        tenantId,
        id,
        JobContainerKind.PLANNED,
      );
    }
    if (normalized === "actual_container") {
      return this.containerTab.getTab(
        tenantId,
        id,
        JobContainerKind.ACTUAL,
      );
    }
    if (normalized === "ex_rate") {
      return this.tabPanels.getExRateTab(tenantId, id);
    }
    if (normalized === "routing") {
      return this.tabPanels.getRoutingTab(tenantId, id);
    }
    if (normalized === "customs" || normalized === "shipping_bill_boe") {
      return this.tabPanels.getCustomsTab(tenantId, id);
    }
    if (normalized === "history") {
      return this.history(tenantId, id);
    }
    if (normalized === "booking_form") {
      return this.tabPanels.getBookingFormTab(tenantId, id);
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
    permissions?: string[],
  ) {
    const job = await this.loadJob(tenantId, id);
    const target = dto.status;
    if (target === job.status) {
      return { success: true, data: job, warnings: [] };
    }

    await this.statusCatalog.ensureCatalog(tenantId);
    try {
      await this.statusCatalog.assertActiveCode(tenantId, target);
    } catch {
      throw new BadRequestException(`Status ${target} is not available.`);
    }

    const warnings: string[] = [];
    const canForce =
      permissions?.includes(JOBS_PERMISSIONS.STATUS_FORCE) ||
      permissions?.includes(JOBS_PERMISSIONS.CLOSE);
    if (target === "COMPLETED" && !canForce) {
      warnings.push(
        "Setting COMPLETED via change-status skips close checklist — prefer POST /jobs/:id/close.",
      );
    }
    if (target === "CANCELLED") {
      warnings.push(
        "Prefer POST /jobs/:id/cancel for audited cancellation workflow.",
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

    return { success: true, data: updated, warnings };
  }

  async reopen(
    tenantId: string,
    id: string,
    dto: ReopenJobDto,
    actorId?: string,
  ) {
    const job = await this.loadJob(tenantId, id);
    if (!TERMINAL_STATUSES.includes(job.status) && job.status !== "DELIVERED") {
      throw new BadRequestException(
        "Reopen applies to Closed (COMPLETED), Cancelled, or Delivered jobs.",
      );
    }
    const target = (dto.status ?? DEFAULT_REOPEN_STATUS) as JobStatus;
    await this.statusCatalog.assertActiveCode(tenantId, target);

    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.job.update({
        where: { id },
        data: { status: target, updated_by: actorId },
      });
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_REOPENED",
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

  async patchOrganizationReference(
    tenantId: string,
    jobId: string,
    dto: UpsertJobPartyReferenceDto,
    actorId?: string,
  ) {
    await this.loadJob(tenantId, jobId);
    const role = dto.party_role ?? "CLIENT";
    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobPartyReference.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          party_role: role,
          reference_type: dto.reference_type,
        },
      });
      if (existing) {
        return tx.jobPartyReference.update({
          where: { id: existing.id },
          data: {
            reference_no: dto.reference_no,
            party_id: dto.party_id,
            updated_by: actorId,
          },
        });
      }
      return tx.jobPartyReference.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          party_role: role,
          party_id: dto.party_id,
          reference_type: dto.reference_type,
          reference_no: dto.reference_no,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
    return { success: true, data: row };
  }

  async patchDimensions(
    tenantId: string,
    jobId: string,
    dto: PatchJobDimensionsDto,
    actorId?: string,
  ) {
    await this.loadJob(tenantId, jobId);
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.update({
        where: { id: jobId },
        data: {
          ...(dto.commodity_description !== undefined
            ? { commodity: dto.commodity_description }
            : {}),
          ...(dto.hs_code !== undefined ? { hs_code: dto.hs_code } : {}),
          updated_by: actorId,
        },
      }),
    );
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
      job_date: job.job_date,
      job_type: job.job_type,
      branch_id: job.branch_id,
      department_id: job.department_id,
      company_id: job.company_id,
      shipper_id: job.shipper_id,
      consignee_id: job.consignee_id,
      billing_party_id: job.billing_party_id,
      agent_id: job.agent_id,
      origin_port_id: job.origin_port_id,
      dest_port_id: job.dest_port_id,
      etd: job.etd,
      eta: job.eta,
      commodity: job.commodity,
      pieces: job.pieces,
      gross_weight: job.gross_weight,
      volume_cbm: job.volume_cbm,
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
      can_edit_header: !closed,
      can_edit: !closed,
      can_edit_closed_delivery: true,
      can_delete: !closed,
      can_change_status: true,
      can_reopen:
        closed || job.status === "DELIVERED",
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
        reopen: `/jobs/${job.id}/reopen`,
        change_status: `/jobs/${job.id}/change-status`,
        status_options: `/jobs/status-options?job_id=${job.id}`,
        gpum: `/jobs/${job.id}/gpum`,
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

}
