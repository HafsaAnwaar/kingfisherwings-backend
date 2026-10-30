import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, UserStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

function displayName(row: {
  first_name: string;
  last_name: string;
  email: string;
}): string {
  return (
    [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
    row.email
  );
}

@Injectable()
export class JobLookupsService {
  constructor(private readonly prisma: PrismaService) {}

  async dropdowns(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [companies, branches, departments, users] = await Promise.all([
        tx.company.findMany({
          where: { tenant_id: tenantId, deleted_at: null, is_active: true },
          select: { name: true, code: true },
          orderBy: { name: "asc" },
        }),
        tx.branch.findMany({
          where: { tenant_id: tenantId, deleted_at: null, is_active: true },
          select: { name: true, code: true },
          orderBy: { name: "asc" },
        }),
        tx.department.findMany({
          where: { tenant_id: tenantId, deleted_at: null, is_active: true },
          select: { name: true, code: true },
          orderBy: { name: "asc" },
        }),
        tx.user.findMany({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            status: UserStatus.ACTIVE,
          },
          select: {
            first_name: true,
            last_name: true,
            email: true,
            is_salesperson: true,
          },
          orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
        }),
      ]);

      const people = users.map((u) => ({
        name: displayName(u),
        email: u.email,
        is_salesperson: u.is_salesperson,
      }));

      return {
        success: true,
        data: {
          companies: companies.map((r) => ({ name: r.name, code: r.code })),
          branches: branches.map((r) => ({ name: r.name, code: r.code })),
          departments: departments.map((r) => ({ name: r.name, code: r.code })),
          salespeople: people.filter((p) => p.is_salesperson),
          employees: people,
        },
      };
    });
  }

  async resolveCompany(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id?: string | null,
    name?: string | null,
  ) {
    if (id) {
      const row = await tx.company.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });
      if (!row) throw new NotFoundException("Company not found.");
      return row.id;
    }
    if (!name?.trim()) return undefined;
    return this.oneByName(
      await tx.company.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { name: { equals: name.trim(), mode: "insensitive" } },
            { code: { equals: name.trim(), mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true },
      }),
      "company",
      name,
    );
  }

  async resolveBranch(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id?: string | null,
    name?: string | null,
  ) {
    if (id) {
      const row = await tx.branch.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });
      if (!row) throw new NotFoundException("Branch not found.");
      return row.id;
    }
    if (!name?.trim()) return undefined;
    return this.oneByName(
      await tx.branch.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { name: { equals: name.trim(), mode: "insensitive" } },
            { code: { equals: name.trim(), mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true },
      }),
      "branch",
      name,
    );
  }

  async resolveDepartment(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id?: string | null,
    name?: string | null,
  ) {
    if (id) {
      const row = await tx.department.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });
      if (!row) throw new NotFoundException("Department not found.");
      return row.id;
    }
    if (!name?.trim()) return undefined;
    return this.oneByName(
      await tx.department.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { name: { equals: name.trim(), mode: "insensitive" } },
            { code: { equals: name.trim(), mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true },
      }),
      "department",
      name,
    );
  }

  async resolvePort(
    tx: Prisma.TransactionClient,
    tenantId: string,
    opts: {
      id?: string | null;
      name?: string | null;
      code?: string | null;
    },
  ) {
    if (opts.id) {
      const row = await tx.port.findFirst({
        where: { id: opts.id, tenant_id: tenantId, deleted_at: null },
      });
      if (!row) throw new NotFoundException("Port not found.");
      return row.id;
    }
    const code = opts.code?.trim();
    const name = opts.name?.trim();
    if (!code && !name) return undefined;
    const or: Prisma.PortWhereInput[] = [];
    if (code) {
      or.push({ un_locode: { equals: code, mode: "insensitive" } });
    }
    if (name) {
      or.push({ name: { equals: name, mode: "insensitive" } });
      if (!code) {
        or.push({ un_locode: { equals: name, mode: "insensitive" } });
      }
    }
    return this.oneByName(
      await tx.port.findMany({
        where: { tenant_id: tenantId, deleted_at: null, OR: or },
        select: { id: true, name: true },
      }),
      "port",
      code || name || "",
    );
  }

  async resolveParty(
    tx: Prisma.TransactionClient,
    tenantId: string,
    opts: {
      id?: string | null;
      name?: string | null;
      code?: string | null;
      label?: string;
    },
  ) {
    const label = opts.label ?? "party";
    if (opts.id) {
      const row = await tx.party.findFirst({
        where: { id: opts.id, tenant_id: tenantId, deleted_at: null },
      });
      if (!row) throw new NotFoundException(`${label} not found.`);
      return row.id;
    }
    const code = opts.code?.trim();
    const name = opts.name?.trim();
    if (!code && !name) return undefined;
    const or: Prisma.PartyWhereInput[] = [];
    if (code) {
      or.push({ code: { equals: code, mode: "insensitive" } });
    }
    if (name) {
      or.push({ name: { equals: name, mode: "insensitive" } });
      if (!code) {
        or.push({ code: { equals: name, mode: "insensitive" } });
      }
    }
    return this.oneByName(
      await tx.party.findMany({
        where: { tenant_id: tenantId, deleted_at: null, OR: or },
        select: { id: true, name: true },
      }),
      label,
      code || name || "",
    );
  }

  async resolveUser(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id?: string | null,
    name?: string | null,
  ) {
    if (id) {
      const row = await tx.user.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });
      if (!row) throw new NotFoundException("Employee not found.");
      return row.id;
    }
    if (!name?.trim()) return undefined;
    const needle = name.trim();
    const users = await tx.user.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: { in: [UserStatus.ACTIVE, UserStatus.INVITED] },
      },
      select: { id: true, first_name: true, last_name: true, email: true },
    });
    const matches = users.filter((u) => {
      const full = displayName(u);
      return (
        full.toLowerCase() === needle.toLowerCase() ||
        u.email.toLowerCase() === needle.toLowerCase()
      );
    });
    if (!matches.length) {
      throw new NotFoundException(`No employee named "${needle}".`);
    }
    if (matches.length > 1) {
      throw new BadRequestException(
        `Multiple employees match "${needle}". Use the email from GET /jobs/lookups/dropdowns.`,
      );
    }
    return matches[0].id;
  }

  private oneByName(
    rows: Array<{ id: string; name: string }>,
    kind: string,
    name: string,
  ) {
    if (!rows.length) throw new NotFoundException(`${kind} "${name}" not found.`);
    if (rows.length > 1) {
      throw new BadRequestException(
        `Multiple ${kind}s match "${name}". Use the unique code from GET /jobs/lookups/dropdowns.`,
      );
    }
    return rows[0].id;
  }
}
