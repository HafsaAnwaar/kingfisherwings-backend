import { JobType } from "@prisma/client";
import {
  OPERATIONS_SCOPE_SUBMODULE_KEY,
  mergeJobTypeScopeIntoGrants,
  visibleJobTypes,
  writableJobTypes,
} from "./module-permission-tree";

describe("mergeJobTypeScopeIntoGrants", () => {
  it("overlays visible/writable onto operations grants", () => {
    const merged = mergeJobTypeScopeIntoGrants(
      [
        { module: "sales", submodule: "quotations", access: "write" },
        { module: "operations", submodule: "air_import", access: "write" },
      ],
      {
        visible_job_types: [JobType.AIR_EXPORT, JobType.WAREHOUSE],
        writable_job_types: [JobType.AIR_EXPORT],
      },
    );

    const bySub = new Map(
      merged
        .filter((g) => g.module === "operations")
        .map((g) => [g.submodule, g.access]),
    );

    expect(bySub.get("air_export")).toBe("write");
    expect(bySub.get("warehouse")).toBe("read");
    expect(bySub.get("air_import")).toBe("none");
    expect(bySub.get(OPERATIONS_SCOPE_SUBMODULE_KEY)).toBe("read");
    expect(
      merged.find((g) => g.module === "sales" && g.submodule === "quotations")
        ?.access,
    ).toBe("write");
  });

  it("empty visible list clears job types but keeps scope marker", () => {
    const merged = mergeJobTypeScopeIntoGrants(
      [{ module: "operations", submodule: "air_export", access: "write" }],
      { visible_job_types: [] },
    );

    expect(
      merged.find((g) => g.submodule === "air_export")?.access,
    ).toBe("none");
    expect(
      merged.find((g) => g.submodule === OPERATIONS_SCOPE_SUBMODULE_KEY)
        ?.access,
    ).toBe("read");
  });

  it("writable-only upgrades without clearing other ops grants", () => {
    const merged = mergeJobTypeScopeIntoGrants(
      [
        { module: "operations", submodule: "air_import", access: "read" },
        { module: "operations", submodule: "land", access: "write" },
      ],
      { writable_job_types: [JobType.WAREHOUSE] },
    );

    const bySub = new Map(
      merged
        .filter((g) => g.module === "operations")
        .map((g) => [g.submodule, g.access]),
    );
    expect(bySub.get("warehouse")).toBe("write");
    expect(bySub.get("air_import")).toBe("read");
    expect(bySub.get("land")).toBe("write");
    expect(bySub.has(OPERATIONS_SCOPE_SUBMODULE_KEY)).toBe(false);
  });
});

describe("visibleJobTypes with scope marker", () => {
  it("returns empty array when only operations_scope is granted", () => {
    const perms = ["operations_scope.see", "operations_scope.read"];
    expect(visibleJobTypes(perms)).toEqual([]);
    expect(writableJobTypes(perms)).toEqual([]);
  });

  it("still returns null when no operations_* codes exist", () => {
    expect(visibleJobTypes(["sales_quotations.write"])).toBeNull();
  });
});
