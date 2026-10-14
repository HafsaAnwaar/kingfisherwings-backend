import {
  applyCostingVisibility,
  stripCostingTabForAudience,
} from "./job-costing-visibility.util";

describe("job-costing-visibility", () => {
  const line = {
    id: "1",
    sale: { amount: 100 },
    cost: { amount: 40 },
    sale_voucher_no: "SV1",
    cost_voucher_no: "CV1",
  };

  it("keeps both sides for STAFF", () => {
    expect(applyCostingVisibility(line, "STAFF")).toEqual(line);
  });

  it("strips cost for CUSTOMER", () => {
    const out = applyCostingVisibility(line, "CUSTOMER");
    expect(out.sale).toEqual({ amount: 100 });
    expect(out.cost).toBeUndefined();
    expect(out.cost_voucher_no).toBeUndefined();
  });

  it("strips sale for VENDOR", () => {
    const out = applyCostingVisibility(line, "VENDOR");
    expect(out.cost).toEqual({ amount: 40 });
    expect(out.sale).toBeUndefined();
    expect(out.sale_voucher_no).toBeUndefined();
  });

  it("maps tab payload lines", () => {
    const tab = stripCostingTabForAudience(
      { lines: [line], revenue_total: 100 },
      "CUSTOMER",
    );
    expect(tab.lines?.[0].cost).toBeUndefined();
    expect(tab.revenue_total).toBe(100);
  });
});
