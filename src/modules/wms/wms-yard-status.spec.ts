import { WmsOpsBoardService } from "./wms-ops-board.service";

describe("WmsOpsBoardService billingLabels", () => {
  const service = new WmsOpsBoardService(null as never);

  it("labels NOT_COLLECTED as OVERDUE", () => {
    expect(service.billingLabels("NOT_COLLECTED", [])).toEqual(["OVERDUE"]);
  });

  it("labels OVERDUE_EXTRA charge as OVERDUE", () => {
    expect(service.billingLabels("IN_STORAGE", ["OVERDUE_EXTRA"])).toEqual([
      "OVERDUE",
    ]);
  });

  it("labels INCLUDED_OVERAGE as OVER_BILL", () => {
    expect(service.billingLabels("IN_STORAGE", ["INCLUDED_OVERAGE"])).toEqual([
      "OVER_BILL",
    ]);
  });

  it("can combine OVERDUE and OVER_BILL", () => {
    expect(
      service.billingLabels("NOT_COLLECTED", [
        "INCLUDED_OVERAGE",
        "OVERDUE_EXTRA",
      ]),
    ).toEqual(["OVERDUE", "OVER_BILL"]);
  });
});

describe("ASN yard transition matrix (rules)", () => {
  const allowed: Record<string, string[]> = {
    DRAFT: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PICKED", "CANCELLED"],
    PICKED: ["UNLOADING", "CANCELLED"],
    UNLOADING: ["UNLOADED", "CANCELLED"],
    UNLOADED: [],
    RECEIVED: [],
    CANCELLED: [],
  };

  it("CONFIRMED can go to PICKED", () => {
    expect(allowed.CONFIRMED).toContain("PICKED");
  });

  it("PICKED can go to UNLOADING", () => {
    expect(allowed.PICKED).toContain("UNLOADING");
  });

  it("UNLOADING can go to UNLOADED", () => {
    expect(allowed.UNLOADING).toContain("UNLOADED");
  });

  it("UNLOADED is terminal", () => {
    expect(allowed.UNLOADED).toEqual([]);
  });
});
