import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { AirWorkflowStage, JobType, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertCanEnterStage,
  assertForwardTransition,
} from "../../common/workflow/workflow-stage-guard";
import {
  AIR_STAGE_OWNER,
  airStageOrderForJobType,
  isAirExportParallel,
} from "./constants/air-workflow.constants";

@Injectable()
export class AirWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  assertCanEnterStage(
    role: UserRole,
    targetStage: AirWorkflowStage | string,
    opts?: { override?: boolean; overrideReason?: string },
  ) {
    return assertCanEnterStage(role, String(targetStage), AIR_STAGE_OWNER, opts);
  }

  assertForwardTransition(
    jobType: string,
    current: AirWorkflowStage | string,
    target: AirWorkflowStage | string,
    opts?: { allowSkip?: boolean },
  ) {
    assertForwardTransition(
      airStageOrderForJobType(jobType),
      String(current),
      String(target),
      {
        allowSkip: opts?.allowSkip,
        isParallelAllowed:
          jobType === "AIR_EXPORT" ? isAirExportParallel : undefined,
      },
    );
  }

  async getAirJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: { in: [JobType.AIR_EXPORT, JobType.AIR_IMPORT] },
        },
        include: { air_details: true },
      }),
    );
    if (!job?.air_details) {
      throw new NotFoundException("Air job not found.");
    }
    return job;
  }

  async setJobStage(
    tenantId: string,
    jobId: string,
    target: AirWorkflowStage,
    actor: { id: string; role: UserRole },
    opts?: { override?: boolean; overrideReason?: string; allowSkip?: boolean },
  ) {
    this.assertCanEnterStage(actor.role, target, opts);
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
      if (!job?.air_details) {
        throw new BadRequestException("Air job details not found.");
      }
      this.assertForwardTransition(
        job.job_type,
        job.air_details.workflow_stage,
        target,
        { allowSkip: opts?.allowSkip },
      );
      return tx.airJobDetail.update({
        where: { id: job.air_details.id },
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
}
