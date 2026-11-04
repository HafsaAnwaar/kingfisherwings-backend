import { JobType, UserRole } from "@prisma/client";
import { visibleJobTypes } from "../../../common/constants/module-permission-tree";
import { isOpsOnlyActor } from "../../../common/utils/conversion-visibility.util";
import {
  canSeeJobTypeForActor,
  jobTypeFilterForActor,
  visibleJobTypesForActor,
} from "../../../common/utils/job-type-access.util";

/** Nine live jobs. One courier job is the type a partial matrix can miss. */
const NINE_JOBS: JobType[] = [
  JobType.AIR_EXPORT,
  JobType.AIR_EXPORT,
  JobType.AIR_IMPORT,
  JobType.SEA_FCL_EXPORT,
  JobType.SEA_FCL_IMPORT,
  JobType.SEA_LCL_EXPORT,
  JobType.LAND,
  JobType.WAREHOUSE,
  JobType.COURIER,
];

const EIGHT_TYPE_GRANTS = [
  "operations_scope.read",
  "operations_air_export.write",
  "operations_air_import.read",
  "operations_sea_fcl_export.see",
  "operations_sea_fcl_import.write",
  "operations_sea_lcl_export.read",
  "operations_land.read",
  "operations_warehouse.read",
];

function jobsShown(permissions: string[], role?: string | null): JobType[] {
  const filter = jobTypeFilterForActor(permissions, role);
  if (!filter) return [...NINE_JOBS];
  if (typeof filter === "string") {
    return NINE_JOBS.filter((jobType) => jobType === filter);
  }
  return NINE_JOBS.filter((jobType) => filter.in.includes(jobType));
}

/**
 * Regression: ops staff with write must list by job_type matrix only.
 * Converted-customer gating remains for quotations, not jobs.
 */
describe("jobs ops visibility policy", () => {
  it("ops-only actor with air export write still sees AIR_EXPORT in visible types", () => {
    const permissions = [
      "jobs.view",
      "operations_air_export.write",
      "operations_air_import.write",
    ];
    expect(isOpsOnlyActor({ role: "OPERATIONS_EXECUTIVE", permissions })).toBe(
      true,
    );
    expect(visibleJobTypes(permissions)).toEqual(
      expect.arrayContaining([JobType.AIR_EXPORT, JobType.AIR_IMPORT]),
    );
  });

  it("does not require sales write to include air types in the visible set", () => {
    const permissions = ["operations_air_export.write"];
    expect(visibleJobTypes(permissions)).toEqual([JobType.AIR_EXPORT]);
  });

  it("includes sea and warehouse when those modes are granted", () => {
    const permissions = [
      "operations_sea_fcl_export.write",
      "operations_warehouse.read",
      "operations_land.see",
    ];
    expect(visibleJobTypes(permissions)).toEqual(
      expect.arrayContaining([
        JobType.SEA_FCL_EXPORT,
        JobType.WAREHOUSE,
        JobType.LAND,
      ]),
    );
    expect(visibleJobTypes(permissions)).not.toEqual(
      expect.arrayContaining([JobType.AIR_EXPORT, JobType.AIR_IMPORT]),
    );
  });

  it("sea-only write does not unlock air types", () => {
    const permissions = ["operations_sea_lcl_import.write"];
    expect(visibleJobTypes(permissions)).toEqual([JobType.SEA_LCL_IMPORT]);
  });

  it("tenant admin sees every department even with a partial matrix", () => {
    const permissions = ["operations_air_export.write"];
    expect(visibleJobTypesForActor(permissions, "TENANT_ADMIN")).toBeNull();
    expect(
      canSeeJobTypeForActor(permissions, JobType.WAREHOUSE, "TENANT_ADMIN"),
    ).toBe(true);
    expect(
      canSeeJobTypeForActor(permissions, JobType.SEA_FCL_IMPORT, "BRANCH_MANAGER"),
    ).toBe(true);
  });

  it("staff stay limited to granted job types", () => {
    const permissions = ["operations_air_export.write"];
    expect(
      visibleJobTypesForActor(permissions, "OPERATIONS_EXECUTIVE"),
    ).toEqual([JobType.AIR_EXPORT]);
    expect(
      canSeeJobTypeForActor(
        permissions,
        JobType.SEA_LCL_IMPORT,
        "OPERATIONS_EXECUTIVE",
      ),
    ).toBe(false);
  });
});

describe("job count matches the jobs shown (9 live jobs)", () => {
  it("admin job_count is all 9, even with a partial operations matrix", () => {
    const partial = ["operations_air_export.write", "operations_scope.read"];
    for (const role of [
      UserRole.TENANT_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.SUPER_ADMIN,
    ]) {
      expect(jobsShown(partial, role)).toHaveLength(9);
      expect(jobTypeFilterForActor(partial, role)).toBeUndefined();
    }
    expect(
      jobsShown(["admin_users.write", "operations_scope.read"], "OPERATIONS_EXECUTIVE"),
    ).toHaveLength(9);
  });

  it("two staff with the same grants see the same 8 jobs, not who created them", () => {
    const ops = jobsShown(EIGHT_TYPE_GRANTS, UserRole.OPERATIONS_EXECUTIVE);
    const docs = jobsShown(EIGHT_TYPE_GRANTS, UserRole.DOCUMENTATION);
    expect(ops).toHaveLength(8);
    expect(docs).toEqual(ops);
    expect(ops).not.toContain(JobType.COURIER);
    expect(jobTypeFilterForActor(EIGHT_TYPE_GRANTS, UserRole.OPERATIONS_EXECUTIVE)).toEqual(
      { in: expect.arrayContaining([JobType.AIR_EXPORT, JobType.WAREHOUSE]) },
    );
  });

  it("operations_scope alone does not zero a department role", () => {
    const scopeOnly = ["operations_scope.see", "operations_scope.read"];
    expect(visibleJobTypes(scopeOnly)).toEqual([]);
    expect(jobsShown(scopeOnly, UserRole.OPERATIONS_EXECUTIVE)).toHaveLength(9);
    expect(jobsShown(scopeOnly, UserRole.SALES_EXECUTIVE)).toHaveLength(9);
    expect(jobsShown(scopeOnly, UserRole.DRIVER)).toHaveLength(0);
    expect(jobsShown(scopeOnly, UserRole.CUSTOMER)).toHaveLength(0);
  });

  it("list filter and count filter are the same set", () => {
    const permissions = ["operations_scope.read", "operations_courier.write"];
    const filter = jobTypeFilterForActor(
      permissions,
      UserRole.OPERATIONS_EXECUTIVE,
    );
    const listed = jobsShown(permissions, UserRole.OPERATIONS_EXECUTIVE);
    expect(filter).toEqual({ in: [JobType.COURIER] });
    expect(listed).toHaveLength(1);
    expect(listed.every((jobType) => jobType === JobType.COURIER)).toBe(true);
  });
});
