/**
 * Fresa Wave 1 parity smokes:
 * - GET /operations/job-not-invoiced-do
 * - GET /operations/job-finance-report
 * - POST /jobs/:id/routing-legs/push-to-subjobs
 * - PUT /jobs/:id/references/:type (SABER)
 *
 * Requires DATABASE_URL with migrations through wave2_refs_overseas_agent.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request = require("supertest");
import { AppModule } from "../app.module";

describe("Fresa Wave 1 parity (e2e)", () => {
  let app: INestApplication;
  const runId = Date.now();
  let token: string;
  let partyId: string;
  let masterJobId: string;
  let houseJobId: string;

  const auth = () => ({ Authorization: `Bearer ${token}` });

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
        email: `w1.sa.${runId}@kingfisher.test`,
        password: "SuperSecure@2026",
        first_name: "Wave",
        last_name: "One",
      })
      .expect(201);

    const tenantSlug = `w1-${runId}`;
    await request(app.getHttpServer())
      .post("/tenants")
      .set("Authorization", `Bearer ${saRes.body.data.access_token}`)
      .send({
        code: `W1${runId}`.slice(0, 20),
        name: "Wave1 Parity Tenant",
        slug: tenantSlug,
        password: "TenantPass@2026",
        email: `owner.${runId}@w1.test`,
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post("/auth/tenant-login")
      .send({ tenant_slug: tenantSlug, password: "TenantPass@2026" })
      .expect(200);
    token = login.body.data.access_token;

    const party = await request(app.getHttpServer())
      .post("/parties")
      .set(auth())
      .send({
        party_type: "CUSTOMER",
        code: `W1-C-${runId}`,
        name: "Wave1 Customer",
        email: `cust.${runId}@w1.test`,
      })
      .expect(201);
    partyId = party.body.id ?? party.body.data?.id;

    const master = await request(app.getHttpServer())
      .post("/jobs")
      .set(auth())
      .send({
        job_type: "SEA_FCL_EXPORT",
        shipper_id: partyId,
        billing_party_id: partyId,
        commodity: "Wave1 master",
      })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });
    masterJobId =
      master.body.id ?? master.body.data?.id ?? master.body.data?.job?.id;
    expect(masterJobId).toBeTruthy();

    const house = await request(app.getHttpServer())
      .post(`/jobs/${masterJobId}/sub-jobs`)
      .set(auth())
      .send({
        commodity: "Wave1 house",
      })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });
    houseJobId =
      house.body.id ?? house.body.data?.id ?? house.body.data?.job?.id;
    expect(houseJobId).toBeTruthy();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
  });

  it("GET /operations/job-not-invoiced-do returns list shape", async () => {
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);
    const to = new Date();
    to.setFullYear(to.getFullYear() + 1);

    const res = await request(app.getHttpServer())
      .get("/operations/job-not-invoiced-do")
      .query({
        from_date: from.toISOString().slice(0, 10),
        to_date: to.toISOString().slice(0, 10),
      })
      .set(auth())
      .expect(200);

    expect(res.body.success ?? true).toBeTruthy();
    const data = res.body.data ?? res.body;
    expect(data).toBeDefined();
    expect(
      data.jobs !== undefined ||
        data.rows !== undefined ||
        Array.isArray(data),
    ).toBe(true);
  });

  it("GET /operations/job-finance-report returns finance rows shape", async () => {
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);
    const to = new Date();
    to.setFullYear(to.getFullYear() + 1);

    const res = await request(app.getHttpServer())
      .get("/operations/job-finance-report")
      .query({
        from_date: from.toISOString().slice(0, 10),
        to_date: to.toISOString().slice(0, 10),
      })
      .set(auth())
      .expect(200);

    expect(res.body.success ?? true).toBeTruthy();
    const data = res.body.data ?? res.body;
    expect(data).toBeDefined();
  });

  it("POST routing-legs/push-to-subjobs copies master legs", async () => {
    await request(app.getHttpServer())
      .post(`/jobs/${masterJobId}/routing-legs`)
      .set(auth())
      .send({
        leg_sequence: 1,
        vessel_name: "WAVE1 VESSEL",
        voyage_number: `V${runId}`.slice(0, 20),
      })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });

    const push = await request(app.getHttpServer())
      .post(`/jobs/${masterJobId}/routing-legs/push-to-subjobs`)
      .set(auth())
      .send({ replace_all: true, include_houses: true, sync_header: true })
      .expect(200);

    const data = push.body.data ?? push.body;
    expect(data.targets).toBeGreaterThanOrEqual(1);
    expect(data.legs_copied).toBeGreaterThanOrEqual(1);
  });

  it("PUT /jobs/:id/references/SABER upserts typed ref", async () => {
    const res = await request(app.getHttpServer())
      .put(`/jobs/${masterJobId}/references/SABER`)
      .set(auth())
      .send({ reference_no: `SABER-${runId}` })
      .expect(200);

    const row = res.body.data ?? res.body;
    expect(row.reference_type).toBe("SABER");
    expect(row.reference_no).toBe(`SABER-${runId}`);

    const list = await request(app.getHttpServer())
      .get(`/jobs/${masterJobId}/references`)
      .set(auth())
      .expect(200);

    const partyRefs =
      list.body.data?.party_references ?? list.body.party_references ?? [];
    expect(
      partyRefs.some(
        (r: { reference_type: string; reference_no: string }) =>
          r.reference_type === "SABER" && r.reference_no === `SABER-${runId}`,
      ),
    ).toBe(true);
  });

  it("GET /jobs/:id/detail exposes Wave1 path_hints", async () => {
    const res = await request(app.getHttpServer())
      .get(`/jobs/${masterJobId}/detail`)
      .set(auth())
      .expect(200);

    const hints = res.body.data?.actions?.path_hints ?? {};
    expect(hints.job_not_invoiced_do).toContain("job-not-invoiced-do");
    expect(hints.job_finance_report).toContain("job-finance-report");
    expect(hints.routing_push_to_subjobs).toContain("push-to-subjobs");
  });
});
