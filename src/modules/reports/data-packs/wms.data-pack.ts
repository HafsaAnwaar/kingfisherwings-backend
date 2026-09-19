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
              lines: {
                take: 200,
                include: { item: { select: { code: true, name: true } } },
              },
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

    if (rendererKey === "wms.grn") {
      return this.grnOrGdo(tenantId, "grn", parameters, branding, generated_at);
    }
    if (rendererKey === "wms.gdo") {
      return this.grnOrGdo(tenantId, "gdo", parameters, branding, generated_at);
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

  private async grnOrGdo(
    tenantId: string,
    kind: "grn" | "gdo",
    parameters: Params,
    branding: Awaited<ReturnType<typeof loadReportBranding>>,
    generated_at: string,
  ): Promise<ReportDataset> {
    const idParam = kind === "grn" ? "grn_id" : "gdo_id";
    const id = parameters[idParam] ? String(parameters[idParam]) : null;

    if (id) {
      if (kind === "grn") {
        const grn = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.wmsGrn.findFirst({
            where: { id, tenant_id: tenantId, deleted_at: null },
            include: {
              warehouse: { select: { code: true, name: true } },
              lines: {
                take: 200,
                include: { item: { select: { code: true, name: true } } },
              },
            },
          }),
        );
        if (!grn) throw new BadRequestException("grn_id not found");
        return {
          kind: "document",
          title: `GRN ${grn.grn_number}`,
          template_key: "wms.grn",
          payload: {
            doc_number: grn.grn_number,
            warehouse: grn.warehouse
              ? `${grn.warehouse.code} — ${grn.warehouse.name}`
              : "",
            status: grn.status,
            received_at: grn.received_at?.toISOString().slice(0, 10) ?? "",
            lines: grn.lines.map((l) => ({
              item: `${l.item?.code ?? ""} ${l.item?.name ?? ""}`.trim(),
              qty: Number(l.quantity),
            })),
          },
          branding,
          generated_at,
        };
      }
      const gdo = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.wmsGdo.findFirst({
          where: { id, tenant_id: tenantId, deleted_at: null },
          include: {
            warehouse: { select: { code: true, name: true } },
            lines: {
              take: 200,
              include: { item: { select: { code: true, name: true } } },
            },
          },
        }),
      );
      if (!gdo) throw new BadRequestException("gdo_id not found");
      return {
        kind: "document",
        title: `GDO ${gdo.gdo_number}`,
        template_key: "wms.gdo",
        payload: {
          doc_number: gdo.gdo_number,
          warehouse: gdo.warehouse
            ? `${gdo.warehouse.code} — ${gdo.warehouse.name}`
            : "",
          status: gdo.status,
          dispatched_at: gdo.delivered_at?.toISOString().slice(0, 10) ?? "",
          lines: gdo.lines.map((l) => ({
            item: `${l.item?.code ?? ""} ${l.item?.name ?? ""}`.trim(),
            qty: Number(l.quantity),
          })),
        },
        branding,
        generated_at,
      };
    }

    // List mode
    if (kind === "grn") {
      const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.wmsGrn.findMany({
          where: { tenant_id: tenantId, deleted_at: null },
          take: REPORT_ROW_LIMIT,
          orderBy: { created_at: "desc" },
          include: { warehouse: { select: { code: true } } },
        }),
      );
      return {
        kind: "list",
        title: "GRN List",
        columns: [
          { key: "grn_number", label: "GRN #" },
          { key: "warehouse", label: "Warehouse" },
          { key: "status", label: "Status" },
          { key: "received_at", label: "Received" },
        ],
        rows: rows.map((r) => ({
          grn_number: r.grn_number,
          warehouse: r.warehouse?.code ?? "",
          status: r.status,
          received_at: r.received_at?.toISOString().slice(0, 10) ?? "",
        })),
        branding,
        generated_at,
      };
    }

    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.wmsGdo.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        take: REPORT_ROW_LIMIT,
        orderBy: { created_at: "desc" },
        include: { warehouse: { select: { code: true } } },
      }),
    );
    return {
      kind: "list",
      title: "GDO List",
      columns: [
        { key: "gdo_number", label: "GDO #" },
        { key: "warehouse", label: "Warehouse" },
        { key: "status", label: "Status" },
        { key: "dispatched_at", label: "Delivered" },
      ],
      rows: rows.map((r) => ({
        gdo_number: r.gdo_number,
        warehouse: r.warehouse?.code ?? "",
        status: r.status,
        dispatched_at: r.delivered_at?.toISOString().slice(0, 10) ?? "",
      })),
      branding,
      generated_at,
    };
  }
}
