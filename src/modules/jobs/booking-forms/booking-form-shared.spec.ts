import { missingCargoDocs, assertCcCargoLines } from "./booking-form-shared";
import { CargoCategory } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";

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

describe("assertCcCargoLines", () => {
  it("requires at least one line with description and hs_code", () => {
    expect(() => assertCcCargoLines(undefined)).toThrow(BadRequestException);
    expect(() =>
      assertCcCargoLines([{ description: "Widgets" }]),
    ).toThrow(/hs_code/);
    expect(() =>
      assertCcCargoLines([{ description: "Widgets", hs_code: "8471" }]),
    ).not.toThrow();
  });
});
