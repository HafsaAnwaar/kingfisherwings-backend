import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  JobChargeAttachmentSide,
  JobChargeDrCr,
  JobChargeProrateStatus,
  PartyType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { InvoicesService } from "../invoices/invoices.service";
import { VouchersService } from "../gl/vouchers.service";
import {
  CompositeJobChargeDto,
  CostSectionDto,
  CostingVisibilityAudience,
  GenerateJobVoucherDto,
  GetJobChargesFromShipmentDto,
  JobInvoiceFromChargesDto,
  SaleSectionDto,
} from "./dto/job-costing.dto";
import { stripCostingTabForAudience } from "./utils/job-costing-visibility.util";
import { resolveAutoChargeQuantity } from "./utils/job-charge-quantity.util";

@Injectable()
export class JobCostingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService,
    private readonly vouchers: VouchersService,
  ) {}

  async getTab(
    tenantId: string,
    jobId: string,
    audience: CostingVisibilityAudience = "STAFF",
  ) {
    const job = await this.assertJob(tenantId, jobId);
    const charges = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCharge.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: [{ line_no: "asc" }, { created_at: "asc" }],
        include: {
          attachments: { where: { deleted_at: null } },
          sale_voucher: { select: { id: true, voucher_number: true } },
          cost_voucher: { select: { id: true, voucher_number: true } },
          revisions: { select: { id: true }, take: 1 },
        },
      }),
    );

    const revCounts = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobChargeRevision.groupBy({
        by: ["job_charge_id"],
        where: { tenant_id: tenantId, job_id: jobId },
        _count: { _all: true },
      }),
    );
    const revMap = new Map(
      revCounts.map((r) => [r.job_charge_id, r._count._all]),
    );

    const vouchers = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.voucher.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: "desc" },
        take: 50,
        select: {
          id: true,
          voucher_number: true,
          voucher_type: true,
          status: true,
          voucher_date: true,
          total_debit: true,
          total_credit: true,
        },
      }),
    );

    const lines = charges.map((c) => this.mapGridLine(c, revMap.get(c.id) ?? 0));
    const payload = {
      revenue_total: job.revenue_total,
      cost_total: job.cost_total,
      gp_amount: job.gp_amount,
      gp_percent: job.gp_percent,
      lines,
      vouchers,
      actions: {
        profit_share: true,
        sale: true,
        cost: true,
        charges: true,
        get_charges: true,
        get_job_charges: true,
        add: true,
        generate_prorate: true,
        vouchers_list: true,
        generate_voucher: true,
        generate_sale_invoice: true,
        generate_purchase_invoice: true,
        job_profit_sheet: true,
        job_profit_sheet_custom_duty: true,
        costing_history: true,
      },
      path_hints: {
        composite_add: `/jobs/${jobId}/charges/composite`,
        get_charges: `/jobs/${jobId}/get-charges`,
        get_job_charges: `/jobs/${jobId}/get-job-charges`,
        profit_share_preview: `/jobs/${jobId}/profit-share/preview`,
        profit_share_add: `/jobs/${jobId}/profit-share/add`,
        profit_share_calculator: `/jobs/${jobId}/profit-share/calculator`,
        profit_share_accounts: `/jobs/${jobId}/profit-share/accounts`,
        vouchers: `/jobs/${jobId}/vouchers`,
        generate_voucher: `/jobs/${jobId}/vouchers/generate`,
        sale_invoice: `/jobs/${jobId}/invoices/sale`,
        purchase_invoice: `/jobs/${jobId}/invoices/purchase`,
        pnl: `/jobs/${jobId}/pnl`,
        pnl_custom_duty: `/jobs/${jobId}/pnl/custom-duty`,
        history: `/jobs/${jobId}/charges/history`,
        prorate: `/jobs/${jobId}/prorate-to-shipments`,
        gpum: `/jobs/${jobId}/gpum`,
      },
    };

    return {
      success: true,
      data: stripCostingTabForAudience(payload, audience),
    };
  }

  async listCharges(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    const charges = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCharge.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: [{ line_no: "asc" }, { created_at: "asc" }],
        include: {
          attachments: { where: { deleted_at: null } },
          sale_voucher: { select: { id: true, voucher_number: true } },
          cost_voucher: { select: { id: true, voucher_number: true } },
        },
      }),
    );
    const revCounts = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobChargeRevision.groupBy({
        by: ["job_charge_id"],
        where: { tenant_id: tenantId, job_id: jobId },
        _count: { _all: true },
      }),
    );
    const revMap = new Map(
      revCounts.map((r) => [r.job_charge_id, r._count._all]),
    );
    return {
      success: true,
      data: charges.map((c) => this.mapGridLine(c, revMap.get(c.id) ?? 0)),
    };
  }

  async addComposite(
    tenantId: string,
    jobId: string,
    dto: CompositeJobChargeDto,
    actorId?: string,
  ) {
    if (!dto.sale && !dto.cost) {
      throw new BadRequestException(
        "Provide at least a sale or cost section.",
      );
    }
    await this.assertJob(tenantId, jobId);

    const row = await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertChargeCode(tx, tenantId, dto.charge.charge_code_id);
      const chargeCode = await tx.chargeCode.findFirst({
        where: { id: dto.charge.charge_code_id, tenant_id: tenantId },
      });
      const quantity = await resolveAutoChargeQuantity(
        tx,
        tenantId,
        jobId,
        chargeCode?.unit ?? dto.charge.unit,
        dto.charge.quantity,
      );
      const lineNo =
        dto.charge.line_no ?? (await this.nextLineNo(tx, tenantId, jobId));

      const sale = dto.sale;
      const cost = dto.cost;
      const hasSale = !!sale && (sale.amount != null || sale.fcy_amount != null);
      const hasCost = !!cost && (cost.amount != null || cost.fcy_amount != null);

      const saleAmount = Number(sale?.amount ?? sale?.fcy_amount ?? 0);
      const costAmount = Number(cost?.amount ?? cost?.fcy_amount ?? 0);
      const saleEx = Number(sale?.ex_rate ?? 1);
      const costEx = Number(cost?.ex_rate ?? 1);
      const gp =
        sale?.gross_profit ??
        saleAmount * saleEx - costAmount * costEx;

      // Legacy mirrors: prefer sale when present else cost
      const isCostOnly = hasCost && !hasSale;
      const unitPrice = isCostOnly
        ? costAmount / (quantity || 1)
        : saleAmount / (quantity || 1);
      const currency =
        (isCostOnly ? cost?.currency : sale?.currency) ?? "AED";
      const exchangeRate = isCostOnly ? costEx : saleEx;
      const amount = isCostOnly ? costAmount : saleAmount;
      const amountBase = amount * exchangeRate;

      const created = await tx.jobCharge.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          charge_code_id: dto.charge.charge_code_id,
          description: dto.charge.description,
          quantity,
          unit_price: unitPrice,
          currency_code: currency,
          exchange_rate: exchangeRate,
          amount,
          amount_base_currency: amountBase,
          tax_rate_id: sale?.tax_rate_id,
          tax_amount: Number(sale?.tax_amount ?? 0),
          is_cost: isCostOnly,
          is_provisional: dto.is_provisional ?? false,
          is_billable: hasSale,
          party_id: hasSale ? sale?.bill_to : cost?.vendor,
          line_no: lineNo,
          unit: dto.charge.unit ?? chargeCode?.unit ?? null,
          remarks: dto.charge.remarks,
          pp_cc: dto.charge.pp_cc,
          ofd_type: dto.charge.ofd_type,
          ...this.saleFields(sale),
          ...this.costFields(cost),
          gp_amount: gp,
          freight_flag: chargeCode?.charge_group === "FREIGHT",
          visible_to_customer: hasSale,
          visible_to_vendor: hasCost,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      await this.writeRevision(tx, tenantId, jobId, created.id, "CREATE", null, created, actorId);
      await this.recalculateTotals(tx, tenantId, jobId);
      return created;
    });

    return {
      success: true,
      data: row,
      can_save_and_close: true,
      can_save_and_stay: true,
    };
  }

  async patchSale(
    tenantId: string,
    jobId: string,
    chargeId: string,
    dto: SaleSectionDto,
    actorId?: string,
  ) {
    return this.patchSide(tenantId, jobId, chargeId, { sale: dto }, actorId);
  }

  async patchCost(
    tenantId: string,
    jobId: string,
    chargeId: string,
    dto: CostSectionDto,
    actorId?: string,
  ) {
    return this.patchSide(tenantId, jobId, chargeId, { cost: dto }, actorId);
  }

  async getJobChargesFromShipment(
    tenantId: string,
    jobId: string,
    dto: GetJobChargesFromShipmentDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    if (dto.type !== "SHIPMENT") {
      throw new BadRequestException('type must be "SHIPMENT".');
    }
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: {
          id: dto.shipment_id,
          tenant_id: tenantId,
          deleted_at: null,
          OR: [{ job_id: jobId }, { job_id: null }],
        },
        include: {
          charges: { where: { deleted_at: null } },
        },
      }),
    );
    if (!shipment) throw new NotFoundException("Shipment not found.");

    let charges = shipment.charges;
    if (dto.charge_ids?.length) {
      const set = new Set(dto.charge_ids);
      charges = charges.filter((c) => set.has(c.id));
    }

    const preview = charges.map((c) => ({
      id: c.id,
      charge_code_id: c.charge_code_id,
      description: c.description,
      quantity: c.quantity,
      unit_price: c.unit_price,
      currency_code: c.currency_code,
      amount: c.amount,
      is_cost: c.is_cost,
      is_billable: c.is_billable,
    }));

    if (!dto.confirm) {
      return {
        success: true,
        data: { preview, confirm_required: true, shipment_id: shipment.id },
      };
    }

    const created = [];
    for (const c of charges) {
      if (!c.charge_code_id) continue;
      const composite: CompositeJobChargeDto = {
        charge: {
          charge_code_id: c.charge_code_id,
          description: c.description,
          quantity: Number(c.quantity),
        },
        ...(c.is_cost
          ? {
              cost: {
                amount: Number(c.amount),
                currency: c.currency_code,
                ex_rate: Number(c.exchange_rate),
                vendor: c.party_id ?? undefined,
                dr_cr: JobChargeDrCr.DR,
              },
            }
          : {
              sale: {
                amount: Number(c.amount),
                qty: Number(c.quantity),
                currency: c.currency_code,
                ex_rate: Number(c.exchange_rate),
                tax_amount: Number(c.tax_amount),
                tax_rate_id: c.tax_rate_id ?? undefined,
                bill_to: c.party_id ?? undefined,
                dr_cr: JobChargeDrCr.CR,
              },
            }),
        is_provisional: c.is_provisional,
      };
      const res = await this.addComposite(tenantId, jobId, composite, actorId);
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.jobCharge.update({
          where: { id: (res.data as { id: string }).id },
          data: { synced_from_shipment_charge_id: c.id },
        }),
      );
      created.push(res.data);
    }

    return {
      success: true,
      data: { lines: created, confirm_required: false },
      message: `Added ${created.length} charge(s) from shipment.`,
    };
  }

  async listVouchers(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    const data = await this.vouchers.findAll(tenantId, { job_id: jobId });
    return { success: true, data };
  }

  async generateVoucher(
    tenantId: string,
    jobId: string,
    dto: GenerateJobVoucherDto,
    actorId?: string,
  ) {
    const job = await this.assertJob(tenantId, jobId);
    const side = dto.side ?? "SALE";
    const charges = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCharge.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          id: { in: dto.charge_ids },
          deleted_at: null,
        },
      }),
    );
    if (!charges.length) {
      throw new BadRequestException("No matching charges found.");
    }

    const currency =
      dto.currency_code ??
      (side === "SALE"
        ? charges[0].sale_currency
        : charges[0].cost_currency) ??
      charges[0].currency_code;

    const lines = [];
    let total = 0;
    for (const [i, c] of charges.entries()) {
      const amt =
        side === "SALE"
          ? Number(c.sale_amount ?? c.amount)
          : Number(c.cost_amount ?? c.amount);
      total += amt;
      const accountId = await this.resolveChargeGlAccount(
        tenantId,
        c.charge_code_id,
        side,
      );
      if (!accountId) {
        throw new BadRequestException(
          `Charge ${c.description} has no GL ${side === "SALE" ? "revenue" : "cost"} account on charge code.`,
        );
      }
      const isDebit =
        side === "COST" ||
        (side === "SALE" && c.sale_dr_cr === JobChargeDrCr.DR);
      lines.push({
        account_id: accountId,
        line_no: i + 1,
        debit_amount: isDebit ? amt : 0,
        credit_amount: isDebit ? 0 : amt,
        currency_code: currency,
        exchange_rate:
          side === "SALE"
            ? Number(c.sale_ex_rate ?? c.exchange_rate)
            : Number(c.cost_ex_rate ?? c.exchange_rate),
        narration: c.description,
        party_id:
          side === "SALE"
            ? c.sale_party_id ?? c.party_id
            : c.cost_party_id ?? c.party_id,
        job_id: jobId,
      });
    }

    // Balance using AR (sale) / AP (cost) control accounts when unbalanced
    const debitSum = lines.reduce((s, l) => s + Number(l.debit_amount), 0);
    const creditSum = lines.reduce((s, l) => s + Number(l.credit_amount), 0);
    if (Math.abs(debitSum - creditSum) > 0.0001) {
      const balAccount =
        (await this.resolveControlAccount(
          tenantId,
          side === "SALE" ? "TRADE_RECEIVABLE" : "TRADE_PAYABLE",
        )) ??
        (await this.resolveChargeGlAccount(
          tenantId,
          charges[0].charge_code_id,
          side === "SALE" ? "COST" : "SALE",
        ));
      if (!balAccount) {
        throw new BadRequestException(
          "Cannot balance voucher: missing AR/AP control account or opposing charge GL.",
        );
      }
      const diff = Math.abs(debitSum - creditSum);
      const partyId =
        side === "SALE"
          ? charges[0].sale_party_id ?? job.billing_party_id
          : charges[0].cost_party_id;
      lines.push({
        account_id: balAccount,
        line_no: lines.length + 1,
        debit_amount: debitSum < creditSum ? diff : 0,
        credit_amount: debitSum > creditSum ? diff : 0,
        currency_code: currency,
        exchange_rate: 1,
        narration:
          side === "SALE"
            ? "Trade receivable balancing"
            : "Trade payable balancing",
        party_id: partyId,
        job_id: jobId,
      });
    }

    const voucher = await this.vouchers.create(
      tenantId,
      {
        voucher_type: dto.voucher_type,
        voucher_date: new Date().toISOString().slice(0, 10),
        currency_code: currency!,
        exchange_rate: 1,
        narration:
          dto.narration ??
          `Job ${job.job_number} ${side.toLowerCase()} charges`,
        job_id: jobId,
        party_id:
          side === "SALE"
            ? charges[0].sale_party_id ?? job.billing_party_id ?? undefined
            : charges[0].cost_party_id ?? undefined,
        company_id: job.company_id ?? undefined,
        branch_id: job.branch_id ?? undefined,
        lines,
      } as never,
      actorId,
    );

    const voucherId =
      (voucher as { data?: { id: string }; id?: string }).data?.id ??
      (voucher as { id?: string }).id;

    if (voucherId) {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.jobCharge.updateMany({
          where: { id: { in: charges.map((c) => c.id) } },
          data:
            side === "SALE"
              ? { sale_voucher_id: voucherId, updated_by: actorId }
              : { cost_voucher_id: voucherId, updated_by: actorId },
        }),
      );
    }

    if (dto.auto_post && voucherId) {
      const posted = await this.vouchers.post(tenantId, voucherId, actorId);
      return {
        success: true,
        data: posted,
        posted: true,
        message: "Voucher generated and posted.",
      };
    }

    return {
      success: true,
      data: voucher,
      posted: false,
      message: dto.auto_post
        ? "Draft created but could not resolve voucher id for posting."
        : "Draft voucher created.",
    };
  }

  async createSaleInvoice(
    tenantId: string,
    jobId: string,
    dto: JobInvoiceFromChargesDto,
    actorId?: string,
  ) {
    if (dto.charge_ids?.length) {
      return this.invoices.createFromJobSelected(
        tenantId,
        jobId,
        dto.charge_ids,
        actorId,
      );
    }
    return this.invoices.createFromJob(tenantId, jobId, actorId);
  }

  async createPurchaseInvoice(
    tenantId: string,
    jobId: string,
    dto: JobInvoiceFromChargesDto,
    actorId?: string,
  ) {
    return this.invoices.createPurchaseFromJob(
      tenantId,
      jobId,
      dto.charge_ids,
      actorId,
    );
  }

  async getHistory(tenantId: string, jobId: string, chargeId?: string) {
    await this.assertJob(tenantId, jobId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobChargeRevision.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          ...(chargeId ? { job_charge_id: chargeId } : {}),
        },
        orderBy: { created_at: "desc" },
        take: 500,
      }),
    );
    return { success: true, data: rows };
  }

  async getCustomDutyPnl(tenantId: string, jobId: string) {
    const job = await this.assertJob(tenantId, jobId);
    const charges = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const rows = await tx.jobCharge.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          is_provisional: false,
        },
      });
      const codes = await tx.chargeCode.findMany({
        where: {
          tenant_id: tenantId,
          id: { in: rows.map((r) => r.charge_code_id) },
        },
        select: { id: true, charge_group: true, code: true, description: true },
      });
      const codeMap = new Map(codes.map((c) => [c.id, c]));
      return rows.map((r) => ({
        ...r,
        charge_group: codeMap.get(r.charge_code_id)?.charge_group,
        charge_code: codeMap.get(r.charge_code_id)?.code,
      }));
    });

    const duty = charges.filter(
      (c) =>
        c.charge_group === "CUSTOMS" ||
        /duty|customs|vat.?import/i.test(c.description) ||
        /duty|customs/i.test(c.charge_code ?? ""),
    );
    const other = charges.filter((c) => !duty.includes(c));

    const sumSale = (rows: typeof charges) =>
      rows.reduce(
        (s, c) =>
          s +
          Number(c.sale_amount ?? (!c.is_cost ? c.amount_base_currency : 0)) *
            (c.sale_amount != null ? Number(c.sale_ex_rate ?? 1) : 1),
        0,
      );
    const sumCost = (rows: typeof charges) =>
      rows.reduce(
        (s, c) =>
          s +
          Number(c.cost_amount ?? (c.is_cost ? c.amount_base_currency : 0)) *
            (c.cost_amount != null ? Number(c.cost_ex_rate ?? 1) : 1),
        0,
      );

    const dutySale = sumSale(duty);
    const dutyCost = sumCost(duty);
    const otherSale = sumSale(other);
    const otherCost = sumCost(other);

    return {
      success: true,
      data: {
        job_id: jobId,
        job_number: job.job_number,
        custom_duty: {
          lines: duty,
          sale_total: dutySale,
          cost_total: dutyCost,
          gp: dutySale - dutyCost,
        },
        other_charges: {
          sale_total: otherSale,
          cost_total: otherCost,
          gp: otherSale - otherCost,
        },
        job_totals: {
          revenue_total: job.revenue_total,
          cost_total: job.cost_total,
          gp_amount: job.gp_amount,
          gp_percent: job.gp_percent,
        },
        document_hint: {
          type: "JOB_PNL_CUSTOM_DUTY",
          path: `/jobs/${jobId}/documents/job-pnl-custom-duty`,
        },
      },
    };
  }

  async recordRevisionOnLegacyMutate(
    tenantId: string,
    jobId: string,
    chargeId: string,
    action: string,
    before: unknown,
    after: unknown,
    actorId?: string,
  ) {
    await this.prisma.runWithTenant(tenantId, (tx) =>
      this.writeRevision(tx, tenantId, jobId, chargeId, action, before, after, actorId),
    );
  }

  // --- helpers ---

  private async patchSide(
    tenantId: string,
    jobId: string,
    chargeId: string,
    parts: { sale?: SaleSectionDto; cost?: CostSectionDto },
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobCharge.findFirst({
        where: {
          id: chargeId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException("Charge line not found.");

      const sale = parts.sale;
      const cost = parts.cost;
      const nextSaleAmt =
        sale?.amount != null
          ? Number(sale.amount)
          : existing.sale_amount != null
            ? Number(existing.sale_amount)
            : 0;
      const nextCostAmt =
        cost?.amount != null
          ? Number(cost.amount)
          : existing.cost_amount != null
            ? Number(existing.cost_amount)
            : 0;
      const saleEx = Number(
        sale?.ex_rate ?? existing.sale_ex_rate ?? existing.exchange_rate ?? 1,
      );
      const costEx = Number(
        cost?.ex_rate ?? existing.cost_ex_rate ?? existing.exchange_rate ?? 1,
      );

      const data: Prisma.JobChargeUpdateInput = {
        ...(sale ? this.saleFields(sale) : {}),
        ...(cost ? this.costFields(cost) : {}),
        gp_amount: nextSaleAmt * saleEx - nextCostAmt * costEx,
        visible_to_customer:
          nextSaleAmt > 0 || existing.sale_amount != null,
        visible_to_vendor: nextCostAmt > 0 || existing.cost_amount != null,
        updated_by: actorId,
      };

      // Keep legacy mirrors in sync when patching the "primary" side
      if (sale?.amount != null && !existing.is_cost) {
        data.amount = sale.amount;
        data.amount_base_currency = sale.amount * saleEx;
        data.unit_price =
          sale.amount / Number(existing.quantity || 1);
        data.currency_code = sale.currency ?? existing.currency_code;
        data.exchange_rate = saleEx;
        data.tax_amount = sale.tax_amount ?? existing.tax_amount;
        if (sale.bill_to) data.party_id = sale.bill_to;
      }
      if (cost?.amount != null && existing.is_cost) {
        data.amount = cost.amount;
        data.amount_base_currency = cost.amount * costEx;
        data.unit_price =
          cost.amount / Number(existing.quantity || 1);
        data.currency_code = cost.currency ?? existing.currency_code;
        data.exchange_rate = costEx;
        if (cost.vendor) data.party_id = cost.vendor;
      }

      const row = await tx.jobCharge.update({
        where: { id: chargeId },
        data,
      });
      await this.writeRevision(
        tx,
        tenantId,
        jobId,
        chargeId,
        sale ? "PATCH_SALE" : "PATCH_COST",
        existing,
        row,
        actorId,
      );
      await this.recalculateTotals(tx, tenantId, jobId);
      return row;
    });
    return { success: true, data: updated };
  }

  private saleFields(sale?: SaleSectionDto) {
    if (!sale) return {} as const;
    return {
      sale_party_id: sale.bill_to,
      sale_dr_cr: sale.dr_cr,
      sale_amount: sale.amount ?? sale.fcy_amount,
      sale_qty: sale.qty,
      sale_tax_amount: sale.tax_amount,
      sale_tax_rate_id: sale.tax_rate_id,
      sale_tax_group_code: sale.tax_group_code,
      sale_currency: sale.currency,
      sale_ex_rate: sale.ex_rate ?? 1,
      sale_fcy_amount: sale.fcy_amount ?? sale.amount,
      sale_taxable_amount: sale.taxable_amount ?? sale.amount,
      sale_remarks: sale.remarks,
      sale_editable: sale.editable ?? true,
    };
  }

  private costFields(cost?: CostSectionDto) {
    if (!cost) return {} as const;
    return {
      cost_party_id: cost.vendor,
      cost_dr_cr: cost.dr_cr,
      cost_amount: cost.amount ?? cost.fcy_amount,
      cost_tax_amount: cost.tax_amount,
      cost_currency: cost.currency,
      cost_ex_rate: cost.ex_rate ?? 1,
      cost_fcy_amount: cost.fcy_amount ?? cost.amount,
      cost_declaration_no: cost.declaration_no,
      cost_declaration_date: cost.declaration_date
        ? new Date(cost.declaration_date)
        : undefined,
      cost_reference_no: cost.reference_no,
      cost_date: cost.date ? new Date(cost.date) : undefined,
      cost_remarks: cost.remarks,
      cost_editable: cost.editable ?? true,
    };
  }

  private mapGridLine(
    c: Prisma.JobChargeGetPayload<{
      include: {
        attachments: true;
        sale_voucher: { select: { id: true; voucher_number: true } };
        cost_voucher: { select: { id: true; voucher_number: true } };
      };
    }> & { revisions?: { id: string }[] },
    historyCount: number,
  ) {
    const saleAtt = (c.attachments ?? []).filter(
      (a) => a.side === JobChargeAttachmentSide.SALE,
    );
    const costAtt = (c.attachments ?? []).filter(
      (a) => a.side === JobChargeAttachmentSide.COST,
    );
    return {
      id: c.id,
      line_no: c.line_no,
      description: c.description,
      unit: c.unit,
      charge: {
        charge_code_id: c.charge_code_id,
        quantity: c.quantity,
        remarks: c.remarks,
        pp_cc: c.pp_cc,
        ofd_type: c.ofd_type,
        is_provisional: c.is_provisional,
        is_profit_share: c.is_profit_share,
      },
      sale: c.sale_amount != null || !c.is_cost
        ? {
            bill_to: c.sale_party_id,
            amount: c.sale_amount ?? (!c.is_cost ? c.amount : null),
            tax_amount: c.sale_tax_amount ?? (!c.is_cost ? c.tax_amount : null),
            dr_cr: c.sale_dr_cr,
            editable: c.sale_editable,
            currency: c.sale_currency ?? c.currency_code,
            ex_rate: c.sale_ex_rate ?? c.exchange_rate,
            fcy_amount: c.sale_fcy_amount,
            taxable_amount: c.sale_taxable_amount,
            remarks: c.sale_remarks,
            attachments: saleAtt,
            voucher_no: c.sale_voucher?.voucher_number ?? null,
            gross_profit: c.gp_amount,
          }
        : null,
      cost: c.cost_amount != null || c.is_cost
        ? {
            vendor: c.cost_party_id ?? c.party_id,
            amount: c.cost_amount ?? (c.is_cost ? c.amount : null),
            tax_amount: c.cost_tax_amount,
            dr_cr: c.cost_dr_cr,
            editable: c.cost_editable,
            currency: c.cost_currency ?? c.currency_code,
            ex_rate: c.cost_ex_rate ?? c.exchange_rate,
            fcy_amount: c.cost_fcy_amount,
            declaration_no: c.cost_declaration_no,
            declaration_date: c.cost_declaration_date,
            reference_no: c.cost_reference_no,
            date: c.cost_date,
            remarks: c.cost_remarks,
            attachments: costAtt,
            voucher_no: c.cost_voucher?.voucher_number ?? null,
          }
        : null,
      gp: c.gp_amount,
      freight: c.freight_flag,
      prorated_status: c.prorate_status ?? JobChargeProrateStatus.NONE,
      history_count: historyCount,
      sale_voucher_no: c.sale_voucher?.voucher_number ?? null,
      cost_voucher_no: c.cost_voucher?.voucher_number ?? null,
      attachment_count: (c.attachments ?? []).length,
    };
  }

  private async nextLineNo(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
  ) {
    const max = await tx.jobCharge.aggregate({
      where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
      _max: { line_no: true },
    });
    return (max._max.line_no ?? 0) + 1;
  }

  private async writeRevision(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    chargeId: string,
    action: string,
    before: unknown,
    after: unknown,
    actorId?: string,
  ) {
    await tx.jobChargeRevision.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        job_charge_id: chargeId,
        action,
        before_json: (before ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        after_json: (after ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        actor_id: actorId,
      },
    });
  }

  private async recalculateTotals(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
  ) {
    const charges = await tx.jobCharge.findMany({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        deleted_at: null,
        is_provisional: false,
      },
    });
    let revenue = 0;
    let cost = 0;
    for (const c of charges) {
      if (c.sale_amount != null) {
        revenue += Number(c.sale_amount) * Number(c.sale_ex_rate ?? 1);
      } else if (!c.is_cost) {
        revenue += Number(c.amount_base_currency);
      }
      if (c.cost_amount != null) {
        cost += Number(c.cost_amount) * Number(c.cost_ex_rate ?? 1);
      } else if (c.is_cost) {
        cost += Number(c.amount_base_currency);
      }
    }
    const gp = revenue - cost;
    await tx.job.update({
      where: { id: jobId },
      data: {
        revenue_total: revenue,
        cost_total: cost,
        gp_amount: gp,
        gp_percent: revenue > 0 ? (gp / revenue) * 100 : 0,
      },
    });
  }

  private async resolveChargeGlAccount(
    tenantId: string,
    chargeCodeId: string,
    side: "SALE" | "COST",
  ) {
    const code = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chargeCode.findFirst({
        where: { id: chargeCodeId, tenant_id: tenantId },
        select: {
          gl_revenue_account_id: true,
          gl_cost_account_id: true,
        },
      }),
    );
    return side === "SALE"
      ? code?.gl_revenue_account_id ?? null
      : code?.gl_cost_account_id ?? null;
  }

  private async resolveControlAccount(
    tenantId: string,
    subType: "TRADE_RECEIVABLE" | "TRADE_PAYABLE",
  ) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chartOfAccount.findFirst({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          is_active: true,
          account_sub_type: subType,
        },
        orderBy: { account_code: "asc" },
      }),
    );
    return row?.id ?? null;
  }

  private async assertChargeCode(
    tx: Prisma.TransactionClient,
    tenantId: string,
    id: string,
  ) {
    const row = await tx.chargeCode.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
    });
    if (!row) throw new NotFoundException("Charge code not found.");
    return row;
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }
}

/** Allowed party types for profit-share agent (Fresa: Carrier / Agent / Supplier). */
export const PROFIT_SHARE_AGENT_TYPES: PartyType[] = [
  PartyType.AGENT,
  PartyType.SUPPLIER,
  PartyType.SHIPPING_LINE,
  PartyType.AIRLINE,
  PartyType.OVERSEAS_AGENT,
  PartyType.CFS_PORT_AGENT,
];
