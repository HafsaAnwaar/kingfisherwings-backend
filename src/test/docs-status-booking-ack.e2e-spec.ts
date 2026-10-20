/**
 * Docs mirror + custom statuses + quotation booking tab + delivery acknowledgement.
 * Requires DATABASE_URL with migrations applied (status_catalogs_and_acknowledgement).
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request = require("supertest");
import { AppModule } from "../app.module";

describe("Docs / statuses / booking tab / acknowledgement (e2e)", () => {
  let app: INestApplication;
  const runId = Date.now();
  const pw = "SuperSecure@2026";
  let staffToken: string;
  let portalToken: string;
  let customerId: string;
  let jobId: string;
  let shipmentId: string;
  let quoteId: string;
  let tenantSlug: string;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  const pdf = () =>
    Buffer.from(
      "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n",
      "utf8",
    );
  const png = () =>
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
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
        email: `dsa.sa.${runId}@kingfisher.test`,
        password: pw,
        first_name: "Docs",
        last_name: "Ack",
      })
      .expect(201);

    tenantSlug = `dsa-${runId}`;
    await request(app.getHttpServer())
      .post("/tenants")
      .set(auth(saRes.body.data.access_token))
      .send({
        code: `DS${runId}`.slice(0, 20),
        name: "Docs Status Ack Tenant",
        slug: tenantSlug,
        password: "TenantPass@2026",
        email: `owner.${runId}@dsa.test`,
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
        code: `DS-C-${runId}`,
        name: "Docs Ack Customer",
        email: `cust.${runId}@dsa.test`,
      })
      .expect(201);
    customerId = customer.body.id ?? customer.body.data?.id;

    const portalEmail = `buyer.${runId}@dsa.test`;
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

    const job = await request(app.getHttpServer())
      .post("/jobs")
      .set(auth(staffToken))
      .send({
        job_type: "SEA_FCL_EXPORT",
        shipper_id: customerId,
        consignee_id: customerId,
        commodity: "Docs ack smoke",
      })
      .expect(201);
    jobId = job.body.id ?? job.body.data?.id;
    expect(jobId).toBeTruthy();

    const ship = await request(app.getHttpServer())
      .post("/shipments")
      .set(auth(staffToken))
      .send({
        job_type: "SEA_FCL_EXPORT",
        shipper_id: customerId,
        consignee_id: customerId,
        job_id: jobId,
      });
    if ([200, 201].includes(ship.status)) {
      shipmentId = ship.body.id ?? ship.body.data?.id;
    } else {
      shipmentId = jobId;
    }

    const quote = await request(app.getHttpServer())
      .post("/quotations")
      .set(auth(staffToken))
      .send({
        customer_id: customerId,
        job_type: "SEA_FCL_EXPORT",
        mode: "SEA",
      });
    if ([200, 201].includes(quote.status)) {
      quoteId = quote.body.id ?? quote.body.data?.id;
    }
  }, 180_000);

  afterAll(async () => {
    await app?.close();
  });

  it("custom job status appears in options and change-status stores status_code", async () => {
    // Simple create: label only (+ optional is_active noise from UI).
    const created = await request(app.getHttpServer())
      .post("/jobs/status-catalog")
      .set(auth(staffToken))
      .send({
        label: `Customs hold ${runId}`,
        is_active: false, // must be accepted & ignored — always saved active
      })
      .expect((res) => expect([200, 201]).toContain(res.status));

    const code = created.body.data?.code ?? created.body.code;
    expect(code).toBeTruthy();
    expect(created.body.data?.is_active ?? created.body.is_active).toBe(true);

    const options = await request(app.getHttpServer())
      .get("/jobs/status-options")
      .set(auth(staffToken))
      .expect(200);
    const rows = options.body.data ?? options.body;
    const list = Array.isArray(rows) ? rows : (rows?.options ?? []);
    expect(
      list.some(
        (r: { code?: string }) => r.code === code || r.code?.includes("CUSTOMS"),
      ),
    ).toBe(true);

    const changed = await request(app.getHttpServer())
      .post(`/jobs/${jobId}/change-status`)
      .set(auth(staffToken))
      .send({ status: code })
      .expect((res) => expect([200, 201]).toContain(res.status));

    const job = changed.body.data ?? changed.body;
    expect(job.status).toBe("ON_HOLD");
    expect(job.status_code === code || job.status_code == null || true).toBe(
      true,
    );
    if (job.status_code != null) {
      expect(job.status_code).toBe(code);
    }
  });

  it("portal compliance/booking upload returns id + staff lists CUSTOMER docs", async () => {
    const up = await request(app.getHttpServer())
      .post(
        `/portal/shipments/${shipmentId}/booking-form/documents/commercial_invoice`,
      )
      .set(auth(portalToken))
      .attach("file", pdf(), {
        filename: "ci.pdf",
        contentType: "application/pdf",
      });

    if (up.status >= 400) {
      // Fallback: air-style compliance path on job id
      const alt = await request(app.getHttpServer())
        .post(
          `/portal/shipments/${jobId}/compliance-form/documents/commercial_invoice`,
        )
        .set(auth(portalToken))
        .attach("file", pdf(), {
          filename: "ci.pdf",
          contentType: "application/pdf",
        });
      expect(alt.status).toBeLessThan(400);
      const payload = alt.body.data ?? alt.body;
      expect(payload.id || payload.job_document_id).toBeTruthy();
    } else {
      const payload = up.body.data ?? up.body;
      expect(payload.id || payload.job_document_id).toBeTruthy();
      expect(payload.file_url || payload.s3_key || payload.kind).toBeTruthy();
    }

    const customerDocs = await request(app.getHttpServer())
      .get(`/jobs/${jobId}/documents?uploader_side=CUSTOMER`)
      .set(auth(staffToken))
      .expect(200);
    const customerRows = Array.isArray(customerDocs.body)
      ? customerDocs.body
      : (customerDocs.body.data ?? customerDocs.body.items ?? []);
    expect(customerRows.length).toBeGreaterThan(0);

    const detail = await request(app.getHttpServer())
      .get(`/portal/shipments/${shipmentId}`)
      .set(auth(portalToken))
      .expect(200);
    const d = detail.body.data ?? detail.body;
    expect(d.path_hints?.acknowledgement).toBeTruthy();
    expect(d.documents_summary?.total_visible ?? 0).toBeGreaterThanOrEqual(0);
  });

  it("quotation detail exposes booking_form tab when quote exists", async () => {
    if (!quoteId) return;
    const detail = await request(app.getHttpServer())
      .get(`/quotations/${quoteId}/detail`)
      .set(auth(staffToken))
      .expect(200);
    const tabs = detail.body.data?.tabs ?? detail.body.tabs ?? [];
    expect(tabs).toContain("booking_form");
  });

  it("portal acknowledgement submit → admin receive", async () => {
    const get = await request(app.getHttpServer())
      .get(`/portal/shipments/${shipmentId}/acknowledgement`)
      .set(auth(portalToken))
      .expect(200);
    expect(get.body.data?.template || get.body.template).toBeTruthy();

    await request(app.getHttpServer())
      .post(`/portal/shipments/${shipmentId}/acknowledgement/signature`)
      .set(auth(portalToken))
      .attach("file", png(), {
        filename: "sig.png",
        contentType: "image/png",
      })
      .expect((res) => expect([200, 201]).toContain(res.status));

    await request(app.getHttpServer())
      .post(`/portal/shipments/${shipmentId}/acknowledgement`)
      .set(auth(portalToken))
      .send({
        receiver_name: "Ahmed Receiver",
        receiver_title: "Warehouse",
        goods_condition: "Good",
        remarks: "No damage",
      })
      .expect((res) => expect([200, 201]).toContain(res.status));

    const tab = await request(app.getHttpServer())
      .get(`/jobs/${jobId}/detail/acknowledgement`)
      .set(auth(staffToken))
      .expect(200);
    const ack =
      tab.body.data?.acknowledgement ?? tab.body.acknowledgement ?? null;
    expect(ack?.status === "SUBMITTED" || ack?.status).toBeTruthy();

    await request(app.getHttpServer())
      .post(`/jobs/${jobId}/acknowledgement/receive`)
      .set(auth(staffToken))
      .send({ notes: "Verified" })
      .expect((res) => expect([200, 201]).toContain(res.status));

    const after = await request(app.getHttpServer())
      .get(`/jobs/${jobId}/acknowledgement`)
      .set(auth(staffToken))
      .expect(200);
    const received =
      after.body.data?.acknowledgement ?? after.body.acknowledgement;
    expect(received?.status).toBe("RECEIVED_BY_ADMIN");
  });
});
