import { barcodeFromJobNumber } from "./job-barcode.util";

describe("barcodeFromJobNumber", () => {
  it("strips separators and prefixes JB for opaque staff-only codes", () => {
    expect(barcodeFromJobNumber("KF/RF/09/26/0001")).toBe("JBKFRF09260001");
  });

  it("uppercases alphanumeric job numbers without duplicating JB", () => {
    expect(barcodeFromJobNumber("ae-export-1")).toBe("JBAEEXPORT1");
    expect(barcodeFromJobNumber("JBALREADY")).toBe("JBALREADY");
  });
});
