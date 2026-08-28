import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentNumberFormat, DocumentNumberType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export interface GenerateNumberOptions {
  /** Only used if the format has include_branch_code enabled. */
  branchCode?: string;
  /** Free-form segment inserted right after the prefix — e.g. a job type code ("AE" for Air Export) for JOB_NUMBER. */
  extraSegment?: string;
}

@Injectable()
export class NumberGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mints the next number for a document type — e.g. "KFW/AE/06/26/00136".
   * Atomic under concurrency: the counter row is upserted with
   * `last_sequence: { increment: 1 }` inside the tenant's transaction,
   * and Postgres's unique-constraint + row lock on
   * DocumentNumberSequence serializes concurrent callers correctly —
   * two simultaneous requests can never receive the same number.
   */
  async generate(
    tenantId: string,
    documentType: DocumentNumberType,
    options: GenerateNumberOptions = {},
    existingTx?: Prisma.TransactionClient,
  ): Promise<string> {
    const mint = async (tx: Prisma.TransactionClient) => {
      let format = await tx.documentNumberFormat.findFirst({
        where: { tenant_id: tenantId, document_type: documentType, is_active: true },
      });

      // Auto-provision a sensible default so invoice/CN/DN/PI never 500 on fresh tenants.
      if (!format) {
        format = await tx.documentNumberFormat.create({
          data: {
            tenant_id: tenantId,
            document_type: documentType,
            prefix: this.defaultPrefix(documentType),
            include_branch_code: false,
            include_year: true,
            year_digits: 2,
            include_month: true,
            sequence_length: 5,
            separator: '/',
            reset_frequency: 'YEARLY',
            is_active: true,
          },
        });
      }

      const now = new Date();
      const periodKey = this.periodKey(format.reset_frequency, now);
      const branchCode = format.include_branch_code ? options.branchCode ?? '' : '';

      const sequence = await tx.documentNumberSequence.upsert({
        where: {
          tenant_id_document_type_branch_code_period_key: {
            tenant_id: tenantId,
            document_type: documentType,
            branch_code: branchCode,
            period_key: periodKey,
          },
        },
        create: {
          tenant_id: tenantId,
          document_type: documentType,
          branch_code: branchCode,
          period_key: periodKey,
          last_sequence: 1,
        },
        update: {
          last_sequence: { increment: 1 },
        },
      });

      return this.assemble(format, sequence.last_sequence, now, branchCode, options.extraSegment);
    };

    if (existingTx) {
      return mint(existingTx);
    }

    return this.prisma.runWithTenant(tenantId, mint);
  }

  private defaultPrefix(documentType: DocumentNumberType): string {
    const map: Partial<Record<DocumentNumberType, string>> = {
      INVOICE: 'INV',
      CREDIT_NOTE: 'CN',
      DEBIT_NOTE: 'DN',
      PURCHASE_INVOICE: 'PI',
      QUOTATION: 'Q',
      JOB_NUMBER: 'JOB',
      VOUCHER: 'JV',
      PAYMENT: 'PAY',
      EMPLOYEE_CODE: 'EMP',
      GRN: 'GRN',
      GDO: 'GDO',
      ASN: 'ASN',
      TRANSPORT_REQUEST: 'TR',
      NVOCC_VOYAGE: 'VYG',
      NVOCC_ENQUIRY: 'NEQ',
      NVOCC_BOOKING: 'NBK',
    };
    return map[documentType] ?? 'DOC';
  }

  /** Builds the string for the *next* number without consuming a sequence value — for UI "preview this format" displays. */
  async preview(
    tenantId: string,
    documentType: DocumentNumberType,
    options: GenerateNumberOptions = {},
  ): Promise<string> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const format = await tx.documentNumberFormat.findFirst({
        where: { tenant_id: tenantId, document_type: documentType },
      });

      if (!format) {
        throw new NotFoundException(`No number format configured for ${documentType}.`);
      }

      const now = new Date();
      const periodKey = this.periodKey(format.reset_frequency, now);
      const branchCode = format.include_branch_code ? options.branchCode ?? '' : '';

      const existing = await tx.documentNumberSequence.findFirst({
        where: { tenant_id: tenantId, document_type: documentType, branch_code: branchCode, period_key: periodKey },
      });

      const nextSequence = (existing?.last_sequence ?? 0) + 1;

      return this.assemble(format, nextSequence, now, branchCode, options.extraSegment);
    });
  }

  private periodKey(resetFrequency: string, at: Date): string {
    if (resetFrequency === 'YEARLY') {
      return String(at.getFullYear());
    }
    if (resetFrequency === 'MONTHLY') {
      return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}`;
    }
    return '';
  }

  private assemble(
    format: DocumentNumberFormat,
    sequence: number,
    at: Date,
    branchCode: string,
    extraSegment?: string,
  ): string {
    const segments: string[] = [format.prefix];

    if (extraSegment) {
      segments.push(extraSegment);
    }

    if (format.include_branch_code && branchCode) {
      segments.push(branchCode);
    }

    if (format.include_month) {
      segments.push(String(at.getMonth() + 1).padStart(2, '0'));
    }

    if (format.include_year) {
      const year = format.year_digits === 4 ? String(at.getFullYear()) : String(at.getFullYear()).slice(-2);
      segments.push(year);
    }

    segments.push(String(sequence).padStart(format.sequence_length, '0'));

    return segments.join(format.separator);
  }
}
