/**
 * Typed JobDocument / party-visibility smoke.
 * staff HAWB → portal download; portal booking commercial_invoice → staff CUSTOMER;
 * vendor upload → staff VENDOR.
 *
 * Requires DATABASE_URL with migrations applied (incl. typed_document_uploads).
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request = require("supertest");
import { AppModule } from "../app.module";

describe("Typed document uploads visibility (e2e)", () => {
  let app: INestApplication;
  const runId = Date.now();
  const pw = "SuperSecure@2026";
  let staffToken: string;
  let portalToken: string;
  let vendorToken: string;
  let customerId: string;
  let vendorId: string;
  let jobId: string;
  let tenantSlug: string;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  const pdf = () =>
    Buffer.from(
      "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n",
      "utf8",
    );

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const saRes = await request(app.getHttpServer())
      .post("/auth/super-admin/signup")
      .send({
        email: `tdu.sa.${runId}@kingfisher.test`,
        password: pw,
        first_name: "Doc",
        last_name: "Upload",
      })
      .expect(201);

    tenantSlug = `tdu-${runId}`;
    await request(app.getHttpServer())
      .post("/tenants")
      .set(auth(saRes.body.data.access_token))
      .send({
        code: `TD${runId}`.slice(0, 20),
        name: "Typed Docs Tenant",
        slug: tenantSlug,
        password: "TenantPass@2026",
        email: `owner.${runId}@tdu.test`,
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post("/auth/tenant-login")
      .send({ tenant_slug: tenantSlug, password: "TenantPass@2026" })
      .expect(200);
    staffToken = login.body.data.access_token;

    const customer = await request(app.getHttpServer())
      .post("/parties")
      .set(auth(staffToken))
      .send({
        party_type: "CUSTOMER",
        code: `TD-C-${runId}`,
        name: "Typed Docs Customer",
        email: `cust.${runId}@tdu.test`,
      })
      .expect(201);
    customerId = customer.body.id ?? customer.body.data?.id;

    const portalEmail = `buyer.${runId}@tdu.test`;
    await request(app.getHttpServer())
      .post(`/parties/${customerId}/portal-users`)
      .set(auth(staffToken))
      .send({
        email: portalEmail,
        full_name: "Portal Buyer",
        password: pw,
        send_email: false,
      })
      .expect(201);

    const pLogin = await request(app.getHttpServer())
      .post("/portal/auth/login")
      .send({ tenant_slug: tenantSlug, email: portalEmail, password: pw });
    expect([200, 201]).toContain(pLogin.status);
    portalToken =
      pLogin.body.data?.access_token ?? pLogin.body.access_token;

    const vendor = await request(app.getHttpServer())
      .post("/parties")
      .set(auth(staffToken))
      .send({
        party_type: "TRUCKER",
        code: `TD-V-${runId}`,
        name: "Typed Docs Vendor",
        email: `vendor.${runId}@tdu.test`,
      })
      .expect(201);
    vendorId = vendor.body.id ?? vendor.body.data?.id;

    const vendorEmail = `vuser.${runId}@tdu.test`;
    await request(app.getHttpServer())
      .post(`/parties/${vendorId}/vendor-users`)
      .set(auth(staffToken))
      .send({
        party_id: vendorId,
        email: vendorEmail,
        full_name: "Vendor User",
        password: pw,
        send_email: false,
      })
      .expect(201);

    const vLogin = await request(app.getHttpServer())
      .post("/vendor/auth/login")
      .send({ tenant_slug: tenantSlug, email: vendorEmail, password: pw });
    expect([200, 201]).toContain(vLogin.status);
    vendorToken =
      vLogin.body.data?.access_token ?? vLogin.body.access_token;

    const job = await request(app.getHttpServer())
      .post("/jobs")
      .set(auth(staffToken))
      .send({
        job_type: "AIR_EXPORT",
        shipper_id: customerId,
        commodity: "Typed docs smoke",
      })
      .expect(201);
    jobId = job.body.id ?? job.body.data?.id;
    expect(jobId).toBeTruthy();
  }, 180_000);

  afterAll(async () => {
    await app?.close();
  });

  it("staff HAWB upload → portal download; booking commercial_invoice → CUSTOMER; vendor → VENDOR", async () => {
    const hawbUp = await request(app.getHttpServer())
      .post(`/jobs/${jobId}/documents/HAWB/upload`)
      .set(auth(staffToken))
      .attach("file", pdf(), {
        filename: "hawb.pdf",
        contentType: "application/pdf",
      })
      .expect((res) => expect([200, 201]).toContain(res.status));
    const hawbId =
      hawbUp.body.id ?? hawbUp.body.data?.id ?? hawbUp.body.data?.document?.id;
    expect(hawbId).toBeTruthy();

    await request(app.getHttpServer())
      .get(`/portal/jobs/${jobId}/documents/${hawbId}/download`)
      .set(auth(portalToken))
      .expect(200);

    const bookingUp = await request(app.getHttpServer())
      .post(
        `/portal/shipments/${jobId}/compliance-form/documents/commercial_invoice`,
      )
      .set(auth(portalToken))
      .attach("file", pdf(), {
        filename: "ci.pdf",
        contentType: "application/pdf",
      })
      .expect((res) => expect([200, 201]).toContain(res.status));
    expect(bookingUp.status).toBeLessThan(400);

    const customerDocs = await request(app.getHttpServer())
      .get(`/jobs/${jobId}/documents?uploader_side=CUSTOMER`)
      .set(auth(staffToken))
      .expect(200);
    const customerRows = Array.isArray(customerDocs.body)
      ? customerDocs.body
      : (customerDocs.body.data ?? customerDocs.body.items ?? []);
    expect(
      customerRows.some(
        (d: { document_type?: string; uploader_side?: string }) =>
          d.uploader_side === "CUSTOMER" &&
          (d.document_type === "COMMERCIAL_INVOICE" ||
            d.document_type === "OTHER"),
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .post(`/jobs/${jobId}/pass-to-vendor`)
      .set(auth(staffToken))
      .send({
        vendor_party_id: vendorId,
        proposed_total: 100,
      })
      .expect((res) => expect([200, 201]).toContain(res.status));

    const vendorUp = await request(app.getHttpServer())
      .post(`/vendor/jobs/${jobId}/documents/PACKING_LIST/upload`)
      .set(auth(vendorToken))
      .attach("file", pdf(), {
        filename: "packing.pdf",
        contentType: "application/pdf",
      })
      .expect((res) => expect([200, 201]).toContain(res.status));
    const vendorDocId =
      vendorUp.body.id ??
      vendorUp.body.data?.id ??
      vendorUp.body.data?.document?.id;
    expect(vendorDocId).toBeTruthy();

    const vendorDocs = await request(app.getHttpServer())
      .get(`/jobs/${jobId}/documents?uploader_side=VENDOR`)
      .set(auth(staffToken))
      .expect(200);
    const vendorRows = Array.isArray(vendorDocs.body)
      ? vendorDocs.body
      : (vendorDocs.body.data ?? vendorDocs.body.items ?? []);
    expect(
      vendorRows.some(
        (d: { id?: string; uploader_side?: string }) =>
          d.uploader_side === "VENDOR" || d.id === vendorDocId,
      ),
    ).toBe(true);
  });
});
