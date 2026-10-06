import { UserRole } from "@prisma/client";
import {
  isOpsOnlyActor,
  isSalesSideActor,
} from "./conversion-visibility.util";

describe("conversion-visibility", () => {
  it("treats TENANT_ADMIN and sales roles as sales-side", () => {
    expect(isSalesSideActor({ role: UserRole.TENANT_ADMIN })).toBe(true);
    expect(isSalesSideActor({ role: UserRole.SALES_EXECUTIVE })).toBe(true);
    expect(isOpsOnlyActor({ role: UserRole.SALES_EXECUTIVE })).toBe(false);
  });

  it("treats OPERATIONS without sales write as ops-only", () => {
    expect(
      isOpsOnlyActor({
        role: UserRole.OPERATIONS_EXECUTIVE,
        permissions: ["jobs.view", "operations_air_export.write"],
      }),
    ).toBe(true);
    expect(
      isSalesSideActor({
        role: UserRole.OPERATIONS_EXECUTIVE,
        permissions: ["jobs.view"],
      }),
    ).toBe(false);
  });

  it("sales_quotations.write is never ops-only", () => {
    expect(
      isOpsOnlyActor({
        role: UserRole.OPERATIONS_EXECUTIVE,
        permissions: ["jobs.view", "sales_quotations.write"],
      }),
    ).toBe(false);
  });
});
