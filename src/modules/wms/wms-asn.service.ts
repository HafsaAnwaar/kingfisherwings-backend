import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DocumentNumberType, WmsAsnStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import { CreateAsnDto } from "./dto/wms.dto";
import { WmsCustomerNotifyService } from "./wms-customer-notify.service";
import { WmsGrnService } from "./wms-grn.service";

const CANCELABLE: WmsAsnStatus[] = [
  "DRAFT",
  "CONFIRMED",
  "PICKED",
  "UNLOADING",
];

@Injectable()
export class WmsAsnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly grnService: WmsGrnService,
    private readonly customerNotify: WmsCustomerNotifyService,
  ) {}

  async create(user: CurrentUser, dto: CreateAsnDto) {
    const number = await this.numberGenerator.generate(
      user.tenantId,
      DocumentNumberType.ASN,
    );
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.create({
        data: {
          tenant_id: user.tenantId,
          asn_number: number,
          warehouse_id: dto.warehouse_id,
          party_id: dto.party_id,
          job_id: dto.job_id,
          expected_at: dto.expected_at ? new Date(dto.expected_at) : null,
          remarks: dto.remarks,
          created_by: user.id,
          updated_by: user.id,
          lines: {
            create: dto.lines.map((line, index) => ({
              tenant_id: user.tenantId,
              ...line,
              sort_order: index,
            })),
          },
        },
        include: {
          lines: { include: { item: true }, orderBy: { sort_order: "asc" } },
          warehouse: true,
        },
      }),
    );
  }

  list(user: CurrentUser) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        include: { warehouse: true, lines: { include: { item: true } } },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  get(user: CurrentUser, id: string) {
    return this.require(user.tenantId, id);
  }

  async confirm(user: CurrentUser, id: string) {
    const asn = await this.require(user.tenantId, id);
    if (asn.status !== "DRAFT")
      throw new BadRequestException("Only draft ASNs can be confirmed.");
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.update({
        where: { id },
        data: { status: "CONFIRMED", updated_by: user.id },
        include: {
          lines: { include: { item: true }, orderBy: { sort_order: "asc" } },
          warehouse: true,
        },
      }),
    );
  }

  async markPicked(user: CurrentUser, id: string) {
    const asn = await this.require(user.tenantId, id);
    if (asn.status !== "CONFIRMED") {
      throw new BadRequestException(
        "Only CONFIRMED ASNs can be marked PICKED.",
      );
    }
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.update({
        where: { id },
        data: {
          status: "PICKED",
          picked_at: new Date(),
          updated_by: user.id,
        },
        include: {
          lines: { include: { item: true }, orderBy: { sort_order: "asc" } },
          warehouse: true,
        },
      }),
    );
  }

  async markUnloading(user: CurrentUser, id: string) {
    const asn = await this.require(user.tenantId, id);
    if (asn.status !== "PICKED") {
      throw new BadRequestException(
        "Only PICKED ASNs can be marked UNLOADING.",
      );
    }
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.update({
        where: { id },
        data: {
          status: "UNLOADING",
          unloading_at: new Date(),
          updated_by: user.id,
        },
        include: {
          lines: { include: { item: true }, orderBy: { sort_order: "asc" } },
          warehouse: true,
        },
      }),
    );
  }

  /**
   * UNLOADING → auto-create+post GRN → email+portal GRN → UNLOADED.
   * Idempotent if already UNLOADED.
   */
  async markUnloaded(user: CurrentUser, id: string) {
    const asn = await this.require(user.tenantId, id);

    if (asn.status === "UNLOADED") {
      const grnId = asn.auto_grn_id;
      const grn = grnId
        ? await this.prisma.runWithTenant(user.tenantId, (tx) =>
            tx.wmsGrn.findFirst({
              where: { id: grnId, tenant_id: user.tenantId },
              include: {
                warehouse: true,
                lines: { include: { item: true } },
              },
            }),
          )
        : null;
      return {
        asn,
        grn,
        notify: {
          emailed: Boolean(grn?.customer_emailed_at),
          portal_published: Boolean(grn?.portal_published_at),
          job_document_id: grn?.job_document_id ?? null,
        },
        idempotent: true,
      };
    }

    if (asn.status !== "UNLOADING") {
      throw new BadRequestException(
        "Only UNLOADING ASNs can be marked UNLOADED.",
      );
    }
    if (!asn.party_id || !asn.job_id) {
      throw new BadRequestException(
        "ASN must have party_id and job_id before unload (required for customer GRN email + portal).",
      );
    }
    if (!asn.lines.length) {
      throw new BadRequestException("ASN has no lines to receive.");
    }

    const grn = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const created = await this.grnService.createFromAsn(user, id, tx);
      return this.grnService.postInTransaction(tx, user, created.id, {
        asnStatusOnPost: "UNLOADED",
      });
    });

    let notify;
    try {
      notify = await this.customerNotify.notifyGrn(user, grn.id);
    } catch (err) {
      notify = {
        emailed: false,
        portal_published: false,
        job_document_id: null,
        email_error: err instanceof Error ? err.message : String(err),
      };
    }

    const refreshed = await this.require(user.tenantId, id);
    return { asn: refreshed, grn, notify, idempotent: false };
  }

  async resendGrn(user: CurrentUser, id: string) {
    const asn = await this.require(user.tenantId, id);
    if (asn.status !== "UNLOADED" || !asn.auto_grn_id) {
      throw new BadRequestException(
        "Resend GRN is only available for UNLOADED ASNs with an auto GRN.",
      );
    }
    const notify = await this.customerNotify.notifyGrn(user, asn.auto_grn_id);
    const grn = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsGrn.findFirst({
        where: { id: asn.auto_grn_id!, tenant_id: user.tenantId },
        include: { warehouse: true, lines: { include: { item: true } } },
      }),
    );
    return { asn, grn, notify };
  }

  async cancel(user: CurrentUser, id: string) {
    const asn = await this.require(user.tenantId, id);
    if (!CANCELABLE.includes(asn.status))
      throw new BadRequestException(
        "Received, unloaded, or cancelled ASNs cannot be cancelled.",
      );
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.update({
        where: { id },
        data: { status: "CANCELLED", updated_by: user.id },
      }),
    );
  }

  private async require(tenantId: string, id: string) {
    const asn = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.wmsAsn.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          lines: { include: { item: true }, orderBy: { sort_order: "asc" } },
          warehouse: true,
        },
      }),
    );
    if (!asn) throw new NotFoundException("ASN not found.");
    return asn;
  }
}
