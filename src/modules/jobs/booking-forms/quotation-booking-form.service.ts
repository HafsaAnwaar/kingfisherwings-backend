import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, OpsUploaderSide, Prisma, ServiceScope } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { StorageService } from "../../../shared/storage/storage.service";
import {
  MODE_BOOKING_DOC_KINDS,
  ModeBookingDocKind,
  modeDocAttachPatch,
} from "../../../common/constants/mandatory-booking-docs";
import { validateAirComplianceFormSubmit } from "./air-compliance-validate";
import {
  mergeBookingFormPayload,
} from "./booking-form-shared";
import {
  DEFAULT_SCOPE,
  ModeBookingFormService,
} from "./mode-booking-form.service";
import { UpsertAirComplianceBookingFormDto } from "./dto/air-compliance-booking-form.dto";
import { JobDocumentUploadService } from "../job-document-upload.service";
import { AirComplianceBookingFormService } from "../air-compliance-booking-form.service";

export type BookingFormAudience = "customer" | "staff";

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

type QuoteBookingRow = {
  id: string;
  status: string;
  job_type: JobType;
  converted_job_id: string | null;
  booking_form_payload: Prisma.JsonValue | null;
  booking_form_kind: string | null;
  booking_form_is_complete: boolean;
  booking_form_submitted_at: Date | null;
  booking_form_submitted_by: string | null;
};

/**
 * Quotation-scoped booking form: customer drafts/submits without creating a Job.
 * Materialized onto the job booking-form tables only when admin Generate Job runs.
 */
@Injectable()
export class QuotationBookingFormService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly modeForms: ModeBookingFormService,
    private readonly airForms: AirComplianceBookingFormService,
    private readonly documentUpload: JobDocumentUploadService,
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

  async get(
    tenantId: string,
    quotationId: string,
    audience: BookingFormAudience,
  ) {
    const quote = await this.loadQuote(tenantId, quotationId);
    const kind = this.kindForJobType(quote.job_type);

    if (audience === "staff" && !quote.booking_form_is_complete) {
      return {
        quotation_id: quotationId,
        job_id: null,
        job_type: quote.job_type,
        kind,
        submitted: false,
        form: null,
        message:
          "Waiting for the customer to submit the booking form. It will appear here after submit.",
        path_hints: {
          booking_form: `/quotations/${quotationId}/booking-form`,
        },
      };
    }

    const payload = this.asPayload(quote.booking_form_payload);
    const form = {
      ...this.emptyDefaults(kind),
      ...payload,
      is_complete: quote.booking_form_is_complete,
      completed_at: quote.booking_form_submitted_at,
      completed_by: quote.booking_form_submitted_by,
    };

    return {
      quotation_id: quotationId,
      job_id:
        quote.status === "CONVERTED" ? quote.converted_job_id : null,
      job_type: quote.job_type,
      kind,
      submitted: quote.booking_form_is_complete,
      form,
    };
  }

  async upsert(
    tenantId: string,
    quotationId: string,
    dto: Record<string, unknown>,
    actorId: string,
    audience: BookingFormAudience,
  ) {
    const quote = await this.loadQuote(tenantId, quotationId);
    this.assertEditable(quote, audience);
    const kind = this.kindForJobType(quote.job_type);
    const current = this.asPayload(quote.booking_form_payload);
    const { mark_complete: _mc, consent_accepted: _ca, ...fields } = dto;
    const merged = mergeBookingFormPayload(current, fields as Record<string, unknown>);

    if (!merged.service_scope && kind !== "air" && kind !== "warehouse") {
      const def = DEFAULT_SCOPE[kind as Exclude<FormKind, "air">];
      if (def) merged.service_scope = def;
    }

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.update({
        where: { id: quotationId },
        data: {
          booking_form_payload: merged as Prisma.InputJsonValue,
          booking_form_kind: kind,
          updated_by: actorId,
        },
      }),
    );

    return this.get(tenantId, quotationId, audience);
  }

  async complete(
    tenantId: string,
    quotationId: string,
    actorId: string,
    audience: BookingFormAudience,
    dto?: Record<string, unknown>,
  ) {
    const quote = await this.loadQuote(tenantId, quotationId);
    this.assertEditable(quote, audience);
    const kind = this.kindForJobType(quote.job_type);
    const current = this.asPayload(quote.booking_form_payload);
    const merged = mergeBookingFormPayload(
      current,
      (dto ?? {}) as Record<string, unknown>,
    );

    if (!merged.service_scope && kind !== "air" && kind !== "warehouse") {
      const def = DEFAULT_SCOPE[kind as Exclude<FormKind, "air">];
      if (def) merged.service_scope = def;
    }

    if (kind === "air") {
      validateAirComplianceFormSubmit(
        {
          ...(merged as unknown as UpsertAirComplianceBookingFormDto),
          consent_accepted: true,
        },
        merged as never,
      );
    } else {
      this.modeForms.assertPayloadComplete(kind, merged);
    }

    if (
      dto?.consent_accepted !== true &&
      merged.consent_accepted !== true &&
      !merged.consent_accepted_at
    ) {
      // Portal complete always implies consent; staff may omit.
      if (audience === "customer") {
        merged.consent_accepted = true;
        merged.consent_accepted_at = new Date().toISOString();
      } else if (!merged.consent_accepted_at) {
        throw new BadRequestException("Consent confirmation is required.");
      }
    } else {
      merged.consent_accepted = true;
      merged.consent_accepted_at =
        merged.consent_accepted_at ?? new Date().toISOString();
    }

    const now = new Date();
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.update({
        where: { id: quotationId },
        data: {
          booking_form_payload: merged as Prisma.InputJsonValue,
          booking_form_kind: kind,
          booking_form_is_complete: true,
          booking_form_submitted_at: now,
          booking_form_submitted_by: actorId,
          updated_by: actorId,
        },
      }),
    );

    return this.get(tenantId, quotationId, audience);
  }

  async attachDocument(
    tenantId: string,
    quotationId: string,
    docKind: string,
    file: Express.Multer.File,
    actorId: string,
    audience: BookingFormAudience,
  ) {
    const quote = await this.loadQuote(tenantId, quotationId);
    this.assertEditable(quote, audience);
    if (!MODE_BOOKING_DOC_KINDS.includes(docKind as ModeBookingDocKind)) {
      throw new BadRequestException(
        `Invalid document kind. Use: ${MODE_BOOKING_DOC_KINDS.join(", ")}`,
      );
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        "File is required (multipart field name: file).",
      );
    }

    const kind = this.kindForJobType(quote.job_type);
    const stored = await this.storage.saveBuffer(
      tenantId,
      file.buffer,
      file.originalname || `${docKind}.bin`,
      file.mimetype || "application/octet-stream",
    );

    const current = this.asPayload(quote.booking_form_payload);
    const patch = modeDocAttachPatch(
      docKind as ModeBookingDocKind,
      stored.s3Key,
    );
    const merged = mergeBookingFormPayload(current, {
      ...patch,
      [`doc_${docKind}_meta`]: {
        s3_key: stored.s3Key,
        file_url: stored.fileUrl,
        file_size: stored.fileSize,
        mime_type: stored.mimeType,
        file_name: file.originalname || `${docKind}.bin`,
      },
    });

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.update({
        where: { id: quotationId },
        data: {
          booking_form_payload: merged as Prisma.InputJsonValue,
          booking_form_kind: kind,
          updated_by: actorId,
        },
      }),
    );

    return {
      kind: docKind,
      s3_key: stored.s3Key,
      file_url: stored.fileUrl,
      quotation_id: quotationId,
      job_id: null,
      form: (await this.get(tenantId, quotationId, audience)).form,
    };
  }

  /**
   * Copy submitted quotation booking form onto the newly generated job.
   */
  async materializeOntoJob(
    tenantId: string,
    quotationId: string,
    jobId: string,
    actorId?: string,
  ) {
    const quote = await this.loadQuote(tenantId, quotationId);
    const payload = this.asPayload(quote.booking_form_payload);
    if (!Object.keys(payload).length) return null;

    const kind = this.kindForJobType(quote.job_type);
    const markComplete = quote.booking_form_is_complete;

    const who =
      actorId ?? quote.booking_form_submitted_by ?? undefined;

    try {
      if (kind === "air") {
        const airDto = {
          ...(payload as unknown as UpsertAirComplianceBookingFormDto),
          ...(markComplete ? { consent_accepted: true as const } : {}),
        };
        const form = await this.airForms.upsertDraft(
          tenantId,
          jobId,
          airDto,
          who ?? jobId,
        );
        if (markComplete) {
          try {
            await this.airForms.submitAsCustomer(
              tenantId,
              jobId,
              { ...airDto, consent_accepted: true },
              who ?? jobId,
            );
          } catch {
            /* already submitted on job */
          }
        }
        await this.mirrorDocsToJob(
          tenantId,
          jobId,
          payload,
          quote.job_type,
          who,
        );
        return form;
      }

      const modeDto = {
        ...payload,
        ...(markComplete
          ? { mark_complete: true, consent_accepted: true }
          : {}),
      } as never;
      const form = await this.modeForms.upsert(
        kind,
        tenantId,
        jobId,
        modeDto,
        who,
      );
      await this.mirrorDocsToJob(tenantId, jobId, payload, quote.job_type, who);
      return form;
    } catch {
      return null;
    }
  }

  /** Persist payload without audience gates (provisional-job sync). */
  async syncPayload(
    tenantId: string,
    quotationId: string,
    dto: Record<string, unknown>,
    actorId: string,
  ) {
    const quote = await this.loadQuote(tenantId, quotationId);
    if (quote.status === "CONVERTED") return;
    const kind = this.kindForJobType(quote.job_type);
    const current = this.asPayload(quote.booking_form_payload);
    const { mark_complete: _mc, consent_accepted: _ca, ...fields } = dto;
    const merged = mergeBookingFormPayload(
      current,
      fields as Record<string, unknown>,
    );
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.update({
        where: { id: quotationId },
        data: {
          booking_form_payload: merged as Prisma.InputJsonValue,
          booking_form_kind: kind,
          updated_by: actorId,
        },
      }),
    );
  }

  async isComplete(
    tenantId: string,
    quotationId: string,
  ): Promise<{ complete: boolean; formKind: string }> {
    const quote = await this.loadQuote(tenantId, quotationId);
    return {
      complete: quote.booking_form_is_complete,
      formKind: quote.booking_form_kind ?? this.kindForJobType(quote.job_type),
    };
  }

  private async mirrorDocsToJob(
    tenantId: string,
    jobId: string,
    payload: Record<string, unknown>,
    jobType: JobType,
    actorId?: string,
  ) {
    if (!actorId) return;
    const kinds: ModeBookingDocKind[] = [
      "commercial_invoice",
      "packing_list",
      "bill_of_lading",
      "licence",
      "uat_tax_certificate",
    ];
    for (const docKind of kinds) {
      const meta = payload[`doc_${docKind}_meta`] as
        | {
            s3_key?: string;
            file_url?: string;
            file_size?: number;
            mime_type?: string;
            file_name?: string;
          }
        | undefined;
      const keyFromPatch =
        docKind === "bill_of_lading"
          ? (payload.doc_bl_awb_copy_key as string | undefined) ||
            (payload.doc_bill_of_lading_key as string | undefined)
          : (payload[`doc_${docKind}_key`] as string | undefined);
      const s3Key = meta?.s3_key || keyFromPatch;
      if (!s3Key) continue;
      await this.documentUpload.mirrorBookingUpload(
        tenantId,
        jobId,
        docKind,
        {
          s3Key,
          fileUrl: meta?.file_url || s3Key,
          fileSize: meta?.file_size ?? 0,
          mimeType: meta?.mime_type || "application/octet-stream",
        },
        meta?.file_name || `${docKind}.bin`,
        { userId: actorId, side: OpsUploaderSide.CUSTOMER },
        jobType,
      );
    }
  }

  private emptyDefaults(kind: FormKind): Record<string, unknown> {
    if (kind === "air" || kind === "warehouse") {
      return { is_complete: false, parties: [] };
    }
    return {
      is_complete: false,
      parties: [],
      service_scope: DEFAULT_SCOPE[kind] as ServiceScope | null,
    };
  }

  private asPayload(value: Prisma.JsonValue | null): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }
    return { ...(value as Record<string, unknown>) };
  }

  private assertEditable(quote: QuoteBookingRow, audience: BookingFormAudience) {
    if (quote.status === "CONVERTED") {
      throw new BadRequestException(
        "Quotation is already converted. Edit the job booking form instead.",
      );
    }
    if (quote.status !== "APPROVED") {
      throw new BadRequestException(
        "Booking form is available after the quotation is APPROVED.",
      );
    }
    // Staff may edit after provisional job exists; customer drafts anytime while APPROVED.
    void audience;
  }

  private async loadQuote(
    tenantId: string,
    quotationId: string,
  ): Promise<QuoteBookingRow> {
    const quote = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({
        where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          status: true,
          job_type: true,
          converted_job_id: true,
          booking_form_payload: true,
          booking_form_kind: true,
          booking_form_is_complete: true,
          booking_form_submitted_at: true,
          booking_form_submitted_by: true,
        },
      }),
    );
    if (!quote) throw new NotFoundException("Quotation not found.");
    return quote as QuoteBookingRow;
  }
}
