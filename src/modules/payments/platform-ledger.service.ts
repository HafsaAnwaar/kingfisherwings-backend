import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  forwardRef,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PaymentsService } from "../gl/payments.service";
import { InvoicesService } from "../invoices/invoices.service";
import {
  isPositiveMoney,
  minDecimal,
  roundMoney,
  toDecimal,
} from "./utils/money.util";

const CLAIM_STALE_MS = 5 * 60 * 1000;

/**
 * Books Super Admin → tenant platform invoices into the *existing* ERP
 * accounting of the platform operator's own company (the "platform ledger
 * tenant", PLATFORM_LEDGER_TENANT_ID):
 *
 *   platform invoice sent  → customer Invoice created + posted (existing
 *                            InvoicesService: numbering, AR, revenue, VAT GL)
 *   platform payment       → RECEIPT created + posted with allocation
 *                            (existing gl PaymentsService: voucher, balances)
 *   refund / lost dispute  → receipt cancelled (reversal voucher) and the net
 *                            amount re-posted
 *
 * Each billed tenant is a CUSTOMER party (code PLT-<tenant code>) in that
 * ledger. No accounting is calculated here — only the existing services are
 * called. Every sync is idempotent and claim-guarded; failures are logged
 * and retried by the payment reconciliation job, never blocking billing.
 */
@Injectable()
export class PlatformLedgerService {
  private readonly logger = new Logger(PlatformLedgerService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => InvoicesService))
    private readonly invoices: InvoicesService,
    private readonly glPayments: PaymentsService,
  ) {}

  ledgerTenantId(): string | null {
    const id = process.env.PLATFORM_LEDGER_TENANT_ID?.trim();
    return id && /^[0-9a-f-]{36}$/i.test(id) ? id : null;
  }

  /** Ledger company for Super Admin finance screens; 503 when not set up. */
  async requireLedger() {
    const id = this.ledgerTenantId();
    const tenant = id
      ? await this.prisma.tenant.findFirst({
          where: { id, deleted_at: null },
          select: { id: true, name: true, code: true, base_currency: true },
        })
      : null;
    if (!tenant) {
      throw new ServiceUnavailableException(
        "Platform ledger is not configured. Set PLATFORM_LEDGER_TENANT_ID to the platform operator's company (tenant) id.",
      );
    }
    return tenant;
  }

  // ─────────────────────────── invoices ───────────────────────────

  async syncInvoiceSafe(platformInvoiceId: string) {
    try {
      await this.syncInvoice(platformInvoiceId);
    } catch (err) {
      this.logger.warn(
        `Ledger sync of platform invoice ${platformInvoiceId} failed (will retry): ${this.msg(err)}`,
      );
    }
  }

  /** Creates + posts the ERP invoice for a sent platform invoice (once). */
  async syncInvoice(platformInvoiceId: string) {
    const ledger = this.ledgerTenantId();
    if (!ledger) return;

    const inv = await this.prisma.platformInvoice.findUnique({
      where: { id: platformInvoiceId },
      include: { lines: { orderBy: { sort_order: "asc" } }, tenant: true },
    });
    if (!inv || inv.deleted_at || inv.status === "DRAFT") return;

    if (inv.erp_invoice_id) {
      // A previous run may have stopped between create and post.
      const erp = await this.invoices.findOne(ledger, inv.erp_invoice_id);
      if (erp.status === "DRAFT" && inv.status !== "CANCELLED") {
        await this.invoices.post(ledger, erp.id);
      }
      if (
        inv.status === "CANCELLED" &&
        !["CANCELLED", "VOID"].includes(erp.status)
      ) {
        await this.invoices.cancel(ledger, erp.id);
      }
      return;
    }
    if (inv.status === "CANCELLED") return;

    if (!(await this.claimInvoice(inv.id))) return;
    try {
      const partyId = await this.ensureParty(ledger, inv.tenant);
      const rate = Number(inv.tax_rate);
      const taxable = rate > 0;
      const erp = await this.invoices.create(
        ledger,
        {
          party_id: partyId,
          currency_code: inv.currency_code,
          vat_rate: rate,
          invoice_date: inv.issue_date.toISOString().slice(0, 10),
          due_date: inv.due_date?.toISOString().slice(0, 10),
          lpo_number: inv.invoice_number,
          remarks: inv.notes ?? `Platform invoice ${inv.invoice_number}`,
          internal_notes: `Mirrors platform invoice ${inv.invoice_number} (${inv.id})`,
          lines: [
            ...inv.lines.map((l) => ({
              description: l.description,
              quantity: Number(l.quantity),
              unit_price: Number(l.unit_price),
              is_taxable: taxable,
            })),
            ...(isPositiveMoney(inv.discount_amount)
              ? [
                  {
                    description: "Discount",
                    quantity: 1,
                    unit_price: -Number(inv.discount_amount),
                    is_taxable: taxable,
                  },
                ]
              : []),
          ],
        },
        undefined,
      );
      await this.prisma.platformInvoice.update({
        where: { id: inv.id },
        data: { erp_invoice_id: erp.id },
      });

      // The ERP keeps per-line tax at 4dp; the platform rounds the total to
      // cents. Keep both documents equal so allocations settle exactly.
      const diff = roundMoney(inv.total_amount).minus(
        toDecimal(erp.total_amount),
      );
      if (!diff.isZero()) {
        await this.invoices.addLine(ledger, erp.id, {
          description: "Rounding adjustment",
          quantity: 1,
          unit_price: Number(diff.toFixed(4)),
          is_taxable: false,
        });
      }
      await this.invoices.post(ledger, erp.id);
      this.logger.log(
        `Platform invoice ${inv.invoice_number} booked as ${erp.invoice_number}.`,
      );
    } finally {
      await this.prisma.platformInvoice.update({
        where: { id: inv.id },
        data: { erp_sync_claimed_at: null },
      });
    }
  }

  /** Before editing a sent invoice: cancel its (unpaid) ERP mirror. */
  async resetInvoice(platformInvoiceId: string) {
    const ledger = this.ledgerTenantId();
    const inv = await this.prisma.platformInvoice.findUnique({
      where: { id: platformInvoiceId },
    });
    if (!ledger || !inv?.erp_invoice_id) return;
    const erp = await this.invoices.findOne(ledger, inv.erp_invoice_id);
    if (!["CANCELLED", "VOID"].includes(erp.status)) {
      if (erp.status === "DRAFT") {
        await this.invoices.softDelete(ledger, erp.id);
      } else {
        await this.invoices.cancel(ledger, erp.id);
      }
    }
    await this.prisma.platformInvoice.update({
      where: { id: inv.id },
      data: { erp_invoice_id: null },
    });
  }

  // ─────────────────────────── payments ───────────────────────────

  async syncPaymentSafe(platformPaymentId: string) {
    try {
      await this.syncPayment(platformPaymentId);
    } catch (err) {
      this.logger.warn(
        `Ledger sync of platform payment ${platformPaymentId} failed (will retry): ${this.msg(err)}`,
      );
    }
  }

  /**
   * Makes the ERP receipt match the platform payment's net amount
   * (amount − refunds; 0 until the payment is applied). Re-runnable.
   */
  async syncPayment(platformPaymentId: string) {
    const ledger = this.ledgerTenantId();
    if (!ledger) return;

    let p = await this.prisma.platformPayment.findUnique({
      where: { id: platformPaymentId },
      include: { invoice: true, tenant: true },
    });
    if (!p) return;
    const desired = p.applied_at
      ? Prisma.Decimal.max(
          0,
          toDecimal(p.amount).minus(toDecimal(p.amount_refunded)),
        )
      : toDecimal(0);
    if (
      desired.equals(toDecimal(p.erp_synced_amount)) &&
      (desired.isZero() || p.erp_payment_id)
    ) {
      return;
    }

    await this.syncInvoice(p.platform_invoice_id);
    p = await this.prisma.platformPayment.findUniqueOrThrow({
      where: { id: platformPaymentId },
      include: { invoice: true, tenant: true },
    });
    if (!p.invoice.erp_invoice_id) return; // invoice not booked yet — retried later

    if (!(await this.claimPayment(p.id))) return;
    try {
      if (p.erp_payment_id) {
        const old = await this.glPayments.findOne(ledger, p.erp_payment_id);
        if (old.status === "POSTED")
          await this.glPayments.cancel(ledger, old.id);
        else if (old.status === "DRAFT")
          await this.glPayments.softDelete(ledger, old.id);
        await this.prisma.platformPayment.update({
          where: { id: p.id },
          data: { erp_payment_id: null, erp_synced_amount: 0 },
        });
      }

      let newId: string | null = null;
      if (isPositiveMoney(desired)) {
        const partyId = await this.ensureParty(ledger, p.tenant);
        const erpInv = await this.invoices.findOne(
          ledger,
          p.invoice.erp_invoice_id,
        );
        const open =
          ["POSTED", "SENT", "PARTIALLY_PAID"].includes(erpInv.status) &&
          isPositiveMoney(erpInv.balance_due);
        const allocate = open ? minDecimal(desired, erpInv.balance_due) : null;
        const created = await this.glPayments.create(ledger, {
          direction: "RECEIPT",
          payment_method: p.payment_method,
          party_id: partyId,
          amount: Number(desired.toFixed(4)),
          currency_code: p.currency_code,
          payment_date: (p.payment_date ?? p.paid_at ?? new Date())
            .toISOString()
            .slice(0, 10),
          reference_number: (p.stripe_payment_intent_id
            ? `PLATFORM:${p.stripe_payment_intent_id}`
            : `PLATFORM:${p.reference_number ?? p.id}`
          ).slice(0, 100),
          narration: `Platform invoice ${p.invoice.invoice_number} — ${p.provider === "STRIPE" ? "Stripe" : p.payment_method} payment from ${p.tenant.name}`,
          allocations: allocate
            ? [{ invoice_id: erpInv.id, amount: Number(allocate.toFixed(4)) }]
            : [],
        });
        newId = (await this.glPayments.post(ledger, created.id)).id;
      }
      await this.prisma.platformPayment.update({
        where: { id: p.id },
        data: { erp_payment_id: newId, erp_synced_amount: desired },
      });
    } finally {
      await this.prisma.platformPayment.update({
        where: { id: p.id },
        data: { erp_sync_claimed_at: null },
      });
    }
  }

  /** Reconciler: book anything that is not mirrored yet. */
  async reconcile() {
    const result = { invoices: 0, payments: 0 };
    if (!this.ledgerTenantId()) return result;
    const invoices = await this.prisma.platformInvoice.findMany({
      where: {
        deleted_at: null,
        erp_invoice_id: null,
        status: { in: ["SENT", "PARTIALLY_PAID", "PAID", "REFUNDED"] },
      },
      select: { id: true },
      take: 25,
    });
    for (const i of invoices) {
      await this.syncInvoiceSafe(i.id);
      result.invoices++;
    }
    const payments = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM platform_payments
      WHERE (applied_at IS NOT NULL AND erp_synced_amount <> amount - amount_refunded)
         OR (applied_at IS NULL AND erp_payment_id IS NOT NULL)
      LIMIT 25
    `;
    for (const p of payments) {
      await this.syncPaymentSafe(p.id);
      result.payments++;
    }
    return result;
  }

  // ─────────────────────────── helpers ───────────────────────────

  /** The billed tenant as a CUSTOMER in the ledger company (created once). */
  async ensureParty(
    ledger: string,
    tenant: {
      id: string;
      code: string;
      name: string;
      display_name: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      vat_number: string | null;
      base_currency: string;
    },
  ): Promise<string> {
    const code = `PLT-${tenant.code}`.slice(0, 30);
    return this.prisma.runWithTenant(ledger, async (tx) => {
      const existing = await tx.party.findFirst({
        where: { tenant_id: ledger, code, deleted_at: null },
        select: { id: true },
      });
      if (existing) return existing.id;
      const created = await tx.party.create({
        data: {
          tenant_id: ledger,
          party_type: "CUSTOMER",
          code,
          name: (tenant.display_name ?? tenant.name).slice(0, 300),
          email: tenant.email,
          phone: tenant.phone,
          address: tenant.address,
          vat_number: tenant.vat_number,
          currency_code: tenant.base_currency,
        },
        select: { id: true },
      });
      return created.id;
    });
  }

  /** ERP party id for a billed tenant, if it has been booked already. */
  async partyIdForTenant(ledger: string, tenantCode: string) {
    return this.prisma.runWithTenant(
      ledger,
      async (tx) =>
        (
          await tx.party.findFirst({
            where: {
              tenant_id: ledger,
              code: `PLT-${tenantCode}`.slice(0, 30),
              deleted_at: null,
            },
            select: { id: true },
          })
        )?.id ?? null,
    );
  }

  private async claimInvoice(id: string) {
    const res = await this.prisma.platformInvoice.updateMany({
      where: {
        id,
        erp_invoice_id: null,
        OR: [
          { erp_sync_claimed_at: null },
          {
            erp_sync_claimed_at: { lt: new Date(Date.now() - CLAIM_STALE_MS) },
          },
        ],
      },
      data: { erp_sync_claimed_at: new Date() },
    });
    return res.count === 1;
  }

  private async claimPayment(id: string) {
    const res = await this.prisma.platformPayment.updateMany({
      where: {
        id,
        OR: [
          { erp_sync_claimed_at: null },
          {
            erp_sync_claimed_at: { lt: new Date(Date.now() - CLAIM_STALE_MS) },
          },
        ],
      },
      data: { erp_sync_claimed_at: new Date() },
    });
    return res.count === 1;
  }

  private msg(err: unknown) {
    return err instanceof Error ? err.message : String(err);
  }
}
