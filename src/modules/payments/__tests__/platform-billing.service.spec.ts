import { BadRequestException } from "@nestjs/common";
import { PlatformBillingService } from "../platform-billing.service";

function service() {
  return new PlatformBillingService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
}

describe("PlatformBillingService.computeTotals", () => {
  it("computes subtotal, discount, tax and total server-side", () => {
    const t = service().computeTotals(
      [
        { description: "Monthly Platform Fee", unit_price: 500 },
        { description: "Additional User Fee", quantity: 3, unit_price: 20 },
      ],
      60,
      5,
    );
    expect(t.header.subtotal.toFixed(2)).toBe("560.00");
    expect(t.header.discount_amount.toFixed(2)).toBe("60.00");
    expect(t.header.tax_amount.toFixed(2)).toBe("25.00");
    expect(t.header.total_amount.toFixed(2)).toBe("525.00");
    expect(t.lines[1].amount.toFixed(2)).toBe("60.00");
  });

  it("rejects a discount larger than the subtotal", () => {
    expect(() =>
      service().computeTotals([{ description: "Fee", unit_price: 10 }], 11, 0),
    ).toThrow(BadRequestException);
  });

  it("rounds fractional line amounts to cents", () => {
    const t = service().computeTotals([
      { description: "Storage", quantity: 1.5, unit_price: 3.333 },
    ]);
    expect(t.header.total_amount.toFixed(2)).toBe("5.00");
  });
});
