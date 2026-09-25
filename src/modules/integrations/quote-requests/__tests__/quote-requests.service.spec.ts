import { NotFoundException } from "@nestjs/common";
import { QuoteRequestsService } from "../quote-requests.service";

describe("QuoteRequestsService feature gate + cron filter", () => {
  const prisma = {
    tenant: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    externalQuoteRequestConnection: {
      findUnique: jest.fn(),
    },
    runWithTenant: jest.fn(),
  };
  const crmActivity = {
    convertToQuote: jest.fn(),
  };

  let service: QuoteRequestsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuoteRequestsService(prisma as never, crmActivity as never);
  });

  it("assertBridgeEnabled returns 404 when feature flag is off", async () => {
    prisma.tenant.findFirst.mockResolvedValue({
      quote_requests_bridge_enabled: false,
      base_currency: "USD",
    });
    await expect(service.assertBridgeEnabled("tenant-a")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("syncAllEnabledTenants skips inactive connections", async () => {
    prisma.tenant.findMany.mockResolvedValue([
      { id: "tenant-a" },
      { id: "tenant-b" },
    ]);
    prisma.externalQuoteRequestConnection.findUnique
      .mockResolvedValueOnce({ is_active: false })
      .mockResolvedValueOnce(null);

    const syncSpy = jest.spyOn(service, "sync").mockResolvedValue({
      success: true,
      data: {
        run_id: "r1",
        fetched: 0,
        upserted: 0,
        failed: 0,
        error_summary: null,
      },
    });

    const results = await service.syncAllEnabledTenants();
    expect(results).toEqual([]);
    expect(syncSpy).not.toHaveBeenCalled();
  });

  it("syncAllEnabledTenants only syncs active enabled tenants", async () => {
    prisma.tenant.findMany.mockResolvedValue([{ id: "tenant-a" }]);
    prisma.externalQuoteRequestConnection.findUnique.mockResolvedValue({
      is_active: true,
    });
    const syncSpy = jest.spyOn(service, "sync").mockResolvedValue({
      success: true,
      data: {
        run_id: "r1",
        fetched: 0,
        upserted: 0,
        failed: 0,
        error_summary: null,
      },
    });

    const results = await service.syncAllEnabledTenants();
    expect(results).toEqual([{ tenant_id: "tenant-a", ok: true }]);
    expect(syncSpy).toHaveBeenCalledWith("tenant-a", "cron");
  });
});
