import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CcDirection,
  CcQueryStatus,
  CcWorkflowStatus,
  JobType,
  Prisma,
  UserRole,
} from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import {
  assertCanEnterStage,
  assertForwardTransition,
} from "../../../common/workflow/workflow-stage-guard";
import { CurrentUser } from "../../users/interfaces/current-user.interface";
import {
  CC_CHECKLIST_EXPORT,
  CC_CHECKLIST_IMPORT,
  CC_CHECKLIST_TRANSIT,
  CC_STAGE_OWNER,
  CC_WORKFLOW_ORDER,
  ChecklistSeedItem,
} from "./cc-workflow.constants";
import {
  AssessCcDto,
  CcQueueQueryDto,
  CcWorkflowOverrideDto,
  ClassifyCcLineDto,
  CreateCcCargoLineDto,
  CreateCcQueryDto,
  DutyPaidDto,
  FileCcEntryDto,
  LinkFreightDto,
  PatchCcChecklistItemDto,
  PatchCcFilingDto,
  PatchCcQueryDto,
  PortalCcDocumentDto,
  UpdateCcCargoLineDto,
  UpsertCcDeclarationDto,
  UpsertCcDetailsDto,
} from "./dto/customs-clearance.dto";

@Injectable()
export class CustomsClearanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ── helpers ──────────────────────────────────────────────────────────────

  private async requireCcJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: JobType.CUSTOMS_CLEARANCE,
        },
        include: {
          customs_clearance_details: {
            include: {
              cargo_lines: { where: { deleted_at: null }, orderBy: { line_no: "asc" } },
              checklist: { where: { deleted_at: null }, orderBy: { sort_order: "asc" } },
              queries: { where: { deleted_at: null }, orderBy: { raised_at: "desc" } },
            },
          },
        },
      }),
    );
    if (!job) throw new NotFoundException("Customs Clearance job not found.");
    if (!job.customs_clearance_details) {
      throw new BadRequestException(
        "CC detail missing — re-seed or create via convert-to-job.",
      );
    }
    return job as typeof job & {
      customs_clearance_details: NonNullable<typeof job.customs_clearance_details>;
    };
  }

  private checklistFor(direction: CcDirection): ChecklistSeedItem[] {
    if (direction === "EXPORT") return CC_CHECKLIST_EXPORT;
    if (direction === "TRANSIT") return CC_CHECKLIST_TRANSIT;
    return CC_CHECKLIST_IMPORT;
  }

  async seedChecklist(
    tx: Prisma.TransactionClient,
    tenantId: string,
    detailId: string,
    direction: CcDirection,
    actorId?: string,
  ) {
    const items = this.checklistFor(direction);
    for (const item of items) {
      await tx.ccDocumentChecklistItem.upsert({
        where: {
          detail_id_doc_code: { detail_id: detailId, doc_code: item.doc_code },
        },
        create: {
          tenant_id: tenantId,
          detail_id: detailId,
          doc_code: item.doc_code,
          label: item.label,
          required: item.required,
          sort_order: item.sort_order,
          created_by: actorId,
          updated_by: actorId,
        },
        update: {
          label: item.label,
          required: item.required,
          sort_order: item.sort_order,
          updated_by: actorId,
          deleted_at: null,
        },
      });
    }
  }

  private assertStage(
    user: CurrentUser,
    target: CcWorkflowStatus,
    current: CcWorkflowStatus,
    dto?: CcWorkflowOverrideDto,
    opts?: { allowSkip?: boolean; allowSame?: boolean; allowBackwardTo?: CcWorkflowStatus[] },
  ) {
    assertCanEnterStage(user.role as UserRole, target, CC_STAGE_OWNER, {
      override: dto?.admin_override,
      overrideReason: dto?.stage_override_reason,
    });
    if (opts?.allowSame && current === target) return;
    if (opts?.allowBackwardTo?.includes(target) && current !== target) {
      // QUERY loop etc.
      return;
    }
    if (current === "QUERY" && target === "FILED") return;
    if (current === "QUERY" && target === "ASSESSED") return;
    assertForwardTransition(
      CC_WORKFLOW_ORDER as unknown as string[],
      current,
      target,
      { allowSkip: opts?.allowSkip ?? false },
    );
  }

  // ── details / open ───────────────────────────────────────────────────────

  async getDetails(tenantId: string, jobId: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    return { success: true, data: job.customs_clearance_details };
  }

  async upsertDetails(
    tenantId: string,
    jobId: string,
    dto: UpsertCcDetailsDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    const directionChanged =
      dto.direction && dto.direction !== detail.direction;

    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.jobCustomsClearanceDetail.update({
        where: { id: detail.id },
        data: {
          ...(dto.direction ? { direction: dto.direction } : {}),
          ...(dto.cha_party_id !== undefined
            ? { cha_party_id: dto.cha_party_id }
            : {}),
          ...(dto.border_or_port !== undefined
            ? { border_or_port: dto.border_or_port }
            : {}),
          ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
          updated_by: actorId,
        },
      });
      if (directionChanged && dto.direction) {
        await this.seedChecklist(tx, tenantId, detail.id, dto.direction, actorId);
      }
      return row;
    });
    return { success: true, data: updated };
  }

  async open(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: CcWorkflowOverrideDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    this.assertStage(user, "OPS_OPEN", detail.cc_status, dto, {
      allowSkip: true,
    });
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.seedChecklist(
        tx,
        tenantId,
        detail.id,
        detail.direction,
        user.id,
      );
      return tx.jobCustomsClearanceDetail.update({
        where: { id: detail.id },
        data: { cc_status: "OPS_OPEN", updated_by: user.id },
      });
    });
    return { success: true, data: updated };
  }

  async getStatus(tenantId: string, jobId: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    const status = job.customs_clearance_details.cc_status;
    const idx = CC_WORKFLOW_ORDER.indexOf(status);
    const next = idx >= 0 && idx < CC_WORKFLOW_ORDER.length - 1
      ? CC_WORKFLOW_ORDER[idx + 1]
      : null;
    return {
      success: true,
      data: {
        cc_status: status,
        owner_department: CC_STAGE_OWNER[status],
        next_status: next,
        next_owner: next ? CC_STAGE_OWNER[next] : null,
      },
    };
  }

  // ── cargo lines ──────────────────────────────────────────────────────────

  async listLines(tenantId: string, jobId: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    return { success: true, data: job.customs_clearance_details.cargo_lines };
  }

  async addLine(
    tenantId: string,
    jobId: string,
    dto: CreateCcCargoLineDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    const maxNo = detail.cargo_lines.reduce(
      (m, l) => Math.max(m, l.line_no),
      0,
    );
    const line = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.ccCargoLine.create({
        data: {
          tenant_id: tenantId,
          detail_id: detail.id,
          line_no: maxNo + 1,
          description: dto.description,
          hs_code: dto.hs_code,
          country_of_origin: dto.country_of_origin,
          quantity: dto.quantity,
          unit: dto.unit,
          value_amount: dto.value_amount,
          currency_code: dto.currency_code,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
    return { success: true, data: line };
  }

  async updateLine(
    tenantId: string,
    jobId: string,
    lineId: string,
    dto: UpdateCcCargoLineDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const existing = job.customs_clearance_details.cargo_lines.find(
      (l) => l.id === lineId,
    );
    if (!existing) throw new NotFoundException("Cargo line not found.");
    const line = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.ccCargoLine.update({
        where: { id: lineId },
        data: {
          description: dto.description,
          hs_code: dto.hs_code,
          country_of_origin: dto.country_of_origin,
          quantity: dto.quantity,
          unit: dto.unit,
          value_amount: dto.value_amount,
          currency_code: dto.currency_code,
          updated_by: actorId,
        },
      }),
    );
    return { success: true, data: line };
  }

  async deleteLine(tenantId: string, jobId: string, lineId: string, actorId?: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    const existing = job.customs_clearance_details.cargo_lines.find(
      (l) => l.id === lineId,
    );
    if (!existing) throw new NotFoundException("Cargo line not found.");
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.ccCargoLine.update({
        where: { id: lineId },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
    return { success: true };
  }

  // ── checklist ────────────────────────────────────────────────────────────

  async getChecklist(tenantId: string, jobId: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    return { success: true, data: job.customs_clearance_details.checklist };
  }

  async patchChecklistItem(
    tenantId: string,
    jobId: string,
    itemId: string,
    dto: PatchCcChecklistItemDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const item = job.customs_clearance_details.checklist.find(
      (c) => c.id === itemId,
    );
    if (!item) throw new NotFoundException("Checklist item not found.");
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.ccDocumentChecklistItem.update({
        where: { id: itemId },
        data: {
          ...(dto.received !== undefined ? { received: dto.received } : {}),
          ...(dto.verified !== undefined ? { verified: dto.verified } : {}),
          ...(dto.job_document_id !== undefined
            ? { job_document_id: dto.job_document_id }
            : {}),
          updated_by: actorId,
        },
      });
      if (job.customs_clearance_details.cc_status === "OPS_OPEN") {
        await tx.jobCustomsClearanceDetail.update({
          where: { id: job.customs_clearance_details.id },
          data: { cc_status: "DOCS", updated_by: actorId },
        });
      }
      return row;
    });
    return { success: true, data: updated };
  }

  async seedChecklistEndpoint(
    tenantId: string,
    jobId: string,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      this.seedChecklist(
        tx,
        tenantId,
        job.customs_clearance_details.id,
        job.customs_clearance_details.direction,
        actorId,
      ),
    );
    return this.getChecklist(tenantId, jobId);
  }

  async stageDocsComplete(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: CcWorkflowOverrideDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    this.assertStage(user, "DOCS", detail.cc_status, dto, {
      allowSame: true,
      allowSkip: true,
    });
    const missing = detail.checklist.filter(
      (c) => c.required && !c.verified,
    );
    if (missing.length) {
      throw new BadRequestException(
        `Required docs not verified: ${missing.map((m) => m.doc_code).join(", ")}`,
      );
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: detail.id },
        data: { cc_status: "DOCS", updated_by: user.id },
      }),
    );
    return { success: true, data: updated };
  }

  // ── classify ─────────────────────────────────────────────────────────────

  async classifyLine(
    tenantId: string,
    jobId: string,
    lineId: string,
    dto: ClassifyCcLineDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const line = job.customs_clearance_details.cargo_lines.find(
      (l) => l.id === lineId,
    );
    if (!line) throw new NotFoundException("Cargo line not found.");

    const hs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hsCode.findFirst({
        where: {
          tenant_id: tenantId,
          hs_code: dto.hs_code,
          deleted_at: null,
          is_active: true,
        },
      }),
    );
    if (!hs) {
      throw new BadRequestException(`HS code ${dto.hs_code} not found in master.`);
    }
    if (hs.is_prohibited) {
      throw new BadRequestException(
        `HS code ${dto.hs_code} is prohibited — cannot classify.`,
      );
    }
    if (hs.is_restricted && !dto.permit_notes?.trim()) {
      throw new BadRequestException(
        `HS code ${dto.hs_code} is restricted — provide permit_notes.`,
      );
    }

    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.ccCargoLine.update({
        where: { id: lineId },
        data: {
          hs_code: dto.hs_code,
          is_classified: true,
          is_prohibited: hs.is_prohibited,
          is_restricted: hs.is_restricted,
          permit_notes: dto.permit_notes,
          updated_by: actorId,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async stageClassify(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: CcWorkflowOverrideDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    this.assertStage(user, "CLASSIFIED", detail.cc_status, dto);
    if (!detail.cargo_lines.length) {
      throw new BadRequestException("Add at least one cargo line before classify.");
    }
    const unclassified = detail.cargo_lines.filter((l) => !l.is_classified);
    if (unclassified.length) {
      throw new BadRequestException(
        `${unclassified.length} line(s) not classified.`,
      );
    }
    if (detail.cargo_lines.some((l) => l.is_prohibited)) {
      throw new BadRequestException("Prohibited HS lines block classification stage.");
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: detail.id },
        data: { cc_status: "CLASSIFIED", updated_by: user.id },
      }),
    );
    return { success: true, data: updated };
  }

  async validateHsCode(tenantId: string, hsCode: string) {
    const hs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hsCode.findFirst({
        where: {
          tenant_id: tenantId,
          hs_code: hsCode,
          deleted_at: null,
          is_active: true,
        },
      }),
    );
    if (!hs) {
      return {
        success: false,
        data: { found: false, hs_code: hsCode },
        message: "HS code not found.",
      };
    }
    return {
      success: true,
      data: {
        found: true,
        hs_code: hs.hs_code,
        description: hs.description,
        is_prohibited: hs.is_prohibited,
        is_restricted: hs.is_restricted,
        import_duty_rate: hs.import_duty_rate,
        export_duty_rate: hs.export_duty_rate,
      },
    };
  }

  // ── filing / assess / queries ────────────────────────────────────────────

  async stageFile(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: FileCcEntryDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    this.assertStage(user, "FILED", detail.cc_status, dto);
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: detail.id },
        data: {
          cc_status: "FILED",
          entry_type: dto.entry_type ?? detail.entry_type ?? (detail.direction === "EXPORT" ? "SB" : "BOE"),
          entry_number: dto.entry_number,
          shipping_bill_number: dto.shipping_bill_number,
          filing_date: dto.filing_date ? new Date(dto.filing_date) : new Date(),
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async patchFiling(
    tenantId: string,
    jobId: string,
    dto: PatchCcFilingDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const st = job.customs_clearance_details.cc_status;
    if (!["FILED", "ASSESSED", "QUERY"].includes(st)) {
      throw new BadRequestException("Filing can only be edited in FILED/ASSESSED/QUERY.");
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: job.customs_clearance_details.id },
        data: {
          ...(dto.entry_type !== undefined ? { entry_type: dto.entry_type } : {}),
          ...(dto.entry_number !== undefined ? { entry_number: dto.entry_number } : {}),
          ...(dto.shipping_bill_number !== undefined
            ? { shipping_bill_number: dto.shipping_bill_number }
            : {}),
          ...(dto.filing_date
            ? { filing_date: new Date(dto.filing_date) }
            : {}),
          ...(dto.assessed_duty !== undefined
            ? { assessed_duty: dto.assessed_duty }
            : {}),
          ...(dto.assessed_tax !== undefined
            ? { assessed_tax: dto.assessed_tax }
            : {}),
          ...(dto.duty_currency !== undefined
            ? { duty_currency: dto.duty_currency }
            : {}),
          updated_by: actorId,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async stageAssess(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: AssessCcDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    this.assertStage(user, "ASSESSED", detail.cc_status, dto, { allowSkip: true });
    const openQueries = detail.queries.filter((q) => q.status !== "CLOSED");
    if (openQueries.length) {
      throw new BadRequestException("Close all customs queries before assess.");
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: detail.id },
        data: {
          cc_status: "ASSESSED",
          assessed_duty: dto.assessed_duty ?? detail.assessed_duty,
          assessed_tax: dto.assessed_tax ?? detail.assessed_tax,
          duty_currency: dto.duty_currency ?? detail.duty_currency ?? "AED",
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async listQueries(tenantId: string, jobId: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    return { success: true, data: job.customs_clearance_details.queries };
  }

  async createQuery(
    tenantId: string,
    jobId: string,
    dto: CreateCcQueryDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    if (!["FILED", "ASSESSED", "QUERY"].includes(detail.cc_status)) {
      throw new BadRequestException("Queries only from FILED/ASSESSED/QUERY.");
    }
    const query = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const q = await tx.ccCustomsQuery.create({
        data: {
          tenant_id: tenantId,
          detail_id: detail.id,
          query_text: dto.query_text,
          status: CcQueryStatus.OPEN,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      await tx.jobCustomsClearanceDetail.update({
        where: { id: detail.id },
        data: { cc_status: "QUERY", updated_by: actorId },
      });
      return q;
    });
    return { success: true, data: query };
  }

  async patchQuery(
    tenantId: string,
    jobId: string,
    queryId: string,
    dto: PatchCcQueryDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const q = job.customs_clearance_details.queries.find((x) => x.id === queryId);
    if (!q) throw new NotFoundException("Query not found.");
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.ccCustomsQuery.update({
        where: { id: queryId },
        data: {
          response_text: dto.response_text,
          status: dto.response_text ? CcQueryStatus.RESPONDED : q.status,
          updated_by: actorId,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async closeQuery(
    tenantId: string,
    jobId: string,
    queryId: string,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    const q = detail.queries.find((x) => x.id === queryId);
    if (!q) throw new NotFoundException("Query not found.");
    const result = await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.ccCustomsQuery.update({
        where: { id: queryId },
        data: {
          status: CcQueryStatus.CLOSED,
          closed_at: new Date(),
          updated_by: actorId,
        },
      });
      const open = await tx.ccCustomsQuery.count({
        where: {
          detail_id: detail.id,
          deleted_at: null,
          status: { not: CcQueryStatus.CLOSED },
        },
      });
      let nextStatus: CcWorkflowStatus = detail.cc_status;
      if (open === 0) {
        nextStatus = detail.assessed_duty != null ? "ASSESSED" : "FILED";
        await tx.jobCustomsClearanceDetail.update({
          where: { id: detail.id },
          data: { cc_status: nextStatus, updated_by: actorId },
        });
      }
      return { nextStatus };
    });
    return { success: true, data: result };
  }

  // ── clear / release / duty / close ───────────────────────────────────────

  async stageDutyPaid(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: DutyPaidDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    this.assertStage(user, "DUTY_PAID", detail.cc_status, dto);
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: detail.id },
        data: {
          cc_status: "DUTY_PAID",
          duty_paid_at: new Date(),
          duty_paid_by_client: dto.paid_by_client ?? false,
          duty_payment_notes: dto.notes,
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async dutyPaymentRequest(tenantId: string, jobId: string, actorId?: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    if (job.customs_clearance_details.cc_status !== "ASSESSED") {
      throw new BadRequestException("Duty payment request only from ASSESSED.");
    }
    if (!actorId) {
      throw new BadRequestException("Actor required for duty payment request note.");
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobNote.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          note: `Duty payment requested. Assessed duty: ${job.customs_clearance_details.assessed_duty ?? 0} ${job.customs_clearance_details.duty_currency ?? "AED"}`,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
    return {
      success: true,
      message: "Duty payment request logged for Accounts.",
      data: {
        assessed_duty: job.customs_clearance_details.assessed_duty,
        assessed_tax: job.customs_clearance_details.assessed_tax,
        duty_currency: job.customs_clearance_details.duty_currency,
      },
    };
  }

  async stageClear(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: CcWorkflowOverrideDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const detail = job.customs_clearance_details;
    this.assertStage(user, "CLEARED", detail.cc_status, dto);
    const exams = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsExamination.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { examination_date: "desc" },
        take: 1,
      }),
    );
    if (
      exams[0] &&
      (exams[0].result === "HELD" ||
        exams[0].result === "SEIZED" ||
        exams[0].result === "QUERY")
    ) {
      throw new BadRequestException(
        "Latest examination not released — resolve via query before clear.",
      );
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: detail.id },
        data: {
          cc_status: "CLEARED",
          cleared_at: new Date(),
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async stageRelease(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: CcWorkflowOverrideDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    this.assertStage(
      user,
      "RELEASED",
      job.customs_clearance_details.cc_status,
      dto,
    );
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: job.customs_clearance_details.id },
        data: {
          cc_status: "RELEASED",
          released_at: new Date(),
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async stageInvoiceReady(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: CcWorkflowOverrideDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    this.assertStage(
      user,
      "INVOICE_READY",
      job.customs_clearance_details.cc_status,
      dto,
    );
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: job.customs_clearance_details.id },
        data: { cc_status: "INVOICE_READY", updated_by: user.id },
      }),
    );
    return { success: true, data: updated };
  }

  async stageClose(
    tenantId: string,
    jobId: string,
    user: CurrentUser,
    dto: CcWorkflowOverrideDto,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    this.assertStage(
      user,
      "CLOSED",
      job.customs_clearance_details.cc_status,
      dto,
      { allowSkip: true },
    );
    const invoice = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
        },
      }),
    );
    if (!invoice && !dto.admin_override) {
      throw new BadRequestException(
        "Issue customer invoice (POST /invoices/from-job/:jobId) before close, or use admin_override.",
      );
    }
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.jobCustomsClearanceDetail.update({
        where: { id: job.customs_clearance_details.id },
        data: {
          cc_status: "CLOSED",
          invoice_id: invoice?.id,
          updated_by: user.id,
        },
      });
      await tx.job.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          updated_by: user.id,
        },
      });
      return detail;
    });
    return { success: true, data: updated };
  }

  async financialSummary(tenantId: string, jobId: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    const [charges, deposits, invoices] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) =>
        Promise.all([
          tx.jobCharge.findMany({
            where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          }),
          tx.jobDeposit.findMany({
            where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          }),
          tx.invoice.findMany({
            where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          }),
        ]),
    );
    return {
      success: true,
      data: {
        assessed_duty: job.customs_clearance_details.assessed_duty,
        assessed_tax: job.customs_clearance_details.assessed_tax,
        duty_currency: job.customs_clearance_details.duty_currency,
        duty_paid_at: job.customs_clearance_details.duty_paid_at,
        charges,
        deposits,
        invoices,
      },
    };
  }

  // ── freight link ─────────────────────────────────────────────────────────

  async linkFreight(
    tenantId: string,
    jobId: string,
    dto: LinkFreightDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    if (dto.freight_job_id === jobId) {
      throw new BadRequestException("Cannot link CC job to itself.");
    }
    const freight = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: dto.freight_job_id,
          tenant_id: tenantId,
          deleted_at: null,
        },
        select: { id: true, job_number: true, job_type: true, status: true },
      }),
    );
    if (!freight) throw new NotFoundException("Freight job not found.");
    if (freight.job_type === JobType.CUSTOMS_CLEARANCE) {
      throw new BadRequestException("Link target must be a freight job.");
    }
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: job.customs_clearance_details.id },
        data: { freight_job_id: freight.id, updated_by: actorId },
      }),
    );
    return { success: true, data: { detail: updated, freight } };
  }

  async unlinkFreight(tenantId: string, jobId: string, actorId?: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: job.customs_clearance_details.id },
        data: { freight_job_id: null, updated_by: actorId },
      }),
    );
    return { success: true, data: updated };
  }

  async getFreightLink(tenantId: string, jobId: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    const fid = job.customs_clearance_details.freight_job_id;
    if (!fid) return { success: true, data: null };
    const freight = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: fid, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          job_number: true,
          job_type: true,
          status: true,
          billing_party_id: true,
        },
      }),
    );
    return { success: true, data: freight };
  }

  // ── declaration ──────────────────────────────────────────────────────────

  async getDeclaration(tenantId: string, jobId: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    return {
      success: true,
      data: {
        declaration: job.customs_clearance_details.declaration_json,
        entry_type: job.customs_clearance_details.entry_type,
        entry_number: job.customs_clearance_details.entry_number,
        shipping_bill_number: job.customs_clearance_details.shipping_bill_number,
        declaration_boe_id: job.customs_clearance_details.declaration_boe_id,
        lines: job.customs_clearance_details.cargo_lines,
      },
    };
  }

  async putDeclaration(
    tenantId: string,
    jobId: string,
    dto: UpsertCcDeclarationDto,
    actorId?: string,
  ) {
    const job = await this.requireCcJob(tenantId, jobId);
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: job.customs_clearance_details.id },
        data: {
          declaration_json: dto.declaration as Prisma.InputJsonValue,
          updated_by: actorId,
        },
      }),
    );
    return { success: true, data: updated };
  }

  async validateDeclaration(tenantId: string, jobId: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    const d = job.customs_clearance_details;
    const errors: string[] = [];
    if (!d.direction) errors.push("direction required");
    if (!d.cargo_lines.length) errors.push("at least one cargo line required");
    if (d.direction === "IMPORT" && !d.entry_number && !d.declaration_json) {
      errors.push("entry_number or declaration draft required for import");
    }
    if (d.direction === "EXPORT" && !d.shipping_bill_number && !d.declaration_json) {
      errors.push("shipping_bill_number or declaration draft required for export");
    }
    for (const line of d.cargo_lines) {
      if (!line.hs_code) errors.push(`line ${line.line_no}: hs_code missing`);
    }
    return {
      success: errors.length === 0,
      data: { valid: errors.length === 0, errors },
    };
  }

  async submitLocalDeclaration(
    tenantId: string,
    jobId: string,
    actorId?: string,
  ) {
    const validation = await this.validateDeclaration(tenantId, jobId);
    if (!validation.success) {
      throw new BadRequestException(validation.data.errors.join("; "));
    }
    const job = await this.requireCcJob(tenantId, jobId);
    // Stub: record external ref on detail; optional BOE record when documentation module available
    const externalRef = `CC-LOCAL-${job.job_number}-${Date.now()}`;
    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.update({
        where: { id: job.customs_clearance_details.id },
        data: {
          declaration_json: {
            ...((job.customs_clearance_details.declaration_json as object) ?? {}),
            local_submit_ref: externalRef,
            submitted_at: new Date().toISOString(),
          } as Prisma.InputJsonValue,
          updated_by: actorId,
        },
      }),
    );
    return {
      success: true,
      message: "Local declaration submit recorded (stub adapter).",
      data: { external_ref: externalRef, detail: updated },
    };
  }

  async generateEntryPack(tenantId: string, jobId: string, actorId?: string) {
    const job = await this.requireCcJob(tenantId, jobId);
    const decl = await this.getDeclaration(tenantId, jobId);
    return {
      success: true,
      message:
        "Entry pack payload ready — use POST /jobs/:id/documents with document_type CUSTOMS_ENTRY to store the file.",
      data: {
        job_id: jobId,
        job_number: job.job_number,
        document_type: "CUSTOMS_ENTRY",
        pack: decl.data,
        requested_by: actorId,
      },
    };
  }

  // ── dashboard / queue ────────────────────────────────────────────────────

  async dashboard(tenantId: string) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCustomsClearanceDetail.groupBy({
        by: ["cc_status"],
        where: { tenant_id: tenantId, deleted_at: null },
        _count: { _all: true },
      }),
    );
    const byStatus: Record<string, number> = {};
    const byOwner: Record<string, number> = {
      SALES: 0,
      OPS: 0,
      ACCOUNTS: 0,
    };
    for (const r of rows) {
      byStatus[r.cc_status] = r._count._all;
      const owner = CC_STAGE_OWNER[r.cc_status] ?? "OPS";
      if (owner in byOwner) byOwner[owner] += r._count._all;
    }
    return { success: true, data: { by_status: byStatus, by_owner: byOwner } };
  }

  async queue(tenantId: string, query: CcQueueQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const statusFilter = query.status
      ? [query.status]
      : query.owner
        ? (Object.entries(CC_STAGE_OWNER)
            .filter(([, o]) => o === query.owner)
            .map(([s]) => s as CcWorkflowStatus))
        : undefined;

    const where: Prisma.JobCustomsClearanceDetailWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(statusFilter?.length ? { cc_status: { in: statusFilter } } : {}),
      ...(query.direction ? { direction: query.direction } : {}),
    };

    const [rows, total] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) =>
        Promise.all([
          tx.jobCustomsClearanceDetail.findMany({
            where,
            include: {
              job: {
                select: {
                  id: true,
                  job_number: true,
                  status: true,
                  billing_party_id: true,
                  created_at: true,
                },
              },
              checklist: {
                where: {
                  deleted_at: null,
                  required: true,
                  verified: false,
                },
              },
            },
            orderBy: { updated_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
          }),
          tx.jobCustomsClearanceDetail.count({ where }),
        ]),
    );

    return {
      success: true,
      data: rows.map((r) => ({
        ...r,
        overdue_docs: r.checklist.length,
        owner_department: CC_STAGE_OWNER[r.cc_status],
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  // ── portal ───────────────────────────────────────────────────────────────

  async portalList(tenantId: string, partyId: string) {
    const jobs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          job_type: JobType.CUSTOMS_CLEARANCE,
          OR: [
            { billing_party_id: partyId },
            { consignee_id: partyId },
            { shipper_id: partyId },
            { agent_id: partyId },
          ],
        },
        include: {
          customs_clearance_details: {
            select: {
              cc_status: true,
              direction: true,
              checklist: {
                where: { deleted_at: null, required: true, verified: false },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 100,
      }),
    );
    return {
      success: true,
      data: jobs.map((j) => ({
        id: j.id,
        job_number: j.job_number,
        status: j.status,
        cc_status: j.customs_clearance_details?.cc_status,
        direction: j.customs_clearance_details?.direction,
        outstanding_docs: j.customs_clearance_details?.checklist?.length ?? 0,
      })),
    };
  }

  async portalGet(tenantId: string, partyId: string, jobId: string) {
    await this.assertPortalAccess(tenantId, partyId, jobId);
    return this.getDetails(tenantId, jobId);
  }

  async portalChecklist(tenantId: string, partyId: string, jobId: string) {
    await this.assertPortalAccess(tenantId, partyId, jobId);
    return this.getChecklist(tenantId, jobId);
  }

  async portalMarkDocument(
    tenantId: string,
    partyId: string,
    jobId: string,
    dto: PortalCcDocumentDto,
  ) {
    await this.assertPortalAccess(tenantId, partyId, jobId);
    const job = await this.requireCcJob(tenantId, jobId);
    const item = job.customs_clearance_details.checklist.find(
      (c) => c.doc_code === dto.doc_code,
    );
    if (!item) throw new NotFoundException("Checklist item not found.");
    return this.patchChecklistItem(tenantId, jobId, item.id, {
      received: true,
      job_document_id: dto.job_document_id,
    });
  }

  private async assertPortalAccess(
    tenantId: string,
    partyId: string,
    jobId: string,
  ) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: JobType.CUSTOMS_CLEARANCE,
          OR: [
            { billing_party_id: partyId },
            { consignee_id: partyId },
            { shipper_id: partyId },
            { agent_id: partyId },
          ],
        },
      }),
    );
    if (!job) throw new NotFoundException("Customs Clearance job not found.");
  }

  /** Used by examinations when exam fails on a CC job. */
  async onExaminationFail(tenantId: string, jobId: string, actorId?: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          job_type: JobType.CUSTOMS_CLEARANCE,
          deleted_at: null,
        },
        include: { customs_clearance_details: true },
      }),
    );
    if (!job?.customs_clearance_details) return;
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.ccCustomsQuery.create({
        data: {
          tenant_id: tenantId,
          detail_id: job.customs_clearance_details!.id,
          query_text: "Examination failed — amendment required.",
          status: CcQueryStatus.OPEN,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      await tx.jobCustomsClearanceDetail.update({
        where: { id: job.customs_clearance_details!.id },
        data: { cc_status: "QUERY", updated_by: actorId },
      });
    });
  }
}
