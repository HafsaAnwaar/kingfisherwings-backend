import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  JobChargeAttachmentSide,
  JobChargeDrCr,
  JobChargeProrateStatus,
  OpsUploaderSide,
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
  JobInvoiceFormLineDto,
  JobInvoiceFormSaveDto,
  JobInvoiceFromChargesDto,
  SaleSectionDto,
} from "./dto/job-costing.dto";
import { InvoiceAttachmentService } from "../invoices/invoice-attachment.service";
import { stripCostingTabForAudience } from "./utils/job-costing-visibility.util";
import { resolveAutoChargeQuantity } from "./utils/job-charge-quantity.util";

@Injectable()
export class JobCostingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService,
    private readonly vouchers: VouchersService,
    private readonly invoiceAttachments: InvoiceAttachmentService,
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
        sale_invoice_form: true,
        generate_purchase_invoice: true,
        purchase_invoice_form: true,
        vendor_invoice_upload: true,
        generate_bulk_purchase_invoice: true,
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
        sale_invoice_form: `/jobs/${jobId}/invoices/sale/form`,
        purchase_invoice: `/jobs/${jobId}/invoices/purchase`,
        purchase_invoice_form: `/jobs/${jobId}/invoices/purchase/form`,
        bulk_purchase_invoice: `/jobs/${jobId}/invoices/purchase/bulk`,
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
    dto: JobInvoiceFormSaveDto | JobInvoiceFromChargesDto,
    actorId?: string,
    file?: Express.Multer.File,
  ) {
    const form = dto as JobInvoiceFormSaveDto;
    if (form.lines?.length || form.organization_id || form.party_id) {
      return this.saveInvoiceForm(tenantId, jobId, "SALE", form, actorId, file);
    }
    if (form.charge_ids?.length) {
      const inv = await this.invoices.createFromJobSelected(
        tenantId,
        jobId,
        form.charge_ids,
        actorId,
      );
      return this.withDisplayStatus(inv);
    }
    // Prefer form UX — if no charges, open-form path should be used; legacy still tries.
    try {
      const inv = await this.invoices.createFromJob(tenantId, jobId, actorId);
      return this.withDisplayStatus(inv);
    } catch (err) {
      if (
        err instanceof BadRequestException &&
        String(err.message).includes("No uninvoiced billable revenue")
      ) {
        throw new BadRequestException(
          "No uninvoiced billable revenue charges. Open GET …/invoices/sale/form, fill organization and lines, then POST to save.",
        );
      }
      throw err;
    }
  }

  async createPurchaseInvoice(
    tenantId: string,
    jobId: string,
    dto: JobInvoiceFormSaveDto | JobInvoiceFromChargesDto,
    actorId?: string,
    file?: Express.Multer.File,
  ) {
    const form = dto as JobInvoiceFormSaveDto;
    if (form.lines?.length || form.organization_id || form.party_id) {
      return this.saveInvoiceForm(
        tenantId,
        jobId,
        "PURCHASE",
        form,
        actorId,
        file,
      );
    }
    try {
      const inv = await this.invoices.createPurchaseFromJob(
        tenantId,
        jobId,
        form.charge_ids,
        actorId,
      );
      return this.withDisplayStatus(inv);
    } catch (err) {
      if (
        err instanceof BadRequestException &&
        (String(err.message).includes("cost_party_id") ||
          String(err.message).includes("No uninvoiced cost"))
      ) {
        throw new BadRequestException(
          "Cost charges need a vendor or there are no pending cost lines. Open GET …/invoices/purchase/form (prefill from vendor offer when available), fill organization and lines, then POST to save.",
        );
      }
      throw err;
    }
  }

  /**
   * Form-first preview for Generate Purchase Invoice / Vendor Invoice Upload.
   * Never throws for missing vendor or empty cost lines — returns EMPTY source.
   */
  async getPurchaseInvoiceForm(
    tenantId: string,
    jobId: string,
    chargeIds?: string[],
  ) {
    const job = await this.assertJob(tenantId, jobId);
    const lookups = await this.loadInvoiceFormLookups(tenantId, jobId);
    const shipmentNo = lookups.primary_shipment_no;

    const offer = await this.findActiveVendorOffer(tenantId, jobId);
    if (offer) {
      const party = lookups.parties.find((p) => p.id === offer.vendor_party_id);
      const address = await this.partyAddress(tenantId, offer.vendor_party_id);
      const lines =
        offer.lines.length > 0
          ? offer.lines.map((line, idx) => ({
              job_charge_id: null as string | null,
              charge_code_id: null as string | null,
              charge_label: line.description,
              description: line.description,
              shipment_no: shipmentNo,
              unit: "SHPT",
              quantity: Number(line.quantity),
              currency_code: offer.currency_code,
              exchange_rate: 1,
              dr_cr: "DR" as const,
              amount: Number(line.amount),
              fcy_amount: Number(line.amount),
              tax_rate_id: null as string | null,
              pp_cc: null as string | null,
              sort_order: line.sort_order ?? idx,
              editable: true,
            }))
          : [
              {
                job_charge_id: null,
                charge_code_id: null,
                charge_label: "Vendor job offer cost",
                description: "Vendor job offer cost",
                shipment_no: shipmentNo,
                unit: "SHPT",
                quantity: 1,
                currency_code: offer.currency_code,
                exchange_rate: 1,
                dr_cr: "DR" as const,
                amount: Number(offer.cost_total),
                fcy_amount: Number(offer.cost_total),
                tax_rate_id: null,
                pp_cc: null,
                sort_order: 0,
                editable: true,
              },
            ];
      const billAmount = lines.reduce((s, l) => s + l.amount, 0);
      return {
        success: true,
        data: {
          source: "VENDOR_OFFER" as const,
          vendor_quote_id: offer.id,
          header: this.buildInvoiceHeader({
            voucher_type: "PURCHASE_INVOICE",
            job,
            branch_id: job.branch_id,
            company_id: job.company_id,
            organization_id: offer.vendor_party_id,
            organization_name: party?.name ?? null,
            organization_code: party?.code ?? null,
            address,
            currency_code: offer.currency_code,
            exchange_rate: 1,
            bill_amount: billAmount,
            remarks: offer.staff_notes ?? offer.vendor_notes ?? null,
            narration: `Vendor offer ${offer.id.slice(0, 8)}`,
            ref_no: null,
          }),
          pricing_lines: lines,
          lookups,
          actions: {
            save: `/jobs/${jobId}/invoices/purchase`,
            upload_file_field: "file",
          },
        },
      };
    }

    const charges = await this.invoices.findPendingPurchaseCharges(
      tenantId,
      jobId,
      chargeIds,
    );
    if (charges.length) {
      const vendorId =
        charges[0].cost_party_id ?? charges[0].party_id ?? null;
      const party = vendorId
        ? lookups.parties.find((p) => p.id === vendorId)
        : null;
      const address = vendorId
        ? await this.partyAddress(tenantId, vendorId)
        : null;
      const chargeCodes = await this.chargeCodeMap(
        tenantId,
        charges.map((c) => c.charge_code_id),
      );
      const currency =
        charges[0].cost_currency ?? charges[0].currency_code;
      const exRate = Number(
        charges[0].cost_ex_rate ?? charges[0].exchange_rate ?? 1,
      );
      const lines = charges.map((c, idx) => {
        const amount = Number(c.cost_amount ?? c.amount);
        const qty = Number(c.quantity ?? 1);
        const code = chargeCodes.get(c.charge_code_id);
        return {
          job_charge_id: c.id,
          charge_code_id: c.charge_code_id,
          charge_label: code
            ? `${code.code} — ${code.name}`
            : c.description,
          description: c.description,
          shipment_no: shipmentNo,
          unit: c.unit ?? "SHPT",
          quantity: qty,
          currency_code: c.cost_currency ?? c.currency_code,
          exchange_rate: Number(c.cost_ex_rate ?? c.exchange_rate ?? 1),
          dr_cr: (c.cost_dr_cr ?? "DR") as string,
          amount,
          fcy_amount: Number(c.cost_fcy_amount ?? amount),
          tax_rate_id: c.tax_rate_id,
          pp_cc: c.pp_cc,
          sort_order: c.line_no ?? idx,
          editable: true,
        };
      });
      const billAmount = lines.reduce((s, l) => s + l.amount, 0);
      return {
        success: true,
        data: {
          source: "JOB_COSTING" as const,
          vendor_quote_id: null,
          header: this.buildInvoiceHeader({
            voucher_type: "PURCHASE_INVOICE",
            job,
            branch_id: job.branch_id,
            company_id: job.company_id,
            organization_id: vendorId,
            organization_name: party?.name ?? null,
            organization_code: party?.code ?? null,
            address,
            currency_code: currency,
            exchange_rate: exRate,
            bill_amount: billAmount,
            remarks: null,
            narration: null,
            ref_no: charges[0].cost_reference_no ?? null,
          }),
          pricing_lines: lines,
          lookups,
          actions: {
            save: `/jobs/${jobId}/invoices/purchase`,
            upload_file_field: "file",
          },
        },
      };
    }

    return {
      success: true,
      data: {
        source: "EMPTY" as const,
        vendor_quote_id: null,
        header: this.buildInvoiceHeader({
          voucher_type: "PURCHASE_INVOICE",
          job,
          branch_id: job.branch_id,
          company_id: job.company_id,
          organization_id: null,
          organization_name: null,
          organization_code: null,
          address: null,
          currency_code: "AED",
          exchange_rate: 1,
          bill_amount: 0,
          remarks: null,
          narration: null,
          ref_no: null,
        }),
        pricing_lines: [],
        lookups,
        actions: {
          save: `/jobs/${jobId}/invoices/purchase`,
          upload_file_field: "file",
        },
      },
    };
  }

  /**
   * Form-first preview for Generate Sales Invoice.
   * Never throws for missing revenue charges — returns EMPTY source.
   */
  async getSaleInvoiceForm(
    tenantId: string,
    jobId: string,
    chargeIds?: string[],
  ) {
    const job = await this.assertJob(tenantId, jobId);
    const lookups = await this.loadInvoiceFormLookups(tenantId, jobId);
    const shipmentNo = lookups.primary_shipment_no;

    const charges = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCharge.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          is_billable: true,
          is_cost: false,
          is_invoiced: false,
          ...(chargeIds?.length ? { id: { in: chargeIds } } : {}),
          OR: [{ sale_amount: { not: null } }, { is_cost: false }],
        },
        orderBy: [{ line_no: "asc" }, { created_at: "asc" }],
      }),
    );

    const pending = charges.filter(
      (c) => !c.is_cost || c.sale_amount != null,
    );

    if (pending.length) {
      const customerId =
        pending[0].sale_party_id ??
        job.billing_party_id ??
        job.shipper_id ??
        job.consignee_id;
      const party = customerId
        ? lookups.parties.find((p) => p.id === customerId)
        : null;
      const address = customerId
        ? await this.partyAddress(tenantId, customerId)
        : null;
      const chargeCodes = await this.chargeCodeMap(
        tenantId,
        pending.map((c) => c.charge_code_id),
      );
      const currency =
        pending[0].sale_currency ?? pending[0].currency_code;
      const exRate = Number(
        pending[0].sale_ex_rate ?? pending[0].exchange_rate ?? 1,
      );
      const lines = pending.map((c, idx) => {
        const amount = Number(c.sale_amount ?? c.amount);
        const qty = Number(c.sale_qty ?? c.quantity ?? 1);
        const code = chargeCodes.get(c.charge_code_id);
        return {
          job_charge_id: c.id,
          charge_code_id: c.charge_code_id,
          charge_label: code
            ? `${code.code} — ${code.name}`
            : c.description,
          description: c.description,
          shipment_no: shipmentNo,
          unit: c.unit ?? "SHPT",
          quantity: qty,
          currency_code: c.sale_currency ?? c.currency_code,
          exchange_rate: Number(c.sale_ex_rate ?? c.exchange_rate ?? 1),
          dr_cr: (c.sale_dr_cr ?? "CR") as string,
          amount,
          fcy_amount: Number(c.sale_fcy_amount ?? amount),
          tax_rate_id: c.sale_tax_rate_id ?? c.tax_rate_id,
          pp_cc: c.pp_cc,
          sort_order: c.line_no ?? idx,
          editable: true,
        };
      });
      const billAmount = lines.reduce((s, l) => s + l.amount, 0);
      return {
        success: true,
        data: {
          source: "JOB_COSTING" as const,
          header: this.buildInvoiceHeader({
            voucher_type: "SALES_INVOICE",
            job,
            branch_id: job.branch_id,
            company_id: job.company_id,
            organization_id: customerId,
            organization_name: party?.name ?? null,
            organization_code: party?.code ?? null,
            address,
            currency_code: currency,
            exchange_rate: exRate,
            bill_amount: billAmount,
            remarks: null,
            narration: null,
            ref_no: null,
          }),
          pricing_lines: lines,
          lookups,
          actions: { save: `/jobs/${jobId}/invoices/sale` },
        },
      };
    }

    // Fallback: quotation revenue lines linked to this job
    const quoteLines = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const or: Prisma.QuotationWhereInput[] = [
        { converted_job_id: jobId },
      ];
      if (job.created_from_quote_id) {
        or.push({ id: job.created_from_quote_id });
      }
      return tx.quotation.findFirst({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: or,
        },
        include: {
          lines: {
            where: { is_cost: false },
            orderBy: { sort_order: "asc" },
          },
        },
      });
    });

    if (quoteLines?.lines?.length) {
      const customerId =
        quoteLines.customer_id ??
        job.billing_party_id ??
        job.shipper_id ??
        job.consignee_id;
      const party = customerId
        ? lookups.parties.find((p) => p.id === customerId)
        : null;
      const address = customerId
        ? await this.partyAddress(tenantId, customerId)
        : null;
      const lines = quoteLines.lines.map((line, idx) => ({
        job_charge_id: null as string | null,
        charge_code_id: line.charge_code_id,
        charge_label: line.description,
        description: line.description,
        shipment_no: shipmentNo,
        unit: "SHPT",
        quantity: Number(line.quantity),
        currency_code: line.currency_code,
        exchange_rate: Number(line.exchange_rate ?? 1),
        dr_cr: "CR" as const,
        amount: Number(line.amount),
        fcy_amount: Number(line.amount),
        tax_rate_id: line.tax_rate_id,
        pp_cc: null as string | null,
        sort_order: line.sort_order ?? idx,
        editable: true,
      }));
      const billAmount = lines.reduce((s, l) => s + l.amount, 0);
      return {
        success: true,
        data: {
          source: "QUOTATION" as const,
          header: this.buildInvoiceHeader({
            voucher_type: "SALES_INVOICE",
            job,
            branch_id: job.branch_id ?? quoteLines.branch_id,
            company_id: job.company_id ?? quoteLines.company_id,
            organization_id: customerId,
            organization_name: party?.name ?? null,
            organization_code: party?.code ?? null,
            address,
            currency_code: quoteLines.currency_code,
            exchange_rate: 1,
            bill_amount: billAmount,
            remarks: null,
            narration: `From quotation ${quoteLines.quotation_number}`,
            ref_no: quoteLines.quotation_number,
          }),
          pricing_lines: lines,
          lookups,
          actions: { save: `/jobs/${jobId}/invoices/sale` },
        },
      };
    }

    return {
      success: true,
      data: {
        source: "EMPTY" as const,
        header: this.buildInvoiceHeader({
          voucher_type: "SALES_INVOICE",
          job,
          branch_id: job.branch_id,
          company_id: job.company_id,
          organization_id:
            job.billing_party_id ?? job.shipper_id ?? job.consignee_id,
          organization_name: null,
          organization_code: null,
          address: null,
          currency_code: "AED",
          exchange_rate: 1,
          bill_amount: 0,
          remarks: null,
          narration: null,
          ref_no: null,
        }),
        pricing_lines: [],
        lookups,
        actions: { save: `/jobs/${jobId}/invoices/sale` },
      },
    };
  }

  async saveInvoiceForm(
    tenantId: string,
    jobId: string,
    side: "PURCHASE" | "SALE",
    dto: JobInvoiceFormSaveDto,
    actorId?: string,
    file?: Express.Multer.File,
  ) {
    await this.assertJob(tenantId, jobId);
    const partyId = dto.organization_id ?? dto.party_id;
    if (!partyId) {
      throw new BadRequestException(
        "organization (organization_id / party_id) is required.",
      );
    }
    if (!dto.lines?.length) {
      throw new BadRequestException(
        "lines are required — add at least one pricing row.",
      );
    }
    if (!dto.currency_code) {
      throw new BadRequestException("currency_code is required.");
    }

    for (const [i, line] of dto.lines.entries()) {
      if (line.amount == null || Number.isNaN(Number(line.amount))) {
        throw new BadRequestException(`lines[${i}].amount is required.`);
      }
    }

    if (side === "PURCHASE" && dto.vendor_quote_id) {
      await this.syncVendorQuoteCostToJobCharges(
        tenantId,
        dto.vendor_quote_id,
        actorId,
      );
    }

    const invoiceType =
      side === "PURCHASE" ? "PURCHASE_INVOICE" : "CUSTOMER_INVOICE";
    const notesParts = [
      dto.narration ? `narration=${dto.narration}` : null,
      dto.gl_date ? `gl_date=${dto.gl_date}` : null,
      dto.books ? `books=${dto.books}` : null,
      dto.voucher_type ? `voucher_type=${dto.voucher_type}` : null,
    ].filter(Boolean);

    const createDto = {
      party_id: partyId,
      job_id: jobId,
      company_id: dto.company_id,
      branch_id: dto.branch_id,
      vendor_quote_id: dto.vendor_quote_id,
      currency_code: dto.currency_code,
      exchange_rate: dto.exchange_rate ?? 1,
      invoice_date: dto.v_date,
      remarks: dto.remarks,
      lpo_number: dto.ref_no,
      internal_notes: notesParts.length
        ? notesParts.join("; ")
        : undefined,
      lines: dto.lines.map((line, index) =>
        this.formLineToInvoiceLine(line, jobId, index),
      ),
    };

    const invoice =
      side === "PURCHASE"
        ? await this.invoices.createPurchaseInvoice(
            tenantId,
            createDto,
            actorId,
          )
        : await this.invoices.create(tenantId, createDto, actorId);

    if (file?.buffer?.length && actorId) {
      await this.invoiceAttachments.upload(tenantId, invoice.id, file, {
        userId: actorId,
        side: OpsUploaderSide.STAFF,
      });
    }

    return this.withDisplayStatus(invoice);
  }

  /**
   * Fresa Generate Bulk PI dialog: vouchers + pending cost lines grouped by vendor.
   */
  async previewBulkPurchaseInvoice(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);

    const vouchersRes = await this.listVouchers(tenantId, jobId);
    const charges = await this.invoices.findPendingPurchaseCharges(
      tenantId,
      jobId,
    );

    const vendorIds = [
      ...new Set(
        charges
          .map((c) => c.cost_party_id ?? c.party_id)
          .filter((id): id is string => !!id),
      ),
    ];

    const [parties, shipments, jobMeta] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) => {
        const partyRows = vendorIds.length
          ? await tx.party.findMany({
              where: { tenant_id: tenantId, id: { in: vendorIds } },
              select: { id: true, name: true, code: true },
            })
          : [];
        const shipmentRows = await tx.shipment.findMany({
          where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          orderBy: { created_at: "asc" },
          select: {
            shipment_number: true,
            mbl_number: true,
            hbl_number: true,
          },
        });
        const job = await tx.job.findFirst({
          where: { id: jobId, tenant_id: tenantId, deleted_at: null },
          select: {
            job_number: true,
            sea_fcl_details: {
              select: { mbl_number: true, hbl_number: true },
            },
            sea_lcl_details: {
              select: { mbl_number: true, hbl_number: true },
            },
            air_details: {
              select: { mawb_number: true, hawb_number: true },
            },
            nvocc_details: {
              select: { mbl_number: true, hbl_number: true },
            },
          },
        });
        return [partyRows, shipmentRows, job] as const;
      },
    );

    const partyMap = new Map(parties.map((p) => [p.id, p]));
    const primaryShipment = shipments[0] ?? null;
    const blNo =
      primaryShipment?.mbl_number ??
      primaryShipment?.hbl_number ??
      jobMeta?.sea_fcl_details?.mbl_number ??
      jobMeta?.sea_lcl_details?.mbl_number ??
      jobMeta?.nvocc_details?.mbl_number ??
      jobMeta?.air_details?.mawb_number ??
      jobMeta?.sea_fcl_details?.hbl_number ??
      jobMeta?.sea_lcl_details?.hbl_number ??
      jobMeta?.air_details?.hawb_number ??
      null;
    const shipmentNo =
      primaryShipment?.shipment_number ?? jobMeta?.job_number ?? null;

    type Group = {
      vendor_id: string | null;
      vendor_name: string | null;
      reference_no: string | null;
      currency: string;
      lines: Array<{
        charge_id: string;
        shipment_no: string | null;
        bl_no: string | null;
        line_no: number | null;
        description: string;
        quantity: number | null;
        unit: string | null;
        currency: string;
        ex_rate: number;
        amount: number;
        fcy_amount: number | null;
        amount_local: number;
        ofd_type: string | null;
        pp_cc: string | null;
        remarks: string | null;
      }>;
      shipment_total: number;
      group_total: number;
    };

    const groupsMap = new Map<string, Group>();
    for (const c of charges) {
      const vendorId = c.cost_party_id ?? c.party_id ?? null;
      const currency = c.cost_currency ?? c.currency_code;
      const key = `${vendorId ?? "none"}::${currency}`;
      const amount = Number(c.cost_amount ?? c.amount);
      const exRate = Number(c.cost_ex_rate ?? c.exchange_rate ?? 1);
      const fcy =
        c.cost_fcy_amount != null ? Number(c.cost_fcy_amount) : null;
      const amountLocal = Math.round(amount * exRate * 10000) / 10000;
      const party = vendorId ? partyMap.get(vendorId) : null;
      const ref = c.cost_reference_no ?? null;

      let group = groupsMap.get(key);
      if (!group) {
        group = {
          vendor_id: vendorId,
          vendor_name: party?.name ?? null,
          reference_no: ref,
          currency,
          lines: [],
          shipment_total: 0,
          group_total: 0,
        };
        groupsMap.set(key, group);
      } else if (!group.reference_no && ref) {
        group.reference_no = ref;
      }

      group.lines.push({
        charge_id: c.id,
        shipment_no: shipmentNo,
        bl_no: blNo,
        line_no: c.line_no,
        description: c.description,
        quantity: c.quantity != null ? Number(c.quantity) : null,
        unit: c.unit,
        currency,
        ex_rate: exRate,
        amount,
        fcy_amount: fcy,
        amount_local: amountLocal,
        ofd_type: c.ofd_type,
        pp_cc: c.pp_cc,
        remarks: c.cost_remarks ?? c.remarks,
      });
      group.shipment_total += amountLocal;
      group.group_total += amountLocal;
    }

    const groups = [...groupsMap.values()];
    const grand_total = groups.reduce((s, g) => s + g.group_total, 0);

    return {
      success: true,
      data: {
        vouchers: vouchersRes.data,
        groups,
        grand_total,
      },
    };
  }

  async createBulkPurchaseInvoice(
    tenantId: string,
    jobId: string,
    dto: JobInvoiceFromChargesDto,
    actorId?: string,
  ) {
    const invoices = await this.invoices.createBulkPurchaseFromJob(
      tenantId,
      jobId,
      dto.charge_ids,
      actorId,
    );
    return { success: true, data: { invoices } };
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
          id: true,
          gl_revenue_account_id: true,
          gl_cost_account_id: true,
        },
      }),
    );
    const mapped =
      side === "SALE"
        ? code?.gl_revenue_account_id ?? null
        : code?.gl_cost_account_id ?? null;
    if (mapped) return mapped;

    // Demo / ops safety: fall back to seeded Freight Revenue (4100) / Freight Cost (5100)
    // and backfill the charge code so voucher generate does not hard-fail.
    const fallback = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const preferredCodes =
        side === "SALE" ? ["4100", "4200"] : ["5100", "6100"];
      let account =
        (await tx.chartOfAccount.findFirst({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            is_active: true,
            is_postable: true,
            account_code: { in: preferredCodes },
          },
          orderBy: { account_code: "asc" },
        })) ??
        (await tx.chartOfAccount.findFirst({
          where: {
            tenant_id: tenantId,
            deleted_at: null,
            is_active: true,
            is_postable: true,
            account_group: side === "SALE" ? "REVENUE" : "EXPENSES",
          },
          orderBy: { account_code: "asc" },
        }));

      if (!account || !code?.id) return account?.id ?? null;

      await tx.chargeCode.update({
        where: { id: code.id },
        data:
          side === "SALE"
            ? { gl_revenue_account_id: account.id }
            : { gl_cost_account_id: account.id },
      });
      return account.id;
    });

    return fallback;
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

  private withDisplayStatus<T extends { status?: string }>(invoice: T) {
    return {
      ...invoice,
      display_status:
        invoice.status === "DRAFT" ? ("CREATE" as const) : invoice.status,
    };
  }

  private formLineToInvoiceLine(
    line: JobInvoiceFormLineDto,
    jobId: string,
    index: number,
  ) {
    const qty = line.quantity ?? 1;
    const amount = Number(line.amount);
    const unitPrice = qty > 0 ? amount / qty : amount;
    return {
      description: line.description?.trim() || "Charge",
      quantity: qty,
      unit_price: unitPrice,
      charge_code_id: line.charge_code_id,
      tax_rate_id: line.tax_rate_id,
      sort_order: index,
      job_charge_id: line.job_charge_id,
      job_id: jobId,
    };
  }

  private buildInvoiceHeader(input: {
    voucher_type: string;
    job: {
      id: string;
      job_number: string;
      branch_id: string | null;
      company_id: string | null;
    };
    branch_id: string | null;
    company_id: string | null;
    organization_id: string | null;
    organization_name: string | null;
    organization_code: string | null;
    address: string | null;
    currency_code: string;
    exchange_rate: number;
    bill_amount: number;
    remarks: string | null;
    narration: string | null;
    ref_no: string | null;
  }) {
    const today = new Date().toISOString().slice(0, 10);
    return {
      job_id: input.job.id,
      job_number: input.job.job_number,
      branch_id: input.branch_id,
      company_id: input.company_id,
      voucher_type: input.voucher_type,
      v_date: today,
      gl_date: today,
      exchange_rate: input.exchange_rate,
      bill_amount: input.bill_amount,
      remarks: input.remarks,
      books: null as string | null,
      organization_id: input.organization_id,
      organization_name: input.organization_name,
      organization_code: input.organization_code,
      address: input.address,
      currency_code: input.currency_code,
      narration: input.narration,
      ref_no: input.ref_no,
    };
  }

  private async loadInvoiceFormLookups(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [branches, parties, taxRates, currencies, shipments, job] =
        await Promise.all([
          tx.branch.findMany({
            where: { tenant_id: tenantId, deleted_at: null, is_active: true },
            select: { id: true, code: true, name: true },
            take: 200,
            orderBy: { name: "asc" },
          }),
          tx.party.findMany({
            where: { tenant_id: tenantId, deleted_at: null, is_active: true },
            select: {
              id: true,
              code: true,
              name: true,
              party_type: true,
            },
            take: 500,
            orderBy: { name: "asc" },
          }),
          tx.taxRate.findMany({
            where: { tenant_id: tenantId, deleted_at: null, is_active: true },
            select: { id: true, name: true, rate: true, code: true },
            take: 100,
            orderBy: { name: "asc" },
          }),
          tx.currency.findMany({
            where: { tenant_id: tenantId, deleted_at: null, is_active: true },
            select: { code: true, name: true },
            take: 100,
            orderBy: { code: "asc" },
          }),
          tx.shipment.findMany({
            where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
            select: { shipment_number: true },
            orderBy: { created_at: "asc" },
            take: 20,
          }),
          tx.job.findFirst({
            where: { id: jobId, tenant_id: tenantId },
            select: { job_number: true },
          }),
        ]);

      return {
        branches,
        parties,
        tax_groups: taxRates.map((t) => ({
          id: t.id,
          code: t.code,
          name: t.name,
          rate: Number(t.rate),
        })),
        currencies,
        voucher_types: ["PURCHASE_INVOICE", "SALES_INVOICE"],
        books: [] as { id: string; name: string }[],
        shipments: shipments.map((s) => s.shipment_number),
        primary_shipment_no:
          shipments[0]?.shipment_number ?? job?.job_number ?? null,
      };
    });
  }

  private async partyAddress(tenantId: string, partyId: string) {
    const addr = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyAddress.findFirst({
        where: {
          tenant_id: tenantId,
          party_id: partyId,
          deleted_at: null,
        },
        orderBy: [{ is_default: "desc" }, { created_at: "asc" }],
      }),
    );
    if (!addr) return null;
    return [
      addr.address_line1,
      addr.address_line2,
      addr.city,
      addr.state,
      addr.postal_code,
      addr.country_code,
    ]
      .filter(Boolean)
      .join(", ");
  }

  private async chargeCodeMap(tenantId: string, ids: string[]) {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length)
      return new Map<string, { code: string; name: string }>();
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chargeCode.findMany({
        where: { tenant_id: tenantId, id: { in: unique }, deleted_at: null },
        select: { id: true, code: true, description: true },
      }),
    );
    return new Map(
      rows.map((r) => [r.id, { code: r.code, name: r.description }]),
    );
  }

  private async findActiveVendorOffer(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorQuote.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          status: {
            in: ["SENT", "NEGOTIATING", "VENDOR_REVIEW", "PRICED", "APPROVED"],
          },
        },
        include: { lines: { orderBy: { sort_order: "asc" } } },
        orderBy: [{ updated_at: "desc" }, { created_at: "desc" }],
      }),
    );
  }

  /**
   * Keep job costing sale amounts in sync with quotation revenue lines
   * after every negotiation round (customer or admin).
   */
  async syncQuotationRevenueToJobCharges(
    tenantId: string,
    quotationId: string,
    actorId?: string,
  ) {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quotation = await tx.quotation.findFirst({
        where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: {
            where: { is_cost: false },
            orderBy: { sort_order: "asc" },
          },
        },
      });
      if (!quotation) return;

      let jobId = quotation.converted_job_id;
      if (!jobId) {
        const job = await tx.job.findFirst({
          where: {
            tenant_id: tenantId,
            created_from_quote_id: quotationId,
            deleted_at: null,
          },
          select: { id: true },
        });
        jobId = job?.id ?? null;
      }
      if (!jobId || !quotation.lines.length) return;

      const existing = await tx.jobCharge.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          is_cost: false,
        },
        orderBy: [{ line_no: "asc" }, { created_at: "asc" }],
      });

      let revenue = 0;
      for (const [idx, line] of quotation.lines.entries()) {
        const amount = Number(line.amount);
        const qty = Number(line.quantity);
        const unitPrice = Number(line.unit_price);
        revenue += amount;
        const match =
          existing.find(
            (c) =>
              c.charge_code_id === line.charge_code_id &&
              (c.line_no == null || c.line_no === idx + 1),
          ) ??
          existing.find((c) => c.charge_code_id === line.charge_code_id);

        if (match) {
          await tx.jobCharge.update({
            where: { id: match.id },
            data: {
              description: line.description,
              quantity: qty,
              unit_price: unitPrice,
              amount,
              amount_base_currency: amount,
              currency_code: line.currency_code,
              exchange_rate: line.exchange_rate,
              tax_rate_id: line.tax_rate_id,
              tax_amount: line.tax_amount,
              sale_amount: amount,
              sale_qty: qty,
              sale_currency: line.currency_code,
              sale_ex_rate: line.exchange_rate,
              sale_fcy_amount: amount,
              sale_tax_amount: line.tax_amount,
              sale_tax_rate_id: line.tax_rate_id,
              sale_dr_cr: "CR",
              line_no: idx + 1,
              updated_by: actorId,
            },
          });
        } else {
          await tx.jobCharge.create({
            data: {
              tenant_id: tenantId,
              job_id: jobId,
              charge_code_id: line.charge_code_id,
              description: line.description,
              quantity: qty,
              unit_price: unitPrice,
              currency_code: line.currency_code,
              exchange_rate: line.exchange_rate,
              amount,
              amount_base_currency: amount,
              tax_rate_id: line.tax_rate_id,
              tax_amount: line.tax_amount,
              is_billable: true,
              is_cost: false,
              sale_amount: amount,
              sale_qty: qty,
              sale_currency: line.currency_code,
              sale_ex_rate: line.exchange_rate,
              sale_fcy_amount: amount,
              sale_tax_amount: line.tax_amount,
              sale_tax_rate_id: line.tax_rate_id,
              sale_dr_cr: "CR",
              sale_party_id: quotation.customer_id,
              party_id: quotation.customer_id,
              line_no: idx + 1,
              created_by: actorId,
              updated_by: actorId,
            },
          });
        }
      }

      const costAgg = await tx.jobCharge.aggregate({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          OR: [{ is_cost: true }, { cost_amount: { not: null } }],
        },
        _sum: { cost_amount: true, amount: true },
      });
      const costTotal = Number(
        costAgg._sum.cost_amount ?? costAgg._sum.amount ?? 0,
      );
      const gp = revenue - costTotal;
      await tx.job.update({
        where: { id: jobId },
        data: {
          revenue_total: revenue,
          cost_total: costTotal,
          gp_amount: gp,
          gp_percent: revenue > 0 ? (gp / revenue) * 100 : 0,
          updated_by: actorId,
        },
      });
    });
  }

  /**
   * Keep job costing cost amounts in sync with vendor quote lines
   * after every job-offer negotiation round.
   */
  async syncVendorQuoteCostToJobCharges(
    tenantId: string,
    vendorQuoteId: string,
    actorId?: string,
  ) {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const quote = await tx.vendorQuote.findFirst({
        where: {
          id: vendorQuoteId,
          tenant_id: tenantId,
          deleted_at: null,
        },
        include: { lines: { orderBy: { sort_order: "asc" } } },
      });
      if (!quote || !quote.lines.length) return;

      const existing = await tx.jobCharge.findMany({
        where: {
          tenant_id: tenantId,
          job_id: quote.job_id,
          deleted_at: null,
          OR: [
            { cost_party_id: quote.vendor_party_id },
            {
              is_cost: true,
              party_id: quote.vendor_party_id,
            },
          ],
        },
        orderBy: [{ line_no: "asc" }, { created_at: "asc" }],
      });

      // Prefer a default charge code for vendor lines without one
      const defaultCode = await tx.chargeCode.findFirst({
        where: { tenant_id: tenantId, deleted_at: null, is_active: true },
        orderBy: { code: "asc" },
        select: { id: true },
      });
      if (!defaultCode) return;

      let costTotal = 0;
      for (const [idx, line] of quote.lines.entries()) {
        const amount = Number(line.amount);
        const qty = Number(line.quantity);
        const unitPrice = Number(line.unit_price);
        costTotal += amount;
        const match =
          existing.find(
            (c) =>
              c.description === line.description &&
              (c.line_no == null || c.line_no === idx + 1),
          ) ?? existing[idx];

        if (match) {
          await tx.jobCharge.update({
            where: { id: match.id },
            data: {
              description: line.description,
              quantity: qty,
              unit_price: unitPrice,
              amount,
              amount_base_currency: amount,
              currency_code: quote.currency_code,
              is_cost: true,
              cost_party_id: quote.vendor_party_id,
              cost_amount: amount,
              cost_currency: quote.currency_code,
              cost_ex_rate: 1,
              cost_fcy_amount: amount,
              cost_dr_cr: "DR",
              line_no: idx + 1,
              updated_by: actorId,
            },
          });
        } else {
          await tx.jobCharge.create({
            data: {
              tenant_id: tenantId,
              job_id: quote.job_id,
              charge_code_id: defaultCode.id,
              description: line.description,
              quantity: qty,
              unit_price: unitPrice,
              currency_code: quote.currency_code,
              exchange_rate: 1,
              amount,
              amount_base_currency: amount,
              is_billable: false,
              is_cost: true,
              party_id: quote.vendor_party_id,
              cost_party_id: quote.vendor_party_id,
              cost_amount: amount,
              cost_currency: quote.currency_code,
              cost_ex_rate: 1,
              cost_fcy_amount: amount,
              cost_dr_cr: "DR",
              line_no: idx + 1,
              created_by: actorId,
              updated_by: actorId,
            },
          });
        }
      }

      const saleAgg = await tx.jobCharge.aggregate({
        where: {
          tenant_id: tenantId,
          job_id: quote.job_id,
          deleted_at: null,
          is_cost: false,
        },
        _sum: { sale_amount: true, amount: true },
      });
      const revenue = Number(
        saleAgg._sum.sale_amount ?? saleAgg._sum.amount ?? 0,
      );
      const gp = revenue - costTotal;
      await tx.job.update({
        where: { id: quote.job_id },
        data: {
          cost_total: costTotal,
          revenue_total: revenue,
          gp_amount: gp,
          gp_percent: revenue > 0 ? (gp / revenue) * 100 : 0,
          updated_by: actorId,
        },
      });
    });
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
  PartyType.VENDOR,
  PartyType.SHIPPING_LINE,
  PartyType.AIRLINE,
  PartyType.OVERSEAS_AGENT,
  PartyType.CFS_PORT_AGENT,
];
