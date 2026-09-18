import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AirWorkflowStage, JobType, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AirWorkflowService } from "./air-workflow.service";
import { JobsService } from "./jobs.service";
import {
  AirWorkflowOverrideDto,
  MarkAirInvoiceSentDto,
} from "./dto/air-workflow.dto";
import { GenerateJobDocumentDto } from "./dto/generate-job-document.dto";

@Injectable()
export class AirWorkflowActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: AirWorkflowService,
    private readonly jobs: JobsService,
  ) {}

  async csTriage(
    tenantId: string,
    jobId: string,
    actor: { id: string; role: UserRole },
    opts?: AirWorkflowOverrideDto,
  ) {
    this.workflow.assertCanEnterStage(actor.role, "CS_TRIAGED", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: { in: [JobType.AIR_EXPORT, JobType.AIR_IMPORT] },
        },
        include: { air_details: true },
      });
      if (!job?.air_details) throw new NotFoundException("Air job not found.");

      const partyIds = [
        job.shipper_id,
        job.consignee_id,
        job.billing_party_id,
      ].filter(Boolean) as string[];
      if (partyIds.length) {
        await tx.party.updateMany({
          where: { id: { in: partyIds }, tenant_id: tenantId },
          data: { portal_access: true, updated_by: actor.id },
        });
      }

      this.workflow.assertForwardTransition(
        job.job_type,
        job.air_details.workflow_stage,
        "CS_TRIAGED",
        { allowSkip: opts?.admin_override },
      );

      return tx.airJobDetail.update({
        where: { id: job.air_details.id },
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
    jobId: string,
    actor: { id: string; role: UserRole },
    opts?: AirWorkflowOverrideDto,
  ) {
    return this.workflow.setJobStage(tenantId, jobId, "QUOTE_SENT", actor, {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
      allowSkip: opts?.admin_override,
    });
  }

  async markInvoiceSent(
    tenantId: string,
    jobId: string,
    dto: MarkAirInvoiceSentDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "INVOICE_SENT", {
      override: dto.admin_override,
      overrideReason: dto.stage_override_reason,
    });
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: { in: [JobType.AIR_EXPORT, JobType.AIR_IMPORT] },
        },
        include: { air_details: true },
      });
      if (!job?.air_details) throw new NotFoundException("Air job not found.");
      this.workflow.assertForwardTransition(
        job.job_type,
        job.air_details.workflow_stage,
        "INVOICE_SENT",
        { allowSkip: dto.admin_override },
      );
      return tx.airJobDetail.update({
        where: { id: job.air_details.id },
        data: {
          workflow_stage: "INVOICE_SENT",
          invoice_id: dto.invoice_id,
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          stage_override_reason: dto.admin_override
            ? dto.stage_override_reason
            : undefined,
          updated_by: actor.id,
        },
      });
    });
  }

  async markBuildUp(
    tenantId: string,
    jobId: string,
    actor: { id: string; role: UserRole },
    opts?: AirWorkflowOverrideDto,
  ) {
    return this.workflow.setJobStage(tenantId, jobId, "BUILD_UP", actor, {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
      allowSkip: opts?.admin_override,
    });
  }

  async markMawbReceived(
    tenantId: string,
    jobId: string,
    actor: { id: string; role: UserRole },
    opts?: AirWorkflowOverrideDto,
  ) {
    return this.workflow.setJobStage(tenantId, jobId, "MAWB_RECEIVED", actor, {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
      allowSkip: opts?.admin_override,
    });
  }

  async markPod(
    tenantId: string,
    jobId: string,
    actor: { id: string; role: UserRole },
    opts?: AirWorkflowOverrideDto,
  ) {
    this.workflow.assertCanEnterStage(actor.role, "POD_RECEIVED", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: JobType.AIR_IMPORT,
        },
        include: { air_details: true },
      });
      if (!job?.air_details) throw new NotFoundException("Air import job not found.");
      this.workflow.assertForwardTransition(
        job.job_type,
        job.air_details.workflow_stage,
        "POD_RECEIVED",
        { allowSkip: opts?.admin_override },
      );
      return tx.airJobDetail.update({
        where: { id: job.air_details.id },
        data: {
          workflow_stage: "POD_RECEIVED",
          pod_workflow_received_at: new Date(),
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

  async confirmPayment(
    tenantId: string,
    jobId: string,
    actor: { id: string; role: UserRole },
    opts?: AirWorkflowOverrideDto,
  ) {
    this.workflow.assertCanEnterStage(actor.role, "PAYMENT_RECEIVED", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: { in: [JobType.AIR_EXPORT, JobType.AIR_IMPORT] },
        },
        include: { air_details: true },
      });
      if (!job?.air_details) throw new NotFoundException("Air job not found.");

      if (job.job_type === JobType.AIR_EXPORT && !job.air_details.draft_hawb_issued_at) {
        throw new BadRequestException(
          "Draft House Air Waybill must be issued before confirming payment.",
        );
      }
      if (job.job_type === JobType.AIR_IMPORT && job.air_details.workflow_stage !== "CAN_ISSUED" && !opts?.admin_override) {
        throw new BadRequestException(
          "Cargo Arrival Notice must be issued before confirming payment.",
        );
      }

      this.workflow.assertForwardTransition(
        job.job_type,
        job.air_details.workflow_stage,
        "PAYMENT_RECEIVED",
        { allowSkip: opts?.admin_override },
      );

      return tx.airJobDetail.update({
        where: { id: job.air_details.id },
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

  async issueHawbDraft(
    tenantId: string,
    jobId: string,
    dto: GenerateJobDocumentDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "DRAFT_HAWB_ISSUED");
    const result = await this.jobs.generateDocument(
      tenantId,
      jobId,
      "HAWB",
      dto,
      actor.id,
    );
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.airJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: {
          draft_hawb_issued_at: new Date(),
          workflow_stage: "DRAFT_HAWB_ISSUED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          updated_by: actor.id,
        },
      });
    });
    return result;
  }

  async issueHawbFinal(
    tenantId: string,
    jobId: string,
    dto: GenerateJobDocumentDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "FINAL_HAWB_ISSUED");
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.airJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!detail) throw new NotFoundException("Air job not found.");
      if (!detail.draft_hawb_issued_at) {
        throw new BadRequestException("Draft House Air Waybill must be issued first.");
      }
      if (!detail.payment_confirmed_at) {
        throw new BadRequestException(
          "Accounts must confirm payment before final House Air Waybill.",
        );
      }
    });
    const result = await this.jobs.generateDocument(
      tenantId,
      jobId,
      "HAWB",
      dto,
      actor.id,
    );
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.airJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: {
          final_hawb_issued_at: new Date(),
          workflow_stage: "FINAL_HAWB_ISSUED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          updated_by: actor.id,
        },
      });
    });
    return result;
  }

  async issuePreCan(
    tenantId: string,
    jobId: string,
    dto: GenerateJobDocumentDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "PRE_CAN_ISSUED");
    const result = await this.jobs.generateDocument(
      tenantId,
      jobId,
      "PRE_CAN",
      dto,
      actor.id,
    );
    await this.workflow.setJobStage(tenantId, jobId, "PRE_CAN_ISSUED", actor, {
      allowSkip: true,
    });
    return result;
  }

  async issueCan(
    tenantId: string,
    jobId: string,
    dto: GenerateJobDocumentDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "CAN_ISSUED");
    const result = await this.jobs.generateDocument(
      tenantId,
      jobId,
      "CAN",
      dto,
      actor.id,
    );
    await this.workflow.setJobStage(tenantId, jobId, "CAN_ISSUED", actor);
    return result;
  }

  async issueDeliveryOrder(
    tenantId: string,
    jobId: string,
    dto: GenerateJobDocumentDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "DELIVERY_ORDER_ISSUED");
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.airJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!detail) throw new NotFoundException("Air job not found.");
      if (!detail.payment_confirmed_at) {
        throw new BadRequestException(
          "Accounts must confirm payment before Delivery Order.",
        );
      }
    });
    const result = await this.jobs.generateDocument(
      tenantId,
      jobId,
      "DELIVERY_ORDER",
      dto,
      actor.id,
    );
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.airJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: {
          delivery_order_issued_at: new Date(),
          workflow_stage: "DELIVERY_ORDER_ISSUED",
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
    opts?: AirWorkflowOverrideDto,
  ) {
    this.workflow.assertCanEnterStage(actor.role, "CLOSED", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: { in: [JobType.AIR_EXPORT, JobType.AIR_IMPORT] },
        },
        include: {
          air_details: {
            include: {
              air_booking_form: { include: { parties: true } },
            },
          },
        },
      }),
    );
    if (!job?.air_details) throw new NotFoundException("Air job not found.");

    const detail = job.air_details;
    const ready =
      job.job_type === JobType.AIR_EXPORT
        ? detail.workflow_stage === "FINAL_HAWB_ISSUED" ||
          detail.workflow_stage === "MAWB_ISSUED"
        : detail.workflow_stage === "POD_RECEIVED";
    if (!ready && !opts?.admin_override) {
      throw new BadRequestException(
        job.job_type === JobType.AIR_EXPORT
          ? "Export job must reach FINAL_HAWB_ISSUED (or MAWB_ISSUED) before close."
          : "Import job must reach POD_RECEIVED before close.",
      );
    }

    await this.workflow.setJobStage(tenantId, jobId, "CLOSED", actor, {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
      allowSkip: Boolean(opts?.admin_override),
    });

    return {
      job_id: jobId,
      job_type: job.job_type,
      workflow_stage: "CLOSED" as AirWorkflowStage,
      report: {
        job_number: job.job_number,
        hawb_number: detail.hawb_number,
        mawb_number: detail.mawb_number,
        payment_confirmed_at: detail.payment_confirmed_at,
        draft_hawb_issued_at: detail.draft_hawb_issued_at,
        final_hawb_issued_at: detail.final_hawb_issued_at,
        delivery_order_issued_at: detail.delivery_order_issued_at,
        booking_form: detail.air_booking_form,
        closed_at: new Date().toISOString(),
        closed_by: actor.id,
      },
    };
  }
}
