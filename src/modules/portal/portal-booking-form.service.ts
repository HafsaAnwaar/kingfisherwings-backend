import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingFormEntityService } from "../jobs/booking-forms/booking-form-entity.service";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { portalShipmentOwnershipWhere } from "./helpers/portal-ownership.helper";

/**
 * Customer portal booking forms for Quotation / Shipment.
 * Stored on the quotation until admin Generate Job (no provisional job).
 */
@Injectable()
export class PortalBookingFormService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly forms: BookingFormEntityService,
  ) {}

  async getForShipment(user: CurrentPortalUser, shipmentId: string) {
    await this.assertOwnedShipment(user, shipmentId);
    return this.forms.getForShipment(user.tenantId, shipmentId, {
      id: user.id,
    }, "customer");
  }

  async upsertForShipment(
    user: CurrentPortalUser,
    shipmentId: string,
    dto: Record<string, unknown>,
  ) {
    await this.assertOwnedShipment(user, shipmentId);
    return this.forms.upsertForShipment(
      user.tenantId,
      shipmentId,
      dto,
      { id: user.id },
      "customer",
    );
  }

  async completeForShipment(
    user: CurrentPortalUser,
    shipmentId: string,
    dto?: Record<string, unknown>,
  ) {
    await this.assertOwnedShipment(user, shipmentId);
    return this.forms.completeForShipment(
      user.tenantId,
      shipmentId,
      { id: user.id },
      "customer",
      { ...(dto ?? {}), consent_accepted: true },
    );
  }

  async uploadDocumentForShipment(
    user: CurrentPortalUser,
    shipmentId: string,
    docKind: string,
    file: Express.Multer.File,
  ) {
    await this.assertOwnedShipment(user, shipmentId);
    return this.forms.attachDocumentForShipment(
      user.tenantId,
      shipmentId,
      docKind,
      file,
      { id: user.id },
      "customer",
    );
  }

  async getForQuotation(user: CurrentPortalUser, quotationId: string) {
    await this.assertOwnedQuotation(user, quotationId);
    return this.forms.getForQuotation(
      user.tenantId,
      quotationId,
      { id: user.id },
      "customer",
    );
  }

  async upsertForQuotation(
    user: CurrentPortalUser,
    quotationId: string,
    dto: Record<string, unknown>,
  ) {
    await this.assertOwnedQuotation(user, quotationId);
    return this.forms.upsertForQuotation(
      user.tenantId,
      quotationId,
      dto,
      { id: user.id },
      "customer",
    );
  }

  async completeForQuotation(
    user: CurrentPortalUser,
    quotationId: string,
    dto?: Record<string, unknown>,
  ) {
    await this.assertOwnedQuotation(user, quotationId);
    return this.forms.completeForQuotation(
      user.tenantId,
      quotationId,
      { id: user.id },
      "customer",
      { ...(dto ?? {}), consent_accepted: true },
    );
  }

  async uploadDocumentForQuotation(
    user: CurrentPortalUser,
    quotationId: string,
    docKind: string,
    file: Express.Multer.File,
  ) {
    await this.assertOwnedQuotation(user, quotationId);
    return this.forms.attachDocumentForQuotation(
      user.tenantId,
      quotationId,
      docKind,
      file,
      { id: user.id },
      "customer",
    );
  }

  private async assertOwnedShipment(
    user: CurrentPortalUser,
    shipmentId: string,
  ) {
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.shipment.findFirst({
        where: {
          id: shipmentId,
          tenant_id: user.tenantId,
          deleted_at: null,
          ...portalShipmentOwnershipWhere(user.partyId),
        },
        select: { id: true },
      }),
    );
    if (!row) throw new NotFoundException("Shipment not found.");
  }

  private async assertOwnedQuotation(
    user: CurrentPortalUser,
    quotationId: string,
  ) {
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.quotation.findFirst({
        where: {
          id: quotationId,
          tenant_id: user.tenantId,
          deleted_at: null,
          customer_id: user.partyId,
        },
        select: { id: true },
      }),
    );
    if (!row) {
      throw new ForbiddenException("Quotation not found or not owned.");
    }
  }
}
