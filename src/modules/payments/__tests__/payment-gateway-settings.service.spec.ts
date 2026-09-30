import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { PaymentGatewaySettingsService } from "../payment-gateway-settings.service";
import { StripeGatewayService } from "../stripe-gateway.service";

const TENANT = "11111111-1111-1111-1111-111111111111";

function setup(existing: Record<string, unknown> | null = null) {
  process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY = "unit-test-key";
  delete process.env.STRIPE_SECRET_KEY;
  const prisma = {
    tenantPaymentGateway: {
      findUnique: jest.fn().mockResolvedValue(existing),
      create: jest.fn(({ data }) => ({
        id: "gw",
        updated_at: new Date(),
        ...data,
      })),
      update: jest.fn(({ data }) => ({ ...existing, ...data })),
    },
  };
  const audit = { log: jest.fn() };
  const svc = new PaymentGatewaySettingsService(
    prisma as never,
    new StripeGatewayService(),
    audit as never,
  );
  return { svc, prisma };
}

describe("PaymentGatewaySettingsService", () => {
  it("refuses to enable without a secret key and writes nothing", async () => {
    const { svc, prisma } = setup();
    await expect(
      svc.updateSettings(TENANT, { is_enabled: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.tenantPaymentGateway.create).not.toHaveBeenCalled();
  });

  it("refuses platform-account collection when the platform key is missing", async () => {
    const { svc } = setup();
    await expect(
      svc.updateSettings(
        TENANT,
        { is_enabled: true, use_platform_account: true },
        undefined,
        { allowPlatformAccount: true },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("only lets the Super Admin switch on platform-account collection", async () => {
    const { svc, prisma } = setup();
    await expect(
      svc.updateSettings(TENANT, { use_platform_account: true }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.tenantPaymentGateway.create).not.toHaveBeenCalled();
  });

  it("encrypts secrets at rest and never returns them", async () => {
    const { svc, prisma } = setup();
    const res = await svc.updateSettings(TENANT, {
      is_enabled: true,
      secret_key: "sk_test_abc123",
      webhook_secret: "whsec_abc123",
      publishable_key: "pk_test_abc123",
    });
    const stored = prisma.tenantPaymentGateway.create.mock.calls[0][0].data;
    expect(stored.secret_key_encrypted).toBeDefined();
    expect(stored.secret_key_encrypted).not.toContain("sk_test_abc123");
    expect(stored.webhook_token).toMatch(/^[a-f0-9]{48}$/);
    const json = JSON.stringify(res);
    expect(json).not.toContain("sk_test_abc123");
    expect(json).not.toContain("whsec_abc123");
    expect(res.data).toMatchObject({
      secret_key_set: true,
      webhook_secret_set: true,
    });
  });

  it("rejects values that are not Stripe keys", async () => {
    const { svc } = setup();
    await expect(
      svc.updateSettings(TENANT, { secret_key: "pk_live_x" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      svc.updateSettings(TENANT, { webhook_secret: "nope" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
