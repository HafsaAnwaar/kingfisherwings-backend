import {
  fromMinorUnits,
  gtMoney,
  roundMoney,
  toMinorUnits,
} from "../utils/money.util";

describe("money.util", () => {
  it("converts two-decimal currencies without float drift", () => {
    expect(toMinorUnits("1000.0000", "USD")).toBe(100000n);
    expect(toMinorUnits("0.1", "usd") + toMinorUnits("0.2", "usd")).toBe(30n);
    expect(toMinorUnits("19.995", "AED")).toBe(2000n);
  });

  it("handles zero-decimal currencies", () => {
    expect(toMinorUnits("1500", "JPY")).toBe(1500n);
    expect(fromMinorUnits(1500, "JPY").toString()).toBe("1500");
  });

  it("rounds three-decimal currencies to Stripe's multiple of 10", () => {
    expect(toMinorUnits("12.345", "KWD")).toBe(12350n);
    expect(toMinorUnits("12.344", "BHD")).toBe(12340n);
  });

  it("round-trips minor units", () => {
    expect(fromMinorUnits(30000, "USD").toFixed(2)).toBe("300.00");
  });

  it("compares money at storage precision", () => {
    expect(gtMoney("100.00005", "100")).toBe(false);
    expect(gtMoney("100.01", "100")).toBe(true);
    expect(roundMoney("10.005").toFixed(2)).toBe("10.01");
  });
});
