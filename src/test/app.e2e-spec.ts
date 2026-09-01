import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request = require("supertest");

import { AppModule } from '../app.module';

/**
 * Requires a real, reachable PostgreSQL database at DATABASE_URL with
 * migrations applied (`npx prisma migrate deploy`) — this boots the
 * actual AppModule end-to-end, it does not mock Prisma. Point it at a
 * disposable/test database, not production.
 *
 * Every email/slug is suffixed with a per-run timestamp so repeated
 * runs against the same database don't collide on unique constraints.
 */
describe("KingFisher Tech Gold — critical path (e2e)", () => {
  let app: INestApplication;
  const runId = Date.now();

  // Populated as the suite progresses; later blocks depend on earlier ones.
  let superAdminToken: string;
  let tenantSlug: string;
  let tenantOwnerToken: string;
  let staffTempPassword: string;
  let staffToken: string;
  let staffUserId: string;
  let countryId: string;
  let partyId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================================
  // HEALTH
  // ============================================================

  describe("Health", () => {
    it("GET /health — no auth required, reports DB connected", async () => {
      const res = await request(app.getHttpServer()).get("/health").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.database).toBe("Connected");
    });
  });

  // ============================================================
  // AUTH — bootstrap all three principal types
  // ============================================================

  describe("Auth bootstrap", () => {
    it("POST /auth/super-admin/signup — creates and auto-logs-in a super admin", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/super-admin/signup")
        .send({
          email: `super.${runId}@kingfishertech.test`,
          password: "SuperSecure@2026",
          first_name: "Test",
          last_name: "SuperAdmin",
        })
        .expect(201);

      expect(res.body.data.access_token).toBeDefined();
      superAdminToken = res.body.data.access_token;
    });

    it("POST /tenants — super admin creates a tenant (owner user auto-provisioned)", async () => {
      tenantSlug = `e2e-tenant-${runId}`;

      const res = await request(app.getHttpServer())
        .post("/tenants")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          code: `E2E${runId}`.slice(0, 20),
          name: "E2E Test Freight LLC",
          slug: tenantSlug,
          password: "TenantPass@2026",
          email: `owner.${runId}@e2etest.ae`,
        })
        .expect(201);

      expect(res.body.data.tenant.id).toBeDefined();
      expect(res.body.data.owner.email).toContain(`owner.${runId}`);
    });

    it("POST /tenants (no token) — rejected, tenant management is super-admin-only", async () => {
      await request(app.getHttpServer())
        .post("/tenants")
        .send({
          code: "SHOULDFAIL",
          name: "x",
          slug: "should-fail",
          password: "x",
          email: "x@x.com",
        })
        .expect(401);
    });

    it("POST /auth/tenant-login — tenant owner logs in with the tenant password", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/tenant-login")
        .send({ tenant_slug: tenantSlug, password: "TenantPass@2026" })
        .expect(200);

      expect(res.body.data.access_token).toBeDefined();
      tenantOwnerToken = res.body.data.access_token;
    });

    it("POST /users — tenant owner creates a staff user (status INVITED, temp password returned)", async () => {
      const res = await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${tenantOwnerToken}`)
        .send({
          email: `staff.${runId}@e2etest.ae`,
          first_name: "Staff",
          last_name: "Member",
          role: "SALES_EXECUTIVE",
        })
        .expect(201);

      expect(res.body.temporaryPassword).toBeDefined();
      staffTempPassword = res.body.temporaryPassword;
      staffUserId = res.body.user.id;
    });

    it("POST /auth/login — staff logs in with the temp password (INVITED must be allowed to log in)", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          tenant_slug: tenantSlug,
          email: `staff.${runId}@e2etest.ae`,
          password: staffTempPassword,
        })
        .expect(200);

      expect(res.body.data.must_change_password).toBe(true);
      staffToken = res.body.data.access_token;
    });

    it("GET /auth/me — reflects the calling principal", async () => {
      const res = await request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${staffToken}`)
        .expect(200);

      expect(res.body.data.email).toBe(`staff.${runId}@e2etest.ae`);
    });
  });

  // ============================================================
  // MASTERS — representative sample (Country)
  // ============================================================

  describe("Masters — Countries", () => {
    it("POST /masters/countries — tenant owner creates a reference record", async () => {
      const res = await request(app.getHttpServer())
        .post("/masters/countries")
        .set("Authorization", `Bearer ${tenantOwnerToken}`)
        .send({ iso_code: "ZZ", iso3_code: "ZZZ", name: `Testland ${runId}` })
        .expect(201);

      countryId = res.body.id;
      expect(countryId).toBeDefined();
    });

    it("GET /masters/countries — lists it back", async () => {
      const res = await request(app.getHttpServer())
        .get("/masters/countries?search=Testland")
        .set("Authorization", `Bearer ${tenantOwnerToken}`)
        .expect(200);

      expect(res.body.data.some((c: any) => c.id === countryId)).toBe(true);
    });

    it("PATCH /masters/countries/:id — updates it", async () => {
      await request(app.getHttpServer())
        .patch(`/masters/countries/${countryId}`)
        .set("Authorization", `Bearer ${tenantOwnerToken}`)
        .send({ region: "Nowhere" })
        .expect(200);
    });

    it("a staff user without masters.create cannot create a country", async () => {
      // The staff user was created with role SALES_EXECUTIVE and no
      // explicit permission grants, so only whatever READ_ONLY's
      // default role provides — masters.view, not masters.create.
      await request(app.getHttpServer())
        .post("/masters/countries")
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ iso_code: "YY", iso3_code: "YYY", name: "Should Fail" })
        .expect(403);
    });
  });

  // ============================================================
  // PARTIES — CRUD, credit status, CSV import
  // ============================================================

  describe("Parties", () => {
    it("POST /parties — creates a customer", async () => {
      const res = await request(app.getHttpServer())
        .post("/parties")
        .set("Authorization", `Bearer ${tenantOwnerToken}`)
        .send({
          party_type: "CUSTOMER",
          code: `CUST-${runId}`,
          name: "E2E Test Customer LLC",
          email: `customer.${runId}@e2etest.ae`,
        })
        .expect(201);

      partyId = res.body.id;
      expect(res.body.credit_status).toBe("ACTIVE");
    });

    it("POST /parties/:id/contacts — adds a primary contact", async () => {
      await request(app.getHttpServer())
        .post(`/parties/${partyId}/contacts`)
        .set("Authorization", `Bearer ${tenantOwnerToken}`)
        .send({
          name: "Jane Contact",
          email: `jane.${runId}@e2etest.ae`,
          is_primary: true,
        })
        .expect(201);
    });

    it("GET /parties/:id — includes the contact", async () => {
      const res = await request(app.getHttpServer())
        .get(`/parties/${partyId}`)
        .set("Authorization", `Bearer ${tenantOwnerToken}`)
        .expect(200);

      expect(res.body.contacts.length).toBeGreaterThanOrEqual(1);
    });

    it("PATCH /parties/:id/credit-status — holds the customer, requires manage_credit permission", async () => {
      const res = await request(app.getHttpServer())
        .patch(`/parties/${partyId}/credit-status`)
        .set("Authorization", `Bearer ${tenantOwnerToken}`)
        .send({ credit_status: "ON_HOLD", reason: "e2e test hold" })
        .expect(200);

      expect(res.body.credit_status).toBe("ON_HOLD");
    });

    it("a staff user without manage_credit cannot change credit status", async () => {
      await request(app.getHttpServer())
        .patch(`/parties/${partyId}/credit-status`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ credit_status: "BLACKLISTED" })
        .expect(403);
    });

    it("POST /parties/import — CSV bulk import, one good row + one bad row", async () => {
      const goodRow = `CUSTOMER,IMPORT-OK-${runId},Import Good Row,import.ok.${runId}@e2etest.ae`;
      const badRow = `,IMPORT-BAD-${runId},,not-an-email`;
      const csv = `party_type,code,name,email\n${goodRow}\n${badRow}\n`;

      const res = await request(app.getHttpServer())
        .post("/parties/import")
        .set("Authorization", `Bearer ${tenantOwnerToken}`)
        .attach("file", Buffer.from(csv), "parties.csv")
        .expect(201);

      expect(res.body.total).toBe(2);
      expect(res.body.imported).toBe(1);
      expect(res.body.failed).toBe(1);
      expect(res.body.errors[0].row).toBe(2);
    });
  });

  // ============================================================
  // RLS — cross-tenant isolation
  //
  // This is the one that actually proves the RLS work from earlier
  // batches functions under a real Postgres connection, not just
  // "compiles" — a second tenant must not be able to reach the first
  // tenant's data even via a guessed/known id.
  // ============================================================

  describe("Cross-tenant isolation (RLS)", () => {
    let secondTenantOwnerToken: string;

    it("bootstraps a second, unrelated tenant", async () => {
      const secondSlug = `e2e-tenant-2-${runId}`;

      await request(app.getHttpServer())
        .post("/tenants")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          code: `E2E2${runId}`.slice(0, 20),
          name: "Second E2E Tenant LLC",
          slug: secondSlug,
          password: "TenantPass2@2026",
          email: `owner2.${runId}@e2etest.ae`,
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post("/auth/tenant-login")
        .send({ tenant_slug: secondSlug, password: "TenantPass2@2026" })
        .expect(200);

      secondTenantOwnerToken = res.body.data.access_token;
    });

    it("second tenant cannot fetch the first tenant's party by id", async () => {
      await request(app.getHttpServer())
        .get(`/parties/${partyId}`)
        .set("Authorization", `Bearer ${secondTenantOwnerToken}`)
        .expect(404); // not 403 — must not confirm the record exists at all
    });

    it("second tenant cannot fetch the first tenant's user by id", async () => {
      await request(app.getHttpServer())
        .get(`/users/${staffUserId}`)
        .set("Authorization", `Bearer ${secondTenantOwnerToken}`)
        .expect(404);
    });

    it("second tenant's party list does not include the first tenant's party", async () => {
      const res = await request(app.getHttpServer())
        .get("/parties")
        .set("Authorization", `Bearer ${secondTenantOwnerToken}`)
        .expect(200);

      expect(res.body.data.some((p: any) => p.id === partyId)).toBe(false);
    });
  });
});
