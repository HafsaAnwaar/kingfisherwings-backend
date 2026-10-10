import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { JobType, UserRole } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { QuotationsService } from "../../quotations/quotations.service";
import { ShipmentsService } from "../../shipments/shipments.service";
import { ModeBookingFormService } from "./mode-booking-form.service";
import { AirComplianceBookingFormService } from "../air-compliance-booking-form.service";
import {
  UpsertAirComplianceBookingFormDto,
} from "./dto/air-compliance-booking-form.dto";

type Actor = { id: string; role?: UserRole };

type FormKind =
  | "sea_fcl"
  | "sea_lcl"
  | "land"
  | "road_freight"
  | "courier"
  | "customs_clearance"
  | "warehouse"
  | "air";

const JOB_TYPE_TO_KIND: Partial<Record<JobType, FormKind>> = {
  SEA_FCL_EXPORT: "sea_fcl",
  SEA_FCL_IMPORT: "sea_fcl",
  SEA_LCL_EXPORT: "sea_lcl",
  SEA_LCL_IMPORT: "sea_lcl",
  LAND: "land",
  ROAD_FREIGHT: "road_freight",
  COURIER: "courier",
  CUSTOMS_CLEARANCE: "customs_clearance",
  WAREHOUSE: "warehouse",
  AIR_EXPORT: "air",
  AIR_IMPORT: "air",
};

/**
 * Job-scoped booking forms exposed on Quotation / Shipment / Job.
 * Resolves or creates a provisional Job, then delegates to mode/air form services.
 */
@Injectable()
export class BookingFormEntityService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => QuotationsService))
    private readonly quotations: QuotationsService,
    @Inject(forwardRef(() => ShipmentsService))
    private readonly shipments: ShipmentsService,
    private readonly modeForms: ModeBookingFormService,
    private readonly airForms: AirComplianceBookingFormService,
  ) {}

  kindForJobType(jobType: JobType): FormKind {
    const kind = JOB_TYPE_TO_KIND[jobType];
    if (!kind) {
      throw new BadRequestException(
        `No booking form for job type ${jobType}.`,
      );
    }
    return kind;
  }

  /** Resolve job for a quotation; create provisional job when APPROVED and missing. */
  async ensureJobForQuotation(
    tenantId: string,
    quotationId: string,
    actorId?: string,
  ): Promise<{ jobId: string; jobType: JobType }> {
    const quote = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({
        where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          job_type: true,
          converted_job_id: true,
          status: true,
        },
      }),
    );
    if (!quote) throw new NotFoundException("Quotation not found.");

    if (quote.converted_job_id) {
      return { jobId: quote.converted_job_id, jobType: quote.job_type };
    }

    const linked = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: {
          tenant_id: tenantId,
          quotation_id: quotationId,
          deleted_at: null,
          job_id: { not: null },
        },
        select: { job_id: true },
        orderBy: { created_at: "asc" },
      }),
    );
    if (linked?.job_id) {
      return { jobId: linked.job_id, jobType: quote.job_type };
    }

    const provisional = await this.quotations.ensureProvisionalJob(
      tenantId,
      quotationId,
      actorId,
    );
    return { jobId: provisional.jobId, jobType: quote.job_type };
  }

  /** Resolve job for a shipment; provisional via quote or DIRECT generate. */
  async ensureJobForShipment(
    tenantId: string,
    shipmentId: string,
    actorId?: string,
  ): Promise<{ jobId: string; jobType: JobType }> {
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          job_id: true,
          quotation_id: true,
          job_type: true,
        },
      }),
    );
    if (!shipment) throw new NotFoundException("Shipment not found.");

    if (shipment.job_id) {
      return { jobId: shipment.job_id, jobType: shipment.job_type };
    }

    if (shipment.quotation_id) {
      const provisional = await this.quotations.ensureProvisionalJob(
        tenantId,
        shipment.quotation_id,
        actorId,
      );
      await this.shipments.attachToJob(
        tenantId,
        provisional.jobId,
        shipmentId,
        actorId,
      );
      return { jobId: provisional.jobId, jobType: shipment.job_type };
    }

    const generated = await this.shipments.generateJob(
      tenantId,
      shipmentId,
      { mode: "DIRECT" },
      actorId,
    );
    return { jobId: generated.jobId, jobType: shipment.job_type };
  }

  async getForQuotation(tenantId: string, quotationId: string, actor?: Actor) {
    const { jobId, jobType } = await this.ensureJobForQuotation(
      tenantId,
      quotationId,
      actor?.id,
    );
    return this.getByJob(tenantId, jobId, jobType);
  }

  async getForShipment(tenantId: string, shipmentId: string, actor?: Actor) {
    const { jobId, jobType } = await this.ensureJobForShipment(
      tenantId,
      shipmentId,
      actor?.id,
    );
    return this.getByJob(tenantId, jobId, jobType);
  }

  async upsertForQuotation(
    tenantId: string,
    quotationId: string,
    dto: Record<string, unknown>,
    actor: Actor,
  ) {
    const { jobId, jobType } = await this.ensureJobForQuotation(
      tenantId,
      quotationId,
      actor.id,
    );
    return this.upsertByJob(tenantId, jobId, jobType, dto, actor);
  }

  async upsertForShipment(
    tenantId: string,
    shipmentId: string,
    dto: Record<string, unknown>,
    actor: Actor,
  ) {
    const { jobId, jobType } = await this.ensureJobForShipment(
      tenantId,
      shipmentId,
      actor.id,
    );
    return this.upsertByJob(tenantId, jobId, jobType, dto, actor);
  }

  async completeForQuotation(
    tenantId: string,
    quotationId: string,
    actor: Actor,
  ) {
    const { jobId, jobType } = await this.ensureJobForQuotation(
      tenantId,
      quotationId,
      actor.id,
    );
    return this.completeByJob(tenantId, jobId, jobType, actor);
  }

  async completeForShipment(
    tenantId: string,
    shipmentId: string,
    actor: Actor,
  ) {
    const { jobId, jobType } = await this.ensureJobForShipment(
      tenantId,
      shipmentId,
      actor.id,
    );
    return this.completeByJob(tenantId, jobId, jobType, actor);
  }

  private async getByJob(tenantId: string, jobId: string, jobType: JobType) {
    const kind = this.kindForJobType(jobType);
    if (kind === "air") {
      const form = await this.airForms.get(tenantId, jobId);
      return { job_id: jobId, job_type: jobType, kind, form };
    }
    const form = await this.modeForms.get(kind, tenantId, jobId);
    return { job_id: jobId, job_type: jobType, kind, form };
  }

  private async upsertByJob(
    tenantId: string,
    jobId: string,
    jobType: JobType,
    dto: Record<string, unknown>,
    actor: Actor,
  ) {
    const kind = this.kindForJobType(jobType);
    if (kind === "air") {
      const form = await this.airForms.upsertDraft(
        tenantId,
        jobId,
        dto as UpsertAirComplianceBookingFormDto,
        actor.id,
      );
      return { job_id: jobId, job_type: jobType, kind, form };
    }
    const form = await this.modeForms.upsert(
      kind,
      tenantId,
      jobId,
      dto as never,
      actor.id,
    );
    return { job_id: jobId, job_type: jobType, kind, form };
  }

  private async completeByJob(
    tenantId: string,
    jobId: string,
    jobType: JobType,
    actor: Actor,
  ) {
    const kind = this.kindForJobType(jobType);
    if (kind === "air") {
      throw new BadRequestException(
        "Complete air compliance via portal submit or PUT /jobs/:id/air/compliance-form with Admin override.",
      );
    }
    const form = await this.modeForms.complete(
      kind,
      tenantId,
      jobId,
      actor.id,
    );
    return { job_id: jobId, job_type: jobType, kind, form };
  }
}
