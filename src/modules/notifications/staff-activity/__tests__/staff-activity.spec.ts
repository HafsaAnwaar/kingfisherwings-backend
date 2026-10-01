import { of, throwError, lastValueFrom } from "rxjs";
import { StaffActivityInterceptor } from "../staff-activity.interceptor";
import {
  describeActivity,
  IGNORED_ROUTES,
  pickReference,
} from "../staff-activity.rules";
import { StaffActivityService } from "../staff-activity.service";

const TENANT_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const INV = "11111111-1111-1111-1111-111111111111";

describe("describeActivity", () => {
  it("names creates, updates, deletes and verbs", () => {
    expect(describeActivity("/invoices", "POST", {}, { id: INV }).action).toBe(
      "Created Invoice",
    );
    expect(
      describeActivity("/invoices/:id", "PATCH", { id: INV }, null).action,
    ).toBe("Updated Invoice");
    expect(
      describeActivity("/invoices/:id", "DELETE", { id: INV }, null).action,
    ).toBe("Deleted Invoice");
    expect(
      describeActivity("/invoices/:id/post", "POST", { id: INV }, null).action,
    ).toBe("Posted Invoice");
    expect(
      describeActivity("/gl/payments/:id/post", "POST", { id: INV }, null)
        .action,
    ).toBe("Posted Payment");
    expect(
      describeActivity("/jobs/:id/status", "PATCH", { id: INV }, null).action,
    ).toBe("Changed Status of Job");
    expect(
      describeActivity("/parties", "POST", {}, { party_type: "SUPPLIER" })
        .action,
    ).toBe("Created Vendor");
    expect(describeActivity("/parties/import", "POST", {}, null).action).toBe(
      "Imported Party records",
    );
  });

  it("builds a link to the affected record", () => {
    expect(
      describeActivity("/invoices", "POST", {}, { id: INV }).linkPath,
    ).toBe(`/invoices/${INV}`);
    expect(
      describeActivity("/invoices/:id/post", "POST", { id: INV }, null)
        .linkPath,
    ).toBe(`/invoices/${INV}`);
    expect(
      describeActivity("/invoices/:id", "DELETE", { id: INV }, null).linkPath,
    ).toBeNull();
  });

  it("picks a reference number", () => {
    expect(pickReference({ invoice_number: "INV/1", name: "x" })).toBe("INV/1");
    expect(pickReference({ code: "C1" })).toBe("C1");
    expect(pickReference(null)).toBeNull();
  });

  it("ignores non-business requests", () => {
    const ignored = (r: string) => IGNORED_ROUTES.some((re) => re.test(r));
    for (const r of [
      "/auth/login",
      "/notifications/:id/read",
      "/invoices/:id/pdf",
      "/invoices/:id/lines",
      "/search",
      "/platform/invoices",
      "/portal/invoices/:id/pay",
      "/reports/generate",
    ]) {
      expect(ignored(r)).toBe(true);
    }
    for (const r of [
      "/invoices",
      "/invoices/:id/post",
      "/quotations",
      "/jobs/:id",
      "/gl/payments",
    ]) {
      expect(ignored(r)).toBe(false);
    }
  });
});

describe("StaffActivityInterceptor", () => {
  const ctx = (req: Record<string, unknown>) =>
    ({
      getType: () => "http",
      switchToHttp: () => ({ getRequest: () => req }),
    }) as never;
  const staff = { id: "u1", tenantId: TENANT_A, principal: "user" };

  function setup() {
    const activity = {
      enabled: () => true,
      record: jest.fn().mockResolvedValue(undefined),
    };
    return {
      activity,
      interceptor: new StaffActivityInterceptor(activity as never),
    };
  }

  it("records one activity per successful staff mutation, tenant from the JWT", async () => {
    const { activity, interceptor } = setup();
    const req = {
      method: "POST",
      route: { path: "/invoices" },
      path: "/invoices",
      params: {},
      user: staff,
    };
    await lastValueFrom(
      interceptor.intercept(ctx(req), {
        handle: () =>
          of({
            id: INV,
            invoice_number: "INV/9",
            status: "DRAFT",
            total_amount: "125",
            currency_code: "PKR",
          }),
      }),
    );
    expect(activity.record).toHaveBeenCalledTimes(1);
    expect(activity.record.mock.calls[0][0]).toMatchObject({
      tenantId: TENANT_A,
      actorUserId: "u1",
      action: "Created Invoice",
      reference: "INV/9",
      amount: "PKR 125.00",
      linkPath: `/invoices/${INV}`,
    });
  });

  it("skips reads, failures, super admins, unauthenticated and ignored routes", async () => {
    const { activity, interceptor } = setup();
    const run = (req: Record<string, unknown>, ok = true) =>
      lastValueFrom(
        interceptor.intercept(ctx(req), {
          handle: () =>
            ok ? of({ id: INV }) : throwError(() => new Error("x")),
        }),
      ).catch(() => undefined);
    await run({
      method: "GET",
      route: { path: "/invoices" },
      path: "/invoices",
      user: staff,
    });
    await run(
      {
        method: "POST",
        route: { path: "/invoices" },
        path: "/invoices",
        user: staff,
      },
      false,
    );
    await run({
      method: "POST",
      route: { path: "/platform/invoices" },
      path: "/x",
      user: { id: "sa", principal: "super_admin" },
    });
    await run({
      method: "POST",
      route: { path: "/portal/invoices/:id/pay" },
      path: "/x",
    });
    await run({
      method: "POST",
      route: { path: "/invoices/:id/pdf" },
      path: "/x",
      user: staff,
    });
    expect(activity.record).not.toHaveBeenCalled();
  });

  it("never breaks the request if recording fails", async () => {
    const { activity, interceptor } = setup();
    activity.record.mockImplementation(() => {
      throw new Error("db down");
    });
    const req = {
      method: "POST",
      route: { path: "/invoices" },
      path: "/invoices",
      params: {},
      user: staff,
    };
    await expect(
      lastValueFrom(
        interceptor.intercept(ctx(req), { handle: () => of({ id: INV }) }),
      ),
    ).resolves.toEqual({ id: INV });
  });
});

describe("StaffActivityService.deliver", () => {
  function setup(sendImpl?: jest.Mock) {
    const tx = {
      auditLog: {
        findFirst: jest.fn().mockResolvedValue({
          id: "log1",
          tenant_id: TENANT_A,
          user_id: "u1",
          action: "Created Invoice",
          entity: "Invoice",
          new_values: { status: "DRAFT" },
          metadata: {
            reference: "INV/9",
            link_path: `/invoices/${INV}`,
            occurred_at: "2026-10-01T10:00:00Z",
          },
          created_at: new Date(),
        }),
      },
      tenant: {
        findUnique: jest.fn().mockResolvedValue({
          name: "ABC Logistics",
          display_name: null,
          email: "Owner@abc.test",
        }),
      },
      user: {
        findFirst: jest.fn().mockResolvedValue({
          first_name: "John",
          last_name: "Doe",
          email: "john@abc.test",
          role: "OPERATIONS_EXECUTIVE",
        }),
        findMany: jest
          .fn()
          .mockResolvedValue([
            { email: "owner@abc.test" },
            { email: "admin2@abc.test" },
            { email: "john@abc.test" },
          ]),
      },
    };
    const prisma = {
      runWithTenant: jest.fn((t: string, cb: (x: typeof tx) => unknown) =>
        cb(tx),
      ),
    };
    const email = {
      send: sendImpl ?? jest.fn().mockResolvedValue({ status: "SENT" }),
    };
    const svc = new StaffActivityService(prisma as never, email as never);
    return { svc, tx, prisma, email };
  }

  it("emails the registered tenant email + tenant admins (incl. the acting admin), deduped", async () => {
    const { svc, email, prisma, tx } = setup();
    await svc.deliver({ auditLogId: "log1", tenantId: TENANT_A });
    const to = email.send.mock.calls.map(
      (c: unknown[]) => (c[0] as { to: string }).to,
    );
    expect(to.sort()).toEqual([
      "admin2@abc.test",
      "john@abc.test",
      "owner@abc.test",
    ]);
    const msg = email.send.mock.calls[0][0];
    expect(msg.subject).toContain("Staff Activity: Created Invoice");
    expect(msg.body).toContain("ABC Logistics");
    expect(msg.body).toContain("John Doe (Operations Executive)");
    expect(msg.body).toContain("INV/9");
    expect(msg.tenantId).toBe(TENANT_A);
    // every lookup is scoped to the activity's tenant
    expect(
      prisma.runWithTenant.mock.calls.every(
        (c: unknown[]) => c[0] === TENANT_A,
      ),
    ).toBe(true);
    expect(tx.user.findMany.mock.calls[0][0].where).toMatchObject({
      tenant_id: TENANT_A,
      role: "TENANT_ADMIN",
    });
  });

  it("a failing recipient neither throws nor stops the others", async () => {
    const send = jest
      .fn()
      .mockRejectedValueOnce(new Error("smtp down"))
      .mockResolvedValue({ status: "SENT" });
    const { svc } = setup(send);
    await expect(
      svc.deliver({ auditLogId: "log1", tenantId: TENANT_A }),
    ).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledTimes(3);
  });
});
