import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingFormEntityService } from "../jobs/booking-forms/booking-form-entity.service";
import { AirComplianceBookingFormService } from "../jobs/air-compliance-booking-form.service";
import { UpsertAirComplianceBookingFormDto } from "../jobs/booking-forms/dto/air-compliance-booking-form.dto";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";

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
          customer_id: user.partyId,
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
