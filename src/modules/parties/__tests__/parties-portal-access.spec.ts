import { ForbiddenException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PartiesService } from "../parties.service";

describe("PartiesService portal_access gate", () => {
  const prisma = {
    runWithTenant: jest.fn(),
    tenant: { findFirst: jest.fn() },
  };
  const locale = {
    getDefaultCurrency: jest.fn().mockReturnValue("USD"),
  };

  let service: PartiesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PartiesService(prisma as never, locale as never);
    jest.spyOn(service as never, "assertSalespersonValid").mockResolvedValue(undefined as never);
    jest.spyOn(service as never, "assertCompanyExists").mockResolvedValue(undefined as never);
    prisma.tenant.findFirst.mockResolvedValue({
      country_code: "AE",
      base_currency: "AED",
    });
  });

  it("forces portal_access false for non-admin create", async () => {
    prisma.runWithTenant.mockImplementation(async (_t, fn) =>
      fn({
        party: {
          create: jest.fn().mockImplementation(({ data }) => data),
        },
      }),
    );

    const created = await service.create(
      "tenant-a",
      {
        party_type: "CUSTOMER",
        code: "C1",
        name: "Acme",
        portal_access: true,
      } as never,
      "actor-1",
      UserRole.SALES_EXECUTIVE,
    );

    expect(created.portal_access).toBe(false);
  });

  it("allows portal_access true for TENANT_ADMIN create", async () => {
    prisma.runWithTenant.mockImplementation(async (_t, fn) =>
      fn({
        party: {
          create: jest.fn().mockImplementation(({ data }) => data),
        },
      }),
    );

    const created = await service.create(
      "tenant-a",
      {
        party_type: "CUSTOMER",
        code: "C1",
        name: "Acme",
        portal_access: true,
      } as never,
      "actor-1",
      UserRole.TENANT_ADMIN,
    );

    expect(created.portal_access).toBe(true);
  });

  it("forbids non-admin from updating portal_access", async () => {
    await expect(
      service.update(
        "tenant-a",
        "party-1",
        { portal_access: true } as never,
        "actor-1",
        UserRole.SALES_EXECUTIVE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
