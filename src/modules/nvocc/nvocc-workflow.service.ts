import { Injectable, BadRequestException } from "@nestjs/common";
import { NvoccWorkflowStage, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertCanEnterStage,
  assertForwardTransition,
} from "../../common/workflow/workflow-stage-guard";
import {
  NVOCC_STAGE_OWNER,
  NVOCC_WORKFLOW_STAGE_ORDER,
  isNvoccParallel,
  stageIndex,
} from "./constants/nvocc-workflow.constants";

@Injectable()
export class NvoccWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  assertCanEnterStage(
    role: UserRole,
    targetStage: NvoccWorkflowStage | string,
    opts?: { override?: boolean; overrideReason?: string },
  ) {
    return assertCanEnterStage(role, String(targetStage), NVOCC_STAGE_OWNER, opts);
  }

  assertForwardTransition(
    current: NvoccWorkflowStage | string,
    target: NvoccWorkflowStage | string,
    opts?: { allowSkip?: boolean },
  ) {
    assertForwardTransition(
      NVOCC_WORKFLOW_STAGE_ORDER,
      String(current),
      String(target),
      {
        allowSkip: opts?.allowSkip,
        isParallelAllowed: isNvoccParallel,
      },
    );
  }

  async setBookingStage(
    tenantId: string,
    bookingId: string,
    target: NvoccWorkflowStage,
    actor: { id: string; role: UserRole },
    opts?: { override?: boolean; overrideReason?: string; allowSkip?: boolean },
  ) {
    this.assertCanEnterStage(actor.role, target, opts);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const booking = await tx.nvoccBooking.findFirst({
        where: { id: bookingId, tenant_id: tenantId, deleted_at: null },
      });
      if (!booking) throw new BadRequestException("Booking not found.");
      this.assertForwardTransition(booking.workflow_stage, target, opts);
      return tx.nvoccBooking.update({
        where: { id: bookingId },
        data: {
          workflow_stage: target,
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          stage_override_reason: opts?.override
            ? opts.overrideReason
            : undefined,
          updated_by: actor.id,
        },
      });
    });
  }

  async setJobStage(
    tenantId: string,
    jobId: string,
    target: NvoccWorkflowStage,
    actor: { id: string; role: UserRole },
    opts?: { override?: boolean; overrideReason?: string; allowSkip?: boolean },
  ) {
    this.assertCanEnterStage(actor.role, target, opts);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.nvoccJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });
      if (!detail) throw new BadRequestException("NVOCC job details not found.");
      this.assertForwardTransition(detail.workflow_stage, target, {
        allowSkip: opts?.allowSkip,
      });
      return tx.nvoccJobDetail.update({
        where: { id: detail.id },
        data: {
          workflow_stage: target,
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          stage_override_reason: opts?.override
            ? opts.overrideReason
            : undefined,
          updated_by: actor.id,
        },
      });
    });
  }

  nextExpected(current: string): string | null {
    const i = stageIndex(current);
    if (i < 0 || i >= NVOCC_WORKFLOW_STAGE_ORDER.length - 1) return null;
    return NVOCC_WORKFLOW_STAGE_ORDER[i + 1]!;
  }
}
