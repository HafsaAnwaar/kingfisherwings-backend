import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { InvoicesService } from "../invoices/invoices.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import { CalculateStorageDto, InvoiceStorageDto } from "./dto/wms.dto";

@Injectable()
export class WmsStorageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService,
  ) {}

  async calculate(user: CurrentUser, dto: CalculateStorageDto) {
    const periodFrom = new Date(dto.period_from);
    const periodTo = new Date(dto.period_to);
    if (periodTo < periodFrom)
      throw new BadRequestException(
        "period_to must be on or after period_from.",
      );

    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const settings = await tx.wmsSettings.upsert({
        where: { tenant_id: user.tenantId },
        create: {
          tenant_id: user.tenantId,
          default_currency: user.baseCurrency ?? "AED",
        },
        update: {},
      });
      const freeDays = dto.free_days ?? settings.default_free_days;
      const rate = dto.rate_per_day ?? Number(settings.default_storage_rate);
      const currency = (
        dto.currency_code ?? settings.default_currency
      ).toUpperCase();
      const days =
        Math.floor((periodTo.getTime() - periodFrom.getTime()) / 86_400_000) +
        1;
      const chargeableDays = Math.max(0, days - freeDays);
      const lots = await tx.wmsStockLot.findMany({
        where: {
          tenant_id: user.tenantId,
          warehouse_id: dto.warehouse_id,
          party_id: dto.party_id,
          deleted_at: null,
          qty_remaining: { gt: 0 },
        },
        include: { item: true },
      });

      const charges = [];
      for (const lot of lots) {
        const existing = await tx.wmsStorageCharge.findFirst({
          where: {
            tenant_id: user.tenantId,
            lot_id: lot.id,
            period_from: periodFrom,
            period_to: periodTo,
            deleted_at: null,
            status: { in: ["OPEN", "INVOICED"] },
          },
        });
        if (existing) {
          charges.push(existing);
          continue;
        }
        const quantity = Number(lot.qty_remaining);
        const cbm =
          lot.cbm_per_unit == null ? null : quantity * Number(lot.cbm_per_unit);
        const basis = cbm ?? quantity;
        const amount = chargeableDays * rate * basis;
        charges.push(
          await tx.wmsStorageCharge.create({
            data: {
              tenant_id: user.tenantId,
              warehouse_id: dto.warehouse_id,
              party_id: dto.party_id,
              lot_id: lot.id,
              item_id: lot.item_id,
              period_from: periodFrom,
              period_to: periodTo,
              free_days: freeDays,
              chargeable_days: chargeableDays,
              quantity,
              cbm,
              rate_per_day: rate,
              amount,
              currency_code: currency,
              remarks: `Storage for ${lot.item.code} (${days} day period)`,
              created_by: user.id,
              updated_by: user.id,
            },
          }),
        );
      }
      return charges;
    });
  }

  listCharges(
    user: CurrentUser,
    query: { party_id?: string; status?: string } = {},
  ) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsStorageCharge.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(query.party_id ? { party_id: query.party_id } : {}),
          ...(query.status
            ? { status: query.status as "OPEN" | "INVOICED" | "WAIVED" }
            : {}),
        },
        include: {
          lot: { include: { item: true, warehouse: true } },
          invoice: true,
        },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  async invoiceCharges(user: CurrentUser, dto: InvoiceStorageDto) {
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const charges = await tx.wmsStorageCharge.findMany({
        where: {
          tenant_id: user.tenantId,
          id: { in: dto.charge_ids },
          deleted_at: null,
          status: "OPEN",
        },
        include: { lot: { include: { item: true } } },
      });
      if (charges.length !== new Set(dto.charge_ids).size)
        throw new NotFoundException(
          "One or more open storage charges were not found.",
        );
      const partyIds = new Set(charges.map((charge) => charge.party_id));
      const currencies = new Set(charges.map((charge) => charge.currency_code));
      if (partyIds.size !== 1 || currencies.size !== 1) {
        throw new BadRequestException(
          "All charges on a storage invoice must have the same party and currency.",
        );
      }
      const party = await tx.party.findFirst({
        where: {
          id: charges[0].party_id,
          tenant_id: user.tenantId,
          deleted_at: null,
        },
        select: { company_id: true },
      });
      if (!party) throw new NotFoundException("Party not found.");
      const invoice = await this.invoices.createWmsStorageDraft(
        user.tenantId,
        {
          partyId: charges[0].party_id,
          companyId: party.company_id,
          currencyCode: charges[0].currency_code,
          remarks: "WMS storage charges",
          actorId: user.id,
          lines: charges.map((charge) => ({
            description: charge.remarks ?? `Storage charge ${charge.id}`,
            quantity: Number(charge.cbm ?? charge.quantity),
            unitPrice: Number(charge.rate_per_day) * charge.chargeable_days,
            amount: Number(charge.amount),
          })),
        },
        tx,
      );
      await tx.wmsStorageCharge.updateMany({
        where: {
          id: { in: charges.map((charge) => charge.id) },
          tenant_id: user.tenantId,
          status: "OPEN",
        },
        data: {
          status: "INVOICED",
          invoice_id: invoice.id,
          updated_by: user.id,
        },
      });
      return invoice;
    });
  }
}
