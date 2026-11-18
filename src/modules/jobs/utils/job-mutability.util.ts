import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { JobStatus, UserRole } from "@prisma/client";
import { hasAnyOperationsMatrix } from "../../../common/constants/module-permission-tree";
import { seesAllJobDepartments } from "../../../common/utils/job-type-access.util";
import { JOBS_PERMISSIONS } from "../constants/jobs-permission.constants";

export const CLOSED_JOB_LOCK_MESSAGE =
  "Job is closed. Request reopen and wait for Tenant Admin approval.";

export function isJobClosed(
  status: JobStatus | string | null | undefined,
): boolean {
  return status === JobStatus.CLOSED || status === "CLOSED";
}

/** Hard lock: reject any mutation while Job.status is CLOSED. */
export function assertJobNotClosed(
  status: JobStatus | string | null | undefined,
): void {
  if (isJobClosed(status)) {
    throw new BadRequestException(CLOSED_JOB_LOCK_MESSAGE);
  }
}

export function isTenantAdminRole(role?: string | null): boolean {
  return role === UserRole.TENANT_ADMIN;
}

export function assertTenantAdmin(role?: string | null): void {
  if (!isTenantAdminRole(role)) {
    throw new ForbiddenException(
      "Only Tenant Admin can approve or reopen closed jobs.",
    );
  }
}

/**
 * Dedicated transport assignee: has jobs.transport.handoff and no ops
 * job-type matrix / admin sees-all. List = ops_user_id only.
 */
export function isTransportHandoffOnly(
  role?: string | null,
  permissions?: string[] | null,
): boolean {
  const perms = permissions ?? [];
  if (!perms.includes(JOBS_PERMISSIONS.TRANSPORT_HANDOFF)) return false;
  if (seesAllJobDepartments(role, perms)) return false;
  if (hasAnyOperationsMatrix(perms)) return false;
  return true;
}

/**
 * Handoff-limited: staff who reach the job via org department / assignee,
 * not via admin / sees-all. Full ops (job_type grant holders who also match)
 * stay full if they seesAll or are admin; otherwise limited when only handoff.
 */
export function isHandoffLimitedAudience(input: {
  role?: string | null;
  permissions?: string[] | null;
  actorDepartmentId?: string | null;
  actorUserId?: string | null;
  jobDepartmentId?: string | null;
  jobOpsUserId?: string | null;
  hasJobTypeGrant?: boolean;
}): boolean {
  if (seesAllJobDepartments(input.role, input.permissions)) return false;
  if (isTransportHandoffOnly(input.role, input.permissions)) {
    return (
      !!input.actorUserId &&
      !!input.jobOpsUserId &&
      input.actorUserId === input.jobOpsUserId
    );
  }
  const inOrgDept =
    !!input.actorDepartmentId &&
    !!input.jobDepartmentId &&
    input.actorDepartmentId === input.jobDepartmentId;
  const isAssignee =
    !!input.actorUserId &&
    !!input.jobOpsUserId &&
    input.actorUserId === input.jobOpsUserId;
  if (!inOrgDept && !isAssignee) return false;
  // If they already have job_type grant, treat as full ops (not handoff-only).
  if (input.hasJobTypeGrant) return false;
  return true;
}
