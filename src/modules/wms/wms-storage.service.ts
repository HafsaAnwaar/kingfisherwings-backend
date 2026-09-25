import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { InvoicesService } from "../invoices/invoices.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import { CalculateStorageDto, InvoiceStorageDto } from "./dto/wms.dto";
import {
  computeExtraStorageDays,
  computeOverdueStorageAmount,
} from "./utils/wms-overdue.util";

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
      const overdueRate =
        dto.overdue_rate_per_day ??
        Number(settings.default_overdue_rate_per_day);
      const currency = (
        dto.currency_code ?? settings.default_currency
      ).toUpperCase();
      const days =
        Math.floor((periodTo.getTime() - periodFrom.getTime()) / 86_400_000) +
        1;
      const lots = await tx.wmsStockLot.findMany({
        where: {
          tenant_id: user.tenantId,
          warehouse_id: dto.warehouse_id,
          party_id: dto.party_id,
          deleted_at: null,
          qty_remaining: { gt: 0 },
          storage_status: { in: ["IN_STORAGE", "NOT_COLLECTED"] },
        },
        include: { item: true },
      });

      const charges = [];
      for (const lot of lots) {
        const paidDays = lot.paid_storage_days ?? freeDays;
        const lotOverdueRate =
          lot.overdue_rate_per_day != null
            ? Number(lot.overdue_rate_per_day)
            : overdueRate;
        const start = lot.storage_starts_at ?? lot.received_at;
        const elapsed =
          Math.floor(
            (periodTo.getTime() - start.getTime()) / 86_400_000,
          ) + 1;
        const extraDays = computeExtraStorageDays(elapsed, paidDays);

        if (extraDays > 0 && lot.storage_status !== "NOT_COLLECTED") {
          await tx.wmsStockLot.update({
            where: { id: lot.id },
            data: { storage_status: "NOT_COLLECTED" },
          });
        }

        // Prefer overdue extra charge when past paid window; else included overage.
        const useOverdue = extraDays > 0 && lotOverdueRate > 0;
        const chargeableDays = useOverdue
          ? extraDays
          : Math.max(0, days - freeDays);
        const appliedRate = useOverdue ? lotOverdueRate : rate;
        const chargeKind = useOverdue ? "OVERDUE_EXTRA" : "INCLUDED_OVERAGE";

        if (chargeableDays <= 0) continue;

        const existing = await tx.wmsStorageCharge.findFirst({
          where: {
            tenant_id: user.tenantId,
            lot_id: lot.id,
            period_from: periodFrom,
            period_to: periodTo,
            charge_kind: chargeKind,
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
        const amount = useOverdue
          ? computeOverdueStorageAmount(extraDays, appliedRate, basis)
          : chargeableDays * appliedRate * basis;
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
              free_days: paidDays,
              chargeable_days: chargeableDays,
              extra_days: useOverdue ? extraDays : 0,
              quantity,
              cbm,
              rate_per_day: appliedRate,
              overdue_rate_per_day: lotOverdueRate,
              amount,
              currency_code: currency,
              charge_kind: chargeKind,
              remarks: useOverdue
                ? `Overdue storage for ${lot.item.code}: ${extraDays} extra day(s) × ${lotOverdueRate}`
                : `Storage for ${lot.item.code} (${days} day period)`,
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
    query: { party_id?: string; status?: string; charge_kind?: string } = {},
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
          ...(query.charge_kind
            ? {
                charge_kind: query.charge_kind as
                  | "INCLUDED_OVERAGE"
                  | "OVERDUE_EXTRA",
              }
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

  /**
   * Daily accrual: flip overdue status and upsert OPEN OVERDUE_EXTRA charges.
   */
  async accrueOverdueForTenant(tenantId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const settings = await tx.wmsSettings.findFirst({
        where: { tenant_id: tenantId },
      });
      const defaultOverdue = Number(settings?.default_overdue_rate_per_day ?? 0);
      const currency = settings?.default_currency ?? "AED";
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const lots = await tx.wmsStockLot.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          qty_remaining: { gt: 0 },
          storage_status: { in: ["IN_STORAGE", "NOT_COLLECTED"] },
        },
        include: { item: true },
      });

      let updated = 0;
      let charges = 0;
      for (const lot of lots) {
        const start = lot.storage_starts_at ?? lot.received_at;
        const paidDays = lot.paid_storage_days;
        const elapsed =
          Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
        const extraDays = Math.max(0, elapsed - paidDays);
        if (extraDays <= 0) continue;

        if (lot.storage_status !== "NOT_COLLECTED") {
          await tx.wmsStockLot.update({
            where: { id: lot.id },
            data: { storage_status: "NOT_COLLECTED" },
          });
          updated += 1;
        }

        const overdueRate =
          lot.overdue_rate_per_day != null
            ? Number(lot.overdue_rate_per_day)
            : defaultOverdue;
        if (overdueRate <= 0 || !lot.party_id) continue;

        const periodFrom = new Date(start);
        periodFrom.setUTCDate(periodFrom.getUTCDate() + paidDays);
        const quantity = Number(lot.qty_remaining);
        const cbm =
          lot.cbm_per_unit == null ? null : quantity * Number(lot.cbm_per_unit);
        const basis = cbm ?? quantity;
        const amount = extraDays * overdueRate * basis;

        const existing = await tx.wmsStorageCharge.findFirst({
          where: {
            tenant_id: tenantId,
            lot_id: lot.id,
            charge_kind: "OVERDUE_EXTRA",
            status: "OPEN",
            deleted_at: null,
          },
        });
        if (existing) {
          await tx.wmsStorageCharge.update({
            where: { id: existing.id },
            data: {
              period_to: today,
              chargeable_days: extraDays,
              extra_days: extraDays,
              overdue_rate_per_day: overdueRate,
              rate_per_day: overdueRate,
              quantity,
              cbm,
              amount,
              remarks: `Overdue accrual: ${extraDays} × ${overdueRate}`,
            },
          });
        } else {
          await tx.wmsStorageCharge.create({
            data: {
              tenant_id: tenantId,
              warehouse_id: lot.warehouse_id,
              party_id: lot.party_id,
              lot_id: lot.id,
              item_id: lot.item_id,
              period_from: periodFrom,
              period_to: today,
              free_days: paidDays,
              chargeable_days: extraDays,
              extra_days: extraDays,
              quantity,
              cbm,
              rate_per_day: overdueRate,
              overdue_rate_per_day: overdueRate,
              amount,
              currency_code: currency,
              charge_kind: "OVERDUE_EXTRA",
              remarks: `Overdue accrual: ${extraDays} × ${overdueRate}`,
            },
          });
        }
        charges += 1;
      }
      return { lots_marked_overdue: updated, charges_upserted: charges };
    });
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
