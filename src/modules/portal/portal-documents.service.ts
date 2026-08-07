import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType, InvoiceStatus, InvoiceType, PortalDocumentType, Prisma } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';
import { PortalDocumentQueryDto } from './dto/portal-document-query.dto';
import {
  isPortalVisibleDocumentType,
  toPortalDocumentType,
} from './helpers/portal-document-type.helper';
import { portalJobOwnershipWhere } from './helpers/portal-ownership.helper';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { PortalPermissionsService } from './portal-permissions.service';

const PORTAL_INVOICE_STATUSES: InvoiceStatus[] = ['POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID'];

export type PortalDocumentListItem = {
  id: string;
  source: 'job' | 'invoice';
  portal_document_type: PortalDocumentType;
  document_type: string;
  reference_number: string | null;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  can_download: boolean;
  created_at: Date;
  job_id: string | null;
  job_number: string | null;
  invoice_id: string | null;
  invoice_number: string | null;
};

@Injectable()
export class PortalDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: PortalPermissionsService,
    private readonly storage: StorageService,
  ) {}

  async summary(user: CurrentPortalUser) {
    const items = await this.collectAllDocuments(user);
    const byType = {} as Record<PortalDocumentType, number>;

    for (const item of items) {
      byType[item.portal_document_type] = (byType[item.portal_document_type] ?? 0) + 1;
    }

    return {
      success: true,
      data: {
        total: items.length,
        job_documents: items.filter((i) => i.source === 'job').length,
        invoice_documents: items.filter((i) => i.source === 'invoice').length,
        downloadable: items.filter((i) => i.can_download).length,
        by_portal_document_type: byType,
      },
    };
  }

  async listAll(user: CurrentPortalUser, query: PortalDocumentQueryDto) {
    let items = await this.collectAllDocuments(user);

    if (query.source) {
      items = items.filter((item) => item.source === query.source);
    }
    if (query.job_id) {
      items = items.filter((item) => item.job_id === query.job_id);
    }
    if (query.portal_document_type) {
      items = items.filter((item) => item.portal_document_type === query.portal_document_type);
    }

    items.sort((a, b) => {
      const diff = a.created_at.getTime() - b.created_at.getTime();
      return query.order === 'asc' ? diff : -diff;
    });

    const total = items.length;
    const start = (query.page - 1) * query.limit;
    const data = items.slice(start, start + query.limit);

    return {
      success: true,
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async listForShipment(user: CurrentPortalUser, jobId: string) {
    await this.assertOwnedJob(user, jobId);

    const items = (await this.collectAllDocuments(user)).filter((item) => item.job_id === jobId);

    return { success: true, data: items };
  }

  async downloadJobDocument(
    user: CurrentPortalUser,
    jobId: string,
    docId: string,
    res: Response,
  ) {
    await this.assertOwnedJob(user, jobId);

    const doc = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.jobDocument.findFirst({
        where: {
          id: docId,
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
          generation_status: 'COMPLETED',
        },
      }),
    );

    if (!doc || !isPortalVisibleDocumentType(doc.document_type)) {
      throw new NotFoundException('Document not found.');
    }

    await this.streamJobDocument(user, doc.document_type, doc, res);
  }

  async downloadInvoice(user: CurrentPortalUser, invoiceId: string, res: Response) {
    const invoice = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findFirst({
        where: {
          id: invoiceId,
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
          status: { in: PORTAL_INVOICE_STATUSES },
          invoice_type: {
            in: [InvoiceType.CUSTOMER_INVOICE, InvoiceType.CREDIT_NOTE, InvoiceType.DEBIT_NOTE],
          },
        },
      }),
    );

    if (!invoice?.pdf_url) {
      throw new NotFoundException('Document not found.');
    }

    const portalType =
      invoice.invoice_type === InvoiceType.CREDIT_NOTE
        ? PortalDocumentType.CREDIT_NOTE
        : PortalDocumentType.INVOICE;

    const matrix = await this.permissions.resolveMatrix(user.tenantId, user.partyId);
    if (!this.permissions.assertCanView(matrix, portalType)) {
      throw new NotFoundException('Document not found.');
    }
    if (!this.permissions.assertCanDownload(matrix, portalType)) {
      throw new ForbiddenException('Download is not permitted for this document type.');
    }

    const file = await this.storage.readByStoredFile(user.tenantId, {
      file_name: `${invoice.invoice_number}.pdf`,
      file_url: invoice.pdf_url,
      s3_key: invoice.pdf_s3_key,
      mime_type: 'application/pdf',
    });

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    res.send(file.buffer);
  }

  /** @deprecated Use downloadJobDocument — kept for shipment-nested route. */
  async download(user: CurrentPortalUser, jobId: string, docId: string, res: Response) {
    return this.downloadJobDocument(user, jobId, docId, res);
  }

  private async collectAllDocuments(user: CurrentPortalUser): Promise<PortalDocumentListItem[]> {
    const matrix = await this.permissions.resolveMatrix(user.tenantId, user.partyId);
    const [jobDocs, invoices] = await Promise.all([
      this.fetchJobDocuments(user),
      this.fetchInvoiceDocuments(user),
    ]);

    const items: PortalDocumentListItem[] = [];

    for (const doc of jobDocs) {
      if (!isPortalVisibleDocumentType(doc.document_type)) continue;

      const portalType = toPortalDocumentType(doc.document_type);
      if (!this.permissions.assertCanView(matrix, portalType)) continue;

      items.push({
        id: doc.id,
        source: 'job',
        portal_document_type: portalType,
        document_type: doc.document_type,
        reference_number: doc.reference_number,
        file_name: doc.file_name,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        can_download: this.permissions.assertCanDownload(matrix, portalType),
        created_at: doc.created_at,
        job_id: doc.job_id,
        job_number: doc.job?.job_number ?? null,
        invoice_id: null,
        invoice_number: null,
      });
    }

    for (const invoice of invoices) {
      const portalType =
        invoice.invoice_type === InvoiceType.CREDIT_NOTE
          ? PortalDocumentType.CREDIT_NOTE
          : PortalDocumentType.INVOICE;

      if (!this.permissions.assertCanView(matrix, portalType)) continue;

      items.push({
        id: invoice.id,
        source: 'invoice',
        portal_document_type: portalType,
        document_type: invoice.invoice_type,
        reference_number: invoice.invoice_number,
        file_name: `${invoice.invoice_number}.pdf`,
        file_size: null,
        mime_type: 'application/pdf',
        can_download: this.permissions.assertCanDownload(matrix, portalType),
        created_at: invoice.created_at,
        job_id: invoice.job_id,
        job_number: invoice.job?.job_number ?? null,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
      });
    }

    return items;
  }

  private async fetchJobDocuments(user: CurrentPortalUser) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.jobDocument.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          generation_status: 'COMPLETED',
          job: {
            deleted_at: null,
            ...portalJobOwnershipWhere(user.partyId),
          },
        },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          job_id: true,
          document_type: true,
          reference_number: true,
          file_name: true,
          file_size: true,
          mime_type: true,
          created_at: true,
          job: { select: { job_number: true } },
        },
      }),
    );
  }

  private async fetchInvoiceDocuments(user: CurrentPortalUser) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findMany({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
          pdf_url: { not: null },
          status: { in: PORTAL_INVOICE_STATUSES },
          invoice_type: {
            in: [InvoiceType.CUSTOMER_INVOICE, InvoiceType.CREDIT_NOTE, InvoiceType.DEBIT_NOTE],
          },
        },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          invoice_number: true,
          invoice_type: true,
          job_id: true,
          created_at: true,
          job: { select: { job_number: true } },
        },
      }),
    );
  }

  private async streamJobDocument(
    user: CurrentPortalUser,
    documentType: DocumentType,
    doc: {
      file_name: string;
      file_url: string;
      s3_key?: string | null;
      mime_type?: string | null;
    },
    res: Response,
  ) {
    const matrix = await this.permissions.resolveMatrix(user.tenantId, user.partyId);
    const portalType = toPortalDocumentType(documentType);

    if (!this.permissions.assertCanView(matrix, portalType)) {
      throw new NotFoundException('Document not found.');
    }
    if (!this.permissions.assertCanDownload(matrix, portalType)) {
      throw new ForbiddenException('Download is not permitted for this document type.');
    }

    const file = await this.storage.readByStoredFile(user.tenantId, doc);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    res.send(file.buffer);
  }

  private async assertOwnedJob(user: CurrentPortalUser, jobId: string) {
    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalJobOwnershipWhere(user.partyId),
        },
        select: { id: true },
      }),
    );

    if (!job) {
      throw new NotFoundException('Shipment not found.');
    }
  }
}
