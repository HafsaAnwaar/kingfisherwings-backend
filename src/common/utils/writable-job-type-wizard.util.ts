import { JobType } from "@prisma/client";
import {
  allOperationsServices,
  writableJobTypes,
} from "../constants/module-permission-tree";
import { seesAllJobDepartments } from "./job-type-access.util";

/**
 * Shared create-wizard payload for jobs / quotations / shipments / enquiries:
 * services filtered to operations_*.write (or all when no ops matrix).
 */
export function writableJobTypeWizard(
  permissions: string[] = [],
  role?: string | null,
) {
  const all = allOperationsServices();
  const allowed = seesAllJobDepartments(role, permissions)
    ? null
    : writableJobTypes(permissions);
  const services =
    allowed === null
      ? all
      : all.filter((s) => allowed.includes(s.job_type));

  return {
    services: services.map((s) => ({ ...s, value: s.job_type as JobType })),
    writable_job_types: allowed,
  };
}
