import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DocumentNumberType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import {
  BankReconciliationQueryDto,
  CreateBankReconciliationDto,
  CreateBankReconciliationLineDto,
  CreateBankTransferDto,
  UpdateBankReconciliationDto,
  UpdateBankReconciliationLineDto,
} from "./dto/ar-ap.dto";

@Injectable()
export class BankReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  async findAll(tenantId: string, query: BankReconciliationQueryDto) {
    const where: Prisma.BankReconciliationWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };
    if (query.status) where.status = query.status;
    if (query.gl_account_id) where.gl_account_id = query.gl_account_id;

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.bankReconciliation.findMany({
        where,
        include: {
          gl_account: {
            select: { id: true, account_code: true, account_name: true },
          },
          _count: { select: { lines: true } },
        },
        orderBy: { statement_date: "desc" },
      }),
    );
  }

  async findOne(tenantId: string, id: string) {
    const recon = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.bankReconciliation.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          gl_account: {
            select: { id: true, account_code: true, account_name: true },
          },
          lines: {
            where: { deleted_at: null },
            orderBy: { txn_date: "asc" },
          },
        },
      }),
    );
    if (!recon) throw new NotFoundException("Bank reconciliation not found.");
    const matchedDebit = recon.lines
      .filter((l) => l.is_matched)
      .reduce((s, l) => s + Number(l.debit_amount), 0);
    const matchedCredit = recon.lines
      .filter((l) => l.is_matched)
      .reduce((s, l) => s + Number(l.credit_amount), 0);
    return {
      ...recon,
      summary: {
        line_count: recon.lines.length,
        matched_count: recon.lines.filter((l) => l.is_matched).length,
        matched_debit: matchedDebit,
        matched_credit: matchedCredit,
        difference:
          Number(recon.statement_balance) - Number(recon.book_balance),
      },
    };
  }

  async create(
    tenantId: string,
    dto: CreateBankReconciliationDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const account = await tx.chartOfAccount.findFirst({
        where: {
          id: dto.gl_account_id,
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { is_bank_account: true },
            { account_sub_type: "BANK" },
            { account_sub_type: "CASH" },
          ],
        },
      });
      if (!account) {
        throw new BadRequestException(
          "GL account must be a bank or cash account.",
        );
      }

      const bookBalance = await this.computeBookBalance(
        tx,
        tenantId,
        dto.gl_account_id,
        new Date(dto.statement_date),
      );

      return tx.bankReconciliation.create({
        data: {
          tenant_id: tenantId,
          gl_account_id: dto.gl_account_id,
          bank_account_id: dto.bank_account_id,
          company_id: dto.company_id,
          statement_date: new Date(dto.statement_date),
          statement_balance: dto.statement_balance,
          book_balance: bookBalance,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateBankReconciliationDto,
    actorId?: string,
  ) {
    const existing = await this.findOne(tenantId, id);
    if (existing.status !== "DRAFT") {
      throw new BadRequestException(
        "Only draft reconciliations can be updated.",
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      let bookBalance = Number(existing.book_balance);
      const statementDate = dto.statement_date
        ? new Date(dto.statement_date)
        : existing.statement_date;
      if (dto.statement_date) {
        bookBalance = await this.computeBookBalance(
          tx,
          tenantId,
          existing.gl_account_id,
          statementDate,
        );
      }
      return tx.bankReconciliation.update({
        where: { id },
        data: {
          ...(dto.statement_date !== undefined
            ? { statement_date: statementDate }
            : {}),
          ...(dto.statement_balance !== undefined
            ? { statement_balance: dto.statement_balance }
            : {}),
          ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
          book_balance: bookBalance,
          updated_by: actorId,
        },
      });
    });
  }

  async softDelete(tenantId: string, id: string, actorId?: string) {
    const existing = await this.findOne(tenantId, id);
    if (existing.status !== "DRAFT") {
      throw new BadRequestException(
        "Only draft reconciliations can be deleted.",
      );
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.bankReconciliation.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          status: "CANCELLED",
          updated_by: actorId,
        },
      }),
    );
  }

  async unmatchedLines(tenantId: string, reconId: string) {
    const recon = await this.findOne(tenantId, reconId);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const alreadyLinked = recon.lines
        .map((l) => l.voucher_line_id)
        .filter((id): id is string => Boolean(id));

      return tx.voucherLine.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          account_id: recon.gl_account_id,
          ...(alreadyLinked.length ? { id: { notIn: alreadyLinked } } : {}),
          voucher: {
            status: "POSTED",
            deleted_at: null,
            voucher_date: { lte: recon.statement_date },
          },
        },
        include: {
          voucher: {
            select: {
              id: true,
              voucher_number: true,
              voucher_date: true,
              voucher_type: true,
              narration: true,
            },
          },
        },
        orderBy: { created_at: "asc" },
      });
    });
  }

  async addLine(
    tenantId: string,
    reconId: string,
    dto: CreateBankReconciliationLineDto,
    actorId?: string,
  ) {
    const recon = await this.findOne(tenantId, reconId);
    if (recon.status !== "DRAFT") {
      throw new BadRequestException(
        "Only draft reconciliations can be edited.",
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.bankReconciliationLine.create({
        data: {
          tenant_id: tenantId,
          reconciliation_id: reconId,
          voucher_id: dto.voucher_id,
          voucher_line_id: dto.voucher_line_id,
          account_id: dto.account_id ?? recon.gl_account_id,
          txn_date: new Date(dto.txn_date),
          description: dto.description,
          debit_amount: dto.debit_amount ?? 0,
          credit_amount: dto.credit_amount ?? 0,
          is_matched: dto.is_matched ?? true,
          statement_ref: dto.statement_ref,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      return this.findOne(tenantId, reconId);
    });
  }

  async updateLine(
    tenantId: string,
    reconId: string,
    lineId: string,
    dto: UpdateBankReconciliationLineDto,
    actorId?: string,
  ) {
    const recon = await this.findOne(tenantId, reconId);
    if (recon.status !== "DRAFT") {
      throw new BadRequestException(
        "Only draft reconciliations can be edited.",
      );
    }
    if (!recon.lines.some((l) => l.id === lineId)) {
      throw new NotFoundException("Reconciliation line not found.");
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.bankReconciliationLine.update({
        where: { id: lineId },
        data: {
          ...(dto.is_matched !== undefined
            ? { is_matched: dto.is_matched }
            : {}),
          ...(dto.statement_ref !== undefined
            ? { statement_ref: dto.statement_ref }
            : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          updated_by: actorId,
        },
      });
      return this.findOne(tenantId, reconId);
    });
  }

  async removeLine(
    tenantId: string,
    reconId: string,
    lineId: string,
    actorId?: string,
  ) {
    const recon = await this.findOne(tenantId, reconId);
    if (recon.status !== "DRAFT") {
      throw new BadRequestException(
        "Only draft reconciliations can be edited.",
      );
    }
    if (!recon.lines.some((l) => l.id === lineId)) {
      throw new NotFoundException("Reconciliation line not found.");
    }
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.bankReconciliationLine.update({
        where: { id: lineId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
      return this.findOne(tenantId, reconId);
    });
  }

  async complete(tenantId: string, id: string, actorId?: string) {
    const recon = await this.findOne(tenantId, id);
    if (recon.status !== "DRAFT") {
      throw new BadRequestException(
        "Only draft reconciliations can be completed.",
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const bookBalance = await this.computeBookBalance(
        tx,
        tenantId,
        recon.gl_account_id,
        recon.statement_date,
      );
      return tx.bankReconciliation.update({
        where: { id },
        data: {
          status: "COMPLETED",
          book_balance: bookBalance,
          completed_at: new Date(),
          completed_by: actorId,
          updated_by: actorId,
        },
        include: {
          gl_account: {
            select: { id: true, account_code: true, account_name: true },
          },
          lines: { where: { deleted_at: null } },
        },
      });
    });
  }

  /** Posted contra voucher moving funds between two cash/bank GL accounts. */
  async createBankTransfer(
    tenantId: string,
    dto: CreateBankTransferDto,
    actorId?: string,
  ) {
    if (dto.from_account_id === dto.to_account_id) {
      throw new BadRequestException("From and to accounts must differ.");
    }

    const amount = Number(dto.amount);
    const rate = Number(dto.exchange_rate ?? 1);
    const voucherNumber = await this.numberGenerator.generate(
      tenantId,
      DocumentNumberType.VOUCHER,
      { extraSegment: "CV" },
    );

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const accounts = await tx.chartOfAccount.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          id: { in: [dto.from_account_id, dto.to_account_id] },
          is_postable: true,
        },
      });
      if (accounts.length !== 2) {
        throw new BadRequestException(
          "Both from and to GL accounts must exist and be postable.",
        );
      }

      return tx.voucher.create({
        data: {
          tenant_id: tenantId,
          voucher_number: voucherNumber,
          voucher_type: "CONTRA",
          status: "POSTED",
          voucher_date: dto.transfer_date
            ? new Date(dto.transfer_date)
            : new Date(),
          currency_code: dto.currency_code,
          exchange_rate: rate,
          narration: dto.narration ?? "Bank transfer",
          reference_number: dto.reference_number,
          company_id: dto.company_id,
          total_debit: amount,
          total_credit: amount,
          posted_at: new Date(),
          posted_by: actorId,
          created_by: actorId,
          updated_by: actorId,
          lines: {
            create: [
              {
                tenant_id: tenantId,
                account_id: dto.to_account_id,
                line_no: 1,
                debit_amount: amount,
                credit_amount: 0,
                currency_code: dto.currency_code,
                exchange_rate: rate,
                debit_base: amount * rate,
                credit_base: 0,
                narration: "Bank transfer in",
                created_by: actorId,
                updated_by: actorId,
              },
              {
                tenant_id: tenantId,
                account_id: dto.from_account_id,
                line_no: 2,
                debit_amount: 0,
                credit_amount: amount,
                currency_code: dto.currency_code,
                exchange_rate: rate,
                debit_base: 0,
                credit_base: amount * rate,
                narration: "Bank transfer out",
                created_by: actorId,
                updated_by: actorId,
              },
            ],
          },
        },
        include: {
          lines: { where: { deleted_at: null }, orderBy: { line_no: "asc" } },
        },
      });
    });
  }

  private async computeBookBalance(
    tx: Prisma.TransactionClient,
    tenantId: string,
    accountId: string,
    asOf: Date,
  ): Promise<number> {
    const account = await tx.chartOfAccount.findFirst({
      where: { id: accountId, tenant_id: tenantId, deleted_at: null },
    });
    if (!account) throw new NotFoundException("GL account not found.");

    const opening = Number(account.opening_balance);
    const openingSigned =
      account.opening_balance_type === "CREDIT" ? -opening : opening;

    const lines = await tx.voucherLine.findMany({
      where: {
        tenant_id: tenantId,
        account_id: accountId,
        deleted_at: null,
        voucher: {
          status: "POSTED",
          deleted_at: null,
          voucher_date: { lte: asOf },
        },
      },
      select: { debit_base: true, credit_base: true },
    });

    const movement = lines.reduce(
      (s, l) => s + Number(l.debit_base) - Number(l.credit_base),
      0,
    );
    return openingSigned + movement;
  }
}
