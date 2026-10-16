import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobChargeDrCr, PartyType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ChartOfAccountsService } from "../gl/chart-of-accounts.service";
import { JobCostingService, PROFIT_SHARE_AGENT_TYPES } from "./job-costing.service";
import {
  ProfitShareAccountsQueryDto,
  ProfitShareAddDto,
  ProfitShareCalculatorWeightsDto,
  ProfitShareDeclaredLineDto,
  ProfitSharePreviewDto,
} from "./dto/job-costing.dto";

@Injectable()
export class JobProfitShareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly costing: JobCostingService,
    private readonly chartOfAccounts: ChartOfAccountsService,
  ) {}

  async preview(tenantId: string, jobId: string, dto: ProfitSharePreviewDto) {
    await this.assertJob(tenantId, jobId);
    await this.assertChargeCode(tenantId, dto.charge_code_id);

    const { saleTotal, costTotal, sourceLines, declaredSaleLines, declaredCostLines } =
      await this.computeBase(tenantId, jobId);
    const calculator = await this.loadCalculatorWeights(tenantId, jobId);
    const { shipment_numbers, shipment_no } = await this.loadShipmentNos(
      tenantId,
      jobId,
    );
    const gp = saleTotal - costTotal;

    return {
      success: true,
      data: {
        charge_code_id: dto.charge_code_id,
        calculator,
        declared_sale_lines: declaredSaleLines,
        declared_cost_lines: declaredCostLines,
        declared_sale_total: saleTotal,
        declared_cost_total: costTotal,
        our_profit_share: {
          amount: gp,
          label: "Our Profit Share",
        },
        shipment_numbers,
        shipment_no,
        sale: { amount: saleTotal, currency: "BASE" },
        cost: { amount: costTotal, currency: "BASE" },
        gp,
        source_line_count: sourceLines.length,
        note: "Enter profit_share_percent, agent, and account then POST /profit-share/add",
      },
    };
  }

  async calculator(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    return {
      success: true,
      data: await this.loadCalculatorWeights(tenantId, jobId),
    };
  }

  async listAccounts(tenantId: string, jobId: string, query: ProfitShareAccountsQueryDto) {
    await this.assertJob(tenantId, jobId);
    const rows = await this.chartOfAccounts.findAll(tenantId, {
      search: query.search,
      is_postable: true,
      is_active: true,
    });
    return {
      success: true,
      data: rows.map((a) => ({
        id: a.id,
        account_code: a.account_code,
        account_name: a.account_name,
        account_group: a.account_group,
        account_type: a.account_type,
        is_postable: a.is_postable,
        is_active: a.is_active,
      })),
    };
  }

  async add(
    tenantId: string,
    jobId: string,
    dto: ProfitShareAddDto,
    actorId?: string,
  ) {
    await this.assertJob(tenantId, jobId);
    const chargeCode = await this.assertChargeCode(tenantId, dto.charge_code_id);
    const agent = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: {
          id: dto.profit_share_agent_id,
          tenant_id: tenantId,
          deleted_at: null,
        },
      }),
    );
    if (!agent) throw new NotFoundException("Profit share agent not found.");
    if (!PROFIT_SHARE_AGENT_TYPES.includes(agent.party_type as PartyType)) {
      throw new BadRequestException(
        "Profit Share Agent must be a Carrier, Agent, or Supplier (shipping line / airline / agent / supplier / overseas agent).",
      );
    }

    if (dto.profit_share_account_id) {
      await this.chartOfAccounts.findOne(tenantId, dto.profit_share_account_id);
    }

    const { saleTotal, costTotal } = await this.computeBase(tenantId, jobId);
    const pct = dto.profit_share_percent / 100;
    const saleShare = Math.round(saleTotal * pct * 10000) / 10000;
    const costShare = Math.round(costTotal * pct * 10000) / 10000;
    const gpShare = saleShare - costShare;

    const created = await this.costing.addComposite(
      tenantId,
      jobId,
      {
        charge: {
          charge_code_id: dto.charge_code_id,
          description:
            dto.description ??
            `Profit Share ${dto.profit_share_percent}% — ${chargeCode.description}`,
          quantity: 1,
          unit: "SHARE",
          remarks: `Agent ${agent.name}; account ${dto.profit_share_account_id ?? "n/a"}`,
        },
        sale: {
          amount: saleShare,
          qty: 1,
          currency: "AED",
          ex_rate: 1,
          dr_cr: JobChargeDrCr.CR,
          bill_to: undefined,
          gross_profit: gpShare,
        },
        cost: {
          amount: costShare,
          currency: "AED",
          ex_rate: 1,
          dr_cr: JobChargeDrCr.DR,
          vendor: dto.profit_share_agent_id,
        },
      },
      actorId,
    );

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCharge.update({
        where: { id: (created.data as { id: string }).id },
        data: { is_profit_share: true },
      }),
    );

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_PROFIT_SHARE_ADDED",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            percent: dto.profit_share_percent,
            agent_id: dto.profit_share_agent_id,
            account_id: dto.profit_share_account_id ?? null,
            sale_share: saleShare,
            cost_share: costShare,
            charge_id: (created.data as { id: string }).id,
          },
        },
      }),
    );

    return {
      success: true,
      data: {
        ...created.data,
        calculator: {
          source_sale: saleTotal,
          source_cost: costTotal,
          percent: dto.profit_share_percent,
          sale_share: saleShare,
          cost_share: costShare,
          gp_share: gpShare,
        },
      },
    };
  }

  private async loadCalculatorWeights(
    tenantId: string,
    jobId: string,
  ): Promise<ProfitShareCalculatorWeightsDto> {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: {
          gross_weight: true,
          chargeable_weight: true,
          volume_cbm: true,
          pieces: true,
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");

    const netAgg = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobContainer.aggregate({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        _sum: { net_weight: true },
      }),
    );
    const netSum = netAgg._sum.net_weight;
    return {
      gross_weight:
        job.gross_weight != null ? Number(job.gross_weight) : null,
      net_weight: netSum != null ? Number(netSum) : null,
      volume_cbm: job.volume_cbm != null ? Number(job.volume_cbm) : null,
      chargeable_weight:
        job.chargeable_weight != null ? Number(job.chargeable_weight) : null,
      pieces: job.pieces ?? null,
    };
  }

  private async loadShipmentNos(tenantId: string, jobId: string) {
    const shipments = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: "asc" },
        select: { shipment_number: true },
      }),
    );
    const shipment_numbers = shipments
      .map((s) => s.shipment_number)
      .filter((n): n is string => !!n);
    return {
      shipment_numbers,
      shipment_no: shipment_numbers[0] ?? null,
    };
  }

  private async computeBase(tenantId: string, jobId: string) {
    const sourceLines = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCharge.findMany({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          deleted_at: null,
          is_provisional: false,
          is_profit_share: false,
        },
        orderBy: [{ line_no: "asc" }, { created_at: "asc" }],
      }),
    );

    let saleTotal = 0;
    let costTotal = 0;
    const declaredSaleLines: ProfitShareDeclaredLineDto[] = [];
    const declaredCostLines: ProfitShareDeclaredLineDto[] = [];

    for (const c of sourceLines) {
      const hasSale = c.sale_amount != null || !c.is_cost;
      const hasCost = c.cost_amount != null || c.is_cost;

      if (c.sale_amount != null) {
        saleTotal += Number(c.sale_amount) * Number(c.sale_ex_rate ?? 1);
      } else if (!c.is_cost) {
        saleTotal += Number(c.amount_base_currency);
      }
      if (c.cost_amount != null) {
        costTotal += Number(c.cost_amount) * Number(c.cost_ex_rate ?? 1);
      } else if (c.is_cost) {
        costTotal += Number(c.amount_base_currency);
      }

      if (hasSale) {
        declaredSaleLines.push({
          charge_id: c.id,
          line_no: c.line_no,
          description: c.description ?? "",
          unit: c.unit,
          pp_cc: c.pp_cc,
          amount: Number(
            c.sale_amount ?? (!c.is_cost ? c.amount : 0) ?? 0,
          ),
          tax_amount:
            c.sale_tax_amount != null
              ? Number(c.sale_tax_amount)
              : c.tax_amount != null && !c.is_cost
                ? Number(c.tax_amount)
                : null,
          dr_cr: c.sale_dr_cr,
          currency: c.sale_currency ?? c.currency_code,
        });
      }
      if (hasCost) {
        declaredCostLines.push({
          charge_id: c.id,
          line_no: c.line_no,
          description: c.description ?? "",
          unit: c.unit,
          pp_cc: c.pp_cc,
          amount: Number(
            c.cost_amount ?? (c.is_cost ? c.amount : 0) ?? 0,
          ),
          tax_amount:
            c.cost_tax_amount != null
              ? Number(c.cost_tax_amount)
              : c.tax_amount != null && c.is_cost
                ? Number(c.tax_amount)
                : null,
          dr_cr: c.cost_dr_cr,
          currency: c.cost_currency ?? c.currency_code,
        });
      }
    }

    return {
      saleTotal,
      costTotal,
      sourceLines,
      declaredSaleLines,
      declaredCostLines,
    };
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: { id: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
  }

  private async assertChargeCode(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chargeCode.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!row) throw new NotFoundException("Charge code not found.");
    return row;
  }
}
