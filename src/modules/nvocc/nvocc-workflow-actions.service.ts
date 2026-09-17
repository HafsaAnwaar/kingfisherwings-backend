import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NvoccWorkflowService } from "./nvocc-workflow.service";
import { NvoccDocumentsService } from "./nvocc-documents.service";
import { GenerateJobDocumentDto } from "./dto/nvocc-document.dto";
import { WorkflowStageOverrideDto } from "./dto/nvocc-booking-form.dto";

@Injectable()
export class NvoccWorkflowActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: NvoccWorkflowService,
    private readonly documents: NvoccDocumentsService,
  ) {}

  async csTriage(
    tenantId: string,
    bookingId: string,
    actor: { id: string; role: UserRole },
    opts?: WorkflowStageOverrideDto,
  ) {
    this.workflow.assertCanEnterStage(actor.role, "CS_TRIAGED", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const booking = await tx.nvoccBooking.findFirst({
        where: { id: bookingId, tenant_id: tenantId, deleted_at: null },
      });
      if (!booking) throw new NotFoundException("Booking not found.");

      if (booking.shipper_id) {
        await tx.party.updateMany({
          where: { id: booking.shipper_id, tenant_id: tenantId },
          data: { portal_access: true, updated_by: actor.id },
        });
      }

      this.workflow.assertForwardTransition(
        booking.workflow_stage,
        "CS_TRIAGED",
        { allowSkip: opts?.admin_override },
      );

      return tx.nvoccBooking.update({
        where: { id: bookingId },
        data: {
          workflow_stage: "CS_TRIAGED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          stage_override_reason: opts?.admin_override
            ? opts.stage_override_reason
            : undefined,
          updated_by: actor.id,
        },
      });
    });
  }

  async markQuoteSent(
    tenantId: string,
    bookingId: string,
    actor: { id: string; role: UserRole },
    opts?: WorkflowStageOverrideDto,
  ) {
    return this.workflow.setBookingStage(
      tenantId,
      bookingId,
      "QUOTE_SENT",
      actor,
      {
        override: opts?.admin_override,
        overrideReason: opts?.stage_override_reason,
      },
    );
  }

  async markInvoiceSent(
    tenantId: string,
    bookingId: string,
    invoiceId: string | undefined,
    actor: { id: string; role: UserRole },
    opts?: WorkflowStageOverrideDto,
  ) {
    this.workflow.assertCanEnterStage(actor.role, "INVOICE_SENT", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const booking = await tx.nvoccBooking.findFirst({
        where: { id: bookingId, tenant_id: tenantId, deleted_at: null },
      });
      if (!booking) throw new NotFoundException("Booking not found.");
      this.workflow.assertForwardTransition(
        booking.workflow_stage,
        "INVOICE_SENT",
        { allowSkip: opts?.admin_override },
      );
      return tx.nvoccBooking.update({
        where: { id: bookingId },
        data: {
          workflow_stage: "INVOICE_SENT",
          invoice_id: invoiceId,
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          stage_override_reason: opts?.admin_override
            ? opts.stage_override_reason
            : undefined,
          updated_by: actor.id,
        },
      });
    });
  }

  async markLoading(
    tenantId: string,
    jobId: string,
    actor: { id: string; role: UserRole },
    opts?: WorkflowStageOverrideDto,
  ) {
    return this.workflow.setJobStage(tenantId, jobId, "LOADING", actor, {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
      allowSkip: true,
    });
  }

  async confirmPayment(
    tenantId: string,
    jobId: string,
    actor: { id: string; role: UserRole },
    opts?: WorkflowStageOverrideDto,
  ) {
    this.workflow.assertCanEnterStage(actor.role, "PAYMENT_RECEIVED", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.nvoccJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!detail) throw new NotFoundException("NVOCC job not found.");
      if (!detail.draft_bl_issued_at) {
        throw new BadRequestException(
          "Draft BL must be issued before confirming payment.",
        );
      }
      return tx.nvoccJobDetail.update({
        where: { id: detail.id },
        data: {
          payment_confirmed_at: new Date(),
          payment_confirmed_by: actor.id,
          workflow_stage: "PAYMENT_RECEIVED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          stage_override_reason: opts?.admin_override
            ? opts.stage_override_reason
            : undefined,
          updated_by: actor.id,
        },
      });
    });
  }

  async issueDraftBl(
    tenantId: string,
    jobId: string,
    dto: GenerateJobDocumentDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "DRAFT_BL_ISSUED");
    const result = await this.documents.generateHblDraft(
      tenantId,
      jobId,
      dto,
      actor.id,
    );
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.nvoccJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: {
          draft_bl_issued_at: new Date(),
          workflow_stage: "DRAFT_BL_ISSUED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          updated_by: actor.id,
        },
      });
    });
    return result;
  }

  async issueOriginalBl(
    tenantId: string,
    jobId: string,
    dto: GenerateJobDocumentDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "ORIGINAL_BL_ISSUED");
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.nvoccJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!detail) throw new NotFoundException("NVOCC job not found.");
      if (!detail.draft_bl_issued_at) {
        throw new BadRequestException("Draft BL must be issued first.");
      }
      if (!detail.payment_confirmed_at) {
        throw new BadRequestException(
          "Accounts must confirm payment before original BL.",
        );
      }
    });
    const result = await this.documents.generateHblOriginal(
      tenantId,
      jobId,
      dto,
      actor.id,
    );
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.nvoccJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: {
          workflow_stage: "ORIGINAL_BL_ISSUED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          updated_by: actor.id,
        },
      });
    });
    return result;
  }

  async closeReport(
    tenantId: string,
    jobId: string,
    actor: { id: string; role: UserRole },
    opts?: WorkflowStageOverrideDto,
  ) {
    this.workflow.assertCanEnterStage(actor.role, "CLOSED", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });
    const detail = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
        include: {
          job: true,
          booking: { include: { booking_form: true } },
          container_requests: { include: { lines: true } },
        },
      }),
    );
    if (!detail) throw new NotFoundException("NVOCC job not found.");
    if (detail.workflow_stage !== "ORIGINAL_BL_ISSUED" && !opts?.admin_override) {
      throw new BadRequestException(
        "Job must reach ORIGINAL_BL_ISSUED before MGMT close report.",
      );
    }
    await this.workflow.setJobStage(tenantId, jobId, "CLOSED", actor, {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
      allowSkip: Boolean(opts?.admin_override),
    });
    return {
      job_id: jobId,
      workflow_stage: "CLOSED",
      report: {
        job_number: detail.job.job_number,
        hbl_number: detail.hbl_number,
        hbl_status: detail.hbl_status,
        payment_confirmed_at: detail.payment_confirmed_at,
        draft_bl_issued_at: detail.draft_bl_issued_at,
        container_requests: detail.container_requests,
        booking_form: detail.booking?.booking_form ?? null,
        closed_at: new Date().toISOString(),
        closed_by: actor.id,
      },
    };
  }

  /** Ensure a port gate token exists (staff helper / on allocate). */
  async ensurePortGateToken(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.nvoccJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!detail) throw new NotFoundException("NVOCC job not found.");
      if (detail.port_gate_token) return detail;
      return tx.nvoccJobDetail.update({
        where: { id: detail.id },
        data: { port_gate_token: randomBytes(16).toString("hex") },
      });
    });
  }
}
