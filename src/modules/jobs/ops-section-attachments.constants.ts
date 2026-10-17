import { DocumentType } from "@prisma/client";

export const OPS_SECTIONS = [
  "customs_status",
  "cfs_storage",
  "transhipment_link",
  "deposits",
  "free_days",
  "damage_reports",
  "part_deliveries",
  "pods",
  "payment_requests",
  "sub_jobs",
  "bills_of_lading",
  "stuffing_records",
] as const;

export type OpsSection = (typeof OPS_SECTIONS)[number];

export function isOpsSection(raw: string): raw is OpsSection {
  return (OPS_SECTIONS as readonly string[]).includes(raw);
}

export const OPS_SECTION_DOCUMENT_TYPE: Record<OpsSection, DocumentType> = {
  customs_status: DocumentType.CUSTOMS_ENTRY,
  cfs_storage: DocumentType.OTHER,
  transhipment_link: DocumentType.TRANSHIPMENT_CONFIRMATION,
  deposits: DocumentType.OTHER,
  free_days: DocumentType.OTHER,
  damage_reports: DocumentType.OTHER,
  part_deliveries: DocumentType.DELIVERY_NOTE,
  pods: DocumentType.PROOF_OF_DELIVERY,
  payment_requests: DocumentType.PROFORMA_INVOICE,
  sub_jobs: DocumentType.OTHER,
  bills_of_lading: DocumentType.HBL,
  stuffing_records: DocumentType.STUFFING_REPORT,
};

export const OPS_SECTION_VISIBILITY: Record<
  OpsSection,
  { customer: boolean; vendor: boolean }
> = {
  customs_status: { customer: true, vendor: false },
  cfs_storage: { customer: true, vendor: true },
  transhipment_link: { customer: true, vendor: true },
  deposits: { customer: true, vendor: true },
  free_days: { customer: true, vendor: true },
  damage_reports: { customer: true, vendor: true },
  part_deliveries: { customer: true, vendor: false },
  pods: { customer: true, vendor: true },
  payment_requests: { customer: true, vendor: true },
  sub_jobs: { customer: false, vendor: true },
  bills_of_lading: { customer: true, vendor: true },
  stuffing_records: { customer: true, vendor: true },
};

export function opsKind(section: OpsSection): string {
  return `ops:${section}`;
}
