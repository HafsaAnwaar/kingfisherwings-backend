import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DocumentNumberType,
  InvoiceStatus,
  InvoiceType,
  PaymentDirection,
  Prisma,
  VoucherType,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  lockInvoiceRow,
  lockPaymentRow,
} from "../../common/utils/row-lock.util";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { GlAutoPostService } from "./gl-auto-post.service";
import {
  CreatePaymentDto,
  PaymentAllocationInputDto,
  PaymentQueryDto,
  UpdatePaymentDto,
} from "./dto/ar-ap.dto";

const OPEN_AR_STATUSES: InvoiceStatus[] = ["POSTED", "SENT", "PARTIALLY_PAID"];
const OPEN_AP_STATUSES: InvoiceStatus[] = ["POSTED", "SENT", "PARTIALLY_PAID"];

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly glAutoPost: GlAutoPostService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  async findAll(tenantId: string, query: PaymentQueryDto) {
    const where: Prisma.PaymentWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };
    if (query.direction) where.direction = query.direction;
    if (query.status) where.status = query.status;
    if (query.party_id) where.party_id = query.party_id;
    if (query.from_date || query.to_date) {
      where.payment_date = {
        ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
        ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
      };
    }
    if (query.search) {
      where.OR = [
        { payment_number: { contains: query.search, mode: "insensitive" } },
        { reference_number: { contains: query.search, mode: "insensitive" } },
        { narration: { contains: query.search, mode: "insensitive" } },
      ];
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.payment.findMany({
        where,
        include: {
          party: { select: { id: true, code: true, name: true } },
          allocations: {
            where: { deleted_at: null },
            include: {
              invoice: {
                select: {
                  id: true,
                  invoice_number: true,
                  invoice_type: true,
                  balance_due: true,
                  total_amount: true,
                },
              },
            },
          },
        },
        orderBy: [{ payment_date: "desc" }, { created_at: "desc" }],
      }),
    );
  }

  async findOne(tenantId: string, id: string) {
    const payment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.payment.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          party: { select: { id: true, code: true, name: true } },
          cheque: true,
          voucher: { select: { id: true, voucher_number: true, status: true } },
          allocations: {
            where: { deleted_at: null },
            include: {
              invoice: {
                select: {
                  id: true,
                  invoice_number: true,
                  invoice_type: true,
                  status: true,
                  total_amount: true,
                  amount_paid: true,
                  balance_due: true,
                },
              },
            },
          },
        },
      }),
    );
    if (!payment) throw new NotFoundException("Payment not found.");
    return payment;
  }

  async create(tenantId: string, dto: CreatePaymentDto, actorId?: string) {
    await this.ensurePaymentNumberFormat(tenantId);

    const paymentNumber = await this.numberGenerator.generate(
      tenantId,
      DocumentNumberType.PAYMENT,
      { extraSegment: dto.direction === "RECEIPT" ? "RCPT" : "PYMT" },
    );

    const amount = Number(dto.amount);
    const rate = Number(dto.exchange_rate ?? 1);
    const allocations = dto.allocations ?? [];
    this.assertAllocationTotal(amount, allocations);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertParty(tx, tenantId, dto.party_id);
      if (allocations.length) {
        await this.assertAllocationsValid(
          tx,
          tenantId,
          dto.direction,
          dto.party_id,
          allocations,
        );
      }

      let chequeId: string | undefined;
      if (dto.payment_method === "CHEQUE" || dto.cheque_number) {
        if (!dto.cheque_number || !dto.cheque_date) {
          throw new BadRequestException(
            "cheque_number and cheque_date are required for cheque payments.",
          );
        }
        const cheque = await tx.cheque.create({
          data: {
            tenant_id: tenantId,
            cheque_number: dto.cheque_number,
            cheque_type: dto.direction === "RECEIPT" ? "RECEIVABLE" : "PAYABLE",
            party_id: dto.party_id,
            company_id: dto.company_id,
            bank_account_id: dto.bank_account_id,
            bank_name: dto.cheque_bank_name,
            amount,
            currency_code: dto.currency_code,
            cheque_date: new Date(dto.cheque_date),
            due_date: dto.cheque_due_date
              ? new Date(dto.cheque_due_date)
              : undefined,
            is_pdc:
              dto.is_pdc ??
              Boolean(
                dto.cheque_due_date &&
                dto.cheque_due_date > (dto.cheque_date ?? ""),
              ),
            remarks: dto.narration,
            created_by: actorId,
            updated_by: actorId,
          },
        });
        chequeId = cheque.id;
      }

      const allocated = allocations.reduce((s, a) => s + Number(a.amount), 0);

      const payment = await tx.payment.create({
        data: {
          tenant_id: tenantId,
          payment_number: paymentNumber,
          direction: dto.direction,
          payment_method: dto.payment_method ?? "BANK_TRANSFER",
          party_id: dto.party_id,
          amount,
          currency_code: dto.currency_code,
          exchange_rate: rate,
          amount_base: amount * rate,
          unallocated_amount: amount - allocated,
          payment_date: dto.payment_date
            ? new Date(dto.payment_date)
            : new Date(),
          company_id: dto.company_id,
          branch_id: dto.branch_id,
          bank_account_id: dto.bank_account_id,
          gl_account_id: dto.gl_account_id,
          cheque_id: chequeId,
          reference_number: dto.reference_number,
          narration: dto.narration,
          created_by: actorId,
          updated_by: actorId,
          allocations: allocations.length
            ? {
                create: allocations.map((a) => ({
                  tenant_id: tenantId,
                  invoice_id: a.invoice_id,
                  amount: a.amount,
                  created_by: actorId,
                  updated_by: actorId,
                })),
              }
            : undefined,
        },
        include: {
          allocations: { where: { deleted_at: null } },
          cheque: true,
          party: { select: { id: true, code: true, name: true } },
        },
      });

      return payment;
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePaymentDto,
    actorId?: string,
  ) {
    const existing = await this.findOne(tenantId, id);
    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Only draft payments can be updated.");
    }
    if (dto.allocations) {
      throw new BadRequestException(
        "Use allocation endpoints to change allocations.",
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (dto.party_id) await this.assertParty(tx, tenantId, dto.party_id);
      const amount =
        dto.amount !== undefined ? Number(dto.amount) : Number(existing.amount);
      const allocated = existing.allocations.reduce(
        (s, a) => s + Number(a.amount),
        0,
      );
      if (allocated - amount > 0.0001) {
        throw new BadRequestException(
          "Payment amount cannot be less than allocated total.",
        );
      }

      await tx.payment.update({
        where: { id },
        data: {
          ...(dto.direction !== undefined ? { direction: dto.direction } : {}),
          ...(dto.payment_method !== undefined
            ? { payment_method: dto.payment_method }
            : {}),
          ...(dto.party_id !== undefined ? { party_id: dto.party_id } : {}),
          ...(dto.amount !== undefined
            ? {
                amount,
                amount_base:
                  amount * Number(dto.exchange_rate ?? existing.exchange_rate),
              }
            : {}),
          ...(dto.currency_code !== undefined
            ? { currency_code: dto.currency_code }
            : {}),
          ...(dto.exchange_rate !== undefined
            ? { exchange_rate: dto.exchange_rate }
            : {}),
          ...(dto.payment_date !== undefined
            ? { payment_date: new Date(dto.payment_date) }
            : {}),
          ...(dto.company_id !== undefined
            ? { company_id: dto.company_id }
            : {}),
          ...(dto.branch_id !== undefined ? { branch_id: dto.branch_id } : {}),
          ...(dto.bank_account_id !== undefined
            ? { bank_account_id: dto.bank_account_id }
            : {}),
          ...(dto.gl_account_id !== undefined
            ? { gl_account_id: dto.gl_account_id }
            : {}),
          ...(dto.reference_number !== undefined
            ? { reference_number: dto.reference_number }
            : {}),
          ...(dto.narration !== undefined ? { narration: dto.narration } : {}),
          unallocated_amount: amount - allocated,
          updated_by: actorId,
        },
      });
      return this.findOne(tenantId, id);
    });
  }

  async softDelete(tenantId: string, id: string, actorId?: string) {
    const existing = await this.findOne(tenantId, id);
    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Only draft payments can be deleted.");
    }
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.payment.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          status: "CANCELLED",
          updated_by: actorId,
        },
      }),
    );
  }

  async addAllocation(
    tenantId: string,
    paymentId: string,
    dto: PaymentAllocationInputDto,
    actorId?: string,
  ) {
    const payment = await this.findOne(tenantId, paymentId);
    if (payment.status !== "DRAFT") {
      throw new BadRequestException("Only draft payments can be allocated.");
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertAllocationsValid(
        tx,
        tenantId,
        payment.direction,
        payment.party_id,
        [dto],
      );
      const allocated =
        payment.allocations.reduce((s, a) => s + Number(a.amount), 0) +
        Number(dto.amount);
      if (allocated - Number(payment.amount) > 0.0001) {
        throw new BadRequestException("Allocation exceeds payment amount.");
      }

      await tx.paymentAllocation.create({
        data: {
          tenant_id: tenantId,
          payment_id: paymentId,
          invoice_id: dto.invoice_id,
          amount: dto.amount,
          created_by: actorId,
          updated_by: actorId,
        },
      });
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          unallocated_amount: Number(payment.amount) - allocated,
          updated_by: actorId,
        },
      });
      return this.findOne(tenantId, paymentId);
    });
  }

  async removeAllocation(
    tenantId: string,
    paymentId: string,
    allocationId: string,
    actorId?: string,
  ) {
    const payment = await this.findOne(tenantId, paymentId);
    if (payment.status !== "DRAFT") {
      throw new BadRequestException("Only draft payments can be edited.");
    }
    const alloc = payment.allocations.find((a) => a.id === allocationId);
    if (!alloc) throw new NotFoundException("Allocation not found.");

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.paymentAllocation.update({
        where: { id: allocationId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
      const remaining = payment.allocations
        .filter((a) => a.id !== allocationId)
        .reduce((s, a) => s + Number(a.amount), 0);
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          unallocated_amount: Number(payment.amount) - remaining,
          updated_by: actorId,
        },
      });
      return this.findOne(tenantId, paymentId);
    });
  }

  async post(tenantId: string, id: string, actorId?: string) {
    const payment = await this.findOne(tenantId, id);
    if (payment.status !== "DRAFT") {
      throw new BadRequestException("Only draft payments can be posted.");
    }
    if (
      !payment.allocations.length &&
      Number(payment.unallocated_amount) === Number(payment.amount)
    ) {
      // Allow full advances (unallocated) — still posts to AR/AP control account.
    }

    const cashBank = await this.glAutoPost.resolveCashOrBankAccount(tenantId, {
      payment_method: payment.payment_method,
      gl_account_id: payment.gl_account_id ?? undefined,
      bank_account_id: payment.bank_account_id ?? undefined,
    });
    const arAp = await this.glAutoPost.resolveArApAccount(
      tenantId,
      payment.direction,
    );

    const amount = Number(payment.amount);
    const rate = Number(payment.exchange_rate) || 1;
    const voucherType: VoucherType =
      payment.direction === "RECEIPT"
        ? payment.payment_method === "CASH"
          ? "CASH_RECEIPT"
          : "BANK_RECEIPT"
        : payment.payment_method === "CASH"
          ? "CASH_PAYMENT"
          : "BANK_PAYMENT";

    const voucherNumber = await this.numberGenerator.generate(
      tenantId,
      DocumentNumberType.VOUCHER,
      {
        extraSegment:
          voucherType === "BANK_RECEIPT"
            ? "BRV"
            : voucherType === "CASH_RECEIPT"
              ? "CRV"
              : voucherType === "BANK_PAYMENT"
                ? "BPV"
                : "CPV",
      },
    );

    const posted = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const lockedPayment = await lockPaymentRow(tx, tenantId, id);
      if (!lockedPayment || lockedPayment.status !== "DRAFT") {
        throw new BadRequestException("Only draft payments can be posted.");
      }

      const sortedAllocations = [...payment.allocations].sort((a, b) =>
        a.invoice_id.localeCompare(b.invoice_id),
      );

      for (const alloc of sortedAllocations) {
        const inv = await lockInvoiceRow(tx, tenantId, alloc.invoice_id);
        if (!inv)
          throw new BadRequestException(
            `Invoice ${alloc.invoice_id} not found.`,
          );
        if (Number(alloc.amount) - Number(inv.balance_due) > 0.0001) {
          throw new BadRequestException(
            `Allocation ${alloc.amount} exceeds balance due ${inv.balance_due} on invoice.`,
          );
        }
      }

      const lines =
        payment.direction === "RECEIPT"
          ? [
              {
                account_id: cashBank.id,
                debit: amount,
                credit: 0,
                narration: `Receipt ${payment.payment_number}`,
              },
              {
                account_id: arAp.id,
                debit: 0,
                credit: amount,
                narration: `AR clearance ${payment.payment_number}`,
              },
            ]
          : [
              {
                account_id: arAp.id,
                debit: amount,
                credit: 0,
                narration: `AP clearance ${payment.payment_number}`,
              },
              {
                account_id: cashBank.id,
                debit: 0,
                credit: amount,
                narration: `Payment ${payment.payment_number}`,
              },
            ];

      const voucher = await tx.voucher.create({
        data: {
          tenant_id: tenantId,
          voucher_number: voucherNumber,
          voucher_type: voucherType,
          status: "POSTED",
          voucher_date: payment.payment_date,
          currency_code: payment.currency_code,
          exchange_rate: rate,
          narration: payment.narration ?? `Payment ${payment.payment_number}`,
          reference_number: payment.reference_number ?? payment.payment_number,
          company_id: payment.company_id,
          branch_id: payment.branch_id,
          party_id: payment.party_id,
          total_debit: amount,
          total_credit: amount,
          posted_at: new Date(),
          posted_by: actorId,
          created_by: actorId,
          updated_by: actorId,
          lines: {
            create: lines.map((l, idx) => ({
              tenant_id: tenantId,
              account_id: l.account_id,
              line_no: idx + 1,
              debit_amount: l.debit,
              credit_amount: l.credit,
              currency_code: payment.currency_code,
              exchange_rate: rate,
              debit_base: l.debit * rate,
              credit_base: l.credit * rate,
              narration: l.narration,
              party_id: payment.party_id,
              created_by: actorId,
              updated_by: actorId,
            })),
          },
        },
      });

      for (const alloc of payment.allocations) {
        const inv = await tx.invoice.findFirst({
          where: {
            id: alloc.invoice_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
        });
        if (!inv) continue;
        const paid = Number(inv.amount_paid) + Number(alloc.amount);
        // Preserve CN/DN adjustments already reflected in balance_due.
        const balance = Math.max(
          0,
          Number(inv.balance_due) - Number(alloc.amount),
        );
        let status: InvoiceStatus = inv.status;
        if (balance <= 0.0001) status = "PAID";
        else if (paid > 0) status = "PARTIALLY_PAID";

        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            amount_paid: paid,
            balance_due: balance,
            status,
            updated_by: actorId,
          },
        });
      }

      if (payment.cheque_id) {
        await tx.cheque.update({
          where: { id: payment.cheque_id },
          data: {
            status: payment.cheque?.is_pdc ? "PENDING" : "DEPOSITED",
            deposited_at: payment.cheque?.is_pdc ? undefined : new Date(),
            updated_by: actorId,
          },
        });
      }

      return tx.payment.update({
        where: { id },
        data: {
          status: "POSTED",
          posted_at: new Date(),
          posted_by: actorId,
          voucher_id: voucher.id,
          gl_account_id: cashBank.id,
          updated_by: actorId,
        },
        include: {
          allocations: { where: { deleted_at: null } },
          voucher: { select: { id: true, voucher_number: true, status: true } },
          party: { select: { id: true, code: true, name: true } },
          cheque: true,
        },
      });
    });

    if (payment.direction === "RECEIPT" && payment.party_id) {
      await this.notifications.notifyPartyPortalUsers(
        tenantId,
        payment.party_id,
        {
          type: "PAYMENT_RECEIVED",
          title: "Payment received",
          message: `We recorded payment ${payment.payment_number} for your account.`,
          entity_type: "payment",
          entity_id: payment.id,
          link_path: `/portal/payments`,
        },
      );
    }

    if (payment.direction === "PAYMENT" && payment.party_id) {
      await this.notifications.notifyPartyVendorUsers(
        tenantId,
        payment.party_id,
        {
          type: "VENDOR_PAYMENT_POSTED",
          title: "Payment posted",
          message: `Payment ${payment.payment_number} was posted to your account.`,
          entity_type: "payment",
          entity_id: payment.id,
          link_path: `/vendor/payments`,
        },
      );
    }

    return posted;
  }

  async cancel(tenantId: string, id: string, actorId?: string) {
    const payment = await this.findOne(tenantId, id);
    if (payment.status === "CANCELLED") {
      throw new BadRequestException("Payment is already cancelled.");
    }
    if (payment.status === "DRAFT") {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.payment.update({
          where: { id },
          data: {
            deleted_at: new Date(),
            status: "CANCELLED",
            updated_by: actorId,
          },
        }),
      );
      return { id, status: "CANCELLED" as const };
    }

    // Posted: reverse invoice balances + reverse voucher
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      for (const alloc of payment.allocations) {
        const inv = await tx.invoice.findFirst({
          where: {
            id: alloc.invoice_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
        });
        if (!inv) continue;
        const paid = Math.max(
          Number(inv.amount_paid) - Number(alloc.amount),
          0,
        );
        // Restore only the cancelled allocation; keep prior CN/DN effects on balance_due.
        const balance = Number(inv.balance_due) + Number(alloc.amount);
        let status: InvoiceStatus = "POSTED";
        if (paid <= 0.0001) {
          status = inv.sent_at ? "SENT" : "POSTED";
        } else {
          status = "PARTIALLY_PAID";
        }
        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            amount_paid: paid,
            balance_due: balance,
            status,
            updated_by: actorId,
          },
        });
      }

      if (payment.voucher_id) {
        const original = await tx.voucher.findFirst({
          where: {
            id: payment.voucher_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
          include: { lines: { where: { deleted_at: null } } },
        });
        if (original && original.status === "POSTED") {
          const reversalNumber = await this.numberGenerator.generate(
            tenantId,
            DocumentNumberType.VOUCHER,
            { extraSegment: "JV" },
          );
          await tx.voucher.create({
            data: {
              tenant_id: tenantId,
              voucher_number: reversalNumber,
              voucher_type: original.voucher_type,
              status: "POSTED",
              voucher_date: new Date(),
              currency_code: original.currency_code,
              exchange_rate: original.exchange_rate,
              narration: `Reversal of payment ${payment.payment_number}`,
              party_id: original.party_id,
              company_id: original.company_id,
              reversal_of_id: original.id,
              total_debit: original.total_credit,
              total_credit: original.total_debit,
              posted_at: new Date(),
              posted_by: actorId,
              created_by: actorId,
              updated_by: actorId,
              lines: {
                create: original.lines.map((line, idx) => ({
                  tenant_id: tenantId,
                  account_id: line.account_id,
                  line_no: idx + 1,
                  debit_amount: line.credit_amount,
                  credit_amount: line.debit_amount,
                  currency_code: line.currency_code,
                  exchange_rate: line.exchange_rate,
                  debit_base: line.credit_base,
                  credit_base: line.debit_base,
                  narration: line.narration,
                  party_id: line.party_id,
                  created_by: actorId,
                  updated_by: actorId,
                })),
              },
            },
          });
          await tx.voucher.update({
            where: { id: original.id },
            data: {
              status: "REVERSED",
              reversed_at: new Date(),
              reversed_by: actorId,
              updated_by: actorId,
            },
          });
        }
      }

      return tx.payment.update({
        where: { id },
        data: { status: "CANCELLED", updated_by: actorId },
        include: {
          allocations: { where: { deleted_at: null } },
          party: { select: { id: true, code: true, name: true } },
        },
      });
    });
  }

  private assertAllocationTotal(
    amount: number,
    allocations: PaymentAllocationInputDto[],
  ) {
    const sum = allocations.reduce((s, a) => s + Number(a.amount), 0);
    if (sum - amount > 0.0001) {
      throw new BadRequestException("Allocations exceed payment amount.");
    }
  }

  /** Lazy-create PAYMENT number format so existing tenants can post without admin setup. */
  private async ensurePaymentNumberFormat(tenantId: string) {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.documentNumberFormat.findFirst({
        where: { tenant_id: tenantId, document_type: "PAYMENT" },
      });
      if (existing) {
        if (!existing.is_active) {
          await tx.documentNumberFormat.update({
            where: { id: existing.id },
            data: { is_active: true },
          });
        }
        return;
      }
      await tx.documentNumberFormat.create({
        data: {
          tenant_id: tenantId,
          document_type: "PAYMENT",
          prefix: "PAY",
          separator: "/",
          include_year: true,
          include_month: true,
          year_digits: 2,
          sequence_length: 5,
          reset_frequency: "YEARLY",
          is_active: true,
        },
      });
    });
  }

  private async assertParty(
    tx: Prisma.TransactionClient,
    tenantId: string,
    partyId: string,
  ) {
    const party = await tx.party.findFirst({
      where: { id: partyId, tenant_id: tenantId, deleted_at: null },
    });
    if (!party) throw new NotFoundException("Party not found.");
  }

  private async assertAllocationsValid(
    tx: Prisma.TransactionClient,
    tenantId: string,
    direction: PaymentDirection,
    partyId: string,
    allocations: PaymentAllocationInputDto[],
  ) {
    const expectedTypes: InvoiceType[] =
      direction === "RECEIPT"
        ? ["CUSTOMER_INVOICE", "DEBIT_NOTE"]
        : ["PURCHASE_INVOICE"];
    const openStatuses =
      direction === "RECEIPT" ? OPEN_AR_STATUSES : OPEN_AP_STATUSES;

    for (const alloc of allocations) {
      const inv = await tx.invoice.findFirst({
        where: { id: alloc.invoice_id, tenant_id: tenantId, deleted_at: null },
      });
      if (!inv)
        throw new BadRequestException(`Invoice ${alloc.invoice_id} not found.`);
      if (inv.party_id !== partyId) {
        throw new BadRequestException(
          `Invoice ${inv.invoice_number} belongs to a different party.`,
        );
      }
      if (!expectedTypes.includes(inv.invoice_type)) {
        throw new BadRequestException(
          `Invoice ${inv.invoice_number} type ${inv.invoice_type} cannot be allocated to a ${direction}.`,
        );
      }
      if (
        !openStatuses.includes(inv.status) &&
        inv.status !== "PARTIALLY_PAID"
      ) {
        throw new BadRequestException(
          `Invoice ${inv.invoice_number} is not open for payment (${inv.status}).`,
        );
      }
      if (Number(alloc.amount) - Number(inv.balance_due) > 0.0001) {
        throw new BadRequestException(
          `Allocation exceeds balance due on ${inv.invoice_number} (${inv.balance_due}).`,
        );
      }
    }
  }
}
