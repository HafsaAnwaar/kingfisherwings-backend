import {
  portalLoginUrl,
  portalLoginUrlForTenant,
  publicTrackUrlForTenant,
  staffLoginUrlForTenant,
  vendorLoginUrlForTenant,
  websitePortalLinksForTenant,
  withTenantSlug,
} from "../frontend-url.util";

describe("frontend-url.util WordPress slug helpers", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env.FRONTEND_URL = "https://freightnest.kingfishertec.com";
    delete process.env.STAFF_LOGIN_URL;
    delete process.env.PORTAL_LOGIN_URL;
    delete process.env.VENDOR_LOGIN_URL;
    delete process.env.PUBLIC_TRACK_URL;
    delete process.env.PORTAL_FRONTEND_URL;
    delete process.env.VENDOR_FRONTEND_URL;
  });

  afterAll(() => {
    process.env = prev;
  });

  it("withTenantSlug appends lowercase tenant_slug", () => {
    expect(withTenantSlug("https://app.example/login", "KingFisher-Tech")).toBe(
      "https://app.example/login?tenant_slug=kingfisher-tech",
    );
  });

  it("builds KingFisher website portal links", () => {
    const links = websitePortalLinksForTenant("kingfisher-tech");
    expect(links.employee_login_url).toBe(
      "https://freightnest.kingfishertec.com/login?tenant_slug=kingfisher-tech",
    );
    expect(links.customer_login_url).toBe(
      "https://freightnest.kingfishertec.com/portal/login?tenant_slug=kingfisher-tech",
    );
    expect(links.vendor_login_url).toBe(
      "https://freightnest.kingfishertec.com/vendor/login?tenant_slug=kingfisher-tech",
    );
    expect(links.tracking_url).toBe(
      "https://freightnest.kingfishertec.com/track?tenant_slug=kingfisher-tech",
    );
  });

  it("defaults portal login path to /portal/login", () => {
    expect(portalLoginUrl()).toBe(
      "https://freightnest.kingfishertec.com/portal/login",
    );
    expect(portalLoginUrlForTenant("acme")).toContain("/portal/login?tenant_slug=acme");
    expect(staffLoginUrlForTenant("acme")).toContain("/login?tenant_slug=acme");
    expect(vendorLoginUrlForTenant("acme")).toContain(
      "/vendor/login?tenant_slug=acme",
    );
    expect(publicTrackUrlForTenant("acme")).toContain("/track?tenant_slug=acme");
  });
});
