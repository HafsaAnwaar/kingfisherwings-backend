import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { DocumentType, JobType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { DocumentEmailService } from "../../shared/email/document-email.service";
import { PdfService } from "../../shared/pdf/pdf.service";
import { StorageService } from "../../shared/storage/storage.service";
import { assertDocumentAllowedForJobType } from "../jobs/constants/job-document-allowlist";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import {
  buildWmsDocumentPdfHtml,
  formatPdfDate,
} from "./wms-document-pdf";
import { resolveWmsPdfContext } from "./wms-pdf-context";

export type WmsNotifyKind = "GRN" | "GDN";

export type WmsNotifyResult = {
  emailed: boolean;
  portal_published: boolean;
  job_document_id: string | null;
  email_error?: string;
  to?: string[];
};

@Injectable()
export class WmsCustomerNotifyService {
  private readonly logger = new Logger(WmsCustomerNotifyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
    private readonly storage: StorageService,
    private readonly documentEmail: DocumentEmailService,
  ) {}

  async notifyGrn(
    user: CurrentUser,
    grnId: string,
  ): Promise<WmsNotifyResult> {
    return this.notifyDocument(user, "GRN", grnId);
  }

  async notifyGdn(
    user: CurrentUser,
    gdoId: string,
  ): Promise<WmsNotifyResult> {
    return this.notifyDocument(user, "GDN", gdoId);
  }

  private async notifyDocument(
    user: CurrentUser,
    kind: WmsNotifyKind,
    docId: string,
  ): Promise<WmsNotifyResult> {
    const built = await this.buildPdfPayload(user.tenantId, kind, docId);
    if (!built.partyId || !built.jobId) {
      throw new BadRequestException(
        `${kind} customer delivery requires party_id and job_id on the document.`,
      );
    }

    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: built.jobId!,
          tenant_id: user.tenantId,
          deleted_at: null,
        },
        select: { id: true, job_type: true },
      }),
    );
    if (!job) {
      throw new BadRequestException(
        `${kind} job_id does not reference a valid job.`,
      );
    }

    const documentType: DocumentType = kind === "GRN" ? "GRN" : "GDN";
    assertDocumentAllowedForJobType(job.job_type as JobType, documentType);

    const buffer = await this.pdf.renderHtmlToPdf(built.html);
    const stored = await this.storage.saveBuffer(
      user.tenantId,
      buffer,
      built.filename,
    );

    const jobDocument = await this.prisma.runWithTenant(
      user.tenantId,
      (tx) =>
        tx.jobDocument.create({
          data: {
            tenant_id: user.tenantId,
            job_id: built.jobId!,
            document_type: documentType,
            reference_number: built.docNumber,
            file_name: built.filename,
            file_url: stored.fileUrl,
            s3_key: stored.s3Key,
            file_size: stored.fileSize,
            mime_type: "application/pdf",
            uploaded_by: user.id,
            created_by: user.id,
            updated_by: user.id,
            emailed_at: null,
            emailed_to: null,
          },
        }),
    );

    await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      if (kind === "GRN") {
        await tx.wmsGrn.update({
          where: { id: docId },
          data: {
            portal_published_at: new Date(),
            job_document_id: jobDocument.id,
            updated_by: user.id,
          },
        });
      } else {
        await tx.wmsGdo.update({
          where: { id: docId },
          data: {
            portal_published_at: new Date(),
            job_document_id: jobDocument.id,
            updated_by: user.id,
          },
        });
      }
    });

    let emailed = false;
    let emailError: string | undefined;
    let to: string[] | undefined;
    try {
      const recipients = await this.documentEmail.resolvePartyEmails(
        user.tenantId,
        built.partyId,
        "portal",
      );
      const { to: toList, cc } = this.documentEmail.pickRecipients(
        {},
        recipients,
      );
      to = toList;
      const title =
        kind === "GRN" ? "Goods Received Note (GRN)" : "Goods Dispatch Note (GDN)";
      const send = await this.documentEmail.sendDocument({
        tenantId: user.tenantId,
        eventType: "JOB_DOCUMENT",
        to: toList,
        cc,
        subject: `${title} ${built.docNumber}`,
        bodyHtml: `<p>Please find attached your ${title} <strong>${built.docNumber}</strong>.</p>
          <p>It is also available in your customer portal under shipment documents.</p>`,
        attachmentBuffer: buffer,
        attachmentName: built.filename,
        createdBy: user.id,
        jobId: built.jobId,
      });
      emailed = send.success;
      await this.prisma.runWithTenant(user.tenantId, async (tx) => {
        const emailedAt = new Date();
        if (kind === "GRN") {
          await tx.wmsGrn.update({
            where: { id: docId },
            data: { customer_emailed_at: emailedAt, updated_by: user.id },
          });
        } else {
          await tx.wmsGdo.update({
            where: { id: docId },
            data: { customer_emailed_at: emailedAt, updated_by: user.id },
          });
        }
        await tx.jobDocument.update({
          where: { id: jobDocument.id },
          data: {
            emailed_at: emailedAt,
            emailed_to: toList.join(", "),
            updated_by: user.id,
          },
        });
      });
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `${kind} portal published but email failed for ${docId}: ${emailError}`,
      );
    }

    return {
      emailed,
      portal_published: true,
      job_document_id: jobDocument.id,
      email_error: emailError,
      to,
    };
  }

  private async buildPdfPayload(
    tenantId: string,
    kind: WmsNotifyKind,
    docId: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (kind === "GRN") {
        const grn = await tx.wmsGrn.findFirst({
          where: { id: docId, tenant_id: tenantId, deleted_at: null },
          include: {
            warehouse: true,
            asn: { select: { asn_number: true } },
            lines: {
              include: { item: true },
              orderBy: { sort_order: "asc" },
            },
          },
        });
        if (!grn) throw new BadRequestException("GRN not found.");
        const ctx = await resolveWmsPdfContext(tx, tenantId, {
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
        return {
          html,
          filename: `GRN-${grn.grn_number}.pdf`,
          docNumber: grn.grn_number,
          partyId: grn.party_id,
          jobId: grn.job_id,
        };
      }

      const gdo = await tx.wmsGdo.findFirst({
        where: { id: docId, tenant_id: tenantId, deleted_at: null },
        include: {
          warehouse: true,
          lines: {
            include: { item: true },
            orderBy: { sort_order: "asc" },
          },
        },
      });
      if (!gdo) throw new BadRequestException("GDO not found.");
      const ctx = await resolveWmsPdfContext(tx, tenantId, {
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
      return {
        html,
        filename: `GDN-${gdo.gdo_number}.pdf`,
        docNumber: gdo.gdo_number,
        partyId: gdo.party_id,
        jobId: gdo.job_id,
      };
    });
  }
}
