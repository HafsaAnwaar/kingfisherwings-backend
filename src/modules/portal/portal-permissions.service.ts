import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PortalDocumentType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { DEFAULT_PORTAL_DOCUMENT_TYPES } from "./constants/portal-permission.constants";
import { UpsertPortalPermissionsDto } from "./dto/portal-permissions.dto";

export type PortalPermissionMatrix = Record<
  PortalDocumentType,
  { can_view: boolean; can_download: boolean }
>;

export type PortalPermissionRow = {
  document_type: PortalDocumentType;
  can_view: boolean;
  can_download: boolean;
  is_configured: boolean;
};

@Injectable()
export class PortalPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForParty(tenantId: string, partyId: string) {
    await this.assertParty(tenantId, partyId);

    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.portalPermission.findMany({
        where: { tenant_id: tenantId, party_id: partyId },
        orderBy: { document_type: "asc" },
      }),
    );

    return {
      success: true,
      data: {
        party_id: partyId,
        matrix: this.toMatrix(rows),
        permissions: this.toRows(rows),
      },
    };
  }

  async getEffectiveForPortalUser(tenantId: string, partyId: string) {
    const matrix = await this.resolveMatrix(tenantId, partyId);

    return {
      success: true,
      data: {
        permissions: DEFAULT_PORTAL_DOCUMENT_TYPES.map((document_type) => ({
          document_type,
          can_view: matrix[document_type].can_view,
          can_download: matrix[document_type].can_download,
        })),
      },
    };
  }

  async upsertForParty(
    tenantId: string,
    partyId: string,
    dto: UpsertPortalPermissionsDto,
    actorId: string,
  ) {
    await this.assertParty(tenantId, partyId);
    this.validatePermissionEntries(dto);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      for (const entry of dto.permissions) {
        await tx.portalPermission.upsert({
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
            updated_by: actorId,
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

  async resetToDefaults(tenantId: string, partyId: string, actorId: string) {
    await this.assertParty(tenantId, partyId);

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.portalPermission.deleteMany({
        where: { tenant_id: tenantId, party_id: partyId },
      });

      for (const document_type of DEFAULT_PORTAL_DOCUMENT_TYPES) {
        await tx.portalPermission.create({
          data: {
            tenant_id: tenantId,
            party_id: partyId,
            document_type,
            can_view: true,
            can_download: false,
            created_by: actorId,
            updated_by: actorId,
          },
        });
      }
    });

    return this.getForParty(tenantId, partyId);
  }

  /** Idempotent — skips when any row already exists for the party. */
  async seedDefaultsIfEmpty(
    tenantId: string,
    partyId: string,
    actorId?: string,
  ) {
    const count = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.portalPermission.count({
        where: { tenant_id: tenantId, party_id: partyId },
      }),
    );

    if (count > 0) return;

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      for (const document_type of DEFAULT_PORTAL_DOCUMENT_TYPES) {
        await tx.portalPermission.create({
          data: {
            tenant_id: tenantId,
            party_id: partyId,
            document_type,
            can_view: true,
            can_download: false,
            created_by: actorId,
            updated_by: actorId,
          },
        });
      }
    });
  }

  async resolveMatrix(
    tenantId: string,
    partyId: string,
  ): Promise<PortalPermissionMatrix> {
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.portalPermission.findMany({
        where: { tenant_id: tenantId, party_id: partyId },
      }),
    );

    return this.toMatrix(rows);
  }

  assertCanView(
    matrix: PortalPermissionMatrix,
    portalType: PortalDocumentType,
  ): boolean {
    return matrix[portalType]?.can_view ?? true;
  }

  assertCanDownload(
    matrix: PortalPermissionMatrix,
    portalType: PortalDocumentType,
  ): boolean {
    const rights = matrix[portalType];
    if (!rights?.can_view) return false;
    return rights.can_download;
  }

  private validatePermissionEntries(dto: UpsertPortalPermissionsDto) {
    const provided = new Set(dto.permissions.map((p) => p.document_type));

    if (provided.size !== DEFAULT_PORTAL_DOCUMENT_TYPES.length) {
      throw new BadRequestException(
        `Provide all ${DEFAULT_PORTAL_DOCUMENT_TYPES.length} document types in the permissions matrix.`,
      );
    }

    for (const required of DEFAULT_PORTAL_DOCUMENT_TYPES) {
      if (!provided.has(required)) {
        throw new BadRequestException(
          `Missing permission entry for ${required}.`,
        );
      }
    }

    for (const entry of dto.permissions) {
      if (entry.can_download && !entry.can_view) {
        throw new BadRequestException(
          `Download cannot be enabled without view for ${entry.document_type}.`,
        );
      }
    }
  }

  private toMatrix(
    rows: Array<{
      document_type: PortalDocumentType;
      can_view: boolean;
      can_download: boolean;
    }>,
  ): PortalPermissionMatrix {
    const matrix = {} as PortalPermissionMatrix;

    for (const docType of DEFAULT_PORTAL_DOCUMENT_TYPES) {
      matrix[docType] = { can_view: true, can_download: false };
    }

    for (const row of rows) {
      matrix[row.document_type] = {
        can_view: row.can_view,
        can_download: row.can_download,
      };
    }

    return matrix;
  }

  private toRows(
    rows: Array<{
      document_type: PortalDocumentType;
      can_view: boolean;
      can_download: boolean;
    }>,
  ): PortalPermissionRow[] {
    const configured = new Map(rows.map((row) => [row.document_type, row]));

    return DEFAULT_PORTAL_DOCUMENT_TYPES.map((document_type) => {
      const row = configured.get(document_type);
      return {
        document_type,
        can_view: row?.can_view ?? true,
        can_download: row?.can_download ?? false,
        is_configured: Boolean(row),
      };
    });
  }

  private async assertParty(tenantId: string, partyId: string) {
    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: { id: partyId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, portal_access: true },
      }),
    );

    if (!party) {
      throw new NotFoundException("Party not found.");
    }
  }
}
