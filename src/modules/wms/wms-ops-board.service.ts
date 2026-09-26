import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";

export type LotBillingLabel = "OVERDUE" | "OVER_BILL";

@Injectable()
export class WmsOpsBoardService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoard(user: CurrentUser) {
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const [asns, gdos, lots, openCharges] = await Promise.all([
        tx.wmsAsn.findMany({
          where: {
            tenant_id: user.tenantId,
            deleted_at: null,
            status: {
              in: ["CONFIRMED", "PICKED", "UNLOADING", "UNLOADED", "RECEIVED"],
            },
          },
          include: {
            warehouse: { select: { id: true, code: true, name: true } },
          },
          orderBy: { updated_at: "desc" },
          take: 100,
        }),
        tx.wmsGdo.findMany({
          where: {
            tenant_id: user.tenantId,
            deleted_at: null,
            status: { in: ["DRAFT", "POSTED"] },
          },
          include: {
            warehouse: { select: { id: true, code: true, name: true } },
          },
          orderBy: { updated_at: "desc" },
          take: 100,
        }),
        tx.wmsStockLot.findMany({
          where: {
            tenant_id: user.tenantId,
            deleted_at: null,
            qty_remaining: { gt: 0 },
            storage_status: { in: ["IN_STORAGE", "NOT_COLLECTED"] },
          },
          include: {
            item: { select: { code: true, name: true } },
            warehouse: { select: { code: true, name: true } },
            storage_charges: {
              where: { status: { in: ["OPEN", "INVOICED"] } },
              select: { id: true, charge_kind: true, status: true },
            },
          },
          orderBy: { received_at: "asc" },
          take: 200,
        }),
        tx.wmsStorageCharge.findMany({
          where: {
            tenant_id: user.tenantId,
            status: "OPEN",
          },
          select: {
            id: true,
            lot_id: true,
            charge_kind: true,
            status: true,
            amount: true,
          },
          take: 200,
        }),
      ]);

      const asnRows = await Promise.all(
        asns.map(async (asn) => {
          let grnFlags: {
            customer_emailed_at: Date | null;
            portal_published_at: Date | null;
            job_document_id: string | null;
            grn_number: string | null;
          } | null = null;
          if (asn.auto_grn_id) {
            const grn = await tx.wmsGrn.findFirst({
              where: { id: asn.auto_grn_id, tenant_id: user.tenantId },
              select: {
                grn_number: true,
                customer_emailed_at: true,
                portal_published_at: true,
                job_document_id: true,
              },
            });
            if (grn) {
              grnFlags = {
                grn_number: grn.grn_number,
                customer_emailed_at: grn.customer_emailed_at,
                portal_published_at: grn.portal_published_at,
                job_document_id: grn.job_document_id,
              };
            }
          }
          return {
            id: asn.id,
            asn_number: asn.asn_number,
            status: asn.status,
            warehouse: asn.warehouse,
            party_id: asn.party_id,
            job_id: asn.job_id,
            picked_at: asn.picked_at,
            unloading_at: asn.unloading_at,
            unloaded_at: asn.unloaded_at,
            auto_grn_id: asn.auto_grn_id,
            grn: grnFlags,
            actions: {
              can_mark_picked: asn.status === "CONFIRMED",
              can_mark_unloading: asn.status === "PICKED",
              can_mark_unloaded: asn.status === "UNLOADING",
              can_resend_grn: asn.status === "UNLOADED" && !!asn.auto_grn_id,
            },
          };
        }),
      );

      const gdoRows = gdos.map((gdo) => ({
        id: gdo.id,
        gdo_number: gdo.gdo_number,
        status: gdo.status,
        ops_status: gdo.status === "POSTED" ? "DISPATCHED" : gdo.status,
        warehouse: gdo.warehouse,
        party_id: gdo.party_id,
        job_id: gdo.job_id,
        customer_emailed_at: gdo.customer_emailed_at,
        portal_published_at: gdo.portal_published_at,
        job_document_id: gdo.job_document_id,
        actions: {
          can_post: gdo.status === "DRAFT",
          can_resend_gdn: gdo.status === "POSTED",
        },
      }));

      const lotRows = lots.map((lot) => {
        const labels = this.billingLabels(
          lot.storage_status,
          lot.storage_charges.map((c) => c.charge_kind),
        );
        return {
          id: lot.id,
          item: lot.item,
          warehouse: lot.warehouse,
          qty_remaining: lot.qty_remaining,
          storage_status: lot.storage_status,
          paid_until_date: lot.paid_until_date,
          party_id: lot.party_id,
          job_id: lot.job_id,
          billing_labels: labels,
          charges: lot.storage_charges,
        };
      });

      return {
        inbound_asns: asnRows,
        outbound_gdos: gdoRows,
        lots: lotRows,
        open_storage_charges: openCharges,
        summary: {
          picked: asnRows.filter((a) => a.status === "PICKED").length,
          unloading: asnRows.filter((a) => a.status === "UNLOADING").length,
          unloaded: asnRows.filter((a) => a.status === "UNLOADED").length,
          dispatched: gdoRows.filter((g) => g.ops_status === "DISPATCHED")
            .length,
          overdue_lots: lotRows.filter((l) =>
            l.billing_labels.includes("OVERDUE"),
          ).length,
          over_bill_lots: lotRows.filter((l) =>
            l.billing_labels.includes("OVER_BILL"),
          ).length,
        },
      };
    });
  }

  billingLabels(
    storageStatus: string,
    chargeKinds: string[],
  ): LotBillingLabel[] {
    const labels: LotBillingLabel[] = [];
    if (
      storageStatus === "NOT_COLLECTED" ||
      chargeKinds.includes("OVERDUE_EXTRA")
    ) {
      labels.push("OVERDUE");
    }
    if (chargeKinds.includes("INCLUDED_OVERAGE")) {
      labels.push("OVER_BILL");
    }
    return labels;
  }
}
