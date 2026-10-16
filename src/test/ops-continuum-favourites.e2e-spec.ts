/**
 * Continuum comments + unified favourites smoke.
 * Requires DATABASE_URL with ops_entity_comments migration applied.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request = require("supertest");
import { AppModule } from "../app.module";

describe("Ops continuum comments + favourites (e2e)", () => {
  let app: INestApplication;
  const runId = Date.now();
  let token: string;
  let partyId: string;
  let jobId: string;

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
        email: `ops.fav.${runId}@kingfisher.test`,
        password: "SuperSecure@2026",
        first_name: "Ops",
        last_name: "Fav",
      })
      .expect(201);

    const tenantSlug = `opsfav-${runId}`;
    await request(app.getHttpServer())
      .post("/tenants")
      .set("Authorization", `Bearer ${saRes.body.data.access_token}`)
      .send({
        code: `OF${runId}`.slice(0, 20),
        name: "Ops Fav Tenant",
        slug: tenantSlug,
        password: "TenantPass@2026",
        email: `owner.${runId}@opsfav.test`,
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
        code: `OF-C-${runId}`,
        name: "Ops Fav Customer",
        email: `cust.${runId}@opsfav.test`,
      })
      .expect(201);
    partyId = party.body.id ?? party.body.data?.id;

    const job = await request(app.getHttpServer())
      .post("/jobs")
      .set(auth())
      .send({
        job_type: "SEA_FCL_EXPORT",
        shipper_id: partyId,
        billing_party_id: partyId,
        commodity: "Ops fav smoke",
      })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });
    jobId = job.body.id ?? job.body.data?.id ?? job.body.data?.job?.id;
    expect(jobId).toBeTruthy();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
  });

  it("POST/GET continuum comments on JOB", async () => {
    const created = await request(app.getHttpServer())
      .post(`/ops/JOB/${jobId}/comments`)
      .set(auth())
      .send({ body: `Hello from smoke ${runId}` })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });

    const commentId =
      created.body.data?.id ?? created.body.id ?? created.body.data?.data?.id;
    expect(commentId || created.body.success).toBeTruthy();

    const list = await request(app.getHttpServer())
      .get(`/ops/JOB/${jobId}/comments`)
      .set(auth())
      .expect(200);

    const rows = list.body.data ?? list.body;
    expect(Array.isArray(rows)).toBe(true);
    expect(
      rows.some(
        (r: { body?: string }) => r.body === `Hello from smoke ${runId}`,
      ),
    ).toBe(true);
  });

  it("toggle favourite for job and list /favourites", async () => {
    const targetKey = `job:${jobId}`;
    const toggleOn = await request(app.getHttpServer())
      .post("/favourites/toggle")
      .set(auth())
      .send({
        kind: "job",
        target_key: targetKey,
        label: `Job ${jobId.slice(0, 8)}`,
      })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });

    expect(toggleOn.body.favourited ?? toggleOn.body.data?.favourited).toBe(
      true,
    );

    const check = await request(app.getHttpServer())
      .get("/favourites/check")
      .query({ kind: "job", target_key: targetKey })
      .set(auth())
      .expect(200);
    expect(check.body.favourited).toBe(true);

    const list = await request(app.getHttpServer())
      .get("/favourites")
      .query({ kind: "job" })
      .set(auth())
      .expect(200);
    const rows = list.body.data ?? [];
    expect(
      rows.some(
        (r: { target_key?: string }) => r.target_key === targetKey,
      ),
    ).toBe(true);

    const toggleOff = await request(app.getHttpServer())
      .post("/favourites/toggle")
      .set(auth())
      .send({ kind: "job", target_key: targetKey })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });
    expect(toggleOff.body.favourited).toBe(false);
  });

  it("GET /jobs/:id/detail exposes ops_continuum path_hints", async () => {
    const res = await request(app.getHttpServer())
      .get(`/jobs/${jobId}/detail`)
      .set(auth())
      .expect(200);

    const continuum =
      res.body.data?.actions?.path_hints?.ops_continuum ??
      res.body.data?.actions?.path_hints;
    expect(continuum?.comments ?? continuum?.ops_continuum?.comments).toBeTruthy();
    const commentsPath =
      continuum?.comments ?? continuum?.ops_continuum?.comments;
    expect(String(commentsPath)).toContain(`/ops/JOB/${jobId}/comments`);
  });
});
