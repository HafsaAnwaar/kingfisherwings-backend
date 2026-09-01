/**
 * Week 27 — Financial spine: quote → job → invoice → GL voucher.
 * Requires DATABASE_URL with migrations applied.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request = require("supertest");
import { AppModule } from '../app.module';

describe("Integration — quote to GL (e2e)", () => {
  let app: INestApplication;
  const runId = Date.now();
  let tenantOwnerToken: string;
  let superAdminToken: string;
  let partyId: string;
  let chargeCodeId: string;
  let quotationId: string;
  let jobId: string;
  let invoiceId: string;

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
        email: `int.sa.${runId}@kingfisher.test`,
        password: "SuperSecure@2026",
        first_name: "Int",
        last_name: "SA",
      })
      .expect(201);
    superAdminToken = saRes.body.data.access_token;

    const tenantSlug = `int-${runId}`;
    await request(app.getHttpServer())
      .post("/tenants")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        code: `INT${runId}`.slice(0, 20),
        name: "Integration Tenant",
        slug: tenantSlug,
        password: "TenantPass@2026",
        email: `owner.${runId}@int.test`,
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post("/auth/tenant-login")
      .send({ tenant_slug: tenantSlug, password: "TenantPass@2026" })
      .expect(200);
    tenantOwnerToken = login.body.data.access_token;

    const party = await request(app.getHttpServer())
      .post("/parties")
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .send({
        party_type: "CUSTOMER",
        code: `INT-C-${runId}`,
        name: "Integration Customer",
        email: `cust.${runId}@int.test`,
      })
      .expect(201);
    partyId = party.body.id;

    const chargeCode = await request(app.getHttpServer())
      .post("/masters/charge-codes")
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .send({
        code: `FRT${runId}`.slice(0, 10),
        description: "Freight",
        applicable_modes: ["AIR"],
      })
      .expect(201);
    chargeCodeId = chargeCode.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates quotation, marks won, converts to job", async () => {
    const quote = await request(app.getHttpServer())
      .post("/quotations")
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .send({
        job_type: "AIR_EXPORT",
        customer_id: partyId,
        commodity: "General cargo",
        currency_code: "AED",
      })
      .expect(201);
    quotationId = quote.body.id;

    await request(app.getHttpServer())
      .post(`/quotations/${quotationId}/lines`)
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .send({
        charge_code_id: chargeCodeId,
        description: "Freight charge",
        quantity: 1,
        unit_price: 1000,
        currency_code: "AED",
        exchange_rate: 1,
        is_cost: false,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/quotations/${quotationId}/submit`)
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/quotations/${quotationId}/approve`)
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .send({})
      .expect(200);

    await request(app.getHttpServer())
      .post(`/quotations/${quotationId}/send`)
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/quotations/${quotationId}/mark-won`)
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .expect(200);

    const converted = await request(app.getHttpServer())
      .post(`/quotations/${quotationId}/convert-to-job`)
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .expect(201);

    jobId = converted.body.jobId ?? converted.body.data?.jobId;
    expect(jobId).toBeDefined();
  });

  it("creates invoice from job and posts to GL", async () => {
    const invoice = await request(app.getHttpServer())
      .post(`/invoices/from-job/${jobId}`)
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .expect(201);
    invoiceId = invoice.body.id;

    const posted = await request(app.getHttpServer())
      .post(`/invoices/${invoiceId}/post`)
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .expect(200);

    expect(posted.body.status).toBe("POSTED");
    expect(
      posted.body.gl_auto_post?.voucher_id || posted.body.gl_auto_post?.skipped,
    ).toBeDefined();
  });

  it("public API key enforces scopes", async () => {
    const keyRes = await request(app.getHttpServer())
      .post("/admin/api-keys")
      .set("Authorization", `Bearer ${tenantOwnerToken}`)
      .send({ name: "scope-test", scopes: ["jobs.read"] })
      .expect(201);

    const apiKey = keyRes.body.api_key;
    expect(apiKey).toBeDefined();

    await request(app.getHttpServer())
      .get("/api/v1/jobs")
      .set("X-API-Key", apiKey)
      .expect(200);

    await request(app.getHttpServer())
      .get("/api/v1/track/does-not-exist")
      .set("X-API-Key", apiKey)
      .expect(403);
  });
});
