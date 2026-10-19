import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OpsUploaderSide } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingFormEntityService } from "../jobs/booking-forms/booking-form-entity.service";
import { ModeBookingFormService } from "../jobs/booking-forms/mode-booking-form.service";
import { AirComplianceBookingFormService } from "../jobs/air-compliance-booking-form.service";
import { UpsertAirComplianceBookingFormDto } from "../jobs/booking-forms/dto/air-compliance-booking-form.dto";
import { PortalAirComplianceBookingService } from "./portal-air-compliance-booking.service";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { portalShipmentOwnershipWhere } from "./helpers/portal-ownership.helper";

/**
 * Customer portal booking forms for Quotation / Shipment (all modes).
 * Storage remains job-scoped via BookingFormEntityService provisional ensure.
 */
@Injectable()
export class PortalBookingFormService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly forms: BookingFormEntityService,
    private readonly airForms: AirComplianceBookingFormService,
    private readonly modeForms: ModeBookingFormService,
    private readonly airCompliancePortal: PortalAirComplianceBookingService,
  ) {}

  async getForShipment(user: CurrentPortalUser, shipmentId: string) {
    await this.assertOwnedShipment(user, shipmentId);
    return this.forms.getForShipment(user.tenantId, shipmentId, {
      id: user.id,
    });
  }

  async upsertForShipment(
    user: CurrentPortalUser,
    shipmentId: string,
    dto: Record<string, unknown>,
  ) {
    await this.assertOwnedShipment(user, shipmentId);
    return this.forms.upsertForShipment(user.tenantId, shipmentId, dto, {
      id: user.id,
    });
  }

  async completeForShipment(
    user: CurrentPortalUser,
    shipmentId: string,
    dto?: Record<string, unknown>,
  ) {
    await this.assertOwnedShipment(user, shipmentId);
    const resolved = await this.forms.ensureJobForShipment(
      user.tenantId,
      shipmentId,
      user.id,
    );
    const kind = this.forms.kindForJobType(resolved.jobType);
    if (kind === "air") {
      return {
        job_id: resolved.jobId,
        job_type: resolved.jobType,
        kind,
        form: await this.airForms.submitAsCustomer(
          user.tenantId,
          resolved.jobId,
          {
            ...(dto as UpsertAirComplianceBookingFormDto),
            consent_accepted: true,
          },
          user.id,
        ),
      };
    }
    return this.forms.completeForShipment(user.tenantId, shipmentId, {
      id: user.id,
    });
  }

  async uploadDocumentForShipment(
    user: CurrentPortalUser,
    shipmentId: string,
    docKind: string,
    file: Express.Multer.File,
  ) {
    await this.assertOwnedShipment(user, shipmentId);
    const resolved = await this.forms.ensureJobForShipment(
      user.tenantId,
      shipmentId,
      user.id,
    );
    const formKind = this.forms.kindForJobType(resolved.jobType);
    if (formKind === "air") {
      return this.airCompliancePortal.uploadDocument(
        user,
        resolved.jobId,
        docKind,
        file,
      );
    }
    return this.modeForms.attachDocument(
      formKind,
      user.tenantId,
      resolved.jobId,
      docKind,
      file,
      user.id,
      { side: OpsUploaderSide.CUSTOMER, partyId: user.partyId },
    );
  }

  async getForQuotation(user: CurrentPortalUser, quotationId: string) {
    await this.assertOwnedQuotation(user, quotationId);
    return this.forms.getForQuotation(user.tenantId, quotationId, {
      id: user.id,
    });
  }

  async upsertForQuotation(
    user: CurrentPortalUser,
    quotationId: string,
    dto: Record<string, unknown>,
  ) {
    await this.assertOwnedQuotation(user, quotationId);
    return this.forms.upsertForQuotation(user.tenantId, quotationId, dto, {
      id: user.id,
    });
  }

  async completeForQuotation(
    user: CurrentPortalUser,
    quotationId: string,
    dto?: Record<string, unknown>,
  ) {
    await this.assertOwnedQuotation(user, quotationId);
    const resolved = await this.forms.ensureJobForQuotation(
      user.tenantId,
      quotationId,
      user.id,
    );
    const kind = this.forms.kindForJobType(resolved.jobType);
    if (kind === "air") {
      return {
        job_id: resolved.jobId,
        job_type: resolved.jobType,
        kind,
        form: await this.airForms.submitAsCustomer(
          user.tenantId,
          resolved.jobId,
          {
            ...(dto as UpsertAirComplianceBookingFormDto),
            consent_accepted: true,
          },
          user.id,
        ),
      };
    }
    return this.forms.completeForQuotation(user.tenantId, quotationId, {
      id: user.id,
    });
  }

  async uploadDocumentForQuotation(
    user: CurrentPortalUser,
    quotationId: string,
    docKind: string,
    file: Express.Multer.File,
  ) {
    await this.assertOwnedQuotation(user, quotationId);
    const resolved = await this.forms.ensureJobForQuotation(
      user.tenantId,
      quotationId,
      user.id,
    );
    const formKind = this.forms.kindForJobType(resolved.jobType);
    if (formKind === "air") {
      return this.airCompliancePortal.uploadDocument(
        user,
        resolved.jobId,
        docKind,
        file,
      );
    }
    return this.modeForms.attachDocument(
      formKind,
      user.tenantId,
      resolved.jobId,
      docKind,
      file,
      user.id,
      { side: OpsUploaderSide.CUSTOMER, partyId: user.partyId },
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
