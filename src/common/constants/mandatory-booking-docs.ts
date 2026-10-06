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

export function bookingDocsStatus(form: MandatoryDocPresence) {
  const uploaded = MANDATORY_BOOKING_DOC_KINDS.filter(
    (k) => !missingMandatoryBookingDocs(form).includes(k),
  );
  return {
    required: [...MANDATORY_BOOKING_DOC_KINDS],
    uploaded,
    missing: missingMandatoryBookingDocs(form),
  };
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
