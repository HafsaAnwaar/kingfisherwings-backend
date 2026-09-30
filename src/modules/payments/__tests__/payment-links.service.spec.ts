import { GoneException, NotFoundException } from "@nestjs/common";
import {
  hashPaymentLinkToken,
  PaymentLinksService,
} from "../payment-links.service";

function setup(link: unknown) {
  const prisma = {
    paymentLink: { findUnique: jest.fn().mockResolvedValue(link) },
  };
  return {
    svc: new PaymentLinksService(
      prisma as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    ),
    prisma,
  };
}
const TOKEN = "x".repeat(32);

describe("PaymentLinksService.resolve", () => {
  it("looks tokens up by SHA-256 hash, never by raw value", async () => {
    const { svc, prisma } = setup({
      id: "l",
      revoked_at: null,
      expires_at: new Date(Date.now() + 1e6),
    });
    await svc.resolve(TOKEN);
    expect(prisma.paymentLink.findUnique).toHaveBeenCalledWith({
      where: { token_hash: hashPaymentLinkToken(TOKEN) },
    });
    expect(hashPaymentLinkToken(TOKEN)).toHaveLength(64);
  });

  it("404s unknown or malformed tokens", async () => {
    await expect(setup(null).svc.resolve(TOKEN)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(setup(null).svc.resolve("short")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("410s expired or revoked links", async () => {
    await expect(
      setup({
        revoked_at: null,
        expires_at: new Date(Date.now() - 1000),
      }).svc.resolve(TOKEN),
    ).rejects.toBeInstanceOf(GoneException);
    await expect(
      setup({
        revoked_at: new Date(),
        expires_at: new Date(Date.now() + 1e6),
      }).svc.resolve(TOKEN),
    ).rejects.toBeInstanceOf(GoneException);
  });
});
