import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { REPORT_ROW_LIMIT } from "../constants/reports.constants";
import { loadReportBranding } from "../helpers/report-branding.helper";
import { ReportDataset } from "../types/report.types";

type Params = Record<string, unknown>;

@Injectable()
export class WmsDataPackService {
  constructor(private readonly prisma: PrismaService) {}

  supports(rendererKey: string): boolean {
    return rendererKey.startsWith("wms.");
  }

  async load(
    tenantId: string,
    rendererKey: string,
    parameters: Params,
  ): Promise<ReportDataset> {
    const branding = await loadReportBranding(this.prisma, tenantId);
    const generated_at = new Date().toISOString();

    if (rendererKey === "wms.asn") {
      const asnId = parameters.asn_id ? String(parameters.asn_id) : null;
      if (asnId) {
        const asn = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.wmsAsn.findFirst({
            where: { id: asnId, tenant_id: tenantId, deleted_at: null },
            include: {
              warehouse: { select: { name: true, code: true } },
              lines: { take: 200, include: { item: { select: { code: true, name: true } } } },
            },
          }),
        );
        if (!asn) throw new BadRequestException("asn_id not found");
        return {
          kind: "list",
          title: `ASN ${asn.asn_number}`,
          columns: [
            { key: "item", label: "Item" },
            { key: "qty", label: "Qty" },
            { key: "cbm", label: "CBM" },
          ],
          rows: asn.lines.map((l) => ({
            item: `${l.item?.code ?? ""} ${l.item?.name ?? ""}`.trim(),
            qty: Number(l.quantity),
            cbm: l.cbm != null ? Number(l.cbm) : "",
          })),
          branding,
          generated_at,
        };
      }

      const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.wmsAsn.findMany({
          where: { tenant_id: tenantId, deleted_at: null },
          take: REPORT_ROW_LIMIT,
          orderBy: { created_at: "desc" },
          include: { warehouse: { select: { code: true } } },
        }),
      );
      return {
        kind: "list",
        title: "ASN List",
        columns: [
          { key: "asn_number", label: "ASN #" },
          { key: "warehouse", label: "Warehouse" },
          { key: "status", label: "Status" },
          { key: "expected_at", label: "Expected" },
        ],
        rows: rows.map((r) => ({
          asn_number: r.asn_number,
          warehouse: r.warehouse?.code ?? "",
          status: r.status,
          expected_at: r.expected_at?.toISOString().slice(0, 10) ?? "",
        })),
        branding,
        generated_at,
      };
    }

    if (rendererKey === "wms.warehouse_note") {
      return {
        kind: "document",
        title: "Warehouse Note",
        template_key: "wms.warehouse_note",
        payload: {
          ref: String(parameters.ref ?? "WH-NOTE"),
          warehouse: String(parameters.warehouse ?? ""),
          notes: String(parameters.notes ?? "Warehouse note"),
        },
        branding,
        generated_at,
      };
    }

    throw new BadRequestException(`Unsupported wms renderer: ${rendererKey}`);
  }
}
