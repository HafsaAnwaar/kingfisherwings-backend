import {
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import {
  departmentsForRole,
  type WorkflowDept,
} from "./workflow-dept";

export type StageOwnerMap = Record<string, WorkflowDept>;

export function assertCanEnterStage(
  role: UserRole,
  targetStage: string,
  stageOwner: StageOwnerMap,
  opts?: { override?: boolean; overrideReason?: string },
) {
  const owner = stageOwner[targetStage];
  if (!owner) {
    throw new BadRequestException(`Unknown workflow stage: ${targetStage}`);
  }
  const depts = departmentsForRole(role);
  if (depts.includes("ADMIN")) {
    if (opts?.override && !opts.overrideReason?.trim()) {
      throw new BadRequestException(
        "Admin override requires stage_override_reason.",
      );
    }
    return { override: Boolean(opts?.override) };
  }
  if (owner === "CUSTOMER") {
    throw new ForbiddenException(
      "This stage is advanced by the customer portal, not staff.",
    );
  }
  if (!depts.includes(owner)) {
    throw new ForbiddenException(
      `Only ${owner} (or Tenant Admin) may advance to ${targetStage}.`,
    );
  }
  return { override: false };
}

export function assertForwardTransition(
  stageOrder: readonly string[],
  current: string,
  target: string,
  opts?: {
    allowSkip?: boolean;
    isParallelAllowed?: (from: string, to: string) => boolean;
  },
) {
  const from = stageOrder.indexOf(current);
  const to = stageOrder.indexOf(target);
  if (from < 0 || to < 0) {
    throw new BadRequestException("Invalid workflow stage.");
  }
  if (to <= from && current !== target) {
    // allow same-stage no-op callers to handle separately; reject backwards
    if (to < from) {
      throw new BadRequestException(
        `Cannot move from ${current} to ${target} (not forward).`,
      );
    }
  }
  if (to <= from) {
    throw new BadRequestException(
      `Cannot move from ${current} to ${target} (not forward).`,
    );
  }
  if (!opts?.allowSkip && to > from + 1) {
    if (opts?.isParallelAllowed?.(current, target)) return;
    throw new BadRequestException(
      `Must complete intermediate stages before ${target}. Current: ${current}.`,
    );
  }
}
