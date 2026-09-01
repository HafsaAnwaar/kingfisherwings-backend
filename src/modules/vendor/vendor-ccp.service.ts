import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PortalDisputeStatus, Prisma } from "@prisma/client";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import {
  CreateVendorDisputeDto,
  ReviewVendorDisputeDto,
  StaffVendorDisputeQueryDto,
  VendorDisputeQueryDto,
} from "./dto/vendor-ccp.dto";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";

@Injectable()
export class VendorCcpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  async createDispute(
    user: CurrentVendorUser,
    dto: CreateVendorDisputeDto,
    attachmentPath?: string,
  ) {
    const invoice = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.invoice.findFirst({
        where: {
          id: dto.invoice_id,
          tenant_id: user.tenantId,
          party_id: user.partyId,
          deleted_at: null,
          invoice_type: "PURCHASE_INVOICE",
        },
      }),
    );
    if (!invoice) throw new NotFoundException("Invoice not found.");

    const open = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.vendorDispute.findFirst({
        where: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          invoice_id: dto.invoice_id,
          status: {
            in: [PortalDisputeStatus.OPEN, PortalDisputeStatus.UNDER_REVIEW],
          },
        },
      }),
    );
    if (open)
      throw new BadRequestException(
        "An open dispute already exists for this invoice.",
      );

    const dispute = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.vendorDispute.create({
        data: {
          tenant_id: user.tenantId,
          party_id: user.partyId,
          vendor_user_id: user.id,
          invoice_id: dto.invoice_id,
          reason: dto.reason.trim(),
          description: dto.description.trim(),
          attachment_path: attachmentPath ?? null,
        },
      }),
    );

    await this.notifications.notifyFinanceStaff(user.tenantId, {
      type: "VENDOR_DISPUTE",
      title: `Vendor dispute: ${dto.reason}`,
      message: `${user.fullName} raised a dispute on purchase invoice ${invoice.invoice_number}.`,
      entity_type: "vendor_dispute",
      entity_id: dispute.id,
      link_path: `/vendor-admin/disputes/${dispute.id}`,
    });

    return { success: true, data: dispute };
  }

  async listMyDisputes(user: CurrentVendorUser, query: VendorDisputeQueryDto) {
    const where: Prisma.VendorDisputeWhereInput = {
      tenant_id: user.tenantId,
      party_id: user.partyId,
      ...(query.status ? { status: query.status } : {}),
    };
    const [rows, total] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.vendorDispute.findMany({
            where,
            orderBy: { created_at: "desc" },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
          }),
          tx.vendorDispute.count({ where }),
        ]),
    );
    return {
      success: true,
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getMyDispute(user: CurrentVendorUser, id: string) {
    const dispute = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.vendorDispute.findFirst({
        where: { id, tenant_id: user.tenantId, party_id: user.partyId },
      }),
    );
    if (!dispute) throw new NotFoundException("Dispute not found.");
    return { success: true, data: dispute };
  }

  async staffList(tenantId: string, query: StaffVendorDisputeQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.VendorDisputeWhereInput = {
      tenant_id: tenantId,
      ...(query.party_id ? { party_id: query.party_id } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [rows, total] = await this.prisma.runWithTenant(
      tenantId,
      async (tx) =>
        Promise.all([
          tx.vendorDispute.findMany({
            where,
            orderBy: { created_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: {
              party: { select: { id: true, code: true, name: true } },
              vendor_user: {
                select: { id: true, email: true, full_name: true },
              },
            },
          }),
          tx.vendorDispute.count({ where }),
        ]),
    );
    return {
      success: true,
      data: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async staffGet(tenantId: string, id: string) {
    const dispute = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.vendorDispute.findFirst({
        where: { id, tenant_id: tenantId },
        include: {
          party: { select: { id: true, code: true, name: true } },
          vendor_user: { select: { id: true, email: true, full_name: true } },
        },
      }),
    );
    if (!dispute) throw new NotFoundException("Dispute not found.");
    return { success: true, data: dispute };
  }

  async staffReview(
    tenantId: string,
    actorId: string,
    id: string,
    dto: ReviewVendorDisputeDto,
  ) {
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.vendorDispute.findFirst({
        where: { id, tenant_id: tenantId },
      });
      if (!existing) throw new NotFoundException("Dispute not found.");
      const terminal =
        dto.status === PortalDisputeStatus.RESOLVED ||
        dto.status === PortalDisputeStatus.REJECTED;
      return tx.vendorDispute.update({
        where: { id },
        data: {
          status: dto.status,
          staff_notes: dto.staff_notes?.trim() ?? existing.staff_notes,
          ...(terminal
            ? { resolved_at: new Date(), resolved_by: actorId }
            : { resolved_at: null, resolved_by: null }),
        },
      });
    });

    await this.notifications.notifyVendorUser(
      tenantId,
      updated.vendor_user_id,
      {
        type: "VENDOR_DISPUTE",
        title: `Dispute ${dto.status.toLowerCase().replace("_", " ")}`,
        message: `Your invoice dispute was updated to ${dto.status}.`,
        entity_type: "vendor_dispute",
        entity_id: updated.id,
        link_path: `/vendor/disputes/${updated.id}`,
      },
    );

    return { success: true, data: updated };
  }

  async storeOptionalUpload(tenantId: string, file?: Express.Multer.File) {
    if (!file) return undefined;
    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
    return stored.fileUrl || stored.s3Key;
  }
}
