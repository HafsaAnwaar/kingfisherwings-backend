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
import {
  BookingFormAudience,
  QuotationBookingFormService,
} from "./quotation-booking-form.service";

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
 * Booking forms for Quotation / Shipment / Job.
 * Quotation forms are stored on the quotation until admin Generate Job;
 * no provisional job is created for booking-form access.
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
    private readonly quotationForms: QuotationBookingFormService,
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

  /**
   * Resolve an existing job for quotation (never creates a provisional job).
   * Prefer CONVERTED + converted_job_id, else shipment-linked job.
   */
  async ensureJobForQuotation(
    tenantId: string,
    quotationId: string,
    _actorId?: string,
  ): Promise<{ jobId: string; jobType: JobType } | null> {
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

    // Only use the real job after admin Generate Job (CONVERTED).
    // Do not fall through to provisional/shipment-linked jobs while APPROVED —
    // booking form lives on the quotation until then.
    if (quote.status === "CONVERTED" && quote.converted_job_id) {
      return { jobId: quote.converted_job_id, jobType: quote.job_type };
    }

    return null;
  }

  /**
   * Resolve job for shipment booking-form / doc upload.
   * Does not create a provisional job — use quotation form when no job yet.
   */
  async ensureJobForShipment(
    tenantId: string,
    shipmentId: string,
    _actorId?: string,
  ): Promise<
    | { jobId: string; jobType: JobType; quotationId?: string | null }
    | { jobId: null; jobType: JobType; quotationId: string }
  > {
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
      return {
        jobId: shipment.job_id,
        jobType: shipment.job_type,
        quotationId: shipment.quotation_id,
      };
    }

    if (shipment.quotation_id) {
      return {
        jobId: null,
        jobType: shipment.job_type,
        quotationId: shipment.quotation_id,
      };
    }

    throw new BadRequestException(
      "Shipment has no linked job or quotation. Use Generate Job first.",
    );
  }

  async getForQuotation(
    tenantId: string,
    quotationId: string,
    actor?: Actor,
    audience: BookingFormAudience = "staff",
  ) {
    const linked = await this.ensureJobForQuotation(
      tenantId,
      quotationId,
      actor?.id,
    );
    if (linked) {
      return this.getByJob(tenantId, linked.jobId, linked.jobType);
    }
    return this.quotationForms.get(tenantId, quotationId, audience);
  }

  async getForShipment(
    tenantId: string,
    shipmentId: string,
    actor?: Actor,
    audience: BookingFormAudience = "customer",
  ) {
    const resolved = await this.ensureJobForShipment(
      tenantId,
      shipmentId,
      actor?.id,
    );
    if (resolved.jobId) {
      return this.getByJob(tenantId, resolved.jobId, resolved.jobType);
    }
    if (!resolved.quotationId) {
      throw new BadRequestException(
        "Shipment has no linked quotation for booking form.",
      );
    }
    return this.quotationForms.get(
      tenantId,
      resolved.quotationId,
      audience,
    );
  }

  async upsertForQuotation(
    tenantId: string,
    quotationId: string,
    dto: Record<string, unknown>,
    actor: Actor,
    audience: BookingFormAudience = "staff",
  ) {
    const linked = await this.ensureJobForQuotation(
      tenantId,
      quotationId,
      actor.id,
    );
    if (linked) {
      return this.upsertByJob(tenantId, linked.jobId, linked.jobType, dto, actor);
    }
    return this.quotationForms.upsert(
      tenantId,
      quotationId,
      dto,
      actor.id,
      audience,
    );
  }

  async upsertForShipment(
    tenantId: string,
    shipmentId: string,
    dto: Record<string, unknown>,
    actor: Actor,
    audience: BookingFormAudience = "customer",
  ) {
    const resolved = await this.ensureJobForShipment(
      tenantId,
      shipmentId,
      actor.id,
    );
    if (resolved.jobId) {
      return this.upsertByJob(
        tenantId,
        resolved.jobId,
        resolved.jobType,
        dto,
        actor,
      );
    }
    if (!resolved.quotationId) {
      throw new BadRequestException(
        "Shipment has no linked quotation for booking form.",
      );
    }
    return this.quotationForms.upsert(
      tenantId,
      resolved.quotationId,
      dto,
      actor.id,
      audience,
    );
  }

  async completeForQuotation(
    tenantId: string,
    quotationId: string,
    actor: Actor,
    audience: BookingFormAudience = "staff",
    dto?: Record<string, unknown>,
  ) {
    const linked = await this.ensureJobForQuotation(
      tenantId,
      quotationId,
      actor.id,
    );
    if (linked) {
      return this.completeByJob(tenantId, linked.jobId, linked.jobType, actor);
    }
    return this.quotationForms.complete(
      tenantId,
      quotationId,
      actor.id,
      audience,
      dto,
    );
  }

  async completeForShipment(
    tenantId: string,
    shipmentId: string,
    actor: Actor,
    audience: BookingFormAudience = "customer",
    dto?: Record<string, unknown>,
  ) {
    const resolved = await this.ensureJobForShipment(
      tenantId,
      shipmentId,
      actor.id,
    );
    if (resolved.jobId) {
      return this.completeByJob(
        tenantId,
        resolved.jobId,
        resolved.jobType,
        actor,
      );
    }
    if (!resolved.quotationId) {
      throw new BadRequestException(
        "Shipment has no linked quotation for booking form.",
      );
    }
    return this.quotationForms.complete(
      tenantId,
      resolved.quotationId,
      actor.id,
      audience,
      dto,
    );
  }

  async attachDocumentForQuotation(
    tenantId: string,
    quotationId: string,
    docKind: string,
    file: Express.Multer.File,
    actor: Actor,
    audience: BookingFormAudience = "customer",
  ) {
    const linked = await this.ensureJobForQuotation(
      tenantId,
      quotationId,
      actor.id,
    );
    if (linked) {
      const formKind = this.kindForJobType(linked.jobType);
      if (formKind === "air") {
        throw new BadRequestException(
          "Use air compliance document upload for air jobs.",
        );
      }
      return this.modeForms.attachDocument(
        formKind,
        tenantId,
        linked.jobId,
        docKind,
        file,
        actor.id,
      );
    }
    return this.quotationForms.attachDocument(
      tenantId,
      quotationId,
      docKind,
      file,
      actor.id,
      audience,
    );
  }

  async attachDocumentForShipment(
    tenantId: string,
    shipmentId: string,
    docKind: string,
    file: Express.Multer.File,
    actor: Actor,
    audience: BookingFormAudience = "customer",
  ) {
    const resolved = await this.ensureJobForShipment(
      tenantId,
      shipmentId,
      actor.id,
    );
    if (resolved.jobId) {
      const formKind = this.kindForJobType(resolved.jobType);
      if (formKind === "air") {
        throw new BadRequestException(
          "Use air compliance document upload for air jobs.",
        );
      }
      return this.modeForms.attachDocument(
        formKind,
        tenantId,
        resolved.jobId,
        docKind,
        file,
        actor.id,
      );
    }
    if (!resolved.quotationId) {
      throw new BadRequestException(
        "Shipment has no linked quotation for booking form.",
      );
    }
    return this.quotationForms.attachDocument(
      tenantId,
      resolved.quotationId,
      docKind,
      file,
      actor.id,
      audience,
    );
  }

  private async getByJob(tenantId: string, jobId: string, jobType: JobType) {
    const kind = this.kindForJobType(jobType);
    if (kind === "air") {
      const form = await this.airForms.get(tenantId, jobId);
      return { job_id: jobId, job_type: jobType, kind, form, submitted: !!form };
    }
    const form = await this.modeForms.get(kind, tenantId, jobId);
    return {
      job_id: jobId,
      job_type: jobType,
      kind,
      form,
      submitted: !!(form as { is_complete?: boolean } | null)?.is_complete,
    };
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
