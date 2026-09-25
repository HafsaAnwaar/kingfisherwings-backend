import {
  computeExtraStorageDays,
  computeOverdueStorageAmount,
} from "./wms-overdue.util";

describe("wms overdue storage formula", () => {
  it("marks 5 extra days when paid 10 and elapsed 15", () => {
    expect(computeExtraStorageDays(15, 10)).toBe(5);
  });

  it("charges 100 × 5 when overdue rate is 100 and extra is 5", () => {
    expect(computeOverdueStorageAmount(5, 100, 1)).toBe(500);
  });

  it("returns 0 when still inside paid window", () => {
    expect(computeExtraStorageDays(7, 10)).toBe(0);
    expect(computeOverdueStorageAmount(0, 100, 2)).toBe(0);
  });

  it("multiplies by cbm/qty basis", () => {
    expect(computeOverdueStorageAmount(5, 100, 2.5)).toBe(1250);
  });
});
