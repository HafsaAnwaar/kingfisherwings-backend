import { JobType } from "@prisma/client";
import { writableJobTypeWizard } from "./writable-job-type-wizard.util";

describe("writableJobTypeWizard", () => {
  it("returns all services when no ops matrix", () => {
    const result = writableJobTypeWizard(["jobs.view"]);
    expect(result.writable_job_types).toBeNull();
    expect(result.services.length).toBeGreaterThan(0);
    expect(result.services.every((s) => s.value === s.job_type)).toBe(true);
  });

  it("filters to writable types when matrix is present", () => {
    const result = writableJobTypeWizard([
      "operations_air_export.write",
      "operations_air_import.read",
      "jobs.view",
    ]);
    expect(result.writable_job_types).toEqual([JobType.AIR_EXPORT]);
    expect(result.services.map((s) => s.job_type)).toEqual([JobType.AIR_EXPORT]);
  });

  it("returns empty when matrix present but no write", () => {
    const result = writableJobTypeWizard(["operations_air_export.read"]);
    expect(result.writable_job_types).toEqual([]);
    expect(result.services).toEqual([]);
  });

  it("includes sea and warehouse writes together and excludes air", () => {
    const result = writableJobTypeWizard([
      "operations_sea_fcl_export.write",
      "operations_warehouse.write",
      "operations_air_export.read",
    ]);
    expect(result.writable_job_types).toEqual(
      expect.arrayContaining([JobType.SEA_FCL_EXPORT, JobType.WAREHOUSE]),
    );
    expect(result.writable_job_types).not.toContain(JobType.AIR_EXPORT);
    expect(result.services.map((s) => s.job_type).sort()).toEqual(
      [JobType.SEA_FCL_EXPORT, JobType.WAREHOUSE].sort(),
    );
  });
});
