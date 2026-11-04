import { JobType } from "@prisma/client";
import { visibleJobTypes } from "../../../common/constants/module-permission-tree";
import { isOpsOnlyActor } from "../../../common/utils/conversion-visibility.util";
import {
  canSeeJobTypeForActor,
  visibleJobTypesForActor,
} from "../../../common/utils/job-type-access.util";

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
