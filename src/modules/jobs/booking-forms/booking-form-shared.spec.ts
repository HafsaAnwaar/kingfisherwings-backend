import { missingCargoDocs } from "./booking-form-shared";
import { CargoCategory } from "@prisma/client";

describe("booking-form-shared cargo docs", () => {
  it("requires commercial invoice always", () => {
    expect(missingCargoDocs({})).toContain("commercial_invoice");
  });

  it("requires carnet + vehicle title for VEHICLES", () => {
    expect(
      missingCargoDocs({
        attach_commercial_invoice: true,
        cargo_category: "VEHICLES" as CargoCategory,
      }),
    ).toEqual(["carnet", "vehicle_title"]);
  });

  it("requires msds + dgd for DG", () => {
    expect(
      missingCargoDocs({
        attach_commercial_invoice: true,
        is_dg: true,
      }),
    ).toEqual(["msds", "dgd"]);
  });
});
