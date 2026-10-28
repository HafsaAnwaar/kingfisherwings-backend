import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { DocumentType, JobType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingFormEntityService } from "./booking-forms/booking-form-entity.service";
import { JobsService } from "./jobs.service";

type PartyRow = {
  party_kind?: string;
  full_name?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
};

const AIR_JOB_TYPES: JobType[] = [JobType.AIR_EXPORT, JobType.AIR_IMPORT];

type AwbDocKind = "HAWB" | "MAWB" | "AWB";

/**
 * AWB (HAWB/MAWB) draft preview/generate autofilled from air booking form + air_details.
 * Mirrors BlDraftFromBookingService for sea HBL.
 */
@Injectable()
export class AwbDraftFromBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingEntity: BookingFormEntityService,
    @Inject(forwardRef(() => JobsService))
    private readonly jobs: JobsService,
  ) {}

  async previewForJob(
    tenantId: string,
    jobId: string,
    kind: AwbDocKind = "HAWB",
  ) {
    const job = await this.assertAirJob(tenantId, jobId);
    const [form, air] = await Promise.all([
      this.loadAirBookingForm(tenantId, jobId),
      this.loadAirDetails(tenantId, jobId),
    ]);

    const parties: PartyRow[] = (form?.parties ?? []).map((p) => ({
      party_kind: p.party_kind,
      full_name: p.full_name,
      address: p.address,
      city: p.city,
      country: p.country,
    }));
    const byKind = (k: string) =>
      parties.find((p) => p.party_kind === k) ?? null;

    const shipper = byKind("SHIPPER");
    const consignee = byKind("CONSIGNEE");
    const notify = byKind("NOTIFY") ?? consignee;

    const documentLabel =
      kind === "MAWB"
        ? "MAWB_DRAFT"
        : kind === "AWB"
          ? "AWB_DRAFT"
          : "HAWB_DRAFT";

    const preview = {
      document: documentLabel,
      is_original: false,
      job_id: jobId,
      job_number: job.job_number,
      job_type: job.job_type,
      shipper: this.mapParty(shipper),
      consignee: this.mapParty(consignee),
      notify: this.mapParty(notify),
      commodity: form?.commodity ?? job.commodity,
      hs_code: job.hs_code,
      pieces: form?.pieces ?? job.pieces,
      gross_weight: form?.gross_weight_kg ?? job.gross_weight,
      chargeable_weight:
        form?.chargeable_weight_kg ?? job.chargeable_weight ?? null,
      volume_cbm: form?.volume_cbm ?? job.volume_cbm,
      marks_numbers: null as string | null,
      special_handling:
        form?.special_handling ?? air?.special_handling_notes ?? null,
      is_dg: !!(form?.is_dg ?? job.is_dg),
      flight_number: form?.flight_number ?? air?.flight_number ?? null,
      flight_date: form?.flight_date ?? air?.flight_date ?? null,
      arrival_flight_number:
        form?.arrival_flight_number ?? air?.arrival_flight_number ?? null,
      origin_airport_code: form?.origin_airport_code ?? null,
      dest_airport_code: form?.dest_airport_code ?? null,
      hawb_number: air?.hawb_number ?? null,
      mawb_number: air?.mawb_number ?? null,
      mawb_from_origin:
        form?.mawb_from_origin ?? air?.mawb_number_from_origin ?? null,
      awb_type: air?.awb_type ?? null,
      freight_type: air?.freight_type ?? null,
      delivery_address:
        form?.delivery_address ?? air?.delivery_address ?? null,
      customs_value: form?.customs_value ?? air?.customs_value ?? null,
      pallets: form?.pallets_json ?? null,
      air_details: air
        ? {
            hawb_number: air.hawb_number,
            mawb_number: air.mawb_number,
            flight_number: air.flight_number,
            flight_date: air.flight_date,
            arrival_flight_number: air.arrival_flight_number,
            origin_airport_id: air.origin_airport_id,
            dest_airport_id: air.dest_airport_id,
            awb_type: air.awb_type,
            freight_type: air.freight_type,
          }
        : null,
      booking_form_complete: !!form?.is_complete,
      path_hints: {
        generate_hawb: `/jobs/${jobId}/hawb-draft/generate`,
        generate_mawb: `/jobs/${jobId}/mawb-draft/generate`,
        generate_awb: `/jobs/${jobId}/hawb-draft/generate`,
        hawb_document: `/jobs/${jobId}/documents/hawb`,
        mawb_document: `/jobs/${jobId}/documents/mawb`,
        air_booking_form: `/jobs/${jobId}/air-booking-form`,
        compliance_form: `/jobs/${jobId}/air/compliance-form`,
        download_documents: `/jobs/${jobId}/documents`,
      },
    };

    return { success: true, data: preview };
  }

  async generateDraftForJob(
    tenantId: string,
    jobId: string,
    kind: "HAWB" | "MAWB",
    actorId?: string,
  ) {
    await this.assertAirJob(tenantId, jobId);
    const preview = await this.previewForJob(tenantId, jobId, kind);
    const documentType = kind as DocumentType;
    const generated = await this.jobs.generateDocument(
      tenantId,
      jobId,
      documentType,
      { is_original: false },
      actorId,
      { sync: true },
    );
    return {
      success: true,
      data: {
        preview: preview.data,
        document: generated,
        task_id: generated.task_id,
        document_id: generated.document_id,
        download_path: generated.download_path,
        download_hint:
          generated.download_path ?? `/jobs/${jobId}/documents`,
      },
      message: generated.document_id
        ? `${kind} draft generated from air booking form details.`
        : `${kind} draft generation finished; download may not be ready yet.`,
    };
  }

  async previewForShipment(
    tenantId: string,
    shipmentId: string,
    kind: AwbDocKind = "HAWB",
  ) {
    const jobId = await this.resolveShipmentJobId(tenantId, shipmentId);
    return this.previewForJob(tenantId, jobId, kind);
  }

  async generateDraftForShipment(
    tenantId: string,
    shipmentId: string,
    kind: "HAWB" | "MAWB",
    actorId?: string,
  ) {
    const jobId = await this.resolveShipmentJobId(
      tenantId,
      shipmentId,
      actorId,
    );
    return this.generateDraftForJob(tenantId, jobId, kind, actorId);
  }

  private async resolveShipmentJobId(
    tenantId: string,
    shipmentId: string,
    actorId?: string,
  ) {
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, job_id: true, quotation_id: true, job_type: true },
      }),
    );
    if (!shipment) throw new NotFoundException("Shipment not found.");
    if (
      shipment.job_type &&
      !AIR_JOB_TYPES.includes(shipment.job_type as JobType)
    ) {
      throw new BadRequestException(
        "AWB draft is only available for air shipments.",
      );
    }
    let jobId = shipment.job_id;
    if (!jobId && shipment.quotation_id) {
      const linked = await this.bookingEntity.ensureJobForQuotation(
        tenantId,
        shipment.quotation_id,
        actorId,
      );
      jobId = linked.jobId;
    }
    if (!jobId) {
      throw new NotFoundException("Shipment has no linked job for AWB draft.");
    }
    return jobId;
  }

  private async loadAirBookingForm(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.airBookingForm.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
        include: { parties: true },
      }),
    );
  }

  private async loadAirDetails(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.airJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId },
        select: {
          hawb_number: true,
          mawb_number: true,
          flight_number: true,
          flight_date: true,
          arrival_flight_number: true,
          origin_airport_id: true,
          dest_airport_id: true,
          awb_type: true,
          freight_type: true,
          special_handling_notes: true,
          delivery_address: true,
          customs_value: true,
          mawb_number_from_origin: true,
        },
      }),
    );
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

  private async assertAirJob(tenantId: string, jobId: string) {
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
          chargeable_weight: true,
          volume_cbm: true,
          is_dg: true,
          created_from_quote_id: true,
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    if (!AIR_JOB_TYPES.includes(job.job_type)) {
      throw new BadRequestException(
        "AWB draft is only available for AIR_EXPORT / AIR_IMPORT jobs.",
      );
    }
    return job;
  }
}
