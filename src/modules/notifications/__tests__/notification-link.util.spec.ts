import { resolveNotificationLink } from "../notification-link.util";

describe("resolveNotificationLink", () => {
  it("prefers stored link_path", () => {
    expect(
      resolveNotificationLink({
        audience: "STAFF",
        entity_type: "quotation",
        entity_id: "abc",
        link_path: "/custom/path",
      }),
    ).toBe("/custom/path");
  });

  it("resolves staff quotation detail", () => {
    expect(
      resolveNotificationLink({
        audience: "STAFF",
        entity_type: "quotation",
        entity_id: "q1",
      }),
    ).toBe("/quotations/q1");
  });

  it("resolves portal quotation detail", () => {
    expect(
      resolveNotificationLink({
        audience: "PORTAL",
        entity_type: "quotation",
        entity_id: "q1",
      }),
    ).toBe("/portal/quotations/q1");
  });

  it("resolves vendor job offer", () => {
    expect(
      resolveNotificationLink({
        audience: "VENDOR",
        entity_type: "VendorQuote",
        entity_id: "v1",
      }),
    ).toBe("/vendor/job-offers/v1");
  });

  it("falls back to hub when no id", () => {
    expect(
      resolveNotificationLink({
        audience: "PORTAL",
        entity_type: "invoice",
      }),
    ).toBe("/portal/invoices");
  });
});
