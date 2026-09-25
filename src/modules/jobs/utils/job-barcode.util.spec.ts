import { barcodeFromJobNumber } from "./job-barcode.util";

describe("barcodeFromJobNumber", () => {
  it("strips non-alphanumeric characters", () => {
    expect(barcodeFromJobNumber("KF/RF/09/26/0001")).toBe("KFRF09260001");
  });

  it("uppercases the result", () => {
    expect(barcodeFromJobNumber("ae-export-1")).toBe("AEEXPORT1");
  });
});
