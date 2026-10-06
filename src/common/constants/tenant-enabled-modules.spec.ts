import {
  defaultEnabledModules,
  filterPermissionCodes,
  isPermissionCodeEnabled,
  normalizeEnabledModules,
  productModuleForPermissionCode,
} from "./tenant-enabled-modules";

describe("tenant-enabled-modules", () => {
  it("defaults empty/null to all module keys", () => {
    const all = defaultEnabledModules();
    expect(normalizeEnabledModules([])).toEqual(all);
    expect(normalizeEnabledModules(null)).toEqual(all);
  });

  it("always keeps admin when normalizing a partial list", () => {
    expect(normalizeEnabledModules(["sales", "operations"])).toEqual(
      expect.arrayContaining(["sales", "operations", "admin"]),
    );
  });

  it("maps matrix and classic codes to product modules", () => {
    expect(productModuleForPermissionCode("operations_air_export.see")).toBe(
      "operations",
    );
    expect(productModuleForPermissionCode("sales_quotations.write")).toBe(
      "sales",
    );
    expect(productModuleForPermissionCode("jobs.view")).toBe("operations");
    expect(productModuleForPermissionCode("quotations.view")).toBe("sales");
    expect(productModuleForPermissionCode("wms.view")).toBe("wms");
  });

  it("filters permission codes by enabled modules", () => {
    const enabled = ["sales", "admin"];
    expect(isPermissionCodeEnabled("quotations.view", enabled)).toBe(true);
    expect(isPermissionCodeEnabled("jobs.view", enabled)).toBe(false);
    expect(
      filterPermissionCodes(
        ["quotations.view", "jobs.view", "users.view"],
        enabled,
      ),
    ).toEqual(["quotations.view", "users.view"]);
  });
});
