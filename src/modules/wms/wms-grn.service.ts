import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DocumentNumberType } from "@prisma/client";
import type { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { PdfService } from "../../shared/pdf/pdf.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import { CreateGrnDto } from "./dto/wms.dto";
import {
  buildWmsDocumentPdfHtml,
  formatPdfDate,
} from "./wms-document-pdf";
import { resolveWmsPdfContext } from "./wms-pdf-context";

@Injectable()
export class WmsGrnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly pdf: PdfService,
  ) {}

  async create(user: CurrentUser, dto: CreateGrnDto) {
    const number = await this.numberGenerator.generate(
      user.tenantId,
      DocumentNumberType.GRN,
    );
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsGrn.create({
        data: {
          tenant_id: user.tenantId,
          grn_number: number,
          warehouse_id: dto.warehouse_id,
          party_id: dto.party_id,
          job_id: dto.job_id,
          asn_id: dto.asn_id,
          received_at: dto.received_at ? new Date(dto.received_at) : new Date(),
          remarks: dto.remarks,
          created_by: user.id,
          updated_by: user.id,
          lines: {
            create: dto.lines.map((line, index) => ({
              tenant_id: user.tenantId,
              ...line,
              unit_cost: line.unit_cost ?? 0,
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
      tx.wmsGrn.findMany({
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
      const grn = await tx.wmsGrn.findFirst({
        where: { id, tenant_id: user.tenantId, deleted_at: null },
        include: { lines: true },
      });
      if (!grn) throw new NotFoundException("GRN not found.");
      const claimed = await tx.wmsGrn.updateMany({
        where: { id, tenant_id: user.tenantId, status: "DRAFT" },
        data: { status: "POSTED", posted_at: new Date(), updated_by: user.id },
      });
      if (claimed.count !== 1)
        throw new BadRequestException("Only a draft GRN can be posted.");

      for (const line of grn.lines) {
        const quantity = Number(line.quantity);
        const cbmPerUnit =
          line.cbm == null ? null : Number(line.cbm) / quantity;
        const lot = await tx.wmsStockLot.create({
          data: {
            tenant_id: user.tenantId,
            warehouse_id: grn.warehouse_id,
            item_id: line.item_id,
            grn_line_id: line.id,
            party_id: grn.party_id,
            job_id: grn.job_id,
            batch_code: line.batch_code,
            qty_received: line.quantity,
            qty_remaining: line.quantity,
            unit_cost: line.unit_cost,
            cbm_per_unit: cbmPerUnit,
            received_at: grn.received_at,
          },
        });
        await tx.wmsStockMovement.create({
          data: {
            tenant_id: user.tenantId,
            warehouse_id: grn.warehouse_id,
            item_id: line.item_id,
            lot_id: lot.id,
            movement_type: "GRN_IN",
            quantity: line.quantity,
            unit_cost: line.unit_cost,
            reference_type: "GRN",
            reference_id: grn.id,
            remarks: line.remarks,
            moved_at: grn.received_at,
            created_by: user.id,
          },
        });
      }
      if (grn.asn_id) {
        await tx.wmsAsn.updateMany({
          where: {
            id: grn.asn_id,
            tenant_id: user.tenantId,
            status: { in: ["DRAFT", "CONFIRMED"] },
          },
          data: { status: "RECEIVED", updated_by: user.id },
        });
      }
      return tx.wmsGrn.findUniqueOrThrow({
        where: { id },
        include: { lines: true, warehouse: true },
      });
    });
  }

  async cancel(user: CurrentUser, id: string) {
    await this.require(user.tenantId, id);
    const result = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsGrn.updateMany({
        where: { id, tenant_id: user.tenantId, status: "DRAFT" },
        data: { status: "CANCELLED", updated_by: user.id },
      }),
    );
    if (!result.count)
      throw new BadRequestException("Only a draft GRN can be cancelled.");
    return { id, status: "CANCELLED" };
  }

  async downloadPdf(user: CurrentUser, id: string, res: Response) {
    const payload = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const grn = await tx.wmsGrn.findFirst({
        where: { id, tenant_id: user.tenantId, deleted_at: null },
        include: {
          warehouse: true,
          asn: { select: { asn_number: true } },
          lines: {
            include: { item: true },
            orderBy: { sort_order: "asc" },
          },
        },
      });
      if (!grn) throw new NotFoundException("GRN not found.");

      const ctx = await resolveWmsPdfContext(tx, user.tenantId, {
        partyId: grn.party_id,
        jobId: grn.job_id,
      });

      const html = buildWmsDocumentPdfHtml({
        title: "Goods Received Note (GRN)",
        docNumber: grn.grn_number,
        status: grn.status,
        directionLabel: "Inbound / receive",
        stockNote: "Receipt into warehouse",
        warehouseCode: grn.warehouse.code,
        warehouseName: grn.warehouse.name,
        partyName: ctx.partyName,
        jobRef: ctx.jobRef,
        asnNumber: grn.asn?.asn_number ?? null,
        primaryDateLabel: "Received at",
        primaryDate: formatPdfDate(grn.received_at),
        createdAt: formatPdfDate(grn.created_at),
        postedAt: formatPdfDate(grn.posted_at),
        remarks: grn.remarks,
        lines: grn.lines.map((line) => ({
          itemCode: line.item.code,
          itemName: line.item.name,
          quantity: Number(line.quantity),
          uom: line.item.uom_code ?? "—",
          batch: line.batch_code,
        })),
        companyName: ctx.companyName,
        logoUrl: ctx.logoUrl,
        generatedAt: formatPdfDate(new Date())!,
        documentId: grn.id,
      });

      return { html, filename: `GRN-${grn.grn_number}.pdf` };
    });

    const buffer = await this.pdf.renderHtmlToPdf(payload.html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${payload.filename}"`,
    );
    res.send(buffer);
  }

  private async require(tenantId: string, id: string) {
    const value = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.wmsGrn.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          warehouse: true,
          lines: { include: { item: true }, orderBy: { sort_order: "asc" } },
        },
      }),
    );
    if (!value) throw new NotFoundException("GRN not found.");
    return value;
  }
}
