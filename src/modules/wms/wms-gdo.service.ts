import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DocumentNumberType, Prisma } from "@prisma/client";
import type { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { PdfService } from "../../shared/pdf/pdf.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import { CreateGdoDto } from "./dto/wms.dto";
import {
  buildWmsDocumentPdfHtml,
  formatPdfDate,
} from "./wms-document-pdf";
import { resolveWmsPdfContext } from "./wms-pdf-context";

@Injectable()
export class WmsGdoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly pdf: PdfService,
  ) {}

  async create(user: CurrentUser, dto: CreateGdoDto) {
    const number = await this.numberGenerator.generate(
      user.tenantId,
      DocumentNumberType.GDO,
    );
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsGdo.create({
        data: {
          tenant_id: user.tenantId,
          gdo_number: number,
          warehouse_id: dto.warehouse_id,
          party_id: dto.party_id,
          job_id: dto.job_id,
          delivered_at: dto.delivered_at
            ? new Date(dto.delivered_at)
            : new Date(),
          remarks: dto.remarks,
          created_by: user.id,
          updated_by: user.id,
          lines: {
            create: dto.lines.map((line, index) => ({
              tenant_id: user.tenantId,
              ...line,
              sort_order: index,
            })),
          },
        },
        include: {
          warehouse: true,
          lines: { include: { item: true }, orderBy: { sort_order: "asc" } },
        },
      }),
    );
  }

  list(user: CurrentUser) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsGdo.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        include: { warehouse: true, lines: { include: { item: true } } },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  get(user: CurrentUser, id: string) {
    return this.require(user.tenantId, id);
  }

  async post(user: CurrentUser, id: string) {
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const gdo = await tx.wmsGdo.findFirst({
        where: { id, tenant_id: user.tenantId, deleted_at: null },
        include: { lines: true },
      });
      if (!gdo) throw new NotFoundException("GDO not found.");
      const claimed = await tx.wmsGdo.updateMany({
        where: { id, tenant_id: user.tenantId, status: "DRAFT" },
        data: { status: "POSTED", posted_at: new Date(), updated_by: user.id },
      });
      if (!claimed.count)
        throw new BadRequestException("Only a draft GDO can be posted.");
      const settings = await tx.wmsSettings.findUnique({
        where: { tenant_id: user.tenantId },
      });

      for (const line of gdo.lines) {
        await this.consumeLots(tx, user, {
          warehouseId: gdo.warehouse_id,
          itemId: line.item_id,
          quantity: Number(line.quantity),
          order: settings?.valuation_method === "LIFO" ? "desc" : "asc",
          referenceId: gdo.id,
          remarks: line.remarks,
        });
      }
      return tx.wmsGdo.findUniqueOrThrow({
        where: { id },
        include: { lines: true, warehouse: true },
      });
    });
  }

  async cancel(user: CurrentUser, id: string) {
    await this.require(user.tenantId, id);
    const result = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsGdo.updateMany({
        where: { id, tenant_id: user.tenantId, status: "DRAFT" },
        data: { status: "CANCELLED", updated_by: user.id },
      }),
    );
    if (!result.count)
      throw new BadRequestException("Only a draft GDO can be cancelled.");
    return { id, status: "CANCELLED" };
  }

  async downloadPdf(user: CurrentUser, id: string, res: Response) {
    const payload = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const gdo = await tx.wmsGdo.findFirst({
        where: { id, tenant_id: user.tenantId, deleted_at: null },
        include: {
          warehouse: true,
          lines: {
            include: { item: true },
            orderBy: { sort_order: "asc" },
          },
        },
      });
      if (!gdo) throw new NotFoundException("GDO not found.");

      const ctx = await resolveWmsPdfContext(tx, user.tenantId, {
        partyId: gdo.party_id,
        jobId: gdo.job_id,
      });

      const html = buildWmsDocumentPdfHtml({
        title: "Goods Dispatch Order (GDO) / GDN",
        docNumber: gdo.gdo_number,
        status: gdo.status,
        directionLabel: "Outbound / dispatch",
        stockNote: "Issue from warehouse (FIFO/LIFO)",
        warehouseCode: gdo.warehouse.code,
        warehouseName: gdo.warehouse.name,
        partyName: ctx.partyName,
        jobRef: ctx.jobRef,
        asnNumber: null,
        primaryDateLabel: "Dispatched / delivered at",
        primaryDate: formatPdfDate(gdo.delivered_at),
        createdAt: formatPdfDate(gdo.created_at),
        postedAt: formatPdfDate(gdo.posted_at),
        remarks: gdo.remarks,
        lines: gdo.lines.map((line) => ({
          itemCode: line.item.code,
          itemName: line.item.name,
          quantity: Number(line.quantity),
          uom: line.item.uom_code ?? "—",
          batch: null,
        })),
        companyName: ctx.companyName,
        logoUrl: ctx.logoUrl,
        generatedAt: formatPdfDate(new Date())!,
        documentId: gdo.id,
      });

      return { html, filename: `GDO-${gdo.gdo_number}.pdf` };
    });

    const buffer = await this.pdf.renderHtmlToPdf(payload.html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${payload.filename}"`,
    );
    res.send(buffer);
  }

  private async consumeLots(
    tx: Prisma.TransactionClient,
    user: CurrentUser,
    input: {
      warehouseId: string;
      itemId: string;
      quantity: number;
      order: Prisma.SortOrder;
      referenceId: string;
      remarks?: string | null;
    },
  ) {
    const lots = await tx.wmsStockLot.findMany({
      where: {
        tenant_id: user.tenantId,
        warehouse_id: input.warehouseId,
        item_id: input.itemId,
        deleted_at: null,
        qty_remaining: { gt: 0 },
      },
      orderBy: [{ received_at: input.order }, { created_at: input.order }],
    });
    const available = lots.reduce(
      (sum, lot) => sum + Number(lot.qty_remaining),
      0,
    );
    if (available < input.quantity)
      throw new BadRequestException(
        `Insufficient stock for item ${input.itemId}.`,
      );

    let remaining = input.quantity;
    for (const lot of lots) {
      if (remaining <= 0) break;
      const consumed = Math.min(remaining, Number(lot.qty_remaining));
      await tx.wmsStockLot.update({
        where: { id: lot.id },
        data: { qty_remaining: { decrement: consumed } },
      });
      await tx.wmsStockMovement.create({
        data: {
          tenant_id: user.tenantId,
          warehouse_id: input.warehouseId,
          item_id: input.itemId,
          lot_id: lot.id,
          movement_type: "GDO_OUT",
          quantity: -consumed,
          unit_cost: lot.unit_cost,
          reference_type: "GDO",
          reference_id: input.referenceId,
          remarks: input.remarks,
          created_by: user.id,
        },
      });
      remaining -= consumed;
    }
  }

  private async require(tenantId: string, id: string) {
    const value = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.wmsGdo.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          warehouse: true,
          lines: { include: { item: true }, orderBy: { sort_order: "asc" } },
        },
      }),
    );
    if (!value) throw new NotFoundException("GDO not found.");
    return value;
  }
}
