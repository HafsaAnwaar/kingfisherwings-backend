import { Injectable } from "@nestjs/common";
import { HsCode } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../base-master.service";

@Injectable()
export class HsCodesService extends BaseMasterService<HsCode> {
  protected readonly modelName = "hsCode";
  protected readonly searchFields = ["hs_code", "description"];
  protected readonly uniqueKeyLabel = "HS code";

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async validateHs(tenantId: string, hsCode: string) {
    const cleaned = hsCode?.trim();
    if (!cleaned) {
      return { success: false, data: { found: false }, message: "hs_code required" };
    }
    const hs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hsCode.findFirst({
        where: {
          tenant_id: tenantId,
          hs_code: cleaned,
          deleted_at: null,
          is_active: true,
        },
      }),
    );
    if (!hs) {
      return {
        success: false,
        data: { found: false, hs_code: cleaned },
        message: "HS code not found.",
      };
    }
    return {
      success: true,
      data: {
        found: true,
        hs_code: hs.hs_code,
        description: hs.description,
        is_prohibited: hs.is_prohibited,
        is_restricted: hs.is_restricted,
        import_duty_rate: hs.import_duty_rate,
        export_duty_rate: hs.export_duty_rate,
      },
    };
  }
}
