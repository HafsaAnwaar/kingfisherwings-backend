import { DocumentType, JobType } from "@prisma/client";

/** Internal docs — never customer-visible by default (mirrors portal helper). */
const CUSTOMER_BLOCKED: DocumentType[] = [
  DocumentType.JOB_PNL,
  DocumentType.JOB_COSTING,
  DocumentType.JOB_CARD,
  DocumentType.FREIGHT_MANIFEST,
];

/** Default customer visibility for a document type (staff can override). */
export function defaultVisibleToCustomer(documentType: DocumentType): boolean {
  return !CUSTOMER_BLOCKED.includes(documentType);
}

/**
 * Map booking-form document kinds → DocumentType.
 * BL/AWB copy maps to HBL (sea) or HAWB (air) when job type known; else OTHER.
 */
export function bookingKindToDocumentType(
  kind: string,
  jobType?: JobType | null,
): DocumentType {
  switch (kind) {
    case "commercial_invoice":
      return DocumentType.COMMERCIAL_INVOICE;
    case "packing_list":
      return DocumentType.PACKING_LIST;
    case "bill_of_lading":
    case "bl_awb_copy":
      if (
        jobType === JobType.AIR_EXPORT ||
        jobType === JobType.AIR_IMPORT
      ) {
        return DocumentType.HAWB;
      }
      if (
        jobType === JobType.SEA_FCL_EXPORT ||
        jobType === JobType.SEA_FCL_IMPORT ||
        jobType === JobType.SEA_LCL_EXPORT ||
        jobType === JobType.SEA_LCL_IMPORT ||
        jobType === JobType.NVOCC_EXPORT ||
        jobType === JobType.NVOCC_IMPORT
      ) {
        return DocumentType.HBL;
      }
      return DocumentType.OTHER;
    case "licence":
    case "uat_tax_certificate":
    case "correspondence":
    case "cod_form":
    default:
      return DocumentType.OTHER;
  }
}

export function parseDocumentTypeParam(raw: string): DocumentType | null {
  const normalized = raw.trim().toUpperCase().replace(/-/g, "_");
  if ((Object.values(DocumentType) as string[]).includes(normalized)) {
    return normalized as DocumentType;
  }
  return null;
}
