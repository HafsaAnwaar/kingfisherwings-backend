import { UserRole } from "@prisma/client";
import { canGrantPortalAccess } from "./portal-access.util";

describe("canGrantPortalAccess", () => {
  it("allows TENANT_ADMIN only", () => {
    expect(canGrantPortalAccess(UserRole.TENANT_ADMIN)).toBe(true);
    expect(canGrantPortalAccess(UserRole.BRANCH_MANAGER)).toBe(false);
    expect(canGrantPortalAccess(UserRole.SALES_EXECUTIVE)).toBe(false);
    expect(canGrantPortalAccess(UserRole.OPERATIONS_EXECUTIVE)).toBe(false);
    expect(canGrantPortalAccess(null)).toBe(false);
    expect(canGrantPortalAccess(undefined)).toBe(false);
  });
});
