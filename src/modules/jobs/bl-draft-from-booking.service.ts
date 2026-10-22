import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ModeBookingFormService } from "./booking-forms/mode-booking-form.service";
import { BookingFormEntityService } from "./booking-forms/booking-form-entity.service";
import { JobsService } from "./jobs.service";

type PartyRow = {
  party_kind?: string;
  full_name?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
};

/**
 * BL draft preview/generate autofilled from the job (or quotation) booking form.
 */
@Injectable()
export class BlDraftFromBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly modeForms: ModeBookingFormService,
    private readonly bookingEntity: BookingFormEntityService,
    @Inject(forwardRef(() => JobsService))
    private readonly jobs: JobsService,
  ) {}

  async previewForJob(tenantId: string, jobId: string) {
    const job = await this.assertJob(tenantId, jobId);
    const kind = this.bookingEntity.kindForJobType(job.job_type);
    let form: Record<string, unknown> | null = null;

    if (kind !== "air") {
      const row = await this.modeForms.get(kind, tenantId, jobId);
      form = (row as Record<string, unknown> | null) ?? null;
    }

    if (!form) {
      // Fall back to quotation payload via created_from_quote_id
      const quoteId = job.created_from_quote_id;
      if (quoteId) {
        const q = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.quotation.findFirst({
            where: { id: quoteId, tenant_id: tenantId, deleted_at: null },
            select: { booking_form_payload: true },
          }),
        );
        if (q?.booking_form_payload && typeof q.booking_form_payload === "object") {
          form = q.booking_form_payload as Record<string, unknown>;
        }
      }
    }

    const parties = (form?.parties as PartyRow[] | undefined) ?? [];
    const byKind = (k: string) =>
      parties.find((p) => p.party_kind === k) ?? null;

    const shipper = byKind("SHIPPER");
    const consignee = byKind("CONSIGNEE");
    const notify = byKind("NOTIFY") ?? consignee;

    const preview = {
      document: "HBL_DRAFT",
      is_original: false,
      job_id: jobId,
      job_number: job.job_number,
      job_type: job.job_type,
      shipper: this.mapParty(shipper),
      consignee: this.mapParty(consignee),
      notify: this.mapParty(notify),
      commodity: (form?.commodity as string) ?? job.commodity,
      hs_code: (form?.hs_code as string) ?? job.hs_code,
      pieces: (form?.pieces as number) ?? job.pieces,
      gross_weight:
        (form?.gross_weight_kg as number) ??
        (form?.gross_weight as number) ??
        job.gross_weight,
      volume_cbm: (form?.volume_cbm as number) ?? job.volume_cbm,
      marks_numbers: (form?.marks_numbers as string) ?? null,
      containers: form?.containers ?? form?.containers_json ?? null,
      service_scope: form?.service_scope ?? null,
      origin_door_address: form?.origin_door_address ?? null,
      dest_door_address: form?.dest_door_address ?? null,
      booking_form_complete: !!(form as { is_complete?: boolean } | null)
        ?.is_complete,
      path_hints: {
        generate_draft: `/jobs/${jobId}/bl-draft/generate`,
        hbl_document: `/jobs/${jobId}/documents/hbl`,
        booking_form:
          kind === "air"
            ? `/jobs/${jobId}/air/compliance-form`
            : `/jobs/${jobId}/${this.bookingEntity.modePathForJobType(job.job_type)}/booking-form`,
      },
    };

    return { success: true, data: preview };
  }

  async generateDraftForJob(
    tenantId: string,
    jobId: string,
    actorId?: string,
  ) {
    const preview = await this.previewForJob(tenantId, jobId);
    const generated = await this.jobs.generateDocument(
      tenantId,
      jobId,
      "HBL",
      { is_original: false },
      actorId,
    );
    return {
      success: true,
      data: {
        preview: preview.data,
        document: generated,
        task_id: generated.task_id,
        download_hint: `/jobs/${jobId}/documents`,
      },
      message: "HBL draft generated from booking form details.",
    };
  }

  async previewForShipment(tenantId: string, shipmentId: string) {
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, job_id: true, quotation_id: true },
      }),
    );
    if (!shipment) throw new NotFoundException("Shipment not found.");
    if (shipment.job_id) {
      return this.previewForJob(tenantId, shipment.job_id);
    }
    if (shipment.quotation_id) {
      const linked = await this.bookingEntity.ensureJobForQuotation(
        tenantId,
        shipment.quotation_id,
      );
      return this.previewForJob(tenantId, linked.jobId);
    }
    throw new NotFoundException("Shipment has no linked job for BL draft.");
  }

  async generateDraftForShipment(
    tenantId: string,
    shipmentId: string,
    actorId?: string,
  ) {
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, job_id: true, quotation_id: true },
      }),
    );
    if (!shipment) throw new NotFoundException("Shipment not found.");
    let jobId = shipment.job_id;
    if (!jobId && shipment.quotation_id) {
      const linked = await this.bookingEntity.ensureJobForQuotation(
        tenantId,
        shipment.quotation_id,
        actorId,
      );
      jobId = linked.jobId;
    }
    if (!jobId) throw new NotFoundException("No job linked for BL draft.");
    return this.generateDraftForJob(tenantId, jobId, actorId);
  }

  private mapParty(p: PartyRow | null) {
    if (!p) return null;
    return {
      name: p.full_name ?? null,
      address: p.address ?? null,
      city: p.city ?? null,
      country: p.country ?? null,
    };
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          job_number: true,
          job_type: true,
          commodity: true,
          hs_code: true,
          pieces: true,
          gross_weight: true,
          volume_cbm: true,
          created_from_quote_id: true,
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }
}
