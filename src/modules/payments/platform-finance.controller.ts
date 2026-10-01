import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { AllowSuperAdmin } from "../../common/decorators/allow-super-admin.decorator";
import { SuperAdminGuard } from "../auth/guards/super-admin.guard";
import { CurrentSuperAdminUser } from "../auth/decorators/current-super-admin.decorator";
import { ArApService } from "../gl/ar-ap.service";
import { FinancialReportsService } from "../gl/financial-reports.service";
import { PaymentsService as GlPaymentsService } from "../gl/payments.service";
import { VouchersService } from "../gl/vouchers.service";
import {
  AgingQueryDto,
  CreatePaymentDto,
  PaymentQueryDto,
} from "../gl/dto/ar-ap.dto";
import { TrialBalanceQueryDto, VoucherQueryDto } from "../gl/dto/gl.dto";
import {
  AsOfReportQueryDto,
  ReportPeriodQueryDto,
} from "../gl/dto/financial-reports.dto";
import { InvoicesService } from "../invoices/invoices.service";
import {
  CreatePurchaseInvoiceDto,
  InvoiceQueryDto,
} from "../invoices/dto/invoice.dto";
import { PaymentProofsService } from "../invoices/payment-proofs/payment-proofs.service";
import {
  ApprovePaymentProofDto,
  ReviewPaymentProofDto,
} from "../invoices/payment-proofs/payment-proofs.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformLedgerService } from "./platform-ledger.service";
import { roundMoney, toDecimal } from "./utils/money.util";

/**
 * Super Admin finance — the platform operator's books.
 *
 * The platform keeps its accounts in the existing ERP of one company, the
 * platform ledger tenant (PLATFORM_LEDGER_TENANT_ID). Platform invoices and
 * their payments are booked there automatically (PlatformLedgerService),
 * so AR, AP, GL, vouchers and reports below are the *existing* tenant
 * finance services pointed at that company — no separate accounting.
 * Every route requires a Super Admin token.
 */
@ApiTags("Platform Finance (Super Admin)")
@ApiBearerAuth()
@AllowSuperAdmin()
@UseGuards(SuperAdminGuard)
@Controller("platform/finance")
export class PlatformFinanceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: PlatformLedgerService,
    private readonly arAp: ArApService,
    private readonly reports: FinancialReportsService,
    private readonly glPayments: GlPaymentsService,
    private readonly vouchers: VouchersService,
    private readonly invoices: InvoicesService,
    private readonly proofs: PaymentProofsService,
  ) {}

  @Get("status")
  @ApiOperation({ summary: "Platform ledger configuration" })
  async status() {
    const id = this.ledger.ledgerTenantId();
    const tenant = id
      ? await this.prisma.tenant.findFirst({
          where: { id, deleted_at: null },
          select: { id: true, name: true, code: true, base_currency: true },
        })
      : null;
    const unbooked = await this.prisma.platformInvoice.count({
      where: {
        deleted_at: null,
        erp_invoice_id: null,
        status: { in: ["SENT", "PARTIALLY_PAID", "PAID", "REFUNDED"] },
      },
    });
    return {
      success: true,
      data: {
        configured: Boolean(tenant),
        ledger_company: tenant,
        invoices_awaiting_booking: unbooked,
        message: tenant
          ? "Platform invoices and payments are booked in this company's books."
          : "Set PLATFORM_LEDGER_TENANT_ID to the platform operator's company to enable AR/AP/GL.",
      },
    };
  }

  // ─── Accounts receivable (platform invoices issued to tenants) ───

  @Get("receivables")
  @ApiQuery({ name: "tenant_id", required: false })
  @ApiQuery({
    name: "status",
    required: false,
    description: "outstanding | paid | partially_paid | overdue",
  })
  @ApiOperation({
    summary: "Receivables by tenant",
    description:
      "Tenant, invoice, dates, amount, paid, outstanding, status, last payment method/date, and the " +
      "ledger invoice number. Amounts are those maintained by the billing/payment flow.",
  })
  async receivables(
    @Query("tenant_id") tenantId?: string,
    @Query("status") status?: string,
  ) {
    const where: Prisma.PlatformInvoiceWhereInput = {
      deleted_at: null,
      status: { notIn: ["DRAFT", "CANCELLED"] },
      ...(tenantId && /^[0-9a-f-]{36}$/i.test(tenantId)
        ? { tenant_id: tenantId }
        : {}),
      ...(status === "paid" ? { status: "PAID" } : {}),
      ...(status === "partially_paid" ? { status: "PARTIALLY_PAID" } : {}),
      ...(status === "outstanding"
        ? { status: { in: ["SENT", "PARTIALLY_PAID"] } }
        : {}),
      ...(status === "overdue"
        ? {
            status: { in: ["SENT", "PARTIALLY_PAID"] },
            due_date: { lt: new Date() },
          }
        : {}),
    };
    const rows = await this.prisma.platformInvoice.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true, code: true } },
        payments: {
          where: { applied_at: { not: null } },
          orderBy: { paid_at: "desc" },
          take: 1,
          select: {
            payment_method: true,
            provider: true,
            paid_at: true,
            payment_date: true,
          },
        },
      },
      orderBy: [{ due_date: "asc" }, { issue_date: "asc" }],
      take: 500,
    });
    const erpNumbers = await this.erpInvoiceNumbers(
      rows.map((r) => r.erp_invoice_id).filter((x): x is string => Boolean(x)),
    );
    const now = Date.now();
    const data = rows.map((r) => {
      const last = r.payments[0];
      const open = ["SENT", "PARTIALLY_PAID"].includes(r.status);
      return {
        tenant: r.tenant,
        invoice_id: r.id,
        invoice_number: r.invoice_number,
        ledger_invoice_number: r.erp_invoice_id
          ? (erpNumbers.get(r.erp_invoice_id) ?? null)
          : null,
        invoice_date: r.issue_date,
        due_date: r.due_date,
        currency_code: r.currency_code,
        invoice_amount: roundMoney(r.total_amount).toFixed(2),
        paid_amount: roundMoney(r.amount_paid).toFixed(2),
        outstanding_amount: roundMoney(r.balance_due).toFixed(2),
        status: r.status,
        is_overdue: open && !!r.due_date && r.due_date.getTime() < now,
        days_overdue:
          open && r.due_date && r.due_date.getTime() < now
            ? Math.floor((now - r.due_date.getTime()) / 86_400_000)
            : 0,
        payment_method: last
          ? last.provider === "STRIPE"
            ? "STRIPE"
            : last.payment_method
          : null,
        payment_date: last ? (last.payment_date ?? last.paid_at) : null,
      };
    });

    const totals = new Map<
      string,
      {
        invoiced: Prisma.Decimal;
        collected: Prisma.Decimal;
        outstanding: Prisma.Decimal;
        overdue: Prisma.Decimal;
      }
    >();
    for (const r of rows) {
      const t = totals.get(r.currency_code) ?? {
        invoiced: toDecimal(0),
        collected: toDecimal(0),
        outstanding: toDecimal(0),
        overdue: toDecimal(0),
      };
      t.invoiced = t.invoiced.plus(r.total_amount);
      t.collected = t.collected.plus(r.amount_paid);
      t.outstanding = t.outstanding.plus(r.balance_due);
      if (
        ["SENT", "PARTIALLY_PAID"].includes(r.status) &&
        r.due_date &&
        r.due_date.getTime() < now
      ) {
        t.overdue = t.overdue.plus(r.balance_due);
      }
      totals.set(r.currency_code, t);
    }
    const pending = await this.prisma.platformPayment.count({
      where: { status: { in: ["PENDING_VERIFICATION", "PROCESSING"] } },
    });
    return {
      success: true,
      data,
      summary: {
        by_currency: [...totals].map(([currency, t]) => ({
          currency_code: currency,
          invoiced: roundMoney(t.invoiced).toFixed(2),
          collected: roundMoney(t.collected).toFixed(2),
          outstanding: roundMoney(t.outstanding).toFixed(2),
          overdue: roundMoney(t.overdue).toFixed(2),
        })),
        pending_payments: pending,
      },
    };
  }

  @Get("ar/aging")
  @ApiOperation({
    summary: "AR aging (existing aging report on the platform ledger)",
  })
  async arAging(@Query() query: AgingQueryDto) {
    return this.arAp.arAging((await this.ledger.requireLedger()).id, query);
  }

  @Get("ar/open-items")
  @ApiQuery({ name: "party_id", required: false })
  @ApiOperation({ summary: "Open receivables" })
  async arOpenItems(@Query("party_id") partyId?: string) {
    return this.arAp.arOpenItems((await this.ledger.requireLedger()).id, {
      party_id: partyId,
    });
  }

  @Get("ar/tenant/:tenantId/statement")
  @ApiOperation({
    summary: "AR statement for one tenant (its customer account in the ledger)",
  })
  async tenantStatement(
    @Param("tenantId", ParseUUIDPipe) tenantId: string,
    @Query() query: AgingQueryDto,
  ) {
    const ledger = await this.ledger.requireLedger();
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { code: true },
    });
    const partyId = tenant
      ? await this.ledger.partyIdForTenant(ledger.id, tenant.code)
      : null;
    if (!partyId)
      throw new NotFoundException("No ledger account for this tenant yet.");
    return this.arAp.partyStatement(ledger.id, partyId, query, "AR");
  }

  @Get("ar/statement/:partyId")
  @ApiOperation({ summary: "AR statement for a ledger customer" })
  async arStatement(
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.arAp.partyStatement(
      (await this.ledger.requireLedger()).id,
      partyId,
      query,
      "AR",
    );
  }

  // ─── Accounts payable (platform's own vendor bills) ───

  @Get("ap/aging")
  @ApiOperation({ summary: "AP aging" })
  async apAging(@Query() query: AgingQueryDto) {
    return this.arAp.apAging((await this.ledger.requireLedger()).id, query);
  }

  @Get("ap/open-items")
  @ApiQuery({ name: "party_id", required: false })
  @ApiOperation({ summary: "Open payables (vendor balances)" })
  async apOpenItems(@Query("party_id") partyId?: string) {
    return this.arAp.apOpenItems((await this.ledger.requireLedger()).id, {
      party_id: partyId,
    });
  }

  @Get("ap/statement/:partyId")
  @ApiOperation({ summary: "AP statement for a vendor" })
  async apStatement(
    @Param("partyId", ParseUUIDPipe) partyId: string,
    @Query() query: AgingQueryDto,
  ) {
    return this.arAp.partyStatement(
      (await this.ledger.requireLedger()).id,
      partyId,
      query,
      "AP",
    );
  }

  @Get("vendor-bills")
  @ApiOperation({ summary: "Vendor bills (purchase invoices)" })
  async vendorBills(@Query() query: InvoiceQueryDto) {
    return this.invoices.findAll(
      (await this.ledger.requireLedger()).id,
      query,
      "PURCHASE_INVOICE",
    );
  }

  @Post("vendor-bills")
  @ApiOperation({ summary: "Record a vendor bill (draft purchase invoice)" })
  async createVendorBill(
    @Body() dto: CreatePurchaseInvoiceDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.invoices.createPurchaseInvoice(
      (await this.ledger.requireLedger()).id,
      dto,
      superAdminId,
    );
  }

  // ─── Invoices (customer + vendor) ───

  @Get("invoices")
  @ApiOperation({
    summary: "Ledger invoices (filter invoice_type, status, party)",
  })
  async listInvoices(@Query() query: InvoiceQueryDto) {
    return this.invoices.findAll((await this.ledger.requireLedger()).id, query);
  }

  @Get("invoices/:id")
  @ApiOperation({ summary: "Ledger invoice detail (lines, balances)" })
  async invoice(@Param("id", ParseUUIDPipe) id: string) {
    return this.invoices.findOne((await this.ledger.requireLedger()).id, id);
  }

  @Post("invoices/:id/post")
  @ApiOperation({
    summary: "Post a draft ledger invoice / vendor bill to the GL",
  })
  async postInvoice(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.invoices.post(
      (await this.ledger.requireLedger()).id,
      id,
      superAdminId,
    );
  }

  @Get("invoices/:id/payment-proofs")
  @ApiOperation({
    summary:
      "Payment proofs on a ledger invoice (e.g. vendor remittance proof)",
  })
  async invoiceProofs(@Param("id", ParseUUIDPipe) id: string) {
    return this.proofs.listForInvoice(
      (await this.ledger.requireLedger()).id,
      id,
    );
  }

  @Patch("payment-proofs/:id/approve")
  @ApiOperation({
    summary: "Approve a proof — records the payment through the existing flow",
  })
  async approveProof(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ApprovePaymentProofDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.proofs.approve(
      (await this.ledger.requireLedger()).id,
      id,
      dto,
      superAdminId,
    );
  }

  @Patch("payment-proofs/:id/reject")
  @ApiOperation({ summary: "Reject a proof" })
  async rejectProof(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReviewPaymentProofDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.proofs.review(
      (await this.ledger.requireLedger()).id,
      id,
      "REJECTED",
      dto.review_notes,
      superAdminId,
    );
  }

  // ─── Payments / receipts / vouchers ───

  @Get("payments")
  @ApiOperation({
    summary:
      "Receipts and payments (direction=RECEIPT|PAYMENT) with allocations",
  })
  async payments(@Query() query: PaymentQueryDto) {
    return this.glPayments.findAll(
      (await this.ledger.requireLedger()).id,
      query,
    );
  }

  @Get("payments/:id")
  @ApiOperation({ summary: "Payment detail (allocations, voucher)" })
  async payment(@Param("id", ParseUUIDPipe) id: string) {
    return this.glPayments.findOne((await this.ledger.requireLedger()).id, id);
  }

  @Post("payments")
  @ApiOperation({
    summary: "Record a payment / receipt with allocations (draft)",
    description:
      "Same rules as /gl/payments — e.g. pay a vendor bill (direction PAYMENT).",
  })
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.glPayments.create(
      (await this.ledger.requireLedger()).id,
      dto,
      superAdminId,
    );
  }

  @Post("payments/:id/post")
  @ApiOperation({
    summary: "Post a draft payment (creates the payment/receipt voucher)",
  })
  async postPayment(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentSuperAdminUser("id") superAdminId: string,
  ) {
    return this.glPayments.post(
      (await this.ledger.requireLedger()).id,
      id,
      superAdminId,
    );
  }

  @Get("vouchers")
  @ApiOperation({ summary: "GL vouchers (receipt, payment, journal …)" })
  async listVouchers(@Query() query: VoucherQueryDto) {
    return this.vouchers.findAll((await this.ledger.requireLedger()).id, query);
  }

  @Get("vouchers/:id")
  @ApiOperation({ summary: "Voucher detail with lines" })
  async voucher(@Param("id", ParseUUIDPipe) id: string) {
    return this.vouchers.findOne((await this.ledger.requireLedger()).id, id);
  }

  // ─── Financial reports ───

  @Get("reports/trial-balance")
  @ApiOperation({ summary: "Trial balance" })
  async trialBalance(@Query() query: TrialBalanceQueryDto) {
    return this.reports.trialBalance(
      (await this.ledger.requireLedger()).id,
      query,
    );
  }

  @Get("reports/balance-sheet")
  @ApiOperation({ summary: "Balance sheet" })
  async balanceSheet(@Query() query: AsOfReportQueryDto) {
    return this.reports.balanceSheet(
      (await this.ledger.requireLedger()).id,
      query,
    );
  }

  @Get("reports/profit-and-loss")
  @ApiOperation({ summary: "Profit & loss" })
  async profitAndLoss(@Query() query: ReportPeriodQueryDto) {
    return this.reports.profitAndLoss(
      (await this.ledger.requireLedger()).id,
      query,
    );
  }

  @Get("reports/cash-flow")
  @ApiOperation({ summary: "Cash flow" })
  async cashFlow(@Query() query: ReportPeriodQueryDto) {
    return this.reports.cashFlow((await this.ledger.requireLedger()).id, query);
  }

  private async erpInvoiceNumbers(ids: string[]) {
    const ledger = this.ledger.ledgerTenantId();
    const map = new Map<string, string>();
    if (!ledger || !ids.length) return map;
    const rows = await this.prisma.runWithTenant(ledger, (tx) =>
      tx.invoice.findMany({
        where: { tenant_id: ledger, id: { in: ids } },
        select: { id: true, invoice_number: true },
      }),
    );
    rows.forEach((r) => map.set(r.id, r.invoice_number));
    return map;
  }
}
