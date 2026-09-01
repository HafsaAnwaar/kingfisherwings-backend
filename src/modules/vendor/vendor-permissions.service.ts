import { Injectable, NotFoundException } from "@nestjs/common";
import { VendorDocumentType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { DEFAULT_VENDOR_DOCUMENT_TYPES } from "./constants/vendor-permission.constants";

export class UpsertVendorPermissionsDto {
  permissions!: Array<{
    document_type: VendorDocumentType;
    can_view: boolean;
    can_download: boolean;
  }>;
}

@Injectable()
export class VendorPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForParty(tenantId: string, partyId: string) {
    await this.assertParty(tenantId, partyId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPermission.findMany({
        where: { tenant_id: tenantId, party_id: partyId },
        orderBy: { document_type: "asc" },
      }),
    );
    return {
      success: true,
      data: {
        party_id: partyId,
        permissions: DEFAULT_VENDOR_DOCUMENT_TYPES.map((document_type) => {
          const row = rows.find((r) => r.document_type === document_type);
          return {
            document_type,
            can_view: row?.can_view ?? true,
            can_download: row?.can_download ?? false,
            is_configured: Boolean(row),
          };
        }),
      },
    };
  }

  async upsertForParty(
    tenantId: string,
    partyId: string,
    dto: UpsertVendorPermissionsDto,
    actorId: string,
  ) {
    await this.assertParty(tenantId, partyId);
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      for (const entry of dto.permissions) {
        await tx.vendorPermission.upsert({
          where: {
            tenant_id_party_id_document_type: {
              tenant_id: tenantId,
              party_id: partyId,
              document_type: entry.document_type,
            },
          },
          create: {
            tenant_id: tenantId,
            party_id: partyId,
            document_type: entry.document_type,
            can_view: entry.can_view,
            can_download: entry.can_download,
            created_by: actorId,
          },
          update: {
            can_view: entry.can_view,
            can_download: entry.can_download,
            updated_by: actorId,
          },
        });
      }
    });
    return this.getForParty(tenantId, partyId);
  }

  async seedDefaultsIfEmpty(
    tenantId: string,
    partyId: string,
    actorId: string,
  ) {
    const count = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPermission.count({
        where: { tenant_id: tenantId, party_id: partyId },
      }),
    );
    if (count > 0) return;
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorPermission.createMany({
        data: DEFAULT_VENDOR_DOCUMENT_TYPES.map((document_type) => ({
          tenant_id: tenantId,
          party_id: partyId,
          document_type,
          can_view: true,
          can_download: document_type !== "TDS_CERTIFICATE",
          created_by: actorId,
        })),
      }),
    );
  }

  private async assertParty(tenantId: string, partyId: string) {
    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: partyId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!party) throw new NotFoundException("Party not found.");
  }
}
