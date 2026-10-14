import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobChargeDrCr, PartyType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { JobCostingService, PROFIT_SHARE_AGENT_TYPES } from "./job-costing.service";
import {
  ProfitShareAddDto,
  ProfitSharePreviewDto,
} from "./dto/job-costing.dto";

@Injectable()
export class JobProfitShareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly costing: JobCostingService,
  ) {}

  async preview(tenantId: string, jobId: string, dto: ProfitSharePreviewDto) {
    await this.assertJob(tenantId, jobId);
    await this.assertChargeCode(tenantId, dto.charge_code_id);

    const { saleTotal, costTotal, sourceLines } = await this.computeBase(
      tenantId,
      jobId,
    );

    return {
      success: true,
      data: {
        charge_code_id: dto.charge_code_id,
        sale: { amount: saleTotal, currency: "BASE" },
        cost: { amount: costTotal, currency: "BASE" },
        gp: saleTotal - costTotal,
        source_line_count: sourceLines.length,
        note: "Enter profit_share_percent, agent, and account then POST /profit-share/add",
      },
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
      }),
    );

    let saleTotal = 0;
    let costTotal = 0;
    for (const c of sourceLines) {
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
    }

    return { saleTotal, costTotal, sourceLines };
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
