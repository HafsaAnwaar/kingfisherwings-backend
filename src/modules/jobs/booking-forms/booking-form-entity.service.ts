import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { JobType, Prisma, UserRole } from "@prisma/client";
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
import {
  normalizeBookingCustomFields,
  readBookingCustomFields,
  unwrapBookingFormWritePayload,
} from "./booking-form-shared";

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

const KIND_TO_MODE_PATH: Record<Exclude<FormKind, "air">, string> = {
  sea_fcl: "sea-fcl",
  sea_lcl: "sea-lcl",
  land: "land",
  road_freight: "road-freight",
  courier: "courier",
  customs_clearance: "customs-clearance",
  warehouse: "warehouse",
};

/**
 * Booking forms for Quotation / Shipment / Job.
 * Quotation access creates a *provisional* job (APPROVED stays until Generate Job)
 * so FE can upload via /jobs/:id/{mode}/booking-form/documents/:kind.
 * View Job / CONVERTED remains admin Generate Job only.
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

  modePathForJobType(jobType: JobType): string | null {
    const kind = this.kindForJobType(jobType);
    if (kind === "air") return "air";
    return KIND_TO_MODE_PATH[kind];
  }

  /**
   * Resolve or create provisional job for quotation booking-form / docs.
   * Does not set quotation status to CONVERTED.
   */
  async ensureJobForQuotation(
    tenantId: string,
    quotationId: string,
    actorId?: string,
  ): Promise<{ jobId: string; jobType: JobType; provisional: boolean }> {
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

    if (quote.status === "CONVERTED" && quote.converted_job_id) {
      return {
        jobId: quote.converted_job_id,
        jobType: quote.job_type,
        provisional: false,
      };
    }

    if (quote.converted_job_id) {
      return {
        jobId: quote.converted_job_id,
        jobType: quote.job_type,
        provisional: true,
      };
    }

    if (quote.status !== "APPROVED" && quote.status !== "CONVERTED") {
      throw new BadRequestException(
        "Booking form is available after the quotation is APPROVED.",
      );
    }

    const provisional = await this.quotations.ensureProvisionalJob(
      tenantId,
      quotationId,
      actorId,
    );
    return {
      jobId: provisional.jobId,
      jobType: quote.job_type,
      provisional: true,
    };
  }

  async ensureJobForShipment(
    tenantId: string,
    shipmentId: string,
    actorId?: string,
  ): Promise<{
    jobId: string;
    jobType: JobType;
    quotationId?: string | null;
    provisional: boolean;
  }> {
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
        provisional: false,
      };
    }

    if (shipment.quotation_id) {
      const linked = await this.ensureJobForQuotation(
        tenantId,
        shipment.quotation_id,
        actorId,
      );
      await this.shipments.attachToJob(
        tenantId,
        linked.jobId,
        shipmentId,
        actorId,
      );
      return {
        jobId: linked.jobId,
        jobType: shipment.job_type,
        quotationId: shipment.quotation_id,
        provisional: linked.provisional,
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

    // Materialize any quotation-scoped draft onto the provisional job once.
    await this.quotationForms.materializeOntoJob(
      tenantId,
      quotationId,
      linked.jobId,
      actor?.id,
    );

    const result = await this.getByJob(
      tenantId,
      linked.jobId,
      linked.jobType,
      linked.provisional,
    );

    if (audience === "staff" && !result.submitted) {
      return {
        ...result,
        quotation_id: quotationId,
        message:
          "Waiting for the customer to submit the booking form. Provisional job is ready for document uploads.",
      };
    }

    return { ...result, quotation_id: quotationId };
  }

  async getForShipment(
    tenantId: string,
    shipmentId: string,
    actor?: Actor,
    _audience: BookingFormAudience = "customer",
  ) {
    const resolved = await this.ensureJobForShipment(
      tenantId,
      shipmentId,
      actor?.id,
    );
    if (resolved.quotationId) {
      await this.quotationForms.materializeOntoJob(
        tenantId,
        resolved.quotationId,
        resolved.jobId,
        actor?.id,
      );
    }
    const result = await this.getByJob(
      tenantId,
      resolved.jobId,
      resolved.jobType,
      resolved.provisional,
    );
    const customFields = await this.resolveShipmentCustomFields(
      tenantId,
      shipmentId,
      resolved.jobId,
    );
    return { ...result, custom_fields: customFields };
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
    await this.quotationForms.syncPayload(
      tenantId,
      quotationId,
      dto,
      actor.id,
    );

    const result = await this.upsertByJob(
      tenantId,
      linked.jobId,
      linked.jobType,
      dto,
      actor,
      linked.provisional,
    );
    return { ...result, quotation_id: quotationId };
  }

  async upsertForShipment(
    tenantId: string,
    shipmentId: string,
    dto: Record<string, unknown>,
    actor: Actor,
    _audience: BookingFormAudience = "customer",
  ) {
    const resolved = await this.ensureJobForShipment(
      tenantId,
      shipmentId,
      actor.id,
    );
    // FE often PUTs the GET envelope ({ form, custom_fields, job_id, …}).
    const payload = unwrapBookingFormWritePayload(dto);
    const customFieldsInput =
      payload.custom_fields !== undefined
        ? payload.custom_fields
        : payload.fields !== undefined
          ? payload.fields
          : payload.booking_custom_fields;
    const {
      custom_fields: _cf,
      fields: _fields,
      booking_custom_fields: _bcf,
      ...rest
    } = payload;
    try {
      await this.persistCustomFields(
        tenantId,
        {
          shipmentId,
          jobId: resolved.jobId,
          customFields: customFieldsInput,
        },
        actor.id,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/booking_custom_fields|P2022|Unknown column|column .* does not exist/i.test(msg)) {
        throw new BadRequestException(
          "booking_custom_fields column missing — run prisma migrate deploy (ops_enhancements_batch).",
        );
      }
      throw err;
    }
    const result = await this.upsertByJob(
      tenantId,
      resolved.jobId,
      resolved.jobType,
      rest,
      actor,
      resolved.provisional,
    );
    const customFields = await this.resolveShipmentCustomFields(
      tenantId,
      shipmentId,
      resolved.jobId,
    );
    return { ...result, custom_fields: customFields };
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
    try {
      await this.quotationForms.complete(
        tenantId,
        quotationId,
        actor.id,
        "customer",
        { ...(dto ?? {}), consent_accepted: true },
      );
    } catch {
      /* job complete may succeed first; quotation flag set below if needed */
    }

    const kind = this.kindForJobType(linked.jobType);
    if (kind === "air") {
      const form = await this.airForms.submitAsCustomer(
        tenantId,
        linked.jobId,
        {
          ...((dto ?? {}) as UpsertAirComplianceBookingFormDto),
          consent_accepted: true,
        },
        actor.id,
      );
      return this.withJobMeta(
        {
          job_id: linked.jobId,
          job_type: linked.jobType,
          kind,
          form,
          submitted: true,
        },
        linked.provisional,
        quotationId,
      );
    }
    const form = await this.modeForms.complete(
      kind,
      tenantId,
      linked.jobId,
      actor.id,
    );
    return this.withJobMeta(
      {
        job_id: linked.jobId,
        job_type: linked.jobType,
        kind,
        form,
        submitted: true,
      },
      linked.provisional,
      quotationId,
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
    if (resolved.quotationId) {
      return this.completeForQuotation(
        tenantId,
        resolved.quotationId,
        actor,
        audience,
        dto,
      );
    }
    return this.completeByJob(
      tenantId,
      resolved.jobId,
      resolved.jobType,
      actor,
      resolved.provisional,
    );
  }

  async attachDocumentForQuotation(
    tenantId: string,
    quotationId: string,
    docKind: string,
    file: Express.Multer.File,
    actor: Actor,
    _audience: BookingFormAudience = "customer",
  ) {
    const linked = await this.ensureJobForQuotation(
      tenantId,
      quotationId,
      actor.id,
    );
    const formKind = this.kindForJobType(linked.jobType);
    if (formKind === "air") {
      throw new BadRequestException(
        "Use air compliance document upload for air jobs.",
      );
    }
    const uploaded = await this.modeForms.attachDocument(
      formKind,
      tenantId,
      linked.jobId,
      docKind,
      file,
      actor.id,
    );
    // Mirror keys onto quotation payload for Generate Job materialize.
    await this.quotationForms
      .attachDocument(
        tenantId,
        quotationId,
        docKind,
        file,
        actor.id,
        "customer",
      )
      .catch(() => undefined);

    return {
      ...uploaded,
      quotation_id: quotationId,
      job_id: linked.jobId,
      provisional_job_id: linked.provisional ? linked.jobId : null,
      mode: this.modePathForJobType(linked.jobType),
    };
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
    if (resolved.quotationId) {
      return this.attachDocumentForQuotation(
        tenantId,
        resolved.quotationId,
        docKind,
        file,
        actor,
        audience,
      );
    }
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

  private withJobMeta<T extends Record<string, unknown>>(
    result: T,
    provisional: boolean,
    quotationId?: string,
  ) {
    const jobId = result.job_id as string;
    const jobType = result.job_type as JobType;
    return {
      ...result,
      provisional_job_id: provisional ? jobId : null,
      mode: this.modePathForJobType(jobType),
      job_documents_upload: `/jobs/${jobId}/${this.modePathForJobType(jobType)}/booking-form/documents/{kind}`,
      ...(quotationId ? { quotation_id: quotationId } : {}),
    };
  }

  private async getByJob(
    tenantId: string,
    jobId: string,
    jobType: JobType,
    provisional = false,
  ) {
    const kind = this.kindForJobType(jobType);
    const customFields = await this.loadJobCustomFields(tenantId, jobId);
    if (kind === "air") {
      const form = await this.airForms.get(tenantId, jobId);
      return this.withJobMeta(
        {
          job_id: jobId,
          job_type: jobType,
          kind,
          form,
          custom_fields: customFields,
          submitted: !!(form as { is_complete?: boolean } | null)?.is_complete,
        },
        provisional,
      );
    }
    const form = await this.modeForms.get(kind, tenantId, jobId);
    return this.withJobMeta(
      {
        job_id: jobId,
        job_type: jobType,
        kind,
        form,
        custom_fields:
          (form as { custom_fields?: unknown })?.custom_fields ?? customFields,
        submitted: !!(form as { is_complete?: boolean } | null)?.is_complete,
      },
      provisional,
    );
  }

  private async upsertByJob(
    tenantId: string,
    jobId: string,
    jobType: JobType,
    dto: Record<string, unknown>,
    actor: Actor,
    provisional = false,
  ) {
    const payload = unwrapBookingFormWritePayload(dto);
    const { custom_fields, ...rest } = payload;
    await this.persistCustomFields(
      tenantId,
      { jobId, customFields: custom_fields },
      actor.id,
    );
    const kind = this.kindForJobType(jobType);
    if (kind === "air") {
      const form = await this.airForms.upsertDraft(
        tenantId,
        jobId,
        rest as UpsertAirComplianceBookingFormDto,
        actor.id,
      );
      return this.withJobMeta(
        {
          job_id: jobId,
          job_type: jobType,
          kind,
          form,
          custom_fields: await this.loadJobCustomFields(tenantId, jobId),
        },
        provisional,
      );
    }
    const form = await this.modeForms.upsert(
      kind,
      tenantId,
      jobId,
      rest as never,
      actor.id,
    );
    return this.withJobMeta(
      {
        job_id: jobId,
        job_type: jobType,
        kind,
        form,
        custom_fields:
          (form as { custom_fields?: unknown })?.custom_fields ??
          (await this.loadJobCustomFields(tenantId, jobId)),
      },
      provisional,
    );
  }

  private async loadJobCustomFields(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: { booking_custom_fields: true },
      }),
    );
    return readBookingCustomFields(job?.booking_custom_fields);
  }

  private async resolveShipmentCustomFields(
    tenantId: string,
    shipmentId: string,
    jobId: string,
  ) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
        select: {
          booking_custom_fields: true,
          job: { select: { booking_custom_fields: true } },
        },
      }),
    );
    if (row?.booking_custom_fields != null) {
      return readBookingCustomFields(row.booking_custom_fields);
    }
    if (row?.job?.booking_custom_fields != null) {
      return readBookingCustomFields(row.job.booking_custom_fields);
    }
    return this.loadJobCustomFields(tenantId, jobId);
  }

  private async persistCustomFields(
    tenantId: string,
    opts: {
      jobId: string;
      shipmentId?: string;
      customFields: unknown;
    },
    actorId?: string,
  ) {
    const normalized = normalizeBookingCustomFields(opts.customFields);
    if (normalized === null) return;
    const json = normalized as unknown as Prisma.InputJsonValue;
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.job.update({
        where: { id: opts.jobId },
        data: {
          booking_custom_fields: json,
          updated_by: actorId,
        },
      });
      if (opts.shipmentId) {
        await tx.shipment.update({
          where: { id: opts.shipmentId },
          data: {
            booking_custom_fields: json,
            updated_by: actorId,
          },
        });
      }
    });
  }

  private async completeByJob(
    tenantId: string,
    jobId: string,
    jobType: JobType,
    actor: Actor,
    provisional = false,
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
    return this.withJobMeta(
      {
        job_id: jobId,
        job_type: jobType,
        kind,
        form,
        submitted: true,
      },
      provisional,
    );
  }
}
