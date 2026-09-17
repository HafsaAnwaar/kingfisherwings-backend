import { amountInWords } from "./amount-in-words.util";

describe("amountInWords", () => {
  it("handles zero", () => {
    expect(amountInWords(0)).toBe("Zero Rupees Only");
  });

  it("formats simple amounts", () => {
    expect(amountInWords(100)).toContain("Hundred");
    expect(amountInWords(100)).toContain("Rupees Only");
  });

  it("supports currency label override", () => {
    expect(amountInWords(10, "AED")).toContain("AED Only");
  });
});
