import { ForbiddenException } from "@nestjs/common";
import { JobType, Prisma } from "@prisma/client";
import {
  canSeeJobType,
  canWriteJobType,
  visibleJobTypes,
} from "../constants/module-permission-tree";

export type JobTypeAccessMode = "see" | "write";

/**
 * Prisma `where` fragment for job_type scoping from the ops permission matrix.
 * Returns `{}` when unrestricted (no ops matrix / legacy role-only users).
 */
export function jobTypeWhere(
  permissions: string[] | null | undefined,
  field: "job_type" = "job_type",
): Record<string, unknown> {
  const allowed = visibleJobTypes(permissions ?? []);
  if (allowed === null) return {};
  if (allowed.length === 0) {
    // Matrix present but nothing granted — match nothing
    return { [field]: { in: [] as JobType[] } };
  }
  return { [field]: { in: allowed } };
}

/** Same as jobTypeWhere but typed for Prisma Job/Quotation/Shipment filters. */
export function jobTypeInFilter(
  permissions: string[] | null | undefined,
): { in: JobType[] } | undefined {
  const allowed = visibleJobTypes(permissions ?? []);
  if (allowed === null) return undefined;
  return { in: allowed };
}

/**
 * Invoice list/get filter via linked job.job_type.
 * Manual invoices (no job) stay visible — finance can create/edit them outside ops modes.
 */
export function invoiceJobTypeScope(
  permissions: string[] | null | undefined,
): Prisma.InvoiceWhereInput | undefined {
  const allowed = visibleJobTypes(permissions ?? []);
  if (allowed === null) return undefined;
  if (allowed.length === 0) {
    // Matrix present but no job types granted — still allow job-less (manual) invoices.
    return { job_id: null };
  }
  return {
    OR: [
      { job_id: null },
      { job: { is: { job_type: { in: allowed }, deleted_at: null } } },
    ],
  };
}

export function assertJobTypeAccess(
  permissions: string[] | null | undefined,
  jobType: JobType | string | null | undefined,
  mode: JobTypeAccessMode = "see",
): void {
  if (!jobType) return;
  const jt = jobType as JobType;
  const perms = permissions ?? [];
  const ok =
    mode === "write" ? canWriteJobType(perms, jt) : canSeeJobType(perms, jt);
  if (!ok) {
    throw new ForbiddenException(
      mode === "write"
        ? `You do not have write access for ${jt}.`
        : `You do not have access to ${jt} records.`,
    );
  }
}

export function jobTypeAccessSummary(permissions: string[] | null | undefined): {
  visible_job_types: JobType[] | null;
  unrestricted_ops: boolean;
} {
  const visible = visibleJobTypes(permissions ?? []);
  return {
    visible_job_types: visible,
    unrestricted_ops: visible === null,
  };
}
