import { Injectable, NotFoundException } from "@nestjs/common";
import { NvoccCargoType, NvoccTariff, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateNvoccTariffDto,
  NvoccTariffLookupDto,
  NvoccTariffQueryDto,
  UpdateNvoccTariffDto,
} from "./dto/nvocc-tariff.dto";

export interface NvoccTariffChargeLine {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  currency_code: string;
  is_cost: boolean;
}

@Injectable()
export class NvoccTariffsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateNvoccTariffDto,
    actorId?: string,
  ): Promise<NvoccTariff> {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccTariff.create({
        data: {
          tenant_id: tenantId,
          trade_lane: dto.trade_lane,
          pol_region: dto.pol_region,
          pod_region: dto.pod_region,
          origin_port_id: dto.origin_port_id,
          dest_port_id: dto.dest_port_id,
          commodity_type: dto.commodity_type ?? "GENERAL",
          container_type_id: dto.container_type_id,
          lcl_rate_cbm: dto.lcl_rate_cbm,
          lcl_rate_wm: dto.lcl_rate_wm,
          lcl_minimum_charge: dto.lcl_minimum_charge,
          fcl_rate: dto.fcl_rate,
          origin_thc: dto.origin_thc,
          dest_thc: dto.dest_thc,
          bl_fee: dto.bl_fee,
          baf_surcharge: dto.baf_surcharge,
          caf_surcharge: dto.caf_surcharge,
          pss_surcharge: dto.pss_surcharge,
          gri_surcharge: dto.gri_surcharge,
          rate_valid_from: new Date(dto.rate_valid_from),
          rate_valid_to: dto.rate_valid_to
            ? new Date(dto.rate_valid_to)
            : undefined,
          customer_id: dto.customer_id,
          currency_code: dto.currency_code.toUpperCase(),
          status: dto.status ?? "ACTIVE",
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async findAll(tenantId: string, query: NvoccTariffQueryDto) {
    const where: Prisma.NvoccTariffWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { trade_lane: { contains: query.search, mode: "insensitive" } },
              { pol_region: { contains: query.search, mode: "insensitive" } },
              { pod_region: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccTariff.findMany({ where, orderBy: { created_at: "desc" } }),
    );
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccTariff.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!row) throw new NotFoundException("NVOCC tariff not found.");
    return row;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateNvoccTariffDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccTariff.update({
        where: { id },
        data: {
          ...dto,
          currency_code: dto.currency_code?.toUpperCase(),
          rate_valid_from: dto.rate_valid_from
            ? new Date(dto.rate_valid_from)
            : undefined,
          rate_valid_to: dto.rate_valid_to
            ? new Date(dto.rate_valid_to)
            : undefined,
          updated_by: actorId,
        },
      }),
    );
  }

  async remove(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccTariff.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
  }

  async findMatch(
    tenantId: string,
    dto: NvoccTariffLookupDto,
  ): Promise<NvoccTariff | null> {
    const validity = dto.validity_date
      ? new Date(dto.validity_date)
      : new Date();
    const where: Prisma.NvoccTariffWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      status: "ACTIVE",
      rate_valid_from: { lte: validity },
      OR: [{ rate_valid_to: null }, { rate_valid_to: { gte: validity } }],
      ...(dto.origin_port_id ? { origin_port_id: dto.origin_port_id } : {}),
      ...(dto.dest_port_id ? { dest_port_id: dto.dest_port_id } : {}),
      ...(dto.container_type_id
        ? { container_type_id: dto.container_type_id }
        : {}),
    };

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      if (dto.customer_id) {
        const customerSpecific = await tx.nvoccTariff.findFirst({
          where: { ...where, customer_id: dto.customer_id },
          orderBy: { created_at: "desc" },
        });
        if (customerSpecific) return customerSpecific;
      }
      return tx.nvoccTariff.findFirst({
        where: { ...where, customer_id: null },
        orderBy: { created_at: "desc" },
      });
    });
  }

  buildChargeLinesFromTariff(
    tariff: NvoccTariff,
    cargoType: NvoccCargoType,
    cbm?: number,
    containerCount?: number,
  ): NvoccTariffChargeLine[] {
    const lines: NvoccTariffChargeLine[] = [];
    const currency = tariff.currency_code;

    if (cargoType === "FCL" && tariff.fcl_rate != null) {
      const qty = containerCount ?? 1;
      const rate = Number(tariff.fcl_rate);
      lines.push({
        description: "Ocean Freight (FCL)",
        quantity: qty,
        unit_price: rate,
        amount: rate * qty,
        currency_code: currency,
        is_cost: false,
      });
    }

    if (cargoType === "LCL") {
      const cbmQty = cbm ?? 1;
      const cbmRate = Number(tariff.lcl_rate_cbm ?? 0);
      const wmRate = Number(tariff.lcl_rate_wm ?? 0);
      const minCharge = Number(tariff.lcl_minimum_charge ?? 0);
      let amount = cbmRate * cbmQty;
      if (wmRate > 0) amount = Math.max(amount, wmRate * cbmQty);
      if (minCharge > 0) amount = Math.max(amount, minCharge);
      lines.push({
        description: "Ocean Freight (LCL)",
        quantity: cbmQty,
        unit_price: amount / cbmQty,
        amount,
        currency_code: currency,
        is_cost: false,
      });
    }

    const surcharges: Array<[string, Prisma.Decimal | null]> = [
      ["Origin THC", tariff.origin_thc],
      ["Destination THC", tariff.dest_thc],
      ["BL Fee", tariff.bl_fee],
      ["BAF Surcharge", tariff.baf_surcharge],
      ["CAF Surcharge", tariff.caf_surcharge],
      ["PSS Surcharge", tariff.pss_surcharge],
      ["GRI Surcharge", tariff.gri_surcharge],
    ];

    for (const [label, value] of surcharges) {
      if (value == null || Number(value) === 0) continue;
      const rate = Number(value);
      lines.push({
        description: label,
        quantity: 1,
        unit_price: rate,
        amount: rate,
        currency_code: currency,
        is_cost: false,
      });
    }

    return lines;
  }
}
