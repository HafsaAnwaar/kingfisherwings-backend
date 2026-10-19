/**
 * Mandatory booking-form document kinds for all modes
 * (NVOCC, air compliance, sea FCL/LCL, land, road, courier, customs, warehouse).
 * On air, `bill_of_lading` means BL/AWB copy.
 */
export const MANDATORY_BOOKING_DOC_KINDS = [
  "commercial_invoice",
  "packing_list",
  "bill_of_lading",
  "licence",
  "uat_tax_certificate",
] as const;

export type MandatoryBookingDocKind =
  (typeof MANDATORY_BOOKING_DOC_KINDS)[number];

/** Optional compliance extras (not required to submit). */
export const OPTIONAL_COMPLIANCE_DOC_KINDS = [
  "correspondence",
  "cod_form",
] as const;

export type OptionalComplianceDocKind =
  (typeof OPTIONAL_COMPLIANCE_DOC_KINDS)[number];

/** All kinds accepted by portal compliance upload endpoints. */
export const COMPLIANCE_DOC_KINDS = [
  ...MANDATORY_BOOKING_DOC_KINDS,
  ...OPTIONAL_COMPLIANCE_DOC_KINDS,
] as const;

export type ComplianceDocKind = (typeof COMPLIANCE_DOC_KINDS)[number];

/** Mode-form upload kinds (same mandatory five; bill_of_lading maps to bl_awb_copy). */
export const MODE_BOOKING_DOC_KINDS = MANDATORY_BOOKING_DOC_KINDS;

export type ModeBookingDocKind = MandatoryBookingDocKind;

export type MandatoryDocPresence = {
  attach_commercial_invoice?: boolean | null;
  attach_packing_list?: boolean | null;
  /** Compliance / NVOCC / air */
  attach_bill_of_lading?: boolean | null;
  /** Mode forms use bl_awb_copy for the same mandatory slot */
  attach_bl_awb_copy?: boolean | null;
  attach_licence?: boolean | null;
  attach_uat_tax_certificate?: boolean | null;
  doc_commercial_invoice_key?: string | null;
  doc_packing_list_key?: string | null;
  doc_bill_of_lading_key?: string | null;
  doc_bl_awb_copy_key?: string | null;
  doc_licence_key?: string | null;
  doc_uat_tax_certificate_key?: string | null;
};

export function missingMandatoryBookingDocs(
  form: MandatoryDocPresence,
): string[] {
  const missing: string[] = [];
  const hasInvoice =
    !!form.attach_commercial_invoice && !!form.doc_commercial_invoice_key;
  const hasPacking =
    !!form.attach_packing_list && !!form.doc_packing_list_key;
  const hasBl =
    (!!form.attach_bill_of_lading && !!form.doc_bill_of_lading_key) ||
    (!!form.attach_bl_awb_copy && !!form.doc_bl_awb_copy_key);
  const hasLicence = !!form.attach_licence && !!form.doc_licence_key;
  const hasUat =
    !!form.attach_uat_tax_certificate && !!form.doc_uat_tax_certificate_key;

  if (!hasInvoice) missing.push("commercial_invoice");
  if (!hasPacking) missing.push("packing_list");
  if (!hasBl) missing.push("bill_of_lading");
  if (!hasLicence) missing.push("licence");
  if (!hasUat) missing.push("uat_tax_certificate");
  return missing;
}

export type BookingDocFileMeta = {
  kind: string;
  attached: boolean;
  missing: boolean;
  s3_key?: string | null;
  job_document_id?: string | null;
  file_url?: string | null;
  download_path?: string | null;
};

export type BookingDocsStatus = {
  required: string[];
  uploaded: string[];
  missing: string[];
  /** Per-kind downloadable file meta (join form keys + JobDocument). */
  files: BookingDocFileMeta[];
};

/** Map kind → form s3 key field. */
export function formDocKeyForKind(
  form: MandatoryDocPresence & Record<string, unknown>,
  kind: string,
): string | null {
  switch (kind) {
    case "commercial_invoice":
      return (form.doc_commercial_invoice_key as string) || null;
    case "packing_list":
      return (form.doc_packing_list_key as string) || null;
    case "bill_of_lading":
      return (
        (form.doc_bill_of_lading_key as string) ||
        (form.doc_bl_awb_copy_key as string) ||
        null
      );
    case "licence":
      return (form.doc_licence_key as string) || null;
    case "uat_tax_certificate":
      return (form.doc_uat_tax_certificate_key as string) || null;
    case "correspondence":
      return (form.doc_correspondence_key as string) || null;
    case "cod_form":
      return (form.doc_cod_form_key as string) || null;
    default:
      return null;
  }
}

/** Kinds that may appear on a compliance/mode form (mandatory + optional). */
export const ALL_BOOKING_DOC_KINDS_FOR_STATUS = [
  ...MANDATORY_BOOKING_DOC_KINDS,
  ...OPTIONAL_COMPLIANCE_DOC_KINDS,
] as const;

export function bookingDocsStatus(
  form: MandatoryDocPresence,
  opts?: {
    jobId?: string | null;
    jobDocuments?: Array<{
      id: string;
      booking_form_kind: string | null;
      file_url: string;
      s3_key: string | null;
    }>;
  },
): BookingDocsStatus {
  const missing = missingMandatoryBookingDocs(form);
  const uploaded = MANDATORY_BOOKING_DOC_KINDS.filter(
    (k) => !missing.includes(k),
  );
  const byKind = new Map(
    (opts?.jobDocuments ?? [])
      .filter((d) => d.booking_form_kind)
      .map((d) => [d.booking_form_kind as string, d]),
  );
  const jobId = opts?.jobId ?? null;
  const files: BookingDocFileMeta[] = ALL_BOOKING_DOC_KINDS_FOR_STATUS.map(
    (kind) => {
      const s3Key = formDocKeyForKind(form as never, kind);
      const jd = byKind.get(kind);
      const attached = !!(s3Key || jd);
      const isMandatory = (MANDATORY_BOOKING_DOC_KINDS as readonly string[]).includes(
        kind,
      );
      return {
        kind,
        attached,
        missing: isMandatory && missing.includes(kind),
        s3_key: jd?.s3_key ?? s3Key,
        job_document_id: jd?.id ?? null,
        file_url: jd?.file_url ?? null,
        download_path:
          jd && jobId
            ? `/jobs/${jobId}/documents/${jd.id}/download`
            : null,
      };
    },
  );
  return {
    required: [...MANDATORY_BOOKING_DOC_KINDS],
    uploaded: [...uploaded],
    missing,
    files,
  };
}

/** Form field pairs used when backfilling JobDocuments from stored keys. */
export function listAttachedFormDocs(
  form: Record<string, unknown>,
): Array<{ kind: string; s3Key: string }> {
  const pairs: Array<{ kind: string; field: string }> = [
    { kind: "commercial_invoice", field: "doc_commercial_invoice_key" },
    { kind: "packing_list", field: "doc_packing_list_key" },
    { kind: "bill_of_lading", field: "doc_bill_of_lading_key" },
    { kind: "bill_of_lading", field: "doc_bl_awb_copy_key" },
    { kind: "licence", field: "doc_licence_key" },
    { kind: "uat_tax_certificate", field: "doc_uat_tax_certificate_key" },
    { kind: "correspondence", field: "doc_correspondence_key" },
    { kind: "cod_form", field: "doc_cod_form_key" },
  ];
  const out: Array<{ kind: string; s3Key: string }> = [];
  const seen = new Set<string>();
  for (const { kind, field } of pairs) {
    const key = form[field];
    if (typeof key === "string" && key.trim() && !seen.has(kind)) {
      seen.add(kind);
      out.push({ kind, s3Key: key.trim() });
    }
  }
  return out;
}

/** Build prisma patch for a compliance-style form (uses bill_of_lading). */
export function complianceDocAttachPatch(
  kind: ComplianceDocKind,
  s3Key: string,
): Record<string, unknown> {
  switch (kind) {
    case "commercial_invoice":
      return {
        doc_commercial_invoice_key: s3Key,
        attach_commercial_invoice: true,
      };
    case "packing_list":
      return { doc_packing_list_key: s3Key, attach_packing_list: true };
    case "bill_of_lading":
      return { doc_bill_of_lading_key: s3Key, attach_bill_of_lading: true };
    case "licence":
      return { doc_licence_key: s3Key, attach_licence: true };
    case "uat_tax_certificate":
      return {
        doc_uat_tax_certificate_key: s3Key,
        attach_uat_tax_certificate: true,
      };
    case "correspondence":
      return { doc_correspondence_key: s3Key, attach_correspondence: true };
    case "cod_form":
      return { doc_cod_form_key: s3Key, attach_cod_form: true };
    default:
      return {};
  }
}

/** Build prisma patch for mode forms (bill_of_lading → bl_awb_copy). */
export function modeDocAttachPatch(
  kind: ModeBookingDocKind,
  s3Key: string,
): Record<string, unknown> {
  switch (kind) {
    case "commercial_invoice":
      return {
        doc_commercial_invoice_key: s3Key,
        attach_commercial_invoice: true,
      };
    case "packing_list":
      return { doc_packing_list_key: s3Key, attach_packing_list: true };
    case "bill_of_lading":
      return { doc_bl_awb_copy_key: s3Key, attach_bl_awb_copy: true };
    case "licence":
      return { doc_licence_key: s3Key, attach_licence: true };
    case "uat_tax_certificate":
      return {
        doc_uat_tax_certificate_key: s3Key,
        attach_uat_tax_certificate: true,
      };
    default:
      return {};
  }
}
