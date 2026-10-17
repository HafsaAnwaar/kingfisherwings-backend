import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobPartyRole, PartyType, Prisma } from "@prisma/client";
import {
  OVERSEAS_AGENT_PARTY_TYPES,
} from "./dto/job-organization-tab.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { PartiesService } from "../parties/parties.service";
import { CreatePartyDto } from "../parties/dto/party.dto";
import { PARTIES_PERMISSIONS } from "../parties/constants/parties-permission.constants";
import {
  AddJobOrganizationDto,
  CopyJobOrganizationsDto,
  InlineCreatePartyDto,
  JOB_ORGANIZATION_TYPES,
  RefreshOrgPartySnapshotDto,
  ReplaceJobOrganizationDto,
} from "./dto/job-organization-tab.dto";

const PARTY_CARD_SELECT = {
  id: true,
  code: true,
  name: true,
  short_name: true,
  party_type: true,
  address: true,
  city: true,
  country_code: true,
  phone: true,
  email: true,
  vat_number: true,
  cr_number: true,
  currency_code: true,
  is_active: true,
} satisfies Prisma.PartySelect;

export type PartySnapshot = {
  party_id: string;
  code: string;
  name: string;
  short_name: string | null;
  party_type: string;
  address: string | null;
  city: string | null;
  country_code: string | null;
  phone: string | null;
  email: string | null;
  vat_number: string | null;
  cr_number: string | null;
  currency_code: string | null;
  frozen_at: string;
};

@Injectable()
export class JobOrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parties: PartiesService,
  ) {}

  async getTab(tenantId: string, jobId: string) {
    const job = await this.assertJob(tenantId, jobId);
    const orgs = await this.listRows(tenantId, jobId);
    const refs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobPartyReference.findMany({
        where: { tenant_id: tenantId, job_id: jobId },
        orderBy: { updated_at: "desc" },
      }),
    );

    const customer =
      orgs.find((o) => o.is_primary_customer) ??
      orgs.find((o) => o.org_type === JobPartyRole.CLIENT) ??
      null;

    return {
      success: true,
      data: {
        empty: orgs.length === 0,
        organizations: orgs,
        party_references: refs,
        customer_name: customer?.party_display?.name ?? customer?.party?.name ?? null,
        customer_party: customer?.party_display ?? customer?.party ?? null,
        organization_types: JOB_ORGANIZATION_TYPES,
        party_types: Object.values(PartyType),
        job_fks: {
          shipper_id: job.shipper_id,
          consignee_id: job.consignee_id,
          billing_party_id: job.billing_party_id,
          agent_id: job.agent_id,
        },
        actions: {
          add_organization: true,
          copy_from_parent: !!job.parent_job_id,
          refresh_party_snapshot: orgs.length > 0,
        },
      },
    };
  }

  async list(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    return {
      success: true,
      data: await this.listRows(tenantId, jobId),
    };
  }

  async add(
    tenantId: string,
    jobId: string,
    dto: AddJobOrganizationDto,
    actorId?: string,
    actorPermissions?: string[],
  ) {
    await this.assertJob(tenantId, jobId);
    if (!dto.party_id && !dto.create_party) {
      throw new BadRequestException(
        "Provide party_id or create_party to add an organization.",
      );
    }
    if (dto.create_party) {
      await this.assertAllowCreatePartyFromJob(tenantId, actorPermissions);
    }

    const partyId = await this.resolvePartyId(
      tenantId,
      dto.party_id,
      dto.create_party,
      actorId,
    );
    await this.assertOrgPartyType(tenantId, dto.org_type, partyId);

    const isPrimary =
      dto.is_primary_customer ?? dto.org_type === JobPartyRole.CLIENT;

    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobOrganization.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          org_type: dto.org_type,
        },
      });
      if (existing && !existing.deleted_at) {
        throw new BadRequestException(
          `Organization type ${dto.org_type} already linked. Use PUT to replace.`,
        );
      }

      if (isPrimary) {
        await tx.jobOrganization.updateMany({
          where: {
            tenant_id: tenantId,
            job_id: jobId,
            deleted_at: null,
            is_primary_customer: true,
          },
          data: { is_primary_customer: false, updated_by: actorId },
        });
      }

      const snapshot = await this.buildPartySnapshot(tx, tenantId, partyId);

      const created = existing
        ? await tx.jobOrganization.update({
            where: { id: existing.id },
            data: {
              party_id: partyId,
              is_primary_customer: isPrimary,
              party_snapshot: snapshot,
              deleted_at: null,
              updated_by: actorId,
            },
            include: { party: { select: PARTY_CARD_SELECT } },
          })
        : await tx.jobOrganization.create({
            data: {
              tenant_id: tenantId,
              job_id: jobId,
              org_type: dto.org_type,
              party_id: partyId,
              is_primary_customer: isPrimary,
              party_snapshot: snapshot,
              created_by: actorId,
              updated_by: actorId,
            },
            include: { party: { select: PARTY_CARD_SELECT } },
          });

      await this.syncJobPartyFks(tx, tenantId, jobId, dto.org_type, partyId, isPrimary);
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_ORG_LINKED",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            org_type: dto.org_type,
            party_id: partyId,
          } as Prisma.InputJsonValue,
        },
      });
      if (dto.create_party) {
        await tx.auditLog.create({
          data: {
            tenant_id: tenantId,
            user_id: actorId ?? null,
            action: "JOB_ORG_PARTY_CREATED",
            entity: "JOB",
            entity_id: jobId,
            metadata: {
              org_type: dto.org_type,
              party_id: partyId,
            } as Prisma.InputJsonValue,
          },
        });
      }
      return created;
    });

    return { success: true, data: this.mapRow(row) };
  }

  async replace(
    tenantId: string,
    jobId: string,
    orgType: JobPartyRole,
    dto: ReplaceJobOrganizationDto,
    actorId?: string,
    actorPermissions?: string[],
  ) {
    await this.assertJob(tenantId, jobId);
    if (!dto.party_id && !dto.create_party) {
      throw new BadRequestException("Provide party_id or create_party.");
    }
    if (dto.create_party) {
      await this.assertAllowCreatePartyFromJob(tenantId, actorPermissions);
    }
    const partyId = await this.resolvePartyId(
      tenantId,
      dto.party_id,
      dto.create_party,
      actorId,
    );
    await this.assertOrgPartyType(tenantId, orgType, partyId);
    const isPrimary =
      dto.is_primary_customer ?? orgType === JobPartyRole.CLIENT;

    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobOrganization.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          org_type: orgType,
          deleted_at: null,
        },
      });

      if (isPrimary) {
        await tx.jobOrganization.updateMany({
          where: {
            tenant_id: tenantId,
            job_id: jobId,
            deleted_at: null,
            is_primary_customer: true,
            NOT: existing ? { id: existing.id } : undefined,
          },
          data: { is_primary_customer: false, updated_by: actorId },
        });
      }

      const snapshot = await this.buildPartySnapshot(tx, tenantId, partyId);

      const saved = existing
        ? await tx.jobOrganization.update({
            where: { id: existing.id },
            data: {
              party_id: partyId,
              is_primary_customer: isPrimary,
              party_snapshot: snapshot,
              updated_by: actorId,
            },
            include: { party: { select: PARTY_CARD_SELECT } },
          })
        : await tx.jobOrganization.create({
            data: {
              tenant_id: tenantId,
              job_id: jobId,
              org_type: orgType,
              party_id: partyId,
              is_primary_customer: isPrimary,
              party_snapshot: snapshot,
              created_by: actorId,
              updated_by: actorId,
            },
            include: { party: { select: PARTY_CARD_SELECT } },
          });

      await this.syncJobPartyFks(tx, tenantId, jobId, orgType, partyId, isPrimary);
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_ORG_REPLACED",
          entity: "JOB",
          entity_id: jobId,
          metadata: { org_type: orgType, party_id: partyId } as Prisma.InputJsonValue,
        },
      });
      return saved;
    });

    return { success: true, data: this.mapRow(row) };
  }

  async remove(
    tenantId: string,
    jobId: string,
    orgType: JobPartyRole,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobOrganization.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          org_type: orgType,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException("Organization link not found.");

      await tx.jobOrganization.update({
        where: { id: existing.id },
        data: { deleted_at: new Date(), updated_by: actorId },
      });

      const clear: Prisma.JobUncheckedUpdateInput = { updated_by: actorId };
      if (orgType === JobPartyRole.SHIPPER) clear.shipper_id = null;
      if (orgType === JobPartyRole.CONSIGNEE) clear.consignee_id = null;
      if (orgType === JobPartyRole.AGENT) clear.agent_id = null;
      if (orgType === JobPartyRole.OVERSEAS_AGENT) clear.overseas_agent_id = null;
      if (
        orgType === JobPartyRole.CLIENT ||
        orgType === JobPartyRole.BILLING_PARTY ||
        existing.is_primary_customer
      ) {
        clear.billing_party_id = null;
      }
      await tx.job.update({
        where: { id: jobId },
        data: clear,
      });

      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_ORG_UNLINKED",
          entity: "JOB",
          entity_id: jobId,
          metadata: { org_type: orgType } as Prisma.InputJsonValue,
        },
      });
    });
    return { success: true };
  }

  async copyFromSource(
    tenantId: string,
    jobId: string,
    dto: CopyJobOrganizationsDto,
    actorId?: string,
  ) {
    const job = await this.assertJob(tenantId, jobId);
    const sourceId = dto.source_job_id ?? job.parent_job_id;
    if (!sourceId) {
      throw new BadRequestException(
        "No source_job_id and job has no parent_job_id.",
      );
    }
    await this.assertJob(tenantId, sourceId);
    const sourceOrgs = await this.listRows(tenantId, sourceId);
    if (!sourceOrgs.length) {
      return { success: true, data: [], message: "Source has no organizations." };
    }

    const results = [];
    for (const org of sourceOrgs) {
      const existing = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.jobOrganization.findFirst({
          where: {
            tenant_id: tenantId,
            job_id: jobId,
            org_type: org.org_type,
            deleted_at: null,
          },
        }),
      );
      if (existing && !dto.overwrite) continue;
      if (existing && dto.overwrite) {
        results.push(
          (
            await this.replace(
              tenantId,
              jobId,
              org.org_type,
              {
                party_id: org.party_id,
                is_primary_customer: org.is_primary_customer,
              },
              actorId,
            )
          ).data,
        );
      } else if (!existing) {
        results.push(
          (
            await this.add(
              tenantId,
              jobId,
              {
                org_type: org.org_type,
                party_id: org.party_id,
                is_primary_customer: org.is_primary_customer,
              },
              actorId,
            )
          ).data,
        );
      }
    }
    return { success: true, data: results };
  }

  /** Re-freeze party snapshot(s) from current master party data. */
  async refreshPartySnapshots(
    tenantId: string,
    jobId: string,
    dto: RefreshOrgPartySnapshotDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const rows = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobOrganization.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          ...(dto.org_types?.length
            ? { org_type: { in: dto.org_types } }
            : {}),
        },
        include: { party: { select: PARTY_CARD_SELECT } },
      });
      const out = [];
      for (const row of existing) {
        const snapshot = await this.buildPartySnapshot(tx, tenantId, row.party_id);
        out.push(
          await tx.jobOrganization.update({
            where: { id: row.id },
            data: {
              party_snapshot: snapshot,
              updated_by: actorId,
            },
            include: { party: { select: PARTY_CARD_SELECT } },
          }),
        );
      }
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_ORG_SNAPSHOT_REFRESHED",
          entity: "JOB",
          entity_id: jobId,
          metadata: { count: out.length } as Prisma.InputJsonValue,
        },
      });
      return out;
    });
    return { success: true, data: rows.map((r) => this.mapRow(r)) };
  }

  private async listRows(tenantId: string, jobId: string) {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobOrganization.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        include: { party: { select: PARTY_CARD_SELECT } },
        orderBy: [{ is_primary_customer: "desc" }, { org_type: "asc" }],
      }),
    );
    return rows.map((r) => this.mapRow(r));
  }

  private mapRow(row: {
    id: string;
    org_type: JobPartyRole;
    party_id: string;
    is_primary_customer: boolean;
    party_snapshot?: Prisma.JsonValue | null;
    created_at: Date;
    updated_at: Date;
    party: Prisma.PartyGetPayload<{ select: typeof PARTY_CARD_SELECT }>;
  }) {
    const snapshot = (row.party_snapshot as PartySnapshot | null) ?? null;
    const display = snapshot
      ? {
          ...row.party,
          code: snapshot.code ?? row.party.code,
          name: snapshot.name ?? row.party.name,
          short_name: snapshot.short_name ?? row.party.short_name,
          address: snapshot.address ?? row.party.address,
          city: snapshot.city ?? row.party.city,
          country_code: snapshot.country_code ?? row.party.country_code,
          phone: snapshot.phone ?? row.party.phone,
          email: snapshot.email ?? row.party.email,
          vat_number: snapshot.vat_number ?? row.party.vat_number,
          cr_number: snapshot.cr_number ?? row.party.cr_number,
          currency_code: snapshot.currency_code ?? row.party.currency_code,
        }
      : row.party;
    return {
      id: row.id,
      org_type: row.org_type,
      party_id: row.party_id,
      is_primary_customer: row.is_primary_customer,
      party: row.party,
      party_snapshot: snapshot,
      party_display: display,
      party_name: display.name,
      party_code: display.code,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async buildPartySnapshot(
    tx: Prisma.TransactionClient,
    tenantId: string,
    partyId: string,
  ): Promise<PartySnapshot> {
    const party = await tx.party.findFirst({
      where: { id: partyId, tenant_id: tenantId, deleted_at: null },
      select: PARTY_CARD_SELECT,
    });
    if (!party) throw new NotFoundException("Party not found.");
    return {
      party_id: party.id,
      code: party.code,
      name: party.name,
      short_name: party.short_name,
      party_type: party.party_type,
      address: party.address,
      city: party.city,
      country_code: party.country_code,
      phone: party.phone,
      email: party.email,
      vat_number: party.vat_number,
      cr_number: party.cr_number,
      currency_code: party.currency_code,
      frozen_at: new Date().toISOString(),
    };
  }

  private async resolvePartyId(
    tenantId: string,
    partyId: string | undefined,
    createParty: InlineCreatePartyDto | undefined,
    actorId?: string,
  ): Promise<string> {
    if (partyId) {
      const party = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.party.findFirst({
          where: { id: partyId, tenant_id: tenantId, deleted_at: null },
          select: { id: true },
        }),
      );
      if (!party) throw new NotFoundException("Party not found.");
      return party.id;
    }
    const created = await this.parties.create(
      tenantId,
      createParty as CreatePartyDto,
      actorId,
    );
    return created.id;
  }

  private async syncJobPartyFks(
    tx: Prisma.TransactionClient,
    _tenantId: string,
    jobId: string,
    orgType: JobPartyRole,
    partyId: string,
    isPrimary: boolean,
  ) {
    const data: Prisma.JobUncheckedUpdateInput = {};
    if (orgType === JobPartyRole.SHIPPER) data.shipper_id = partyId;
    if (orgType === JobPartyRole.CONSIGNEE) data.consignee_id = partyId;
    if (orgType === JobPartyRole.AGENT) data.agent_id = partyId;
    if (orgType === JobPartyRole.OVERSEAS_AGENT) {
      data.overseas_agent_id = partyId;
    }
    if (
      orgType === JobPartyRole.CLIENT ||
      orgType === JobPartyRole.BILLING_PARTY ||
      isPrimary
    ) {
      data.billing_party_id = partyId;
    }
    if (Object.keys(data).length) {
      await tx.job.update({ where: { id: jobId }, data });
    }
  }

  private async assertOrgPartyType(
    tenantId: string,
    orgType: JobPartyRole,
    partyId: string,
  ) {
    if (orgType !== JobPartyRole.OVERSEAS_AGENT) return;
    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: partyId, tenant_id: tenantId, deleted_at: null },
        select: { party_type: true },
      }),
    );
    if (!party) throw new NotFoundException("Party not found.");
    if (
      !OVERSEAS_AGENT_PARTY_TYPES.includes(party.party_type as PartyType)
    ) {
      throw new BadRequestException(
        "OVERSEAS_AGENT must be PartyType OVERSEAS_AGENT or AGENT.",
      );
    }
  }

  private async assertAllowCreatePartyFromJob(
    tenantId: string,
    actorPermissions?: string[],
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { allow_create_party_from_job: true },
    });
    if (tenant?.allow_create_party_from_job !== false) return;
    const perms = actorPermissions ?? [];
    if (!perms.includes(PARTIES_PERMISSIONS.CREATE)) {
      throw new ForbiddenException(
        "Inline party create from job is disabled. parties.create required.",
      );
    }
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          parent_job_id: true,
          shipper_id: true,
          consignee_id: true,
          billing_party_id: true,
          agent_id: true,
          overseas_agent_id: true,
          status: true,
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }
}
