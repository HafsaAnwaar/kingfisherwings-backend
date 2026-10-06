import { canAccessReportFamily } from "./report-family-module-map";

describe("canAccessReportFamily", () => {
  it("blocks family when product module disabled", () => {
    expect(
      canAccessReportFamily("wms", {
        enabledModules: ["sales", "admin"],
        permissions: ["reports.read", "wms.view"],
      }),
    ).toBe(false);
  });

  it("allows quotation family for sales permissions when sales enabled", () => {
    expect(
      canAccessReportFamily("quotation", {
        enabledModules: ["sales", "admin"],
        permissions: ["quotations.view"],
      }),
    ).toBe(true);
  });

  it("allows ops_list when operations matrix see is present", () => {
    expect(
      canAccessReportFamily("ops_list", {
        enabledModules: ["operations", "admin"],
        permissions: ["operations_air_export.see"],
      }),
    ).toBe(true);
  });
});
